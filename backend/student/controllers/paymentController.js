const Payment = require("../../database/models/Payment");

// Create a payment
const createPayment = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "A valid payment amount is required"
            });
        }

        const payment = await Payment.create({
            student: req.user.userId,
            amount,
            paymentStatus: "paid",
            transactionId: `TXN-${Date.now()}`,
            paymentDate: new Date()
        });

        res.status(201).json({
            message: "Payment recorded successfully",
            payment
        });

    } catch (error) {
        console.error("❌ Create payment error:", error.message);

        res.status(500).json({
            message: "Server error while creating payment"
        });
    }
};


// Get logged-in student's payments
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            student: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: payments.length,
            payments
        });

    } catch (error) {
        console.error("❌ Get payments error:", error.message);

        res.status(500).json({
            message: "Server error while fetching payments"
        });
    }
};


module.exports = {
    createPayment,
    getMyPayments
};
