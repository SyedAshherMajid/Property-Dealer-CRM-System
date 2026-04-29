import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import User from '@/models/User';
import { sendLeadAssignmentEmail } from '@/lib/email';
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from '@/lib/rateLimiter';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const lead = await Lead.findById(id).populate('assignedTo', 'name email phone').lean();
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  if (
    session.user.role === 'agent' &&
    String((lead as { assignedTo?: { _id: unknown } }).assignedTo?._id) !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const activities = await ActivityLog.find({ lead: id })
    .populate('performedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ lead, activities });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = getRateLimitKey(req, session.user.id);
  const rl = checkRateLimit(key, session.user.role as 'admin' | 'agent');
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const { id } = await params;
  await connectDB();

  const lead = await Lead.findById(id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  if (
    session.user.role === 'agent' &&
    String(lead.assignedTo) !== session.user.id
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, phone, propertyInterest, budget, status, notes, assignedTo, followUpDate } = body;

  const prevStatus = lead.status;
  const prevAssignedTo = String(lead.assignedTo);

  if (name) lead.name = name.trim();
  if (email) lead.email = email.toLowerCase().trim();
  if (phone) lead.phone = phone.trim();
  if (propertyInterest) lead.propertyInterest = propertyInterest.trim();
  if (budget !== undefined) lead.budget = Number(budget);
  if (status) lead.status = status;
  if (notes !== undefined) lead.notes = notes;
  if (followUpDate !== undefined) lead.followUpDate = followUpDate ? new Date(followUpDate) : undefined;
  if (assignedTo !== undefined) lead.assignedTo = assignedTo || null;

  lead.lastActivityAt = new Date();
  await lead.save();

  const logs = [];

  if (status && status !== prevStatus) {
    logs.push({
      lead: lead._id,
      performedBy: session.user.id,
      action: 'status_changed',
      description: `Status changed from "${prevStatus}" to "${status}"`,
      metadata: { from: prevStatus, to: status },
    });
  }

  if (notes !== undefined) {
    logs.push({
      lead: lead._id,
      performedBy: session.user.id,
      action: 'notes_updated',
      description: `Notes updated by ${session.user.name}`,
    });
  }

  if (followUpDate !== undefined) {
    logs.push({
      lead: lead._id,
      performedBy: session.user.id,
      action: 'followup_set',
      description: `Follow-up date set to ${followUpDate ? new Date(followUpDate).toLocaleDateString() : 'removed'}`,
    });
  }

  if (assignedTo !== undefined && assignedTo && assignedTo !== prevAssignedTo) {
    const isReassign = prevAssignedTo !== 'null' && prevAssignedTo !== '';
    logs.push({
      lead: lead._id,
      performedBy: session.user.id,
      action: isReassign ? 'lead_reassigned' : 'lead_assigned',
      description: `Lead ${isReassign ? 're' : ''}assigned by ${session.user.name}`,
      metadata: { from: prevAssignedTo, to: assignedTo },
    });

    try {
      const agent = await User.findById(assignedTo);
      if (agent) {
        await sendLeadAssignmentEmail({
          agentName: agent.name,
          agentEmail: agent.email,
          leadName: lead.name,
          leadPhone: lead.phone,
          leadEmail: lead.email,
          propertyInterest: lead.propertyInterest,
          budget: lead.budget,
          priority: lead.priority,
        });
      }
    } catch (emailErr) {
      console.error('Assignment email error (non-fatal):', emailErr);
    }
  }

  if (logs.length > 0) {
    await ActivityLog.insertMany(logs);
  } else if (name || email || phone || propertyInterest || budget) {
    await ActivityLog.create({
      lead: lead._id,
      performedBy: session.user.id,
      action: 'lead_updated',
      description: `Lead details updated by ${session.user.name}`,
    });
  }

  const populated = await Lead.findById(id).populate('assignedTo', 'name email').lean();
  return NextResponse.json({ lead: populated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  await ActivityLog.create({
    lead: id,
    performedBy: session.user.id,
    action: 'lead_deleted',
    description: `Lead "${lead.name}" deleted by ${session.user.name}`,
  });

  return NextResponse.json({ message: 'Lead deleted successfully' });
}
