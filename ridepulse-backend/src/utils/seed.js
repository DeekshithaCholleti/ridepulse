require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Shuttle = require('../models/Shuttle');
const Route = require('../models/Route');
const Alert = require('../models/Alert');
const Location = require('../models/Location');

const seedData = async () => {
	try {
		const mongoUri = process.env.MONGODB_URI;
		if (!mongoUri) {
			throw new Error('MONGODB_URI is not set in environment variables');
		}

		console.log('Connecting to database...');
		await mongoose.connect(mongoUri);
		console.log('Connected to database.');

		console.log('Clearing existing database collections...');
		await User.deleteMany({});
		await Shuttle.deleteMany({});
		await Route.deleteMany({});
		await Alert.deleteMany({});
		await Location.deleteMany({});
		console.log('Database collections cleared.');

		console.log('Creating default users...');
		const admin = await User.create({
			name: 'Campus Admin',
			email: 'admin@ridepulse.com',
			password: 'password123',
			role: 'admin'
		});

		const driver1 = await User.create({
			name: 'John Doe',
			email: 'driver1@ridepulse.com',
			password: 'password123',
			role: 'driver'
		});

		const driver2 = await User.create({
			name: 'Jane Smith',
			email: 'driver2@ridepulse.com',
			password: 'password123',
			role: 'driver'
		});

		const driver3 = await User.create({
			name: 'Bob Johnson',
			email: 'driver3@ridepulse.com',
			password: 'password123',
			role: 'driver'
		});

		const student = await User.create({
			name: 'Alex Johnson',
			email: 'student@ridepulse.com',
			password: 'password123',
			role: 'student'
		});

		console.log('Users created successfully.');

		console.log('Creating default routes...');
		// coordinates set around Anurag University campus
		const routeA = await Route.create({
			routeName: 'Anurag Campus Shuttle - Route A',
			description: 'Connects all primary residential and academic zones in a loop.',
			stops: [
				{ stopName: 'Anurag Main Entrance (Gate 1)', latitude: 17.4190, longitude: 78.6550, order: 0 },
				{ stopName: 'Engineering & Pharmacy Block', latitude: 17.4210, longitude: 78.6570, order: 1 },
				{ stopName: 'Anurag Central Library & Admin', latitude: 17.4225, longitude: 78.6545, order: 2 },
				{ stopName: 'Anurag Hostel & Sports Complex', latitude: 17.4240, longitude: 78.6585, order: 3 }
			]
		});

		const routeB = await Route.create({
			routeName: 'Ghatkesar Station - Anurag Express',
			description: 'Express shuttle connecting Ghatkesar Railway Station and the Campus.',
			stops: [
				{ stopName: 'Ghatkesar Railway Station', latitude: 17.4420, longitude: 78.6850, order: 0 },
				{ stopName: 'Anurag Main Entrance (Gate 1)', latitude: 17.4190, longitude: 78.6550, order: 1 }
			]
		});

		const routeC = await Route.create({
			routeName: 'Uppal Metro - Anurag Connector',
			description: 'Direct shuttle connecting Uppal Metro Station and the Campus.',
			stops: [
				{ stopName: 'Uppal Metro Station', latitude: 17.4020, longitude: 78.5600, order: 0 },
				{ stopName: 'Anurag Main Entrance (Gate 1)', latitude: 17.4190, longitude: 78.6550, order: 1 }
			]
		});
		console.log('Routes created successfully.');

		console.log('Creating default shuttles...');
		const shuttle1 = await Shuttle.create({
			shuttleNumber: 'RP-101',
			driver: driver1._id,
			route: routeA._id,
			capacity: 40,
			status: 'active',
			crowdLevel: 'LOW',
			currentLocation: {
				latitude: 17.4195,
				longitude: 78.6555,
				speed: 0,
				updatedAt: new Date()
			}
		});

		const shuttle2 = await Shuttle.create({
			shuttleNumber: 'RP-102',
			driver: driver2._id,
			route: routeB._id,
			capacity: 25,
			status: 'active',
			crowdLevel: 'MEDIUM',
			currentLocation: {
				latitude: 17.4215,
				longitude: 78.6565,
				speed: 0,
				updatedAt: new Date()
			}
		});

		const shuttle3 = await Shuttle.create({
			shuttleNumber: 'RP-103',
			driver: driver3._id,
			route: routeC._id,
			capacity: 35,
			status: 'active',
			crowdLevel: 'HIGH',
			currentLocation: {
				latitude: 17.4230,
				longitude: 78.6580,
				speed: 0,
				updatedAt: new Date()
			}
		});
		console.log('Shuttles created successfully.');

		// Link drivers' accounts to their shuttles
		driver1.assignedShuttle = shuttle1._id;
		await driver1.save();
		driver2.assignedShuttle = shuttle2._id;
		await driver2.save();
		driver3.assignedShuttle = shuttle3._id;
		await driver3.save();
		console.log('Driver user profiles updated with shuttle assignments.');

		console.log('Creating default alerts...');
		await Alert.create({
			title: 'Route A Setup Delay',
			message: 'Shuttle RP-101 is delayed by 3 minutes due to Anurag Fest setup near the Pharmacy Block.',
			type: 'delay',
			affectedShuttle: shuttle1._id,
			affectedRoute: routeA._id,
			status: 'active'
		});

		await Alert.create({
			title: 'Route B Traffic',
			message: 'Uppal-Anurag Connector delayed 10 mins at Ghatkesar bypass traffic.',
			type: 'delay',
			affectedShuttle: shuttle2._id,
			affectedRoute: routeB._id,
			status: 'active'
		});
		console.log('Alerts created successfully.');

		console.log('Database seeding finished successfully!');
		mongoose.connection.close();
	} catch (error) {
		console.error('Error seeding database:', error);
		process.exit(1);
	}
};

seedData();
