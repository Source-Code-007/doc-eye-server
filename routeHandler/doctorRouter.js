const express = require('express')
const doctorRouter = express.Router('')
const jwtVerify = require('../middleware/authGuard/jwtVerify')
const Doctor = require('../models/Doctors')




// insert a doctor
doctorRouter.post('/insert-doctor', async (req, res) => {
    try {
        const newDoctor = new Doctor(req.body)
        await newDoctor.save()
        res.status(200).send({ message: 'doctor inserted successfully!', _id: newDoctor?._id })
    } catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }
})


// Get all doctors
doctorRouter.get('/all-doctors', async (req, res) => {
    // const allDoctors = await Doctor.find({}).select({ __v: 0 })
    try {
        const allDoctors = await Doctor.find({}, { __v: 0 })
        if (allDoctors) {
            res.status(200).send({
                message: 'Doctors found!',
                data: allDoctors
            })
        } else {
            res.status(500).send({ errors: { common: { msg: 'Doctors not found!' } } })
        }
    }
    catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }

})


// Get expected doctor 
// TODO: [demo protected route]
doctorRouter.get('/expected-doctor/:id', async (req, res) => {
    try {
        const _id = req.params?.id
        const expectedDoctor = await Doctor.findById(_id).select({ __v: 0 })
        if (expectedDoctor) {
            res.status(200).send({
                message: 'Expected doctor found!',
                data: expectedDoctor
            })
        } else {
            res.status(500).send({ errors: { common: { msg: 'Expected doctor not found!' } } })
        }
    } catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }

})

// Delete expected doctor
doctorRouter.delete('/delete-doctor/:id', async (req, res) => {
    try {

        const _id = req.params?.id
        const deleteDoctor = await Doctor.findByIdAndDelete(_id)
        // const deleteDoctor = await Doctor.deleteOne({doctorName: 'test'})
        // const deleteDoctors = await Doctor.deleteMany({doctorName: 'test'})
        if (deleteDoctor) {
            res.send(`Deleted doctor: ${deleteDoctor}`)
        } else {
            res.status(500).send({ errors: { common: { msg: 'Doctor not found!' } } })
        }
    } catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }
})

// Update expected doctor
doctorRouter.patch('/update-doctor/:id', async (req, res) => {
    try {

        const _id = req.params?.id
        const updatedDoctor = await Doctor.findByIdAndUpdate(_id, {
            $set: {
                ...req.body
            }
        })
        if (updatedDoctor) {
            res.send(`Updated doctor: ${updatedDoctor}`)
        } else {
            res.status(500).send({ errors: { common: { msg: 'Doctor not found!' } } })
        }
    } catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }
})



module.exports = doctorRouter