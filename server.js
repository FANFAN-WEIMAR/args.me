// const http = require('http');
const fs = require('fs');

  //TODO read express/node on MDN https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction
const hostname = '127.0.0.1';
const port = 3000;

// express
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

var options = {
  root: './',
};

app.use(bodyParser.json());
app.post('/', function(req, res) {
  let argumentList = req.body;
  console.log(argumentList);
  res.json(req.body);
})

app.get('/', (req, res) => {
    res.sendFile('web/homepage.html', options);
});

app.get('/css/homepage.css', (req, res) => {
  res.sendFile('web/css/homepage.css', options);
});

app.get('/search.html', (req, res) => {
  res.sendFile('web/search.html', options);
});

app.get('/css/search.css', (req, res) => {
  res.sendFile('web/css/search.css', options);
});

app.get('/js/mds.js', (req, res) => {
  res.sendFile('web/js/mds.js', options);
});

app.get('/js/homepage.js', (req, res) => {
  res.sendFile('web/js/homepage.js', options);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})
