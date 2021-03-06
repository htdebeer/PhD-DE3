/*
 * Copyright (C) 2013 Huub de Beer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var dom = require("../dom/dom");
var data_util = require("../data/util");

var table = function(config) {
    var _table = require("./view")(config),
        _appendix = {};

    var model_specs = config.models;

    var TOGGLED_COLOR = "gold";

    var hide_actions = config.hide_actions || [];
    function show_this_action(action_name) {
        return hide_actions.indexOf(action_name) === -1;
    }

    function remove_action(model) {
        return {
            name: "remove",
            group: "edit",
            icon: "icon-remove",
            tooltip: "Remove this model",
            enabled: true,
            callback: function(model) {
                return function() {
                    model.action("reset").callback(model)();
                    config.microworld.unregister(model.name);
                };
            }
        };
    }

    function show_progress(model) {
    }

    function hide_progress() {
    }

    function process_data(model) {
        return function(data) {
            config.microworld.register(model, data);
            hide_progress();
        };
    }


    function add_model() {
        return function() {
            if (this.selectedIndex > 0) {
                var selected_option = this.options[this.selectedIndex].value;
                var model = model_specs[selected_option];
                if (model.data_model) {
                    show_progress(model);                    
                    data_util.load(model, process_data(model));                    
                } else {
                    config.microworld.register(model);
                }
                this.selectedIndex = 0;
            }
        };
    }

    var table_fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "table"
        }));

    function create_model_option_list(list) {
        function create_option(model, index) {
            return {
                name: "option",
                text: model.name.replace("_", " "),
                attributes: {
                    value: index
                }
            };
        }

        return {
            name: "select",
            attributes: {
                "class": "model_list"
            },
            children: [{
                name: "option",
                text: "toevoegen ...",
                value: -1
            }].concat(list.map(create_option)),
            on: {
                type: "change",
                callback: add_model()
            }
        };
    }

    var create_foot = function() {
        var table_foot = table_fragment
            .appendChild(dom.create({name: "tfoot"}));



        table_foot.appendChild(dom.create({
            name: "tr",
            children: [
                {
                    name: "th",
                    attributes: {
                        "data-list": true
                    },
                    children: [
                                {
                                name: "i",
                                attributes: {
                                    "class": "icon-plus"
                                }
                            }, create_model_option_list(config.models)]
                }, {
                    name: "th",
                    attributes: {
                        "class": "corner",
                        "colspan": Object.keys(_table.quantities).length + 2
                    }
                }
            ]
        }));

    };
    create_foot();

    _table.add_models_to_list = function(new_model_specs) {
        var list = model_specs.concat(new_model_specs);

        var model_list_select = table_fragment.querySelector("select.model_list");
        if (model_list_select) {
            var parent = model_list_select.parentNode;
            parent.removeChild(model_list_select);
            parent.appendChild(dom.create(create_model_option_list(list)));
        }

        model_specs = list;
    };


    var create_head = function() {
        var table_head = table_fragment
            .appendChild(dom.create({name: "thead"})),
            actions = config.actions || {};

        var head = table_head.appendChild(dom.create({name: "tr"}));

        // name column
        head.appendChild(dom.create({
            name: "th",
            attributes: { 
                "class": "corner",
                "colspan": 2
            }
        }));

        // quantities, if any
        var number_of_quantities = Object.keys(_table.quantities)
            .filter(function(q) {return !_table.quantities[q].not_in_table;})
            .length;
        if (number_of_quantities > 0) {
                var add_cell = function(q) {
                    var quantity = _table.quantities[q];

                    head.appendChild( dom.create({
                        name: "th",
                        value: quantity.name.replace("_", " ")
                    }));
                };                            

            Object.keys(_table.quantities)
                .filter(function(q) {return !_table.quantities[q].not_in_table;})
                .forEach(add_cell);
        }

        // actions, if any
        head.appendChild(
            dom.create({
                name: "th",
                attributes: {
                    "class": "corner"
                }
            })
        );




        
        

    };
    create_head();

    // create body
    var table_body = table_fragment.appendChild(
            dom.create({name: "tbody"})
            );

    var add_row = function(model) {
        var row;

        var create_quantity_elt = function(q) {
                    
                var quantity = _table.quantities[q],
                    cell = {
                        name: "td",
                        attributes: {
                            "data-quantity": q
                        }
                    };
                if (quantity.monotone) {
                    cell.children = [{
                        name: "input",
                        attributes: {
                            "type": "text",                        
                            "pattern": "(\\+|-)?\\d*((\\.|,)\\d+)?"
                        },
                        on: {
                            type: "change",
                            callback: function(event) {
                                var value = this.value;
                                if (value < model.get_minimum(q)) {
                                    model.reset();
                                } else if (model.get_maximum(q) < value) {
                                    model.finish();
                                } else {
                                    model.set( q, value );
                                }
                            }
                        }

                    }];
                } else {
                    cell.children = [{
                        name: "span",
                        attributes: { "class": "measurement" }
                    }];
                }

                if (quantity.unit) {
                    cell.children.push({
                        name: "span",
                        attributes: {
                            "class": "unit" },
                        value: quantity.unit
                    });
                }
                return cell;
            },
            quantity_elts = Object.keys(_table.quantities)
                .filter(function(q) {
                    return !_table.quantities[q].not_in_table;
                })
                .map(create_quantity_elt);

        var group,
            create_action_elt = function(action_name) {

                var action = model.action(action_name),
                    classes = "action";
                if (group && group !== action.group) {
                    group = action.group;
                    classes += " left-separator";
                } else {
                    group = action.group;
                }

                var attributes = {
                        "class": classes,
                        "data-action": action_name
                    };

                if (action.type && action.type === "slider") {
                    attributes.type = "range";
                    attributes.min = 1;
                    attributes.max = 10 * model.step_size();
                    attributes.step = 1;
                    attributes.value = model.step_size();

                    return {
                        name: "input",
                        attributes: attributes,
                        on: {
                            type: "change",
                            callback: action.install()
                        }

                    };
                } else {
                    if (action.toggled) {
                        attributes["data-toggled"] = true;
                    }
                    return {
                        name: "button",
                        attributes: attributes,
                        children: [{
                            name: "i",
                            attributes: {
                               "class": action.icon
                            }
                        }],
                        on: {
                            type: "click",
                            callback: action.install()
                        }

                    };
                }
            };


            model.add_action(remove_action());
            var actions_elts = Object.keys(model.actions).filter(show_this_action).map(create_action_elt);

        row = table_body.appendChild(
                dom.create( {
                    name: "tr",
                    attributes: {
                        "id": model.name
                    },
                    children: [{
                        name: "td",
                        value: model.name.split("_").join(" "),
                        attributes: { "class": model.name }
                    },{
                        name: "td",
                        attributes: {
                            "class": "color"
                        },
                        children: [{
                            name: "span",
                            value: "",
                            on: {
                                type: "click",
                                callback: function(event) {
                                    model.color("random");
                                    model.update_views();
                                }
                            },
                            style: {
                                width: "15px",
                                height: "15px",
                                border: "1px solid dimgray",
                                "background": model.color(),
                                display: "block"
                            }
                        }]
                    }].concat(quantity_elts).concat([{
                        name: "td",
                        children: actions_elts
                    }])
                }));

        return row;


    };

    var update_row = function(row, model) {

        var color_cell = row.querySelector(".color span");
        if (color_cell) {
            color_cell.style.background = model.color();
        }

        var moment = model.current_moment(),
            update_quantity = function(q) {
                var quantity = _table.quantities[q];
                if (quantity && !quantity.not_in_table) {
                    var query = "[data-quantity='" + q + "']",
                        cell = row.querySelector(query);

                    if (quantity.monotone) {
                        cell.children[0].value = moment[q].toFixed(quantity.precision || 0);
                    } else {
                        // Hack to get locale decimal seperator in Chrome.
                        // Does not work nicely in other browsers as Chrome
                        // makes the input type=number automatically
                        // localized
                        var dec_sep = (1.1).toLocaleString()[1] || ".";
                        cell.children[0].innerHTML = moment[q].toFixed(quantity.precision || 0).replace(/\./, dec_sep);
                    }
                }
            };


        Object.keys(moment)
            .forEach(update_quantity);

        var update_action =  function(action_name) {
            var query = "button[data-action='" + action_name + "']",
                button = row.querySelector(query);

            if (button) {
                var action = model.action(action_name);
                if (action.enabled) {
                    button.removeAttribute("disabled");
                } else {
                    button.setAttribute("disabled", true);
                }
                
            }

        };

        Object.keys(model.actions).forEach(update_action);
    };

    _table.remove = function(model_name) {
        var row = table_body.querySelector("tr#" + model_name);
        if (row) {
            table_body.removeChild(row);
        }
    };

    _table.update = function(model_name) {
        var model = _table.get_model(model_name);

        if (!model.row) {
            model.row = add_row(model.model);
        }

        update_row(model.row, model.model);
    };

    _table.fragment = table_fragment;
    return _table;
};

module.exports = table;
