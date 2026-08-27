const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
	{
		routeName: { type: String, required: true, trim: true },
		description: { type: String, trim: true, default: '' },
		stops: [
			{
				stopName: { type: String, required: true, trim: true },
				latitude: { type: Number, required: true, min: -90, max: 90 },
				longitude: { type: Number, required: true, min: -180, max: 180 },
				order: { type: Number, required: true, min: 0 }
			}
		]
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
