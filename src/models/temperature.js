
var model = require("./model");
var t_util = require("../temperature/util");

var temperature = function(name, config) {

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
        tijd: {
            name: "tijd",
            minimum: 0,
            maximum: 100,
            value: 0,
            label: "tijd in sec",
            unit: "sec",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        temperatuur: {
            name: "temperatuur",
            minimum: -20,
            maximum: 100,
            value: 0,
            label: "temperatuur in °C",
            unit: "°C",
            stepsize: 0.01,
            precision: 2,
            monotone: true
        },
        snelheid: {
            minimum: 0,
            maximum: 0,
            value: 0,
            unit: '°C/sec',
            name: 'snelheid',
            label: 'snelheid in °C/sec',
            stepsize: 0.01,
            monotone: false,
            precision: 2
        }
    };

    var step = config.step || 10,
        time = {
            start: 0,
            end: quantities.tijd.maximum*1000,
            step: step
        },
        action_list = config.actions || ["start", "pause", "reset", "finish", "toggle_line", "toggle_tailpoints", "toggle_arrows", "step_size"],
        default_actions = require("../actions/actions")({speed: step});

    
    _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });



    

    function get_values() {
        var dataset_id = config.dataset_id;

        // via ajax, get the dataset as a string of time\ttemperature

        var data = "00:00.0\t23\n00:00.1\t24";
        return t_util.parse_data(data);
    }

    values = [];
    function compute_maxima() {
        values = get_values();

        var max = values[values.length - 1],
            min = values[0],
            max_tijd_in_ms = (values.length - 1) * step;

        _model.set_end(max_tijd_in_ms / 1000);
        _model.quantities._time_.maximum = max_tijd_in_ms;

        _model.quantities.tijd.maximum = max.tijd.toFixed(quantities.tijd.precision);

        _model.quantities.snelheid.maximum = Math.max.apply(null, values.map(function(v) {return v.snelheid;})) + 1;

        _model.quantities.snelheid.minimum = Math.min.apply(null, values.map(function(v) {return v.snelheid;})) - 1;

    }

    compute_maxima();

    _model.measure_moment = function(moment) {
        var value = values[moment],
            tijd = value.tijd,
            temperatuur = value.temperatuur,
            snelheid = value.snelheid;

        return {
            tijd: tijd,
            temperatuur: temperatuur,
            snelheid: snelheid
        };
    };


    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "temperature";

    return _model;
};

module.exports = temperature;
