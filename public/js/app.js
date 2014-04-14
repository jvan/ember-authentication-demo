App = Ember.Application.create();

App.Router.map(function() {
   this.route('articles');
   this.route('login');
});

App.ApplicationController = Ember.Controller.extend({
   needs: ['login']
});

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

   getJSONWithToken: function(url) {
      var token = this.controllerFor('login').get('token');
      return $.getJSON(url, {token: token});
   }
});

App.ArticlesRoute = App.AuthenticatedRoute.extend({
   model: function() {
      return this.getJSONWithToken('/articles.json');
   }
});


App.LoginRoute = Ember.Route.extend({
   setupController: function(controller, context) {
      controller.reset();
   }
});

App.LoginController = Ember.Controller.extend({

   reset: function() {
      this.setProperties({
         username: "",
         password: "",
         errorMessage: ""
      });
   },

   /*
   token: localStorage.token || false,

   tokenChanged: function() {
      var state = this.get('token');
      localStorage.token = state;
      self.set('controllers.application.isLoggedIn', state);
   }.observes('token'),
   */ 

   isLoggedIn: false,

   actions: {
      login: function() {
         var self = this
           , data = this.getProperties('username', 'password');

         $.post('/auth.json', data).then(function(response) {
            self.set('errorMessage', response.message);
            if (response.success) {
               self.set('token', response.token);
               self.set('isLoggedIn', true);

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

      logout: function() {
         console.log('[LoginController.logout]');
         this.set('token', null);
         this.set('isLoggedIn', false);
         this.transitionToRoute('index');
      },
   }
});

