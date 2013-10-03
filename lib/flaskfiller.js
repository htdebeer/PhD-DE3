;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

// using http://fortawesome.github.io/Font-Awesome/icons/ for icons

var actions = function(config) {
    var _actions = {};


    // Running model actions

    var running_models = {},
        current_speed = 17; // refresh rate of about 60 updates per second  || config.speed || 10;

    _actions.speed = function( speed ) {
        if (arguments.length === 1) {
            current_speed = speed;
        }
        return current_speed;
    };

    var is_running =  function(model) {
        return running_models[model.name];
    };

    _actions.start = {
        name: "start",
        group: "run_model",
        icon: "icon-play",
        tooltip: "Start simulation",
        enabled: true,
        callback: function(model) {
           
            var step = function() {
                if (!model.is_finished()) {
                    model.step();
                } else {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                    model.disable_action("finish");
                    model.disable_action("pause");
                    model.disable_action("start");
                    model.update_views();
                }
            };

            return function() {
                    if (!is_running(model)) {
                        running_models[model.name] = setInterval(step, current_speed);
                    }
                    model.disable_action("start");
                    model.enable_action("pause");
                    model.enable_action("reset");
                    model.update_views();
            };
        }
    };

    _actions.pause = {
        name: "pause",
        group: "run_model",
        icon: "icon-pause",
        tooltip: "Pause simulation",
        enabled: false,
        callback: function(model) {
            return function() {
                if (is_running(model)) {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                }
                model.enable_action("start");
                model.disable_action("pause");
                model.update_views();
            };
        }
    };

    _actions.reset = {
        name: "reset",
        group: "run_model",
        icon: "icon-fast-backward",
        tooltip: "Reset simulation",
        enabled: true,
        callback: function(model) {
            return function() {
                if (is_running(model)) {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                }
                model.reset();
                model.enable_action("start");
                model.enable_action("finish");
                model.disable_action("pause");
                model.disable_action("reset");
                model.update_views();
            };
        }
    };

    _actions.finish = {
        name: "finish",
        group: "run_model",
        icon: "icon-fast-forward",
        tooltip: "Finish simulation",
        enabled: true,
        callback: function(model) {
            return function() {
                if (is_running(model)) {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                }
                model.finish();
                model.disable_action("pause");
                model.disable_action("start");
                model.disable_action("finish");
                model.enable_action("reset");
                model.update_views();
            };
        }
    };

    // Toggle view action

    _actions.toggle_line = {
        name: "toggle_line",
        group: "toggle_view",
        icon: "icon-picture",
        tooltip: "Show/hide the line graph of this model",
        enabled: true,
        toggled: false,
        callback: function(model) {
            return function() {
                if (model.graph_is_shown("line")) {
                    this.removeAttribute("data-toggled");
                    model.hide_graph("line");
                } else {
                    this.setAttribute("data-toggled", true);
                    model.show_graph("line");
                }
            };
        }
    };

    _actions.toggle_arrows = {
        name: "toggle_arrows",
        group: "toggle_view",
        icon: "icon-long-arrow-right ",
        tooltip: "Show/hide the arrows graph of this model",
        enabled: true,
        toggled: false,
        callback: function(model) {
            return function() {
                if (model.graph_is_shown("arrows")) {
                    this.removeAttribute("data-toggled");
                    model.hide_graph("arrows");
                } else {
                    this.setAttribute("data-toggled", true);
                    model.show_graph("arrows");
                }
            };
        }
    };

    _actions.toggle_tailpoints = {
        name: "toggle_tailpoints",
        group: "toggle_view",
        icon: "icon-bar-chart",
        tooltip: "Show/hide the tailpoints graph of this model",
        enabled: true,
        toggled: false,
        callback: function(model) {
            return function() {
                if (model.graph_is_shown("tailpoints")) {
                    this.removeAttribute("data-toggled");
                    model.hide_graph("tailpoints");
                } else {
                    this.setAttribute("data-toggled", true);
                    model.show_graph("tailpoints");
                }
            };
        }
    };


    _actions.step_size = {
        name: "step_size",
        group: "step_size",
        tooltip: "Set the step size of the tailpoint graph",
        enabled: true,
        type: "slider",
        callback: function(model) {
            return function() {
                model.step_size(this.value);

                var update_tailpoints = function(graph) {
                    graph.update(model.name);
                };
                model.get_views_of_type("graph").forEach(update_tailpoints);
            };
        }
    };


    return _actions;
};

module.exports = actions;

},{}],2:[function(require,module,exports){
/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var dom = {
    create: function(spec) {
        var elt;
       
        if (spec.name === "textNode") {
           elt = document.createTextNode(spec.value);
        } else {
           elt = document.createElement(spec.name);
        }

        var set_attribute = function(attr) {
                elt.setAttribute(attr, spec.attributes[attr]);
            };

        if (spec.attributes) {
            Object.keys(spec.attributes).forEach(set_attribute);
        }

        if (spec.children) {
            var append = function(child) {
                elt.appendChild(dom.create(child));
            };
            spec.children.forEach(append);
        }

        if (spec.on) {
            if (typeof spec.on === "Array") {
                spec.on.forEach(function(on) {
                    elt.addEventListener( on.type, on.callback );
                });
            } else {
                elt.addEventListener( spec.on.type, spec.on.callback );
            }
        }

        if (spec.value) {
            if (spec.name === "input" || spec.name === "option") {
                elt.value = spec.value;
            } else {
                elt.innerHTML = spec.value;
            }
        }

        if (spec.text) {
            elt.innerHTML = spec.text;
        }

        if (spec.style) {
            var set_style = function(style_name) {
                elt.style[style_name] = spec.style[style_name];
            };
            Object.keys(spec.style).forEach(set_style);
        }

        return elt;
    },
    invert_color: function(color) {
        var R = parseInt(color.slice(1,3), 16),
            G = parseInt(color.slice(3,5), 16),
            B = parseInt(color.slice(5,7), 16),
            inverted_color = "#" +       
               (255 - R).toString(16) +
               (255 - G).toString(16) +
               (255 - B).toString(16);

        console.log(color, inverted_color);
        return inverted_color;
    }
};

module.exports = dom;

},{}],3:[function(require,module,exports){

var glass_model = require("./models/glass"),
    longdrink_model = require("./models/longdrink_glass"),
    predefined = require("./predefined_glasses"),
    simulation = require("./views/flaskfiller/flaskfiller"),
    table = require("./views/table"),
    graph = require("./views/graph"),
    glassgrafter = require("./views/flaskfiller/glass_grafter")
    ;


window.flaskfiller = window.flaskfiller || function flaskfiller(config) {

    var microworld = {};

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
            stepsize: 0.01,
            precision: 2,
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
        },
        stijgsnelheid: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'cm/sec',
            name: 'stijgsnelheid',
            label: 'stijgsnelheid in cm/sec',
            stepsize: 0.01,
            monotone: false,
            precision: 2
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
    if (config.simulation) {
        views.simulation = create_view(config.simulation, simulation);
    }
    if (config.table) {
        views.table = create_view(config.table, table, config.models);
    }
    if (config.graph) {
        views.graph = create_view(config.graph, graph);
    }

    if (config.glassgrafter) {
        var gg = glassgrafter(config.glassgrafter);
        var elt = document.getElementById(config.glassgrafter.id);
        if (!elt) {
            throw new Error("Unable to find element with id=" + config.glassgrafter.id);
        }
        elt.appendChild(gg.fragment);
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
                model = predefined(model_spec.name, flow_rate);
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


},{"./models/glass":4,"./models/longdrink_glass":5,"./predefined_glasses":7,"./views/flaskfiller/flaskfiller":10,"./views/flaskfiller/glass_grafter":12,"./views/graph":15,"./views/table":16}],4:[function(require,module,exports){


var model = require("./model.js");
var paths = require("../svg/path");

var glass = function(name, config) {
    var 
        flow_rate = config.flow_rate || 50,
        shape = config.shape;

    var quantities = {
        hoogte: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'cm',
            name: "hoogte",
            label: "hoogte in cm",
            stepsize: 0.01,
            monotone: true,
            precision: 2
        },
        volume: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'ml',
            name: "volume",
            label: "volume in ml",
            stepsize: 0.1,
            monotone: true,
            precision: 1
        },
        tijd: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'sec',
            name: "tijd",
            label: "tijd",
            stepsize: 0.01,
            monotone: true,
            precision: 2
        },
        stijgsnelheid: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'cm/sec',
            name: 'stijgsnelheid',
            label: 'stijgsnelheid in cm/sec',
            stepsize: 0.01,
            monotone: false,
            precision: 2
        }
    };


    var step = config.step || 10,
        time = {
            start: 0,
            end: quantities.tijd.maximum*1000,
            step: step
        },        
        action_list = config.actions || ["start", "pause", "reset", "finish","toggle_line", "toggle_tailpoints", "toggle_arrows", "step_size"],
        default_actions = require("../actions/actions")({speed: step});

    function create_actions(action_list) {
        var actions = {},
            create_action = function(action_name) {
                actions[action_name] = default_actions[action_name];
            };
        action_list.forEach(create_action);
        return actions;
    }
    var _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });

    var scaled_shape = paths.scale_shape(shape, shape.scale);


    _model.path = function(SCALE, fill, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scaled_shape = scale_shape(shape, SCALE);
        }
        var bowl = _model.bowl_path(SCALE, fill, x_, y_),
            base = _model.base_path(SCALE, fill, x_, y_),
            whole_glass = base + bowl;
        return whole_glass;
    };

    _model.base_path = function(SCALE, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scaled_shape = scale_shape(shape, SCALE);
        }
        var x = x_ || 0,
            y = y_ || 0,
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.base) + "z";
        
        return path;
    };

    _model.bowl_path = function(SCALE, fill, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scaled_shape = paths.scale_shape(shape, SCALE);
        }
        var x = x_ || 0,
            y = y_ || 0,
            path;

        if (fill) {
            var current_moment = _model.current_moment(true),
                fill_length = values[current_moment].length * scaled_shape.factor;
    
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl,
                    fill_length );

        } else {
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl);
        }


        return path;
    };


    function compute_quantities() {

        var scale = scaled_shape.scale,
            bowl = scaled_shape.bowl,
            base = scaled_shape.base,
            path = "M"+ bowl.top.x + "," + bowl.top.y + bowl.path;

        var ms_step = step / 1000;

        var h_start = px_to_cm(base.bottom.y - base.top.y),
            l_start = 0,
            l_end = Raphael.getTotalLength(path);

        function px_to_cm(px) {
            return px / scale / 10;
        }

        function point(length) {
            return Raphael.getPointAtLength(path, length);
        }

        function ml_to_ms(ml) {
            return ml / flow_rate;
        }


        var h = h_start,
            r,
            area,
            vol = 0,
            time = 0,
            speed = 0;

        var l = l_end-1,
            prev = point(l),
            cur = prev,
            delta_time = 0,
            delta_vol = 0,
            delta_h = 0;

        var values = [{
                tijd: time,
                hoogte: h,
                volume: vol,
                length: l,
                stijgsnelheid: speed
            }];

        while (l > l_start) {
            l -= 0.1;
            prev = cur;
            cur = point(l);
            r = px_to_cm((cur.x+prev.x)/2);
            area = Math.PI * r * r;

            delta_h = px_to_cm(Math.abs(prev.y - cur.y));
            delta_vol = area * delta_h;
            delta_time += ml_to_ms(delta_vol);


            h += delta_h;
            vol += delta_vol;

            if (delta_time >= ms_step ) {
                //time += delta_time;
                time += ms_step;
                vol = time * flow_rate;
                speed = (h - values[values.length - 1].hoogte) / delta_time;

                values.push({
                    tijd: time,
                    hoogte: h,
                    volume: vol,
                    length: l,
                    stijgsnelheid: speed
                });

                delta_time = 0;
            }
        }

        values[0].stijgsnelheid = values[1].stijgsnelheid;
        return values;
    }



    var values = []; 

    function compute_maxima() {
        // Has to be computed before the model can be used. Probably time
        // intensive.
        //

        values = compute_quantities();

        var max = values[values.length - 1],
            min = values[0],
            max_tijd_in_ms = (values.length - 1) * step;

        _model.set_end(max_tijd_in_ms / 1000);
        _model.quantities._time_.maximum = max_tijd_in_ms;

        _model.quantities.tijd.maximum = max.tijd.toFixed(quantities.tijd.precision);
        _model.quantities.hoogte.maximum = max.hoogte.toFixed(quantities.hoogte.precision);
        _model.quantities.hoogte.minimum = 0;//min.hoogte.toFixed(quantities.hoogte.precision);
        _model.quantities.volume.maximum = max.volume.toFixed(quantities.volume.precision);

        _model.quantities.stijgsnelheid.maximum = Math.max.apply(null, values.map(function(v) {return v.stijgsnelheid;})) + 1;

        _model.quantities.stijgsnelheid.minimum = Math.min.apply(null, values.map(function(v) {return v.stijgsnelheid;})) - 1;
    }

    compute_maxima();

    _model.measure_moment = function(moment) {
        return values[moment];
    };


    _model.step();
    return _model;
};

