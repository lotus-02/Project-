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

        // Clean up any zombie postgres processes if port 5432 is not accepting connections
        if (process.platform === "win32") {
            try {
                const { execSync } = require("child_process");
                execSync('taskkill /F /IM postgres.exe /T 2>nul || exit 0', { stdio: "ignore" });
            } catch (e) {}
        }

        // If port 5432 is not open but a stale postmaster.pid exists, clean it up
        const pidFile = path.join(dataDir, "postmaster.pid");
        if (fs.existsSync(pidFile)) {
            try {
                console.log("Cleaning up stale postmaster.pid lock file...");
                fs.unlinkSync(pidFile);
            } catch (pidErr) {
                console.warn("Notice cleaning postmaster.pid:", pidErr.message);
            }
        }

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

        // Verify port is open and accepting connections
        let ready = false;
        for (let i = 0; i < 15; i++) {
            if (await isPortOpen(port)) {
                ready = true;
                break;
            }
            await new Promise((res) => setTimeout(res, 400));
        }

        if (ready) {
            console.log("Embedded PostgreSQL started and ready on port", port);
        } else {
            console.warn("PostgreSQL started but port 5432 is still warming up...");
        }

        try {
            await pgInstance.createDatabase("project_management");
            console.log("Created database 'project_management'");
        } catch (dbErr) {
            // Database might already exist
        }
    } catch (err) {
        console.error("Could not start embedded PostgreSQL:", err.message);
        throw err;
    }
};

module.exports = {
    ensureDatabaseRunning
};
