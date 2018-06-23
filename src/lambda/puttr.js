'use strict';

var fs = require('fs');
var http = require('http');
var fetch = require("node-fetch");

var lime = require("./lib/puttr/lime.js");
var eztv = require("./lib/puttr/eztv.js");
var yts = require("./lib/puttr/yts.js");

export function handler(event, context, callback) {

  var searchStr = event.queryStringParameters['q'];

  Promise.all([
    lime.search(searchStr),
    yts.search(searchStr),
    eztv.search(searchStr),
  ])
  .then(function(values){

    // combine all of the results arrays
    var hits = [].concat.apply([], values);

    // sort hits array by the number of seeds
    hits = hits.sort(function(a, b) { return b.seeds - a.seeds });

    // Send it
    console.log(hits.length + " results returned");
    callback(null, {
      contentType: 'text/json',
      statusCode: 200,
      body: JSON.stringify(hits)
    })
  });

}
