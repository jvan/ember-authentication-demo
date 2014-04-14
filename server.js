var express = require('express')
  , app = express();

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'jade');
app.set('view options', {pretty: true});
app.set('views', __dirname + '/views');

var ARTICLES = [
  {
    id: 1,
    title: 'How to write a JavaScript Framework',
    author: 'Tomhuda Katzdale',
    body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  },
  {
    id: 2,
    title: 'Chronicles of an Embereño',
    author: 'Alerik Bryneer',
    body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  },
  {
    id: 3,
    title: 'The Eyes of Thomas',
    author: 'Yehuda Katz',
    body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  }
];

var currentToken;
app.post('/auth.json', function(req, res) {
   var body = req.body,
       username = body.username,
       password = body.password;

   if (username == 'ember' && password == 'casts') {
      currentToken = 'ABCDEFGHIJKLMNOPQRSTUVWYXZ';
      res.send({
         success: true,
         token: currentToken
      });
   } else {
      res.send({
         success: false,
         message: 'Invalid username/password'
      });
   }
});

function validTokenProvided(req, res) {
   var userToken = req.body.token || req.param('token') || req.headers.token;

   if (!currentToken || userToken != currentToken) {
      res.send(403, {error: 'Invalid token. You provided: ' + userToken});
      return false;
   }

  return true;
} 

app.get('/articles.json', function(req, res) {
   console.log('[GET /articles.json]');
   if (validTokenProvided(req, res)) {
      res.send(ARTICLES);
   }
});

app.get('/', function(req, res) {
   res.render('layout');
});


app.listen(3000, function() {
   console.log('listening on port 3000');
});

