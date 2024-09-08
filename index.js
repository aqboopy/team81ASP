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

//Added by Rachel Chin
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
//End

// Middleware to make userdata available in all views
app.use((req, res, next) => {
	res.locals.userdata = req.session.userdata;
	next();
});

app.use(express.json());

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
//Added by Rachel Chin
// Serve static files in the Img folder
app.use('/img', express.static(path.join(__dirname, 'img')));
//end

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

					// Create tables if they do not exist
					global.db.serialize(() => {
						global.db.run(
							"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, password TEXT, points INTEGER DEFAULT 0)"
						);
						// Added by Rachel Chin
						global.db.run(
							`CREATE TABLE IF NOT EXISTS products 
							(id INTEGER PRIMARY KEY AUTOINCREMENT, 
							name TEXT, 
							category TEXT, 
							price INTEGER, 
							description TEXT, 
							image BLOB, 
							image_type TEXT, 
							date_listed TIMESTAMP, 
							user_id INTEGER,
							FOREIGN KEY (user_id) REFERENCES users(id))`
						);

						// Creating the likes table by nurleena
						global.db.run(
							`CREATE TABLE IF NOT EXISTS likes (
								id INTEGER PRIMARY KEY AUTOINCREMENT, 
								user_id INTEGER, 
								product_id INTEGER, 
								FOREIGN KEY (user_id) REFERENCES users(id), 
								FOREIGN KEY (product_id) REFERENCES products(id),
								UNIQUE(user_id, product_id) -- Ensure a user can only like a product once
							)`
						);

						// Temporary table and migration logic for likes
						global.db.run(
							`CREATE TABLE IF NOT EXISTS likes_temp 
							(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, product_id INTEGER, 
							FOREIGN KEY (user_id) REFERENCES users(id), 
							FOREIGN KEY (product_id) REFERENCES products(id))`
						);

						global.db.run(
							`INSERT INTO likes_temp (id, user_id, product_id)
							SELECT id, user_id, product_id FROM likes`
						);

						global.db.run("DROP TABLE likes");
						global.db.run("ALTER TABLE likes_temp RENAME TO likes");

						// Creating cart table by nurleena
						global.db.run(
							`CREATE TABLE IF NOT EXISTS cart (
								id INTEGER PRIMARY KEY AUTOINCREMENT,
								user_id INTEGER,
								product_id INTEGER,
								quantity INTEGER,
								FOREIGN KEY (user_id) REFERENCES users(id),
								FOREIGN KEY (product_id) REFERENCES products(id)
							)`
						);

						// Creating reviews table
						global.db.run(
							`CREATE TABLE IF NOT EXISTS reviews (
								id INTEGER PRIMARY KEY AUTOINCREMENT,
								product_id INTEGER,
								user_id INTEGER,
								rating INTEGER CHECK(rating >= 1 AND rating <= 5),
								title TEXT,
								content TEXT,
								date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
								FOREIGN KEY (product_id) REFERENCES products(id),
								FOREIGN KEY (user_id) REFERENCES users(id)
							)`
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
const retrievePasswordRouter = require("./routes/retrievePassword");
//Added by Rachel Chin
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const sellRouter = require("./routes/sell");
const profileRouter = require("./routes/profile");
const marketRouter = require("./routes/market");
//End
const logoutRouter = require("./routes/logout");
// added by Nurleena Muhammad Hilmi
const likeRouter = require("./routes/likes");
const cartRouter = require("./routes/cart");
//end
const reportRouter = require("./routes/report");
const contactRouter = require("./routes/contact");
const faqRouter = require("./routes/faq");

// Use routes
app.use("/", indexRouter);
app.use("/retrievePassword", retrievePasswordRouter);
//Added by Rachel Chin
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/sell", sellRouter);
app.use("/profile", profileRouter);
app.use("/market", marketRouter);
//End
app.use("/logout", logoutRouter);
app.use("/report", reportRouter);
app.use("/contact", contactRouter);
app.use("/faq", faqRouter);
// added by Nurleena Muhammad Hilmi
app.use("/likes", likeRouter);
app.use("/cart", cartRouter);
//end

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
