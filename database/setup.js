// database/setup.js

const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// create db connection
const db = new Sequelize({
  dialect: "sqlite",
  storage: `database/${process.env.DB_NAME}` || "database/music_library.db",
  logging: console.log, // shows generated SQL
});

// define Track model
const Track = db.define(
  "Track",
  {
    trackId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    songTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artistName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    albumName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true, // in seconds
    },
    releaseYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "tracks",
    timestamps: false,
  }
);

// async setup function
async function setupDatabase() {
  try {
    await db.authenticate();
    console.log("Connected to database");

    // force: true for dev so schema resets when you change model
    await db.sync({ force: true });
    console.log("Database and tables created");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await db.close();
    console.log("Database connection closed");
  }
}

// run setup only if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

// export db + models for other files
module.exports = { db, Track };