// controllers/reviewController.js
const db = require('../models');

// สร้างรีวิวใหม่
const createReview = async (req, res) => {
    try {
        const { review_description, rating, product_id, user_id } = req.body;

        // ตรวจสอบค่าของ rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // สร้างรีวิวใหม่ในฐานข้อมูล
        const newReview = await db.Review.create({
            review_description,
            rating,
            product_id,
            user_id
        });

        // ส่งกลับข้อมูลรีวิวใหม่
        res.status(201).json(newReview);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ดึงรีวิวทั้งหมด
const listReviews = async (req, res) => {
    try {
        const reviews = await db.Review.findAll({
            include: [
                {
                    model: db.Product,
                    attributes: ['product_name'],
                },
                {
                    model: db.User,
                    attributes: ['username'],
                }
            ]
        });

        res.status(200).json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// // ดึงรีวิวจาก ID
// const getReviewById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const review = await db.Review.findByPk(id, {
//             include: [
//                 {
//                     model: db.Product,
//                     attributes: ['product_name'],
//                 },
//                 {
//                     model: db.User,
//                     attributes: ['username'],
//                 }
//             ]
//         });

//         if (!review) {
//             return res.status(404).json({ message: 'Review not found' });
//         }

//         res.status(200).json(review);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server Error' });
//     }
// };

// อัพเดตรีวิว
// const updateReview = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { review_description, rating, product_id, user_id } = req.body;

//         // ค้นหารีวิวที่ต้องการอัพเดต
//         const review = await db.Review.findByPk(id);

//         if (!review) {
//             return res.status(404).json({ message: 'Review not found' });
//         }

//         // อัพเดตรีวิว
//         await review.update({
//             review_description,
//             rating,
//             product_id,
//             user_id
//         });

//         res.status(200).json({ message: 'Review updated successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server Error' });
//     }
// };

// ลบรีวิว
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        // ค้นหาและลบรีวิว
        const review = await db.Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.destroy();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReview,
    listReviews,
    // getReviewById,
    // updateReview,
    deleteReview
};
