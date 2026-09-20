const express = require("express");
const prisma = require("../config/prisma");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: { name: "asc" }
        });
        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
