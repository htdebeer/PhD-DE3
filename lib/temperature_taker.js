;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var utils = {};


utils.create = function(metadata, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                callback.call(null, {});
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };

    httpRequest.open("POST", "http://primarycalculus.org/DOEN/start_measuring.php");
    httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    httpRequest.send(JSON.stringify(metadata));
};

utils.update = function(data, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                if (callback) {
                    callback.call(null, {});
                }
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };

    httpRequest.open("POST", "http://primarycalculus.org/DOEN/update_data.php");
    httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    httpRequest.send(JSON.stringify(data));
};

utils.close = function(callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                callback.call(null, httpRequest.responseText);
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };

    httpRequest.open("GET", "http://primarycalculus.org/DOEN/stop_measuring.php");
    httpRequest.send(null);
};



utils.load_model_list = function(callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                var data = JSON.parse(httpRequest.responseText);
                callback.call(null, data);
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };
    httpRequest.open('GET', "http://primarycalculus.org/DOEN/get_model_list.php", true);
    httpRequest.send(null);
};

utils.load = function(model, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                var data = utils.parse_data(httpRequest.responseText,
                        model.format,
                        model.quantities);
                callback.call(null, data);
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };
    httpRequest.open('GET', model.data_url, true);
    httpRequest.send(null);
};

utils.parse_data = function(data, format, quantities) {

    var FIELD_SEP;
    switch (format) {
        case "TAB":
            FIELD_SEP = "\t";
            break;
        case "CSV":
            FIELD_SEP = ",";
            break;
        case "SSV":
            FIELD_SEP = ";";
            break;
        default:
            FIELD_SEP = ";";
    }

    var fields = [];

    function parse_time(time, unit) {

        var parts = time.split(":");
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);
        var seconds, milliseconds;
        if (unit === "ms") {
            var seconds_parts = parts[2].split(".");
            seconds = parseInt(seconds_parts[0], 10);
            milliseconds = parseInt(seconds_parts[1], 10);
        } else {
            seconds = parseInt(parts[2], 10);
        }

        var value;

        switch (unit) {
            case "ms":
                value = (hours * 3600 + minutes * 60 + seconds)*1000 + milliseconds;
                break;
            case "sec":
                value = hours * 3600 + minutes * 60 + seconds;
                break;
            case "min":
                value = hours * 60 + minutes + seconds/60;
                break;
            case "hour":
                value = hours + minutes/60 + seconds/3600;
                break;
        }

        return value;
    }

    function measurements(line) {

        var parts = line.trim().split(FIELD_SEP),
            values = {};

        quantities.forEach(function(q, index) {
            var part = parts[index].trim();
            var value;

            switch (q.type) {
                case "time":
                    value = parse_time(part, q.unit);
                    break;
                case "int":
                    value = parseInt(part, 10);
                    break;
                case "real":
                    value = parseFloat(part);
                    break;
                default:
                    value = "error";
            }

            values[q.name] = value;
        });

        return values;
    }

    function no_comments(line) {
        return line.trim().charAt(0) !== "#";
    }

    function parseable(line) {
        return line.trim().split(FIELD_SEP).length === quantities.length;
    }

    return data.split("\n").filter(no_comments).filter(parseable).map(measurements);
    
};

