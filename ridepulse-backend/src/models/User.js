const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, minlength: 6, select: false },
		role: { type: String, enum: ['student', 'driver', 'admin'], default: 'student' },
		assignedShuttle: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle', default: null }
	},
	{ timestamps: true }
);

userSchema.pre('save', async function savePassword(next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
