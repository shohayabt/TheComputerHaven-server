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
const run = async () => {
  try {
    await client.connect();
    const userCollection = client.db("userCollection").collection("user");
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
  } finally {
  }
};

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("HELLO WORLD FROM NODE JS || EXPRESS");
});

app.listen(port, () => {
  console.log("CRUD SERVER IS RUNNING ");
});
