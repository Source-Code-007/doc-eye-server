const mongoose = require('mongoose')


const doctorSchema = mongoose.Schema({
    doctorName: String,
    age: Number,
    title: String,
    joined_docEye: {
        type: Date,
        default: new Date()
    }
})

module.exports = doctorSchema 