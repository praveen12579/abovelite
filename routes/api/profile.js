const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');

const tokenVerify = require('../../middleware/tokenVerify');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route GET api/profile/me
// @desc get current user profile
// @access Private
router.get('/me', tokenVerify, async (req, res) => {
	try {
		const profile = await Profile.findOne({user : req.user.id}).populate(
			'user',
			['name', 'avatar']
		);
		if(!profile) {
			return res.status(400).json({msg: 'hum aapke hai kaun'});
		}
		res.json(profile);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// @route POST api/profile/saveProfile
// @desc to create profile
// @access Private
router.post('/saveProfile', tokenVerify, async (req, res) => {
	const {location, description, skills, experience, education, social} = req.body;
	ProfileFields = {};
	ProfileFields.user = req.user.id;
	if(location) ProfileFields.location = location;
	if(description)  ProfileFields.description = description;
	if(skills) { ProfileFields.skills = skills.split(',').map(skill => skill.trim()); }
	if(experience) ProfileFields.experience = experience;
	if(education) ProfileFields.education = education;
	if(social) ProfileFields.social = social;
	
	try {
		//update
		let profile = await Profile.findOne({user : req.user.id});
		if(profile) {
			profile = await Profile.findOneAndUpdate({user : req.user.id}, {$set : ProfileFields}, {new: true});
			return res.json(profile);
		}
		//create New
		profile = new Profile(ProfileFields);
		await profile.save();
		res.json(profile);

	}catch(err) {
		res.status(500).send(err.message);
	}
});

// @route GET api/profile/getProfile
// @desc to get profile
// @access Public
router.get('/getProfile', tokenVerify, async (req, res) => {
	
	try {
		//get profile
		ProfileFields = {};
		let profile = await Profile.findOne({user : req.user.id}).populate(
			'user',
			['name', 'avatar']
		);
		if(!profile) {
			return res.json({});
		}
		//
		return res.json(profile);

	}catch(err) {
		res.status(500).send(err.message);
	}
});

// @route Delete api/profile/deleteProfile
// @desc to delete profile
// @access Public
router.get('/deleteProfile', tokenVerify, async (req, res) => {
	
	try {
		await Profile.findOneAndRemove({user : req.user.id});
		
		await User.findOneAndRemove({_id : req.user.id});
		return res.json({msg:'user removed'});

	}catch(err) {
		res.status(500).send(err.message);
	}
});

// @route put api/profile/experience
// @desc to add exp to profile
// @access Private
router.put('/saveProfile/addExperience', tokenVerify, async (req, res) => {
	const {title, company, location, startDate, endDate, current, description}= req.body;
	const newExp = {title, company, location, startDate, endDate, current, description};
	try {
		const profile = await Profile.findOne({user : req.user.id});
		profile.experience.unshift(newExp);
		await profile.save;
		return res.json(profile);

	}catch(err) {
		res.status(500).send(err.message);
	}
});

// @route put api/profile/experience
// @desc to add exp to profile
// @access Private
router.put('/saveProfile/removeExperience', tokenVerify, async (req, res) => {
	try {
		const profile = await Profile.findOne({user : req.user.id});
		const removeIndex = 
		profile.experience.unshift(newExp);
		await profile.save;
		return res.json(profile);

	}catch(err) {
		res.status(500).send(err.message);
	}
});

module.exports = router;