import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[0-9]{8,15}$/, 'Please provide a valid phone number']
    },
    passwordHash: { 
        type: String, 
        required: [true, 'Password is required'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'merchant'],
            message: 'Role must be user, admin, or merchant'
        },
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending'],
        default: 'active'
    },
    passwordChangedAt: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    deviceTokens: [{
        token: String,
        lastUsed: Date,
        userAgent: String
    }]
}, { 
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.passwordHash;
            delete ret.loginAttempts;
            delete ret.lockUntil;
            return ret;
        }
    }
});

// Indexes for performance
// Note: phone index is automatically created by unique: true
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for JWT timing
    next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

export default mongoose.model('User', userSchema);
