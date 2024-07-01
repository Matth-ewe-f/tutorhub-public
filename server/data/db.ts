require("dotenv").config();
const mg = require("mongoose");
const URI = process.env.ATLAS_URI
const testURI = process.env.ATLAS_URI_TEST

async function connect(isTest: boolean) {
  try {
    if (isTest === true) {
      await mg.connect(testURI);
    } else {
      await mg.connect(URI);
    }
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.log(err);
  }
}

async function disconnect() {
  try {
    await mg.disconnect();
    console.log("Disconnected from MongoDB!");
  } catch (err) {
    console.error("Error disconnecting from MongoDB:", err);
  }
}

module.exports = { connect, disconnect };