'use strict';


require('dotenv').config();

const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');
const { render } = require('ejs');


const KEY = process.env.KEY;
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', helloWorld);
app.get('/search', getPlants);
app.post('/viewdetails', getDetails);
app.post('/wishlist', populateWishlistDB);
app.get('/wishlist', renderWishlistPage);
app.put('/removefromwishlist', removeFromWishlist);
app.post('/mygarden', populateGardenDB);
app.get('/mygarden', renderGardenPage);
app.post('/mygarden/new', addNotes);
app.put('/addmygarden', addfromwishlist);
app.put('/removefrommygarden', removeFromMyGarden);
app.get('/filter', getCategory);
// app.get('/filterResults', filterSearchResults);



function getPlants(req, res) {
  let currentSearch = req.query.namedsearch;
  let url = `https://trefle.io/api/v1/plants/search?token=${KEY}&q=${currentSearch}`;
  superagent.get(url)
    .then(plantObject => {
      return plantObject.body.data
    })
    .then(data => {
      let info = data.map(plant => {
        return new Plants(plant);
      });
      res.render('./pages/searches.ejs', { searchresults: info, searchedfor: currentSearch });
    })
    .catch(err => console.error(err));
}

// function filterSearchResults(req, res) {
//   let url = `https://trefle.io/api/v1/plants/search?token=${KEY}&q=${req.query.searchedfor}`;

//   let urlAddOns = ['&filter[edible]=true', '&filter[vegetable]=true', '&filter[fruit_conspicuous]=true', '&filter[flower_conspicuous]=true', '&filter[toxicity]=false'];
//   let usedFilters = [];

//   for (let key in req.query) {
//     usedFilters.push(key);
//   }

//   for (let i=0; i<urlAddOns.length; i++){
//     if (usedFilters.includes(urlAddOns[i])){
//       url+=urlAddOns[i];
//       return url;
//     }
//     console.log(url);
//   }
//   superagent.get(url)
//     .then(plantObject => {
//       return plantObject.body.data
//     })
//     .then(data => {
//       let info = data.map(plant => {
//         return new Plants(plant);
//       });
//       res.render('./pages/searches.ejs', { searchresults: info, searchedfor: req.query.searchedfor });
//     })
//     .catch(err => console.error(err));
// }




function getCategory(req, res) {
  let filterParam = req.query.value;
  let url = `https://trefle.io/api/v1/species?token=${KEY}&filter[${filterParam}]=true`;
  superagent.get(url)
    .then(plantObject => {
      return plantObject.body.data
    })
    .then(data => {
      let info = data.map(plant => {
        return new Plants(plant);
      })
      res.render('./pages/searches.ejs', { searchresults: info, searchedfor: filterParam });
    })
    .catch(err => console.error(err));
}

function getDetails(req, res) {
  let ID = req.body.id;
  let url = `https://trefle.io/api/v1/plants/${ID}?token=${KEY}`;
  superagent.get(url)
    .then(detailPlantObject => {
      return detailPlantObject.body.data;
    })
    .then(data => {
      return new DetailedPlants(data);
    })
    .then(object => {
      res.render('./pages/details', { plantDetails: object });
    })
    .catch(err => console.error(err));
}

function populateWishlistDB(req, res) {
  let { common_name, scientific_name, image_url, edibility, vegetable, distribution, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity } = req.body;
  let SQL = `INSERT INTO saved_plants (common_name, scientific_name, image_url, edibility, vegetable, distributionLocations, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity, ismywishlist) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *;`;
  let values = [common_name, scientific_name, image_url, edibility, vegetable, distribution, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity, true];
  return client.query(SQL, values)
    .then(res.redirect('/wishlist'))
    .catch(err => console.error(err));
}

function populateGardenDB(req, res) {
  let { common_name, scientific_name, image_url, edibility, vegetable, distribution, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity } = req.body;
  let SQL = `INSERT INTO saved_plants (common_name, scientific_name, image_url, edibility, vegetable, distributionLocations, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity, ismygarden) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *;`;
  let values = [common_name, scientific_name, image_url, edibility, vegetable, distribution, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity, true];
  return client.query(SQL, values)
    .then(res.redirect('/mygarden'))
    .catch(err => console.error(err));
}

