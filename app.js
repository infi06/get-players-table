const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM 
    cricket_team
    ORDER BY player_id;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(playersArray);
});
