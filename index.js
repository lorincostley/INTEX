const express = require("express");

let app = express();

let path = require("path");

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

const port = 3333;

app.use(express.urlencoded({ extended: true }));

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "cl10065038",
    database: "postgres",
    port: 5432,
  },
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  // res.sendFile(path.join(__dirname, "views", "login"));
  res.render("login");
});

app.get("/create_account", (req, res) => {
  res.render("create_account");
});

app.post("/process_create_account", async (req, res) => {
  try {
    // Extract username and password from the form data
    const username = req.body.username;
    const password = req.body.password;

    // Insert user data into the PostgreSQL database using Knex
    const result = await knex("users").returning("*").insert({
      username: username,
      password: password,
    });

    console.log("User created:", result[0]);

    // Redirect to fill_survey.ejs
    res.redirect("/fill_survey");
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Process login route
app.post("/process_login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Query the database for the user with the provided username
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length > 0) {
      // User found, check the password
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Passwords match, user is authenticated
        res.redirect("/admin_show_data"); // Redirect to the user_show_data.ejs page
      } else {
        // Passwords do not match
        res.render("login", { error: "Invalid username or password" });
      }
    } else {
      // User not found
      res.render("login", { error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// User show data page route
app.get("/user_show_data", (req, res) => {
  res.render("user_show_data"); // Assuming you have an EJS file named 'user_show_data.ejs'
});

// Fill survey page route
app.get("/fill_survey", (req, res) => {
  res.render("fill_survey"); // Assuming you have an EJS file named 'fill_survey.ejs'
});

app.listen(port, () => console.log("INTEX is listening"));
