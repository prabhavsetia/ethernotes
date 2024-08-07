const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
const JWT_Secret = "shhhhhh";
//  Route 1 :Create a user using: POST "/api/auth/createuser". No login Required
router.post('/createuser', [
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email').isEmail(),
    body('password', ' password must be atleast 8 characters').isLength({ min: 8 })]
    , async (req, res) => {
        //If there are errorsReturn bad request and errors
        let success= false;
        const result = validationResult(req);
        try {
            if (!result.isEmpty()) {
                return res.send({ success, errors: result.array() });
            }
            //check wether the email exixts already
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ success, error: 'User alredy exists' })
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt)
            //Create a  new User
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            })
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_Secret);
            // console.log(authtoken);
            success = true;
            res.json({success, authtoken })

            console.log(user);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error Occured");
        }
    })
// Route 2 :Authenticate a user using: POST "/api/auth/login". No login Required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()],
    async (req, res) => {
        let success= false;
        //If there are errorsReturn bad request and errors
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.send({ errors: result.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: 'Credentials are wrong' })
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                success= false;
                return res.status(400).json({ success, error: 'Credentials are wrong' })
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_Secret);
            success = true;
            res.json({success, authtoken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error Occured");
        }
        //check wether the email exixts already 

    })

// Route 2 :Getting user details: POST "/api/auth/getuser". No login Required
router.post('/getuser',fetchuser,
    async (req, res) => {
        try {
            const userId=req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error Occured");
        }
    })
module.exports = router 
