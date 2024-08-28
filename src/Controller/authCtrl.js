const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../Model/userModel');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authCtrl = {
    signup: async (req, res) => {
        try {
            const {firstname, lastname, email, password, role} = req.body;
            if(!firstname || !lastname || !email || !password) {
                return res.status(403).send({message: 'Please fill all fields!'})
            }
            const oldUser = await User.findOne({email})
            if(oldUser) {
                return res.status(400).send({message: "this is email already exists!"})
            }
            const hashedPassword = await bcrypt.hash(password, 8);
            const user = await User.create({firstname, lastname, email, password: hashedPassword, role})
            delete user._doc.password;

            const token = JWT.sign(user._doc, JWT_SECRET_KEY)

            res.status(201).send({message: 'signup succesfully', user, token})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    login: async (req, res) => {
        try {
            const {email, password} = req.body;
            if(!email || !password) {
                return res.status(403).send({message: 'Please fill all fields!'})
            }

            const user = await User.findOne({email})

            if(!user) {
                return res.status(404).send({message: "email or password wrong"})
            }   

            let verifyPassword = await bcrypt.compare(password, user.password)
            if(!verifyPassword) {
                return res.status(404).send({message: "email or password wrong"})
            }

            delete user._doc.password
            const token = JWT.sign(user._doc, JWT_SECRET_KEY)

            res.status(200).send({message: 'login succesfully', user, token})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    }
}

module.exports = authCtrl