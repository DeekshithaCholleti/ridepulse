const calculateDistance = (first, second) => {
	const earthRadiusKm = 6371;
	const latitudeDelta = ((second.latitude - first.latitude) * Math.PI) / 180;
	const longitudeDelta = ((second.longitude - first.longitude) * Math.PI) / 180;
	const latitudeOne = (first.latitude * Math.PI) / 180;
	const latitudeTwo = (second.latitude * Math.PI) / 180;
	const haversine = Math.sin(latitudeDelta / 2) ** 2
		+ Math.sin(longitudeDelta / 2) ** 2 * Math.cos(latitudeOne) * Math.cos(latitudeTwo);

	return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

module.exports = calculateDistance;
