const express = require("express");
const app = express();
const cros = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const reviewCollection = client.db("reviewCollection").collection("review");
    // GET PRODUCTS FROM DATABASE
    app.get("/product", async (request, response) => {
      const query = {};
      const cursor = componentCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });
    // GET ALL USERS
    app.get("/users", async (request, response) => {
      const query = {};
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });
    // GET ALL REVIEWS
    app.get("/review", async (request, response) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      response.send(result);
    });
    // SIGNUP WITH JWT TOKEN
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
    // UPDATE USER
    app.put("/updateUser/:email", async (req, res) => {
      const email = req.params.email;
      const updateUser = req.body;
      const query = { email: email };
      const options = { upsert: false };
      const updatedDoc = {
        $set: updateUser,
      };
      const result = await userCollection.updateOne(query, updatedDoc, options);
      res.send(result);
    });
    // POST DATA TO DATA BASE
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await componentCollection.insertOne(products);
      res.send(result);
    });
    // MAKE ADMIN
    app.put("/makeAdmin/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.isAdmin === true) {
        const options = { upsert: false };
        const updatedDoc = {
          $set: { isAdmin: true },
        };
        const result = await userCollection.updateOne(
          query,
          updatedDoc,
          options
        );
        res.send(result);
      } else {
        res.status(403).send({ info: "you have no permission to make admin" });
      }
    });
    // POST REVIEWS TO DATA BASE
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
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
