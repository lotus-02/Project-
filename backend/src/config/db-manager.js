const net = require("net");
const path = require("path");
const fs = require("fs");

const isPortOpen = (port, host = "127.0.0.1") => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on("connect", () => {
            socket.destroy();
            resolve(true);
        });
        socket.on("timeout", () => {
            socket.destroy();
            resolve(false);
        });
        socket.on("error", () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host);
    });
};

let pgInstance = null;

const ensureDatabaseRunning = async () => {
    const port = 5432;
    const isRunning = await isPortOpen(port);

    if (isRunning) {
        console.log("PostgreSQL server already running on port", port);
        return;
    }

    console.log("Starting embedded local PostgreSQL server on port", port, "...");
    try {
        const { default: EmbeddedPostgres } = await import("embedded-postgres");
        const dataDir = path.resolve(__dirname, "../../.pgdata");

        pgInstance = new EmbeddedPostgres({
            databaseDir: dataDir,
            port,
            user: "postgres",
            password: "password",
            persistent: true
        });

        if (!fs.existsSync(dataDir) || fs.readdirSync(dataDir).length === 0) {
            console.log("Initializing new local database cluster...");
            await pgInstance.initialise();
        }

        await pgInstance.start();
        console.log("Embedded PostgreSQL started successfully on port", port);

        try {
            await pgInstance.createDatabase("project_management");
            console.log("Created database 'project_management'");
        } catch (dbErr) {
            // Database might already exist
        }
    } catch (err) {
        console.warn("Could not start embedded PostgreSQL:", err.message);
    }
};

module.exports = {
    ensureDatabaseRunning
};
