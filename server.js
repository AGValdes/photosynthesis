'use strict'

require('dotenv').config();

const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');
const fetch = require('node-fetch');

const KEY = process.env.KEY;
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);


app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/hello', helloWorld);
app.get('/search', getPlants);


// (async ()=> {
//     const response = await fetch(`https://trefle.io/api/v1/plants?token=${KEY}`);
//     const json = await response.json();
//     console.log(json);
// })();


function getPlants(req, res) {
    let url = `https://trefle.io/api/v1/plants?token=${KEY}`;
    superagent.get(url)
        .then(results => {
            console.log(url);
            console.log(results.body);
        })
        .catch(err => console.error(err));
}


function helloWorld(req, res) {
    res.render('./pages/index');
}

app.use('*', (req, res) => {
    res.status(404).send('Sorry that does not exist.');
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})