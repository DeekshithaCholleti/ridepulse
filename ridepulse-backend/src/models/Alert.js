const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		message: { type: String, required: true, trim: true },
		type: { type: String, enum: ['delay', 'route-change', 'cancellation', 'maintenance', 'general'], default: 'general' },
		affectedShuttle: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle', default: null },
		affectedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
		status: { type: String, enum: ['active', 'resolved'], default: 'active' },
		expiresAt: Date
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
