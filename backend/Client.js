const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  date: String,
  hoursWorked: String,
  clientId: String,
  clientAddress: String,
  serviceType: String,
  status: String,
  notes: String,
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
