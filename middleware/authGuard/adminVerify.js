const User = require("../../models/Users")

const adminVerify = async (req, res, next) => {
    try {
        const { userId } = req
        const isAdmin = await User.findOne({ $and: [{ role: 'admin' }, { _id: userId }] })

        if (isAdmin) {
            next()
        } else {
            next(`Authentication failure!`)
        }
    } catch (e) {
        next(`Authentication failure!`)
    }
}

module.exports = adminVerify