App = Ember.Application.create();

App.Router.map(function() {
   this.resource('articles', function() {
      this.resource('articles.post', {path: '/:post_id'});
   });
   this.route('admin');
   this.route('login');
});

DS.RESTAdapter.reopen({
   namespace: 'api'
});

App.Article = DS.Model.extend({
   title:     DS.attr('string'),
   author:    DS.attr('string'),
   published: DS.attr('boolean'),
   body:      DS.attr('string')
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

   getJSONWithToken: function(model) {
      var token = this.controllerFor('login').get('token');
      return this.store.find(model, {token: token});
   }
});

App.ArticlesIndexRoute = App.AuthenticatedRoute.extend({
   model: function() {
      return this.getJSONWithToken('article');
   }
});

App.ArticlesIndexController = Ember.ArrayController.extend({
   published: function() {
      return this.filterProperty('published');
   }.property('@each.published')
});


App.ArticlesPostRoute = App.AuthenticatedRoute.extend({
   model: function(params) {
      var token = this.controllerFor('login').get('token');
      var url = '/api/articles/'+params.post_id;
      return Ember.$.getJSON(url, {token: token}).then(function(data) {
         return data.article;
      });
   }
});

App.AdminRoute = App.AuthenticatedRoute.extend({
   model: function() {
      return this.getJSONWithToken('article');
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

   token: sessionStorage.token,

   isLoggedIn: sessionStorage.getItem('token') !== null,

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
      login: function() {
         var self = this
           , data = this.getProperties('username', 'password');

         $.post('/api/auth.json', data).then(function(response) {
            self.set('errorMessage', response.message);
            if (response.success) {
               self.set('token', response.token);

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
         this.set('token', null);
         this.transitionToRoute('index');
      },
   }
});

