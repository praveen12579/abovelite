const express = require('express');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');

const {check, validationResult} = require('express-validator/check');
const config = require('config');
const tokenVerify = require('../../middleware/tokenVerify');
const User = require('../../models/User');
const router = express.Router();
// @route GET api/auth
// @desc test route
// @access Public
router.get('/', tokenVerify, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		res.status(500).send('server error');
	}
});

// @route POST api/auth
// @desc login
// @access Public
router.post('/', [
		check('email', 'valid email is required').isEmail(),
		check('password', 'valid password is required').exists(),
	],
	async (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const {email, password} = req.body;

	try {
		const user = await User.findOne({email});
		if(!user) {
			return res.status(400).json({errors: [{ msg: 'no user exists'}]});
		}
		isEqual = await bcrypt.compare(password, user.password);
		if(!isEqual) {
			return res.status(400).json({errors: [{ msg: 'password incorrect'}]});
		}

		const payload = {
			user: {
				id : user.id
			}
		}
		jwt.sign(payload,
		config.get('jwtToken'),
		{expiresIn: 36000},
		(err, token) => {
		if(err) throw err;
			res.json({token});
		});

	} catch (err) {
		res.status(500).send('server error');
	}
	
});

module.exports = router;