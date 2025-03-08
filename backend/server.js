const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "b4f82e9c3d7a58b1d2e4c6f9a0b3d5e7f1a2c4d6e8b0f3a5c7d9e1b4f6a8c2d";

const express = require("express");
const cors = require("cors");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 10000;

// 🔹 Middleware: Optional Token Authentication
function optionalAuth(req, res, next) {
    const token = req.header("Authorization");

    if (token) {
        try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
            req.user = decoded; // Attach user data
        } catch (error) {
            return res.status(401).json({ message: "⚠️ Invalid or expired token." });
        }
    }

    next(); // Continue even if no token
}

// Define database file path
const dbFilePath = path.join(__dirname, "shipments.json");

// Ensure shipments.json exists
if (!fs.existsSync(dbFilePath)) {
    console.log("Creating shipments.json...");
    fs.writeFileSync(dbFilePath, JSON.stringify({ shipments: [] }, null, 2));
}

// Set up database
const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter);
async function initializeDB() {
    await db.read();
    db.data ||= { shipments: [] };
    await db.write();
}
initializeDB();

// Define users database file path
const usersFilePath = path.join(__dirname, "users.json");

// Ensure users.json exists
if (!fs.existsSync(usersFilePath)) {
    console.log("Creating users.json...");
    fs.writeFileSync(usersFilePath, JSON.stringify({ users: [] }, null, 2));
}

// Set up Users Database
const usersAdapter = new JSONFile(usersFilePath);
const usersDB = new Low(usersAdapter);

async function initializeUsersDB() {
    await usersDB.read();
    usersDB.data ||= { users: [] };
    await usersDB.write();
}
initializeUsersDB();

app.use(express.json());

app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded invoices publicly

// Multer Setup for Invoice Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir); // Create uploads folder if missing
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 📂 Multer Setup for CSV Uploads (Separate from Invoice Uploads)
const csvUpload = multer({ dest: "uploads/csv/" });


// 🚫 Compliance Checking Function (Blocks Restricted Shipments)
function checkCompliance(productName, category, destination, weight) {
    let issues = [];

    const restrictedCountries = ["north korea", "pakistan", "iran", "afghanistan", "iraq", "syria", 
    "yemen", "sudan", "cuba", "venezuela", "russia", "belarus", "eritrea", 
    "libya", "congo", "myanmar"];
    if (restrictedCountries.includes(destination.toLowerCase())) {
        issues.push("Shipping to this country is restricted.");
    }

    const prohibitedCategories = ["arms & ammunition",
    "Chemical & Pharmaceutical Products",
    "Live Animals & Animal Products",
    "Art, Collectibles, & Antiques"];
    if (prohibitedCategories.includes(category.toLowerCase())) {
        issues.push(`"${category}" is a prohibited item and cannot be shipped.`);
    }

    return issues;
}

// API Route to Submit a Shipment with Invoice Upload
app.post("/api/submit-shipment", optionalAuth, upload.single("invoice"), async (req, res) => {
    const { productName, category, destination, weight } = req.body;
    const user = req.user ? req.user.email : "Guest"; // Store user email or mark as "Guest"
    const invoicePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // 🚫 Check Compliance Before Saving
    const complianceIssues = checkCompliance(productName, category, destination, weight);
    if (complianceIssues.length > 0) {
        return res.status(400).json({ message: "⚠️ Compliance Issues Found", issues: complianceIssues });
    }

    // ✅ Save Shipment Only If Compliant
    const shipment = {
        user,
        productName,
        category,
        destination,
        weight,
        invoice: invoicePath,
        date: new Date().toISOString()
    };

    db.data.shipments.push(shipment);
    await db.write();

    res.json({ message: "✅ Shipment saved successfully!", shipment });
});

// API Route to Get Shipment History
app.get("/api/shipments", optionalAuth, async (req, res) => {
    await db.read();
    
    if (req.user) {
        // If user is logged in, show only their shipments
        const userShipments = db.data.shipments.filter(shipment => shipment.user === req.user.email);
        res.json(userShipments);
    } else {
        // If not logged in, show all shipments
        res.json(db.data.shipments || []);
    }
});

// API Route: User Signup
app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;

    // ❌ Validate Inputs
    if (!email || !password) {
        return res.status(400).json({ message: "⚠️ Email and password are required." });
    }

    await usersDB.read(); // Load user data

    // ❌ Check if User Already Exists
    if (usersDB.data.users.some(user => user.email === email)) {
        return res.status(400).json({ message: "⚠️ User already exists. Please login." });
    }

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save User to Database
    usersDB.data.users.push({ email, password: hashedPassword });
    await usersDB.write();

    res.json({ message: "✅ Signup successful! Please login." });
});

// 🔹 API Route: User Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    // ❌ Validate Inputs
    if (!email || !password) {
        return res.status(400).json({ message: "⚠️ Email and password are required." });
    }

    await usersDB.read(); // Load user data

    // ❌ Check if User Exists
    const user = usersDB.data.users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: "⚠️ User not found. Please sign up first." });
    }

    // ❌ Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "⚠️ Incorrect password." });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });

    res.json({ message: "✅ Login successful!", token });
});

// 📂 API Route: Upload and Process CSV File
app.post("/api/upload-csv", csvUpload.single("csv"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "⚠️ No file uploaded. Please upload a valid CSV file." });
    }

    const filePath = path.join(__dirname, req.file.path);

    try {
        const csvData = fs.readFileSync(filePath, "utf-8");
        const rows = csvData.split("\n").map(row => row.split(","));
        
        // Extract header and data
        const headers = rows[0].map(header => header.trim());
        const shipments = rows.slice(1).map(row => {
            let shipment = {};
            row.forEach((value, index) => {
                shipment[headers[index]] = value.trim();
            });
            return shipment;
        });

        // Validate and Save Shipments
        await db.read();
        shipments.forEach(shipment => {
            if (shipment.productName && shipment.category && shipment.destination && shipment.weight) {
                db.data.shipments.push({
                    ...shipment,
                    date: new Date().toISOString(),
                });
            }
        });
        await db.write();

        // Cleanup: Delete uploaded CSV file
        fs.unlinkSync(filePath);

        res.json({ message: `✅ ${shipments.length} shipments uploaded successfully!` });
    } catch (error) {
        console.error("CSV Processing Error:", error);
        res.status(500).json({ message: "❌ Error processing CSV file." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 📦 Serve Tariff Data API
const tariffFilePath = path.join(__dirname, "tariff_data.json");

// Ensure tariff_data.json exists
if (!fs.existsSync(tariffFilePath)) {
    console.log("Error: tariff_data.json not found!");
} else {
    app.get("/api/tariffs", (req, res) => {
        res.sendFile(tariffFilePath);
    });
}
