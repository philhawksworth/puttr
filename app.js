const Hapi = require('hapi');
const Path = require('path');
const Hoek = require('hoek');
var Q = require('q');
var os = require('os');
var fs = require('fs');
var http = require('http');
var chalk = require('chalk');
var kickass = require('./kickass.js');
var eztv = require('./eztv.js');

var urls = {
  "kickass_url": "https://kat.cr",
  "eztv_url": "https://www.eztv.ag"
};
var cat = null;
var page = 1;
var searchResults = [];
var searchString = "foo";



function kickassSearch(query) {
  var deferred = Q.defer();
  kickass.search(query, cat, page, urls.kickass_url).then(
  function (data) {
    onResolve(data);
    deferred.resolve();
    return deferred.promise;
  }, function (err) {
    onReject(err);
  });
  return deferred.promise;
}

function eztvSearch(query) {
  var deferred = Q.defer();
  eztv.search(query, cat, page, urls.eztv_url).then(
    function (data) {
      onResolve(data);
      deferred.resolve();
      return deferred.promise;
    }, function (err) {
      onReject(err);
  });
  return deferred.promise;
}



function onResolve(data) {
  var deferred = Q.defer();
  for (var idx in data) {
    var torrent = data[idx];
    var t = {
      "torrent" : torrent,
      "size" : torrent.size,
      "seed" : torrent.seeds,
      "leech" : torrent.leechs,
      "torrent_verified" : " ",
      "magnet" : torrent.torrent_link,
      "date_added" : torrent.date_added,
      "title" : torrent.title
    };
    // if(t.torrent.torrent_verified) {
    //     t.torrent_verified = t.torrent.torrent_verified;
    //     if(t.torrent.torrent_verified == "vip"){
    //       t.torrent_verified = chalk.green(" 💀  ");
    //     } else if(t.torrent.torrent_verified == "trusted"){
    //       t.torrent_verified = chalk.magenta(" 💀  ");
    //     }
    // }
    searchResults.push(t);
  }
  console.log(chalk.green("resolved"));
  deferred.resolve();
  return deferred.promise;
}

function onReject(err) {
  console.log(chalk.red(err));
}

const server = new Hapi.Server();


server.connection({
  port: process.env.PORT || 5000
});


server.register(require('vision'), (err) => {
  Hoek.assert(!err, err);
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'views'
  });
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply.view('home');
  }
});

server.route({
  method: 'POST',
  path: '/',
  handler: function (request, reply) {
    var searchStr = request.payload.search;
    searchResults = [];
    kickassSearch(searchStr).then(
      function () {
        reply.view('home', {
          results: searchResults,
          search: searchStr
        });
      }
    );
  }
});


server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
