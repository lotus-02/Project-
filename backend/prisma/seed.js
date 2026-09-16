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

const createPermission = await prisma.permission.findUnique({
    where: {
        name: "project:create"
    }
});

for (const role of adminRoles) {
    await prisma.rolePermission.upsert({
        where: {
            roleId_permissionId: {
                roleId: role.id,
                permissionId: createPermission.id
            }
        },
        update: {},
        create: {
            roleId: role.id,
            permissionId: createPermission.id
        }
    });
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