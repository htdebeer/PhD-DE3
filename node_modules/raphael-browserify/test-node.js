Raphael = require('.');
var jsdom = require('jsdom');
var doc = jsdom.jsdom("<html><head></head><body></body></html>");
var win = doc.createWindow();
Raphael.setWindow(win);

paper = Raphael(0, 0, 640, 480);

paper.clear();
paper.text("Hello, world!");
paper.circle(320, 240, 60);

console.log("You should see valid SVG XML here:\n");
console.log(doc.body.firstChild.outerHTML)


