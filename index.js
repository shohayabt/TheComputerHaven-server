const express = require("express");
const app = express();
const cros = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cros());
const jwt = require("jsonwebtoken");
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASS}@cluster0.grtxn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// VERIFY TOKEN
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ info: "invalid user" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ info: "invalid user" });
    }
    req.decoded = decoded;
    next();
  });
};
const run = async () => {
  try {
    await client.connect();
    const userCollection = client.db("userCollection").collection("user");
    const componentCollection = client
      .db("componentCollection")
      .collection("component");
    // GET PRODUCTS FROM DATABASE
    app.get("/product", async (request, response) => {
      const query = {};
      const cursor = componentCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });
    // UPDATE USER INFORMATION
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: 60 * 60,
      });
      res.send({ result, accessToken: token });
    });
    // POST DATA TO DATA BASE
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await componentCollection.insertOne(products);
      res.send(result);
    });
  } finally {
  }
};

run().catch(console.dir);
app.get("/", verifyJWT, (req, res) => {
  res.send("HELLO WORLD FROM NODE JS || EXPRESS");
});

app.listen(port, () => {
  console.log("CRUD SERVER IS RUNNING ");
});
