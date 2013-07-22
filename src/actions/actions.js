

// add attribution to the icons: "Entypo pictograms by Daniel Bruce — www.entypo.com"

var actions = function(config) {
    var _actions = {},
        running_models = {}
        ;

    var current_speed = config.speed || 500;

    _actions.speed = function( speed ) {
        if (arguments.length === 1) {
            current_speed = speed;
        }
        return current_speed;
    };

    var is_running =  function(model) {
        return running_models[model.name];
    };

    _actions.start = {
        name: "start",
        icon: "icon-play",
        tooltip: "Start simulation",
        enabled: true,
        callback: function(model) {
           
            var step = function() {
                if (!model.is_finished()) {
                    model.step();
                } else {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                    model.disable_action("finish");
                }
            };

            return function() {
                    if (!is_running(model)) {
                        running_models[model.name] = setInterval(step, current_speed);
                    }
                    model.disable_action("start");
                    model.enable_action("pause");
                    model.enable_action("reset");
                    model.update_views();
            };
        }
    };

    _actions.pause = {
            name: "pause",
            icon: "icon-pause",
            tooltip: "Pause simulation",
            enabled: false,
            callback: function(model) {
                return function() {
                    model.enable_action("start");
                    model.disable_action("pause");
                    if (is_running(model)) {
                        clearInterval(running_models[model.name]);
                        delete running_models[model.name];
                    }
                    model.update_views();
                };
            }
    };

    _actions.reset = {
        name: "reset",
        icon: "icon-fast-backward",
        tooltip: "Reset simulation",
        enabled: true,
        callback: function(model) {
            return function() {
                if (is_running(model)) {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                }
                model.reset();
                model.enable_action("start");
                model.enable_action("finish");
                model.disable_action("pause");
                model.disable_action("reset");
                model.update_views();
            };
        }
    };

    _actions.finish = {
        name: "finish",
        icon: "icon-fast-forward",
        tooltip: "Finish simulation",
        enabled: true,
        callback: function(model) {
            return function() {
                if (is_running(model)) {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                }
                model.finish();
                model.disable_action("pause");
                model.disable_action("start");
                model.disable_action("finish");
                model.enable_action("reset");
                model.update_views();
            };
        }
    };

    return _actions;
};

module.exports = actions;
