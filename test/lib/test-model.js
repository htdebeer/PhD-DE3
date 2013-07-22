;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){


// add attribution to the icons: "Entypo pictograms by Daniel Bruce — www.entypo.com"

var actions = function(config) {
    var _actions = {},
        running_models = {}
        ;

    var current_speed = config.speed || 500;

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
            icon: "icon-pause",
            tooltip: "Pause simulation",
            enabled: false,
            callback: function(model) {
                return function() {
                    model.enable_action("start");
                    model.disable_action("pause");
                    if (is_running(model)) {
                        clearInterval(running_models[model.name]);
                        delete running_models[model.name];
                    }
                    model.update_views();
                };
            }
    };

    _actions.reset = {
        name: "reset",
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
        var elt = document.createElement(spec.name),
            set_attribute = function(attr) {
                elt.setAttribute(attr.name, attr.value);
            };

        if (spec.attributes) {
            spec.attributes.forEach(set_attribute);
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

/*
 *  equation.js is a model based on a simple equation like y = x^2
 */

var equation_model = function(name, config) {
    var _model = require("./model")(name, config),
        f = config.equation;

    _model.measure_moment =  function(moment) {
        var x = moment,
            y = f(x);
        return {
            x: x,
            y: y
        };
    };

    return _model;
};

module.exports = equation_model;


},{"./model":4}],4:[function(require,module,exports){
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
        var view_found = views.indexOf(view);
        if (view_found !== -1) {
            views.slice(view_found, 1);
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
        if (_model.can_finish()) {
            while ((moments.length - 1) < t2m(T_END)) {
                _model.step();
            }
        }
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
        minimum: T_START,
        maximum: T_END,
        value: m2t(now),
        stepsize: T_STEP,
        unit: "ms",
        label: "internal time",
        monotonicity: true
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
            // determine type of monotonicity
            //
            // As the first moment has been measured and we do know the
            // minimum of this quantity, type of monotonicity follows.

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
            m--;
            while (upperbound(n)) {
                n--;
                if (n<m) {
                    return -1;
                }
            }
            n++;

            return (Math.abs(val(n)-value) < Math.abs(val(m)-value))?n:m;
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
        // only increase. Those quantities with property `monotonicity`
        // `true`, only one value will be searched for
        
        var approx = _appendix.approximates(),
            moments_with_value = [];
        if (q.monotonicity) {
            var moment = _model.find_moment(quantity, value);
            if (moment !== -1) {
                moments_with_value.push(moment);
            }
        } else {
            // This does not work: no guarantee about approximation. Fix this.
            var has_value = function(element, index, array) {
                    return approx(element[quantity],value);
                };
            moments_with_value = moments.filter(has_value);
        }

        if (moments_with_value.length === 0) {
            // not yet "measured"
            var DO_NOT_UPDATE_VIEWS = true;
            _model.step(DO_NOT_UPDATE_VIEWS);
            while(!approx(moments[now][quantity], value) && !_model.is_finished()) {
                _model.step(DO_NOT_UPDATE_VIEWS);
            }
        } else {
            now = moments_with_value[0];
        }
        update_views();
        return moments[now];
    };

    _model.data = function() {
        return moments;
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

var table = function(config) {
    var _table = require("./view")(config),
        _appendix = {};

    var table_fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "table",
            attributes: []
        }));

    var create_head = function() {
        var table_head = table_fragment
            .appendChild(dom.create({name: "thead"})),
            quantities = config.quantities || {},
            actions = config.actions || {};

        var head = table_head.appendChild(dom.create({name: "tr"}));

        // name column
        head.appendChild(dom.create({
            name: "th",
            attributes: [{
                name: "class",
                value: "corner"
            }]
        }));

        // quantities, if any
        var number_of_quantities = Object.keys(quantities).length;
        if (number_of_quantities > 0) {
                var add_cell = function(q) {
                    var quantity = quantities[q],
                        label = (quantity.unit)?
                            quantity.label + " (" + quantity.unit + ")":
                            quantity.label;

                    head.appendChild( dom.create({
                        name: "th",
                        value: label
                    }));
                };                            

            Object.keys(quantities).forEach(add_cell);
        }

        // actions, if any
        head.appendChild(
            dom.create({
                name: "th",
                attributes: [{
                    name: "class",
                    value: "corner"
                }]
            })
        );




        
        

    };
    create_head();

    // create body
    var table_body = table_fragment.appendChild(
            dom.create({name: "tbody"})
            );

    var add_row = function(model) {
        var quantities = config.quantities || {},
            create_quantity_elt = function(quantity) {
                return {
                    name: "td",
                    attributes: [{
                        name: "data-quantity",
                        value: quantity
                    }]
                };
            },
            quantity_elts = Object.keys(quantities).map(create_quantity_elt);

        var create_action_elt = function(action_name) {
            var action = model.action(action_name);
                return {
                    name: "button",
                    attributes: [{
                        name: "class",
                        value: "action"
                    }, {
                        name: "data-action",
                        value: action_name
                    }],
                    children: [{
                        name: "i",
                        attributes: [{
                            name: "class",
                            value: action.icon
                        }]
                    }],
                    on: {
                        type: "click",
                        callback: action.install()
                    }
                };
            },
            actions_elts = Object.keys(model.actions).map(create_action_elt);

        return table_body.appendChild(
                dom.create( {
                    name: "tr",
                    attributes: [{
                        name: "id",
                        value: model.name
                    }],
                    children: [{
                        name: "td",
                        value: model.name,
                        attributes: [{
                            name: "class",
                            value: model.name
                        }]
                    }].concat(quantity_elts).concat([{
                        name: "td",
                        children: actions_elts
                    }])
                }));


    };

    var update_row = function(row, model) {
        var moment = model.current_moment(),
            update_quantity = function(quantity) {
                var query = "[data-quantity='" + quantity + "']",
                    cell = row.querySelector(query);
                if (!cell) {
                    cell = dom.create({name: "td",
                    attributes: [{
                        name: "data-quantity",
                        value: quantity
                    }]});
                    row.appendChild(cell);
                }

                cell.innerHTML = moment[quantity];

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

var view = function(config) {
    var _view = {},
        _appendix = {};
    
    // Observer pattern

    var models = {};

    _view.register = function(model) {
        var model_found = Object.keys(models).indexOf(model.name);
        if (model_found === -1) {
            models[model.name] = {
                model: model
            };
            model.register(this);
            _view.update(model.name);
        }
    };

    _view.unregister = function(model) {
        if (models[model.name]) {
            model.unregister(this);
            delete models[model.name];
        }
    };

    _view.get_model = function(model_name) {
        return models[model_name];
    };

    _view.update = function(model_name) {
        // implement in specialized view; called by registered model on
        // change
    };

    return _view;    
};

module.exports = view;

},{}],7:[function(require,module,exports){

var model = require("../src/models/equation");
var view = require("../src/views/view");
var table = require("../src/views/table");

var actions = require("../src/actions/actions")({speed: 400});

var config =  {
    time: {
        start: 0,
        end: 1000,
        step: 10
    },
    quantities: {
        x: {
            minimum: 0,
            maximum: 100,
            value: 0,
            label: "x",
            stepsize: 1,
            monotonicity: true
            },
        y: {
            minimum: 0,
            maximum: 1000000,
            value: 0,
            unit: "km",
            label: "y",
            stepsize: 1,
            monotonicity: true
            }
    },
    equation: function(x) {
        return x*x*x;
    },
    actions: {
        start: actions.start,
        pause: actions.pause,
        reset: actions.reset,
        finish: actions.finish
    }
}, para = model('longdrinkglas', config);

// console.log(para.get_minimum());
// console.log(para.get_minimum("x"));
// console.log(para.get_maximum());
// console.log(para.get_maximum("x"));
// 
// console.log(para.get("_time_"));
// console.log(para.set("x", 50));
// console.log(para.get("_time_"));
para.set("x", 5);
// console.log(para.get("_time_"));
// 
// console.log(para.current_moment());

var repr = table(config);
var body = document.querySelector("body");
body.appendChild(repr.fragment);
repr.register(para);

para.step();
para.step();
para.step();
para.set("y", 30);

var timer, 
    step = function() {
        if (!para.is_finished()) {
            para.step();
        } else {
            timer = null;
        }
    };

//timer = setInterval(step, 500);

},{"../src/actions/actions":1,"../src/models/equation":3,"../src/views/table":5,"../src/views/view":6}]},{},[7])
;