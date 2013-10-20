

var 
    table = require("./views/table"),
    graph = require("./views/graph"),
    temp_model = require("./models/temperature"),
    data_model = require("./models/data"),
    data_util = require("./data/util")
    ;

window.temperature_grapher = window.temperature_grapher || function temperature_grapher(config) {
    var microworld = {};

    var scale = config.scale || 3.5; // px per mm
    var quantities = {
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: 180,
            value: 0,
            label: "tijd in min",
            unit: "min",
            stepsize: 0.01,
            precision: 2,
            monotone: true,
            type: "time"
        },
        temperatuur: {
            name: "temperatuur",
            minimum: 0,
            dont_compute_minimum: true,
            maximum: 100,
            value: 0,
            label: "temperatuur in °C",
            unit: "°C",
            stepsize: 0.01,
            precision: 2,
            monotone: false,
            type: "real"
        }
    };

    if (config.not_in_table) {
        config.not_in_table.forEach(function(q) {
            quantities[q].not_in_table = true;
        });
    }
    if (config.not_in_graph) {
        config.not_in_graph.forEach(function(q) {
            quantities[q].not_in_graph = true;
        });
    }

    var views = {};
    if (config.table) {
        views.table = create_view(config.table, table, config.models);
    }
    if (config.graph) {
        views.graph = create_view(config.graph, graph);
    }


    var models = {
    };
    config.models.filter(register_model).forEach(register);



    if (config.load_models) {
        // get list of models from the server)
        data_util.load_model_list(function(model_list) {
                views.table.add_models_to_list(model_list);
        });
    }


    function unregister(model_name) {

        Object.keys(views).forEach(remove_model);
        
        function remove_model(view) {
            views[view].unregister(model_name);
        }

        delete models[model_name];
        
    }

    function register_model(model_spec) {
        return model_spec.register;
    }

    function register(model_spec, data) {
        var model;
        if (models[model_spec.name]) {
            // cannot create the same model twice
            return;
        }

        if (model_spec.data_model) {
            model_spec.data = data;
            model = data_model(model_spec.name, model_spec);
        } else {
            model = temp_model(model_spec.name, {
                id: model_spec.name
            });
        }

        Object.keys(views).forEach(add_model);
        models[model_spec.name] = model_spec;

        function add_model(view) {
            views[view].register(model);
        }
        
        function generate_unique_name(prefix) {
            function has_prefix(elt) {
                return elt.substr(0, prefix.length) === prefix;
            }


            function postfix(elt) {
                return parseInt(elt.substr(prefix.length + 1), 10);
            }

            function max(arr) {
                if (arr.length > 0 ) {
                    return Math.max.apply(null, arr);
                } else {
                    return 0;
                }
            }
           
            var suffix = max(Object.keys(models).filter(has_prefix).map(postfix)) + 1;
            return prefix + "_" + suffix;
        }
    }


    function create_view(config, view_creator, models) {
        var elt = document.getElementById(config.id);
        if (!elt) {
            throw new Error("Unable to find element with id=" + config.id);
        }

        var view = view_creator({
                quantities: quantities,
                scale: scale,
                horizontal: "tijd",
                vertical: "temperatuur",
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
                hide_actions: config.hide_actions || [],
                models: models,
                microworld: microworld
            });

        elt.appendChild(view.fragment);

        return view;
    }


    microworld.register = register;
    microworld.unregister = unregister;
    return microworld;
};

