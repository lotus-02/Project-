require("dotenv").config();
const http = require("http");
const app = require("./app");
const prisma = require("./config/prisma");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("PostgreSQL connected successfully via Prisma");
    } catch (error) {
        console.warn("⚠️ Warning: PostgreSQL not reachable at", process.env.DATABASE_URL);
        console.warn("Backend API and Real-Time WebSocket server are active.");
    }

    const server = http.createServer(app);
    initSocket(server);
    console.log("Real-Time WebSocket engine initialized");

    server.listen(PORT, () => {
        console.log(`🚀 Secure Multi-Tenant Backend running on http://localhost:${PORT}`);
        console.log(`🩺 Health check available at http://localhost:${PORT}/api/v1/health`);
    });
};

startServer();