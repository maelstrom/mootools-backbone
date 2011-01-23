window.addEvent('domready', function() {

  module("Backbone.View");

  var view = new Backbone.View({
    id        : 'test-view',
    className : 'test-view'
  });

  test("View: constructor", function() {
    equals(view.el.id, 'test-view');
    equals(view.el.className, 'test-view');
    equals(view.options.id, 'test-view');
    equals(view.options.className, 'test-view');
  });

  test("View: jQuery", function() {
    view.el = document.body;
    equals(view.$('.qunit-header a')[0].innerHTML, 'Backbone Speed Suite');
  });

  test("View: make", function() {
    var div = view.make('div', {id: 'test-div'}, "one two three");
    equals(div.tagName.toLowerCase(), 'div');
    equals(div.id, 'test-div');
    equals($(div).get('text'), 'one two three');
  });

  test("View: initialize", function() {
    var View = Backbone.View.extend({
      initialize: function() {
        this.one = 1;
      }
    });
    var view = new View;
    equals(view.one, 1);
  });

  test("View: delegateEvents", function() {
    var counter = counter2 = 0;

    view.el = document.body;
    view.increment = function(){ counter++; };

    view.el.addEvent('click:relay(h2)', function(){ counter2++; });
    var events = {"click h2": "increment"};

    view.delegateEvents(events);

    view.el.fireEvent('click', {target: $('qunit-banner')});
    equals(counter, 1);
    equals(counter2, 1);

    view.el.fireEvent('click', {target: $('qunit-banner')});
    equals(counter, 2);
    equals(counter2, 2);

	// Test it still works after adding more events
    view.delegateEvents(events);

    view.el.fireEvent('click', {target: $('qunit-banner')});
    equals(counter, 3);
    equals(counter2, 3);

  });

  test("View: _ensureElement with DOM node el", function() {
    var ViewClass = Backbone.View.extend({
      el: document.body
    });
    var view = new ViewClass;
    equals(view.el, document.body);
  });

  test("View: _ensureElement with string el", function() {
    var ViewClass = Backbone.View.extend({
      el: "body"
    });
    var view = new ViewClass;
    equals(view.el, document.body);

    ViewClass = Backbone.View.extend({
      el: "body > h2"
    });
    view = new ViewClass;
    equals(view.el, $("qunit-banner"));

    ViewClass = Backbone.View.extend({
      el: "#nonexistent"
    });
    view = new ViewClass;
    ok(!view.el);
  });

  test("View: multiple views per element", function() {
    var body = $$("body").shift();
    var count = 0, ViewClass = Backbone.View.extend({
      el: body,
      events: {
        "click": "click"
      },
      click: function() {
        count++;
      }
    });

    var view1 = new ViewClass;
    body.fireEvent("click");
    equals(1, count);

    var view2 = new ViewClass;
    body.fireEvent("click");
    equals(3, count);

    view1.delegateEvents();
    body.fireEvent("click");
    equals(5, count);
  });
});
