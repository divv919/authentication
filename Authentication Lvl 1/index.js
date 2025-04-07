import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const client = new pg.Client({
  user: "postgres",
  password: "2322004",
  database: "secrets",
  port: 5432,
  host: "localhost",
});

await client.connect();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    await client.query("INSERT INTO users (email,password) VALUES ($1,$2)", [
      username,
      password,
    ]);
    res.status(200).render("secrets.ejs");
  } catch (err) {
    console.error("Error registering user : ", err);
    res.status(500).render("register.ejs");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const checkUser = client.query("SELECT * FROM users WHERE email = $1", [
      username,
    ]);
    if (checkUser > 0) {
      const result = await client.query(
        `SELECT * FROM users WHERE  password = $1`,
        [password]
      );
      if (result.rows.length < 1) {
        res.render("login.ejs");
        return;
      }
      res.render("secrets.ejs");
    } else {
      res.send("User does not exist");
    }
  } catch (err) {
    console.error("Error logging in : ", err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
