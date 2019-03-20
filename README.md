# All the News That's Fit to Scrape

### Overview

MonGoogler is a web app that lets users view and leave comments on the latest news from Google. The user can enter a search term (it will default to 'politics' if left blank) and hit the 'scrape' button.

All of the articles scraped are saved to the database, but each has a boolean field for 'saved'.  Only new article titles are added to the db on subsequent scrapes.  Saved articles can hold multiple comments that any users can see.

The app uses Node/Express for the server and routing, MongoDB/Mongoose for the database and models, Handlebars for the layout and views, & Cheerio/Request for scraping the data from Google News.

The application can be accessed here:  https://cryptic-ocean-53321.herokuapp.com/

### Technology used:

### NPM Packages

   1. express

   2. express-handlebars

   3. mongoose

   4. cheerio

   5. axios