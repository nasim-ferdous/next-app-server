require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4000;
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "myproducts";

let productsCol;

async function start() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  productsCol = db.collection("products");

  // seed if empty
  const cnt = await productsCol.countDocuments();
  if (cnt === 0) {
    await productsCol.insertMany([
      {
        title: "Sample A",
        short: "Short A",
        description: "Full A",
        price: 10,
        image: "",
      },
      {
        title: "Sample B",
        short: "Short B",
        description: "Full B",
        price: 20,
        image: "",
      },
      {
        title: "Sample C",
        short: "Short C",
        description: "Full C",
        price: 30,
        image: "",
      },
      {
        title: "Sample D",
        short: "Short D",
        description: "Full D",
        price: 40,
        image: "",
      },
      {
        title: "Sample E",
        short: "Short E",
        description: "Full E",
        price: 50,
        image: "",
      },
      {
        title: "Sample F",
        short: "Short F",
        description: "Full F",
        price: 60,
        image: "",
      },
    ]);
  }

  app.get("/products", async (req, res) => {
    const docs = await productsCol.find().toArray();
    res.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
  });

  app.get("/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const doc = await productsCol.findOne({ _id: new ObjectId(id) });
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json({ ...doc, _id: doc._id.toString() });
    } catch {
      res.status(400).json({ message: "Invalid id" });
    }
  });

  app.post("/products", async (req, res) => {
    const b = req.body;
    const toInsert = {
      title: b.title || "Untitled",
      short: b.short || "",
      description: b.description || "",
      price: b.price ? Number(b.price) : 0,
      image: b.image || "",
      createdAt: new Date(),
    };
    const r = await productsCol.insertOne(toInsert);
    res.status(201).json({ ...toInsert, _id: r.insertedId.toString() });
  });

  app.delete("/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await productsCol.deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch {
      res.status(400).json({ message: "Invalid id" });
    }
  });

  app.listen(port, () =>
    console.log(`Backend running on http://localhost:${port}`)
  );
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
