import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const [
    totalLeads,
    statusDist,
    priorityDist,
    agents,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    User.find({ role: 'agent' }).select('_id name email').lean(),
  ]);

  const agentPerformance = await Promise.all(
    agents.map(async (agent) => {
      const [total, closed, inProgress] = await Promise.all([
        Lead.countDocuments({ assignedTo: agent._id }),
        Lead.countDocuments({ assignedTo: agent._id, status: 'Closed' }),
        Lead.countDocuments({ assignedTo: agent._id, status: 'In Progress' }),
      ]);
      return {
        agentId: String(agent._id),
        agentName: agent.name,
        agentEmail: agent.email,
        totalAssigned: total,
        closed,
        inProgress,
        conversionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
      };
    })
  );

  const now = new Date();
  const overdueCount = await Lead.countDocuments({
    followUpDate: { $lt: now, $ne: null },
    status: { $nin: ['Closed', 'Lost'] },
  });

  const staleDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const staleCount = await Lead.countDocuments({
    lastActivityAt: { $lt: staleDate },
    status: { $nin: ['Closed', 'Lost'] },
  });

  return NextResponse.json({
    totalLeads,
    statusDistribution: statusDist.map((s) => ({ status: s._id, count: s.count })),
    priorityDistribution: priorityDist.map((p) => ({ priority: p._id, count: p.count })),
    agentPerformance,
    overdueFollowUps: overdueCount,
    staleLeads: staleCount,
  });
}
