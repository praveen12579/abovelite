const express = require('express');

const app = express(); //init app var with express

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000; //look for an env var called as PORT
app.listen(PORT, () => console.log('server started on ${PORT}')); //call back function