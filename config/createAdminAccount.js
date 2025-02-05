const bcrypt = require('bcrypt');
const { User, Article, Product } = require('../models'); 

const createAdminAccounts = async () => {
    try {
        // กำหนดข้อมูล admin หลายบัญชีไว้ใน array
        const adminData = [
            {
                name: 'Admin1',
                email: 'admin1@example.com',
                password: 'adminpassword123'
            },
            {
                name: 'Admin2',
                email: 'admin2@example.com',
                password: 'adminpassword456',
                
            }
        ];

        // วนลูปสร้างบัญชี Admin ทีละตัว
        for (const admin of adminData) {
            // ตรวจสอบว่ามีบัญชีที่อีเมลนี้ในระบบหรือยัง
            const existingUser = await User.findOne({ where: { email: admin.email } });
            if (!existingUser) {
                // ถ้ายังไม่มี ให้ทำการเข้ารหัส password
                const hashedPassword = await bcrypt.hash(admin.password, 10);

                // สร้าง user พร้อมกำหนด role = 'admin'
                await User.create({
                    name: admin.name,
                    email: admin.email,
                    password: hashedPassword,
                    role: 'admin',
                    is_verified: true,
                });

                console.log(`สร้างบัญชี ${admin.email} (admin) สำเร็จ`);
            } else {
                console.log(`มีบัญชีอีเมล ${admin.email} อยู่แล้วในระบบ`);
            }
        }

        console.log('สร้างบัญชี Admin ครบทั้งหมดแล้ว');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างบัญชี Admin:', error);
    }
};
const createTenUsers = async () => {
    try {
        // เตรียมข้อมูล User 10 คน ตัวอย่างเป็นค่าคงที่
        // หากต้องการให้ dynamic (เช่น เกิดจากการสุ่ม) สามารถปรับแก้ได้
        const usersData = [];
        for (let i = 1; i <= 10; i++) {
            usersData.push({
                name: `User${i}`,
                email: `user${i}@example.com`,
                password: 'password1234', // กำหนดรหัสผ่านเริ่มต้น
                role: 'user',             // เปลี่ยนเป็น admin ได้ตามต้องการ
                is_verified: true,        // กำหนดสถานะยืนยัน
                profile_picture: `https://picsum.photos/id/6${i}/200/150`
                
            });
        }

        // วนลูปเช็คและสร้าง user ทีละตัว
        for (const userData of usersData) {
            // ตรวจสอบว่ามีบัญชีอีเมลนี้แล้วหรือยัง
            const existingUser = await User.findOne({
                where: { email: userData.email },
            });

            if (!existingUser) {
                // เข้ารหัสรหัสผ่าน
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                // สร้างบัญชีใหม่
                await User.create({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role,
                    is_verified: userData.is_verified,
                    profile_picture: userData.profile_picture
                    
                });

                console.log(`สร้างผู้ใช้ ${userData.email} สำเร็จ`);
            } else {
                console.log(`มีอีเมล ${userData.email} อยู่แล้วในระบบ`);
            }
        }

        console.log('สร้างบัญชี User ครบทั้งหมดแล้ว');
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการสร้างบัญชี User:', err);
    }
};

