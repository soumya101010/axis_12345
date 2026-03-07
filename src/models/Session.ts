import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
    email: string;
    startTime: Date;
    endTime?: Date;
    duration: number; // in seconds
}

const SessionSchema: Schema = new Schema({
    email: { type: String, required: true, index: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }
});

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
export default Session;
