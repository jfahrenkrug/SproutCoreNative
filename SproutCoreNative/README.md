SproutCoreNative
================

This is a proof of concept. It shows how to use the SproutCore
JavaScript library headless (without a UIWebView) on iOS, running
directly in JavaScriptCore (thanks to Dominic Szablewski for sharing http://www.phoboslab.org/log/2011/06/javascriptcore-project-files-for-ios).

It loads up a JSC context, fakes enough of the browser and the DOM for
jQuery and SproutCore to load (thanks to code from JSDOM) and then
creates a JS Array of objects and a UITableView. The table views gets
filled with that JS data by first creating an instance of a SC.Object
subclass ("Person") for each entry and then using a Handlebars template
to compile the final string.

This is very early, but the possibilities are very cool. Especially when
implementing JS objects and functions in JSC that call back to native
ObjC code (which is not hard to do). Play around with it and let me know
what you think.

Johannes Fahrenkrug (http://twitter.com/jfahrenkrug)
