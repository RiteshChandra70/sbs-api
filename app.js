const express = require('express')
const app = express()
const userRoute = require('./Routes/user')
const contactRoute = require('./Routes/contact')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// mongoose.connect('mongodb+srv://ritesh:reet1234@rcp.ztvgqtz.mongodb.net/?appName=RCP')
// .then(() => {
//     console.log("Connected to Database")
// })
// .catch(err => {
//     console.log('something went wrong')
//     console.log(err)
// })

const connectWithDatabase = async() => {
    try {
        await mongoose.connect('mongodb+srv://ritesh:reet1234@rcp.ztvgqtz.mongodb.net/?appName=RCP')
        console.log("Connected with database")
    }
    catch(err){
        console.log('Something is wrong')
        console.log(err)
    }
}

connectWithDatabase()


app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


app.use('/user', userRoute)
app.use('/contact', contactRoute)
// app.use('/contact', userContact)

module.exports = app