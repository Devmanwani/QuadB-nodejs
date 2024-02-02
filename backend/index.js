const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require('cors');


const app = express();
const port = 3000;


app.use(cors());
// MongoDB connection string
const mongoURI =
  "mongodb+srv://admin:4ZU8AvsmhvWcMJFM@cluster0.fzipcbl.mongodb.net";

// Mongoose schema for crypto data
const cryptoSchema = new mongoose.Schema({
  base_unit: String,
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
});

const Crypto = mongoose.model("Crypto", cryptoSchema);

// Fetch data from WazirX API and store in MongoDB using Mongoose
async function fetchDataAndStoreInDatabase() {
    try {
      const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
      const top10Data = Object.values(response.data).slice(0, 10);
  
      // Clear existing data
      await Crypto.deleteMany({});
  
      // Insert new data
      await Crypto.insertMany(top10Data.map(data => ({
        name: data.name,
        base_unit: data.base_unit,
        last: data.last,
        buy: data.buy,
        sell: data.sell,
        volume: data.volume,
      })));
  
      console.log("Data stored in MongoDB using Mongoose.");
    } catch (error) {
      console.error("Error fetching or storing data:", error.message);
    }
  }

// Express route to get stored data from MongoDB using Mongoose
app.get("/api/cryptoData", async (req, res) => {
  try {
    const result = await Crypto.find({});
    res.json(result);
  } catch (error) {
    console.error(
      "Error retrieving data from MongoDB using Mongoose:",
      error.message,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  fetchDataAndStoreInDatabase(); // Fetch data and store in MongoDB using Mongoose on server start
});
