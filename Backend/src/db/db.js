const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["1.1.1.1"]);
async function database() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("DataBase Connected");
  } catch (err) {
    console.log(err);
  }
}

module.exports = database;