module.exports = glass;


},{"../actions/actions":1,"../svg/path":8,"./model.js":6}],5:[function(require,module,exports){
/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var model = require("./model");


/**
 * height in cm
 * radius in cm
 * flow_rate in ml/sec
 *
 */
var longdrink_glass = function(name, config) {

    var radius = config.radius || 2,
        height = config.height || 7.5,
        flow_rate = config.flow_rate || 50;

    /**
     * Compute the volume in ml in the longdrink glass given flow_rate and time the
     * water has flown in seconds.
     */
    function compute_volume(time) {
        return time * flow_rate;
    }
    

    /**
     * Compute the height of the water in cm given the volume of the water in
     * the glass in ml.
     */
    function compute_height(volume) {
        var area = Math.PI * Math.pow(radius, 2);
        if (area > 0) {
            return volume / area;
        } else {
            return 0;
        }
    }

    function create_actions(action_list) {
        var actions = {},
            create_action = function(action_name) {
                actions[action_name] = default_actions[action_name];
            };
        action_list.forEach(create_action);
        return actions;
    }


    var quantities = {
        hoogte: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'cm',
            name: "hoogte",
            label: "hoogte in cm",
            stepsize: 0.01,
            monotone: true,
            precision: 2
        },
        volume: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'ml',
            name: "volume",
            label: "volume in ml",
            stepsize: 0.1,
            monotone: true,
            precision: 1
        },
        tijd: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'sec',
            name: "tijd",
            label: "tijd",
            stepsize: 0.01,
            monotone: true,
            precision: 2
        },
        stijgsnelheid: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: 'cm/sec',
            name: 'stijgsnelheid',
            label: 'stijgsnelheid in cm/sec',
            stepsize: 0.01,
            monotone: false,
            precision: 2
        }
    };


    var step = config.step || 10,
        time = {
            start: 0,
            end: quantities.tijd.maximum*1000,
            step: step
        },
        action_list = config.actions || ["start", "pause", "reset", "finish","toggle_line", "toggle_tailpoints", "toggle_arrows", "step_size"],
        default_actions = require("../actions/actions")({speed: step});
    
    var _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });


    var speed = 0;
    function compute_speed(t) {

        var EPSILON = 0.01;
        speed = (compute_height(compute_volume(1-EPSILON)) - compute_height(compute_volume(1))) / EPSILON;
    }


    function compute_maxima() {
        var area = Math.PI * Math.pow(radius, 2),
            time_max = Math.floor(area*height*10 / flow_rate)/10,
            volume_max = time_max * flow_rate,
            height_max = volume_max / area;

        _model.set_end(time_max);

        _model.quantities.tijd.maximum = time_max.toFixed(quantities.tijd.precision);
        _model.quantities.hoogte.maximum = height_max.toFixed(quantities.hoogte.precision);
        _model.quantities.volume.maximum = volume_max.toFixed(quantities.volume.precision);

        _model.quantities.stijgsnelheid.minimum = speed-1;
        _model.quantities.stijgsnelheid.maximum = speed+1;
    }

    compute_maxima();

    _model.measure_moment = function(moment) {
        var time_in_ms = _model.moment_to_time(moment),
            tijd = time_in_ms / 1000,
            volume = compute_volume(tijd),
            hoogte = compute_height(volume),
            stijgsnelheid = speed
            ;


        return {
            tijd: tijd,
            volume: volume,
            hoogte: hoogte,
            stijgsnelheid: stijgsnelheid
        };
    };

    _model.bowl_path = function(SCALE, fill, x_, y_) {
        var x = x_ || 0,
            y = y_ || 0,
            h = height * SCALE * 10;
        if (fill) {
            h = _model.get("hoogte") * SCALE * 10;
            y += height * SCALE * 10 - h;
        }

        var path = "M" + x + "," + y;
        path += "v" + h;
        path += "h" + radius * 2 * SCALE * 10;
        path += "v-" + h;
        return path;
    };
    _model.base_path = function(SCALE, fill, x_, y_) {
        return "M0,0";
    };
    _model.path = _model.bowl_path;

    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "longdrink";
    _model.height = function(h) {
        if (arguments.length === 1) {
            height = h;
            compute_speed();
            _model.reset_model();
            compute_maxima();
            _model.update_all_views();
        }
        return height;
    };
    _model.radius = function(r) {
        if (arguments.length === 1) {
            radius = r;
            compute_speed();
            _model.reset_model();
            compute_maxima();
            _model.update_all_views();
        }
        return radius;
    };
    _model.flow_rate = function(fr) {
        if (arguments.length === 1) {
            flow_rate = fr;
            compute_speed();
            _model.reset_model();
            compute_maxima();
            _model.update_all_views();
        }
        return flow_rate;
    };

    return _model;
};

