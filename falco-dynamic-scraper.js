const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const dJSON = require('dirty-json');
const Nightmare = require('nightmare')

Nightmare.action('waitforunload', function (done) {
    this.evaluate_now(function() {
        return new Promise(function(resolve, reject) {
            window.onbeforeunload = function() {
                resolve();
            };
        });
    }, done)
});

module.exports = {
    async scrape(url, query) {
        try {
            let nightmare = Nightmare(
            { 
                    show: false,
                    loadTimeout: 10000,
                    gotoTimeout: 10000,
                    waitTimeout: 10000,
                    executionTimeout: 10000 
            })
            var result;
            await nightmare
            .goto(url)
            .wait(3000)
            .evaluate(function(){
                //returning HTML for cheerio
                return document.body.innerHTML; 
            })
            .then((body) => {
                // Loading HTML body on jquery cheerio
                result = this.getData(body, query)
            })
            .catch(error => {
                console.error('Search failed:', error)
            })
        
            await nightmare.end();
            return result;
        } catch (err) {
            console.error(err);
        }
    },
    getData(html, query) {
        switch (query) {
            case 'facebook_marketplace':
               return facebookMarketPlaceQuery(html);        
            default:
                return defaultQuery(html, query);
        }
    }
}

var defaultQuery = function(html, query) {
    let data = [];

    try {

        const $ = cheerio.load(html);
        $(query).each((i, elem) => {

            let title = $(elem).text();
            
            if(title !== null && title.length > 0)
                data.push({
                    title : title,
                    //link : $(elem).value()
                });
           });

    } catch (error) {
        log.error(error)
    }

    return data;
}

var facebookMarketPlaceQuery = function(html) {
    utils.writeToFile("1.html", html)
    let data = [];
    try {
        
        let regex = /(?<=marketplace_search":)(.*)(?=,"marketplace_seo_page")/i;
        let result = regex.exec(html);
        if(result == null || result.length == 0) {
            log.warn("no regex results");
            return;
        }
        let marketplace_search = dJSON.parse(result[0]);
        
        marketplace_search.feed_units.edges.forEach(element => {
            let listing = element.node.listing;            
            data.push({
                title : listing.marketplace_listing_title,
                link : 'https://www.facebook.com/marketplace/item/'+listing.id,
                price : listing.formatted_price ? listing.formatted_price.text : "",
                image : listing.primary_listing_photo ? listing.primary_listing_photo.image.uri.replace(/\\/g,"") : null
            });
        });     
        
    } catch (error) {
        log.error(error)
    }

    return data;
}