const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const dJSON = require('dirty-json');
const Nightmare = require('nightmare');

var fbNightmare = null;

module.exports = {
    async fbBrowserInit(user, pass) {
        if(fbNightmare !== null) return;
        log.info("fbBrowserInit");

        fbNightmare = Nightmare({
            show: false,
            typeInterval: 20,
            waitTimeout: 120000,
            gotoTimeout: 120000
        });

        //Logging fb
        await fbNightmare
        .viewport(1024, 768)
        .goto('https://www.facebook.com/marketplace/')
        .wait(5000)
        .click('body > div.l9j0dhe7.tkr6xdv7 > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div.gjzvkazv.dati1w0a.f10w8fjw.hv4rvrfc.ecm0bbzt.cbu4d94t.j83agx80.c4hnarmi > div')
        .wait()
        .type('#login_form > div > div:nth-child(1) > label > input', user)
        .wait()
        .type('#login_form > div > div:nth-child(2) > label > input', pass)
        .wait()
        .click('#login_form > div > div:nth-child(3) > div')
        .wait(5000)
    },
    async fbBrowserFinnish() {
        log.info("fbBrowserFinnish");
        await fbNightmare.end();
    },
    async scrape(url, query) {
        switch (query) {
            case 'facebook_marketplace':
                return this.facebookNightmare(url, query);        
            default:
                return this.defaultNightmare(url, query);
        }
    },
    async facebookNightmare(url, query) {
        try {
            var result;
            await fbNightmare
            .goto(url)
            .wait(5000)
            .evaluate(function() {
                //returning HTML for cheerio
                return document.body.innerHTML; 
            })
            .then((body) => {
                // Loading HTML body on jquery cheerio
                // utils.writeToFile('stop.html', body)
                result = facebookMarketPlaceQuery(body, query)
            })
            .catch(error => {
                console.error('Search failed:', error)
            })
        
            return result;
        } catch (err) {
            log.error(err);
        }
    },
    async defaultNightmare(url, query) {
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
            .evaluate(function() {
                //returning HTML for cheerio
                return document.body.innerHTML; 
            })
            .then((body) => {
                // Loading HTML body on jquery cheerio
                result = defaultQuery(body, query)
            })
            .catch(error => {
                console.error('Search failed:', error)
            })
        
            await nightmare.end();
            return result;
        } catch (err) {
            log.error(err);
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
        
        let regex = /(?<=marketplace_search":)(.*)(?=,"marketplace_seo_page")/i;
        let result = regex.exec(html);
        if(result == null || result.length == 0) {
            log.warn("no regex results");
            return;
        }
        let marketplace_search = dJSON.parse(result[0]);
        
        marketplace_search.feed_units.edges.forEach(element => {
            if(element.node == null || element.node.listing == null) return;
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