module.exports = longdrink_glass;

},{"../actions/actions":1,"./model":6}],6:[function(require,module,exports){
(function(){/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var model = function(name, config) {
    "use strict";

    var _model = {name: name},
        _appendix = {};


    // ## Data invariant and initialization
    //
    // This model describes a dynamic phenomenon in terms of changing
    // quantities over time.
    //
    //
    // This description starts at `T_START` milliseconds
    // (ms), defaulting to 0 ms and ends at `T_END` ms. If no end is specified
    // it is assumed that the phenomenon does not end or is still ongoing in
    // the real world (RW). The phenomenon's change is tracked by "measuring"
    // the changing quantities at consecutive moments in time. These moments
    // are `T_STEP` apart, defaulting to 1 ms, and are tracked by order
    // number.

    var T_START     = config.time.start     || 0,
        T_END       = config.time.end       || Infinity,
        T_STEP      = config.time.step      || 1;

    function set_end(seconds) {
        T_END = seconds*1000;
    }
    _model.set_end = set_end;

    // To translate from a moment's order number to its corresponding time in
    // ms and vice versa, two helper functions are defined, `time_to_moment`
    // and `moment_to_time`, as well as a shorthand name for these two helper
    // functions, respectively, `t2m` and `m2t`.

    _model.time_to_moment = function(time) {
        return Math.floor(time / T_STEP); 
    };
    var t2m = _model.time_to_moment;

    _model.moment_to_time = function(moment) {
        return moment * T_STEP;
    };
    var m2t = _model.moment_to_time;

    // When I use "measured" I mean to denote that the values of the
    // quantities describing the phenomenon have been captured, computed,
    // downloaded, measured, or otherwise obtained. This `model` function is
    // intended to be applicable for describing purely theoretical models of a
    // phenomenon as well as real-time measurements of a phenomenon.
    //
    // "Measuring" a moment is left to the `measure_moment` function. Each
    // model has to (re)implement this function to specify the relationship
    // between the phenomenon's quantities of interest at each moment during
    // the phenomenon.

    _model.measure_moment = function(moment) {
        // to be implemented in an object implementing model
    };


    // The model has the following data invariant:
    //
    //   (∀m: 0 ≤ m ≤ |`moments`|: `moment_computed`(`moments`[m]))
    //
    // stating that the phenomenon has been described quantitatively for all
    // moments. These "measurements" are stored in a list of `moments` and can
    // be accessed through a moment's order number.

    var moments = [];

    _model.get_moment = function(moment) {
        return moments[moment];
    };

    _model.number_of_moments = function() {
        return moments.length;
    };


    // A moment can only be inspected if it already has been "measured".
    // Following the data invariant, a moment has been measured when its order
    // number is smaller or equal to the number of measured moments.
    
    _model.moment_measured = function(moment) {
        return (moment <= (moments.length - 1));
    };

    // Furthermore, the current moment of interest, or `now`, points to an
    // already "measured" moment during the phenomenon's duration. Hence, the
    // data invariant is extended as follows:
    //
    //   `t2m`(`T_START`) ≤ `now` ≤ `t2m`(`T_END`) → `moment_computed`(`now`)

    var now;

    // To ensure this data invariant, `now` is set to a moment before the
    // phenomenon started. 

    now = t2m(T_START) - 1;

    // ## Inspecting and running a model

    // Inspection through registerd views

    var views = [];
    var update_views = function() {
        var update_view = function(view) {
            view.update(_model.name);
        };
        views.forEach(update_view);
    };
    _model.update_views = update_views;

    var update_all_views = function() {
        var update_view = function(view) {
            if (view.update_all) {
                view.update_all();
            } else {
                view.update(_model.name);
            }
        };
        views.forEach(update_view);
    };
    _model.update_all_views = update_all_views;

    _model.register = function(view) {
        var view_found = views.indexOf(view);
        if (view_found === -1) {
            views.push(view);
            views.forEach(function(v) { if(v.update_all) v.update_all();});
        }
    };

    _model.get_views_of_type = function(view_type) {
        return views.filter(function(v) {
            return v.type === view_type;
        });
    };

    _model.unregister = function(view) {
        if (arguments.length === 0) {
            var unregister = function(view) {
                view.unregister(_model.name);
            };
            views.forEach(unregister);
        } else {
            var view_found = views.indexOf(view);
            if (view_found !== -1) {
                views.slice(view_found, 1);
            }
        }
    };

    // As a model can be inspected repeatedly, as is one
    // of the reasons to model a phenomenon using a computer, we introduce a
    // `reset` function to resets `now` to a moment before the phenomenon
    // started.

    _model.reset = function() {
        now = t2m(T_START) - 1;
        _model.step();
        update_views();
    };



    // Once a model has been started, the current moment will be measured as
    // well as all moments before since the start. These moments can be
    // inspected.
    //
    _model.has_started = function() {
        return now >= 0;
    };

    // The `step` function will advance `now` to the next moment if the end of
    // the phenomenon has not been reached yet. If that moment has not been
    // "measured" earlier, "measure" it now.

    _model.step = function(do_not_update_views) {
        if (m2t(now) + T_STEP <= T_END) {
            now++;
            if (!_model.moment_measured(now)) {
                var moment = _model.measure_moment(now);
                moment._time_ = m2t(now);
                moments.push(moment);
            }
        }
        if (!do_not_update_views) {
            update_views();
        }
        return now;
    };

    // If the phenomenon is a finite process or the "measuring" process cannot
    // go further `T_END` will have a value that is not `Infinity`.

    _model.can_finish = function() {
        return Math.abs(T_END) !== Infinity;
    };

    // To inspect the whole phenomenon at once or inspect the last moment,
    // `finish`ing the model will ensure that all moments during the
    // phenomenon have been "measured".

    _model.finish = function() {
        var DO_NOT_UPDATE_VIEWS = true;
        if (_model.can_finish()) {
            while ((moments.length - 1) < t2m(T_END)) {
                _model.step(DO_NOT_UPDATE_VIEWS);
            }
        }
        now = moments.length - 1;
        _model.update_views();
        return now;
    };

    // We call the model finished if the current moment, or `now`, is the
    // phenomenon's last moment.

    _model.is_finished = function() {
        return _model.can_finish() && m2t(now) >= T_END;
    };

    function reset_model() {
        moments = [];
        _model.action("reset").callback(_model)();
//        _model.reset();
    }
    _model.reset_model = reset_model;

    /** 
     * ## Actions on the model
     *
     */
    _model.actions = {};
    _model.add_action = function( action ) {
        _model.actions[action.name] = action;
        _model.actions[action.name].install = function() {
            return action.callback(_model);
        };
    };
    if (config.actions) {
        var add_action = function(action_name) {
            _model.add_action(config.actions[action_name]);
        };
        Object.keys(config.actions).forEach(add_action);
    }
    _model.action = function( action_name ) {
        if (_model.actions[action_name]) {
            return _model.actions[action_name];
        }
    };
    _model.remove_action = function( action ) {
        if (_model.actions[action.name]) {
            delete _model.actions[action.name];
        }
    };
    _model.disable_action = function( action_name ) {
        if (_model.actions[action_name]) {
            _model.actions[action_name].enabled = false;
        }
    };
    _model.enable_action = function( action_name ) {
        if (_model.actions[action_name]) {
            _model.actions[action_name].enabled = true;
        }
    };
    _model.toggle_action = function( action_name ) {
        if (_model.actions[action_name]) {
            _model.actions[action_name].enabled = 
                !_model.action[action_name].enabled;
        }
    };

           
    // ## Coordinating quantities
    //
    // All quantities that describe the phenomenon being modeled change in
    // coordination with time's change. Add the model's time as a quantity to
    // the list with quantities. To allow people to model time as part of
    // their model, for example to describe the phenomenon accelerated, the
    // internal time is added as quantity `_time_` and, as a result, "_time_"
    // is not allowed as a quantity name.

    _model.quantities = config.quantities || {};
    
    _model.quantities._time_ = {
        hidden: true,
        minimum: T_START,
        maximum: T_END,
        value: m2t(now),
        stepsize: T_STEP,
        unit: "ms",
        label: "internal time",
        monotone: true
    };


    _model.get_minimum = function(quantity) {
        if (arguments.length===0) {
            // called without any arguments: return all minima
            var minima = {},
                add_minimum = function(quantity) {
                    minima[quantity] = parseFloat(_model.quantities[quantity].minimum);
                };

            Object.keys(_model.quantities).forEach(add_minimum);
            return minima;
        } else {
            // return quantity's minimum
            return parseFloat(_model.quantities[quantity].minimum);
        }
    };
                    
    _model.get_maximum = function(quantity) {
        if (arguments.length===0) {
            // called without any arguments: return all minima
            var maxima = {},
                add_maximum = function(quantity) {
                    maxima[quantity] = parseFloat(_model.quantities[quantity].maximum);
                };

            Object.keys(_model.quantities).forEach(add_maximum);
            return maxima;
        } else {
            // return quantity's minimum
            return parseFloat(_model.quantities[quantity].maximum);
        }
    };


    _model.find_moment = function(quantity, value, EPSILON) {
        if (moments.length === 0) {
            // no moment are measured yet, so there is nothing to be found

            return -1;
        } else {
            var val = _appendix.quantity_value(quantity);

            // pre: quantity is monotone
            // determine if it is increasing or decreasing
            // determine type of monotone
            //
            // As the first moment has been measured and we do know the
            // minimum of this quantity, type of monotone follows.

            var start = val(0),
                INCREASING = (start !== _model.get_maximum(quantity));


            // Use a stupid linear search to find the moment that approaches the
            // value best


            var m = 0,
                n = moments.length - 1,
                lowerbound,
                upperbound;


            if (INCREASING) {
                lowerbound = function(moment) {
                    return val(moment) < value;
                };
                upperbound = function(moment) {
                    return val(moment) > value;
                };
            } else {
                lowerbound = function(moment) {
                    return val(moment) > value;
                };
                upperbound = function(moment) {
                    return val(moment) < value;
                };
            }

            // Increasing "function", meaning
            //
            //  (∀m: 0 ≤ m < |`moments`|: `val`(m) <= `val`(m+1))
            //
            // Therefore,
            //
            //  (∃m, n: 0 ≤ m < n ≤ |`moments`|: 
            //      `val`(m) ≤ value ≤ `val`(n) ⋀
            //      (∀p: m < p < n: `val`(p) = value))
            //
            // `find_moment` finds those moments m and n and returns the
            // one closest to value or, when even close, the last moment
            // decreasing is reverse.
            

            while (lowerbound(m)) {
                m++;
                if (m>n) {
                    // 
                    return -1;
                }
            }
            return m;
            //m--;
            /*
            while (upperbound(n)) {
                n--;
                if (n<m) {
                    return -1;
                }
            }
            //n++;


            return (Math.abs(val(n)-value) < Math.abs(val(m)-value))?n:m;
            */
        }
    };


    _model.get = function(quantity) {
        if (now < 0) {
            return undefined;
        } else {
            return moments[now][quantity];
        }
    };
    
    _model.set = function(quantity, value) {
        var q = _model.quantities[quantity];

        if (value < parseFloat(q.minimum)) {
            value = parseFloat(q.minimum);
        } else if (value > parseFloat(q.maximum)) {
            value = parseFloat(q.maximum);
        }


        // q.minimum ≤ value ≤ q.maximum

        // has value already been "measured"?
        // As some quantities can have the same value more often, there are
        // potentially many moments that fit the bill. There can be an unknown
        // amount of moments that aren't measured as well.
        //
        // However, some quantities will be strictly increasing or decreasing
        // and no value will appear twice. For example, the internal time will
        // only increase. Those quantities with property `monotone`
        // `true`, only one value will be searched for
        
        var approx = _appendix.approximates(),
            moment = -1;
        if (q.monotone) {
            moment = _model.find_moment(quantity, value);

            if (moment === -1) {
                // not yet "measured"
                var DO_NOT_UPDATE_VIEWS = true;
                _model.step(DO_NOT_UPDATE_VIEWS);
                // THIS DOES WORK ONLY FOR INCREASING QUANTITIES. CHANGE THIS
                // ALTER WITH FIND FUNCTION !!!!
                while((moments[now][quantity] < value) && !_model.is_finished()) {
                    _model.step(DO_NOT_UPDATE_VIEWS);
                }
            } else {
                now = moment;
            }
            update_views();
            return moments[now];
        }
    };

    _model.data = function() {
        return moments.slice(0, now + 1);
    };

    _model.current_moment = function(moment_only) {
        if (moment_only) {
            return now;
        } else {
            return moments[now];
        }
    };

    _model.graphs_shown = {
        tailpoints: false,
        line: false,
        arrows: false
    };

   

     _model.show_graph = function(kind) {
        var graphs = _model.get_views_of_type("graph");

        function show_this_graph(g) {
            switch(kind) {
                case "line":
                    g.show_line(_model.name);
                    break;
                case "tailpoints":
                    g.show_tailpoints(_model.name);
                    break;
                case "arrows":
                    g.show_arrows(_model.name);
                    break;
            }
        }
        graphs.forEach(show_this_graph);
        _model.graphs_shown[kind] = true;

    };

    _model.hide_graph = function(kind) {
        var graphs = _model.get_views_of_type("graph");

        function hide_this_graph(g) {
            switch(kind) {
                case "line":
                    g.hide_line(_model.name);
                    break;
                case "tailpoints":
                    g.hide_tailpoints(_model.name);
                    break;
                case "arrows":
                    g.hide_arrows(_model.name);
                    break;
            }
        }
        graphs.forEach(hide_this_graph);
        _model.graphs_shown[kind] = false;

    };

    _model.graph_is_shown = function(kind) {
        return _model.graphs_shown[kind];
    };


    // ## _appendix H: helper functions

    _appendix.approximates = function(epsilon) {
            var EPSILON = epsilon || 0.001,
                fn = function(a, b) {
                    return Math.abs(a - b) <= EPSILON;
                };
            fn.EPSILON = EPSILON;
            return fn;
        };
    _appendix.quantity_value = function(quantity) {
            return function(moment) {
                return moments[moment][quantity];
            };
        };


    var step = (config.step_size || T_STEP)*5 ;
    function step_size(size) {
        if (arguments.length === 1) {
            step = size;
        }
        return step;
    }
    _model.step_size = step_size;

    function random_color() {
        var hexes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
            colors = [],
            i = 0;
           
        while (i < 6) {
            colors.push(hexes[Math.round(Math.random()*(hexes.length - 1))]);
            i++;
        }
        return "#"+ colors.join("");
    }

    var color = random_color();
    _model.color = function(c) {
        if (arguments.length === 1) {
            if (c === "random") {
                color = random_color();
            } else {
                color = c;
            }
        }
        return color;
    };
    return _model;
};    


module.exports = model;

})()
},{}],7:[function(require,module,exports){


var glass_model = require("./models/glass");

var glass_specifications = {
    klein_longdrinkglas: {"bowl":{"top":{"x":67,"y":188},"bottom":{"x":67,"y":358},"path":"l0,170"},"base":{"top":{"x":67,"y":358},"bottom":{"x":67,"y":365},"path":"l0,7"},"scale":3},
    longdrinkglas: {
        "bowl":{"top":{"x":88,"y":46},"bottom":{"x":88,"y":375},"path":"l0,329"},"base":{"top":{"x":88,"y":375},"bottom":{"x":88,"y":415},"path":"l0,40"},"scale":3
    },
    groter_longdrinkglas: {
        "bowl":{"top":{"x":94,"y":37},"bottom":{"x":94,"y":405},"path":"l0,368"},"base":{"top":{"x":94,"y":405},"bottom":{"x":94,"y":415},"path":"l0,10"},"scale":3
    },
    breed_longdrinkglas: {
        "bowl":{"top":{"x":129,"y":122},"bottom":{"x":129,"y":360},"path":"l0,238"},"base":{"top":{"x":129,"y":360},"bottom":{"x":129,"y":415},"path":"l0,55"},"scale":3
    },
    cocktailglas: {
        "bowl":{"top":{"x":169,"y":8},"bottom":{"x":19,"y":228},"path":"l-150,220"},"base":{"top":{"x":19,"y":228},"bottom":{"x":123,"y":465},"path":"l0,210 l96,20 c5,2.5,7.5,7.5,8,7"},"scale":3
    },
    klein_cocktailglas: {
        "bowl":{"top":{"x":141,"y":94},"bottom":{"x":10,"y":404},"path":"l-117,221.8125 l-14,88.1875"},"base":{"top":{"x":10,"y":404},"bottom":{"x":95,"y":465},"path":"l0,51 l76,1 c5,2.5,7.5,7.5,9,9"},"scale":3
    },
    wijnglas: {
        "bowl":{"top":{"x":99,"y":36},"bottom":{"x":15,"y":286},"path":"c6,100,20,150,-84,250"},"base":{"top":{"x":15,"y":286},"bottom":{"x":101,"y":465},"path":"l2,164 l79,8 c5,2.5,7.5,7.5,5,7"},"scale":3
    },
    cognacglas: {
            "bowl":{"top":{"x":69,"y":140},"bottom":{"x":19,"y":376},"path":"l49,133.8125 c12,40,-30,85,-99,102.1875"},"base":{"top":{"x":19,"y":376},"bottom":{"x":101,"y":465},"path":"l0,70 l77,9 c5,2.5,7.5,7.5,5,10"},"scale":3
    },
    bierglas: {
        "bowl":{"top":{"x":108,"y":122},"bottom":{"x":71,"y":459},"path":"l1,100.8125 c0,15,-10,15,-18,33 l-20,203.1875"},"base":{"top":{"x":71,"y":459},"bottom":{"x":71,"y":465},"path":"l0,6"},"scale":3
    },
    vaas: {
        "bowl":{"top":{"x":53,"y":227},"bottom":{"x":119,"y":456},"path":"l0,95.96875 l66,1 l0,132.03125"},"base":{"top":{"x":119,"y":456},"bottom":{"x":119,"y":465},"path":"l0,9"},"scale":3
    }
};

module.exports = function(name, flow_rate) {
    return glass_model(name, {
        name: name,
        shape: glass_specifications[name],
        flow_rate: flow_rate
    });
};

},{"./models/glass":4}],8:[function(require,module,exports){


function start_of_path(path) {
    return Raphael.getPointAtLength(path, 0);
}

function end_of_path(path) {
    return Raphael.getPointAtLength(path,
            Raphael.getTotalLength());
}

function complete_path(part, fill_length) {
    var start = part.top,
        end = part.bottom,
        path = part.path;
    
    if (fill_length) {
        path = "m" + start.x + "," + start.y + path;
        start = Raphael.getPointAtLength(path, fill_length);

        var total_length = Raphael.getTotalLength(path);

        path = Raphael.getSubpath(path, fill_length, total_length);
        path = Raphael.pathToRelative(path);
        path.shift(); // remove the M command
        path = path.toString();
    }
   
    var segments = Raphael.parsePathString(path),
        completed_path = "m" + start.x + "," + start.y + path;


    completed_path += "h-" +(Math.abs(0 - end.x) * 2);

    var mirror_segment = function(segment) {
        var command = segment[0],
            x,y, cp1, cp2,
            mirrored_segment = "";

        switch (command) {
            case "l":
                x = segment[1];
                y = segment[2];
                mirrored_segment = "l" + x + "," + (-y);
                start = {
                    x: start.x + x,
                    y: start.y + y
                };
                break;
            case "c":
                cp1 = {
                    x: segment[1],
                    y: segment[2]
                };
                cp2 = {
                    x: segment[3],
                    y: segment[4]
                };

                x = segment[5];
                y = segment[6];
                end = {
                    x: x,
                    y: y
                };
                mirrored_segment = "c" + (end.x - cp2.x) + "," + (-(end.y - cp2.y)) + "," +
                    (end.x - cp1.x) + "," + (-(end.y - cp1.y)) + "," + 
                    (x) + "," + (-y);
                start = {
                    x: start.x + x,
                    y: start.y + y
                };
                break;
            case "v":
                y = segment[1];
                mirrored_segment = "v" + (-y);
                start = {
                    x: start.x,
                    y: start.y + y
                };
                break;
            case "h":
                x = segment[1];
                mirrored_segment = "h" + x;
                start = {
                    x: start.x + x,
                    y: start.y
                };
                break;
            case "m":
                // skip

                break;
        }

        return mirrored_segment;
    };

    completed_path += segments.map(mirror_segment).reverse().join("");


    return completed_path;
}

function scale_shape(shape, scale_) {
    var model_scale = shape.scale,
        factor = scale_/model_scale;

    var scale = function(number) {
            return number * factor;
        };

    function scale_path(path, factor) {
        var path_segments = Raphael.parsePathString(path),
            scale_segment = function(segment) {
                var segment_arr = segment,
                    command = segment_arr.shift();

                return command + segment_arr.map(scale).join(",");
            };

        return path_segments.map(scale_segment).join("");
    }

    return {
        base: {
            path: scale_path(shape.base.path, factor),
            bottom: {
                x: scale(shape.base.bottom.x),
                y: scale(shape.base.bottom.y)
            },
            top: {
                x: scale(shape.base.top.x),
                y: scale(shape.base.top.y)
            }
        },
        bowl: {
            path: scale_path(shape.bowl.path, factor),
            bottom: {
                x: scale(shape.bowl.bottom.x),
                y: scale(shape.bowl.bottom.y)
            },
            top: {
                x: scale(shape.bowl.top.x),
                y: scale(shape.bowl.top.y)
            }
        },
        scale: scale_,
        factor: factor
    };
}

module.exports = {
    start: start_of_path,
    end: end_of_path,
    complete_path: complete_path,
    scale_shape: scale_shape
};

},{}],9:[function(require,module,exports){


var paths = require("../../svg/path");

var contour_line = function(canvas, shape_, BOUNDARIES) {

    var _contour_line = {};

    var SCALE = shape_.scale;

    var points = [],
        bottom_point,
        marriage_point,
        top_point;

    _contour_line.current_action = "remove";

    function create_point(x, y, type) {
        var r, attributes;
        switch(type) {
            case "part":
                r = 3;
                attributes = {
                    fill: "white",
                    stroke: "black",
                    "stroke-width": 2
                };
                break;
            case "segment":
                r = 2;
                attributes = {
                    fill: "black",
                    stroke: "black"
                };
                break;
            case "control":
                r = 2;
                attributes = {
                    fill: "silver",
                    stroke: "silver"
                };
                break;
        }
                  
        var point = canvas.circle(x, y, r);
        point.type = type;
        point.x = function() {return this.attr("cx");};
        point.y = function() {return this.attr("cy");};

        point.control_points = canvas.set();
        point.control_points.cp1 = canvas.circle(0,0, 3);
        point.control_points.cp1.attr({
            fill: "yellow",
            stroke: "blue"
        });
        point.control_points.cp2 = canvas.circle(0,0, 3);
        point.control_points.cp2.attr({
            fill: "yellow",
            stroke: "blue"
        });
        point.control_points.push(point.control_points.cp1);
        point.control_points.push(point.control_points.cp2);
        point.control_points.hide();
        


        point.index = -1;
        point.next_point = function() {
            if (this.index < points.length - 1) {
                return points[this.index + 1];
            }
            return null;
        };
        point.prev = function() {
            if (this.index > 0) {
                return points[this.index - 1];
            }
            return null;
        };
        point.attr(attributes);
        point.drag( move(point), start_move(point), end_move(point) );
        point.dblclick(action_on_point(point));

        return point;
    }

    function action_on_point(point) {
        return function(event) {
            switch (_contour_line.current_action) {
                case "remove":
                    remove_point(point);
                    break;
                case "curve":
                    curve_point(point);
                    break;
                case "straight":
                    straight_point(point);
                    break;
            }
        };
    }

    var original_x = 0, original_y = 0;
    function move(point) {

        function moveable(new_x, new_y) {
            if (BOUNDARIES.x < new_x && new_x < BOUNDARIES.x + BOUNDARIES.width) {
                switch (point.name) {
                    case "top":
                        if (BOUNDARIES.y < new_y && new_y < point.next_point().y()) {
                            return true;
                        } else {
                            return false;
                        }
                        break;
                    case "bottom":
                        return true;
                    default:
                        if (point.prev().y() < new_y && new_y < point.next_point().y()) {
                            return true;
                        } else {
                            return false;
                        }
                    }
            } else {
                return false;
            }
            return true;
        }

        return function (dx, dy) {
            var new_x = original_x + dx,
                new_y;    
            if (point.name === "bottom") {
                new_y = original_y;
            } else {
                new_y = original_y + dy;
            }
            if (moveable(new_x, new_y)) {
                update_point(point, new_x, new_y);
                draw();
            }
        };
    }

    function update_point(point, x, y) {
        if (point.name !== "top" && (
                    point.prev().segment.command === "c" ||
                    point.prev().segment.command === "l")) {
            point.prev().segment.x = x;
            point.prev().segment.y = y;
        }
        
        point.attr({
            "cx": x,
            "cy": y
        });
    }

    function start_move(point) {
        return function () {
            original_x = point.x();
            original_y = point.y();
        };
    }

    function end_move(point) {
        return function (event) {
        };
    }

    function remove_point(point) {
        if (point.type !== "part") {
            _contour_line.remove(point.index);    
        }
    }

    function show_control_points() {
        points.forEach(function(point) {
            if (point.segment.command === "c") {
                point.control_points.cp1.attr({
                    cx: point.segment.cp1.x,
                    cy: point.segment.cp1.y
                });
                point.control_points.cp2.attr({
                    cx: point.segment.cp2.x,
                    cy: point.segment.cp2.y
                });
                point.control_points.show();
            }
        });
    }
    _contour_line.show_control_points = show_control_points;

    function hide_control_points() {
        points.forEach(function(point) {
            point.control_points.hide();
        });
    }
    _contour_line.hide_control_points = hide_control_points;

    function curve_point(point) {
        var DIST = 10;
        point.segment.command = "c";
        point.segment.cp1 = {
            x: DIST,
            y: DIST
        };
        point.segment.cp2 = {
            x: - DIST,
            y: - DIST
        };
        draw();
    }

    function straight_point(point) {
        point.segment.command = "l";
        draw();
    }

    function parse_segment(segment) {
        var command = segment.charAt(0),
            elts = segment.slice(1).split(/ |,/),
            specification = {
                command: command
            };

        switch (command) {
            case "v":
                specification.length = parseFloat(elts[0]);
                break;
            case "h":
                specification.length = parseFloat(elts[0]);
                break;
            case "l":
                specification.x = parseFloat(elts[0]);
                specification.y = parseFloat(elts[1]);
                break;
            case "c":
                specification.cp1 = {
                    x: parseFloat(elts[0]),
                    y: parseFloat(elts[1])
                };
                specification.cp2 = {
                    x: parseFloat(elts[2]),
                    y: parseFloat(elts[3])
                };
                specification.x = parseFloat(elts[4]);
                specification.y = parseFloat(elts[5]);
                break;
        }
        return specification;
    }

    _contour_line.insert = function(x, y, index, type, segment) {
        var prev = points[index - 1],
            next = points[index],
            point = create_point(x, y, type);

        if (segment.command !== "c") {
            segment.cp1 = {
                x: 0,
                y: 0
            };
            segment.cp2 = {
                x: 0,
                y: 0
            };
        }
        point.segment = segment;
        point.name = "";

        point.index = index;

        points.forEach(function(point) {
            if (point.index >= index) {
                point.index++;
            }
        });
        points.splice(index, 0, point);
        return point;
    };

    _contour_line.remove = function(index) {
      
        var point = points[index];
        if (point.type === "part") {
            throw new Error("cannot remove part-point");
        }

        var prev = point.prev(),
            next = point.next_point();


        prev.segment = {
            command: "l",
            x: next.x() - prev.x(),
            y: next.y() - prev.y()
        };
        point.remove();
        delete points[index];
        points.forEach(function(point) {
            if (point.index > index) {
                point.index--;
            }
        });
        points.splice(index, 1);
        draw();
    };

    function populate_points(shape) {
        var part = shape.bowl,
            path = part.path,
            segments = path.split(/ /);

        var i = 0, next_point,
            x = part.top.x,
            y = part.top.y
            ;
        
        next_point = add_point(segments, x, y, i, "part");
        top_point = points[i];
        top_point.name = "top";
        i++;
        while (i < segments.length) {
            next_point = add_point(segments, next_point.x, next_point.y, i, "segment");
            i++;
        }

        var bowl_number_of_points = i;

        part = shape.base;
        path = part.path;
        segments = path.split(/ /);
        i = 0;
        x = part.top.x;
        y = part.top.y;

        next_point = add_point(segments, x, y, i, "part", bowl_number_of_points);
        marriage_point = points[bowl_number_of_points];
        marriage_point.name = "marriage";
        i++;
        while (i < segments.length) {
            next_point = add_point(segments, next_point.x, next_point.y, i, "segment", bowl_number_of_points);
            i++;
        }

        add_point([], next_point.x, next_point.y, i, "part", bowl_number_of_points);
        bottom_point = points[i+bowl_number_of_points];
        bottom_point.name = "bottom";

        function add_point(segments, x, y, index, type, addendum) {
            var new_x = x, new_y = y, new_index,
                add_to_index = addendum || 0;

            var segment_string = segments[index] || "";
            var segment = parse_segment(segment_string) || [];

            _contour_line.insert(
                x,
                y,
                index + add_to_index,
                type,
                segment
            );

            switch (segment.command) {
                case "v":
                    new_y = y + segment.length;
                    break;
                case "l":
                    new_x = x + segment.x;
                    new_y = y + segment.y;
                    break;
                case "c":
                    new_x = x + segment.x;
                    new_y = y + segment.y;
                    break;
                case "h":
                    new_x = x + segment.length;
                    break;
                default:
                    new_x = 0;
                    new_y = 0;
                    break;
            }
            
            return {
                x: new_x,
                y: new_y
            };
        }
    }




    function path_segment(point) {
        var path = "",
            next = point.next_point();

        var
            x = next.x() - point.x(),
            y = next.y() - point.y();
        switch (point.segment.command) {
            case "v":
                path = "v" + point.segment.length;
                break;
            case "h":
                path = "h" + point.segment.length;
                break;
            case "l":
                path = "l" + x + "," + y;
                break;
            case "c":
                path = "c" + point.segment.cp1.x + "," + point.segment.cp1.y + "," +
                    point.segment.cp2.x + "," + point.segment.cp2.y + "," +
                    x + "," + y;
                break;
        }
        return path;
    }


    function part_path(start) {
        var cur = start,
            paths = [];
        paths.push(path_segment(cur));
        while (cur.next_point().type !== "part") {
            cur = cur.next_point();
            paths.push(path_segment(cur));
        }
        return paths.join(" ");
    }

    _contour_line.shape = function() {
        return {
            bowl: {
                top: {
                    x: top_point.x(),
                    y: top_point.y()
                },
                bottom: {
                    x: marriage_point.x(),
                    y: marriage_point.y()
                },
                path: part_path(top_point)
            },
            base: {
                top: {
                    x: marriage_point.x(),
                    y: marriage_point.y()
                },
                bottom: {
                    x: bottom_point.x(),
                    y: bottom_point.y()
                },
                path: part_path(marriage_point)
            },
            scale: shape_.scale
        };
    };


    var bowl_path = canvas.path("M0,0"), 
        base_path = canvas.path("M0,0")
            ;

    base_path.attr({
        "stroke-width":2,
        "fill": "dimgray",
        "fill-opacity": 0.5
    });
    bowl_path.attr({
        "stroke-width": 2,
        "fill": "none"
    });

    bowl_path.click(add_point);
    base_path.click(add_point);

    var add_point_dot = canvas.circle(0,0,6);
    add_point_dot.attr({
        fill: "orange",
        "fill-opacity": 0.5,
        stroke: "dimgray"
    });
    add_point_dot.hide();

    function convert_to_user_coords(x, y) {
        var svgbb = canvas.canvas.getBoundingClientRect(),
            plus_left = svgbb.left +  window.pageXOffset,
            plus_top = svgbb.top + window.pageYOffset;

        return {
            x: x - plus_left,
            y: y - plus_top
        };
    }

    function add_point(event, x_, y_) {
        // find point directly above
       
        var user_coords = convert_to_user_coords(x_, y_),
            x = user_coords.x,
            y = user_coords.y;

        var next_index = 0;
        while (points[next_index].y() < y) {
            next_index++;
        }

        var point = _contour_line.insert(x, y, next_index, "segment", {command: "l"});

        point.segment.x = point.next_point().x() - x;
        point.segment.y = point.next_point().y() - y;
        point.prev().segment.x = x - point.prev().x();
        point.prev().segment.y = y - point.prev().y();

        draw();

    }


    function normalize_shape(shape) {
        var MID_X = BOUNDARIES.x;
        shape.bowl.top.x -= MID_X;
        shape.bowl.bottom.x -= MID_X;
        shape.base.top.x -= MID_X;
        shape.base.bottom.x -= MID_X;
        return shape;
    }

    function draw() {
        var shape = normalize_shape(_contour_line.shape());
        var x = BOUNDARIES.x,
            y = 0;

        bowl_path.attr({
            path: "M" + x + "," + y + paths.complete_path(shape.bowl)
        });

        base_path.attr({
            path: "M" + x + "," + y + paths.complete_path(shape.base) + "z"
        });

    }


    populate_points(shape_);
    draw();
    _contour_line.print_shape = function() {
        var shape = normalize_shape(_contour_line.shape());
        console.log(JSON.stringify(shape));
    };
    _contour_line.bottom = bottom_point;
    _contour_line.marriage = marriage_point;
    _contour_line.top = top_point;
    return _contour_line;
};

module.exports = contour_line;

},{"../../svg/path":8}],10:[function(require,module,exports){

var view = require("../view"),
    dom = require("../../dom/dom"),
    ruler = require("./ruler"),
    longdrink = require("./longdrink_glass"),
    various_glass = require("./glass");

var flaskfiller = function(config) {
    var _flaskfiller = view(config);

    var scale = config.scale || 3.5; // px per mm

    var dimensions = config.dimensions || {
        width: 900,
        height: 600,
        ruler_width: 30,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };

    var CONTAINER = {
            width: dimensions.width || 900,
            height: dimensions.height || 600
        };

    var RULERS = {
            horizontal: {
                x:  dimensions.ruler_width + dimensions.margins.left,
                y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
                width: CONTAINER.width - dimensions.ruler_width - dimensions.margins.left - dimensions.margins.right,
                height: dimensions.ruler_width,
                scale: scale,
                orientation: "horizontal"
            },
            vertical: {
                x:  0 + dimensions.margins.left,
                y:  0 + dimensions.margins.top,
                width: dimensions.ruler_width,
                height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom,
                scale: scale,
                orientation: "vertical"
            }
        };

    var SIMULATION = {
            x:  dimensions.ruler_width + dimensions.margins.left,
            y:  0 + dimensions.margins.top,
            width: CONTAINER.width - dimensions.ruler_width - dimensions.margins.left - dimensions.margins.right,
            height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom
        };


    _flaskfiller.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "flaskfiller"
            }
        }));

    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_flaskfiller.fragment);

    var canvas = Raphael(_flaskfiller.fragment, 
            CONTAINER.width, 
            CONTAINER.height);

    var vertical_ruler = ruler(canvas, RULERS.vertical, CONTAINER.width)
            .style({
                "background": "white"
            }),
        horizontal_ruler = ruler(canvas, RULERS.horizontal, CONTAINER.height)
            .style({
                "background": "white"
            }),
        cm_label = draw_cm_label();



    function draw_cm_label() {
       var x = dimensions.margins.left + (dimensions.ruler_width / 3),
           y = CONTAINER.height - (dimensions.ruler_width / 2) - dimensions.margins.bottom,
           cm_label = canvas.text(x, y, "cm");

       cm_label.attr({
           "font-family": "inherit",
           "font-size": "18pt",
           "font-weight": "bolder",
           "fill": "dimgray"
       }); 

       return cm_label;
    }


    function add_glass(model) {
        var glass;
        if (model.type === "longdrink") {
            glass = longdrink(canvas, model, scale);
        } else {
            glass = various_glass(canvas, model, scale);
        }
        glass.toFront();
        return glass;
    }

    function update_glass(glass) {
        glass.update_color();        
        glass.update();
    }

    _flaskfiller.update = function(model_name) {
        var model = _flaskfiller.get_model(model_name);

        if (!model.glass) {
            model.glass = add_glass(model.model);
            model.glass.draw_at_bottom(SIMULATION, Math.random() * SIMULATION.width);
        }

        update_glass(model.glass);

    };

    _flaskfiller.remove = function(model_name) {
        var model = _flaskfiller.get_model(model_name);
        model.glass.remove();
    };


    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_flaskfiller.fragment);
    return _flaskfiller;

};

