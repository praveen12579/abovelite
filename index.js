const express = require('express');
const connectDB = require('./config/db')
const app = express(); //init app var with express

//connect DB
connectDB();

//init middleware
//app.use(bodyParser.json());    old school
app.use(express.json({extended : false}));

app.get('/', (req, res) => res.send('API running'));

//define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000; //look for an env var called as PORT
app.listen(PORT, () => console.log('server started on ${PORT}')); //call back function