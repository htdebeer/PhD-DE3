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
            if (spec.name === "input") {
                elt.value = spec.value;
            } else {
                elt.innerHTML = spec.value;
            }
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
        _model.reset();
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


    var step = config.step_size || T_STEP ;
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
},{}],4:[function(require,module,exports){
var model = require("./model");

var motion = function(name, config) {

    var a;

    function create_actions(action_list) {
        var actions = {},
            create_action = function(action_name) {
                actions[action_name] = default_actions[action_name];
            };
        action_list.forEach(create_action);
        return actions;
    }

    var quantities = {
        afgelegde_afstand: {
            name: "afgelegde_afstand",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "afgelegde afstand in " + (config.distance_unit || "m"),
            unit: config.distance_unit || "m",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: config.duration || 10,
            value: 0,
            label: "tijd in " + (config.time_unit || "sec"),
            unit: config.time_unit || "sec",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        }
    };

    quantities.snelheid = {
            name: "snelheid",
            minimum: 0,
            maximum: 0,
            value: config.starting_speed || 0,
            label: "snelheid in " + quantities.afgelegde_afstand.unit + "/" + quantities.tijd.unit,
            unit: quantities.afgelegde_afstand.unit + "/" + quantities.tijd.unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
        };
    quantities.versnelling = {
            name: "versnelling",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "versnelling in " + quantities.snelheid.unit + "/" + quantities.tijd.unit,
            unit: quantities.snelheid.unit + "/" + quantities.tijd.unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
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

    function compute_quantities() {
        var values = [];

        for (var i = 0; i < 100; i++) {
        values.push({
            tijd: i,
            afgelegde_afstand: i,
            snelheid: i,
            versnelling: i
        });
        }

        return values;
    }


    values = [];
    function compute_maxima() {
        values = compute_quantities();

        var max = values[values.length - 1],
            min = values[0],
            max_tijd_in_ms = (values.length - 1) * step;

        _model.set_end(max_tijd_in_ms / 1000);
        _model.quantities._time_.maximum = max_tijd_in_ms;

        _model.quantities.tijd.maximum = max.tijd.toFixed(quantities.tijd.precision);

        _model.quantities.afgelegde_afstand.maximum = max.afgelegde_afstand.toFixed(quantities.afgelegde_afstand.precision);
        _model.quantities.afgelegde_afstand.minimum = 0;

        _model.quantities.snelheid.maximum = Math.max.apply(null, values.map(function(v) {return v.snelheid;})) + 1;

        _model.quantities.snelheid.minimum = Math.min.apply(null, values.map(function(v) {return v.snelheid;})) - 1;

        _model.quantities.versnelling.maximum = Math.max.apply(null, values.map(function(v) {return v.versnelling;})) + 1;

        _model.quantities.versnelling.minimum = Math.min.apply(null, values.map(function(v) {return v.versnelling;})) - 1;
    }

    compute_maxima();

    _model.measure_moment = function(moment) {
        var tijd = 0,
            afgelegde_afstand = 0,
            snelheid = 0,
            versnelling = 0;

        return {
            tijd: tijd,
            afgelegde_afstand: afgelegde_afstand,
            snelheid: snelheid,
            versnelling: versnelling
        };
    };

    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "motion";

    return _model;
};

module.exports = motion;

},{"../actions/actions":1,"./model":3}],5:[function(require,module,exports){

var motion_model = require("./models/motion"),
    motion_editor = require("./views/motion_editor"),
    table = require("./views/table"),
    graph = require("./views/graph");

window.motion_grapher = window.motion_grapher || function motion_grapher(config) {

    var microworld = {};

    function convert_distance(distance, from_unit, to_unit) {
        var converter = {
            "mm": {
                "mm": function(distance) {
                    return distance;
                },
                "cm": function(distance) {
                    return distance/10;
                },
                "m": function(distance) {
                    return distance/1000;
                },
                "km": function(distance) {
                    return ditance/1000000;
                }
            },
            "cm": {
                "mm": function(distance) {
                    return distance*10;
                },
                "cm": function(distance) {
                    return distance;
                },
                "m": function(distance) {
                    return distance/100;
                },
                "km": function(distance) {
                    return ditance/100000;
                }
            },
            "m": {
                "mm": function(distance) {
                    return distance*1000;
                },
                "cm": function(distance) {
                    return distance*100;
                },
                "m": function(distance) {
                    return distance;
                },
                "km": function(distance) {
                    return ditance/1000;
                }
            },
            "km": {
                "mm": function(distance) {
                    return distance*1000000;
                },
                "cm": function(distance) {
                    return distance*100000;
                },
                "m": function(distance) {
                    return distance*1000;
                },
                "km": function(distance) {
                    return ditance;
                }
            }
        };

        return converter[from_unit][to_unit](distance);
    }

    function convert_time(time, from_unit, to_unit) {
        var converter = {
            "ms": {
                "ms": function(time) {
                    return time;
                },
                "sec": function(time) {
                    return time/1000;
                },
                "min": function(time) {
                    return time/60000;
                },
                "uur": function(time) {
                    return time/3600000;
                }
            },
            "sec": {
                "ms": function(time) {
                    return time*1000;
                },
                "sec": function(time) {
                    return time;
                },
                "min": function(time) {
                    return time/60;
                },
                "uur": function(time) {
                    return time/3600;
                }
            },
            "min": {
                "ms": function(time) {
                    return time*60000;
                },
                "sec": function(time) {
                    return time*60;
                },
                "min": function(time) {
                    return time;
                },
                "uur": function(time) {
                    return time/60;
                }
            },
            "uur": {
                "ms": function(time) {
                    return time*3600000;
                },
                "sec": function(time) {
                    return time*3600;
                },
                "min": function(time) {
                    return time*60;
                },
                "uur": function(time) {
                    return time;
                }
            }
        };

        return converter[from_unit][to_unit](time);
    }

    function time_to_seconds(time, from_unit) {
        return convert_time(time, from_unit, "sec");
    }

    var quantities = {
        afgelegde_afstand: {
            name: "afgelegde_afstand",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "afgelegde afstand in " + (config.distance_unit || "m"),
            unit: config.distance_unit || "m",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: config.duration || 10,
            value: 0,
            label: "tijd in " + (config.time_unit || "sec"),
            unit: config.time_unit || "sec",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        }
    };

    quantities.snelheid = {
            name: "snelheid",
            minimum: 0,
            maximum: 0,
            value: config.starting_speed || 0,
            label: "snelheid in " + quantities.afgelegde_afstand.unit + "/" + quantities.tijd.unit,
            unit: quantities.afgelegde_afstand.unit + "/" + quantities.tijd.unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
        };
    quantities.versnelling = {
            name: "versnelling",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "versnelling in " + quantities.snelheid.unit + "/" + quantities.tijd.unit,
            unit: quantities.snelheid.unit + "/" + quantities.tijd.unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
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
        switch(model_spec.type) {
            case "motion":
                model = motion_model(model_spec.name, {
                    name: model_spec.name,
                    starting_speed: model_spec.starting_speed || 0,
                    specification: model_spec.specification || {}
                });
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

},{"./models/motion":4,"./views/graph":6,"./views/motion_editor":7,"./views/table":8}],6:[function(require,module,exports){
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
                        value: quantity_name
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

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + GRAPH.height + ")")
                .call(axis);

            var xgridg = _graph.fragment.querySelector("g.x.grid");
            if (xgridg) {
                xgridg.parentNode.removeChild(xgridg);
            }

            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + GRAPH.height + ")")
                .call(axis.tickSize(- GRAPH.height, 0, 0).tickFormat(""));

            var xlabel = _graph.fragment.querySelector("text.x.label");
            if (xlabel) {
                xlabel.parentNode.removeChild(xlabel);
            }

            svg.append('text')
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

            svg.append("g")
                .attr("class",  "y axis")
                .call(axis);

            var ygridg = _graph.fragment.querySelector("g.y.grid");
            if (ygridg) {
                ygridg.parentNode.removeChild(ygridg);
            }

            svg.append("g")
                .attr("class", "y grid")
                .call(axis.tickSize(- GRAPH.width, 0, 0).tickFormat(""));

            var ylabel = _graph.fragment.querySelector("text.y.label");
            if (ylabel) {
                ylabel.parentNode.removeChild(ylabel);
            }

            svg.append('text')
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
                    "stroke-width": 2,
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
                a, 
                b;

            if (length_at_point > 1 && length_at_point < (total_length - 1)) {
                prev = path.getPointAtLength(length_at_point - 0.1);
                next = path.getPointAtLength(length_at_point + 0.1);
                a = (y_scale.invert(next.y) - y_scale.invert(prev.y)) /
                    (x_scale.invert(next.x) - x_scale.invert(prev.x));
                b = y_scale.invert(prev.y) - a*x_scale.invert(prev.x);
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
            var SEP = GRAPH_LINE_WIDTH;

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


            var tangent_text = (a).toFixed(y_quantity.precision || 0) + " " + y_quantity.unit + " per " + x_quantity.unit;
            

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

},{"../dom/dom":2,"./view":9}],7:[function(require,module,exports){

var view = require("./view"),
    dom = require("../dom/dom");


var motion_editor = function(config_) {
    var config = Object.create(config_);
    config.type = "motion_editor";
    var _editor = view(config);
    
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

    _editor.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "div",
            attributes: {
                "class": "motion_editor"
            }
        }));

    return _editor;
};

module.exports = motion_editor;

},{"../dom/dom":2,"./view":9}],8:[function(require,module,exports){
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
                value: model.name.split("_").join(" "),
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
                value: "toevoegen ...",
                attributes: {
                    value: -1
                }
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
                        value: quantity.name
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

},{"../dom/dom":2,"./view":9}],9:[function(require,module,exports){
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

},{}]},{},[5])
;