import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    address: String,
    role: { type: String, enum: ['admin', 'farmer', 'customer'], default: 'customer' },
    createdAt: { type: Date, default: Date.now}
})

const User = mongoose.model('User', userSchema);

export default User;