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

var model = function(config) {
    "use strict";

    // ## Data invariant and initialization
    //
    // This model describes a dynamic phenomenon in terms of changing
    // quantities over time. This description starts at `T_START` milliseconds
    // (ms), defaulting to 0 ms and ends at `T_END` ms. If no end is specified
    // it is assumed that the phenomenon does not end or is still ongoing in
    // the real world (RW). The phenomenon's change is tracked by "measuring"
    // the changing quantities at consecutive moments in time. These moments
    // are `T_STEP` apart, defaulting to 1 ms, and are tracked by order
    // number.

    var T_START = config.time.start || 0,
        T_END = config.time.end || Math.Infinity,
        T_STEP = config.time.step || 1;

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

    // To 

    var step = function() {
        // Go to the next moment of this dynamic phenomenon if there is such a
        // moment
        if (m2t(now) + T_STEP <= T_END) {
            now++;
            if (!moment_computed(now)) {
                compute_moment(now);
            };
        };
        return now;
    };

    var can_finish = function() {
        // When no end of the dynamic phenomenon has been specified, it is
        // assumed to be still ongoing and cannot be finished.
        return Math.abs(T_END) !== Infinity;
    };

    var finish = function() {
        // Go to the end of the dynamic phenomenon. If that moment has not yet
        // been computed, computed all moments. 
        if (can_finish()) {
            while (last_computed_moment < t2m(T_END)) {
                step();
            };
        };
        return now;
    };

    var is_finished = function() {
        return can_finish() && m2t(now) >= T_END;
    }

           


    var quantities = config.quantities || {};
    
    var set = function(quantity, value) {
        // sets the quantity in this model to value
        quantities[quantity].value = value;
    };

    var get = function(quantity) {
        return quantities[quantity].value;
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
        };
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
