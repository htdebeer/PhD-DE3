

var raphael = require("raphael-browserify");
var dom = require("../../dom/dom");
var ruler = require("./ruler");

var glass_grafter = function(config, scale_, dimensions_) {
    var _grafter = {};

    var scale = scale_ || 4; // px per mm

    var dimensions = dimensions_ || {
        width: 600,
        height: 400,
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
        
    var HALF_WIDTH = (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width;

    var CONSTRUCTION_AREA = {
        x: dimensions.margins.left + dimensions.ruler_width,
        y: dimensions.margins.top,
        width: HALF_WIDTH,
        height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
    };

    var MIRROR_AREA = {
        x: CONSTRUCTION_AREA.x + CONTAINER.width,
        y: dimensions.margins.top,
        width: HALF_WIDTH,
        height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
    };

    var RULERS = {
            horizontal: {
                x:  dimensions.ruler_width + dimensions.margins.left,
                y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
                width: (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width,
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

    _grafter.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "glassgrafter"
            }
        }));

    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_grafter.fragment);

    var canvas = raphael(_grafter.fragment,
            CONTAINER.width,
            CONTAINER.height
        );

    var vertical_ruler = ruler(canvas, RULERS.vertical, CONTAINER.width)
            .style({
                "background": "white"
            }),
        horizontal_ruler = ruler(canvas, RULERS.horizontal, CONTAINER.height)
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


    var construction_background,
        mirror_background,
        base_bottom_point,
        marriage_point,
        bowl_top_point;

    function draw() {
        construction_background = canvas.rect(CONSTRUCTION_AREA.x,
                CONSTRUCTION_AREA.y,
                CONSTRUCTION_AREA.width,
                CONSTRUCTION_AREA.height
                );
        construction_background.attr({
            stroke: "dimgray",
            "stroke-width": 2,
            fill: "white"
        });
        console.log(" hasfldskdsfjk", CONSTRUCTION_AREA);
    }



    draw();
    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_grafter.fragment);
    return _grafter;
};

module.exports = glass_grafter;
