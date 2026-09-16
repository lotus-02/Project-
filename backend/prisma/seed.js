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
    {
        name: "project:create",
        description: "Create projects"
    },
    {
        name: "project:read",
        description: "View projects"
    },
    {
        name: "project:update",
        description: "Update projects"
    },
    {
        name: "project:delete",
        description: "Delete projects"
    }
];

const main = async () => {
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                name: permission.name
            },
            update: {
                description: permission.description
            },
            create: permission
        });
    }
     const adminRoles = await prisma.role.findMany({
    where: {
        name: "ADMIN"
    }
});
const projectPermissions = await prisma.permission.findMany({
    where: {
        name: {
            in: [
                "project:create",
                "project:read",
                "project:update",
                "project:delete"
            ]
        }
    }
});

for (const role of adminRoles) {
    for (const permission of projectPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: role.id,
                    permissionId: permission.id
                }
            },
            update: {},
            create: {
                roleId: role.id,
                permissionId: permission.id
            }
        });
    }
}
    console.log("Permissions and ADMIN assignments seeded successfully");
};

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });