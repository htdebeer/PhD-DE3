

var model = require("./model.js");
var raphael = require("raphael-browserify");
var paths = require("../svg/path");

var glass = function(name, config) {
    var 
        flow_rate = config.flow_rate || 50,
        shape = config.shape;

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
            precision: 1
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
            precision: 2
        }
    };


    var step = config.step || 10,
        time = {
            start: 0,
            end: quantities.tijd.maximum*1000,
            step: step
        },        
        action_list = config.actions || ["start", "pause", "reset", "finish","toggle_line", "toggle_tailpoints", "step_size"],
        default_actions = require("../actions/actions")({speed: step});

    function create_actions(action_list) {
        var actions = {},
            create_action = function(action_name) {
                actions[action_name] = default_actions[action_name];
            };
        action_list.forEach(create_action);
        return actions;
    }
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
            path;

        if (fill) {
            var current_moment = _model.current_moment(true),
                fill_length = values[current_moment].length * scaled_shape.factor;
    
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl,
                    fill_length );

        } else {
            path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl);
        }


        return path;
    };


    function compute_quantities() {

        var scale = scaled_shape.scale,
            bowl = scaled_shape.bowl,
            base = scaled_shape.base,
            path = "M"+ bowl.top.x + "," + bowl.top.y + bowl.path;

        var ms_step = step / 1000;

        var h_start = px_to_cm(base.bottom.y - base.top.y),
            l_start = 0,
            l_end = raphael.getTotalLength(path);

        function px_to_cm(px) {
            return px / scale / 10;
        }

        function point(length) {
            return raphael.getPointAtLength(path, length);
        }

        function ml_to_ms(ml) {
            return ml / flow_rate;
        }


        var h = h_start,
            r,
            area,
            vol = 0,
            time = 0;

        var l = l_end-1,
            prev = point(l),
            cur = prev,
            delta_time = 0,
            delta_vol = 0,
            delta_h = 0;

        var values = [{
                tijd: time,
                hoogte: h,
                volume: vol,
                length: l
            }];

        while (l > l_start) {
            l--;
            prev = cur;
            cur = point(l);
            r = px_to_cm((cur.x+prev.x)/2);
            area = Math.PI * r * r;

            delta_h = px_to_cm(Math.abs(prev.y - cur.y));
            delta_vol = area * delta_h;
            delta_time += ml_to_ms(delta_vol);


            h += delta_h;
            vol += delta_vol;

            if (delta_time >= ms_step ) {
                time += delta_time;
                delta_time = 0;
                values.push({
                    tijd: time,
                    hoogte: h,
                    volume: vol,
                    length: l
                });
            }
        }

        return values;
    }



    var values = []; 

    function compute_maxima() {
        // Has to be computed before the model can be used. Probably time
        // intensive.
        //

        values = compute_quantities();

        var max = values[values.length - 1],
            min = values[0],
            max_tijd_in_ms = (values.length - 1) * step;

        _model.set_end(max_tijd_in_ms / 1000);
        _model.quantities._time_.maximum = max_tijd_in_ms;

        _model.quantities.tijd.maximum = max.tijd.toFixed(quantities.tijd.precision);
        _model.quantities.hoogte.maximum = max.hoogte.toFixed(quantities.hoogte.precision);
        _model.quantities.hoogte.minimum = 0;//min.hoogte.toFixed(quantities.hoogte.precision);
        _model.quantities.volume.maximum = max.volume.toFixed(quantities.volume.precision);
    }

    compute_maxima();


    _model.measure_moment = function(moment) {
        return values[moment];
    };


    _model.step();
    return _model;
};

module.exports = glass;

