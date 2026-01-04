const IORedis = require('ioredis');
require('dotenv').config();

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, 
};

const redisConnection = new IORedis(redisConfig);

redisConnection.on('connect', () => {
    console.log('Connected to Redis (Queue System Ready)');
});

redisConnection.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});

module.exports = redisConnection;