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
var limetorrents = require('./limetorrents.js');


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

    var query = request.payload.search;

    Q.allSettled([
      kickass.search(query, null, 1, "https://kat.cr"),
      eztv.search(query, "https://www.eztv.it"),
      limetorrents.search(query, null, 1, "http://limetorrents.cc")
    ])
    .then(function (results) {
        var resultsArray = [];
        var count = 0;
        results.forEach(function (result) {
          if (result.state === "fulfilled") {
            result.value.forEach(function (item) {
              // var link = item.torrent_link;
              // var hash = link.match(/btih:(.+)&dn/)[1];
              // console.log(hash);
              resultsArray.push(item);
            });
          } else {
              var reason = result.reason;
              console.log(reason);
          }
        });


        reply.view('home', {
          results: resultsArray,
          search: query
        });
    });
  }
});


server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
