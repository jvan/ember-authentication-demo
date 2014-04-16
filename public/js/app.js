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


// Include the login controller in the application controller. This allows
// us to reference properties on the login controller in our application
// templates.
App.ApplicationController = Ember.Controller.extend({
   needs: ['login']
});

