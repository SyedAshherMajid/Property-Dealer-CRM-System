import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ashher:ashher_123@backend-learning.1bi32b0.mongodb.net/property-crm?appName=BackEnd-Learning';

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'agent' }, phone: String,
}, { timestamps: true });

const LeadSchema = new mongoose.Schema({
  name: String, email: String, phone: String, propertyInterest: String,
  budget: Number, status: { type: String, default: 'New' }, priority: String,
  score: Number, notes: String, source: String, assignedTo: mongoose.Schema.Types.ObjectId,
  followUpDate: Date, lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

const ActivityLogSchema = new mongoose.Schema({
  lead: mongoose.Schema.Types.ObjectId, performedBy: mongoose.Schema.Types.ObjectId,
  action: String, description: String, metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
  const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

  const adminPass = await bcrypt.hash('admin123', 12);
  const agentPass = await bcrypt.hash('agent123', 12);

  let admin = await User.findOne({ email: 'admin@crm.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin User', email: 'admin@crm.com', password: adminPass, role: 'admin', phone: '+923001234567' });
    console.log('Admin created');
  }

  let agent1 = await User.findOne({ email: 'agent@crm.com' });
  if (!agent1) {
    agent1 = await User.create({ name: 'Ali Raza', email: 'agent@crm.com', password: agentPass, role: 'agent', phone: '+923007654321' });
    console.log('Agent 1 created');
  }

  let agent2 = await User.findOne({ email: 'sara@crm.com' });
  if (!agent2) {
    agent2 = await User.create({ name: 'Sara Ahmed', email: 'sara@crm.com', password: agentPass, role: 'agent', phone: '+923009876543' });
    console.log('Agent 2 created');
  }

  const existingLeads = await Lead.countDocuments();
  if (existingLeads > 0) { console.log('Leads already exist, skipping...'); await mongoose.disconnect(); return; }

  const leads = [
    { name: 'Muhammad Imran', email: 'imran@gmail.com', phone: '03001234567', propertyInterest: '10 Marla House in DHA Phase 6 Lahore', budget: 35000000, status: 'New', priority: 'High', score: 100, source: 'Facebook Ads', notes: 'Interested in corner plot', assignedTo: agent1._id, lastActivityAt: new Date() },
    { name: 'Fatima Malik', email: 'fatima@yahoo.com', phone: '03021234567', propertyInterest: '5 Marla Apartment in Bahria Town Karachi', budget: 15000000, status: 'Contacted', priority: 'Medium', score: 60, source: 'Website', notes: 'Ready to buy within 3 months', assignedTo: agent1._id, followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), lastActivityAt: new Date() },
    { name: 'Ahmed Khan', email: 'ahmed.k@outlook.com', phone: '03121234567', propertyInterest: 'Commercial Plot in Blue Area Islamabad', budget: 50000000, status: 'In Progress', priority: 'High', score: 100, source: 'Referral', notes: 'Looking for 2000+ sqft commercial space', assignedTo: agent2._id, lastActivityAt: new Date() },
    { name: 'Zara Hassan', email: 'zara.h@gmail.com', phone: '03331234567', propertyInterest: '1 Kanal House in Gulberg Lahore', budget: 45000000, status: 'Closed', priority: 'High', score: 100, source: 'Walk-in', notes: 'Deal closed successfully', assignedTo: agent2._id, lastActivityAt: new Date() },
    { name: 'Usman Farooq', email: 'usman.f@gmail.com', phone: '03451234567', propertyInterest: '3 Marla House in Johar Town', budget: 8000000, status: 'New', priority: 'Low', score: 20, source: 'Facebook Ads', notes: 'First-time buyer', lastActivityAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { name: 'Ayesha Siddiqui', email: 'ayesha.s@gmail.com', phone: '03001111222', propertyInterest: '4 Marla Shop in Model Town Lahore', budget: 12000000, status: 'Contacted', priority: 'Medium', score: 60, source: 'Walk-in', notes: 'Has budget pre-approved from bank', assignedTo: agent1._id, followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: 'Bilal Sheikh', email: 'bilal.sh@yahoo.com', phone: '03218765432', propertyInterest: '7 Marla Double Storey in PWD Housing Society Islamabad', budget: 22000000, status: 'In Progress', priority: 'High', score: 100, source: 'Website', notes: 'Wants to move in within 6 months', assignedTo: agent2._id, lastActivityAt: new Date() },
    { name: 'Nadia Qureshi', email: 'nadia.q@gmail.com', phone: '03009988776', propertyInterest: 'Studio Apartment in Bahria Heights Islamabad', budget: 7500000, status: 'Lost', priority: 'Low', score: 20, source: 'Other', notes: 'Went with another dealer', lastActivityAt: new Date() },
  ];

  const createdLeads = await Lead.insertMany(leads);
  console.log(`${createdLeads.length} leads created`);

  const activityLogs = createdLeads.map((lead: { _id: mongoose.Types.ObjectId; name: string }) => ({
    lead: lead._id, performedBy: admin._id, action: 'lead_created',
    description: `Lead "${lead.name}" created via seeder`, metadata: {},
  }));
  await ActivityLog.insertMany(activityLogs);
  console.log('Activity logs created');

  console.log('\n✅ Seed complete!');
  console.log('Admin: admin@crm.com / admin123');
  console.log('Agent: agent@crm.com / agent123');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error('Seed error:', err); process.exit(1); });
