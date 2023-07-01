const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs"); // Set view engine

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "zSA9rT",
  },
  s9m5xK: {
    longURL: "http://www.google.com",
    userID: "RdEYCL",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  let randomString = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  
  return randomString;
};
const getUserByEmail = function(email) {
  const usersArray = Object.values(users);//converts users object to an array
  for (let user of usersArray) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
const urlsForUser = function(id) {
  const userURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLs[key] = urlDatabase[key].longURL;
    }
  }
  return userURLs;
};

app.use(express.urlencoded({ extended: true }));

//Cookie-session middleware
app.use(cookieSession({
  name:'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));
//Middleware to pass user to views
app.use((req, res, next) => {
  res.locals.user = users[req.session.user_id];
  next();
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("You need to log in to access this page.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // Check if user is logged in
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = req.session.user_id;
  res.render("urls_new", { user: user });
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  const templatevars = {
    user: user,
    id: id,
    longURL: urlEntry.longURL,
  };
  if (!user) {
    // User is not logged in
    return res.status(401).send("You need to log in to access this page.");
  }
  
  if (!urlEntry) {
    // URL does not exist
    return res.status(404).send("No URL with the provided id in our database.");
  }
  if (urlEntry.userID !== userId) {
    // User does not own the URL
    return res.status(403).send("You are not authorized to access this URL.");
  }
  res.render("urls_show", templatevars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  if (!urlEntry || !urlEntry.longURL) {
    // Shortened URL does not exist
    return res.status(404).send("No URL with provided id in our database.");
  }
  res.redirect(urlEntry.longURL);
});

app.post("/urls", (req, res) => {
  // Check if user is logged in
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send("Login required");
  }
  const id = generateRandomString();
  const longURL = req.body.longURL;
 
  urlDatabase[id] = {
    longURL: longURL,
    userID: userId
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  const userId = req.session.user_id;
  const user = users[userId];

  if (!urlEntry) {
    // URL ID does not exist
    return res.status(404).send("No URL with the provided id in our database.");
  }
  if (!user) {
    // User is not logged in
    return res.status(401).send("You need to log in to modify this URL.");
  }
  if (urlEntry.userID !== userId) {
    // User does not own the URL
    return res.status(403).send("You are not authorized to modify this URL.");
  }
  const newLongURL = req.body.longURL;
  urlEntry.longURL = newLongURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  const userId = req.session.user_id;
  const user = users[userId];
  if (!urlEntry) {
    // URL ID does not exist
    return res.status(404).send("No URL with the provided id in our database.");
  }
  if (!user) {
    // User is not logged in
    return res.status(401).send("You need to log in to delete this URL.");
  }
  if (urlEntry.userID !== userId) {
    // User does not own the URL
    return res.status(403).send("You are not authorized to delete this URL.");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  //Check if user is already logged in
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("registration");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  // User not found or password doesn't match
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  // Empty email or password
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty..");
  } else if (getUserByEmail(email)) {
    // Email already exists
    return res.status(400).send("Email is already registered.");
  } else {
    // Generate User_id and create new user
    users[userId] = {
      id: userId,
      email,
      password: hashedPassword,
    };

    req.session.user_id = userId;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
