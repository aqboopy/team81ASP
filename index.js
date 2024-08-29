const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Use express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layout"); // Default layout file

// Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session
app.use(
	session({
		secret: "team81asp", // Replace with environment variable in production
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Set to true in production with HTTPS
	})
);

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Database setup
global.db = new sqlite3.Database(
	path.join(__dirname, "database", "app.db"),
	(err) => {
		if (err) {
			console.error("Database connection failed:", err.message);
		} else {
			console.log("Connected to the SQLite database.");

			// Enable foreign key constraints
			global.db.run("PRAGMA foreign_keys = ON", (err) => {
				if (err) {
					console.error(
						"Failed to enable foreign key constraints:",
						err.message
					);
				} else {
					console.log("Foreign key constraints enabled.");

					// Sample table creation
					global.db.serialize(() => {
						global.db.run(
							"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)"
							
						);
						global.db.run(
							`CREATE TABLE IF NOT EXISTS products 
							(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT, price INTEGER,
							description TEXT, image BLOB, image_type TEXT, date_listed TIMESTAMP, user_id INTEGER,
							FOREIGN KEY (user_id) REFERENCES users(id))`
						);
					});
				}
			});
		}
	}
);

// Set up nodemailer transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "aspteam81@gmail.com",
		pass: "AspT@81?",
	},
});

// Import routes
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const retrievePasswordRouter = require("./routes/retrievePassword"); // Add the retrievePassword route
const marketRouter = require("./routes/market");
const profileRouter = require("./routes/profile");

// Use routes
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/retrievePassword", retrievePasswordRouter); // Use the retrievePassword route
app.use("/market",marketRouter);
app.use("/profile",profileRouter);


// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
