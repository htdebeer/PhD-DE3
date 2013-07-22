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

var table = function(config) {
    var _table = require("./view")(config),
        _appendix = {};

    var table_fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "table",
            attributes: []
        }));

    var create_head = function() {
        var table_head = table_fragment
            .appendChild(dom.create({name: "thead"})),
            quantities = config.quantities || {},
            actions = config.actions || {};

        var head = table_head.appendChild(dom.create({name: "tr"}));

        // name column
        head.appendChild(dom.create({
            name: "th",
            attributes: [{
                name: "class",
                value: "corner"
            }]
        }));

        // quantities, if any
        var number_of_quantities = Object.keys(quantities).length;
        if (number_of_quantities > 0) {
                var add_cell = function(q) {
                    var quantity = quantities[q],
                        label = (quantity.unit)?
                            quantity.label + " (" + quantity.unit + ")":
                            quantity.label;

                    head.appendChild( dom.create({
                        name: "th",
                        value: label
                    }));
                };                            

            Object.keys(quantities).forEach(add_cell);
        }

        // actions, if any
        head.appendChild(
            dom.create({
                name: "th",
                attributes: [{
                    name: "class",
                    value: "corner"
                }]
            })
        );




        
        

    };
    create_head();

    // create body
    var table_body = table_fragment.appendChild(
            dom.create({name: "tbody"})
            );

    var add_row = function(model) {
        var quantities = config.quantities || {},
            create_quantity_elt = function(quantity) {
                return {
                    name: "td",
                    attributes: [{
                        name: "data-quantity",
                        value: quantity
                    }]
                };
            },
            quantity_elts = Object.keys(quantities).map(create_quantity_elt);

        var create_action_elt = function(action_name) {
            var action = model.action(action_name);
                return {
                    name: "button",
                    attributes: [{
                        name: "class",
                        value: "action"
                    }, {
                        name: "data-action",
                        value: action_name
                    }],
                    children: [{
                        name: "i",
                        attributes: [{
                            name: "class",
                            value: action.icon
                        }]
                    }],
                    on: {
                        type: "click",
                        callback: action.install()
                    }
                };
            },
            actions_elts = Object.keys(model.actions).map(create_action_elt);

        return table_body.appendChild(
                dom.create( {
                    name: "tr",
                    attributes: [{
                        name: "id",
                        value: model.name
                    }],
                    children: [{
                        name: "td",
                        value: model.name,
                        attributes: [{
                            name: "class",
                            value: model.name
                        }]
                    }].concat(quantity_elts).concat([{
                        name: "td",
                        children: actions_elts
                    }])
                }));


    };

    var update_row = function(row, model) {
        var moment = model.current_moment(),
            update_quantity = function(quantity) {
                var query = "[data-quantity='" + quantity + "']",
                    cell = row.querySelector(query);
                if (!cell) {
                    cell = dom.create({name: "td",
                    attributes: [{
                        name: "data-quantity",
                        value: quantity
                    }]});
                    row.appendChild(cell);
                }

                cell.innerHTML = moment[quantity];

            };


        Object.keys(moment).forEach(update_quantity);

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
