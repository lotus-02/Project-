const tenantContext = (req, res, next) => {
    if (!req.user || !req.user.tenantId) {
        return res.status(403).json({
            success: false,
            message: "Tenant context missing"
        });
    }

    req.tenantId = req.user.tenantId;

    next();
};

module.exports = {
    tenantContext
};