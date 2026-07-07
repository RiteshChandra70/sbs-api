const express = require("express");
const Router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// =======================
// SIGNUP API
// =======================

Router.post("/signup", async (req, res) => {
    try {

        const { fullName, phone, email, password } = req.body;

        // Validate Fields
        if (!fullName || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const userEmail = email.toLowerCase().trim();

        // Check Existing User
        const existingUser = await User.findOne({ email: userEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash Password
        const hashPassword = await bcrypt.hash(password, 10);

        // Save User
        const newUser = new User({
            fullName,
            phone,
            email: userEmail,
            password: hashPassword
        });

        const result = await newUser.save();

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: result._id,
                fullName: result.fullName,
                email: result.email,
                phone: result.phone
            }
        });

    } catch (err) {

        console.log(err);

        // MongoDB Duplicate Key Error
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});


// =======================
// LOGIN API
// =======================

Router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        // Email Not Found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email is not registered"
            });
        }

        // Password Compare
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        // JWT Token
        const token = jwt.sign(
            {
                userId: user._id,
                fullName: user.fullName,
                email: user.email
            },
            process.env.SEC_KEY,
            {
                expiresIn: "24h"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            fullName: user.fullName,
            // user: {
            //     id: user._id,
            //     fullName: user.fullName,
            //     email: user.email,
            //     phone: user.phone
            // }
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

});

module.exports = Router;