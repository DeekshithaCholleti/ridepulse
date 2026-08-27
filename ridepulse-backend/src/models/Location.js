const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
	{
		shuttle: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle', required: true, index: true },
		latitude: { type: Number, required: true, min: -90, max: 90 },
		longitude: { type: Number, required: true, min: -180, max: 180 },
		speed: { type: Number, min: 0, default: 0 },
		recordedAt: { type: Date, default: Date.now, index: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);
