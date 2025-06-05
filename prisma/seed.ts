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

    const kursiCategory = await prisma.category.create({
        data: {
            name: 'Kursi',
        },
    });

    const lemariCategory = await prisma.category.create({
        data: {
            name: 'Lemari',
        },
    });

    const rakCategory = await prisma.category.create({
        data: {
            name: 'Rak',
        },
    });

    console.log("✅ Categories seeded successfully!");

    // Seed Products
    const seedProducts = async () => {
        const products = [
            { name: "Pintu Kayu Jati", description: "Pintu berkualitas tinggi dari kayu jati solid.", price: 1500000, quantity: 20, image: "https://smb-padiumkm-images-public-prod.oss-ap-southeast-5.aliyuncs.com/product/image/18012024/65796b7d14ba98193ba5b50a/65a8729ac02d012f692268da/5f5885fafa9b3886fc38a1bfc48e9d.jpg", categoryId: pintuCategory.id },
            { name: "Meja Makan Minimalis", description: "Meja makan dengan desain minimalis untuk ruang modern.", price: 2500000, quantity: 10, image: "https://images.tokopedia.net/img/cache/700/VqbcmM/2024/3/20/b687696f-28c1-4740-9dc1-1d8ba5fa49bb.jpg", categoryId: mejaCategory.id },
            { name: "Pintu Geser Kaca", description: "Pintu geser dengan kombinasi kayu dan kaca elegan.", price: 2000000, quantity: 15, image: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//99/MTA-23059376/no_brand_pintu_kaca_aluminium_sliding_-_pintu_geser_aluminium_-_pintu_03_modern_minimalis_210_x_90_cm_full01_ofkcboiy.jpg", categoryId: pintuCategory.id },
            { name: "Meja Kerja Modern", description: "Meja kerja minimalis dengan permukaan luas.", price: 1800000, quantity: 12, image: "https://images.tokopedia.net/img/cache/700/VqbcmM/2024/3/20/b687696f-28c1-4740-9dc1-1d8ba5fa49bb.jpg", categoryId: mejaCategory.id },
            { name: "Pintu Lipat Kayu", description: "Pintu lipat fleksibel dengan desain modern.", price: 2200000, quantity: 9, image: "https://smb-padiumkm-images-public-prod.oss-ap-southeast-5.aliyuncs.com/product/image/18012024/65796b7d14ba98193ba5b50a/65a8729ac02d012f692268da/5f5885fafa9b3886fc38a1bfc48e9d.jpg", categoryId: pintuCategory.id },
            { name: "Kursi Santai Rotan", description: "Kursi santai dari bahan rotan alami.", price: 1200000, quantity: 25, image: "https://images.tokopedia.net/img/cache/700/VqbcmM/2024/3/20/b687696f-28c1-4740-9dc1-1d8ba5fa49bb.jpg", categoryId: kursiCategory.id },
            { name: "Lemari Pakaian 2 Pintu", description: "Lemari pakaian dengan desain klasik 2 pintu.", price: 3500000, quantity: 7, image: "https://smb-padiumkm-images-public-prod.oss-ap-southeast-5.aliyuncs.com/product/image/18012024/65796b7d14ba98193ba5b50a/65a8729ac02d012f692268da/5f5885fafa9b3886fc38a1bfc48e9d.jpg", categoryId: lemariCategory.id },
            { name: "Rak Buku Minimalis", description: "Rak buku elegan dengan susunan vertikal.", price: 950000, quantity: 18, image: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//99/MTA-23059376/no_brand_pintu_kaca_aluminium_sliding_-_pintu_geser_aluminium_-_pintu_03_modern_minimalis_210_x_90_cm_full01_ofkcboiy.jpg", categoryId: rakCategory.id },
            { name: "Meja TV Elegan", description: "Meja TV dengan desain modern yang stylish.", price: 1500000, quantity: 14, image: "https://images.tokopedia.net/img/cache/700/VqbcmM/2024/3/20/b687696f-28c1-4740-9dc1-1d8ba5fa49bb.jpg", categoryId: mejaCategory.id },
            { name: "Kursi Tamu Kayu", description: "Kursi tamu dari kayu jati dengan dudukan nyaman.", price: 1750000, quantity: 20, image: "https://smb-padiumkm-images-public-prod.oss-ap-southeast-5.aliyuncs.com/product/image/18012024/65796b7d14ba98193ba5b50a/65a8729ac02d012f692268da/5f5885fafa9b3886fc38a1bfc48e9d.jpg", categoryId: kursiCategory.id }
        ];

        for (let i = 0; i < 15; i++) {
            products.push({
                name: `Produk Tambahan ${i + 1}`,
                description: "Produk tambahan untuk melengkapi katalog.",
                price: 1000000 + (i * 50000),
                quantity: 10 + i,
                image: "https://images.tokopedia.net/img/cache/700/VqbcmM/2024/3/20/b687696f-28c1-4740-9dc1-1d8ba5fa49bb.jpg",
                categoryId: mejaCategory.id
            });
        }

        for (const product of products) {
            await prisma.product.create({ data: product });
        }

        console.log("✅ Seed products created successfully!");
    };

    seedProducts();

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
