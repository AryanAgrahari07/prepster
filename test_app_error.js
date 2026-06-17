const { AppError } = require('./backend/src/middleware/errorHandler');

const err = new AppError('test error', 404, 4004);
console.log('Message:', err.message);
console.log('Status:', err.statusCode);
