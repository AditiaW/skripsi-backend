import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 5);

// Seed Admin
const seedAdminUser = async () => {
    const hashedPasswordAdmin = await bcrypt.hash('aditia.winanda15072002@gmail.com', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'aditia.winanda15072002@gmail.com' },
        update: {},
        create: {
            name: 'aditia.winanda15072002@gmail.com',
            email: 'aditia.winanda15072002@gmail.com',
            isVerified: true,
            password: hashedPasswordAdmin,
            role: 'ADMIN',
        },
    });

    console.log('Seeding completed!', adminUser);
};

const seedUsers = async () => {
    for (let i = 0; i < 25; i++) {
        const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
        await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                isVerified: faker.datatype.boolean(),
                password: hashedPassword,
                role: faker.helpers.arrayElement(['ADMIN', 'USER']),
                fcmToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            },
        });
    }
    console.log("✅ Users seeded successfully!");
};

const seedCategories = async () => {
    for (let i = 0; i < 8; i++) {
        await prisma.category.create({
            data: { id: nanoid(), name: faker.commerce.department() },
        });
    }
    console.log("✅ Categories seeded successfully!");
};

const seedProducts = async () => {
    const categories = await prisma.category.findMany();

    for (let i = 0; i < 50; i++) {
        await prisma.product.create({
            data: {
                id: nanoid(),
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: parseInt(faker.commerce.price({ min: 500000, max: 5000000 })),
                quantity: faker.number.int({ min: 5, max: 50 }),
                image: faker.image.url(),
                categoryId: categories[i % categories.length].id,
            },
        });
    }
    console.log("✅ Products seeded successfully!");
};

const seedOrders = async () => {
    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();

    for (let i = 0; i < 30; i++) {
        await prisma.order.create({
            data: {
                id: faker.string.uuid(),
                userId: faker.helpers.arrayElement(users).id,
                shippingFirstName: faker.person.firstName(),
                shippingLastName: faker.person.lastName(),
                shippingEmail: faker.internet.email(),
                shippingAddress: faker.location.streetAddress(),
                shippingCity: faker.location.city(),
                shippingZip: faker.location.zipCode(),
                shippingPhone: faker.phone.number(),
                shippingNotes: faker.lorem.sentence(),
                totalAmount: faker.number.int({ min: 500000, max: 10000000 }),
                paymentStatus: faker.helpers.arrayElement(["PENDING", "PAID", "FAILED", "EXPIRED", "CANCELED"]),
                snapToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            },
        });
    }
    console.log("✅ Orders seeded successfully!");
};

const seedOrderItems = async () => {
    const orders = await prisma.order.findMany();
    const products = await prisma.product.findMany();

    for (let i = 0; i < 60; i++) {
        await prisma.orderItem.create({
            data: {
                id: nanoid(),
                orderId: faker.helpers.arrayElement(orders).id,
                productId: faker.helpers.arrayElement(products).id,
                quantity: faker.number.int({ min: 1, max: 5 }),
                price: faker.number.int({ min: 500000, max: 5000000 }),
            },
        });
    }
    console.log("✅ Order Items seeded successfully!");
};

const main = async () => {
    await seedAdminUser();
    await seedUsers();
    await seedCategories();
    await seedProducts();
    await seedOrders();
    await seedOrderItems();
    console.log("🚀 All data successfully seeded!");
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
