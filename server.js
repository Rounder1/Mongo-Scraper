// Dependencies:
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
// var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

var PORT = process.env.PORT || 3000;
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
//app.use(express.static("public"));


// Routes:

// Send user to home page
app.get("/", function(req, res){
    res.send("Site is live");
});

// Scrape site for news
app.get("/scrape", function(req, res){

    // Make request to IGN's home page
    request("https://news.ycombinator.com/", function(error, response, html){

        // Load HTML into a cheerio and save as variable 
        var $ = cheerio.load(html);
        // Empty array to store scraped data
        var results = [];

        // Have cheerio find each a tag with class "storylink" in the html 
        $("a.storylink").each(function(i, element){

            // Save the title and link of each story 
            var title = $(element).text();
            var link = $(element).attr("href");

            // Push the titles and links into the results array
            results.push( {title: title, link: link});
        });

        //TEST TO SEE IF IT WORKED
        //console.log(results);

        // Send data back to the front page
        res.send(results);
    });
});



// Start the server
app.listen(PORT, function() {
    console.log("App running on port ", PORT);
  });