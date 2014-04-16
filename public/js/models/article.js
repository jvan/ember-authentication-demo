// Create a data model for articles.
//
// NOTE: This data must match the data in articles.json.
App.Article = DS.Model.extend({
   title:     DS.attr('string'),
   author:    DS.attr('string'),
   published: DS.attr('boolean'),
   body:      DS.attr('string')
});

// Configure the REST adapter to work with our API.
DS.RESTAdapter.reopen({
   namespace: 'api'
});

