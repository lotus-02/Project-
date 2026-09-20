require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
    adapter
});

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

const main = async () => {
    console.log("Seeding permissions...");
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission.name },
            update: { description: permission.description },
            create: permission
        });
    }

    const allPermissions = await prisma.permission.findMany();
    const adminRoles = await prisma.role.findMany({ where: { name: "ADMIN" } });

    for (const role of adminRoles) {
        for (const perm of allPermissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: perm.id
                    }
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: perm.id
                }
            });
        }
    }

    console.log("Seeding completed successfully.");
};

main()
    .catch((error) => {
        console.error("Seeding error:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });