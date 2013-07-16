;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
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

var model = function(config) {
    "use strict";

    var appendix = {};


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

    var time_to_moment = function(time) {
        return Math.floor(time / T_STEP); 
    }, t2m = time_to_moment;

    var moment_to_time = function(moment) {
        return moment * T_STEP;
    },  m2t = moment_to_time;

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

    var measure_moment = function(moment) {
        // to be implemented in an object implementing model
        var x = moment,
            y = x * x;
        return {
            x: x,
            y: y
        };
    };


    // The model has the following data invariant:
    //
    //   (∀m: 0 ≤ m ≤ `last_measured_moment`: `moment_computed`(`moments`[m]))
    //
    // stating that the phenomenon has been described quantitatively for all
    // moments up till and including the `last_measured_moment`. These
    // "measurements" are stored in a list of `moments` and can be accessed
    // through a moment's order number.

    var moments = [],
        last_measured_moment = -1;

    // A moment can only be inspected if it already has been "measured".
    // Following the data invariant, a moment has been measured when its order
    // number is smaller or equal to the `last_measured_moment`
    
    var moment_measured = function(moment) {
        return (moment <= last_measured_moment);
    };

    // Furthermore, the current moment of interest, or `now`, points to an
    // already "measured" moment during the phenomenon's duration. Hence, the
    // data invariant is extended as follows:
    //
    //   `t2m`(`T_START`) ≤ `now` ≤ `t2m`(`T_END`) → `moment_computed`(`now`)

    var now;

    // To ensure this data invariant, `now` is set to a moment before the
    // phenomenon started. As a model can be inspected repeatedly, as is one
    // of the reasons to model a phenomenon using a computer, we introduce a
    // `reset` function to resets `now` to a moment before the phenomenon
    // started.

    var reset = function() {
        now = t2m(T_START) - 1;
    };
    reset();


    // ## Inspecting and running a model

    // Once a model has been started, the current moment will be measured as
    // well as all moments before since the start. These moments can be
    // inspected.
    //
    var has_started = function() {
        return now >= 0;
    };

    // The `step` function will advance `now` to the next moment if the end of
    // the phenomenon has not been reached yet. If that moment has not been
    // "measured" earlier, "measure" it now.

    var step = function() {
        if (m2t(now) + T_STEP <= T_END) {
            now++;
            if (!moment_measured(now)) {
                var moment = measure_moment(now);
                moment._time_ = m2t(now);
                moments.push(moment);
                last_measured_moment++;
            }
        }
        return now;
    };

    // If the phenomenon is a finite process or the "measuring" process cannot
    // go further `T_END` will have a value that is not `Infinity`.

    var can_finish = function() {
        return Math.abs(T_END) !== Infinity;
    };

    // To inspect the whole phenomenon at once or inspect the last moment,
    // `finish`ing the model will ensure that all moments during the
    // phenomenon have been "measured".

    var finish = function() {
        if (can_finish()) {
            while (last_measured_moment < t2m(T_END)) {
                step();
            }
        }
        return now;
    };

    // We call the model finished if the current moment, or `now`, is the
    // phenomenon's last moment.

    var is_finished = function() {
        return can_finish() && m2t(now) >= T_END;
    };

           
    // ## Coordinating quantities
    //
    // All quantities that describe the phenomenon being modeled change in
    // coordination with time's change. Add the model's time as a quantity to
    // the list with quantities. To allow people to model time as part of
    // their model, for example to describe the phenomenon accelerated, the
    // internal time is added as quantity `_time_` and, as a result, "_time_"
    // is not allowed as a quantity name.

    var quantities = config.quantities || {};
    quantities._time_ = {
        minimum: T_START,
        maximum: T_END,
        value: m2t(now),
        stepsize: T_STEP,
        unit: "ms",
        label: "internal time",
        monotonicity: true
    };

    var get_minimum = function(quantity) {
        if (arguments.length===0) {
            // called without any arguments: return all minima
            var minima = {},
                add_minimum = function(quantity) {
                    minima[quantity] = quantities[quantity].minimum;
                };

            Object.keys(quantities).forEach(add_minimum);
            return minima;
        } else {
            // return quantity's minimum
            return quantities[quantity].minimum;
        }
    };
                    
    var get_maximum = function(quantity) {
        if (arguments.length===0) {
            // called without any arguments: return all minima
            var maxima = {},
                add_maximum = function(quantity) {
                    maxima[quantity] = quantities[quantity].maximum;
                };

            Object.keys(quantities).forEach(add_maximum);
            return maxima;
        } else {
            // return quantity's minimum
            return quantities[quantity].maximum;
        }
    };


    var find_moment = function(quantity, value, EPSILON) {
        if (last_measured_moment < 0) {
            // no moment are measured yet, so there is nothing to be found

            return -1;
        } else {
            var val = appendix.quantity_value(quantity);

            // pre: quantity is monotone
            // determine if it is increasing or decreasing
            // determine type of monotonicity
            //
            // As the first moment has been measured and we do know the
            // minimum of this quantity, type of monotonicity follows.

            var start = val(0),
                increasing = (start === get_minimum(quantity));

            // Use a binary search to find the moment that approaches the
            // value best


            var bmin = 0, 
                bmid, 
                bmax = last_measured_moment,
                approx = appendix.approximates(EPSILON);
            if (increasing) {
                // (∀m: 0≤ m < `last_measured_moment`: `val`(m) <= `val`(m+1))
                while (val(bmax) > val(bmin)) {
                    bmid = Math.floor((bmax - bmin)/2);
                    console.log(val(bmid));
                    if (approx(val(bmid), value)) {
                        return bmid;
                    } else if (val(bmid) < value) {
                        bmin = bmid - 1;
                    } else if (value < val(bmid)) {
                        bmax = bmid + 1;
                    }
                }
                return bmid;
            } else {
                // decreasing
                // (∀m: 0≤ m < `last_measured_moment`: `val`(m) >= `val`(m+1))
                while (bmax >= bmin) {
                    bmid = Math.round((bmin - bmax)/2);
                    if (approx(val(bmid), value)) {
                        return bmid;
                    } else if (value > val(bmid)) {
                        bmax = bmid - 1;
                    } else if (val(bmid) > value) {
                        bmin = bmid + 1;
                    }
                }
            }
        }
    };

    var get = function(quantity) {
        return quantities[quantity].value;
    };
    
    var set = function(quantity, value) {
        var q = quantities[quantity];
        console.log("0");

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
        
        var approx = appendix.approximates(),
            moments_with_value = [];
        if (q.monotonicity) {
        console.log("1");
            var moment = find_moment(quantity, value);
        console.log("2");
            if (moment !== -1) {
                moments_with_value.push(moment);
            }
        } else {
        console.log("3");
            var has_value = function(element, index, array) {
                    return approx(element[quantity],value);
                };
            moments_with_value = moments.filter(has_value);
        }

        console.log("4");
        if (moments_with_value.length === 0) {
            // not yet "measured"
        console.log("5");
            step();
        console.log("6");
            while(!approx(moments[now][quantity], value) && !is_finished()) {
                step();
        console.log("7");
            }
        } else {
        console.log("8");
            now = moments_with_value[0];
        }
        console.log("9");
        return moments[now];
    };

    // ## Appendix H: helper functions

    appendix.approximates = function(epsilon) {
            var EPSILON = epsilon || 0.001,
                fn = function(a, b) {
                    return Math.abs(a - b) <= EPSILON;
                };
            fn.EPSILON = EPSILON;
            return fn;
        };
    appendix.quantity_value = function(quantity) {
            return function(moment) {
                return moments[moment][quantity];
            };
        };


    return {
        quantities: quantities,
        set: set,
        get: get,
        get_minimum: get_minimum,
        get_maximum: get_maximum
    };
};    


module.exports = model;

})()
},{}],2:[function(require,module,exports){

var model = require("../src/models/model");

var para = model({
    time: {
        start: 0,
        end: 1000,
        step: 10
    }, quantities: {
        x: {
            minimum: 0,
            maximum: 100,
            value: 0,
            unit: "none",
            label: "x",
            stepsize: 1,
            monotonicity: true
            },
        y: {
            minimum: 0,
            maximum: 10000,
            value: 0,
            unit: "none",
            label: "y",
            stepsize: 1
            }
    },
    equation: function(x) {
        return x*x;
    }
});

console.log(para.get_minimum());
console.log(para.get_minimum("x"));
console.log(para.get_maximum());
console.log(para.get_maximum("x"));

console.log(para.set("x", 50));
console.log(para.set("x", 5));



},{"../src/models/model":1}]},{},[2])
;