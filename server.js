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
// app.post('/search', renderSearch);

// function renderSearch(req, res) {



// }


function getPlants(req, res) {
  let currentSearch = req.query.namedsearch;
  let url = `https://trefle.io/api/v1/plants/search?token=${KEY}&q=${currentSearch}`;
  superagent.get(url)
    .then(plantObject => {
      console.log('body',plantObject.body.data);
      return plantObject.body.data
    })
    .then(data =>{
      let info = data.map(plant => {
        return new Plants(plant);
      });
      res.render('./pages/searches.ejs', {searchresults: info});
    })
    .catch(err => console.error(err));
}

function Plants(results) {
  this.common_name = results.common_name;
  this.image_url = results.image_url;
  this.scientific_name = results.scientific_name;
  this.id = results.id;
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
