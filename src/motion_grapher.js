
var motion_model = require("./models/motion"),
    motion_editor = require("./views/motion_editor"),
    table = require("./views/table"),
    graph = require("./views/graph"),
    mg_util = require("./motion/util");

window.motion_grapher = window.motion_grapher || function motion_grapher(config) {

    var microworld = {};

    var distance_unit = config.distance_unit || "m",
        time_unit = config.time_unit || "sec",
        speed_unit = config.speed_unit || distance_unit + "/" + time_unit,
        acceleration_unit = config.acceleration_unit || speed_unit + "/" + time_unit;

    var quantities = {
        afgelegde_afstand: {
            name: "afgelegde_afstand",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "afgelegde afstand in " + distance_unit,
            unit: distance_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: config.duration || 10,
            value: 0,
            label: "tijd in " + time_unit,
            unit: time_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        snelheid : {
            name: "snelheid",
            minimum: 0,
            maximum: 0,
            value: config.starting_speed || 0,
            label: "snelheid in " + speed_unit,
            unit: speed_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
        },
        versnelling: {
            name: "versnelling",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "versnelling in " + acceleration_unit,
            unit: acceleration_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
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
    if (config.editor) {
        views.editor = create_view(config.editor, motion_editor);
    }
    if (config.table) {
        views.table = create_view(config.table, table, config.models);
    }
    if (config.graph) {
        views.graph = create_view(config.graph, graph);
    }


    var models = {};
    config.models.filter(register_model).forEach(register);



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

    function register(model_spec) {
        var model;
        if (model_spec.multiple) {
            if (!model_spec.prefix) {
                throw new Error("when a model has option 'multiple', it should also have option 'prefix'.");
            }
            model_spec.name = generate_unique_name(model_spec.prefix);
        } else if (models[model_spec.name]) {
            // cannot create the same model twice
            return;
        }
        var model_config = {
            name: model_spec.name,
            starting_speed: model_spec.starting_speed || 0,
            specification: model_spec.specification || {},
            distance_unit: model_spec.distance_unit || "m",
            time_unit: model_spec.time_unit || "m",
            editor: views.editor
        };

        model_config.speed_unit = model_spec.speed_unit ||
            model_config.distance_unit + "/" + model_config.time_unit;

        model_config.acceleration_unit = model_spec.acceleration_unit || 
            model_config.speed_unit + "/" + model_config.time_unit;

        switch(model_spec.type) {
            case "motion":
                model = motion_model(model_spec.name, model_config);
                break;
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
                horizontal: "tijd",
                vertical: "afgelegde_afstand",
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
