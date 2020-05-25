const axios = require('axios');
const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const fs = require('fs');
const dJSON = require('dirty-json');

module.exports = {
    async scrape(url, query) {
        try {
            let response = await axios.request({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                reponseEncoding: 'binary'
            });
            
            let html = utils.removeAccents(response.data.toString('latin1'));  

            return this.getData(html, query);
        } catch (error) {
            log.error(url + "----" + error);
        }
       
        //fs.writeFileSync('./test-fb.html', body);
        return
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
    let data = [];

    try {
        let regex = /(?<=marketplace_search:).*(?=,viewer:)/i;
        let result = regex.exec(html);
        let marketplace_search = dJSON.parse(result[0]);
        fs.writeFileSync('./test-regexp.js', JSON.stringify(marketplace_search));
        marketplace_search.feed_units.edges.forEach(element => {
            let listing = element.node.listing;

            data.push({
                title : listing.marketplace_listing_title,
                link : listing.story.url
            });
        });    
    } catch (error) {
        log.error(error)
    }

    return data;
}