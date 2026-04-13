const express = require('express')
const User = require('../models/User')
const Router = express.Router()
const bcrypt = require('bcrypt')

// Signup route
Router.post('/signup',async(req, res) => {
    try{
        const data = await User.find({email:req.body.email})
        if(data.length>0){
            return res.status(500).json({
                message:"email already exist"
            })
        }
        const hash = await bcrypt.hash(req.body.password,10)
        const newUser = new User({
            fullName:req.body.fullName,
            phone:req.body.phone,
            email:req.body.email,
            password:hash
        })
        const result = await newUser.save()
        res.status(200).json({
            data:{
            fullName:result.fullName,
            email:result.email,
            phone:result.phone
        }
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            msg : "something is wrong"
        })
    }
})


module.exports = Router