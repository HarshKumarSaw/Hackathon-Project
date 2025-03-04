const express = require("express");
const cors = require("cors");
const { Low, JSONFile } = require("lowdb");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure shipments.json exists
const dbFile = "shipments.json";
if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ shipments: [] }, null, 2));
}

const db = new Low(new JSONFile(dbFile));
async function initializeDB() {
    await db.read();
    db.data ||= { shipments: [] };
    await db.write();
}
initializeDB();

app.use(express.json());
app.use(cors());

// API Route to Get Shipment History
app.get("/api/shipments", async (req, res) => {
    await db.read();
    res.json(db.data.shipments || []);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
