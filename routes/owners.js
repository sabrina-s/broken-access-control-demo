const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");

const profileAuth = (req, res, next) => {
  try {
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);

    if (req.user.name !== req.params.firstName) {
      res.status(401).end("You are not authorised.");
    }

    next();
  } catch (error) {
    res.status(401).end("Access denied.");
  }
}

router.get("/:firstName", profileAuth, async (req, res, next) => {
  try {
    const firstName = req.params.firstName;
    const regex = new RegExp(firstName, "gi");
    const owners = await Owner.find({username: regex});
    res.send(owners);
  } catch (err) {
    next(err);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const owner = new Owner(req.body);
    await Owner.init();
    const newOwner = await owner.save();
    res.send(newOwner);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
});

router.post("/login", async (req, res, next) => {
  try {
    const {username, password} = req.body;
    const owner = await Owner.findOne({username});
    const bcrypt = require("bcryptjs");
    const result = await bcrypt.compare(password, owner.password);

    if (!result) {
      throw new Error("Login failed");
    }

    const payload = {name: owner.username};
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = oneDay * 7;
    const expiryDate = new Date(Date.now() + oneWeek);

    res.cookie("token", token, {
      expires: expiryDate,
      httpOnly: true
    });

    res.send("You are now logged in!");
  } catch (err) {
    if (err.message === "Login failed") {
      err.status = 400;
    }
    next(err);
  }
});

module.exports = router;
