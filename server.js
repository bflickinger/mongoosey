// Requre dependencies
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

// Require the models
const Note = require("./models/Note.js");
const Article = require("./models/Article.js");

// Requirements for scraping
const axios = require("axios");
const cheerio = require("cheerio");

mongoose.Promise = Promise;

//Define TCP port with environment variable needed for Heroku
const PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();

// Use morgan and body parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make the public directory static
app.use(express.static("public"));

// Require handlebars.
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

//Connect to local or Heroku depending on environment variable
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// Database configuration with mongoose
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", (error) => console.log("Mongoose Error: ", error));

// Console log success
db.once("open", () => console.log("Mongoose connection successful."));

//GET requests to render Handlebars pages
app.get("/", (req, res) => {
    Article.find({ "saved": false }, (error, data) => {
        const hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    }).sort({_id: -1});
});

app.get("/saved", (req, res) => {
    Article.find({ "saved": true }).populate("notes").exec((error, articles) => {
        const hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

app.get("/scrape/:search", (req, res) => {
    // First, we grab the body of the html with axios.  The search term will be 'politics' if nothing is entered.
    let searchTerm = req.params.search;
    let searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=nws';
    axios.get(searchUrl).then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(response.data);

        $('div.g').each(function (i, element) {
            let result = {};
            result.title = $(this).find('.r').text();
            result.link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];
            result.summary = $(this).find('.st').text();
            result.img = $(this).find('img.th').attr('src');
            //Look for already existing titles
            Article.countDocuments({"title":result.title})
                .then((dbArticle) => {
                    if (!dbArticle) {
                        console.log("NEW ARTICLE: " + dbArticle, result.title);
                        Article.create(result)
                            .then((dbArticle) => {
                                // View the added result in the console
                                console.log(dbArticle);
                            })
                            .catch((err) => {
                                // If an error occurred, log it
                                console.log(err);
                            });
                    } else {
                        console.log("THIS ARTICLE ALREADY EXISTS..." + dbArticle, result.title);
                    }
                });
        });
        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Get all articles from the database
app.get("/articles", (req, res) => {
    Article.find({}, (error, doc) => error ? console.log(error) : res.json(doc));
});

// Get an article by its ID
app.get("/articles/:id", (req, res) => {
    Article.findOne({ "_id": req.params.id })
        .populate("note")
        .exec((error, doc) => error ? console.log(error) : res.json(doc));
});

// Save an article
app.post("/articles/save/:id", (req, res) => {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .exec((error, doc) => error ? console.log(error) : res.send(doc));
});

// Delete an article
app.post("/articles/delete/:id", (req, res) => {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
        .exec((error, doc) => error ? console.log(error) : res.send(doc));
});

// Create a new note
app.post("/notes/save/:id", (req, res) => {
    const newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body)
    newNote.save((error, note) => {
        if (error) {
            console.log(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
                .exec((err) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send(note);
                    }
                });
        }
    });
});

// Delete a note
app.delete("/notes/delete/:note_id/:article_id", (req, res) => {
    Note.findOneAndRemove({ "_id": req.params.note_id }, (err) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note_id } })
                .exec((err) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send("Note Deleted");
                    }
                });
        }
    });
});

// Listen on PORT
app.listen(PORT, () => {
    console.log("App running on port " + PORT);
});