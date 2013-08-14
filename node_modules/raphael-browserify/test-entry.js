Raphael = require("./raphael-browserify");

window.onload = function() {
  paper = Raphael("canvas", 640, 480);

  paper.clear();
  paper.circle(320, 240, 60).animate({
    fill: "#223fa3", stroke: "#000", "stroke-width": 80, "stroke-opacity": 0.5
  }, 2000);
}
