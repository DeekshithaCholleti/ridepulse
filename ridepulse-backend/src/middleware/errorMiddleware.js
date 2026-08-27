const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

const errorHandler = (error, req, res, next) => {
	console.error(error);
	res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
};

module.exports = { notFound, errorHandler };
