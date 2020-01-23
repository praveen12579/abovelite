const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');

const tokenVerify = require('../../middleware/tokenVerify');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route GET api/profile/me
// @desc get current user profile
// @access Public
router.get('/me', tokenVerify, async (req, res) => {
	try {
	console.log(req.user.id);
		const profile = await Profile.findOne({user : req.user.id}).populate(
			'user',
			['name', 'avatar']
		);
		console.log("1");
		if(!profile) {
			return res.status(400).json({msg: 'hum aapke hai kaun'});
		}
		console.log("2");
		res.json(profile);
		console.log("3");
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// @route POST api/profile
// @desc to create profile
// @access Public
router.post('/', [tokenVerify], async (req, res) => {
	const {university, company} = req.body;
	profile = new Profile({university, company});
	await profile.save();
});

module.exports = router;