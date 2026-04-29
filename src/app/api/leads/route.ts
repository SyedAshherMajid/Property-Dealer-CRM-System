import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import { sendNewLeadEmail } from '@/lib/email';
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from '@/lib/rateLimiter';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = getRateLimitKey(req, session.user.id);
  const rl = checkRateLimit(key, session.user.role as 'admin' | 'agent');
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const search = searchParams.get('search');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (session.user.role === 'agent') {
    filter.assignedTo = session.user.id;
  }
  if (status && status !== 'all') filter.status = status;
  if (priority && priority !== 'all') filter.priority = priority;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { propertyInterest: { $regex: search, $options: 'i' } },
    ];
  }

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'name email')
    .sort({ score: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = getRateLimitKey(req, session.user.id);
  const rl = checkRateLimit(key, session.user.role as 'admin' | 'agent');
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await req.json();
  const { name, email, phone, propertyInterest, budget, source, notes } = body;

  if (!name || !email || !phone || !propertyInterest || !budget) {
    return NextResponse.json(
      { error: 'name, email, phone, propertyInterest and budget are required' },
      { status: 400 }
    );
  }

  if (isNaN(Number(budget)) || Number(budget) < 0) {
    return NextResponse.json({ error: 'budget must be a positive number' }, { status: 400 });
  }

  await connectDB();

  const lead = await Lead.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    propertyInterest: propertyInterest.trim(),
    budget: Number(budget),
    source: source || 'Other',
    notes: notes || '',
    lastActivityAt: new Date(),
  });

  await ActivityLog.create({
    lead: lead._id,
    performedBy: session.user.id,
    action: 'lead_created',
    description: `Lead created by ${session.user.name}`,
    metadata: { budget: lead.budget, priority: lead.priority },
  });

  try {
    await sendNewLeadEmail({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      budget: lead.budget,
      priority: lead.priority,
      source: lead.source,
      propertyInterest: lead.propertyInterest,
    });
  } catch (emailErr) {
    console.error('Email send error (non-fatal):', emailErr);
  }

  return NextResponse.json({ lead }, { status: 201 });
}
