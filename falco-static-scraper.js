const axios = require('axios');
const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const dJSON = require('dirty-json');
const eval = require('eval');

module.exports = {
    async scrape(snapshot) {
        try {
            let response = await axios.request({
                method: 'GET',
                url: snapshot.url,
                headers: {
                    'Content-Type': 'charset=UTF-8'
                }
            });
            
            let html = response.data.toString('utf-8');  

            return this.getData(html, snapshot);
        } catch (error) {
            log.error(`${url}" - "${error}`);
        }
       
        //fs.writeFileSync('./test-fb.html', body);
        return
    },
    getData(html, snapshot) {
        switch (snapshot.query) {
            case 'facebook_marketplace':
                return facebookMarketPlaceQuery(html);        
            default:
                return defaultQuery(html, snapshot);
        }
    }
}

var defaultQuery = function(html, snapshot) {
    let data = [];
    try {

        const $ = cheerio.load(html);

        $(snapshot.query).each((i, elem) => {

            let title = $(elem).text();
            
            if(title !== null && title.length > 0)
                data.push({
                    title : title,
                    //link : $(elem).value()
                });
        });
        
        //Inject image
        if(snapshot.image_query != null){
            var arr = snapshot.image_query.split('|');
            let attr = 'src';
            let image_query = arr[0].trim();
            if(arr.length > 1) attr = arr[1].trim();

            $(image_query).each((i, elem) => {  
                let image = $(elem).attr(attr);
                if(image !== null && image.length > 0)
                    data[i].image = image
            });
        }
     
        //Inject link        
        if(snapshot.link_query != null)     
            $(snapshot.link_query).each((i, elem) => {

                let link = $(elem).attr('href');
                
                if(link !== null && link.length > 0)
                    data[i].link = link
            }); 

        //Inject price        
        if(snapshot.price_query != null) {  
            let arr = snapshot.price_query.split('|');
            let evalValue = null;
            let price_query = arr[0].trim();

            if(arr.length > 1) evalValue = arr[1].trim();
            
            $(price_query).each((i, elem) => {
                let price = evalValue != null?  eval(evalValue, { $, elem, i }) : $(elem).text();
                if(price !== null && price.length > 0)
                    data[i].price = utils.numberToMoney(price);
            });    
        }

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
        if(result == null || result.length == 0) {
            log.warn("no regex results");
            return;
        }
        let marketplace_search = dJSON.parse(result[0]);
        
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