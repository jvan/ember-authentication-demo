// Test server for ember authentication demo.

var express = require('express')
  , app = express()
  , _ = require('underscore')
  , articles = require('./data/articles.json')
  , users = require('./data/users.json');

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

// Use jade templates for ember application html.
app.set('view engine', 'jade');
app.set('view options', {pretty: true});
app.set('views', __dirname + '/views');


// When users successfully login their tokens are stored along with
// their access level (admin, regular user). These tokens and
// associated data are used to restrict access to REST API defined
// below.
var currentTokens = { };

// Return a "random" token for tracking logged in users.
//
// This is used to approximate the behavior of an actual login server
// which would return a token upon successful login. This token is then
// used in subsequent calls to the REST API.
function generate_token() {
   return 'token-' + Object.keys(currentTokens).length;
}

// Get the user token from request object.
function getUserToken(req, res) {
   return req.body.token || req.param('token') || req.headers.token;
}

// Return true if the users token is found.
function validToken(userToken) {
   return currentTokens[userToken] !== undefined;
} 

// Return true if the user has admin status.
function hasAdmin(userToken) {
   return currentTokens[userToken].admin === true;
}


// Data REST API
//
// These routes are used to authenticate users and retrieve article
// data. In a real system these would belong to a separate backend.

// Authenticate with username and password.
//
// To login to the system the user supplies a username and password.
// If the attempt is successful a token is generated and returned to
// the user. This token is then used in all future API calls.
app.post('/api/auth.json', function(req, res) {
   var body = req.body,
       username = body.username,
       password = body.password;

   if (users[username] && users[username].password == password) {
      token = generate_token();

      // Return the user token and the admin status in the response.
      res.send({
         success: true,
         token: token,
         admin: users[username].admin
      });

      // Store the token and admin status.
      currentTokens[token] = { 'admin': users[username].admin };
   } else {
      res.send({
         success: false,
         message: 'Invalid username/password'
      });
   }
});


// Get all articles. This function requires admin status.
app.get('/api/articles', function(req, res) {
   var userToken = getUserToken(req, res);

   if (validToken(userToken) && hasAdmin(userToken)) {
      res.send(articles);
   } else {
      res.send(403, {error: 'Invalid token. You provided: ' + userToken});
   }
});


// Get all published articles.
app.get('/api/articles/published', function(req, res) {
   var userToken = getUserToken(req, res);

   if (validToken(userToken)) {
      var published = _(articles.articles).filter(function(x) { return x.published; });

      // Format data for use with ember RESTAdapter.
      res.send({"articles": published});
   }
});


// Return an articles by id.
//
// If the article is published a regular, authenticated user can access the data.
// Admin status is required to access unpublished articles.
app.get('/api/articles/:article_id', function(req, res) {
   var userToken = getUserToken(req, res);

   if (validToken(userToken)) {
      // Get the requested article.
      var index = parseInt(req.params.article_id); 
      var article = articles.articles[index];

      if (article.published || hasAdmin(userToken)) {
         // Format data for use with ember RESTAdapter.
         res.send({"article": articles.articles[index]});
      } else {
         res.send(403, {error: 'You do not have permission to access this URL.' + userToken});
      }
   }
});


// Ember application.
//
// The ember application is served at localhost:3000.

app.get('/', function(req, res) {
   res.render('layout');
});


app.listen(3000, function() {
   console.log('listening on port 3000');
});

