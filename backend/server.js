const app = require('./app');
const prisma = require('./config/prisma');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // 1. Check Database Connection
        await prisma.$connect();
        console.log(' Database connected successfully (PostgreSQL)');

        // 2. Start Listening
        app.listen(PORT, () => {
            console.log(`
             Reality Check Backend Started
             Port: ${PORT}
             Uploads: http://localhost:${PORT}/uploads
              Prisma Studio: http://localhost:5555
            `);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

startServer();