const createDummyArticles = async () => {
    try {
        const totalArticles = 10; // จำนวนบทความจำลองที่ต้องการสร้าง

        for (let i = 1; i <= totalArticles; i++) {
            // สุ่ม user_id ตั้งแต่ 1 ถึง 16
            const randomUserId = Math.floor(Math.random() * 10) + 1;

            // สร้าง payload ของบทความ
            const newArticle = {
                title: `Article Title ${i}`,
                category: `Category ${i}`,
                coverImage: `https://picsum.photos/id/1${i}/200/150`,   // id 10, 11, 12, ...
                contentImage: `https://picsum.photos/id/2${i}/200/150`, // ถ้าอยากให้ต่างกัน ก็เปลี่ยนเลขเป็น 2${i}
                content: 
                `Lorem ipsum dolor sit amet, consectetur adipiscing elit${i}. Fusce scelerisque viverra dui, at feugiat lacus blandit fermentum. Nulla facilisi. Cras porta massa nisi, ac tempus lacus aliquet nec. Pellentesque pellentesque egestas accumsan. Fusce ornare eu metus vitae fringilla. Nulla scelerisque ex eget accumsan vehicula. Etiam nec maximus erat. Sed quis nibh quis est fringilla dictum ut sit amet eros. Aenean commodo sodales lectus eget venenatis. Nullam aliquet in eros sit amet maximus. Nullam sit amet consectetur nisi. Ut eget tellus ut dui eleifend iaculis. Quisque nunc sem, blandit sit amet blandit a, gravida ac nunc. Maecenas sodales turpis felis, a pharetra elit sollicitudin ut. Cras eu finibus purus.

Donec euismod sodales semper. In ante nisl, molestie eget risus sed, porta hendrerit ante. Quisque a pellentesque ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut sit amet lacus enim. In in lectus at arcu semper cursus non vel ipsum. Suspendisse lorem dolor, faucibus pellentesque mollis at, euismod ac sem.

Sed vestibulum, enim suscipit tristique lobortis, ipsum orci vulputate ligula, vitae luctus orci sapien et sem. Nulla ornare, lacus eget hendrerit pulvinar, nunc nisl aliquam felis, ut aliquam dui lorem a mauris. Morbi scelerisque enim sem. Sed lacinia finibus libero, nec suscipit eros mollis ut. Fusce hendrerit erat vel mauris luctus, vitae vulputate odio aliquet. Vivamus tempor posuere velit a tincidunt. Vivamus eget ullamcorper nulla, in pulvinar ex. Fusce ac leo lorem. Phasellus condimentum tincidunt mauris eget porttitor. Maecenas et posuere est, nec congue velit. Suspendisse sit amet sodales urna. Pellentesque sollicitudin, justo sit amet volutpat pulvinar, sem nisl commodo nisl, sed aliquam felis ex nec sem. Pellentesque turpis orci, malesuada aliquam laoreet luctus, malesuada sed sapien. Phasellus imperdiet congue ex at interdum.`,
                user_id: randomUserId,
            };

            // ตรวจสอบก่อนว่ามีบทความที่ title ซ้ำอยู่แล้วหรือไม่
            const existingArticle = await Article.findOne({
                where: { title: newArticle.title },
            });

            if (existingArticle) {
                console.log(`บทความ "${newArticle.title}" มีอยู่แล้วในระบบ -> ข้ามการสร้าง`);
                continue; // ข้ามไปสร้างบทความถัดไป
            }

            // ถ้าไม่ซ้ำ ให้สร้างบทความใหม่
            await Article.create(newArticle);
            console.log(`สร้างบทความ "${newArticle.title}" สำเร็จ`);
        }

        console.log(`สร้างบทความตัวอย่าง (สูงสุด) ${totalArticles} รายการ เรียบร้อยแล้ว`);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างข้อมูล Article:', error);
    }
};

const createDummyProducts = async () => {
    try {
        const totalProducts = 10; // จำนวนผลิตภัณฑ์จำลองที่ต้องการสร้าง

        for (let i = 1; i <= totalProducts; i++) {
            // สร้างชื่อผลิตภัณฑ์ที่ไม่ซ้ำกัน
            const productName = `Product Name ${i}`;

            // ตรวจสอบว่ามีผลิตภัณฑ์ที่ชื่อซ้ำอยู่แล้วหรือไม่
            const existingProduct = await Product.findOne({ where: { product_name: productName } });

            if (existingProduct) {
                console.log(`ผลิตภัณฑ์ "${productName}" มีอยู่แล้วในระบบ -> ข้ามการสร้าง`);
                continue; // ข้ามการสร้างผลิตภัณฑ์ถัดไป
            }

            // สร้างข้อมูลผลิตภัณฑ์ใหม่
            const newProduct = {
                product_name: productName,
                short_description: `Short description for ${productName}`,
                detailed_description: `Detailed description for ${productName}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce scelerisque viverra dui, at feugiat lacus blandit fermentum.`,
                category: `Category ${((i - 1) % 5) + 1}`, // หมวดหมู่ 1-5
                main_image: `https://picsum.photos/id/7${i}/1000/1000`,   // URL ของภาพหลัก
                additional_image_1: `https://picsum.photos/id/8${i}/1000/1000`, // URL ของภาพเสริมที่ 1
                additional_image_2: `https://picsum.photos/id/9${i}/1000/1000`, // URL ของภาพเสริมที่ 2
            };

            // สร้างผลิตภัณฑ์ใหม่ในฐานข้อมูล
            await Product.create(newProduct);
            console.log(`สร้างผลิตภัณฑ์ "${productName}" สำเร็จ`);
        }

        console.log(`สร้างข้อมูลผลิตภัณฑ์ตัวอย่างทั้งหมด ${totalProducts} รายการ เรียบร้อยแล้ว`);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างข้อมูล Product:', error);
    }
};



module.exports = { createAdminAccounts, createTenUsers, createDummyArticles, createDummyProducts }
