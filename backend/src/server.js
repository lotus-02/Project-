require("dotenv").config();
const express = require("express");
const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await prisma.$connect();

        console.log("PostgreSQL connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
        throw(error);
    }
};

startServer();