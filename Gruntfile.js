module.exports = function(grunt) {

   grunt.initConfig({

      emberTemplates: {
         compile: {
            options: {
               templateName: function(source) {
                  return source.replace(/app\/templates\//, '');
               }
            },
            files: {
               'public/js/templates.js': ['app/templates/**/*.hbs']
            }
         }
      },

      watch: {
         emberTemplates: {
            files: 'app/templates/**/*.hbs',
            tasks: ['emberTemplates']
         }
      }

   });

   grunt.loadNpmTasks('grunt-ember-templates');
   grunt.loadNpmTasks('grunt-contrib-watch');

   grunt.registerTask('build', ['emberTemplates']);
}

