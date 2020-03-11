const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('config');
const User = require('../../models/User');

// @route POST api/users
// @desc to register user
// @access Public
router.post('/', [
		check('name', 'name is required').not().isEmpty(),
		check('email', 'valid email is required').isEmail(),
		check('password', 'valid password is required').isLength({min : 5}),
	],
	async (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, email, password } = req.body;
	try {
		//see if user exists
		let user = await User.findOne({email});
		if(user) {
			return res.status(400).json({errors: [{ msg: 'user already exists'}]});
		}
		//get gravatar
		const avatar = gravatar.url(email, {
			s: '200',
			r: 'pg',
			d: 'mm'
		});
		user = new User({name, email,avatar,password});
		//Encrypt password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		//save user
		await user.save();

		const payload = {
			user: {
				id : user.id
			}
		};
		//Return jsonwebtoken, to user to be logged in as soon they create account
		jwt.sign(payload,
		config.get('jwtToken'),
		{ expiresIn: 36000},
		(err, token) => {
			if(err) throw err;
			res.json({token});
		});
		
		//console.log(req.body); //have to initialize middleware for body parser
		
	}catch(err) {
		console.error(err.message);
		res.status(500).send('server error');
	}

});

module.exports = router;