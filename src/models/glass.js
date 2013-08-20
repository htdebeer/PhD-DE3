

var model = require("./model.js");
var raphael = require("raphael-browserify");

var glass = function(name, config) {
    var 
        flow_rate = config.flow_rate || 50,
        shape = config.shape,
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
        base: shape.base,
        bowl: shape.bowl,
        scale: shape.scale
    };

    _model.path = function(SCALE, fill, x_, y_) {
        var bowl = _model.bowl_path(SCALE, fill, x_, y_),
            base = _model.base_path(SCALE, fill, x_, y_),
            whole_glass = base + bowl;
        return whole_glass;
    };

    _model.base_path = function(SCALE, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scale_paths(SCALE);
        }
        var x = x_ || 0,
            y = y_ || 0,
            path = "M" + x + "," + y + complete_path(scaled_shape.base) + "z";
        
        return path;
    };

    _model.bowl_path = function(SCALE, fill, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scale_paths(SCALE);
        }
        var x = x_ || 0,
            y = y_ || 0,
            path = "M" + x + "," + y + complete_path(scaled_shape.bowl);

        return path;
    };

    function start_of_path(path) {
        return raphael.getPointAtLength(path, 0);
    }

    function end_of_path(path) {
        return raphael.getPointAtLength(path,
                raphael.getTotalLength());
    }

    function complete_path(part) {
        var start = part.top,
            end = part.bottom,
            path = part.path,
            segments = raphael.parsePathString(path),
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

    function mirror_path(path) {
        var curve_path = raphael.path2curve(path);


        // First path segment is mx,y. get those x and y
        var first = curve_path.shift();
        var x = first[1],
            y = first[2];

        // Now, for all other path segments, which are C commands of the form
        // C cp1x, cp2x, cp2x, cp2y, x, y, mirror the coordinates in 0
        //
        var mirror_segment = function(segment) {
            var cp1x = segment[1],
                cp1y = segment[2],
                cp2x = segment[3],
                cp2y = segment[4],
                mirrored_segment = "C" + [cp2x, cp2y, cp1x, cp1y, -x, y].join(",");

            x = segment[5];
            y = segment[6];

            return mirrored_segment;
        };

        return curve_path.map(mirror_segment).reverse().join("");

    }

    function scale_paths(scale) {
        scaled_paths = {
            base: {},
            bowl: {},
            scale: 1
        };
        scaled_paths.base.path = scale_path(shape.base.path, scale);
        scaled_paths.bowl.path = scale_path(shape.bowl.path, scale);
        scaled_paths.scale = scale;

        function scale_path(path, scale) {
            return path;
        }
    }

    _model.step();

    return _model;
};

module.exports = glass;

