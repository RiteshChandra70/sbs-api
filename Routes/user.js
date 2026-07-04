const express = require('express')
const User = require('../models/User')
const Router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// Signup route
Router.post("/signup", async (req, res) => {
    try {

        const { fullName, phone, email, password } = req.body;

        // Check required fields
        if (!fullName || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Convert email to lowercase
        const userEmail = email.toLowerCase().trim();

        // Check existing user
        const existingUser = await User.findOne({ email: userEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user
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
            data: {
                id: result._id,
                fullName: result.fullName,
                phone: result.phone,
                email: result.email
            }
        });

    } catch (err) {
        console.error(err);

        // Duplicate key error from MongoDB
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

module.exports = Router;


// login api
Router.post('/login',async(req,res)=>{
    try
    {
        const user = await User.find({email:req.body.email})
        // console.log(user)
        if(user.length == 0)
        {
            return res.status(500).json({
                error:'email not registered....'
            })
        }

        const isMatch = await bcrypt.compare(req.body.password,user[0].password)
        if(!isMatch)
        {
            return res.status(500).json({
                error:'invalid password'
            })
        }

        const appToken = await jwt.sign({
            userId:user[0]._id,
            fullName:user[0].fullName,
            email:user[0].email
        },
        (process.env.SEC_KEY),
        {
            expiresIn:'24h'
        }
    )
     
    res.status(200).json({
        token:appToken
    })




    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})



module.exports = Router