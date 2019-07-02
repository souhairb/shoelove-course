const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  image: { type: String, default: "images/default-avatar.png" },
  modelname: String,
  ref: { type: String },
  sizes: Number,
  description: String,
  price: Number,
  category: { type: String, enum: ["Men", "Women", "Kids"] },
  tags: {
    type: String,
    enum: ["Friendly", "Urban style", "Dope"],
    default: "Friendly"
  }
});
// , match: /^[A-Z]{1}d{3}[A-Z]{2}d{1}$/
const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
