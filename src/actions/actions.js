
// using http://fortawesome.github.io/Font-Awesome/icons/ for icons

var actions = function(config) {
    var _actions = {};


    // Running model actions

    var running_models = {},
        current_speed = 17; // refresh rate of about 60 updates per second  || config.speed || 10;

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
        group: "run_model",
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
                    model.disable_action("pause");
                    model.disable_action("start");
                    model.update_views();
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
        group: "run_model",
        icon: "icon-pause",
        tooltip: "Pause simulation",
        enabled: false,
        callback: function(model) {
            return function() {
                if (is_running(model)) {
                    clearInterval(running_models[model.name]);
                    delete running_models[model.name];
                }
                model.enable_action("start");
                model.disable_action("pause");
                model.update_views();
            };
        }
    };

    _actions.reset = {
        name: "reset",
        group: "run_model",
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
        group: "run_model",
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

    // Toggle view action

    _actions.toggle_line = {
        name: "toggle_line",
        group: "toggle_view",
        icon: "icon-picture",
        tooltip: "Show/hide the line graph of this model",
        enabled: true,
        toggled: false,
        callback: function(model) {
            return function() {
                if (model.graph_is_shown("line")) {
                    this.removeAttribute("data-toggled");
                    model.hide_graph("line");
                } else {
                    this.setAttribute("data-toggled", true);
                    model.show_graph("line");
                }
            };
        }
    };

    _actions.toggle_arrows = {
        name: "toggle_arrows",
        group: "toggle_view",
        icon: "icon-long-arrow-right ",
        tooltip: "Show/hide the arrows graph of this model",
        enabled: true,
        toggled: false,
        callback: function(model) {
            return function() {
                if (model.graph_is_shown("arrows")) {
                    this.removeAttribute("data-toggled");
                    model.hide_graph("arrows");
                } else {
                    this.setAttribute("data-toggled", true);
                    model.show_graph("arrows");
                }
            };
        }
    };

    _actions.toggle_tailpoints = {
        name: "toggle_tailpoints",
        group: "toggle_view",
        icon: "icon-bar-chart",
        tooltip: "Show/hide the tailpoints graph of this model",
        enabled: true,
        toggled: false,
        callback: function(model) {
            return function() {
                if (model.graph_is_shown("tailpoints")) {
                    this.removeAttribute("data-toggled");
                    model.hide_graph("tailpoints");
                } else {
                    this.setAttribute("data-toggled", true);
                    model.show_graph("tailpoints");
                }
            };
        }
    };


    _actions.step_size = {
        name: "step_size",
        group: "step_size",
        tooltip: "Set the step size of the tailpoint graph",
        enabled: true,
        type: "slider",
        callback: function(model) {
            return function() {
                model.step_size(this.value);

                var update_tailpoints = function(graph) {
                    graph.update(model.name);
                };
                model.get_views_of_type("graph").forEach(update_tailpoints);
            };
        }
    };


    return _actions;
};

module.exports = actions;
