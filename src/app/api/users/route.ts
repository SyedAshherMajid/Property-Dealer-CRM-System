import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  const filter = role ? { role } : {};
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();

  return NextResponse.json({ users });
}
