const mongoose = require('mongoose');

const profileSchema= new mongoose.Schema({
	user : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	location : {
		type : String
	},
	description : {
		type : String
	},
	skills : {
		type : [String],
		required: true
	},
	experience: [
		{
			title: {
				type : String,
				required: true
			},
			company: {
				type : String,
				required: true
			},
			startDate: {
				type : Date,
				required: true
			},
			endDate: {
				type : Date,
			},
			current: {
				type : Boolean,
				default: false
			},
		},
	],
	education: [
		{
			degree: {
				type : String,
				required: true
			},
			college: {
				type : String,
				required: true
			},
			startDate: {
				type : Date,
				required: true
			},
			endDate: {
				type : Date,
			},
			current: {
				type : Boolean,
				default: false
			},
		},
	],
	social: {
		linkedin : {
			type : String
		},
		github : {
			type : String
		}
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = profile = mongoose.model('profile', profileSchema)