module.exports = flaskfiller;

},{"../../dom/dom":2,"../view":17,"./glass":11,"./longdrink_glass":13,"./ruler":14}],11:[function(require,module,exports){
var glass = function(canvas, model, SCALE) {
    var _glass = canvas.set();

    var GLASS_BORDER = 3;

    var x = 0, 
        y = 0, 
        width, 
        height;

    var PADDING = 5;


    function update() {
        fill.attr("fill", model.color());
        _glass.draw_at(_glass.x, _glass.y);
    }

    var fill, base_shape, bowl_shape, max_line, max_label, label, glass_pane;

    function draw() {
        label = canvas.text(x, y, model.get_maximum("volume") + " ml");
        label.attr({
        });
        _glass.push(label);
        fill = canvas.path(model.bowl_path(SCALE, true));
        fill.attr({
            fill: model.color(),
            stroke: "none",
            opacity: 0.4
        });
        _glass.push(fill);

        max_line = canvas.path("M0,0");
        max_line.attr({
            stroke: "dimgray",
            "stroke-width": 1
        });
        _glass.push(max_line);

        max_label = canvas.text(x, y, "max");
        max_label.attr({
            stroke: "none",
            fill: "dimgray",
            "font-family": "inherit",
            "font-size": "10pt"
        });
        _glass.push(max_label);

        bowl_shape = canvas.path(model.bowl_path(SCALE));
        bowl_shape.attr({
            "stroke": "black",
            "stroke-width": GLASS_BORDER,
            "fill": "none"
        });
        _glass.push(bowl_shape);  

        base_shape = canvas.path(model.base_path(SCALE));
        base_shape.attr({
            "stroke": "black",
            "stroke-width": GLASS_BORDER,
            "fill": "dimgray",
            "fill-opacity": 0.1
        });
        _glass.push(base_shape);  

        glass_pane = canvas.path(model.path(SCALE));
        glass_pane.attr({
            fill: "white",
            opacity: 0,
            stroke: "white",
            "stroke-opacity": 0,
            "stroke-width": GLASS_BORDER
        });
        _glass.push(glass_pane);


        var bbox = _glass.getBBox();
        width = bbox.width;
        height = bbox.height;

        set_label();

        glass_pane.hover(onhover, offhover);
        glass_pane.drag(onmove, onstart, onend);

        glass_pane.dblclick(run_pause);
    }

    function run_pause() {
        if (model.is_finished()) {
            model.action("reset").callback(model)();
        } else {
            model.action("start").callback(model)();
        }
    }

    function set_label(x_, y_) {
        var bowlbb = bowl_shape.getBBox(),
            bowl_width = bowlbb.width,
            bowl_height = bowlbb.height;

        var x = x_, y = y_;

        label.attr({
            x: x,
            y: y + bowl_height/2,
            "font-size": compute_font_size(),
            text: model.get_maximum("volume") + " ml"
        });
        function compute_font_size() {
            return Math.max((((bowl_width - 2*PADDING)/ ((model.get_maximum("volume") + "").length + 3)) - PADDING), 8) + "px";
        }
    }
    _glass.set_label = set_label;


    var delta_x = 0, delta_y = 0;
    function onmove(dx, dy) {
        delta_x = dx;
        delta_y = dy;
        _glass.draw_at(_glass.x+dx, _glass.y+dy);
    }
    

    function onstart() {
        model.action("pause").callback(model)();
        delta_x = 0;
        delta_y = 0;
    }

    function onend() {
        _glass.x += delta_x;
        _glass.y += delta_y;
    }

    function onhover() {
        _glass.attr({
            "cursor": "move"
        });
    }

    function offhover() {
        _glass.attr({
            "cursor": "default"
        });
    }


    _glass.draw_at = function (x, y) {

        _glass.fill.attr({path: model.bowl_path(SCALE, true, x, y)});
        _glass.bowl_shape.attr({path: model.bowl_path(SCALE, false, x, y)});
        _glass.base_shape.attr({path: model.base_path(SCALE, x, y)});
        _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
        var MAX_LINE_WIDTH = Math.min(30, width / 2),
            MAX_LINE_SKIP = 5,
            BORDERS_ADD = _glass.bowl_shape.attr("stroke-width") * 2,
            MAX_LINE_Y = y + height - model.get_maximum("hoogte") * 10 * SCALE - BORDERS_ADD,
            INTERSECTIONS = Raphael.pathIntersection(
                   _glass.bowl_shape.attr("path"),
                  "M0," + (MAX_LINE_Y) + "h1000"),
            MAX_LINE_X = Math.min.apply(null,INTERSECTIONS.map(function(e) {return e.x;})) || x
            ;


        _glass.max_line.attr({
            path: "M" + MAX_LINE_X + "," + MAX_LINE_Y + 
                "h" + MAX_LINE_WIDTH
        });
        _glass.max_label.attr({
            x: MAX_LINE_X + MAX_LINE_WIDTH / 1.5,
            y: MAX_LINE_Y - MAX_LINE_SKIP            
        });

        _glass.set_label(x, y);
    };

    function draw_at_bottom(boundaries, distance_from_left) {
        var bbox = _glass.glass_pane.getBBox(),
            width = _glass.width,
            height = _glass.height,
            x = Math.min(boundaries.x + (distance_from_left || width), boundaries.x + (boundaries.width - width)),
            y = boundaries.y + boundaries.height - height + 2*_glass.bowl_shape.attr("stroke-width");

        _glass.draw_at(x, y);
        _glass.x = x;
        _glass.y = y;
    }
    _glass.draw_at_bottom = draw_at_bottom;

    function update_color() {
        fill.attr("fill", model.color());
    }


    draw();
    _glass.height = height;
    _glass.width = width;
    _glass.x = x;
    _glass.y = y;
    _glass.draw = draw;
    _glass.update = update;
    _glass.update_color = update_color;
    _glass.fill = fill;
    _glass.label = label;
    _glass.bowl_shape = bowl_shape;
    _glass.base_shape = base_shape;
    _glass.max_line = max_line;
    _glass.max_label = max_label;
    _glass.glass_pane = glass_pane;
    return _glass;
};

module.exports = glass;

},{}],12:[function(require,module,exports){


var dom = require("../../dom/dom");
var ruler = require("./ruler");
var contour_line = require("./contour_line");

var glass_grafter = function(config) {
    var _grafter = {};

    var scale = config.scale || (config.shape)?(config.shape.scale || 3):3; // px per mm
    var shape = config.shape || {
            bowl: {
                top: {
                    x: 100,
                    y: 0
                },
                bottom: {
                    x: 10,
                    y: 100
                },
                path: "l-90,100"
            },
            base: {
                top: {
                    x: 10,
                    y: 100
                },
                bottom: {
                    x: 70,
                    y: 200
                },
                path: "l0,90 l50,0 c5,2.5,7.5,7.5,10,10"
            },
            scale: scale
        };

    var dimensions = config.dimensions || {
        width: 500,
        height: 500,
        ruler_width: 30,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };

    var CONTAINER = {
            width: dimensions.width || 900,
            height: dimensions.height || 600
        };
        
    var HALF_WIDTH = (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width;

    var MIRROR_AREA = {
        x: dimensions.margins.left,
        y: dimensions.margins.top,
        width: HALF_WIDTH,
        height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
    };

    var CONSTRUCTION_AREA = {
        x: MIRROR_AREA.x + MIRROR_AREA.width,
        y: dimensions.margins.top,
        width: HALF_WIDTH,
        height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
    };

    var RULERS = {
            horizontal: {
                x:  CONSTRUCTION_AREA.x,
                y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
                width: (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width,
                height: dimensions.ruler_width,
                scale: scale,
                orientation: "horizontal"
            },
            vertical: {
                x:  dimensions.margins.left + HALF_WIDTH*2,
                y:  0 + dimensions.margins.top,
                width: dimensions.ruler_width,
                height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom,
                scale: scale,
                orientation: "vertical",
                reverse: true
            }
        };

    _grafter.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "glassgrafter"
            }
        }));

    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_grafter.fragment);

    var canvas = Raphael(_grafter.fragment,
            CONTAINER.width,
            CONTAINER.height
        );

    var vertical_ruler = ruler(canvas, RULERS.vertical, CONTAINER.width)
            .style({
                "background": "white"
            }),
        horizontal_ruler = ruler(canvas, RULERS.horizontal, CONTAINER.height)
            .style({
                "background": "white"
            }),
        cm_label = draw_cm_label();



    function draw_cm_label() {
       var x = dimensions.margins.left + 2*HALF_WIDTH + (dimensions.ruler_width / 2),
           y = CONTAINER.height - (dimensions.ruler_width / 2) - dimensions.margins.bottom,
           cm_label = canvas.text(x, y, "cm");

       cm_label.attr({
           "font-family": "inherit",
           "font-size": "18pt",
           "font-weight": "bolder",
           "fill": "dimgray"
       }); 

       cm_label.click(function() {
           points.print_shape();
       });

       return cm_label;
    }


    var ACTION_PADDING = 15,
        ACTION_WIDTH = 20,
        ACTION_HEIGHT = 15,
        ACTION_SEP = 5,
        ACTION_AREA = {
        x: MIRROR_AREA.x + ACTION_PADDING,
        y: MIRROR_AREA.y + MIRROR_AREA.height + ACTION_PADDING
        };
    var remove_action = draw_action("remove", 0);
    var straight_action = draw_action("straight", 1);
    var curve_action = draw_action("curve", 2);

    function draw_action(name, index) {
        var action = canvas.set();
        
        var x = ACTION_AREA.x + index*(ACTION_SEP * ACTION_WIDTH) + ACTION_SEP,
            y = ACTION_AREA.y;

        var background = canvas.rect(x, y, ACTION_WIDTH, ACTION_HEIGHT);
        background.attr({
            fill: "gold",
            stroke: "dimgray"
        });
        action.push(background);

        var label = canvas.text(x, y, name);
        action.push(label);
        action.attr({

        });
        action.click(function() {
            points.current_action = name;
            if (name === "curve") {
                points.show_control_points();
            } else {
                points.hide_control_points();
            }
            console.log(points.current_action);
        });
        return action;
    }



    var construction_background,
        mirror_background;

    function draw() {
        construction_background = canvas.rect(CONSTRUCTION_AREA.x,
                CONSTRUCTION_AREA.y,
                CONSTRUCTION_AREA.width,
                CONSTRUCTION_AREA.height
                );
        construction_background.attr({
            stroke: "dimgray",
            "stroke-width": 2,
            fill: "white"
        });

        mirror_background = canvas.rect(MIRROR_AREA.x,
                MIRROR_AREA.y,
                MIRROR_AREA.width,
                MIRROR_AREA.height
                );
        mirror_background.attr({
            stroke: "dimgray",
            "stroke-width": 2,
            fill: "silver",
            "fill-opacity": 0.5
        });

    }

    function create_point(x, y, type) {
        
        var point = canvas.circle(x, y);
        switch (type) {
            case "interval":
                point.attr({
                    r: 5,
                    "stroke": "black",
                    fill: "white"
                });
                break;
            case "segment":
                point.attr({
                    r: 2,
                    stroke: "black",
                    fill: "black"
                });
                break;
            case "control":
                point.attr({
                    r: 2,
                    stroke: "gray",
                    fill: "gray"
                });
                break;
        }
        return point;
    }




    function reshape(shape) {
        var bottom_y = CONSTRUCTION_AREA.y + CONSTRUCTION_AREA.height,
            delta_x = HALF_WIDTH + dimensions.margins.left,
            delta_y = bottom_y - shape.base.bottom.y;

       shape.base.bottom.y = shape.base.bottom.y + delta_y; 
       shape.base.bottom.x = shape.base.bottom.x + delta_x; 
       shape.base.top.y = shape.base.top.y + delta_y; 
       shape.base.top.x = shape.base.top.x + delta_x; 
       shape.bowl.bottom.y = shape.bowl.bottom.y + delta_y; 
       shape.bowl.bottom.x = shape.bowl.bottom.x + delta_x; 
       shape.bowl.top.y = shape.bowl.top.y + delta_y; 
       shape.bowl.top.x = shape.bowl.top.x + delta_x; 

       return shape;
    }


    draw();
    vertical_ruler.toFront();
    horizontal_ruler.toFront();
    var points = contour_line(canvas, reshape(shape), CONSTRUCTION_AREA);
    mirror_background.toFront();
    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_grafter.fragment);
    return _grafter;
};

