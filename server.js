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
app.post('/viewdetails', getDetails);


function getPlants(req, res) {
  let currentSearch = req.query.namedsearch;
  let url = `https://trefle.io/api/v1/plants/search?token=${KEY}&q=${currentSearch}`;
  superagent.get(url)
    .then(plantObject => {
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

function getDetails(req, res) {
  let ID = req.body.id;
  let url = `https://trefle.io/api/v1/plants/${ID}?token=${KEY}`;
  superagent.get(url)
    .then(detailPlantObject =>{
      return detailPlantObject.body.data;
    })
    .then(data =>{
      return new DetailedPlants(data);
    })
    .then(object =>{
      console.log(object);
      res.render('./pages/details', {plantDetails: object});
    })
    .catch(err => console.error(err));
}

function Plants(results) {
  this.common_name = results.common_name;
  this.image_url = results.image_url;
  this.scientific_name = results.scientific_name;
  this.id = results.id;
}

function DetailedPlants(results){
  this.common_name = results.common_name;
  this.scientific_name = results.scientific_name;
  this.image_url = results.image_url;
  this.edibility = results.main_species.edible;
  this.vegetable = results.vegetable;
  this.imagesArray = results.main_species.images;
  this.distributionLocations = results.main_species.distribution.native;
  this.flowering = results.main_species.flower.conspicuous;
  this.fruiting = results.main_species.fruit_or_seed.conspicuous;
  this.phMax = results.main_species.growth.ph_maximum;
  this.phMin = results.main_species.growth.ph_minimum;
  this.light = results.main_species.growth.light;
  this.minTemp = results.main_species.growth.minimum_temperature.deg_f;
  this.maxTemp = results.main_species.growth.maximum_temperature.deg_f;
  this.soilNutriments = results.main_species.growth.soil_nutriments;
  this.soilSalinity = results.main_species.growth.soil_salinity;
  this.soilTexture = results.main_species.growth.soil_texture;
  this.soilHumidity = results.main_species.growth.soil_humidity;
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
