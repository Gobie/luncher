var throng = require('throng');

var WORKERS = process.env.WEB_CONCURRENCY || 1;
var PORT = process.env.PORT || 3000;

throng(start, {
  workers: WORKERS
});

function start() {
  var express = require('express');
  var app = express();

  app
    .listen(PORT, onListen);

  function onListen() {
    console.log('Listening on', PORT);
  }
}