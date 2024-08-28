const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const sqlite3 = require("sqlite3").verbose();
var bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Use express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layout"); // Default layout file

//Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session
app.use(session({
    secret: 'team81asp',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Database setup
global.db = new sqlite3.Database(path.join(__dirname, "database", "app.db"));

// Sample table creation
global.db.serialize(() => {
	global.db.run(
		"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)"
	);
});

// Import routes
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

// Use routes
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