module.exports = glass_grafter;

},{"../../dom/dom":2,"./contour_line":9,"./ruler":14}],13:[function(require,module,exports){

var glass = require("./glass");

var longdrink_glass = function(canvas, model, SCALE, boundaries_) {
    var HANDLE_SPACE = 15,
        HANDLE_SIZE = 2.5;

    var PADDING = 5;

    var _glass = glass(canvas, model, SCALE, boundaries_);

    _glass.handle = canvas.circle( 
            _glass.x + _glass.width + HANDLE_SPACE, 
            _glass.y - HANDLE_SPACE, 
            HANDLE_SIZE);
    _glass.handle.attr({
        fill: "silver",
        "stroke": "silver"
    });
    _glass.push(_glass.handle);
    _glass.handle.hover(enable_resizing, disable_resizing);
    _glass.handle.drag(sizemove, sizestart, sizestop);

    var old_height, old_radius, delta_x, delta_y;
    function sizemove(dx, dy) {
        var 
            d_height = dy / SCALE / 10,
            d_radius = dx / 2 / SCALE / 10,
            new_radius = old_radius + d_radius,
            new_height = old_height - d_height,
            area = Math.PI * new_radius * new_radius;


        if (area*new_height >= 5){
            delta_y = dy;
            model.height(new_height);
            model.radius(new_radius);
            _glass.draw_at(_glass.x, _glass.y+dy);
        }

    }

    function sizestart() {
        delta_x = 0;
        delta_y = 0;
        old_height = model.height();
        old_radius = model.radius();
        model.action("reset").callback(model)();
    }

    function sizestop() {
        _glass.y += delta_y;
        model.get_views_of_type("graph").forEach(function(v) {v.update_all();});
    }


    function enable_resizing() {
        _glass.handle.attr({
            fill: "yellow",
            stroke: "black",
            "stroke-width": 2,
            r: HANDLE_SIZE * 1.5,
            cursor: "nesw-resize"
        });
        _glass.glass_pane.attr({
            fill: "lightyellow",
            opacity: 0.7
        });
    }

    function disable_resizing() {
        _glass.handle.attr({
            fill: "silver",
            stroke: "silver",
            "stroke-width": 1,
            r: HANDLE_SIZE,
            cursor: "default"
        });
        _glass.glass_pane.attr({
            fill: "white",
            opacity: 0
        });
    }

    function update_size() {
        var bbox = _glass.glass_pane.getBBox();

        _glass.width = bbox.width;
        _glass.height = bbox.height;
    }

    _glass.draw_at = function (x, y) {

        _glass.fill.attr({path: model.bowl_path(SCALE, true, x, y)});
        _glass.bowl_shape.attr({path: model.bowl_path(SCALE, false, x, y)});
        _glass.base_shape.attr({path: model.base_path(SCALE, x, y)});
        _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
        update_size();
        var MAX_LINE_WIDTH = Math.min(30, _glass.width / 2),
            MAX_LINE_SKIP = 5,
            MAX_LINE_Y = y + _glass.height - model.get_maximum("hoogte") * 10 * SCALE;
        _glass.max_line.attr({
            path: "M" + x + "," + MAX_LINE_Y + 
                "h" + MAX_LINE_WIDTH
        });
        _glass.max_label.attr({
            x: x + MAX_LINE_WIDTH / 1.5,
            y: MAX_LINE_Y - MAX_LINE_SKIP            
        });

        _glass.handle.attr({
            cx: x + _glass.width + HANDLE_SPACE, 
            cy: y - HANDLE_SPACE
        });
        _glass.set_label(x, y);
    };

    _glass.set_label = function(x_, y_) {
        var x = x_, y = y_;
        model.compute_maxima();
        _glass.label.attr({
            x: x + _glass.width / 2,
            y: y + _glass.height/2,
            "font-size": compute_font_size(),
            text: model.get_maximum("volume") + " ml"
        });
        function compute_font_size() {
            return Math.max((((_glass.width - 2*PADDING)/ ((model.get_maximum("volume") + "").length + 3)) - PADDING), 8) + "px";
        }
    };



    return _glass;
};

module.exports = longdrink_glass;

},{"./glass":11}],14:[function(require,module,exports){

var ruler = function(canvas, config, MEASURE_LINE_WIDTH_) {
    var _ruler = canvas.set();

    var MEASURE_LINE_WIDTH = MEASURE_LINE_WIDTH_;
    if (config.reverse) {
        MEASURE_LINE_WIDTH = -MEASURE_LINE_WIDTH_;
    }
        

    var x = config.x || 0,
        y = config.y || 0,
        width = config.width || 50,
        height = config.height || 500,
        scale = config.scale || 2,
        orientation = config.orientation || "vertical";

    var background,
        ticks,
        labels,
        measure_line,
        glass_pane;

    draw();
    style({
        background: "yellow",
        stroke: "dimgray",
        stroke_width: 2,
        font_size: "12pt"
    });


    function move_measuring_line(e, x_, y_) {
        var path;

        var svgbb = canvas.canvas.getBoundingClientRect(),
            plus_left = svgbb.left +  window.pageXOffset,
            plus_top = svgbb.top + window.pageYOffset;

        if (orientation === "horizontal") {
            path = "M" + (x_ - plus_left) + "," + (y + height) + "v-" + MEASURE_LINE_WIDTH;
        } else {
            path = "M" + x + "," + (y_ - plus_top) + "h" + MEASURE_LINE_WIDTH;
        }
        measure_line.attr({
            "path": path
        });
    }

    function show_measuring_line() {
        glass_pane.mousemove(move_measuring_line);
        measure_line.show();
    }

    function hide_measuring_line() {
        glass_pane.unmousemove(move_measuring_line);
        measure_line.hide();
    }

    
    function draw() {
        background = canvas.rect(x, y, width, height);
        _ruler.push(background);
        _ruler.push(draw_ticks());
        _ruler.push(draw_labels());
        measure_line = canvas.path("M0,0");
        measure_line.attr({
            stroke: "crimson",
            "stroke-width": 2,
            "stroke-opacity": 0.5
        });
        _ruler.push(measure_line);
        measure_line.hide();
        glass_pane = canvas.rect(x, y, width, height);
        glass_pane.attr({
            fill: "white",
            opacity: 0,
            stroke: "white",
            "stroke-opacity": 0
        });
        _ruler.push(glass_pane);

        glass_pane.mouseover(show_measuring_line);
        glass_pane.mouseout(hide_measuring_line);

        function draw_labels() {
            labels = canvas.set();
            
            var ONE_CM_IN_PX = scale * 10,
                cm = 0;

            if (orientation === "vertical") {
                var h = y + height,
                    y_end = y + ONE_CM_IN_PX,
                    x_start = x + (width/4);

                while (h > y_end) {
                    h = h - ONE_CM_IN_PX;
                    cm++;
                    labels.push(canvas.text(x_start, h, cm));
                }
            } else {
                var w = x,
                    x_end = x + width - ONE_CM_IN_PX,
                    y_start = y + (height/(4/3));

                while (w < x_end) {
                    w = w + ONE_CM_IN_PX;
                    cm++;
                    labels.push(canvas.text(w, y_start, cm));
                }
            }


            return labels;
        }

        function draw_ticks() {
            var CM_SIZE = 13,
                HALF_CM_SIZE = 8,
                MM_SIZE = 5,
                cm_ticks = canvas.path(create_ticks_path(0, CM_SIZE)),
                half_cm_ticks = canvas.path(create_ticks_path(scale*5, HALF_CM_SIZE));

            ticks = canvas.set();
            cm_ticks.attr("stroke-width", 1);
            ticks.push(cm_ticks);
            half_cm_ticks.attr("stroke-width", 1);
            ticks.push(half_cm_ticks);
            [1, 2, 3, 4, 6, 7, 8, 9].forEach(draw_mm_ticks);

            function draw_mm_ticks(step) {
                  var mm_ticks = canvas.path(create_ticks_path(scale*step, MM_SIZE));
                  mm_ticks.attr("stroke-width", 0.5);
                  ticks.push(mm_ticks);
            }

            function create_ticks_path(step, size) {
                var ONE_CM_IN_PX = scale * 10,
                    ticks_path;
                if (orientation === "vertical") {
                    var h = y + height + step,
                        y_end = y + ONE_CM_IN_PX,
                        x_start = x + width;

                    while (h > y_end) {
                        h = h - ONE_CM_IN_PX;
                        ticks_path += "M" + x_start + "," + h + "h-" + size;
                    }
                } else {
                    var w = x - step,
                        x_end = x + width - ONE_CM_IN_PX,
                        y_start = y;

                    while (w < x_end) {
                        w = w + ONE_CM_IN_PX;
                        ticks_path += "M" + w + "," + y_start + "v" + size;
                    }
                }

                return ticks_path;
            }

            return ticks;
        }

    }

    function style(config) {
        if (config.background) {
            background.attr("fill", config.background);
        }
        if (config.stroke) {
            background.attr("stroke", config.stroke);
            ticks.attr("stroke", config.stroke);

        }
        if (config.stroke_width) {
            background.attr("stroke-width", config.stroke_width);
        }
        if (config.font_size) {
            labels.attr("font-size", config.font_size);
        }
        if (config.font_family) {
            labels.attr("font-family", config.font_family);
        }

        return _ruler;
    }

    _ruler.style = style;

    return _ruler;

};

module.exports = ruler;

},{}],15:[function(require,module,exports){
/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var view = require("./view"),
    dom = require("../dom/dom");

var graph = function(config_) {

    var config = Object.create(config_);
    config.type = "graph";
    var _graph = view(config);

    var horizontal = config_.horizontal,
        vertical = config_.vertical;


    var dimensions = {
        width: config.dimensions.width,
        height: config.dimensions.height,
        margins: {
            top: 10,
            right: 20,
            left: 80,
            bottom: 80
        }
    };

    var CONTAINER = {
            width: dimensions.width || 900,
            height: dimensions.height || 600
        };
    var MARGINS = {
            top:dimensions.margins.top || 10,
            right:dimensions.margins.right || 20,
            left:dimensions.margins.left || 60,
            bottom:dimensions.margins.bottom || 60
        };
    var GRAPH = {
            width: CONTAINER.width - MARGINS.left - MARGINS.right,
            height: CONTAINER.height - MARGINS.top - MARGINS.bottom
        };
    var GRAPH_LINE_WIDTH = 3;


    _graph.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "graph"
            }
        }));

    var horizontal_axis, vertical_axis;

    var mouse_actions = [
        {
            name: "tangent_triangle",
            icon: "icon-crop",
            on: show_tangent_triangle,
            off: hide_tangent_triangle
        }, {
            name: "locally_zoom",
            icon: "icon-zoom-in",
            on: show_zoom,
            off: hide_zoom
        }
    ];
            
    var hide_actions = config.hide_actions || [];
    function show_this_action(action) {
        return hide_actions.indexOf(action.name) === -1;
    }

    mouse_actions = mouse_actions.filter(show_this_action);

    var current_action = config.default_action || "measure_point";

    function toggle_action(action) {

        return function() {
            if (!this.hasAttribute("data-toggled")) {
                this.setAttribute("data-toggled", true);
                // enable mouse thingie
                action.on();
            } else {
                this.removeAttribute("data-toggled");
                // diable mouse thingie
                action.off();
            }
        };

    }
             
    function show_tangent_triangle() {
            var tangent_triangle = svg.select("g.tangent_triangle");
            if (tangent_triangle) tangent_triangle.style("visibility", "visible");
            speed_tooltip.style("visibility", "visible");
    }

    function hide_tangent_triangle() {
            var tangent_triangle = svg.select("g.tangent_triangle");
            if (tangent_triangle) tangent_triangle.style("visibility", "hidden");
            speed_tooltip.style("visibility", "hidden");
    }

    function show_zoom() {
        console.log("start zooming");
    }

    function hide_zoom() {
        console.log("stop zooming");
    }


    function create_caption() {
        var get_name = function(q) {
                return _graph.quantities[q].name;
            },
            quantity_names = Object.keys(_graph.quantities),
            horizontal_selected_index = quantity_names.indexOf(
                    horizontal),
            vertical_selected_index = quantity_names.indexOf(
                    vertical),
            create_option = function(selected_index) {
                return function(quantity_name, index) {
                    var option = {
                        name: "option",
                        value: quantity_name,
                        text: quantity_name.replace("_", " ")
                    };
                    if (index === selected_index) {
                        option.attributes = {
                            selected: true
                        };
                    }
                    return option;
                };
            },
            horizontal_quantity_list = quantity_names
                .filter(function(q) {
                    return !_graph.quantities[q].not_in_graph;
                })
                .map(create_option(horizontal_selected_index)),
            vertical_quantity_list = quantity_names
                .filter(function(q) {
                    return !_graph.quantities[q].not_in_graph;
                })
                .map(create_option(vertical_selected_index));

        var create_action = function(action) {
                var attributes = {
                        "class": "action",
                        "data-action": action.name
                    };

                    if (current_action === action.name) {
                        attributes["data-toggled"] = true;
                    }
                    return {
                        name: "button",
                        attributes: attributes,
                        children: [{
                            name: "i",
                            attributes: {
                               "class": action.icon
                            }
                        }],
                        on: {
                            type: "click",
                            callback: toggle_action(action)
                        }

                    };
        };
        var actions_elts = mouse_actions.map(create_action);

        _graph.fragment.appendChild(dom.create({
                name: "figcaption",
                children: [
                {
                    name: "select",
                    attributes: {

                    },
                    children: vertical_quantity_list,
                    on: {
                        type: "change",
                        callback: function(event) {
                            vertical = event.target.value;
                            _graph.update_all();
                        }
                    }
                },
                {
                    name: "textNode",
                    value: " - "
                }, 
                {
                    name: "select",
                    children: horizontal_quantity_list,
                    on: {
                        type: "change",
                        callback: function(event) {
                            horizontal = event.target.value;
                            _graph.update_all();
                        }
                    }
                }, 
                {
                    name: "textNode",
                    value: " grafiek "
                } 
                ].concat(actions_elts)
            }));
    }
    create_caption();

    var svg = d3.select(_graph.fragment).append("svg")
            .attr("width", CONTAINER.width)
            .attr("height", CONTAINER.height)
            .append("g")
                .attr("transform", "translate(" + 
                        MARGINS.left + "," + 
                        MARGINS.right + ")");

    svg.append("defs")
        .append("marker")
        .attr({
            id: "arrowhead",
            markerWidth: "4",
            markerHeight: "6",
            refX: "4",
            refY: "3",
            orient: "auto"
        })
        .append("path")
            .attr({
                d: "M0,0 l0,6 l4,-3 l-4,-3"
            })
        .style("fill", "black");


    var showline = false,
        showtailpoints = false,
        showarros = false;

    function draw_tailpoints(model_name) {
        var model = _graph.get_model(model_name).model,
            step = function(value, index) {
                var step_size = model.step_size();

                return (index % step_size === 0);// && (index !== 0);
            },
            data = model.data().filter(step),
            x_scale = horizontal_axis.scale,
            x_quantity = horizontal_axis.quantity,
            y_scale = vertical_axis.scale,
            y_quantity = vertical_axis.quantity;

        var model_tailpoints = _graph.fragment
            .querySelector("svg g.tailpoints g." + model_name);
        if (model_tailpoints) {
            model_tailpoints.parentNode.removeChild(model_tailpoints);
        }

        var POINT_R = 3,
            TAIL_WIDTH = 3,
            COLOR = model.color();

        svg.select("g.tailpoints")
                .append("g")
                .attr("class", model_name)
                .selectAll("line")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", function(d) {
                    return x_scale(d[x_quantity.name]);
                })
                .attr("y1", function(d) {
                    return y_scale(d[y_quantity.name]);
                })
                .attr("x2", function(d) {
                    return x_scale(d[x_quantity.name]);
                })
                .attr("y2", y_scale(0))
                .attr("stroke", COLOR)
                .style("stroke-width", TAIL_WIDTH)
                ;

        svg.select("g.tailpoints g." + model_name)
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return x_scale(d[x_quantity.name]);
                })
                .attr("cy", function(d) {
                    return y_scale(d[y_quantity.name]);
                })
                .attr("r", POINT_R)
                .attr("stroke", COLOR)
                .attr("fill", COLOR)
                .style("stroke-width", 0)
                .on("mouseover.tooltip", add_tooltip(model_name))
                .on("mouseout.tooltip", remove_tooltip(model_name))
                ;

        var arrow_data = data.slice(0, -1);
        svg.select("g.tailpoints g." + model_name )
            .append("g")
            .classed("arrows", true)
            .selectAll("line")
            .data(arrow_data)
            .enter()
            .append("line")
            .attr({
                x1: function (d, i) {
                    return x_scale(d[x_quantity.name]);
                },
                y1: function (d, i) {
                    return y_scale(d[y_quantity.name]);
                },
                x2: function (d, i) {
                    return x_scale(data[i+1][x_quantity.name]);
                },
                y2: function (d, i) {
                    return y_scale(data[i+1][y_quantity.name]);
                },
                "marker-end": "url(#arrowhead)"
            })
            .style({
                "stroke-width": 1.5,
                stroke: "black",
                fill: "black"
            });


        if (model.graph_is_shown("tailpoints")) {
            _graph.show_tailpoints(model_name);
        } else {
            _graph.hide_tailpoints(model_name);
        }

        if (model.graph_is_shown("arrows")) {
            _graph.show_arrows(model_name);
        } else {
            _graph.hide_arrows(model_name);
        }

    }

    function draw_line(model_name) {
        var model = _graph.get_model(model_name).model,
            data = model.data(),
            x_scale = horizontal_axis.scale,
            x_quantity = horizontal_axis.quantity,
            y_scale = vertical_axis.scale,
            y_quantity = vertical_axis.quantity;

        var line = d3.svg.line()
                .x(function(d) {
                    return x_scale(d[x_quantity.name]);
                })
                .y(function(d) {
                    return y_scale(d[y_quantity.name]);
                })
                .interpolate("cardinal")
                .tension(1);
                

        var model_line = _graph.fragment
            .querySelector("svg g.lines g." + model_name);
        if (model_line) {
            model_line.parentNode.removeChild(model_line);
        }

        svg.select("g.lines")
                .append("g")
                .classed(model_name, true)
                .classed("line", true)
                .selectAll("path")
                .data([data])
                .enter()
                .append("path")
                .attr("d", line)
                .attr("class", "graph")
                .attr("fill", "none")
                .attr("stroke", model.color || "red")
                .style("stroke-width", GRAPH_LINE_WIDTH)
                .on("mouseover.tooltip", add_tooltip(model_name))
                .on("mousemove.tooltip", add_tooltip(model_name))
                .on("mouseout.tooltip", remove_tooltip(model_name))
                .on("mouseover.tangent_triangle", add_tangent_triangle(model_name))
                .on("mousemove.tangent_triangle", add_tangent_triangle(model_name))
                .on("mouseout.tangent_triangle", remove_tangent_triangle(model_name))
                ;

        if (model.graph_is_shown("line")) {
            _graph.show_line(model_name);
        } else {
            _graph.hide_line(model_name);
        }

    }

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0.7);

    function add_tooltip(model_name) {
        return function(d, i) {
            var PADDING = 10;
            var line = svg.select("g.lines g.line." + model_name + " path");
            line.style("cursor", "crosshair");

            var container = _graph.fragment.querySelector("svg > g"),
                point = d3.mouse(container),
                x_scale = horizontal_axis.scale,
                x_quantity = horizontal_axis.quantity,
                y_scale = vertical_axis.scale,
                y_quantity = vertical_axis.quantity,
                x = x_scale.invert(point[0]).toFixed(x_quantity.precision || 0),
                y = y_scale.invert(point[1]).toFixed(y_quantity.precision || 0),
                x_unit = x_quantity.unit,
                y_unit = y_quantity.unit;
                            

            tooltip.html( x + " " + x_unit + "; " + y + " " + y_unit);

            tooltip
                .style("left", (d3.event.pageX + PADDING*2) + "px")     
                .style("top", (d3.event.pageY - PADDING) + "px");   

            tooltip.style("visibility", "visible");
        };
    }

    function remove_tooltip(model_name) {
        return function() {
            var line = svg.select("g.lines g.line." + model_name + " path");
            line.style("cursor", "default");
            tooltip.style("visibility", "hidden");
        };
    }




    function set_axis(quantity_name, orientation) {
        var axes_g = svg.select("g.axes");
        var quantity = _graph.quantities[quantity_name],
            create_scale = function(quantity, orientation) {
                var range;
                if (orientation === "horizontal") {
                    range = [0, GRAPH.width];
                } else {
                    range = [GRAPH.height, 0];
                }
                return d3.scale.linear()
                    .range(range)
                    .domain([quantity.minimum, quantity.maximum]);
            },
            scale = create_scale(quantity, orientation),
            create_axis = function(quantity, orientation) {
                var axis;
                if (orientation === "horizontal") {
                    axis = d3.svg.axis()
                        .scale(scale)
                        .tickSubdivide(3);
                } else {
                    axis = d3.svg.axis()
                        .scale(scale)
                        .orient("left")
                        .tickSubdivide(3);
                }
                return axis;
            },
            axis = create_axis(quantity, orientation);

       
        if (orientation === "horizontal") {
            horizontal = quantity_name;
            //  create axes    
            var xaxisg = _graph.fragment.querySelector("g.x.axis");
            if (xaxisg) {
                xaxisg.parentNode.removeChild(xaxisg);
            }

            axes_g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + GRAPH.height + ")")
                .call(axis);

            var xgridg = _graph.fragment.querySelector("g.x.grid");
            if (xgridg) {
                xgridg.parentNode.removeChild(xgridg);
            }

            axes_g.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + GRAPH.height + ")")
                .call(axis.tickSize(- GRAPH.height, 0, 0).tickFormat(""));

            var xlabel = _graph.fragment.querySelector("text.x.label");
            if (xlabel) {
                xlabel.parentNode.removeChild(xlabel);
            }

            axes_g.append('text')
                .attr('text-anchor', 'middle')
                .attr("class", "x label")
                .text(quantity.label)
                    .attr('x', GRAPH.width / 2)
                    .attr('y', CONTAINER.height - (MARGINS.bottom / 2));

            horizontal_axis = {
                quantity: quantity,
                scale: scale,
                axis: axis
            };
        } else {
            // vertical axis
            vertical = quantity_name;
            var yaxisg = _graph.fragment.querySelector("g.y.axis");
            if (yaxisg) {
                yaxisg.parentNode.removeChild(yaxisg);
            }

            axes_g.append("g")
                .attr("class",  "y axis")
                .call(axis);

            var ygridg = _graph.fragment.querySelector("g.y.grid");
            if (ygridg) {
                ygridg.parentNode.removeChild(ygridg);
            }

            axes_g.append("g")
                .attr("class", "y grid")
                .call(axis.tickSize(- GRAPH.width, 0, 0).tickFormat(""));

            var ylabel = _graph.fragment.querySelector("text.y.label");
            if (ylabel) {
                ylabel.parentNode.removeChild(ylabel);
            }

            axes_g.append('text')
                .attr('text-anchor', 'middle')
                .attr("class", "y label")
                .text(quantity.label)
                    .attr('transform', 'rotate(-270,0,0)')
                    .attr('x', GRAPH.height / 2)
                    .attr('y', MARGINS.left * (5/6) );

            vertical_axis = {
                quantity: quantity,
                scale: scale,
                axis: axis
            };
        }

