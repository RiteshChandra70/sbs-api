// const express = require('express')
// const Router = express.Router()
// const Contact = require('../models/Contact')

// Router.post('/add-contact',(req,res)=>{
// //    console.log(req.body)
// const newContact = new Contact({
//     fullName:req.body.name,
//     email:req.body.person_email,
//     phone:req.body.person_phone,
//     address:req.body.add
// })

// newContact.save()
// .then((result)=>{
//     console.log('data saved')
//     res.status(200).json({
//         msg:'data saved'
//     })
// })
// .catch((err)=>{
//     console.log(err)
//     res.status(500).json({
//         error:'something is wrong'
//     })
// })

// })



// module.exports = Router

const express = require('express')
const Router = express.Router()
const Contact = require('../models/Contact')


// Add contact route
// Router.post('/add-contact', (req, res) => {
//     //    console.log(req.body)
//     const newContact = new Contact({
//         fullName: req.body.name,
//         email: req.body.person_email,
//         phone: req.body.person_phone,
//         address: req.body.add
//     })

//     newContact.save()
//         .then((result) => {
//             console.log('data saved')
//             res.status(200).json({
//                 msg: 'data saved'
//             })
//         })
//         .catch((err) => {
//             console.log(err)
//             res.status(500).json({
//                 error: 'something is wrong'
//             })
//         })

// })

Router.post('/add-contact',async(req,res)=>{
    try {
        const newContact = new Contact({
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            gender: req.body.gender
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


// get all contact route
Router.get('/all-contact', async (req, res) => {
    try {
        const allContact = await Contact.find()
        res.status(200).json({
            result: allContact
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})


// get contact by id route
Router.get('/contactById/:id',async(req, res) => {
    try{
        // console.log(req.params.id)
        const id = req.params.id
        const data = await Contact.findById(id).select('_id fullName email phone address')
        res.status(200).json({
            contact:data
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


// get contact by gender route
Router.get('/gender/:g',async(req, res) => {
    try{
       const contact = await Contact.find({gender:req.params.g})
       res.status(200).json({
        contact:contact
       })
    }  
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })  
    }
})       



// delete contact by id route
Router.delete('/:id',async(req,res)=>{
    try{
        await Contact.deleteOne({_id:req.params.id})
        res.status(200).json({
            msg:"Contact deleted successfully"
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


// delete many data
Router.delete('/byGender/:gender',async(req,res)=>{
    try{
        await Contact.deleteMany({gender:req.params.gender})
        res.status(200).json({  
            msg:`All ${req.params.gender} Contacts are deleted successfully`
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports = Router



// // Add contact route
// Router.post('/addcontact',(req, res) =>{
//     res.status(200).json({
//         msg : "Contact added successfully"
//     })
// })

// // Get contact route
// Router.get('/getcontact',(req, res) =>{
//     res.status(200).json({
//         msg : "Contact get successfully"
//     })
// })
