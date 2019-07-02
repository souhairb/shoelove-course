const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TagSchema = new Schema({
  name: String
});

const tagModel = mongoose.model("Tag", TagSchema);

module.exports = tagModel;
