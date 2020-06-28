const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const dJSON = require('dirty-json');
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

module.exports = {
    async scrape(url, query) {
        var result = await nightmare
        .goto(url)
        .wait('#main')
        //execute javascript on the page
        //here, the function is getting the HREF of the first search result
        .evaluate(function() {
          return document.querySelector('#main .searchCenterMiddle li a')
            .href;
        });
    
    
      //queue and end the Nightmare instance along with the Electron instance it wraps
      await nightmare.end();
    
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