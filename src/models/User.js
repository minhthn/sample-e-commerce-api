import mongoose, { Schema } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minLength: [3, 'Name must be at least 3 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        validate: {
            validator: isEmail,
            message: 'Invalid email, please try again',
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide a passowrd'],
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: "Invalid role '{VALUE}",
        },
        default: 'user',
        trim: true,
    }
}, {
    timestamps: true,
});

// Note: the create() function fires save() hooks.
UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    } catch (err) {
        return next(err);
    }
});

UserSchema.methods.verifyPassword = async function (password) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

export default mongoose.model('User', UserSchema);
