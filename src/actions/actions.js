
// using http://fortawesome.github.io/Font-Awesome/icons/ for icons

var actions = function(config) {
    var _actions = {};


    // Running model actions

    var running_models = {},
        current_speed = config.speed || 10;

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

    // Remove model actions
    
    _actions.remove = {
        name: "remove",
        group: "edit",
        icon: "icon-remove",
        tooltip: "Remove this model",
        enabled: true,
        callback: function(model) {
            return function() {
                model.unregister();
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
        toggled: true,
        callback: function(model) {
            return function() {
                if (this.hasAttribute("data-toggled")) {
                    this.removeAttribute("data-toggled");
                    model.get_views_of_type("graph")[0].hide_line(model.name);
                } else {
                    this.setAttribute("data-toggled", true);
                    model.get_views_of_type("graph")[0].show_line(model.name);
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
                if (this.hasAttribute("data-toggled")) {
                    this.removeAttribute("data-toggled");
                    model.get_views_of_type("graph")[0].hide_tailpoints(model.name);
                } else {
                    this.setAttribute("data-toggled", true);
                    model.get_views_of_type("graph")[0].show_tailpoints(model.name);
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
