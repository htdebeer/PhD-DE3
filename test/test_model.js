
var model = require("../src/models/model");

var para = model({
    time: {
        start: 0,
        end: 1000,
        step: 10
    }, quantities: {
        x: {
            minimum: 0,
            maximum: 100,
            value: 0,
            unit: "none",
            label: "x",
            stepsize: 1
            },
        y: {
            minimum: 0,
            maximum: 10000,
            value: 0,
            unit: "none",
            label: "y",
            stepsize: 1
            }
    },
    equation: function(x) {
        return x*x;
    }
});

console.log(para.get_minimum());
console.log(para.get_minimum("x"));
console.log(para.get_maximum());
console.log(para.get_maximum("x"));


