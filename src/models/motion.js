var model = require("./model");
var mg_util = require("../motion/util");

var motion = function(name, config) {

    var a;

    var _model = {};

    var spec = config.specification;
    var distance_unit = mg_util.parse_unit(config.distance_unit || "m"),
        time_unit = mg_util.parse_unit(config.time_unit || "sec"),
        speed_unit = mg_util.parse_unit(config.speed_unit || distance_unit + "/" + time_unit),
        acceleration_unit = mg_util.parse_unit(config.acceleration_unit || speed_unit + "/" + time_unit);


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
            label: "afgelegde afstand in " + distance_unit,
            unit: distance_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: config.duration || 10,
            value: 0,
            label: "tijd in " + time_unit,
            unit: time_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        snelheid : {
            name: "snelheid",
            minimum: 0,
            maximum: 0,
            value: config.starting_speed || 0,
            label: "snelheid in " + speed_unit,
            unit: speed_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
        },
        versnelling: {
            name: "versnelling",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "versnelling in " + acceleration_unit,
            unit: acceleration_unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
        }
    };


    var step = config.step || 10,
        time = {
            start: 0,
            end: quantities.tijd.maximum*1000,
            step: step
        },
        action_list = config.actions || ["start", "pause", "reset", "finish", "edit", "toggle_line", "toggle_tailpoints", "toggle_arrows", "step_size"],
        default_actions = require("../actions/actions")({speed: step});

    var edit_action = {
        name: "edit",
        group: "edit_model",
        icon: "icon-wrench",
        tooltip: "Edit motion model",
        enabled: true,
        callback: function() {
                return config.editor.show_model(_model);
            }
    };
    
    default_actions.edit = edit_action;
    
    _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });

    function compute_route(spec) {


        function parse_direction(dir) {
            var parts = dir.split(/\t+/),
                timestamp = parse_timestamp(parts[0].trim()),
                quantities = parts[1].trim().split(";").map(parse_quantity);

            if (quantities.length === 1 && quantities[0].action) {
                return {
                    timestamp: timestamp,
                    action: quantities[0].action
                };
            } else {

                var assoc = {};
                quantities.forEach(function(q) {
                    assoc[q.quantity] = {
                        value: q.value,
                        unit: q.unit
                    };
                });
                return {
                    timestamp: timestamp,
                    quantities: assoc
                };
            }
        }

        function parse_timestamp(ts) {
            var parts = ts.split(":"),
                hours = parseInt(parts[0], 10),
                minutes = parseInt(parts[1], 10),
                seconds_parts = parts[2].split("."),
                seconds = parseInt(seconds_parts[0], 10),
                milliseconds = parseInt(seconds_parts[1], 10);

            return {
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                milliseconds: milliseconds
            };
        }

        function parse_quantity(q) {
            var parts = q.split("=");

            if (parts.length === 1) {
                return {
                    action: parts
                };
            } else {
                var quantity = parts[0].trim(),
                    value_unit = parts[1].trim().split(" "),
                    value = parseFloat(value_unit[0]),
                    unit = parse_unit(value_unit[1]);

                return {
                    quantity: quantity_to_en(quantity),
                    value: value,
                    unit: unit
                };
            }
        }

        function quantity_to_en(q) {
            var translated = {
                afgelegde_afstand: "distance",
                afstand: "distance",
                distance: "distance",
                snelheid: "speed",
                versnelling: "acceleration",
                speed: "speed",
                acceleration: "acceleration"
            };

            return translated[q] || "unknown";
        }

        function parse_unit(u) {
            var parts = u.split("/");

            function create_unit(last, rest) {
                if (rest.length === 0) {
                    return {
                        unit: last
                    };
                } else if (rest.length === 1) {
                    return {
                        unit: rest[0],
                        per: last
                    };
                } else {
                    return {
                        unit: create_unit(rest.pop(), rest),
                        per: last
                    };
                }
            }

            return create_unit(parts.pop(), parts);
        }


        return spec.split("\n").map(parse_direction);

    }

    function ts_to_ms(ts) {
        return (ts.hours*3600 + ts.minutes*60 + ts.seconds) * 1000 + ts.milliseconds;
    }

    function q_to_ms_value(q) {
        if (q && q.value) {
            var unit = q.unit,
                value = q.value;

            return value;
        } else {
            return null;
        }
    }

    function it_to_mt(it) {
        return it / 1000;
    }

    function mt_to_it(mt) {
        return mt * 1000;
    }

    function ms_to_mt(ms) {
        return mg_util.convert_time(ms, "ms", time_unit.unit);
    }

    function convert_speed_to_distance(speed, from_unit) {
        mg_util.convert_distance(speed, from_unit.unit, distance_unit.unit);
    }

    function step_speed(speed) {
        var value = speed.value,
            unit = speed.unit;

        var to_time = mg_util.convert_time(value, time_unit.unit, unit.per);
        var to_distance = mg_util.convert_distance(to_time, distance_unit.unit, unit.unit);

        return to_distance;
    }

    function step_speed_to_speed(speed, current_speed_unit) {
        var to_time = mg_util.convert_distance(speed, current_speed_unit.unit.unit, distance_unit.unit);
        var to_speed = mg_util.convert_time(to_time, current_speed_unit.unit.per, time_unit.unit);

        return to_speed;
    }

    function step_acceleration(acceleration) {
        var value = acceleration.value,
            unit = acceleration.unit;

        var to_time = mg_util.convert_time(value, time_unit.unit, unit.per);
        var to_speed = mg_util.convert_time(to_time, time_unit.unit, unit.unit.per);
        var to_distance = mg_util.convert_distance(to_speed, distance_unit.unit, unit.unit.unit);

        return to_distance;
    }

    function step_accel_to_accel(accel, current_accel_unit) {
        var unit = current_accel_unit;

        var to_time = mg_util.convert_distance(accel, unit.unit.unit, distance_unit.unit);
        var to_speed = mg_util.convert_time(to_time, unit.unit.per, time_unit.unit);
        var to_accel = mg_util.convert_time(to_speed, unit.per, time_unit.unit);

        return to_accel;
    }


    function compute_quantities() {
        var values = [];
        var directions = compute_route(spec);

        var current_direction = directions[0],
            previous_direction;

        var time, distance, speed, acceleration;


        var mt_step = it_to_mt(step);
        
        time = ms_to_mt(ts_to_ms(current_direction.timestamp));

        distance = q_to_ms_value(current_direction.quantities.distance) || 0;

        var cur_speed_unit;
        if (current_direction.quantities.speed) {
            speed = step_speed(current_direction.quantities.speed);
            cur_speed_unit = current_direction.quantities.speed;
        } else {
            speed = 0;
            cur_speed_unit = speed_unit;
        }

        var cur_accel_unit;
        if (current_direction.quantities.acceleration) {
            acceleration = step_acceleration(current_direction.quantities.acceleration);
            cur_accel_unit = current_direction.quantities.acceleration.unit;
        } else {
            acceleration = 0;
            cur_accel_unit = acceleration_unit;
        }

        values.push({
            tijd: time,
            afgelegde_afstand: distance,
            snelheid: step_speed_to_speed(speed, cur_speed_unit),
            versnelling: step_accel_to_accel(acceleration, cur_accel_unit)
        });


        var duration = 0;

        for (var i = 1; i < directions.length; i++) {
            // process timestamp
            current_direction = directions[i];
            previous_direction = directions[i-1];
            
            duration = mt_to_it(ms_to_mt(ts_to_ms(current_direction.timestamp)) - 
                ms_to_mt(ts_to_ms(previous_direction.timestamp)));

            if (previous_direction.quantities.acceleration) {
                acceleration = step_acceleration(previous_direction.quantities.acceleration);
                cur_accel_unit = previous_direction.quantities.acceleration.unit;
            } else {
                acceleration = 0;
            }

            if (previous_direction.quantities.speed) {
                speed = step_speed(previous_direction.quantities.speed);
                cur_speed_unit = previous_direction.quantities.speed;
            }
            distance = q_to_ms_value(previous_direction.quantities.distance) || distance;


            while (duration > 0) {
                time += mt_step;
                speed += mt_step*acceleration;
                distance += mt_step*speed;
                values.push({
                    tijd: time,
                    afgelegde_afstand: distance,
                    snelheid: step_speed_to_speed(speed, cur_speed_unit),
                    versnelling: step_accel_to_accel(acceleration, cur_accel_unit)
                });
                duration -= step;
            }
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
        var value = values[moment],
            tijd = value.tijd,
            afgelegde_afstand = value.afgelegde_afstand,
            snelheid = value.snelheid,
            versnelling = value.versnelling;

        return {
            tijd: tijd,
            afgelegde_afstand: afgelegde_afstand,
            snelheid: snelheid,
            versnelling: versnelling
        };
    };

    _model.specification = function(new_spec) {
        if (arguments.length === 1) {
            spec = new_spec;
            _model.reset_model();
            compute_maxima();
            _model.update_all_views();
        }
        return spec;
    };

    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "motion";

    return _model;
};

module.exports = motion;
