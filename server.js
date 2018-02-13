// const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

// express
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

// mongodb
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

function findArguments(db, collection, argumentList, callback) {
  var collection = db.collection(collection);
  collection.find({
    id: { $in: argumentList}
  }).toArray(function (err, res) {
    assert.equal(err, null);
    data = [];
    for(arg of res) {
      let argument = {};
      argument['id'] = arg['id'];
      argument['topics'] = arg['topics'];
      data.push(argument);
    }
    console.log('Found ' + res.length + ' documents within database' );
    callback(data);
  })
}

//http server handling
var options = {
  root: './',
};

app.use(bodyParser.json());
app.post('/', function(req, res) {
  let argumentList = req.body;
  console.log('number of arguments received: ' + argumentList.length);

  let url = 'mongodb://localhost:27017/wikimodel';
  MongoClient.connect(url, function (err, client) {
    if(err) throw err;
    console.log('connected successfully to database!');

    var db = client.db('wikimodel');
    findArguments(db, 'wiki_arg', argumentList, function (result) {
      // console.log(result);
      res.json(result);
      client.close();
    })
  })
})

app.get('/', (req, res) => {
    res.sendFile('web/homepage.html', options);
});

app.get('/search.html', (req, res) => {
  res.sendFile('web/search.html', options);
});

app.get('/topic_dist_per_doc.txt', (req, res) => {
  res.sendFile('./topic_dist_per_doc.txt', options);
});

app.get('/css/homepage.css', (req, res) => {
  res.sendFile('web/css/homepage.css', options);
});

app.get('/css/search.css', (req, res) => {
  res.sendFile('web/css/search.css', options);
});

app.get('/js/mds.js', (req, res) => {
  res.sendFile('web/js/mds.js', options);
});

app.get('/js/barycentric.js', (req, res) => {
  res.sendFile('web/js/barycentric.js', options);
});

app.get('/js/lodash.js', (req, res) => {
  res.sendFile('web/js/lodash.js', options);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})
