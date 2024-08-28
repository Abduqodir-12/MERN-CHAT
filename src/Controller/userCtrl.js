const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const {v4} = require('uuid')

const User = require('../Model/userModel');

const userCtrl = {
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            if (req.user._id == id || req.userIsAdmin) {
                let user = await User.findByIdAndDelete(id);
                if(!user) {return res.status(404).send({message: 'user not found'})}

                if(user.profilePicture) {
                    fs.unlink(path.join(__dirname, "../", "profilePictures", user.profilePicture), (err) => {
                        if(err) throw err
                    })
                }
                if(user.coverPicture) {
                    fs.unlink(path.join(__dirname, "../", "coverPictures", user.coverPicture), (err) => {
                        if(err) throw err
                    })
                }
                return res.status(200).send({message: 'user is deleted'});
            }
            return res.status(405).send({message: 'access not alloved'});
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find()
            users.forEach(user => {delete user._doc.password})

            res.status(200).send({ messsage: "All users", users })
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    getOneUser: async (req, res) => {
        try {
            const {id} = req.params;
            const user = await User.findById(id)
            if(user) {
                const {password, ...otherDetails} = user._doc;
                return res.status(200).send({message: 'Found User', user: otherDetails})
            }
            res.status(404).send({message: 'User not found'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;

            if (req.user._id == id || req.userIsAdmin) {
                const user = await User.findById(id)
                if(!user) {return res.status(404).send({message: 'user not found'})}

                if(req.body.password && req.body.password != "") {
                    const hashedPassword = await bcrypt.hash(req.body.password, 10)
                    req.body.password = hashedPassword;
                } else {
                    delete req.body.password
                }

                if(req.files) {
                    if(req.files.profilePicture) {
                        const {profilePicture} = req.files;
                        const format = path.extname(profilePicture.name);
                        if(format !== ".png" && format !== ".jpg" && format !== ".jpeg") {
                            return res.status(403).send({message: 'File format is incorrect. Correct format: jpg or png'})
                        }
                        const nameImg = v4() + format;
                        profilePicture.mv(path.join(__dirname, "../", "profilePictures", nameImg), (err) => {
                            if(err) throw err
                        })
                        req.body.profilePicture = nameImg;
                        if(user.profilePicture) {
                            fs.unlink(path.join(__dirname, "../", "profilePictures", user.profilePicture), (err) => {
                                if(err) throw err
                            })
                        }
                    }
                    if(req.files.coverPicture) {
                        const {coverPicture} = req.files;
                        const format = path.extname(coverPicture.name);
                        if(format !== ".png" && format !== ".jpg" && format !== ".jpeg") {
                            return res.status(403).send({message: 'File format is incorrect'})
                        }
                        const nameImg = v4() + format;
                        coverPicture.mv(path.join(__dirname, "../", "coverPictures", nameImg), (err) => {
                            if(err) throw err
                        })
                        req.body.coverPicture = nameImg;
                        if(user.coverPicture) {
                            fs.unlink(path.join(__dirname, "../", "coverPictures", user.coverPicture), (err) => {
                                if(err) throw err
                            })
                        }
                    }
                }
                const updateUser = await User.findByIdAndUpdate(id, req.body, {new: true})
                return res.status(200).send({message: 'User is updated', user: updateUser})
            }
            return res.status(405).send({message: 'access not alloved'});
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    }
}

module.exports = userCtrl;