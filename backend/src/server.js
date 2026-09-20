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

        const server = http.createServer(app);
        initSocket(server);
        console.log("Real-Time WebSocket engine initialized");

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server initialization failed:", error.message);
        process.exit(1);
    }
};

startServer();