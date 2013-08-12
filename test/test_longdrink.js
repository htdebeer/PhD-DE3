
var model = require("../src/models/longdrink_glass");
var view = require("../src/views/view");
var table = require("../src/views/table");
//var graph = require("../src/views/graph");



var flow_rate = 50;


var longdrinkglas = model({
    name: 'longdrinkglas', 
    radius: 3,
    height: 10,
    flow_rate: flow_rate
});
var klongdrinkglas = model({
    name: 'klongdrinkglas',
    radius: 2,
    height: 6,
    flow_rate: flow_rate
});


var repr = view(longdrinkglas.quantities);
var body = document.querySelector("body");
var tablerepr = table(longdrinkglas.quantities);

//var repr = table(models, config);
//var repr2 = graph(config, "tijd", "hoogte");

body.appendChild(tablerepr.fragment);
tablerepr.register(longdrinkglas);
tablerepr.register(klongdrinkglas);

//body.appendChild(repr2.fragment);
//tablerepr.register(longdrinkglas);
//repr2.register(para);