module.exports = utils;

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

},{}],4:[function(require,module,exports){

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
    if (config.thermometer) {
        views.thermometer = create_view(config.thermometer, thermometer);
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
                break;
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

},{"./temperature/util":3,"./views/temperaturetyper/temperaturetyper":5}],5:[function(require,module,exports){

var view = require("../view"),
    draw_thermometer = require("./thermometer"),
    data_util = require("../../data/util"),
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


    var title = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "h2",
                attributes: {},
                value: "Meet de temperatuur met een sensor"
            }));

    var metadata_form = _temperaturetyper.fragment.appendChild(
        dom.create({
            name: "form",
            attributes: {
                action: "/",
                method: "POST",
                "class": "metadata"
            },
            style: {
                "border-bottom": "1px solid dimgray",
                "padding-bottom": "1ex"
            }
        }));

    var name_label = metadata_form.appendChild(
        dom.create({
            name: "label",
            attributes: {
                "for": "name"
            },
            value: "Naam"
        }));
    var name_field = metadata_form.appendChild(
        dom.create({
            name: "input",
            attributes: {
                id: "name",
                type: "text",
                size: "30",
                placeholder: "Geef deze meting een naam"
            }            
        }));

    metadata_form.appendChild(
            dom.create({
                name: "br"
            }));

    var description_label = metadata_form.appendChild(
        dom.create({
            name: "label",
            attributes: {
                "for": "description"
            },
            value: "Omschrijving"
        }));
    var description_field = metadata_form.appendChild(
        dom.create({
            name: "input",
            attributes: {
                id: "description",
                type: "text",
                size: "30",
                placeholder: "Type hier een korte omschrijving"
            }            
        }));

    var message = metadata_form.appendChild(
            dom.create({
                name: "p",
                attributes: {
                    "class": "message"
                },
                value: "Geef deze meting een naam en een korte omschrijving en klik de Startknop om te beginnen met meten. Let op, verbind de sensor nog <strong>niet</strong> met de computer!"
            }));

    var start_button = metadata_form.appendChild(
            dom.create({
                name: "button",
                attributes: {
                    id: "start_measurement_button"
                },
                value: "Start meten",
                on: {
                    type: "click",
                    callback: start_measuring
                }
            }));

    var stop_button = metadata_form.appendChild(
            dom.create({
                name: "button",
                attributes: {
                    id: "stop_measurement_button",
                    disabled: true
                },
                value: "Stop meten",
                on: {
                    type: "click",
                    callback: stop_measuring
                }
            }));

    var measuring_container = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "div",
                attributes: {
                    "class": "container"
                },
                style: {
                    "margin": "1ex",
                    "padding": "1ex"
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
                    "rows": 20,
                    "readonly": true
                },
                style: {
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                },
                on: {
                    type: "keydown",
                    callback: add_new_measurement
                }
            }));




    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_temperaturetyper.fragment);

    var canvas = Raphael(measuring_simulation, 
            CONTAINER.width, 
            CONTAINER.height);
    
    var thermometer = draw_thermometer(canvas);

    var measurement_buffer = [];
    function add_new_measurement(event) {
        var key = event.key || event.keyCode;
        if (key === 13 || key === 10 || key === "Enter") {
            // enter - key
            event.preventDefault();
            var lastline = this.value.substr(this.value.lastIndexOf("\n")+1);
            var parts = lastline.trim().split(';');
            if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
                var temperature = parseFloat(lastline.substr(lastline.lastIndexOf(";")+1));
                if (!isNaN(temperature)) {
                    if (-20 <= temperature && temperature <= 100) {
                        thermometer.set_temperature(temperature);
                    }
                    measurement_buffer.push(lastline);
                }
            }
            this.value += "\n";
            return false;
        } else if (key === 9 || key === "Tab") {
            // tab - key
            event.preventDefault();
            this.value += "\t";
            return false;
        } 
    }

    var upload_interval;
    var can_upload = false;
    function upload_measurements() {
        if (can_upload && measurement_buffer.length > 0) {
            var upload_buffer = measurement_buffer.slice(0);
            measurement_buffer = [];
            data_util.update(upload_buffer);
        }
    }

    function start_measuring(event) {
        event.preventDefault();
        var data = {};
        data.name = name_field.value;
        data.description = description_field.value;
        data.quantities = [{
            name: "tijd",
            minimum: 0,
            maximum: 100,
            value: 0,
            label: "tijd in min",
            unit: "min",
            stepsize: 0.01,
            precision: 2,
            monotone: true,
            type: "time"
        },{
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
            ];
        data.format = "SSV"; // semicolon separated values

        if (data.name && data.name !== "") {
            data.name = "meting-" + data.name.replace(/\W/g, "_");
            name_field.setAttribute("readonly", true);
            description_field.setAttribute("readonly", true);
            message.classList.remove("error");
            stop_measurement_button.removeAttribute("disabled");
            start_measurement_button.setAttribute("disabled", true);
            message.innerHTML = "Verbind de sensor met de computer. <strong>Blijf tijdens het meten af van het toetsenbord en de muis</strong>, behalve om de meting te stoppen met behulp van de Stopknop";

            measuring_data.removeAttribute("readonly");
            measuring_data.focus();
            data_util.create(data, function() {
                can_upload = true;
            });
            upload_interval = setInterval(upload_measurements, 30000);
        } else {
            message.classList.add("error");
            message.innerHTML = "Geef de meting een naam.";
        }

    }

    function stop_measuring(event) {
        event.preventDefault();
        measuring_data.setAttribute("readonly", true);
        message.classList.remove("error");
        stop_measurement_button.setAttribute("disabled", true);
        message.innerHTML = "Haal de sensor uit de computer. De meting wordt opgeslagen op de server ...";
        clearInterval(upload_interval);
        upload_measurements();
        can_upload = false;
        data_util.close(
                function(url) {
                    message.innerHTML = "De meting is opgeslagen en kan worden opgevraagd als een <a href='http://primarycalculus.org/DOEN/" + url + "'>databestand</a> of ingelezen worden als een <a href='temperatuurgrafiek.html'>temperatuurgrafiek</a>.";
                }
        );
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

},{"../../data/util":1,"../../dom/dom":2,"../view":7,"./thermometer":6}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){
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

},{}]},{},[4])
;