'use strict';

var fetch = require("node-fetch");
var cheerio = require('cheerio');


// Scrape the page for patterns we found
function inspect(html) {

  var results = [];
  var $ = cheerio.load(html);

  $('.table2 tr').each(function(index, item){

    // only bother with this row if we find what looks like a magnet link
    if($(item).find('.tt-name a.csprite_dl14').attr('href')) {

      var title = $(item).find('.tt-name a').text()
      var magnet = $(item).find('.tt-name a.csprite_dl14').attr('href');
      var hash = magnet.match(/org\/torrent\/(.+)\.torrent/)[1];
      results.push({
        title: title,
        seeds: parseInt($(item).find('td.tdseed').text(), 10),
        size: $(item).find('td.tdnormal').next().first().text(),
        magnet: "magnet:?xt=urn:btih:" + hash + "&dn=" + title,
        hash: hash,
        date_added: $(item).find('td.tdnormal').first().text().split(' -')[0],
        source: "lime"
      });
    }

  })
  return results;
}


function html(response){
  return response.text()
}


module.exports.search = function(query) {
  var url = `http://limetorrents.cc/search/all/${query}/seeds/1`;
  var url = `https://puttr.hawksworx.com/.netlify/functions/preview?q=${url}`;  var url = `https://puttr.hawksworx.com/.netlify/functions/preview?q=${url}`;
  console.log(`Checking limewire for ${query}`) ;
  console.log(`  ${url}`) ;
  return fetch(url).then(html).then(inspect);
};
