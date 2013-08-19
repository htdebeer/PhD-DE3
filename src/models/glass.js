

var model = require("./model.js");

var glass = function(name, config) {
    var 
        flow_rate = config.flow_rate || 50,
        shape = config.shape || {
            base_path: "",
            bowl_path: "",
            scale: 1
        },
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
            precision: 0
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
            precision: 1
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

    function compute_maxima() {
        // Has to be computed before the model can be used. Probably time
        // intensive.


        var area, time_max, volume_max, height_max,
            CM_SCALE = shape.scale / 10;

        time_max = 100;
        height_max = 4;
        volume_max = 50;

        _model.set_end(time_max);

        _model.quantities.tijd.maximum = time_max.toFixed(quantities.tijd.precision);
        _model.quantities.hoogte.maximum = height_max.toFixed(quantities.hoogte.precision);
        _model.quantities.volume.maximum = volume_max.toFixed(quantities.volume.precision);
    }

    compute_maxima();


    _model.measure_moment = function(moment) {
        return {
            time: 23,
                height: 3,
                volume: 23
        };
        return _model.get_moment(moment);
    };

    var scaled_shape = {
        base_path: shape.base_path,
        bowl_path: shape.bowl_path,
        scale: shape.scale
    };

    _model.path = function(SCALE, fill, x_, y_) {
        var x = x_ || 0,
            y = y_ || 0;
        if (fill) {
            h = _model.get("hoogte") * SCALE * 10;
            y += height * SCALE * 10 - h;
        }

        var path = "M" + x + "," + y;
        path += shape.bowl_path;
        return path;
    };

    _model.base_path = function(SCALE, x_, y_) {
        return shape.base_path;
    };

    _model.bowl_path = function(SCALE, fill, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scale_paths(SCALE);
        }
        return scaled_shape.bowl_path;
    };

    function scale_paths(scale) {
        scaled_paths = {
            base_path: scale_path(shape.base_path, scale),
            bowl_path: scale_path(shape.bowl_path, scale),
            scale: scale
        };

        function scale_path(path, scale) {
            return path;
        }
    }

    _model.step();

    return _model;
};

module.exports = glass;

