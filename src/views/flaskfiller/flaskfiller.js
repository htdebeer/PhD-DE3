
var view = require("../view"),
    dom = require("../../dom/dom"),
    ruler = require("./ruler"),
    raphael = require("raphael-browserify"),
    longdrink = require("./longdrink_glass"),
    various_glass = require("./glass");

var flaskfiller = function(config, scale_, dimensions_) {
    var _flaskfiller = view(config);

    var scale = scale_ || 4; // px per mm

    var dimensions = dimensions_ || {
        width: 900,
        height: 600,
        ruler_width: 30,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };

    var CONTAINER = {
            width: dimensions.width || 900,
            height: dimensions.height || 600
        };

    var RULERS = {
            horizontal: {
                x:  dimensions.ruler_width + dimensions.margins.left,
                y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
                width: CONTAINER.width - dimensions.ruler_width - dimensions.margins.left - dimensions.margins.right,
                height: dimensions.ruler_width,
                scale: scale,
                orientation: "horizontal"
            },
            vertical: {
                x:  0 + dimensions.margins.left,
                y:  0 + dimensions.margins.top,
                width: dimensions.ruler_width,
                height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom,
                scale: scale,
                orientation: "vertical"
            }
        };

    var SIMULATION = {
            x:  dimensions.ruler_width + dimensions.margins.left,
            y:  0 + dimensions.margins.top,
            width: CONTAINER.width - dimensions.ruler_width - dimensions.margins.left - dimensions.margins.right,
            height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom
        };


    _flaskfiller.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "flaskfiller"
            }
        }));

    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_flaskfiller.fragment);

    var canvas = raphael(_flaskfiller.fragment, 
            CONTAINER.width, 
            CONTAINER.height);

    var vertical_ruler = ruler(canvas, RULERS.vertical)
            .style({
                "background": "white"
            }),
        horizontal_ruler = ruler(canvas, RULERS.horizontal)
            .style({
                "background": "white"
            }),
        cm_label = draw_cm_label();



    function draw_cm_label() {
       var x = dimensions.margins.left + (dimensions.ruler_width / 3),
           y = CONTAINER.height - (dimensions.ruler_width / 2) - dimensions.margins.bottom,
           cm_label = canvas.text(x, y, "cm");

       cm_label.attr({
           "font-family": "inherit",
           "font-size": "18pt",
           "font-weight": "bolder",
           "fill": "dimgray"
       }); 

       return cm_label;
    }


    function add_glass(model) {
        var glass;
        if (model.type === "longdrink") {
            glass = longdrink(canvas, model, scale);
        } else {
            glass = various_glass(canvas, model, scale);
        }
        return glass;
    }

    function update_glass(glass) {
        glass.update_color();        
        glass.update();
    }

    _flaskfiller.update = function(model_name) {
        var model = _flaskfiller.get_model(model_name);

        if (!model.glass) {
            model.glass = add_glass(model.model);
        }

        update_glass(model.glass);

    };

    _flaskfiller.remove = function(model_name) {
    };



    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_flaskfiller.fragment);
    return _flaskfiller;

};

module.exports = flaskfiller;
