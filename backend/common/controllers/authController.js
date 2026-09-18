const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../../database/models/User");
const { sendVerificationEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate secure verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 5. Token expires after 24 hours
        const verificationExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        // 6. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "student",
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires
        });

        // 7. Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error("❌ Verification email failed:", emailError.message);

            // Remove the user if email could not be sent
            await User.findByIdAndDelete(user._id);

            return res.status(500).json({
                message: "Registration failed because verification email could not be sent"
            });
        }

        // 8. Success response
        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account."
        });

    } catch (error) {
        console.error("❌ Registration error:", error.message);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required"
            });
        }

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;

        await user.save();

        res.status(200).json({
            message: "Email verified successfully. You can now log in."
        });

    } catch (error) {
        console.error("❌ Email verification error:", error.message);

        res.status(500).json({
            message: "Server error during email verification"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        // 4. Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 5. Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        // 6. Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error.message);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};

const resetDriverPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required"
            });
        }

        const user = await User.findOne({
            email,
            role: "driver"
        });

        if (!user) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.json({
            message: "Driver password reset successfully"
        });

    } catch (error) {
        console.error("❌ Password reset error:", error.message);

        res.status(500).json({
            message: "Server error while resetting password"
        });
    }
};

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    resetDriverPassword
};
