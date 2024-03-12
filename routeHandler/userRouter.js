const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRouter = express.Router()
const User = require('../models/Users')
const avatarUpload = require('../middleware/multer/avatarUpload')
const { unlink } = require('fs')
const path = require('path');
const jwtVerify = require('../middleware/authGuard/jwtVerify')
const { addUserValidator, addUserValidatorHandler } = require('../middleware/validator/userValidator')


userRouter.post('/signup', avatarUpload, addUserValidator, addUserValidatorHandler, async (req, res) => {
    try {
        const { name, email, phone, password, role, avatar } = req.body
        const hashPass = await bcrypt.hash(password, 10) //Password encrypted using bcrypt
        const existUser = await User.findOne({ email: email })

        if (!existUser) {
            let newUser;
            if (req.files?.length > 0) {
                if (req?.files[0]?.filename) {
                    newUser = new User({ name, email, phone, avatar: `${process.env}/avatar/${req?.files[0]?.filename}`, password: hashPass, role })
                }
            } else {
                newUser = new User({ name, email, password: hashPass, phone, role })
            }
            await newUser.save()
            if (newUser) {
                res.status(200).send({ message: 'User created successfully' })
            } else {
                // Remove the uploaded file
                if (req.files?.length > 0) {
                    unlink(path.join(__dirname, `../upload/avatar/${req.files[0]?.filename}`), err => {
                        if (err) console.log(err?.message, 'error from remove file');
                    })
                }
                res.status(500).send({ errors: { common: { msg: 'There was a server side error' } } })
            }
        } else {
            // Remove the uploaded file
            if (req.files?.length > 0) {
                unlink(path.join(__dirname, `../upload/avatar/${req.files[0]?.filename}`), err => {
                    if (err) console.log(err?.message, 'error from remove file');
                })
            }
            res.status(500).send({ errors: { common: { msg: 'This email has already been registered!' } } })
        }

    } catch (e) {
        // Remove the uploaded file
        if (req.files?.length > 0) {
            unlink(path.join(__dirname, `../upload/avatar/${req.files[0]?.filename}`), err => {
                if (err) console.log(err?.message, 'error from remove file');
            })
        }

        if (e?.message) {
            res.status(500).send({ errors: { common: { msg: e?.message } } })
        } else {
            res.status(500).send({ errors: { common: { msg: `There was a server side error` } } })
        }
    }
})

userRouter.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await User.findOne({
            $or:[{ email: username }, { phone: username }]
        })

        
        if (user) {
            const isValidPass = await bcrypt.compare(password, user?.password) //Password decrypted using bcrypt
            if (isValidPass) {
                const jwtToken = jwt.sign({ username, _id: user?._id }, process.env.JWT_SECRET) //{ expiresIn: '10h' }
                res.status(200).send({ message: 'Login successfully', token: jwtToken })
            } else {
                res.status(500).send({ errors: { common: { msg: 'Authentication failed!' } } })
            }
        }
        else {
            res.status(500).send({ errors: { common: { msg: 'Authentication failed!' } } })
        }
    } catch (e) {
        if (e?.message) {
            res.status(500).send({ errors: { common: { msg: e?.message } } })
        } else {
            res.status(500).send({ errors: { common: { msg: 'Authentication failed!' } } })
        }
    }
})

// All users
userRouter.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({}, { __v: 0 })
        if (users) {
            res.status(200).send({
                message: 'Users found!',
                data: users
            })
        } else {
            res.status(500).send({ errors: { common: { msg: 'Users not found!' } } })
        }
    } catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }
})

// Get profile 
userRouter.get('/user-profile', jwtVerify, async (req, res) => {
    try {
        const username = req.username
        const user = await User.findOne({$or:[{ email: username }, {phone: username}]}, { __v: 0 })
        if (user) {
            res.status(200).send({
                message: 'User found!',
                data: user
            })
        } else {
            res.status(500).send({ errors: { common: { msg: 'User not found!' } } })
        }
    } catch (e) {
        res.status(500).send({ errors: { common: { msg: 'There was a server side error!' } } })
    }
})

// TODO: remove avatar after remove user
userRouter.delete('/delete-user/:id', async (req, res) => {

    const id = req?.params.id
    console.log(id);
    res.send(id)


    // Delete avatar after remove user
    // if(user.avatar){
    //     unlink(path.join(__dirname, `upload/avatar/${user.avatar}`), err=> {
    //         if(err) console.log(err?.message);
    //     })
    // }

})


module.exports = userRouter