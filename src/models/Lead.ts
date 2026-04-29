import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'In Progress' | 'Closed' | 'Lost';
export type LeadPriority = 'High' | 'Medium' | 'Low';
export type LeadSource = 'Facebook Ads' | 'Walk-in' | 'Website' | 'Referral' | 'Other';

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  notes: string;
  source: LeadSource;
  assignedTo?: Types.ObjectId;
  followUpDate?: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

function computeScore(budget: number): { score: number; priority: LeadPriority } {
  if (budget > 20_000_000) return { score: 100, priority: 'High' };
  if (budget >= 10_000_000) return { score: 60, priority: 'Medium' };
  return { score: 20, priority: 'Low' };
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    propertyInterest: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Closed', 'Lost'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Low',
    },
    score: { type: Number, default: 20 },
    notes: { type: String, default: '' },
    source: {
      type: String,
      enum: ['Facebook Ads', 'Walk-in', 'Website', 'Referral', 'Other'],
      default: 'Other',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    followUpDate: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LeadSchema.pre('save', function (next) {
  if (this.isModified('budget') || this.isNew) {
    const { score, priority } = computeScore(this.budget);
    this.score = score;
    this.priority = priority;
  }
  next();
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
export default Lead;
