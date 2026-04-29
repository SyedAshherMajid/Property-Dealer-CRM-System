import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ActivityAction =
  | 'lead_created'
  | 'lead_updated'
  | 'lead_assigned'
  | 'lead_reassigned'
  | 'status_changed'
  | 'notes_updated'
  | 'followup_set'
  | 'lead_deleted';

export interface IActivityLog extends Document {
  lead: Types.ObjectId;
  performedBy: Types.ObjectId;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'lead_created',
        'lead_updated',
        'lead_assigned',
        'lead_reassigned',
        'status_changed',
        'notes_updated',
        'followup_set',
        'lead_deleted',
      ],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
