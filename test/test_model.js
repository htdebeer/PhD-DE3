
var model = require("../src/models/equation");
var view = require("../src/views/view");
var table = require("../src/views/table");

var actions = require("../src/actions/actions")({speed: 400});

var config =  {
    time: {
        start: 0,
        end: 1000,
        step: 10
    },
    quantities: {
        x: {
            minimum: 0,
            maximum: 100,
            value: 0,
            label: "x",
            stepsize: 1,
            monotonicity: true
            },
        y: {
            minimum: 0,
            maximum: 1000000,
            value: 0,
            unit: "km",
            label: "y",
            stepsize: 1,
            monotonicity: true
            }
    },
    equation: function(x) {
        return x*x*x;
    },
    actions: {
        start: actions.start,
        pause: actions.pause,
        reset: actions.reset,
        finish: actions.finish
    }
}, para = model('longdrinkglas', config);

// console.log(para.get_minimum());
// console.log(para.get_minimum("x"));
// console.log(para.get_maximum());
// console.log(para.get_maximum("x"));
// 
// console.log(para.get("_time_"));
// console.log(para.set("x", 50));
// console.log(para.get("_time_"));
para.set("x", 5);
// console.log(para.get("_time_"));
// 
// console.log(para.current_moment());

var repr = table(config);
var body = document.querySelector("body");
body.appendChild(repr.fragment);
repr.register(para);

para.step();
para.step();
para.step();
para.set("y", 30);

var timer, 
    step = function() {
        if (!para.is_finished()) {
            para.step();
        } else {
            timer = null;
        }
    };

//timer = setInterval(step, 500);
