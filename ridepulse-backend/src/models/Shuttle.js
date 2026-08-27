const mongoose = require('mongoose');

const shuttleSchema = new mongoose.Schema(
	{
		shuttleNumber: { type: String, required: true, unique: true, trim: true },
		driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
		route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
		currentLocation: {
			latitude: { type: Number, min: -90, max: 90 },
			longitude: { type: Number, min: -180, max: 180 },
			speed: { type: Number, min: 0 },
			updatedAt: Date
		},
		status: { type: String, enum: ['active', 'inactive', 'on-trip', 'maintenance'], default: 'inactive' },
		crowdLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
		capacity: { type: Number, required: true, min: 1 }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Shuttle', shuttleSchema);
