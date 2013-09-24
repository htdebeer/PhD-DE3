;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){

var utils = {};

utils.parse_data = function(data) {

    function parse_time(time) {
        var parts = time.split(":"),
            minutes = parseInt(parts[0], 10),
            seconds_parts = parts[1].split("."),
            seconds = parseInt(seconds_parts[0], 10),
            milliseconds = parseInt(seconds_parts[1], 10);

        return (minutes*60 + seconds)*1000 + milliseconds*100;
    }

    function measurements(line) {
        var parts = line.trim().split(/\t| {2,}/),
            time_part = parts[0],
            temp_part = parts[1];

        return {
            tijd: parse_time(time_part),
            temperatuur: parseFloat(temp_part)
        };
    }

    function no_comments(line) {
        return line.trim().charAt(0) !== "#";
    }

    return data.split("\n").filter(no_comments).map(measurements);
    
};

module.exports = utils;

},{}],3:[function(require,module,exports){

var thermometer = require("./views/temperaturetyper/temperaturetyper"),
    t_util = require("./temperature/util")
    ;

window.temperature_taker = window.temperature_taker || function temperature_taker(config) {

    var microworld = {};

    var scale = config.scale || 3.5; // px per mm
    var quantities = {
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
        temperatuur: {
            name: "temperatuur",
            minimum: -20,
            maximum: 100,
            value: 0,
            label: "temperatuur in °C",
            unit: "°C",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        snelheid: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: '°C/sec',
            name: 'snelheid',
            label: 'snelheid in °C/sec',
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
    if (config.thermometer) {
        views.thermometer = create_view(config.thermometer, thermometer);
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
        switch(model_spec.type) {
            case "sensor":
                model = {};
                break
            case "data":
                model = {};
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

},{"./temperature/util":2,"./views/temperaturetyper/temperaturetyper":4}],4:[function(require,module,exports){

var view = require("../view"),
    draw_thermometer = require("./thermometer"),
    dom = require("../../dom/dom");

var temperaturetyper = function(config, scale_, dimensions_) {
    
    var _temperaturetyper = view(config);

    var scale = scale_ || 4; // px per mm

    var dimensions = dimensions_ || {
        width: 300,
        height: 350,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };

    var CONTAINER = {
            width: dimensions.width,
            height: dimensions.height
        };

    

    _temperaturetyper.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "temperaturetyper"
            }
        }));


    var message = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "div",
                attributes: {
                    "class": "message"
                },
                value: "Activate to start measuring"
            }));
    var measuring_container = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "div",
                attributes: {
                    "class": "container"
                }
            }));
    measuring_container.style.height = CONTAINER.height;
    measuring_container.style.width = CONTAINER.width;

    var measuring_simulation = measuring_container.appendChild(
            dom.create({
                name: "figure",
                attributes: {
                    "class": "simulation"
                }
            }));

    var measuring_data = measuring_container.appendChild(
            dom.create({
                name: "textarea",
                attributes: {
                    "class": "data",
                    "cols": 25,
                    "rows": 20
                },
                style: {
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                },
                on: {
                    type: "keydown",
                    callback: add_new_measurement
                },
                value: format_time(0) + "\t\t"
            }));




    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_temperaturetyper.fragment);

    var canvas = Raphael(measuring_simulation, 
            CONTAINER.width, 
            CONTAINER.height);
    
    var thermometer = draw_thermometer(canvas);


    var time = 0;
    function format_time(time) {
        // time in 0.1 seconds
        var seconds,
            minutes = "00",
            milliseconds;

        if (time >= 600) {
            minutes = ("0" + Math.floor((time / 600))).substr(-2);
        }
        seconds = ("0" + Math.floor((time % 600) / 10)).substr(-2);
        milliseconds = ((time % 600) % 10);

        return "" + minutes + ":" + seconds + "," + milliseconds;
    }

    function add_new_measurement(event) {
        var key = event.key || event.keyCode;
        if (key === 13 || key === 10 || key === "Enter") {
            // enter - key
            event.preventDefault();
            time++;
            var lastline = this.value.substr(this.value.lastIndexOf("\n")+1),
                temperature = parseFloat(lastline.substr(lastline.lastIndexOf("\t")+1));
            if (!isNaN(temperature)) {
                if (-20 <= temperature && temperature <= 100) {
                    thermometer.set_temperature(temperature);
                }
            }
            
            this.value += "\n" + format_time(time) + "\t\t";
            return false;
        } else if (key === 9 || key === "Tab") {
            // tab - key
            event.preventDefault();
            this.value += "\t";
            return false;
        } 
    }

    _temperaturetyper.update = function(model_name) {
    };

    _temperaturetyper.remove = function(model_name) {
    };



    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_temperaturetyper.fragment);
    return _temperaturetyper;

};

