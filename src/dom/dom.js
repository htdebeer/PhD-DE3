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

var dom = {
    create: function(spec) {
        var elt;
       
        if (spec.name === "textNode") {
           elt = document.createTextNode(spec.value);
        } else {
           elt = document.createElement(spec.name);
        }

        var set_attribute = function(attr) {
                elt.setAttribute(attr, spec.attributes[attr]);
            };

        if (spec.attributes) {
            Object.keys(spec.attributes).forEach(set_attribute);
        }

        if (spec.children) {
            var append = function(child) {
                elt.appendChild(dom.create(child));
            };
            spec.children.forEach(append);
        }

        if (spec.on) {
            if (typeof spec.on === "Array") {
                spec.on.forEach(function(on) {
                    elt.addEventListener( on.type, on.callback );
                });
            } else {
                elt.addEventListener( spec.on.type, spec.on.callback );
            }
        }

        if (spec.value) {
            if (spec.name === "input" || spec.name === "option") {
                elt.value = spec.value;
            } else {
                elt.innerHTML = spec.value;
            }
        }

        if (spec.text) {
            elt.innerHTML = spec.text;
        }

        if (spec.style) {
            var set_style = function(style_name) {
                elt.style[style_name] = spec.style[style_name];
            };
            Object.keys(spec.style).forEach(set_style);
        }

        return elt;
    },
    invert_color: function(color) {
        var R = parseInt(color.slice(1,3), 16),
            G = parseInt(color.slice(3,5), 16),
            B = parseInt(color.slice(5,7), 16),
            inverted_color = "#" +       
               (255 - R).toString(16) +
               (255 - G).toString(16) +
               (255 - B).toString(16);

        console.log(color, inverted_color);
        return inverted_color;
    }
};

module.exports = dom;
