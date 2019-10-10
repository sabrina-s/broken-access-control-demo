const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const Kitten = require("../models/Kitten");
const {MongoMemoryServer} = require("mongodb-memory-server");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

describe("kittens", () => {
  let mongoServer;
  beforeAll(async () => {
    try {
      mongoServer = new MongoMemoryServer();
      const mongoUri = await mongoServer.getConnectionString();
      await mongoose.connect(mongoUri);
    } catch (err) {
      console.error(err);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const kittens = [
      {name: "Fluffy", age: 5, sex: "male"},
      {name: "Muffin", age: 3, sex: "female"},
      {name: "Waffle", age: 7, sex: "female"}
    ];
    await Kitten.create(kittens);
  });

  afterEach(async () => {
    await Kitten.remove();
  });

  describe("[GET] /kittens", () => {
    it("gets all kittens", async () => {
      const expectedKittens = [
        {name: "fluffy", age: 5, sex: "male"},
        {name: "muffin", age: 3, sex: "female"},
        {name: "waffle", age: 7, sex: "female"}
      ];

      const {body: actualKittens} = await request(app)
        .get("/kittens")
        .expect(200);

      expectedKittens.forEach((kitten, index) => {
        expect(actualKittens[index]).toEqual(expect.objectContaining(kitten));
      });
    });
  });

  describe("[POST] /kittens/new", () => {
    it("adds a new kitten", async () => {
      const expectedKittens = [
        {name: "fluffy", age: 5, sex: "male"},
        {name: "muffin", age: 3, sex: "female"},
        {name: "waffle", age: 7, sex: "female"},
        {name: "minty", age: 3, sex: "female"}
      ];

      await request(app)
        .post("/kittens/new")
        .send({name: "Minty", age: 3, sex: "female"})
        .expect(200);

      const {body: kittens} = await request(app)
        .get("/kittens")
        .expect(200);

      kittens.forEach((kitten, index) => {
        expect(kitten).toEqual(expect.objectContaining(expectedKittens[index]));
      });
    });
  });

  describe("[PUT] /kittens/:name", () => {
    it("updates a kitten", () => {});
  });

  describe("[DELETE] /kittens/:name", () => {
    it("removes a kitten", () => {});
  });
});
