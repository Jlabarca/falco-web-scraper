const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    async scrape(url, query) {
        let response = await axios.get(url);
        let body = response.data.replace(/[^\x00-\x7F]/g, "");  // remove non ASCII chars
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