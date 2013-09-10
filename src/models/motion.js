var model = require("./model");

var motion = function(name, config) {

    var a;

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
        action_list = config.actions || ["start", "pause", "reset", "finish","toggle_line", "toggle_tailpoints", "toggle_arrows", "step_size"],
        default_actions = require("../actions/actions")({speed: step});
    
    var _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });

    function compute_quantities() {
        var values = [];

        for (var i = 0; i < 100; i++) {
        values.push({
            tijd: i,
            afgelegde_afstand: i,
            snelheid: i,
            versnelling: i
        });
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
        var tijd = 0,
            afgelegde_afstand = 0,
            snelheid = 0,
            versnelling = 0;

        return {
            tijd: tijd,
            afgelegde_afstand: afgelegde_afstand,
            snelheid: snelheid,
            versnelling: versnelling
        };
    };

    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "motion";

    return _model;
};

module.exports = motion;
