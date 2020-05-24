const axios = require('axios');
const cheerio = require('cheerio');
const utils = require("./falco-utils");

module.exports = {
    async scrape(url, query) {
        let response = await axios.request({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary'
        });
        
        let body = utils.removeAccents(response.data.toString('latin1'));
        return this.getData(body, query);
    },
    getData(html, query) {
        data = [];
        const $ = cheerio.load(html);

        $(query).each((i, elem) => {
          let title = $(elem).text();
          if(title !== null && title.length > 0)
            data.push({
                title : title,
                //link : $(elem).value()
            });
        });

        return data;
      }
}