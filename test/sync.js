window.addEvent('domready', function() {

  module("Backbone.sync");

  // Variable to catch the last request.
  window.lastRequest = null;

  // Stub out jQuery.ajax...
  Request.prototype.send = function() {
    lastRequest = this.options;
  };


  var Library = Backbone.Collection.extend({
    url : function() { return '/library'; }
  });

  var library = new Library();

  var attrs = {
    title  : "The Tempest",
    author : "Bill Shakespeare",
    length : 123
  };

  test("sync: read", function() {
    Backbone.sync = originalSync;
    library.fetch();
    equals(lastRequest.url, '/library');
    equals(lastRequest.method, 'GET');
    equals(lastRequest.dataType, 'json');
    ok(_.isEmpty(lastRequest.data));
  });

  test("sync: passing data", function() {
    library.fetch({data: {a: 'a', one: 1}});
    equals(lastRequest.url, '/library');
    equals(lastRequest.data.a, 'a');
    equals(lastRequest.data.one, 1);
  });

  test("sync: create", function() {
    library.add(library.create(attrs));
    equals(lastRequest.url, '/library');
    equals(lastRequest.method, 'POST');
    equals(lastRequest.dataType, 'json');
    var data = lastRequest.data;
    equals(data.title, 'The Tempest');
    equals(data.author, 'Bill Shakespeare');
    equals(data.length, 123);
  });

  test("sync: update", function() {
    library.first().save({id: '1-the-tempest', author: 'William Shakespeare'});
    equals(lastRequest.url, '/library/1-the-tempest');
    equals(lastRequest.method, 'PUT');
    equals(lastRequest.dataType, 'json');
    var data = lastRequest.data;
    equals(data.id, '1-the-tempest');
    equals(data.title, 'The Tempest');
    equals(data.author, 'William Shakespeare');
    equals(data.length, 123);
  });

  test("sync: update with emulateHTTP and emulateJSON", function() {
    Backbone.emulateHTTP = Backbone.emulateJSON = true;
    library.first().save({id: '2-the-tempest', author: 'Tim Shakespeare'});
    equals(lastRequest.url, '/library/2-the-tempest');
    equals(lastRequest.method, 'POST');
    equals(lastRequest.dataType, 'json');
    equals(lastRequest.data._method, 'PUT');
    var data = (lastRequest.data.model);
    equals(data.id, '2-the-tempest');
    equals(data.author, 'Tim Shakespeare');
    equals(data.length, 123);
    Backbone.emulateHTTP = Backbone.emulateJSON = false;
  });

  test("sync: update with just emulateHTTP", function() {
    Backbone.emulateHTTP = true;
    library.first().save({id: '2-the-tempest', author: 'Tim Shakespeare'});
    equals(lastRequest.url, '/library/2-the-tempest');
    equals(lastRequest.method, 'POST');
    equals(lastRequest.contentType, 'application/json');
    var data = (lastRequest.data);
    equals(data.id, '2-the-tempest');
    equals(data.author, 'Tim Shakespeare');
    equals(data.length, 123);
    Backbone.emulateHTTP = false;
  });

  test("sync: update with just emulateJSON", function() {
    Backbone.emulateJSON = true;
    library.first().save({id: '2-the-tempest', author: 'Tim Shakespeare'});
    equals(lastRequest.url, '/library/2-the-tempest');
    equals(lastRequest.method, 'PUT');
    equals(lastRequest.contentType, 'application/x-www-form-urlencoded');
    var data = (lastRequest.data.model);
    equals(data.id, '2-the-tempest');
    equals(data.author, 'Tim Shakespeare');
    equals(data.length, 123);
    Backbone.emulateJSON = false;
  });

  test("sync: read model", function() {
    library.first().fetch();
    equals(lastRequest.url, '/library/2-the-tempest');
    equals(lastRequest.method, 'GET');
    ok(_.isEmpty(lastRequest.data));
  });

  test("sync: destroy", function() {
    library.first().destroy();
    equals(lastRequest.url, '/library/2-the-tempest');
    equals(lastRequest.method, 'DELETE');
    equals(lastRequest.data, "");
  });

  test("sync: destroy with emulateHTTP", function() {
    Backbone.emulateHTTP = Backbone.emulateJSON = true;
    library.first().destroy();
    equals(lastRequest.url, '/library/2-the-tempest');
    equals(lastRequest.method, 'POST');
    equals(JSON.stringify(lastRequest.data), '{"_method":"DELETE"}');
    Backbone.emulateHTTP = Backbone.emulateJSON = false;
  });

  test("sync: urlError", function() {
    model = new Backbone.Model();
    raises(function() {
      model.fetch();
    });
    model.fetch({url: '/one/two'});
    equals(lastRequest.url, '/one/two');
  });

});
