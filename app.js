const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
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
//convert camelcase

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get players API
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM 
    cricket_team
    ORDER BY player_id;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//post player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO 
     cricket_team(player_name, jersey_number, role)
  VALUES (
      '${playerName}', ${jerseyNumber}, '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  console.log(dbResponse);
  response.send("Player Added to team");
});

//get playerId API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM 
    cricket_team
    WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//update player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    
    WHERE 
      player_id = ${playerId};`;
  const player = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE 
      player_id = ${playerId};`;
  const player = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
