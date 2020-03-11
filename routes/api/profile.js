const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');

const tokenVerify = require('../../middleware/tokenVerify');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

const config = require('config');
const request = require('request');
const normalize = require('normalize-url');

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
		console.error(err.message);
		res.status(500).send(err.message);
	}
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
	'/',
	[
		tokenVerify,
		[
			check('status', 'Status is required')
				.not()
				.isEmpty(),
			check('skills', 'Skills is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const {
			company,
			location,
			website,
			bio,
			skills,
			status,
			githubusername,
			youtube,
			twitter,
			instagram,
			linkedin,
			facebook
		} = req.body;

		const profileFields = {
			user: req.user.id,
			company,
			location,
			website: website === '' ? '' : normalize(website, { forceHttps: true }),
			bio,
			skills: Array.isArray(skills)
				? skills
				: skills.split(',').map(skill => ' ' + skill.trim()),
			status,
			githubusername
		};

		// Build social object and add to profileFields
		const socialfields = { youtube, twitter, instagram, linkedin, facebook };

		for (const [key, value] of Object.entries(socialfields)) {
			if (value.length > 0)
				socialfields[key] = normalize(value, { forceHttps: true });
		}
		profileFields.social = socialfields;

		try {
			// Using upsert option (creates new doc if no match is found):
			let profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true, upsert: true }
			);
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route GET api/profile/myProfile
// @desc to get profile
// @access Public
router.get('/myProfile', tokenVerify, async (req, res) => {
	
	try {
		const profile = await Profile.findOne({user : req.user.id}).populate(
			'user',
			['name', 'avatar']
		);
		if(!profile) {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		//
		res.json(profile);

	} catch (err) {
		console.error(err.message);
		res.status(500).send(err.message);
	}
});

// @route Delete api/profile
// @desc to delete profile
// @access Public
router.delete('/', tokenVerify, async (req, res) => {
	
	try {
		await Post.deleteMany({ user: req.user.id });
		await Profile.findOneAndRemove({user : req.user.id});
		await User.findOneAndRemove({_id : req.user.id});
		res.json({msg:'user removed'});

	} catch (err) {
		console.error(err.message);
		res.status(500).send(err.message);
	}
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
	'/experience',
	[
		tokenVerify,
		[
			check('title', 'Title is required')
				.not()
				.isEmpty(),
			check('company', 'Company is required')
				.not()
				.isEmpty(),
			check('from', 'From date is required and needs to be from the past')
				.not()
				.isEmpty()
				.custom((value, { req }) => (req.body.to ? value < req.body.to : true))
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		} = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', tokenVerify, async (req, res) => {
	try {
		const foundProfile = await Profile.findOne({ user: req.user.id });

		foundProfile.experience = foundProfile.experience.filter(
			exp => exp._id.toString() !== req.params.exp_id
		);

		await foundProfile.save();
		return res.status(200).json(foundProfile);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
	'/education',
	[
		tokenVerify,
		[
			check('school', 'School is required')
				.not()
				.isEmpty(),
			check('degree', 'Degree is required')
				.not()
				.isEmpty(),
			check('fieldofstudy', 'Field of study is required')
				.not()
				.isEmpty(),
			check('from', 'From date is required and needs to be from the past')
				.not()
				.isEmpty()
				.custom((value, { req }) => (req.body.to ? value < req.body.to : true))
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		} = req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', tokenVerify, async (req, res) => {
	try {
		const foundProfile = await Profile.findOne({ user: req.user.id });
		const eduIds = foundProfile.education.map(edu => edu._id.toString());
		const removeIndex = eduIds.indexOf(req.params.edu_id);
		if (removeIndex === -1) {
			return res.status(500).json({ msg: 'Server error' });
		} else {
			foundProfile.education.splice(removeIndex, 1);
			await foundProfile.save();
			return res.status(200).json(foundProfile);
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: encodeURI(
				`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
			),
			method: 'GET',
			headers: {
				'user-agent': 'node.js',
				Authorization: `token ${config.get('githubToken')}`
			}
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' });
			}

			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/getAllProfiles
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', ['name', 'avatar']);

		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server Error');
	}
});

module.exports = router;