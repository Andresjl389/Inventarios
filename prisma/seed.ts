import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const db = new PrismaClient({
    adapter,
});

async function main() {
    console.log("Initializing seed")

    const adminRol = await db.rol.upsert({
        where: { name: "admin" },
        update: {},
        create: {
            name: "admin",
            description: "Acceso completo al sistema",
            permissions: {
                products: ["read", 'write', 'delete'],
                sales: ["read", 'write', 'delete'],
                reports: ["read", 'write', 'delete'],
                users: ["read", 'write', 'delete'],
                inventory: ["read", 'write', 'delete'],
            },
        },
    })

    await db.rol.upsert({
        where: { name: 'vendedor' },
        update: {},
        create: {
            name: 'vendedor',
            description: 'Registra ventas y consulta productos',
            permissions: {
                products: ["read"],
                sales: ['read', 'write'],
                reports: ['read'],
                inventory: ['read']
            }
        }
    })

    await db.rol.upsert({
        where: { name: "bodeguero" },
        update: {},
        create: {
            name: "bodeguero",
            description: "Gestiona movimientos de inventario",
            permissions: {
                products: ["read", "write"],
                sales: ["read"],
                inventory: ["read", "write"],
            },
        },
    })

    console.log('Roles created')

    await db.user.upsert({
        where: { email: "admin@inventarios.local" },
        update: {},
        create: {
            name: 'admin',
            email: 'admin@inventarios.local',
            passwordHash: '$2b$10$KIXQJ0Z1F5z8G9Q1Z1Z1Z.1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z', // hashed password for 'admin'
            rolId: adminRol.id
        }
    })

    console.log('Admin user created')
}

main()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect();
        await pool.end();
    });