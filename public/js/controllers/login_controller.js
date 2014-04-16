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

