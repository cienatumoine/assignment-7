// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { db, Track } = require("./database/setup");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to parse :id
function parseId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id parameter" });
    return null;
  }
  return id;
}

// GET /api/tracks - Return all tracks
app.get("/api/tracks", async (req, res) => {
  try {
    const tracks = await Track.findAll();
    res.json(tracks);
  } catch (err) {
    console.error("Error fetching tracks:", err);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// GET /api/tracks/:id - Return track by id
app.get("/api/tracks/:id", async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  try {
    const track = await Track.findByPk(id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    res.json(track);
  } catch (err) {
    console.error("Error fetching track:", err);
    res.status(500).json({ error: "Failed to fetch track" });
  }
});

// POST /api/tracks - Create new track
app.post("/api/tracks", async (req, res) => {
  const {
    songTitle,
    artistName,
    albumName,
    genre,
    duration,
    releaseYear,
  } = req.body;

  // Required fields validation
  if (!songTitle || !artistName || !albumName || !genre) {
    return res.status(400).json({
      error:
        "songTitle, artistName, albumName, and genre are required fields",
    });
  }

  try {
    const newTrack = await Track.create({
      songTitle,
      artistName,
      albumName,
      genre,
      duration,
      releaseYear,
    });

    res.status(201).json(newTrack);
  } catch (err) {
    console.error("Error creating track:", err);
    res.status(500).json({ error: "Failed to create track" });
  }
});

// PUT /api/tracks/:id - Update existing track
app.put("/api/tracks/:id", async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  try {
    const track = await Track.findByPk(id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    const {
      songTitle,
      artistName,
      albumName,
      genre,
      duration,
      releaseYear,
    } = req.body;

    await track.update({
      songTitle: songTitle ?? track.songTitle,
      artistName: artistName ?? track.artistName,
      albumName: albumName ?? track.albumName,
      genre: genre ?? track.genre,
      duration: duration ?? track.duration,
      releaseYear: releaseYear ?? track.releaseYear,
    });

    res.json(track);
  } catch (err) {
    console.error("Error updating track:", err);
    res.status(500).json({ error: "Failed to update track" });
  }
});

// DELETE /api/tracks/:id - Delete track
app.delete("/api/tracks/:id", async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  try {
    const deletedCount = await Track.destroy({
      where: { trackId: id },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Track not found" });
    }

    res.json({ message: `Track ${id} deleted` });
  } catch (err) {
    console.error("Error deleting track:", err);
    res.status(500).json({ error: "Failed to delete track" });
  }
});

// Start server only after DB connection works
async function startServer() {
  try {
    await db.authenticate();
    console.log("API connected to database");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();