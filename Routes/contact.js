require('dotenv').config();
const express = require('express')
const Router = express.Router()
const Contact = require('../models/Contact')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})


// add contact

// Router.post('/add-contact',(req,res)=>{
//     const newContact = new Contact({
//         fullName:req.body.name,
//         email:req.body.person_email,
//         phone:req.body.person_phone,
//         address:req.body.add
//     })

//     newContact.save()
//     .then((newData)=>{
//         console.log('data saved')
//         res.status(200).json({
//            result:newData
//         })
//     })
//     .catch((err)=>{
//         console.log(err)
//         res.status(500).json({
//             error:err
//         })
//     })
// })


Router.post('/add-contact',async(req,res)=>{
    try {
        
        // console.log(req.headers.authorization.split(" ")[1])
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        // console.log(tokenData)

        const uploadedResult = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
        //console.log(uploadedResult)

        const newContact = new Contact({
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            gender:req.body.gender,
            userId:tokenData.userId,
            imageId:uploadedResult.public_id,
            imageUrl:uploadedResult.secure_url
        })
        
        const newData = await newContact.save()
        res.status(200).json({
            result:newData
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

// get all contact
Router.get('/all-contact',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        const allContact = await Contact.find({userId:tokenData.userId}).select("_id fullName email phone address gender userId imageUrl").populate('userId', 'fullname email')
        res.status(200).json({
            contacts:allContact
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


// get contact by id
Router.get('/contactById/:id',async(req,res)=>{
    try
    {
        // console.log(req.params.id)
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        const id = req.params.id
        // const data = await Contact.findById(id).select("_id fullName email phone address gender userId")
        const data = await Contact.find({_id:req.params.id,userId:tokenData.userId})
        return res.status(200).json({
            contact:data.length>0 ? data[0] : {}
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

// get contact by gender
Router.get('/gender/:g',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        const contact = await Contact.find({gender:req.params.g,userId:tokenData.userId})
        res.status(200).json({
            contact:contact
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

// delete api 
Router.delete('/:id',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)

        const contact = await Contact.findById(req.params.id)
        if(contact.userId != tokenData.userId)
        {
            return res.status(500).json({
                error : 'Invalid User'
            })
        }

        await cloudinary.uploader.destroy(contact.imageId)
        await Contact.deleteOne({_id:req.params.id,userId:tokenData.userId})
        res.status(200).json({
            msg:'data deleted'
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

// delete many data
Router.delete('/byGender/:gender',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)

        await Contact.deleteMany({gender:req.params.gender,userId:tokenData.userId})
        const contacts = await Contact.find({userId : tokenData.userId, gender : req.params.gender})
        contacts.forEach(async (contact) =>{
            await cloudinary.uploader.destroy(contact.imageId)
        })
        const result = await Contact.deleteMany({gender:req.params.gender,userId:tokenData.userId})
        res.status(200).json({
            msg:'all contact of this gender deleted....'
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


// update contact
// Router.put('/update/:id',async(req,res)=>{
//     try
//     {   
//         const token = req.headers.authorization.split(" ")[1]
//         const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        
//         const contact = await Contact.findById(req.params.id)
//         if (tokenData.userId != contact.userId)
//         {
//             return res.status(400).json({
//                 msg: 'you are not allowed to update this data'
//             })
//         }
        
//         const newData = {
//             fullName:req.body.fullName,
//             email:req.body.email,
//             phone:req.body.phone,
//             address:req.body.address,
//             gender:req.body.gender,
//             userId:req.body.userId
//         }
//         if (req.files) 
//         {
//         await cloudinary.uploader.destroy(contact.imageId)
//         const uploadedresult = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
//         newData['imageId'] = uploadedresult.public_id
//         newData['imageUrl'] = uploadedresult.secure_url
//         }
//         const result = await newData.save()

//         res.status(200).json({
//             msg : 'data updated',
//             data : result
//         })
//     }
//     catch(err)
//     {
//         console.log(err)
//         res.status(500).json({
//             error:err
//         })
//     }
// })
Router.put('/update/:id', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = await jwt.verify(token, process.env.SEC_KEY);

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ msg: "Contact not found" });
        }

        if (tokenData.userId !== contact.userId.toString()) {
            return res.status(403).json({
                msg: 'You are not allowed to update this data'
            });
        }

        const newData = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            gender: req.body.gender,
            userId: tokenData.userId
        };

        if (req.files && req.files.photo) {
            if (contact.imageId) {
                await cloudinary.uploader.destroy(contact.imageId);
            }

            const uploadedresult = await cloudinary.uploader.upload(
                req.files.photo.tempFilePath
            );

            newData.imageId = uploadedresult.public_id;
            newData.imageUrl = uploadedresult.secure_url;
        }

        const result = await Contact.findByIdAndUpdate(
            req.params.id,
            newData,
            { new: true }
        );

        res.status(200).json({
            msg: 'Data updated',
            data: result
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// count contact by user id
Router.get('/count',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        const data = await Contact.countDocuments({userId:tokenData.userId})
        res.status(200).json({
            count:data
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



// count contact by gender
Router.get('/count/:gender',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        const data = await Contact.countDocuments({userId:tokenData.userId,gender:req.params.gender})
        res.status(200).json({
            count:data
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