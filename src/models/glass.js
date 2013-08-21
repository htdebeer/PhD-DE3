

var model = require("./model.js");
var raphael = require("raphael-browserify");
var paths = require("../svg/path");

var glass = function(name, config) {
    var 
        flow_rate = config.flow_rate || 50,
        shape = config.shape,
        action_list = config.actions || ["start", "pause", "reset", "finish", "remove"],
        default_actions = require("../actions/actions")({speed: flow_rate});


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

    var scaled_shape = paths.scale_shape(shape, shape.scale);

    _model.path = function(SCALE, fill, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scaled_shape = scale_shape(shape, SCALE);
        }
        var bowl = _model.bowl_path(SCALE, fill, x_, y_),
            base = _model.base_path(SCALE, fill, x_, y_),
            whole_glass = base + bowl;
        return whole_glass;
    };

    _model.base_path = function(SCALE, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scaled_shape = scale_shape(shape, SCALE);
        }
        var x = x_ || 0,
            y = y_ || 0,
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.base) + "z";
        
        return path;
    };

    _model.bowl_path = function(SCALE, fill, x_, y_) {
        if (scaled_shape.scale !== SCALE) {
            scaled_shape = paths.scale_shape(shape, SCALE);
        }
        var x = x_ || 0,
            y = y_ || 0,
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl);

        return path;
    };



    var heights = [];
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
    function compute_height(moment) {

        var scale = scaled_shape.scale,
            px_to_cm = function(px) {
                return (px/scale)/10;
            },
            ONE_PX_IN_CM = px_to_cm(1),
            area = function(r) {
                return Math.PI * r * r;
            },
            base = scaled_shape.base,
            bowl = scaled_shape.bowl,
            path = "M"+ bowl.top.x + "," + bowl.top.y + bowl.path,
            h_start = px_to_cm(base.bottom.y - base.top.y),
            h_end = h_start + px_to_cm(bowl.bottom.y - bowl.top.y),
            h = h_start;

        var pixel_disc = function(length) {
            var point = function(length) {
                return raphael.getPointAtLength(path, length);
            };

            var current_point = point(length);

            while (length > 0 && point(length).y === current_point.y) {
                length--;
            }
            
            var next_point = point(length);

            var current_r = px_to_cm(current_point.x),
                next_r = px_to_cm(next_point.x),
                avg_r = (current_r + next_r) / 2,
                area = Math.PI * avg_r * avg_r,
                volume = area * ONE_PX_IN_CM;

            return {
                volume: volume,
                length: length
            };
        };

        var next_delta_volume = function(moment) {
            var time = _model.moment_to_time(moment) / 1000,
                next = _model.moment_to_time(moment + 1) / 1000,
                current_vol = compute_volume(time),
                next_vol = compute_volume(next);

            return next_vol - current_vol;
        };

        var length_start = raphael.getTotalLength(path),
            length_end = 0;

        var last_computed_moment = heights.length - 1;
        if (moment > last_computed_moment) {
            if (moment === 0) {
                heights.push( {
                    height: h_start,
                    length: length_start
                });
            } else {
                // compute heighs of every moment up till time

                var height = heights[last_computed_moment].height,
                    length = heights[last_computed_moment].length;

                while (last_computed_moment < moment) {
                    var delta_vol = next_delta_volume(last_computed_moment);
                    var px_disc = pixel_disc(length);

                    while (px_disc.volume < delta_vol) {
                        delta_vol -= px_disc.volume;
                        px_disc = pixel_disc(length);
                        length = px_disc.length;
                        height += ONE_PX_IN_CM;
                    }

                    height += ONE_PX_IN_CM * (delta_vol/px_disc.volume);

                    last_computed_moment++;

                    heights.push( {
                        height: height,
                        length: length
                    });

                }
            }
        }
        return heights[moment].height;
    }


    function compute_maxima() {
        // Has to be computed before the model can be used. Probably time
        // intensive.

        var 
            scale = scaled_shape.scale,
            px_to_cm = function(px) {
                return (px/scale)/10;
            }

        ;

        var base = scaled_shape.base,
            bowl = scaled_shape.bowl,
            path = bowl.path,
            h_start = px_to_cm(base.bottom.y - base.top.y),
            h_end = h_start + px_to_cm(bowl.bottom.y - bowl.top.y),
            h = h_start;

        var moment = 0;

        while (h < h_end) {
            h = compute_height(moment);
            moment++;
        }

        var time_in_ms = _model.moment_to_time(moment),
            time_max = time_in_ms/1000,
            height_max = h,
            volume_max = compute_volume(time_max);


        _model.set_end(time_max);
        _model.quantities._time_.maximum = time_in_ms;

        _model.quantities.tijd.maximum = time_max.toFixed(quantities.tijd.precision);
        _model.quantities.hoogte.maximum = height_max.toFixed(quantities.hoogte.precision);
        _model.quantities.volume.maximum = volume_max.toFixed(quantities.volume.precision);
    }

    compute_maxima();


    _model.measure_moment = function(moment) {
        if (moment === 0) {
            return {
                tijd: 0,
                hoogte: 0,
                volume: 0
            };
        } else {
            var time = _model.moment_to_time(moment) / 1000,
                volume = compute_volume(time),
                height = compute_height(moment);

            return {
                tijd: time,
                volume: volume,
                hoogte: height
            };
        }
    };


    _model.step();
    return _model;
};

module.exports = glass;

