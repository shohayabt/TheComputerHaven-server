const express = require("express");
const app = express();
const cros = require("cors");
const port = process.env.PORT || 5000;

app.use(cros());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HELLO WORLD FROM NODE JS || EXPRESS");
});

app.listen(port, () => {
  console.log("CRUD SERVER IS RUNNING ");
});
