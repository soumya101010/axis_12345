import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    tier: 'FREE' | 'PREMIUM';
    role?: 'student' | 'working_professional';
    aiUsageCount: number;
    createdAt: Date;
    lastLogin?: Date;
    loginCount: number;
    totalTimeSpent: number; // in seconds
    totalInteractions: number;
    lastActive?: Date;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    tier: { type: String, enum: ['FREE', 'PREMIUM'], default: 'FREE' },
    role: { type: String, enum: ['student', 'working_professional'] },
    aiUsageCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    totalInteractions: { type: Number, default: 0 },
    lastActive: { type: Date }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
