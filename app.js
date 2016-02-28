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

    query = request.payload.search;

    Q.allSettled([
      kickass.search(query, null, 1, "https://kat.cr"),
      eztv.search(query, "https://www.eztv.it"),
    ])
    .then(function (results) {
        var resultsArray = [];
        var count = 0;
        results.forEach(function (result) {
          if (result.state === "fulfilled") {
            result.value.forEach(function (item) {
              resultsArray.push(item);
            });
          } else {
              var reason = result.reason;
              console.log(reason);
          }
        });
        console.log("resultsArray " + resultsArray.length);
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
