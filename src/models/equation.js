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

/*
 *  equation.js is a model based on a simple equation like y = x^2
 */

var superclass = require("./model");

var equation_model = function(config) {
    var model = superclass(config),
        quantities = model.quantities,
        f = config.equation;

    var update_x = function(value) {
        var X = quantities["x"],
            current_value = model.get("x"),
            step = X.stepize|| 1;

        while (model.get("x") !== value) {
            model.set("x", model.get("x") + step);
            model.set("y", f(model.get("x")));
        };

    }

    model.update = function(quantity, value) {
        switch (quantity) {
            case "x":
                update_x(value);
                break;
            case "y":
                update_y(value);
                break
        };
    };

    model.step = function(quantity) {
        var q = model.quantities[quantity];

        if ((q.value + size) <= q.maximum && (q.value + size) >= q.minimum) {
            q.value = q.value + q.stepsize;

        };
    };

    return model;
};

module.exports = equation_model;

