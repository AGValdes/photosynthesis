DROP TABLE IF EXISTS saved_plants;

CREATE TABLE saved_plants (
  id SERIAL PRIMARY KEY,
  common_name VARCHAR(255),
  scientific_name VARCHAR(255),
  image_url VARCHAR(255),
  edibility VARCHAR(255),
  vegetable VARCHAR(255),
  distributionLocations TEXT,
  flowering VARCHAR(255),
  fruiting VARCHAR(255),
  phMax VARCHAR(255),
  phMin VARCHAR(255),
  light VARCHAR(255),
  minTemp VARCHAR(255),
  maxTemp VARCHAR(255),
  soilNutriments VARCHAR(255),
  soilSalinity VARCHAR(255),
  soilTexture VARCHAR(255),
  soilHumidity VARCHAR(255),
  plantJournal TEXT,
  ismygarden VARCHAR(255),
  ismywishlist VARCHAR(255)
);