//        update_lines();
//        update_tailpoints();
        
    }

    function update_lines() {
        Object.keys(_graph.models).forEach(draw_line);
    }

    function update_tailpoints() {
        Object.keys(_graph.models).forEach(draw_tailpoints);
    }

    function create_graph() {

        // scales and axes (make all axis pre-made?)
        svg.append("g")
            .classed("axes", true);
        set_axis(horizontal, "horizontal");
        set_axis(vertical, "vertical");
        svg.append("g")
            .attr("class", "lines");
        svg.append("g")
            .attr("class", "tailpoints");
        svg.append("g")
            .classed("tangent_triangle", true)
            .style({
                "visibility": "hidden"
            })
            .append("line")
                .classed("tangent", true)
                .style({
                    "stroke-width": GRAPH_LINE_WIDTH / 2,
                    "stroke": "crimson"
                });



    }
    create_graph();
    _graph.update_all();

    var speed_tooltip = d3.select("body")
        .append("div")
        .attr("class", "speed_tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0);

    function add_tangent_triangle(model_name) {
        return function(d, i, event) {
            var container = _graph.fragment.querySelector("svg > g"),
                path = d3.event.target || d3.event.srcElement,
                point = d3.mouse(container);


            var length_at_point = 0,
                total_length = path.getTotalLength(),
                INTERVAL = 50;

            while (path.getPointAtLength(length_at_point).x < point[0] && 
                    length_at_point < total_length) {
                        length_at_point += INTERVAL;
                    }

            length_at_point -= INTERVAL;

            while (path.getPointAtLength(length_at_point).x < point[0] && 
                    length_at_point < total_length) {
                        length_at_point++;
                    }


            var x_scale = horizontal_axis.scale,
                x_quantity = horizontal_axis.quantity,
                y_scale = vertical_axis.scale,
                y_quantity = vertical_axis.quantity,
                x_unit = x_quantity.unit,
                y_unit = y_quantity.unit,
                cur = {
                    x: x_scale.invert(point[0]).toFixed(x_quantity.precision || 0),
                    y: y_scale.invert(point[1]).toFixed(y_quantity.precision || 0)
                };

            var prev,
                next,
                cur_px = path.getPointAtLength(length_at_point),
                a, 
                b;

            if (length_at_point > 1 && length_at_point < (total_length - 1)) {

                prev = path.getPointAtLength(length_at_point - 1);
                next = path.getPointAtLength(length_at_point + 1);
                if (length_at_point > 10) {
                    prev = path.getPointAtLength(length_at_point - 10);
                }
                if (length_at_point < (total_length - 10)) {
                    next = path.getPointAtLength(length_at_point + 10);
                }

                var compute_a = function(p, n) {
                    return (y_scale.invert(n.y) - y_scale.invert(p.y)) /
                    (x_scale.invert(n.x) - x_scale.invert(p.x));
                    },
                    compute_b = function(a, p) {
                        return y_scale.invert(p.y) - a*x_scale.invert(p.x);
                    };
                a = compute_a(prev, next);
                b = compute_b(a, cur_px);

            } else {

                // don't worry about the first
                // and last pixel or so
                return;
            }


            var x1 = x_quantity.minimum, x2, y1, y2;
            if (a > 0) {
                y2 = y_quantity.maximum;
            } else {
                y2 = y_quantity.minimum;
            }
                
            y1 = a*x1 + b;
            x2 = (y2 - b)/a;

            var tangent = svg.select("g.tangent_triangle line.tangent");
            var SEP = GRAPH_LINE_WIDTH / 2;

            if (a >= 0) {
            tangent.attr("x1", x_scale(x1) - 1)
                .attr("y1", y_scale(y1) - SEP)
                .attr("x2", x_scale(x2) - 1)
                .attr("y2", y_scale(y2) - SEP);
            } else {
            tangent.attr("x1", x_scale(x1) + 1)
                .attr("y1", y_scale(y1) + SEP)
                .attr("x2", x_scale(x2) + 1)
                .attr("y2", y_scale(y2) + SEP);
            }


            var tangent_text = (a).toFixed(y_quantity.precision || 0) + " " + y_quantity.unit + "/" + x_quantity.unit;
            

            speed_tooltip.html(tangent_text);
            var WIDTH = speed_tooltip.clientHeight || tangent_text.length*10,
                X_SEP = 10,
                Y_SEP = 30;
            speed_tooltip
                .style("left", (d3.event.pageX - WIDTH - X_SEP) + "px")     
                .style("top", (d3.event.pageY - Y_SEP) + "px");   
            speed_tooltip.style("opacity", 0.7);

            svg.select("g.tangent_triangle").style("opacity", 1);
        };
    }

    function remove_tangent_triangle(model_name) {
        return function() {
            var tangent_triangle = svg.select("g.tangent_triangle");
            tangent_triangle.style("opacity", 0);
            speed_tooltip.style("opacity", 0);
        };
    }


    _graph.remove = function(model_name) {
        var model_line = _graph.fragment
            .querySelector("svg g.lines g." + model_name);
        if (model_line) {
            model_line.parentNode.removeChild(model_line);
        }

        var model_tailpoints = _graph.fragment
            .querySelector("svg g.tailpoints g." + model_name);
        if (model_tailpoints) {
            model_tailpoints.parentNode.removeChild(model_tailpoints);
        }
    };

    _graph.update_all = function() {
        _graph.compute_extrema();
        set_axis(horizontal, "horizontal");
        set_axis(vertical, "vertical");
        Object.keys(_graph.models).forEach(_graph.update);
    };


    _graph.update = function(model_name) {
        draw_line(model_name);
        draw_tailpoints(model_name);
    };

    _graph.show_arrows = function(model_name) {
        var model_arrows = _graph.fragment
            .querySelector("svg g.tailpoints g." + model_name + " g.arrows" );

        if (model_arrows) {
            model_arrows.style.visibility = "visible";
        }
    };

    _graph.hide_arrows = function(model_name) {
        var model_arrows = _graph.fragment
            .querySelector("svg g.tailpoints g." + model_name + " g.arrows" );

        if (model_arrows) {
            model_arrows.style.visibility = "hidden";
        }
    };

    _graph.show_tailpoints = function(model_name) {
        var model_tailpoints = _graph.fragment
            .querySelector("svg g.tailpoints g." + model_name);
        if (model_tailpoints) {
            model_tailpoints.style.visibility = "visible";
        }
    };

    _graph.hide_tailpoints = function(model_name) {
        var model_tailpoints = _graph.fragment
            .querySelector("svg g.tailpoints g." + model_name);
        if (model_tailpoints) {
            model_tailpoints.style.visibility = "hidden";
        }
    };


    _graph.show_line = function(model_name) {
        var model_line = _graph.fragment
            .querySelector("svg g.lines g." + model_name);
        if (model_line) {
            model_line.style.visibility = "visible";
        }
    };

    _graph.hide_line = function(model_name) {
        var model_line = _graph.fragment
            .querySelector("svg g.lines g." + model_name);
        if (model_line) {
            model_line.style.visibility = "hidden";
        }
    };

    return _graph;
};

