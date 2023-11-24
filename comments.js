// Create web server
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

// Set up the server
app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up the database
var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/postgres";

// Set up the server
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all comments from the database
app.get('/getComments', function(request, response) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    client.query('SELECT * FROM comments', function(err, result) {
      done();

      if (err) {
        return console.error('error running query', err);
      }

      response.json(result.rows);
    });
  });
});

// Add a comment to the database
app.post('/addComment', function(request, response) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    client.query('INSERT INTO comments (comment) VALUES ($1)', [request.body.comment], function(err, result) {
      done();

      if (err) {
        return console.error('error running query', err);
      }

      response.sendStatus(200);
    });
  });
});

// Delete a comment from the database
app.post('/deleteComment', function(request, response) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    client.query('DELETE FROM comments WHERE id=$1', [request.body.id], function(err, result) {
      done();

      if (err) {
        return console.error('error running query', err);
      }

      response.sendStatus(200);
    });
  });
});

// Start the server
app.listen(app.get('port'), function() {
  console.log('Node app is running on