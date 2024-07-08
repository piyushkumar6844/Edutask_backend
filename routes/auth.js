const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const userfetching = require('./userfetching');
const userfetching = require('../middleware/userfetching');
const { check, validationResult } = require('express-validator');

const JWT_SECRET = 'cnkdnvkrmnkvr';

// Creating a new user
router.post('/signup', [
    check('name', 'Enter a valid name').isLength({ min: 3, max: 30 }),
    check('email', 'Enter a valid email').isEmail(),
    check('password', 'Password length should be 6 to 12 characters').isLength({ min: 6, max: 12 }),
    check('role', 'Role must be either student or teacher').isIn(['student', 'teacher'])
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            role: req.body.role
        });
        await user.save();
        const data = { user: { id: user.id, role: user.role } };
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(201).json({ authtoken, success });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// User login
router.post('/login', [
    check('email', 'Enter a valid email').isEmail(),
    check('password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const data = { user: { id: user.id, role: user.role } };
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
router.post('/getuser', userfetching(), async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role // Include role in the response
        };




        console.log('User Datainjnoj:', userData);
        res.send(userData);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
}
)
;

module.exports = router;
