const Nightmare = require("nightmare");
const vo = require('vo');

const axios = require('axios');
const cheerio = require('cheerio');
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const dJSON = require('dirty-json');
const eval = require('eval');

var scrape = async function(url, queries) {
        try {
            let response = await axios.request({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                reponseEncoding: 'UTF-8',
                headers: {
                    'Content-Type': 'text/html; charset=UTF-8'
                }
            });

            let html = queries.encoding != null? response.data.toString(queries.encoding) : response.data.toString()
            
            return getData(html, queries);
        } catch (error) {
            log.error(`${url}" - "${error}`);
        }
       
        //fs.writeFileSync('./test-fb.html', body);
        return
    };
var getData = function(html, queries) {
        switch (queries.query) {
            case 'facebook_marketplace':
                return facebookMarketPlaceQuery(html);        
            default:
                return defaultQuery(html, queries);
        }
    }


var defaultQuery = function(html, queries) {
    console.log(queries)
    utils.writeToFile("static.html", html)
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
            
        //Inject price        
        if(queries.price_query != null) {  
            let arr = queries.price_query.split('|');
            let evalValue = null;
            let price_query = arr[0].trim();

            if(arr.length > 1) evalValue = arr[1].trim();
            console.log(price_query);
            
            $(price_query).each((i, elem) => {
                let price = evalValue != null?  eval(evalValue, { $, elem, i }) : $(elem).text();
                if(price !== null && price.length > 0)
                    data[i].price = utils.numberToMoney(price);
            });     
        }    

    } catch (error) {
        log.error(error)
    }

    console.log(data)
    return data;
}

const nightmare = Nightmare({
    show: true,
    typeInterval: 20,
    waitTimeout: 60000,
    gotoTimeout: 60000
});

var run = function*() {

    let queries = {
        encoding: 'utf8',
        query: "#root-app > div > div > section > ol > li > div > div > div.ui-search-result__content-wrapper > div.ui-search-item__group.ui-search-item__group--title > a > h2",
        image_query: "#root-app > div > div > section > ol > li > div > div > div.ui-search-result__image > a > div > div > div > div > div > img|data-src",
        link_query: "#root-app > div > div > section > ol > li > div > div > div.ui-search-result__image > a",
        price_query: "#root-app > div > div > section > ol > li > div > div > div.ui-search-result__content-wrapper > div.ui-search-result__content-columns > div.ui-search-result__content-column.ui-search-result__content-column--left > div.ui-search-item__group.ui-search-item__group--price > div > div > span.price-tag.ui-search-price__part > span.price-tag-fraction"
    }

    // let queries = {
    //     encoding: 'latin1',
    //     query: "* > td.thumbs_subject > a",
    //     image_query: "* > td.listing_thumbs_image > div > div > div > img",
    //     link_query: "* > td.thumbs_subject > a.redirect-to-url",
    //     price_query: "* > td.thumbs_subject | module.exports = $(elem).find('span').text();"
    // }

    var result = scrape("https://listado.mercadolibre.cl/consolas/usado/_PriceRange_0-200000_PublishedToday_YES"
    //var result = scrape("https://www.yapo.cl/region_metropolitana/consolas_videojuegos?ca=15_s&l=0&q=nintendo+64&w=1&cmn=&pe=3"
    , queries);
    console.log(result);
    // yield nightmare
    //     .viewport(1024, 768)
    //     .goto('https://www.facebook.com/marketplace/106532542716776/search?query=star%20wars')
    //     .wait(5000)
    //     .click('body > div.l9j0dhe7.tkr6xdv7 > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div.gjzvkazv.dati1w0a.f10w8fjw.hv4rvrfc.ecm0bbzt.cbu4d94t.j83agx80.c4hnarmi > div')
    //     .wait()
    //     .type('#login_form > div > div:nth-child(1) > label > input', '943425934')
    //     .wait()
    //     .type('#login_form > div > div:nth-child(2) > label > input', 'pkfire77')
    //     .wait()
    //     .click('#login_form > div > div:nth-child(3) > div')
    //     .wait(5000)
    //     .evaluate(function() {
    //         //returning HTML for cheerio
    //         return document.body.innerHTML; 
    //     })
    //     .then((body) => {
    //         // Loading HTML body on jquery cheerio
    //         result = "yiopi"
    //     })
    //     .catch(error => {
    //         console.error('Search failed:', error)
    //     })

   
    // yield nightmare.end();
};

vo(run)(function (err) {
    if (err) {
        console.dir(err);
    }
    console.log('done');
});