module.exports = graph;

},{"../dom/dom":2,"./view":17}],16:[function(require,module,exports){
/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var dom = require("../dom/dom");

var table = function(config) {
    var _table = require("./view")(config),
        _appendix = {};

    var TOGGLED_COLOR = "gold";

    var hide_actions = config.hide_actions || [];
    function show_this_action(action_name) {
        return hide_actions.indexOf(action_name) === -1;
    }

    function remove_action(model) {
        return {
            name: "remove",
            group: "edit",
            icon: "icon-remove",
            tooltip: "Remove this model",
            enabled: true,
            callback: function(model) {
                return function() {
                    model.action("reset").callback(model)();
                    config.microworld.unregister(model.name);
                };
            }
        };
    }


    function add_model() {
        return function() {
            if (this.selectedIndex > 0) {
                var selected_option = this.options[this.selectedIndex].value;
                var model = config.models[selected_option];
                config.microworld.register(model);
                this.selectedIndex = 0;
            }
        };
    }

    var table_fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "table"
        }));

    var create_foot = function() {
        var table_foot = table_fragment
            .appendChild(dom.create({name: "tfoot"}));


        function create_option(model, index) {
            return {
                name: "option",
                text: model.name.replace("_", " "),
                attributes: {
                    value: index
                }
            };
        }

        var model_list = {
            name: "select",
            attributes: {
            },
            children: [{
                name: "option",
                text: "toevoegen ...",
                value: -1
            }].concat(config.models.map(create_option)),
            on: {
                type: "change",
                callback: add_model()
            }
        };

        table_foot.appendChild(dom.create({
            name: "tr",
            children: [
                {
                    name: "th",
                    attributes: {
                        "data-list": true
                    },
                    children: [
                                {
                                name: "i",
                                attributes: {
                                    "class": "icon-plus"
                                }
                            }, model_list]
                }, {
                    name: "th",
                    attributes: {
                        "class": "corner",
                        "colspan": Object.keys(_table.quantities).length + 2
                    }
                }
            ]
        }));

    };
    create_foot();


    var create_head = function() {
        var table_head = table_fragment
            .appendChild(dom.create({name: "thead"})),
            actions = config.actions || {};

        var head = table_head.appendChild(dom.create({name: "tr"}));

        // name column
        head.appendChild(dom.create({
            name: "th",
            attributes: { 
                "class": "corner",
                "colspan": 2
            }
        }));

        // quantities, if any
        var number_of_quantities = Object.keys(_table.quantities)
            .filter(function(q) {return !_table.quantities[q].not_in_table;})
            .length;
        if (number_of_quantities > 0) {
                var add_cell = function(q) {
                    var quantity = _table.quantities[q];

                    head.appendChild( dom.create({
                        name: "th",
                        value: quantity.name.replace("_", " ")
                    }));
                };                            

            Object.keys(_table.quantities)
                .filter(function(q) {return !_table.quantities[q].not_in_table;})
                .forEach(add_cell);
        }

        // actions, if any
        head.appendChild(
            dom.create({
                name: "th",
                attributes: {
                    "class": "corner"
                }
            })
        );




        
        

    };
    create_head();

    // create body
    var table_body = table_fragment.appendChild(
            dom.create({name: "tbody"})
            );

    var add_row = function(model) {
        var row;

        var create_quantity_elt = function(q) {
                    
                var quantity = _table.quantities[q],
                    cell = {
                        name: "td",
                        attributes: {
                            "data-quantity": q
                        }
                    };
                if (quantity.monotone) {
                    cell.children = [{
                        name: "input",
                        attributes: {
                            "type": "text",                        
                            "pattern": "(\\+|-)?\\d*((\\.|,)\\d+)?"
                        },
                        on: {
                            type: "change",
                            callback: function(event) {
                                var value = this.value;
                                if (value < model.get_minimum(q)) {
                                    model.reset();
                                } else if (model.get_maximum(q) < value) {
                                    model.finish();
                                } else {
                                    model.set( q, value );
                                }
                            }
                        }

                    }];
                } else {
                    cell.children = [{
                        name: "span",
                        attributes: { "class": "measurement" }
                    }];
                }

                if (quantity.unit) {
                    cell.children.push({
                        name: "span",
                        attributes: {
                            "class": "unit" },
                        value: quantity.unit
                    });
                }
                return cell;
            },
            quantity_elts = Object.keys(_table.quantities)
                .filter(function(q) {
                    return !_table.quantities[q].not_in_table;
                })
                .map(create_quantity_elt);

        var group,
            create_action_elt = function(action_name) {

                var action = model.action(action_name),
                    classes = "action";
                if (group && group !== action.group) {
                    group = action.group;
                    classes += " left-separator";
                } else {
                    group = action.group;
                }

                var attributes = {
                        "class": classes,
                        "data-action": action_name
                    };

                if (action.type && action.type === "slider") {
                    attributes.type = "range";
                    attributes.min = 1;
                    attributes.max = 10 * model.step_size();
                    attributes.step = 1;
                    attributes.value = model.step_size();

                    return {
                        name: "input",
                        attributes: attributes,
                        on: {
                            type: "change",
                            callback: action.install()
                        }

                    };
                } else {
                    if (action.toggled) {
                        attributes["data-toggled"] = true;
                    }
                    return {
                        name: "button",
                        attributes: attributes,
                        children: [{
                            name: "i",
                            attributes: {
                               "class": action.icon
                            }
                        }],
                        on: {
                            type: "click",
                            callback: action.install()
                        }

                    };
                }
            };


            model.add_action(remove_action());
            var actions_elts = Object.keys(model.actions).filter(show_this_action).map(create_action_elt);

        row = table_body.appendChild(
                dom.create( {
                    name: "tr",
                    attributes: {
                        "id": model.name
                    },
                    children: [{
                        name: "td",
                        value: model.name.split("_").join(" "),
                        attributes: { "class": model.name }
                    },{
                        name: "td",
                        attributes: {
                            "class": "color"
                        },
                        children: [{
                            name: "span",
                            value: "",
                            on: {
                                type: "click",
                                callback: function(event) {
                                    model.color("random");
                                    model.update_views();
                                }
                            },
                            style: {
                                width: "15px",
                                height: "15px",
                                border: "1px solid dimgray",
                                "background": model.color(),
                                display: "block"
                            }
                        }]
                    }].concat(quantity_elts).concat([{
                        name: "td",
                        children: actions_elts
                    }])
                }));

        return row;


    };

    var update_row = function(row, model) {

        var color_cell = row.querySelector(".color span");
        if (color_cell) {
            color_cell.style.background = model.color();
        }

        var moment = model.current_moment(),
            update_quantity = function(q) {
                var quantity = _table.quantities[q];
                if (quantity && !quantity.not_in_table) {
                    var query = "[data-quantity='" + q + "']",
                        cell = row.querySelector(query);

                    if (quantity.monotone) {
                        cell.children[0].value = moment[q].toFixed(quantity.precision || 0);
                    } else {
                        // Hack to get locale decimal seperator in Chrome.
                        // Does not work nicely in other browsers as Chrome
                        // makes the input type=number automatically
                        // localized
                        var dec_sep = (1.1).toLocaleString()[1] || ".";
                        cell.children[0].innerHTML = moment[q].toFixed(quantity.precision || 0).replace(/\./, dec_sep);
                    }
                }
            };


        Object.keys(moment)
            .forEach(update_quantity);

        var update_action =  function(action_name) {
            var query = "button[data-action='" + action_name + "']",
                button = row.querySelector(query);

            if (button) {
                var action = model.action(action_name);
                if (action.enabled) {
                    button.removeAttribute("disabled");
                } else {
                    button.setAttribute("disabled", true);
                }
                
            }

        };

        Object.keys(model.actions).forEach(update_action);
    };

    _table.remove = function(model_name) {
        var row = table_body.querySelector("tr#" + model_name);
        if (row) {
            table_body.removeChild(row);
        }
    };

    _table.update = function(model_name) {
        var model = _table.get_model(model_name);

        if (!model.row) {
            model.row = add_row(model.model);
        }

        update_row(model.row, model.model);
    };

    _table.fragment = table_fragment;
    return _table;
};