module.exports = temperaturetyper;

},{"../../dom/dom":1,"../view":6,"./thermometer":5}],5:[function(require,module,exports){

var thermometer = function(canvas, dimensions_) {

    var dimensions = dimensions_ || {
        width: 60,
        height: 325,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };
    
    var THERMOMETER = {
        x: dimensions.margins.top,
        y: dimensions.margins.left,
        width: dimensions.width - dimensions.margins.left - dimensions.margins.right,
        height: dimensions.height - dimensions.margins.top - dimensions.margins.bottom,
        rounded_corners: dimensions.margins.top + dimensions.margins.left + dimensions.margins.bottom + dimensions.margins.right
    };

    var _thermometer = canvas.set(),
        background,
        empty_blob,
        mercury_blob,
        empty_bar,
        mercury_bar,
        scale;

    var 
        MERCURY_BAR_WIDTH = THERMOMETER.width / 8,
        PADDING = MERCURY_BAR_WIDTH * 3,
        BLOB = {
            x: THERMOMETER.x + THERMOMETER.width / 2,
            y: THERMOMETER.y + THERMOMETER.height - PADDING,
            r: MERCURY_BAR_WIDTH
        },
        BAR = {
            x: THERMOMETER.x + THERMOMETER.width / 2 - MERCURY_BAR_WIDTH / 2,
            y: THERMOMETER.y + PADDING,
            width: MERCURY_BAR_WIDTH,
            height: BLOB.y - (THERMOMETER.y + PADDING + BLOB.r),
            r: MERCURY_BAR_WIDTH/2
        },
        SCALE = BAR.height/120,
        BORDER = 1;
        


    background = canvas.rect(THERMOMETER.x, THERMOMETER.y, THERMOMETER.width, THERMOMETER.height, THERMOMETER.rounded_corners);
    background.attr({
        fill: "white",
        stroke: "dimgray",
        "stroke-width": 2
    });
    _thermometer.push(background);


    empty_blob = canvas.circle( BLOB.x, BLOB.y, BLOB.r + BORDER);
    empty_blob.attr({
        fill: "none",
        stroke: "gray",
        "stroke-width": 0.5
    });
    empty_bar = canvas.rect(BAR.x - BORDER, BAR.y - BORDER, BAR.width + BORDER * 2, BAR.height + (2 * BORDER), BAR.r);
    empty_bar.attr({
        fill: "none",
        stroke: "gray",
        "stroke-width": 0.5
    });

    mercury_blob = canvas.circle( BLOB.x, BLOB.y, BLOB.r );
    mercury_blob.attr({
        "fill": "red",
        "stroke": "none"
    });
    _thermometer.push(mercury_blob);

    mercury_bar = canvas.rect( BAR.x, BAR.y, BAR.width, BAR.height + BLOB.r, BAR.r);
    mercury_bar.attr( {
        "fill": "red",
        "stroke": "none"
    });
    _thermometer.push(mercury_bar);

    function set_temperature( temp ) {
        if (-20 <= temp && temp <= 100) {
            var height = SCALE * (temp + 20),
                y = BAR.y + BAR.height - height;

            mercury_bar.attr({
                y: y,
                height: height + BLOB.r
            });
        }
        return _thermometer;
    }

    _thermometer.set_temperature = set_temperature;
    
    _thermometer.set_temperature(22);


    scale = draw_scale();
    _thermometer.push(scale);

    function draw_scale() {
        var scale = canvas.set();

        
        var TEN_DEGREE_SIZE = (THERMOMETER.width / 2) - BAR.width,
            FIVE_DEGREE_SIZE = TEN_DEGREE_SIZE / 2,
            DEGREE_SIZE = FIVE_DEGREE_SIZE / 2,
            ten_degree_ticks = canvas.path(create_ticks_path(0, TEN_DEGREE_SIZE)),
            five_degree_ticks = canvas.path(create_ticks_path(SCALE*5, FIVE_DEGREE_SIZE));

        ten_degree_ticks.attr({
            "stroke-width": 1,
            "stroke": "dimgray"
        });
        scale.push(ten_degree_ticks);
        five_degree_ticks.attr({
            "stroke-width": 1,
            "stroke": "dimgray"
        });
        scale.push(five_degree_ticks);
        [1, 2, 3, 4, 6, 7, 8, 9].forEach(draw_degree_ticks);
        scale.push(draw_labels());
        scale.push(draw_unit());

        function draw_unit() {
            var x = THERMOMETER.x + THERMOMETER.width/2 - PADDING/4,
                y = THERMOMETER.y + PADDING/2,
                unit_label = canvas.text(x, y, "°C");

            unit_label.attr({
                "font-size": PADDING + "px",
                "font-family": "inherit"
            });

            return unit_label;
        }
        

        function draw_labels() {
            var labels = canvas.set();

            
            var TEN_DEGREES_IN_PX = SCALE * 10,
                degrees = -20,
                h = BAR.y + BAR.height,
                y_end = BAR.y,
                x_start = THERMOMETER.x + THERMOMETER.width - BAR.width - PADDING/3,
                label;

            while (h > y_end) {
                label = canvas.text(x_start, h, degrees);
                label.attr({
                    "text-anchor": "right",
                    "font-size": "" + PADDING/2 + "px",
                    "font-family": "inherit"
                });
                labels.push(label);
                h = h - TEN_DEGREES_IN_PX;
                degrees += 10;
            }

            return labels;
        }

        function draw_degree_ticks(step) {
              var degree_ticks = canvas.path(create_ticks_path(SCALE*step, DEGREE_SIZE));
              degree_ticks.attr({
                  "stroke-width": 0.5,
                  "stroke": "dimgray"
              });
              scale.push(degree_ticks);
        }

        function create_ticks_path(step, size) {
            var TEN_DEGREES_IN_PX = SCALE * 10,
                ticks_path;

            var h = BAR.y + BAR.height + step,
                y_end = BAR.y + TEN_DEGREES_IN_PX,
                x_start = THERMOMETER.x;

            while (h > y_end) {
                h = h - TEN_DEGREES_IN_PX;
                ticks_path += "M" + x_start + "," + h + "h" + size;
            }

            return ticks_path;
        }

        return scale;
    }


    _thermometer.set_temperature = set_temperature;

    return _thermometer;

};

module.exports = thermometer;

},{}],6:[function(require,module,exports){
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