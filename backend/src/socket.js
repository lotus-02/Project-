const { Server } = require("socket.io");
const { verifyAccessToken } = require("./utils/jwt");

let io = null;

const initSocket = (httpServer, allowedOrigins = ["http://localhost:3000", "http://localhost:5173"]) => {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("CORS policy restriction"));
                }
            },
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (!token) {
            return next(new Error("Authentication token required"));
        }

        try {
            const decoded = verifyAccessToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        const { tenantId, userId } = socket.user;
        if (tenantId) {
            socket.join(`tenant:${tenantId}`);
        }
        if (userId) {
            socket.join(`user:${userId}`);
        }

        socket.on("project:join", (projectId) => {
            socket.join(`project:${projectId}`);
        });

        socket.on("project:leave", (projectId) => {
            socket.leave(`project:${projectId}`);
        });

        socket.on("disconnect", () => {});
    });

    return io;
};

const getIO = () => io;

const emitToTenant = (tenantId, event, data) => {
    if (io) {
        io.to(`tenant:${tenantId}`).emit(event, data);
    }
};

const emitToProject = (projectId, event, data) => {
    if (io) {
        io.to(`project:${projectId}`).emit(event, data);
    }
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitToTenant,
    emitToProject,
    emitToUser
};
