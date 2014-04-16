// Create the ember application.
App = Ember.Application.create();

// Setup routes.
App.Router.map(function() {
   // The articles route will display a list of all published articles.
   // Individual articles can be reached by the nested route.
   this.resource('articles', function() {
      this.resource('articles.post', {path: '/:post_id'});
   });

   // Add routes for administrators and logging in.
   this.route('admin');
   this.route('login');
});

// Configure the REST adapter to work with our API.
DS.RESTAdapter.reopen({
   namespace: 'api'
});

// Create a data model for articles.
//
// NOTE: This data must match the data in articles.json.
App.Article = DS.Model.extend({
   title:     DS.attr('string'),
   author:    DS.attr('string'),
   published: DS.attr('boolean'),
   body:      DS.attr('string')
});


// Include the login controller in the application controller. This allows
// us to reference properties on the login controller in our application
// templates.
App.ApplicationController = Ember.Controller.extend({
   needs: ['login']
});


// Authenticate route base class.
//
// This route can be extended by routes which require authentication. If the
// user is not currently logged in they will be redirected to the login page.
App.AuthenticatedRoute = Ember.Route.extend({
   beforeModel: function(transition) {
      if (!this.controllerFor('login').get('token')) {
         this.redirectToLogin(transition);
      }
   },

   redirectToLogin: function(transition) {
      var loginController = this.controllerFor('login');
      loginController.set('attemptedTransition', transition);
      this.transitionTo('login');
   },

   getJSONWithToken: function(model) {
      var token = this.controllerFor('login').get('token');
      return this.store.find(model, {token: token});
   }
});


// Main articles route.
//
// Display all published articles.
App.ArticlesIndexRoute = App.AuthenticatedRoute.extend({
   model: function() {
      var token = this.controllerFor('login').get('token');
      var url = '/api/articles/published';

      // NOTE: The built-in store.find(...) method is not compatible with
      // the url for published articles. Instead we need to use the
      // getJSON(...) function which returns a promise.
      return Ember.$.getJSON(url, {token: token}).then(function(data) {
         return data.articles; // Return the array of articles.
      });
   }
});


// Article detail route.
//
// Display data for a specific article.
App.ArticlesPostRoute = App.AuthenticatedRoute.extend({
   model: function(params) {
      var token = this.controllerFor('login').get('token');
      var url = '/api/articles/'+params.post_id;

      // NOTE: The store.find(...) method can take an additional id parameter
      // for retrieving a specific item. However, it does not seem to work with
      // the additional token data.
      return Ember.$.getJSON(url, {token: token}).then(function(data) {
         return data.article;
      });
   }
});


// Admin route.
//
// Display all articles (published and unpublished).
App.AdminRoute = App.AuthenticatedRoute.extend({
   model: function() {
      return this.getJSONWithToken('article');
   }
});


// Login route and controller.
App.LoginRoute = Ember.Route.extend({
   // Reset the controller before rendering.
   setupController: function(controller, context) {
      controller.reset();
   }
});

App.LoginController = Ember.Controller.extend({
   // Clear out any data from previous login attempts.
   reset: function() {
      this.setProperties({
         username: "",
         password: "",
         errorMessage: ""
      });
   },

   // Initialize user token using value in sessionStorage. This value will
   // persist until the tab is closed (or logout).
   token: sessionStorage.token,

   isLoggedIn: sessionStorage.getItem('token') !== null,

   isAdmin: false,

   // When the token value is changed, save the value in sessionStorage and
   // update the isLoggedIn property.
   tokenChanged: function() {
      if (this.get('token') === null) {
         delete sessionStorage.token;
         this.set('isLoggedIn', false);
      } else {
         sessionStorage.token = this.get('token');
         this.set('isLoggedIn', true);
      }
   }.observes('token'),
    
   actions: {
      // Attempt to authenticate the user.
      //
      // If the login attempt is successful and the user was redirected to the
      // login page they will be returned to the original page. Otherwise, they
      // will be sent to the main page.
      login: function() {
         var self = this
           , data = this.getProperties('username', 'password');

         $.post('/api/auth.json', data).then(function(response) {
            self.set('errorMessage', response.message);

            if (response.success) {
               // Store user token and set admin statuse.
               self.set('token', response.token);
               self.set('isAdmin', response.admin);

               // Redirect to original page if the user was redirected to
               // login page.
               var attemptedTransition = self.get('attemptedTransition');
               if (attemptedTransition) {
                  attemptedTransition.retry();
                  self.set('attemptedTransition', null);
               } else {
                  self.transitionToRoute('index');
               }
            }
         });
      },

      // Log the user out and redirect to the main page.
      logout: function() {
         this.set('token', null);
         this.set('isAdmin', null);
         this.transitionToRoute('index');
      },
   }
});

