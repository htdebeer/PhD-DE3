
var model = require("../src/models/equation");
var long_model = require("../src/models/longdrink_glass");
var view = require("../src/views/view");
var table = require("../src/views/table");
var graph = require("../src/views/graph");
var ff = require("../src/views/flaskfiller/flaskfiller");
var tt = require("../src/views/temperaturetyper/temperaturetyper");

var actions = require("../src/actions/actions")({speed: 10});
var actions2 = require("../src/actions/actions")({speed: 10});


var config =  {
    time: {
        start: 0,
        end: 1000,
        step: 10
    },
    quantities: {
        x: {
            minimum: 0,
            maximum: 10,
            value: 0,
            name: "x",
            label: "x in aantallen x-en",
            stepsize: 0.1,
            monotone: true
            },
        y: {
            minimum: 0,
            maximum: 1000,
            value: 0,
            unit: "km",
            name: "y",
            label: "afstand in km",
            stepsize: 1
            },
        time: {
            minimum: 0,
            maximum: 1,
            value: 0,
            unit: 'sec',
            name: "time",
            label: "tijd",
            stepsize: 0.001,
            monotone: true,
            precision: 2
        }
    },
    equation: function(x) {
        return x*x*x;
    },
    actions: {
        start: actions.start,
        pause: actions.pause,
        reset: actions.reset,
        finish: actions.finish,
        remove: actions.remove
    }
};
var config2 =  {
    time: {
        start: 0,
        end: 1000,
        step: 10
    },
    quantities: {
        x: {
            minimum: 0,
            maximum: 10,
            value: 0,
            label: "x",
            stepsize: 0.1,
            monotone: true
            },
        y: {
            minimum: 0,
            maximum: 100,
            value: 0,
            unit: "km",
            label: "y",
            stepsize: 1
            },
        time: {
            minimum: 0,
            maximum: 1,
            value: 0,
            unit: 'sec',
            label: "tijd",
            stepsize: 0.001,
            monotone: true,
            precision: 2
        }
    },
    equation: function(x) {
        return x*x;
    },
    actions: {
        start: actions2.start,
        pause: actions2.pause,
        reset: actions2.reset,
        finish: actions2.finish,
        remove: actions2.remove
    }
};

//para = model('longdrinkglas', config),
//    para2 = model('cocktailglas', config2);

var flow_rate = 50; // ml per sec
var longdrinkglas = long_model("longdrinkglas", {
    radius: 3,
    height: 10,
    flow_rate: flow_rate
});
var breedlongdrinkglas = long_model("breedlongdrinkglas", {
    radius: 6,
    height: 9,
    flow_rate: flow_rate
});

// console.log(para.get_minimum());
// console.log(para.get_minimum("x"));
// console.log(para.get_maximum());
// console.log(para.get_maximum("x"));
// 
// console.log(para.get("_time_"));
// console.log(para.set("x", 50));
// console.log(para.get("_time_"));
// console.log(para.get("_time_"));
// 
// console.log(para.current_moment());


config = {
    quantities: longdrinkglas.quantities
};
var repr = table(config);
var repr2 = graph(config, "tijd", "hoogte");
//var repr3 = ff(config);
var repr4 = tt(config);
var body = document.querySelector("body");
body.appendChild(repr4.fragment);
//body.appendChild(repr3.fragment);

body.appendChild(repr.fragment);
body.appendChild(repr2.fragment);
repr.register(longdrinkglas);
repr.register(breedlongdrinkglas);
repr2.register(longdrinkglas);
repr2.register(breedlongdrinkglas);


