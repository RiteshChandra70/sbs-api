const express = require('express')
const Router = express.Router()

// Signup route
Router.post('/signup', (req, res) => {
    res.status(200).json({
        msg : "Signup successful"
    })
})

// Login route
Router.post('/login', (req, res) => {
    res.status(200).json({
        msg : "Login successful"
    })
})

module.exports = Router