var express = require('express')
  , app = express()
  , _ = require('underscore')
  , articles = require('./data/articles.json')
  , users = require('./data/users.json');

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'jade');
app.set('view options', {pretty: true});
app.set('views', __dirname + '/views');

var currentTokens = { };

function generate_token() {
   return 'token-' + Object.keys(currentTokens).length;
}

function getUserToken(req, res) {
   return req.body.token || req.param('token') || req.headers.token;
}

function validToken(userToken) {
   return currentTokens[userToken] !== undefined;
} 

function hasAdmin(userToken) {
   return currentTokens[userToken].admin === true;
}


app.post('/api/auth.json', function(req, res) {
   var body = req.body,
       username = body.username,
       password = body.password;

   if (users[username] && users[username].password == password) {
      token = generate_token();
      res.send({
         success: true,
         token: token,
         admin: users[username].admin
      });

      currentTokens[token] = { 'admin': users[username].admin };
   } else {
      res.send({
         success: false,
         message: 'Invalid username/password'
      });
   }
});


app.get('/api/articles', function(req, res) {
   var userToken = getUserToken(req, res);

   if (validToken(userToken) && hasAdmin(userToken)) {
      res.send(articles);
   } else {
      res.send(403, {error: 'Invalid token. You provided: ' + userToken});
   }
});

app.get('/api/articles/published', function(req, res) {
   var userToken = getUserToken(req, res);

   if (validToken(userToken)) {
      var published = _(articles.articles).filter(function(x) { return x.published; });
      res.send({"articles": published});
   }
});

app.get('/api/articles/:article_id', function(req, res) {
   var userToken = getUserToken(req, res);

   if (validToken(userToken)) {
      var index = parseInt(req.params.article_id); 
      var article = articles.articles[index];
      if (article.published || hasAdmin(userToken)) {
         res.send({"article": articles.articles[index]});
      } else {
         res.send(403, {error: 'You do not have permission to access this URL.' + userToken});
      }
   }
});


app.get('/', function(req, res) {
   res.render('layout');
});


app.listen(3000, function() {
   console.log('listening on port 3000');
});

