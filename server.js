// ---Dependencies---

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");


// ---Config Middleware---

var PORT = process.env.PORT || 3000;
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the index.html page in the public folder
app.use(express.static("public"));

// Require mongoose models
var db = require("./models");
// Save Connection as variable so that it can be used on heroku
var connectdb = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";
// Connect to the Mongo DB
mongoose.connect(connectdb, function(){
    if (err) console.log(err);
    else console.log("Connected to db");
});


// ---Routes---

// Return all data from database
app.get("/articles", function(req, res){

  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {res.json(dbArticle)})
    .catch(function(err) {res.json(err)});
});

// Route to populate an article with it's note
app.get("/articles/:id", function(req, res) {
    
    db.Article.findOne({ _id: req.params.id })
      // Populate all of the notes associated with the selected article
      .populate("note")
      .then(function(dbArticle) {res.json(dbArticle)})
      .catch(function(err) {res.json(err)});
  });
  
  // Route for saving/updating an article's note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {res.json(dbArticle)})
      .catch(function(err) {res.json(err)});
  });

// Scrape site for news
app.get("/scrape", function(req, res){

    // Make request to IGN's home page
    request("https://news.ycombinator.com/", function(error, response, html){

        // Load HTML into a cheerio and save as variable 
        var $ = cheerio.load(html);

        // Have cheerio find each a tag with class "storylink" in the html 
        $("a.storylink").each(function(i, element){

            // Create empty object
            var result = {};

            // Save the title and link of each story to the result object
            result.title = $(this).text();
            result.link = $(this).attr("href");

            // Create new Article and push it to the database
            db.Article.create(result)
            .then(function(dbArticle) {console.log(dbArticle)})
            .catch(function(err) {return res.json(err)});
        });
        // return user to home page
        res.send("Done!");
    });
});


// ---Start the server---
app.listen(PORT, function() {
    console.log("App running on port ", PORT);
});