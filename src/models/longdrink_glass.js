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
            value: 0,
            unit: 'ml',
            name: "volume",
            label: "volume in ml",
            stepsize: 0.1,
            monotone: true,
            precision: 0
        },
        tijd: {
            minimum: 0,
            value: 0,
            unit: 'sec',
            name: "tijd",
            label: "tijd",
            stepsize: 0.01,
            monotone: true,
            precision: 1
        }
    };

    var time_max, volume_max, height_max;
    function compute_maxima() {
        time_max = Math.floor(area*height*10 / flow_rate)/10;
        volume_max = time_max * flow_rate;
        height_max = volume_max / area;

        quantities.tijd.maximum = time_max.toFixed(quantities.tijd.precision);
        quantities.hoogte.maximum = height_max.toFixed(quantities.hoogte.precision);
        quantities.volume.maximum = volume_max.toFixed(quantities.volume.precision);
    }

    compute_maxima();

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

    _model.path = function(SCALE, fill) {
        var h = height * SCALE * 10,
            y = 0;
        if (fill) {
            h = _model.get("hoogte") * SCALE * 10;
            y = height * SCALE * 10 - h;
        }
        var path = "M0," + y;
        path += "v" + h;
        path += "h" + radius * 2 * SCALE * 10;
        path += "v-" + h;
        return path;
    };

    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "longdrink";
    _model.height = function(h) {
        if (arguments.length === 1) {
            height = h;
            _model.update_views();
        }
        return height;
    };
    _model.radius = function(r) {
        if (arguments.length === 1) {
            radius = r;
            _model.update_views();
        }
        return radius;
    };
    _model.flow_rate = function(fr) {
        if (arguments.length === 1) {
            flow_rate = fr;
            _model.update_views();
        }
        return flow_rate;
    };

    return _model;
};

module.exports = longdrink_glass;