
var model = require("./model");

var data = function(name, config) {

    var _model = {};

    function create_actions(action_list) {
        var actions = {},
            create_action = function(action_name) {
                actions[action_name] = default_actions[action_name];
            };
        action_list.forEach(create_action);
        return actions;
    }
    
    var quantities = {};
    config.quantities.forEach(function(q) {quantities[q.name] = q;});

    var step = config.step || 10,
        time = {
            start: 0,
            end: config.data.length * step,
            step: step
        },
        action_list = config.actions || ["start", "pause", "reset", "finish", "toggle_line", "toggle_tailpoints", "toggle_arrows", "step_size"],
        default_actions = require("../actions/actions")({speed: step});

    
    _model = model(name, {
        time: time,
        quantities: quantities,
        actions: create_actions(action_list)
    });



    
    values = config.data;
    function compute_maxima() {

        function extrema(q) {
            if (q.dont_compute_maximum) {
            } else {
                _model.quantities[q.name].maximum = Math.max.apply(null,
                        values.map(function(v) {
                            return v[q.name];
                        }
                        )
                    );
            }
            if (q.dont_compute_minimum) {

            } else {
                _model.quantities[q.name].minimum = Math.min.apply(null,
                        values.map(function(v) {
                            return v[q.name];
                        }
                        )
                    );
            }
        }

        var max = values[values.length - 1],
            min = values[0],
            max_tijd_in_ms = (values.length - 1) * step;

        _model.set_end(max_tijd_in_ms / 1000);
        _model.quantities._time_.maximum = max_tijd_in_ms;

        config.quantities.forEach(extrema);

    }

    compute_maxima();

    _model.measure_moment = function(moment) {
        return values[moment];
    };


    _model.step();
    _model.compute_maxima = compute_maxima;
    _model.type = "data";

    return _model;
};

module.exports = data;
