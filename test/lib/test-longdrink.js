;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){


// add attribution to the icons: "Entypo pictograms by Daniel Bruce — www.entypo.com"

var actions = function(config) {
    var _actions = {};


    // Running model actions

    var running_models = {},
        current_speed = config.speed || 500;

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

    // Remove model actions
    
    _actions.remove = {
        name: "remove",
        group: "edit",
        icon: "icon-remove",
        tooltip: "Remove this model",
        enabled: true,
        callback: function(model) {
            return function() {
                var row = this.parentElement.parentElement;
                row.parentElement.removeChild(row);
                model.unregister();
            };
        }
    };

    // Toggle view action


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
            elt.addEventListener( spec.on.type, spec.on.callback );
        }

        if (spec.value) {
            if (spec.name === "input") {
                elt.value = spec.value;
            } else {
                elt.innerHTML = spec.value;
            }
        }

        return elt;
    }
};

module.exports = dom;

},{}],3:[function(require,module,exports){
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
var longdrink_glass = function(config) {

    var name = config.name,
        radius = config.radius || 2,
        height = config.height || 7.5,
        flow_rate = config.flow_rate || 50,
        action_list = config.actions || ["start", "pause", "reset", "finish", "remove"],
        default_actions = require("../actions/actions")({speed: flow_rate});

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
    var area = Math.PI * Math.pow(radius, 2);
    function compute_height(volume) {
        if (volume > 0) {
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
            maximum: height,
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
            maximum: area*height,
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
            maximum: area*height / flow_rate,
            value: 0,
            unit: 'sec',
            name: "tijd",
            label: "tijd",
            stepsize: 0.01,
            monotone: true,
            precision: 2
        }
    };

    var time = {
        start: 0,
        end: quantities.tijd.maximum*1000,
        step: Math.ceil(1000/flow_rate)
    };

    var _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });

    _model.measure_moment = function(moment) {
        var time_in_ms = _model.moment_to_time(moment),
            tijd = time_in_ms / 1000,
            volume = compute_volume(tijd),
            hoogte = compute_height(volume);

        return {
            tijd: tijd,
            volume: volume,
            hoogte: hoogte
        };
    };

    _model.step();

    return _model;
};

