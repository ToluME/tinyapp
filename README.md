# TinyApp Project

TinyApp is a full stack simple web multipage app built with Node.js and Express framework that allows users to shorten long URLs (à la bit.ly). The app will allow users to shorten long URLs much like TinyURL.com and bit.ly do.

## Product Features
* Create shortened URLs for long URLs
* Store the mapping of shortened URLs to their corresponding long URLs
* View and manage the list of created URLs (CRUD)
* Redirect users to the original long URL when accessing the shortened URL
* Reacts appropriately to the user's logged-in state
* User authentication protection


## Dependencies:
* Node.js - JavaScript runtime environment
* Express - Web framework for Node.js
* EJS - Embedded JavaScript templating
* cookie-session - Cookie management middleware
* bcryptjs - Password protection

## Getting Started

* Install all dependencies (using the `npm install` command).
* Run the development web server using the `node express_server.js` command.

## Usage:
* Open your web browser and access the application at http://localhost:8080.
* Login with email and password or register with email and password.
* After logging in, you will be able to create shortened URLs for long URLs.
* Manage your URLs by viewing, editing, or deleting them.
* Access the shortened URLs to be redirected to the original long URLs.

Acknowledgements:
This project was created as part of Lighthouse Labs Web Development Bootcamp.




