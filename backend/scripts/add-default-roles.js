require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ROLES = [
  {
    name: 'MANAGER',
    description: 'Manage projects, tasks and view team',
    perms: ['project:create','project:read','project:update','task:create','task:read','task:update','task:delete','user:read','user:manage','analytics:read']
  },
  {
    name: 'MEMBER',
    description: 'Work on assigned tasks and view projects',
    perms: ['project:read','task:create','task:read','task:update','user:read','analytics:read']
  },
  {
    name: 'VIEWER',
    description: 'Read-only access to projects and tasks',
    perms: ['project:read','task:read','user:read','analytics:read']
  }
];

async function main() {
  const allPerms = await prisma.permission.findMany();
  const permMap = {};
  for (const p of allPerms) permMap[p.name] = p.id;

  const tenants = await prisma.tenant.findMany();
  console.log('Found', tenants.length, 'tenant(s)');

  for (const tenant of tenants) {
    console.log('Processing tenant:', tenant.name);
    for (const def of ROLES) {
      const existing = await prisma.role.findFirst({ where: { tenantId: tenant.id, name: def.name } });
      if (existing) {
        console.log(' -', def.name, 'already exists, skipping');
        continue;
      }
      const role = await prisma.role.create({
        data: { name: def.name, description: def.description, tenantId: tenant.id }
      });
      for (const permName of def.perms) {
        const permId = permMap[permName];
        if (permId) {
          await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permId } });
        }
      }
      console.log(' + Created role:', def.name, 'for tenant:', tenant.name);
    }
  }
  console.log('All done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
