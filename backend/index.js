const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');
const redisClient = Redis.createClient()

const DEFAULT_EXP = 3600
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  redisClient.get(`photos?albumId=${albumId}`, async (err, photos) => {
    if (err) console.error(err);
    if (photos != null) {
      console.log('Cache Hit')
      return res.json(JSON.parse(photos))
    } else {
      console.log('Cache Miss')
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos",
        { params: { albumId }}
      );
    
      redisClient.setex(`photos?albumId=${albumId}`, DEFAULT_EXP, JSON.stringify(data));
      res.json(data);
    }
  })
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

module.exports = app