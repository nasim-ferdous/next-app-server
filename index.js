require("dotenv").config();
const express = require("express");
require("dotenv").config();
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
        title: "Wireless Bluetooth Headphones",
        short: "Comfortable wireless headphones with deep bass",
        description:
          "These wireless Bluetooth headphones offer immersive sound quality, deep bass, and 20-hour battery life. Designed for comfort with soft ear cushions and adjustable headband.",
        price: 49.99,
        image: "https://i.ibb.co/GpYfPrV/headphone.jpg",
        createdAt: { $date: "2025-01-01T10:00:00Z" },
      },
      {
        title: "Smart Fitness Watch",
        short: "Track your health and daily activities",
        description:
          "A lightweight fitness watch with heart rate monitoring, sleep tracking, step counter, and smart notifications. Water-resistant design suitable for daily use.",
        price: 79.0,
        image: "https://i.ibb.co/fMKKm95/watch.jpg",
        createdAt: { $date: "2025-01-02T11:30:00Z" },
      },
      {
        title: "Portable Mini Speaker",
        short: "Small size, powerful sound",
        description:
          "This portable mini speaker delivers surprisingly loud and clear audio. Includes Bluetooth 5.0, 8-hour battery life, and a waterproof body.",
        price: 25.5,
        image: "https://i.ibb.co/ykLb2Rq/speaker.jpg",
        createdAt: { $date: "2025-01-03T15:45:00Z" },
      },
      {
        title: "Eco-friendly Water Bottle",
        short: "Reusable BPA-free bottle for daily use",
        description:
          "Designed with durability and sustainability in mind, this BPA-free water bottle keeps drinks cool for hours. Perfect for gym, office, and travel.",
        price: 12.99,
        image: "https://i.ibb.co/N1m7D1Q/bottle.jpg",
        createdAt: { $date: "2025-01-04T09:15:00Z" },
      },
      {
        title: "Modern Desk Lamp",
        short: "LED desk lamp with adjustable brightness",
        description:
          "A sleek and modern LED desk lamp featuring adjustable brightness levels, touch control, and an energy-efficient design. Ideal for study or office.",
        price: 29.0,
        image: "https://i.ibb.co/SKdCTR0/lamp.jpg",
        createdAt: { $date: "2025-01-05T18:20:00Z" },
      },
      {
        title: "USB-C Fast Charger",
        short: "20W fast charging adapter",
        description:
          "Compact and powerful 20W USB-C fast charger compatible with most smartphones and tablets. Built-in safety features to protect against overheating.",
        price: 15.0,
        image: "https://i.ibb.co/m9z1VW1/charger.jpg",
        createdAt: { $date: "2025-01-06T14:55:00Z" },
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
