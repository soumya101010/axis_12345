import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInteraction extends Document {
    email: string;
    action: string;
    timestamp: Date;
    metadata: any;
}

const InteractionSchema: Schema = new Schema({
    email: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed, default: {} }
});

const Interaction: Model<IInteraction> = mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', InteractionSchema);
export default Interaction;
