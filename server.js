// Dependencies:
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
// var mongoose = require("mongoose");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var request = require("request");

var PORT = process.env.PORT || 3000;
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the index.html page in the public folder
app.use(express.static("public"));

// Database configuration
var databaseUrl = "mongoScraper";
var collections = ["scrapedLinks"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Routes:

// Get data from database
app.get("/all", function(req, res){
    db.scrapedLinks.find({}, function(err, data){
        // Send error if there is a problam, else return data
        if (err) console.log(err);
        else res.json(data);
    });
});

// Scrape site for news
app.get("/scrape", function(req, res){

    // Make request to IGN's home page
    request("https://news.ycombinator.com/", function(error, response, html){

        // Load HTML into a cheerio and save as variable 
        var $ = cheerio.load(html);

        // Have cheerio find each a tag with class "storylink" in the html 
        $("a.storylink").each(function(i, element){

            // Save the title and link of each story 
            var title = $(element).text();
            var link = $(element).attr("href");

            // If both were scraped successfully
            if (title && link) {
                // Insert into mongo database
                db.scrapedLinks.insert({
                    title: title, 
                    link: link
                },
                function(err) {
                    // Send error if there is a problam, else say it worked
                    if (err) res.send(err);
                    else res.send("it worked!");         
                });
            }
        });
    });
});



// Start the server
app.listen(PORT, function() {
    console.log("App running on port ", PORT);
});