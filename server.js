require("dotenv").config();
require("./config/db_connection"); // database initial setup

const express = require("express");
const hbs = require("hbs");
const app = express();

app.locals.site_url = process.env.SITE_URL;
// used in front end to perform ajax request on a url var instead of hardcoding it
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "hbs"); //
app.set("views", __dirname + "/views"); //
app.use(express.static("public"));
hbs.registerPartials(__dirname + "/views/partials");

const basePageRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const UserModel = require("./models/User");
const productModel = require("./models/Product");
const tagModel = require("./models/Tag");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

app.use(basePageRouter);
app.use(adminRouter);
app.use(
  session({
    secret: "basic-auth-secret",
    cookie: { maxAge: 60000 },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    })
  })
);

// function createUser() {
//   UserModel.create({
//     name: "souhair",
//     lastname: "bou",
//     email: "souhairbou@gmail.com",
//     password: "soubou"
//   }).then(res => {
//     console.log("User created");
//   });
// }
// createUser();

function createProduct() {
  productModel
    .create({
      name: "sneaker1",
      sizes: 38,
      description: "sneaker",
      price: 120,
      category: "men"
    })
    .then(res => {
      console.log("Product created");
    });
}
// createProduct();

function createTag() {
  tagModel
    .create({
      name: "design"
    })
    .then(res => {
      console.log("Tag created");
    });
}
// createTag();

/*Signup*/
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res, next) => {
  console.log(req.body);
  const username = req.body.name;
  let userpassword = req.body.password;
  const useremail = req.body.email;
  const userlastname = req.body.lastname;
  if (
    username === "" ||
    userlastname === "" ||
    useremail === "" ||
    userpassword === ""
  ) {
    res.render("signup", {
      errorMessage: "Please fill in all the information to sign up."
    });
    return;
  }
  UserModel.findOne({ name: username }) //compare le name qui est dans le schéma (BDD) avec le username rentré par le user//
    .then(dbRes => {
      if (dbRes) {
        res.render("signup", {
          errorMessage: "The username already exists"
        });
        return;
      }
    })
    .catch(error => {
      console.log(error);
    });

  const salt = bcrypt.genSaltSync(bcryptSalt);
  let hashPass = bcrypt.hashSync(userpassword, salt);
  userpassword = hashPass;

  UserModel.create({
    name: username,
    lastname: userlastname,
    email: useremail,
    password: userpassword
  })
    .then(() => {
      res.redirect("/");
    })
    .catch(error => {
      console.log(error);
    });
});

/*Login*/
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  const theUseremail = req.body.email;
  const thePassword = req.body.password;
  if (theUseremail === "" || thePassword === "") {
    res.render("login", {
      errorMessage: "Please enter both, name and password to sign up."
    });
    return;
  }

  UserModel.findOne({ email: theUseremail })
    .then(dbRes => {
      if (!dbRes) {
        res.render("login", {
          errorMessage: "The username doesn't exist."
        });
        return;
      }
      if (bcrypt.compareSync(thePassword, dbRes.password)) {
        req.session.currentUser = dbRes;
        res.redirect("/collection");
      } else {
        res.render("login", {
          errorMessage: "Incorrect password"
        });
      }
    })
    .catch(error => {
      next(error);
    });
});

app.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    console.log("SESSION TERMINATED");
    res.redirect("/login");
  });
});

/* protected route */
// app.use((req, res, next) => {
//   if (req.session.currentUser) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// });

app.get("/prod-add", (req, res) => {
  res.render("products_add");
});
app.post("/prod-add", (req, res, next) => {
  console.log(req.body);
  // les const BDD = userdata
  const sneakermodelname = req.body.sneakermodelname;
  const sneakerref = req.body.sneakerref;
  const sneakersize = req.body.sneakersize;
  const sneakerdescr = req.body.sneakerdescr;
  const sneakerprice = req.body.sneakerprice;
  const sneakercategory = req.body.sneakercategory;
  const sneakertags = req.body.sneakertags;

  if (
    sneakermodelname === "" ||
    sneakerref === "" ||
    sneakersize === "" ||
    sneakerdescr === "" ||
    sneakerprice === "" ||
    sneakercategory === "" ||
    sneakertags === ""
  ) {
    res.render("products_add", {
      errorMessage: "Please fill in all the information to add the product."
    });
    return;
  }
  productModel
    .findOne({ sneakermodelname: sneakermodelname })
    .then(dbRes => {
      if (dbRes) {
        res.render("products_add", {
          errorMessage: "The product already exists"
        });
        return;
      }
    })
    .catch(error => {
      console.log(error);
    });

  productModel
    .create({
      modelname: sneakermodelname,
      ref: sneakerref,
      sizes: sneakersize,
      description: sneakerdescr,
      price: sneakerprice,
      category: sneakercategory,
      tags: sneakertags
    })
    .then(() => {
      res.redirect("/collection");
    })
    .catch(error => {
      console.log(error);
    });
});

app.get("/prod-manage", (req, res) => {
  productModel
    .find()
    .then(dbRes => {
      res.render("products_manage", { shoes: dbRes });
    })
    .catch(dbErr => {
      res.redirect("/prod-manage");
    });
});

//Step pour renvoyer la page
app.get("/product-edit/:id", (req, res) => {
  productModel
    .findById(req.params.id)
    .then(dbRes => {
      res.render("product_edit", { shoes: dbRes });
    })
    .catch(dbErr => {
      res.redirect("/products_manage");
    });
});

//Step pour modifier les éléments
app.post("/product-edit/:id", (req, res) => {
  const sneakermodelname = req.body.sneakermodelname;
  const sneakerref = req.body.sneakerref;
  const sneakersize = req.body.sneakersize;
  const sneakerdescr = req.body.sneakerdescr;
  const sneakerprice = req.body.sneakerprice;
  const sneakercategory = req.body.sneakercategory;
  const sneakertags = req.body.sneakertags;
  productModel
    .findByIdAndUpdate(req.params.id, {
      modelname: sneakermodelname,
      ref: sneakerref,
      sizes: sneakersize,
      description: sneakerdescr,
      price: sneakerprice,
      category: sneakercategory,
      tags: sneakertags
    })
    .then(dbRes => {
      res.redirect("/prod-manage");
    })
    .catch(dbErr => {
      res.render("product_edit", { errorMsg: "Invalid Value" });
    });
});

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log(`app started at ${process.env.SITE_URL}`);
});
