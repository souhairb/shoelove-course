const express = require("express");
const router = new express.Router();

router.get("/product-edit", (req, res) => {
  res.render("product_edit");
});

module.exports = router;
