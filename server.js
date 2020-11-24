'use strict'

require('dotenv').config();

const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');


const KEY = process.env.KEY;
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', helloWorld);
app.get('/search', getPlants);


function getPlants(req, res) {
  let currentSearch = req.query.namedsearch;
  console.log(req.query);
    let url = `https://trefle.io/api/v1/plants/search?token=${KEY}&q=${currentSearch}`;
  
  
  
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