module.exports = longdrink_glass;

},{"../actions/actions":1,"./model":4}],4:[function(require,module,exports){
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
        }
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
        return now;
    };

    // We call the model finished if the current moment, or `now`, is the
    // phenomenon's last moment.

    _model.is_finished = function() {
        return _model.can_finish() && m2t(now) >= T_END;
    };


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
                    minima[quantity] = _model.quantities[quantity].minimum;
                };

            Object.keys(_model.quantities).forEach(add_minimum);
            return minima;
        } else {
            // return quantity's minimum
            return _model.quantities[quantity].minimum;
        }
    };
                    
    _model.get_maximum = function(quantity) {
        if (arguments.length===0) {
            // called without any arguments: return all minima
            var maxima = {},
                add_maximum = function(quantity) {
                    maxima[quantity] = _model.quantities[quantity].maximum;
                };

            Object.keys(_model.quantities).forEach(add_maximum);
            return maxima;
        } else {
            // return quantity's minimum
            return _model.quantities[quantity].maximum;
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
                INCREASING = (start === _model.get_minimum(quantity));

            // Use a stupid linear search to find the moment that approaches the
            // value best


            var m = 0,
                n = moments.length - 1,
                approx = _appendix.approximates(EPSILON),
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

        if (value < q.minimum) {
            value = q.minimum;
        } else if (value > q.maximum) {
            value = q.maximum;
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

    _model.current_moment = function() {
        return moments[now];
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


    return _model;
};    


module.exports = model;

})()
},{}],5:[function(require,module,exports){
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
module.exports = function(_models) {

    var _table = require("./view")(_models);
    var table_element = document.createDocumentFragment()
        .appendChild(dom.create({
            name: "table"
        }));
   
    create_table();
    
    _table.update = function(model_name) {
        var model = _table.get_model(model_name);

        if (!model.row) {
            model.row = add_row(model.model);
        }

        update_row(model.row, model.model);
    };

    _table.fragment = table_element;
    return _table;

    function create_table() {

        create_head(table_element);
        create_body(table_element);
        create_foot(table_element);

        function create_head(table_element) {
            var table_head = table_element.appendChild(dom.create({name: "thead"})),
                head = table_head.appendChild(dom.create({name: "tr"}));

            // name column
            head.appendChild(dom.create({
                name: "th",
                attributes: { "class": "corner" }
            }));

            function add_cell_for_quantity(quantity) {
                head.appendChild( dom.create({
                    name: "th",
                    value: quantity.label
                }));
            }                            
            _table.quantities().forEach(add_cell_for_quantity);

            // actions, if any
            head.appendChild(
                dom.create({
                    name: "th",
                    attributes: {
                        "class": "corner"
                    }
                })
            );

        }

        function create_foot(table_element) {
            var table_foot = table_element
                .appendChild(dom.create({name: "tfoot"}));

            function create_model_list() {
                var models = _table.models(),
                    model_options = models.map(model_to_option);

                console.log(model_options, models);

                function model_to_option(model) {
                    return {
                        name: "option",
                        value: model.model.name
                    };
                }

                return {
                    name: "select",
                    children: model_options
                };
                
            }

            table_foot.appendChild(dom.create({
                name: "tr",
                children: [
                    {
                        name: "th",
                        attributes: {
                            "class": "corner action",
                            "data-list": true
                        },
                        children: [
                                    {
                                    name: "i",
                                    attributes: {
                                        "class": "icon-plus"
                                    }
                                }, create_model_list()]
                    }, {
                        name: "th",
                        attributes: {
                            "class": "corner",
                            "colspan": _table.quantities().length + 1
                        }
                    }
                ]
            }));

        }

        function create_body(table_element) {
            // create body
            table_element.appendChild(
                    dom.create({name: "tbody"})
                    );

        }

    }


    function add_row(model) {
        var row;

        var create_quantity_elt = function(quantity) {
                    
                var cell = {
                        name: "td",
                        attributes: {
                            "data-quantity": quantity.name
                        }
                    };
                if (quantity.monotone) {
                    cell.children = [{
                        name: "input",
                        attributes: {
                            "type": "number",                        
                            "min": quantity.minimum,
                            "max": quantity.maximum + quantity.stepsize,
                            "step": quantity.stepsize || "any"
                        },
                        on: {
                            type: "change",
                            callback: function() {
                                var query = "[data-quantity='" + quantity.name + "']",
                                    elt = row.querySelector(query),
                                    value = elt.children[0].value;

                                model.set( quantity.name, value );
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
            quantity_elts = _table.quantities().map(create_quantity_elt);

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

                return {
                    name: "button",
                    attributes: {
                        "class": classes,
                        "data-action": action_name,
                        "data-tooltip": action.tooltip
                    },
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
            },
            actions_elts = Object.keys(model.actions).map(create_action_elt);

        var table_body = table_element.querySelector("tbody");
        row = table_body.appendChild(
                dom.create( {
                    name: "tr",
                    attributes: {
                        "id": model.name
                    },
                    children: [{
                        name: "td",
                        value: model.name,
                        attributes: { "class": model.name }
                    }].concat(quantity_elts).concat([{
                        name: "td",
                        children: actions_elts
                    }])
                }));

        return row;
    }





    function update_row(row, model) {
        var moment = model.current_moment(),
            update_quantity = function(q) {
                var quantity = _table.quantity(q);
                if (quantity) {
                    var query = "[data-quantity='" + q + "']",
                        cell = row.querySelector(query);

                    if (quantity.monotone) {
                        cell.children[0].value = moment[q].toFixed(quantity.precision || 3);
                    } else {
                        cell.children[0].innerHTML = moment[q].toFixed(quantity.precision || 3);
                    }
                }
            };

        Object.keys(moment).forEach(update_quantity);

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
    }


};

},{"../dom/dom":2,"./view":6}],6:[function(require,module,exports){
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

module.exports = function(_quantities) {

    var _view = {
            register: register,
            unregister: unregister,
            quantities: quantities_to_array,
            quantity: quantity,
            update: update,
            models: models_to_array,
            get_model: get_model
        },
        models = {},
        quantities = {};

    set_quantities(_quantities);

    return _view;    

    function register(model) {
        var model_found = Object.keys(models).indexOf(model.name);
        if (model_found === -1) {
            models[model.name] = {
                model: model
            };
            model.register(_view);
            _view.update(model.name);
        }
    }

    function unregister(model) {
        if (models[model.name]) {
            model.unregister(_view);
            delete models[model.name];
        }
    }

    function models_to_array() {
        return Object.keys(models).map(function(model) {
            return models[model];
        });
    }

    function get_model(model_name) {
        return models[model_name];
    }

    function update(model_name) {
        // implement in specialized view; called by registered model on
        // change
    }

    function quantities_to_array() {
        return Object.keys(quantities).map(function(name) {
            return quantities[name];
        });
    }

    function quantity(name) {
        return quantities[name];
    }

    function set_quantities(_quantities) {

        function show(quantity_name) {
            return !_quantities[quantity_name].hidden;
        }

        function add_quantity(quantity_name) {
            var quantity = _quantities[quantity_name];
            quantities[quantity_name] = quantity;
        }

        return Object.keys(_quantities).filter(show).forEach(add_quantity);
    }


};

},{}],7:[function(require,module,exports){

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



},{"../src/models/longdrink_glass":3,"../src/views/table":5,"../src/views/view":6}]},{},[7])
;