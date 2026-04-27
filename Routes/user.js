const express = require('express')
const User = require('../models/User')
const Router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


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