var model = require("./model");
var motion_grapher = require("../motion_grapher");
var MG = motion_grapher;

var motion = function(name, config) {

    var a;

    var _model = {};

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
            label: "afgelegde afstand in " + (config.distance_unit || "m"),
            unit: config.distance_unit || "m",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: config.duration || 10,
            value: 0,
            label: "tijd in " + (config.time_unit || "sec"),
            unit: config.time_unit || "sec",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        }
    };

    quantities.snelheid = {
            name: "snelheid",
            minimum: 0,
            maximum: 0,
            value: config.starting_speed || 0,
            label: "snelheid in " + quantities.afgelegde_afstand.unit + "/" + quantities.tijd.unit,
            unit: quantities.afgelegde_afstand.unit + "/" + quantities.tijd.unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
        };
    quantities.versnelling = {
            name: "versnelling",
            minimum: 0,
            maximum: 0,
            value: 0,
            label: "versnelling in " + quantities.snelheid.unit + "/" + quantities.tijd.unit,
            unit: quantities.snelheid.unit + "/" + quantities.tijd.unit,
            stepsize: 0.01,
            precision: 2,
            monotone: false
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
            return function() {
                config.editor.show_model(_model);
            };
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

            if (unit.per) {
            } else {
                if (MG.is_time_unit(unit.unit)) {
                    value = MG.time_to_seconds(value, unit.unit);
                }
            }

            return value;
        } else {
            return null;
        }
    }


    function compute_quantities() {
        var values = [];
        var directions = compute_route(config.specification);

        var current_direction = directions[0],
            previous_direction;

        var time = ts_to_ms(current_direction.timestamp),
            distance = q_to_ms_value(current_direction.quantities.distance) || 0,
            speed = q_to_ms_value(current_direction.quantities.speed) || 0,
            acceleration = q_to_ms_value(current_direction.quantities.acceleration) || 0;

        values.push({
            tijd: time,
            afgelegde_afstand: distance,
            snelheid: speed,
            versnelling: acceleration
        });

        var duration = 0;

        for (var i = 1; i < directions.length; i++) {
            // process timestamp
            current_direction = directions[i];
            previous_direction = directions[i-1];
            
            duration = ts_to_ms(current_direction.timestamp) - 
                ts_to_ms(previous_direction.timestamp);
            acceleration = q_to_ms_value(previous_direction.quantities.acceleration) || acceleration;
            speed = q_to_ms_value(previous_direction.quantities.speed) || speed;
            distance = q_to_ms_value(previous_direction.quantities.distance) || distance;


            while (duration > 0) {
                time += step;
                speed += step*acceleration;
                distance += step*speed;
                values.push({
                    tijd: time,
                    afgelegde_afstand: distance,
                    snelheid: speed,
                    versnelling: acceleration
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

    function specification(new_spec) {
        if (arguments.length === 1) {
            config.specification = new_spec;
            _model.reset_model();
            compute_maxima();
            _model.update_all_views();
        }
        return config.specification;
    }
    _model.specification = specification;

    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "motion";

    return _model;
};

module.exports = motion;
