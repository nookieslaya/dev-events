import { Schema, model, models, Document } from 'mongoose';

export interface IEventCreationLog extends Document {
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventCreationLogSchema = new Schema<IEventCreationLog>(
  {
    ip: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index to speed up recent lookups by IP
EventCreationLogSchema.index({ ip: 1, createdAt: -1 });

const EventCreationLog =
  models.EventCreationLog || model<IEventCreationLog>('EventCreationLog', EventCreationLogSchema);

export default EventCreationLog;
