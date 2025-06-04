import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Seed User
    const hashedPassword = await bcrypt.hash('aditia.winanda15072002@gmail.com', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'aditia.winanda15072002@gmail.com' },
        update: {},
        create: {
            name: 'aditia.winanda15072002@gmail.com',
            email: 'aditia.winanda15072002@gmail.com',
            isVerified: true,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    // Seed Categories
    const pintuCategory = await prisma.category.create({
        data: {
            name: 'Pintu',
        },
    });

    const mejaCategory = await prisma.category.create({
        data: {
            name: 'Meja',
        },
    });

    // Seed Products
    await prisma.product.create({
        data: {
            name: 'Pintu Kayu Jati',
            description: 'Pintu berkualitas tinggi dari kayu jati solid.',
            price: 1500000,
            quantity: 20,
            image: 'https://smb-padiumkm-images-public-prod.oss-ap-southeast-5.aliyuncs.com/product/image/18012024/65796b7d14ba98193ba5b50a/65a8729ac02d012f692268da/5f5885fafa9b3886fc38a1bfc48e9d.jpg?x-oss-process=image/resize,m_pad,w_432,h_432/quality,Q_70',
            categoryId: pintuCategory.id,
        },
    });

    await prisma.product.create({
        data: {
            name: 'Meja Makan Minimalis',
            description: 'Meja makan dengan desain minimalis untuk ruang modern.',
            price: 2500000,
            quantity: 10,
            image: 'https://images.tokopedia.net/img/cache/700/VqbcmM/2024/3/20/b687696f-28c1-4740-9dc1-1d8ba5fa49bb.jpg',
            categoryId: mejaCategory.id,
        },
    });

    await prisma.product.create({
        data: {
            name: 'Pintu Geser Kaca',
            description: 'Pintu geser dengan kombinasi kayu dan kaca elegan.',
            price: 2000000,
            quantity: 15,
            image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//99/MTA-23059376/no_brand_pintu_kaca_aluminium_sliding_-_pintu_geser_aluminium_-_pintu_03_modern_minimalis_210_x_90_cm_full01_ofkcboiy.jpg',
            categoryId: pintuCategory.id,
        },
    });

    console.log('Seeding completed!', adminUser);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
