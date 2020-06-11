const express = require("express");
const router = express.Router();
const Kitten = require("../models/Kitten");

router.get("/", async (req, res, next) => {
  try {
    const kittens = await Kitten.find(req.query);
    res.send(kittens);
  } catch (err) {
    next(err);
  }
});

router.get("/:name", async (req, res, next) => {
  try {
    const name = req.params.name;
    const regex = new RegExp(name, "gi");
    const kittens = await Kitten.find({name: regex});
    res.send(kittens);
  } catch (err) {
    next(err);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const kitten = new Kitten(req.body);
    await Kitten.init();
    const kittens = await kitten.save();
    res.send(kittens);
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      err.status = 400;
    }
    next(err);
  }
});

router.put("/:name", async (req, res) => {
  const name = req.params.name;
  const newKitten = req.body;
  const kitten = await Kitten.findOneAndReplace({name}, newKitten, {
    new: true
  });
  res.send(kitten);
});

router.patch("/:name", async (req, res) => {
  const name = req.params.name;
  const updatedKitten = req.body;
  const kitten = await Kitten.findOneAndUpdate({name}, updatedKitten, {
    new: true
  });
  res.send(kitten);
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    await Kitten.findByIdAndDelete(id);
    res.send();
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

module.exports = router;
