require("dotenv").config();
const http = require("http");
const { execSync } = require("child_process");
const app = require("./app");
const prisma = require("./config/prisma");
const { initSocket } = require("./socket");
const { ensureDatabaseRunning } = require("./config/db-manager");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await ensureDatabaseRunning();

        try {
            // Push schema tables to database if needed
            console.log("Synchronizing schema tables with PostgreSQL...");
            execSync("npx prisma db push", { stdio: "pipe" });
            console.log("Database schema synchronized successfully!");
        } catch (dbSyncErr) {
            console.warn("Schema sync notice:", dbSyncErr.message);
        }

        await prisma.$connect();
        console.log("PostgreSQL connected successfully via Prisma");

        // Auto-seed basic permissions if database is empty
        try {
            const count = await prisma.permission.count();
            if (count === 0) {
                console.log("Seeding default permissions...");
                const permissions = [
                    { name: "project:create", description: "Create projects" },
                    { name: "project:read", description: "View projects" },
                    { name: "project:update", description: "Update projects" },
                    { name: "project:delete", description: "Delete projects" },
                    { name: "task:create", description: "Create tasks" },
                    { name: "task:read", description: "View tasks" },
                    { name: "task:update", description: "Update tasks" },
                    { name: "task:delete", description: "Delete tasks" },
                    { name: "user:manage", description: "Manage organization users and roles" },
                    { name: "user:read", description: "View organization users" },
                    { name: "tenant:manage", description: "Manage organization settings" },
                    { name: "analytics:read", description: "View project and team analytics" }
                ];
                for (const p of permissions) {
                    await prisma.permission.create({ data: p });
                }
                console.log("Default permissions auto-seeded!");
            }
        } catch (seedErr) {
            console.warn("Permission seed notice:", seedErr.message);
        }

    } catch (error) {
        console.warn("⚠️ Warning: PostgreSQL initialization error:", error.message);
    }

    const server = http.createServer(app);
    initSocket(server);
    console.log("Real-Time WebSocket engine initialized");

    server.listen(PORT, () => {
        console.log(`🚀 Secure Multi-Tenant Backend running on http://localhost:${PORT}`);
        console.log(`🩺 Health check available at http://localhost:${PORT}/api/v1/health`);
    });

    const shutdown = async () => {
        try {
            server.close();
            await prisma.$disconnect();
        } catch (e) {}
    };

    process.once("SIGUSR2", async () => {
        await shutdown();
        process.kill(process.pid, "SIGUSR2");
    });
    process.on("SIGINT", async () => {
        await shutdown();
        process.exit(0);
    });
    process.on("SIGTERM", async () => {
        await shutdown();
        process.exit(0);
    });
};

startServer();