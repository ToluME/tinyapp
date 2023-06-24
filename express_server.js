const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // Set view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {// Middleware to pass username to views
  res.locals.username = req.cookies.username;
  next();
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  res.render("urls_new",{ username: username });
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],username: req.cookies["username"]  };
  res.render("urls_show", templateVars);
});
// Redirect shortURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});
// Route handler for handling POST requests to /urls and redirect
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  // Update the value of the stored long URL based on the new value
  urlDatabase[id] = newLongURL;

  res.redirect('/urls');
});
app.post("/urls/:id/delete", (req, res) => { //post request to handle delete and redirect
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
// app.get("/login", (req, res) => {
//   res.render("login", { username: req.cookies.username })
// });
app.post("/login", (req, res) => { //post request to handle login by username
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() { //generate random short URL ID
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  let randomString = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  
  return randomString;
};

generateRandomString();