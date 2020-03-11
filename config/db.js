const mongoose = require('mongoose');
const config = require('config'); //to get the string which we put in default.json
const db = config.get('mongoURI');

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser : true, 
			useUnifiedTopology : true,
			useCreateIndex: true,
			useFindAndModify: false
		}); //will give us back a promise
		console.log('DB connected');
	} catch(err) {
		console.log(err.message);
		process.exit(1);
	}
}

module.exports = connectDB;