module.exports = table;

},{"../dom/dom":2,"./view":17}],17:[function(require,module,exports){
/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var view = function(config) {
    var _view = {},
        _appendix = {};

    // Quantities to show
    var show = function(quantity) {
            return !config.quantities[quantity].hidden;
        },
        quantities = {},
        add_quantity = function(q) {
            var quantity = config.quantities[q];
            quantities[quantity.name] = Object.create(quantity);
        };
    Object.keys(config.quantities).filter(show).forEach(add_quantity);
    _view.quantities = quantities;

    
    // Observer pattern

    var models = {};

    _view.compute_extrema = function() {
        // WARNING SOMEHOW CHANGES THE QUANTITIES OF THE MODELS ...
        var compute_maximum = function(quantity_name){
                return function(max, model_name) {
                    var model = models[model_name].model;
                    return Math.max(max, model.get_maximum(quantity_name));
                };
            },
            compute_minimum = function(quantity_name){
                return function(min, model_name) {
                    var model = models[model_name].model;
                    return Math.min(min, model.get_minimum(quantity_name));
                };
            },
            compute_quantity_extrema = function(quantity_name) {
                var quantity = _view.quantities[quantity_name];

                quantity.minimum = Object.keys(models)
                    .reduce(compute_minimum(quantity_name), Infinity);
                quantity.maximum = Object.keys(models)
                    .reduce(compute_maximum(quantity_name), -Infinity);
            };

        Object.keys(_view.quantities)
            .forEach(compute_quantity_extrema);
    };

    _view.register = function(model) {
        var model_found = Object.keys(models).indexOf(model.name);
        if (model_found === -1) {
            models[model.name] = {
                model: model
            };
            model.register(_view);
        }
    };

    _view.unregister = function(model_name) {
        if (models[model_name]) {
            models[model_name].model.unregister(_view);
            _view.remove(model_name);
            delete models[model_name];
            _view.compute_extrema();
            _view.update_all();
        }
    };

    _view.get_model = function(model_name) {
        return models[model_name];
    };

    _view.remove = function(model_name) {
        // implement in specialized view; called by unregister
    };

    _view.update_all = function() {
        Object.keys(models).forEach(_view.update);
    };

    _view.update = function(model_name) {
        // implement in specialized view; called by registered model on
        // change
    };
    _view.models = models;

    _view.type = config.type || "view";

    return _view;    
};

module.exports = view;

},{}]},{},[3])
;