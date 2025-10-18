import express from "express";
import mongoose from "mongoose";
import { Game } from "./db/Games.js";
import { User } from "./db/User.js";
import multer from "multer";
import path from "path";
import cors from "cors";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config()

const app = express();
const port = 4000;
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({ origin: "http://localhost:3000" }));


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

mongoose
  .connect(
  process.env.MONGO_STRING
  )
  .then(console.log("DB connected"))
  .catch((err) => console.log(err));

app.get("/allgames", async (req, res) => {
  const games = await Game.find({});
  res.json(games);
});

app.get("/gamefilter", async (req, res) => {
  try {
    const { genre, player, platform, features } = req.query;

    const filter = {};
    if (genre && genre !== "all") filter.genre = genre;
    if (player && player !== "all") filter.player = player;
    if (platform && platform !== "all") filter.platform = platform;
    if (features && features !== "all") filter.features = features;

    const filteredGames = await Game.find(filter);

    res.status(200).json(filteredGames);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});




app.post("/addgame", upload.single("img"), async (req, res) => {
  try {
    const newGame = new Game({
      title: req.body.title,
      desc: req.body.desc,
      genre: req.body.genre,
      player: req.body.player,
      platform: req.body.platform,
      features: req.body.features,
      img: req.file ? req.file.filename : null, 
    });

    await newGame.save();
    res.json(newGame);
    console.log("game saved");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/deletegame", async (req, res) => {
  try {
    const title = req.body.title;

    const deletedGame = await Game.findOneAndDelete({ title: title });

    if (!deletedGame) {
      return res.status(404).json({ message: "game not found" });
    }

    res.status(200).json({ message: "game deleted", deletedGame });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting game" });
  }
});

app.post("/save", async (req, res) => {
  try {
    const id = req.body.id;
    const save_game = await Game.findByIdAndUpdate(
      id,
      { saved: true },
      { new: true }
    );
    if (!save_game) {
      return res.status(404).json({ message: "game not found" });
    }
    res.status(200).json({ message: "game save", game: save_game });
  } catch (error) {
    console.error("Error saving game:", error);
    res
      .status(500)
      .json({ message: "Error saving game", error: error.message });
  }
});

app.post('/remove', async (req, res) => {
  try {
    const id = req.body.id;
    const updated = await Game.findByIdAndUpdate(id, { saved: false }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'game not found' });
    }

    res.status(200).json({ message: 'game removed from favorite', game: updated });
  } catch (error) {
    console.error('Error removing from saved:', error);
    res.status(500).json({ message: 'Error removing from saved', error: error.message });
  }
});


app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
