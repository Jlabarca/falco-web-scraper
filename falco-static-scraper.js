const axios = require('axios');
const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const dJSON = require('dirty-json');

module.exports = {
    async scrape(url, queries) {
        try {
            let response = await axios.request({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                reponseEncoding: 'binary'
            });
            
            let html = utils.removeAccents(response.data.toString('latin1'));  

            return this.getData(html, queries);
        } catch (error) {
            log.error(`${url}" - "${error}`);
        }
       
        //fs.writeFileSync('./test-fb.html', body);
        return
    },
    getData(html, queries) {
        switch (queries.query) {
            case 'facebook_marketplace':
                return facebookMarketPlaceQuery(html);        
            default:
                return defaultQuery(html, queries);
        }
    }
}

var defaultQuery = function(html, queries) {
    let data = [];
    
    try {

        const $ = cheerio.load(html);

        $(queries.query).each((i, elem) => {

            let title = $(elem).text();
            
            if(title !== null && title.length > 0)
                data.push({
                    title : title,
                    //link : $(elem).value()
                });
           });
        
        //Inject image
        if(queries.image_query != null){
            var arr = queries.image_query.split('|');
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
        if(queries.link_query != null)     
            $(queries.link_query).each((i, elem) => {

                let link = $(elem).attr('href');
                
                if(link !== null && link.length > 0)
                    data[i].link = link
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