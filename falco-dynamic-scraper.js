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
            let nightmare = 
            Nightmare(
            { 
                    show: true,
                    loadTimeout: 10000,
                    gotoTimeout: 10000,
                    waitTimeout: 10000,
                    executionTimeout: 10000 
            })
            var result = await nightmare
            .goto(url)
            .waitforunload()
            .end(() => 'some value')
            //prints "some value"
            .then(console.log)
        
            await nightmare.end();
    
        } catch (err) {
        console.error(err);
        }
        
      console.log(result);
    },
    getData(html, query) {
        switch (query) {
            //case 'facebook_marketplace':
            //    return facebookMarketPlaceQuery(html);        
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
    let data = [];
    try {
        let regex = /(?<=marketplace_search:).*(?=,viewer:)/i;
        let result = regex.exec(html);
        let marketplace_search = dJSON.parse(result[0]);
        console.log(html);
        
        marketplace_search.feed_units.edges.forEach(element => {
            let listing = element.node.listing;
            
            data.push({
                title : listing.marketplace_listing_title,
                link : listing.story.url,
                price : listing.formatted_price ? listing.formatted_price.text : "",
                image : listing.primary_listing_photo ? listing.primary_listing_photo.image.uri : null
            });
        });    
    } catch (error) {
        log.error(error)
    }

    return data;
}