function removeFromMyGarden(req, res) {
  let SQL = `UPDATE saved_plants SET ismygarden = $1 WHERE scientific_name = '${req.body.scientific_name}' RETURNING *;`;
  let values = [false];
  client.query(SQL, values)
  renderGardenPage(req, res);
}

function addfromwishlist(req, res) {
  let SQL = `UPDATE saved_plants SET ismygarden = $1 WHERE scientific_name = '${req.body.scientific_name}' RETURNING *;`;
  let values = [true];
  client.query(SQL, values)
  renderGardenPage(req, res);
}

function removeFromWishlist(req, res) {
  let SQL = `UPDATE saved_plants SET ismywishlist = $1 WHERE scientific_name = '${req.body.scientific_name}' RETURNING *;`;
  let values = [false];
  client.query(SQL, values)
  renderWishlistPage(req, res);
}

function renderGardenPage(req, res) {
  let SQL = `SELECT DISTINCT common_name, scientific_name, image_url, edibility, vegetable, distributionLocations, flowering, fruiting, phMax, phMin, light, minTemp, maxTemp, soilNutriments, soilSalinity, soilTexture, soilHumidity FROM saved_plants WHERE ismygarden = 'true';`;

  client.query(SQL)
    .then(plant => {
      console.log('this is the plant from the DB', plant);
      let SQL2 = `SELECT plantJournal, scientific_name , to_char(current_date,'Mon-dd-yyyy') as date  FROM saved_plants WHERE plantJournal IS NOT null;`;
      client.query(SQL2)
        .then(results => {
          let resultsArray = results.rows;
          console.log(resultsArray);
          res.render('./pages/mygarden', { plant: plant.rows, results: resultsArray });
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

function renderWishlistPage(req, res) {
  let SQL = `SELECT DISTINCT common_name, scientific_name, image_url FROM saved_plants WHERE ismywishlist = 'true';`;

  client.query(SQL)
    .then(results => {
      res.render('./pages/favorites', { plant: results.rows });
    })
}

function addNotes(req, res) {
  console.log('results TO db:', req.body.plantNotes);
  let SQL = `INSERT INTO saved_plants (plantJournal, scientific_name) VALUES ($1, $2);`;
  let values = [req.body.plantNotes, req.body.name];
  return client.query(SQL, values)
    .then(res.redirect('/mygarden'))
    .catch(err => console.error(err));
}

function Notes(savedNotes) {
  for (let key in savedNotes) {
    this[key] = savedNotes[key];
  }
}


function Plants(results) {
  this.common_name = results.common_name;
  this.image_url = results.image_url;
  this.scientific_name = results.scientific_name;
  this.id = results.id;
}

function DetailedPlants(results) {
  this.common_name = results.common_name;
  this.scientific_name = results.scientific_name;
  this.image_url = results.image_url;
  this.edibility = results.main_species.edible;
  this.vegetable = results.vegetable;
  this.imagesArray = results.main_species.images;
  this.distributionLocations = results.main_species.distribution.native;
  this.locationString = '';
  this.flowering = results.main_species.flower.conspicuous;
  this.fruiting = results.main_species.fruit_or_seed.conspicuous;
  this.phMax = results.main_species.growth.ph_maximum || 'No Data Provided';
  this.phMin = results.main_species.growth.ph_minimum || 'No Data Provided';
  this.light = results.main_species.growth.light || 'No Data Provided';
  this.minTemp = results.main_species.growth.minimum_temperature.deg_f || 'No Data Provided';
  this.maxTemp = results.main_species.growth.maximum_temperature.deg_f || 'No Data Provided';
  this.soilNutriments = results.main_species.growth.soil_nutriments || 'No Data Provided';
  this.soilSalinity = results.main_species.growth.soil_salinity || 'No Data Provided';
  this.soilTexture = results.main_species.growth.soil_texture || 'No Data Provided';
  this.soilHumidity = results.main_species.growth.soil_humidity || 'No Data Provided';

  this.distributionLocations.forEach(location => {
    this.locationString += `${location}, `;
  });
}


function helloWorld(req, res) {
  res.render('./pages/index');
}

app.use('*', (req, res) => {
  res.status(404).send('Sorry that does not exist.');
})

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    })
  });
