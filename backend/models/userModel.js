import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ['admin', 'producteur', 'client'], default: 'producteur' },
    createdAt: { type: Date, default: Date.now}
})

export default mongoose.model('User', userSchema);
