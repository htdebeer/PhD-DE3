
var glass_model = require("./models/glass"),
    longdrink_model = require("./models/longdrink_glass"),
    simulation = require("./views/flaskfiller/flaskfiller"),
    table = require("./views/table"),
    graph = require("./views/graph");


window.flaskfiller = window.flaskfiller || function flaskfiller(config) {

    var flow_rate = config.flow_rate || 50; // ml per sec
    var scale = config.scale || 3.5; // px per mm
    var quantities = {
        hoogte: {
            name: "hoogte",
            minimum: 0,
            maximum: 10,
            value: 0,
            label: "hoogte in cm",
            unit: "cm",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: 100,
            value: 0,
            label: "tijd in sec",
            unit: "sec",
            stepsize: 0.1,
            precision: 1,
            monotone: true
        },
        volume: {
            name: "volume",
            minimum: 0,
            maximum: 1000,
            value: 0,
            label: "volume in ml",
            unit: "ml",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        }
    };

    var views = {};
    if (config.simulation) {
        views.simulation = create_view(config.simulation, simulation);
    }
    if (config.table) {
        views.table = create_view(config.table, table);
    }
    if (config.graph) {
        views.graph = create_view(config.graph, graph);
    }

    var models = [];
    config.models.filter(register_model).forEach(register);

    function register_model(model_spec) {
        return model_spec.register;
    }

    function register(model_spec) {
        var model;
        switch(model_spec.type) {
            case "glass":
                model = glass_model(model_spec.name, {
                    name: model_spec.name,
                    shape: model_spec.shape,
                    flow_rate: flow_rate
                });
                break;
            case "longdrink":
                model = longdrink_model(model_spec.name, {
                    name: model_spec.name,
                    radius: model_spec.radius,
                    height: model_spec.height,
                    flow_rate: flow_rate
                });
                break;
            case "predefined":
                break;
        }
        model.step();
        model.reset();

        Object.keys(views).forEach(add_model);

        function add_model(view) {
            views[view].register(model);
        }
    }

    function create_view(config, view_creator) {
        var elt = document.getElementById(config.id);
        if (!elt) {
            throw new Error("Unable to find element with id=" + config.id);
        }

        var view = view_creator({
                quantities: quantities,
                scale: scale,
                horizontal: "tijd",
                vertical: "hoogte",
                dimensions: {
                    width: config.width || 600,
                    height: config.height || 400,
                    ruler_width: 30,
                    margins: {
                        left: 5,
                        right: 5,
                        top: 5,
                        bottom: 5
                    }
                },
                hide_actions: config.hide_actions || []
            });

        elt.appendChild(view.fragment);

        return view;
    }
};

