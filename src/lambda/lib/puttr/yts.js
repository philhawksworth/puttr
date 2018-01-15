'use strict';

var fetch = require("node-fetch");
var cheerio = require('cheerio');
var moment = require('moment');


// Scrape the page for patterns we found
function inspect(html) {

  var results = [];
  var data = JSON.parse(html);

  // only bother parsing the results if we see candidate result rows
  if(data.data.movie_count > 0){

    // inspect each item found
    for(var torrent in data.data.movies){

      var title = data.data.movies[torrent].title_long

      for(var version in data.data.movies[torrent].torrents){
        var hash = data.data.movies[torrent].torrents[version].hash;
        results.push({
          title: title + " " + data.data.movies[torrent].torrents[version].quality,
          seeds: data.data.movies[torrent].torrents[version].seeds,
          size: data.data.movies[torrent].torrents[version].size,
          magnet: "magnet:?xt=urn:btih:" + hash + "&dn=" + title,
          date_added: moment(Date.parse(data.data.movies[torrent].torrents[version].date_uploaded.split(' ')[0])).fromNow(),
          source: "yts"
        });
      }
    }

  }
  return results;

}


function html(response){
  return response.text()
}


module.exports.search = function(query) {
  var url = "https://yts.ag/api/v2/list_movies.json?query_term=" + encodeURIComponent(query) + '&sort=seeds&order=desc&set=1';
  console.log("Checking YTS for " + query ) ;
  console.log("  " + url) ;
  return fetch(url).then(html).then(inspect);
};
