const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdzlhd7.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("relate-hub");
    const contactCollection = database.collection("contacts");
    // const userCollection = client.db("usersDB").collection("users");

    app.post("/contacts", async (req, res) => {
      const data = req.body;
      const result = await contactCollection.insertOne(data);
      res.send(result);
      console.log(result);
    });
    app.get("/contacts", async (req, res) => {
      const result = await contactCollection.find().toArray();
      res.send(result);
    });
    app.get("/contacts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contactCollection.findOne(query);
      res.send(result);
    });
    app.delete("/deleteContact/:id", async (req, res) => {
      const id = req.params.id;
      const result = await contactCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.put("/contacts/:id", async (req, res) => {
      const id = req.params.id;

      const data = req.body;
      const result = await contactCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            photoURL: data.photoURL,
          },
        },
        {
          upsert: true,
        }
      );
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SIMPLE CRUD IS RUNNING WELL");
});

app.listen(port, () => {
  console.log(`simple crud is running in port :${port}`);
});
