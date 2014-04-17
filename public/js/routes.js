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

   initializeHeader: function() {
      var token = this.controllerFor('login').get('token');
      var adapter = this.get('container').lookup('adapter:application');
      adapter.set('headers', {'token': token});
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
      this.initializeHeader();
      return this.store.find('article', params.post_id);
   }
});


// Admin route.
//
// Display all articles (published and unpublished).
App.AdminRoute = App.AuthenticatedRoute.extend({
   model: function() {
      this.initializeHeader();
      return this.store.find('article');
   }
});


// Login route and controller.
App.LoginRoute = Ember.Route.extend({
   // Reset the controller before rendering.
   setupController: function(controller, context) {
      controller.reset();
   }
});


