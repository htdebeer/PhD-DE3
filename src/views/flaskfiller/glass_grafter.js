

var raphael = require("raphael-browserify");
var dom = require("../../dom/dom");
var ruler = require("./ruler");
var contour_line = require("./contour_line");

var glass_grafter = function(config) {
    var _grafter = {};

    var scale = config.scale || (config.shape)?(config.shape.scale || 3):3; // px per mm
    var shape = config.shape || {
            bowl: {
                top: {
                    x: 100,
                    y: 0
                },
                bottom: {
                    x: 10,
                    y: 100
                },
                path: "l-90,100"
            },
            base: {
                top: {
                    x: 10,
                    y: 100
                },
                bottom: {
                    x: 70,
                    y: 200
                },
                path: "l0,90 l50,0 c5,2.5,7.5,7.5,10,10"
            },
            scale: scale
        };

    var dimensions = config.dimensions || {
        width: 500,
        height: 500,
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

    var MIRROR_AREA = {
        x: dimensions.margins.left,
        y: dimensions.margins.top,
        width: HALF_WIDTH,
        height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
    };

    var CONSTRUCTION_AREA = {
        x: MIRROR_AREA.x + MIRROR_AREA.width,
        y: dimensions.margins.top,
        width: HALF_WIDTH,
        height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
    };

    var RULERS = {
            horizontal: {
                x:  CONSTRUCTION_AREA.x,
                y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
                width: (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width,
                height: dimensions.ruler_width,
                scale: scale,
                orientation: "horizontal"
            },
            vertical: {
                x:  dimensions.margins.left + HALF_WIDTH*2,
                y:  0 + dimensions.margins.top,
                width: dimensions.ruler_width,
                height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom,
                scale: scale,
                orientation: "vertical",
                reverse: true
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
       var x = dimensions.margins.left + 2*HALF_WIDTH + (dimensions.ruler_width / 2),
           y = CONTAINER.height - (dimensions.ruler_width / 2) - dimensions.margins.bottom,
           cm_label = canvas.text(x, y, "cm");

       cm_label.attr({
           "font-family": "inherit",
           "font-size": "18pt",
           "font-weight": "bolder",
           "fill": "dimgray"
       }); 

       cm_label.click(function() {
           points.print_shape();
       });

       return cm_label;
    }


    var ACTION_PADDING = 15,
        ACTION_WIDTH = 20,
        ACTION_HEIGHT = 15,
        ACTION_SEP = 5,
        ACTION_AREA = {
        x: MIRROR_AREA.x + ACTION_PADDING,
        y: MIRROR_AREA.y + MIRROR_AREA.height + ACTION_PADDING
        };
    var remove_action = draw_action("remove", 0);
    var straight_action = draw_action("straight", 1);
    var curve_action = draw_action("curve", 2);

    function draw_action(name, index) {
        var action = canvas.set();
        
        var x = ACTION_AREA.x + index*(ACTION_SEP * ACTION_WIDTH) + ACTION_SEP,
            y = ACTION_AREA.y;

        var background = canvas.rect(x, y, ACTION_WIDTH, ACTION_HEIGHT);
        background.attr({
            fill: "gold",
            stroke: "dimgray"
        });
        action.push(background);

        var label = canvas.text(x, y, name);
        action.push(label);
        action.attr({

        });
        action.click(function() {
            points.current_action = name;
            if (name === "curve") {
                points.show_control_points();
            } else {
                points.hide_control_points();
            }
            console.log(points.current_action);
        });
        return action;
    }



    var construction_background,
        mirror_background;

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

        mirror_background = canvas.rect(MIRROR_AREA.x,
                MIRROR_AREA.y,
                MIRROR_AREA.width,
                MIRROR_AREA.height
                );
        mirror_background.attr({
            stroke: "dimgray",
            "stroke-width": 2,
            fill: "silver",
            "fill-opacity": 0.5
        });

    }

    function create_point(x, y, type) {
        
        var point = canvas.circle(x, y);
        switch (type) {
            case "interval":
                point.attr({
                    r: 5,
                    "stroke": "black",
                    fill: "white"
                });
                break;
            case "segment":
                point.attr({
                    r: 2,
                    stroke: "black",
                    fill: "black"
                });
                break;
            case "control":
                point.attr({
                    r: 2,
                    stroke: "gray",
                    fill: "gray"
                });
                break;
        }
        return point;
    }




    function reshape(shape) {
        var bottom_y = CONSTRUCTION_AREA.y + CONSTRUCTION_AREA.height,
            delta_x = HALF_WIDTH + dimensions.margins.left,
            delta_y = bottom_y - shape.base.bottom.y;

       shape.base.bottom.y = shape.base.bottom.y + delta_y; 
       shape.base.bottom.x = shape.base.bottom.x + delta_x; 
       shape.base.top.y = shape.base.top.y + delta_y; 
       shape.base.top.x = shape.base.top.x + delta_x; 
       shape.bowl.bottom.y = shape.bowl.bottom.y + delta_y; 
       shape.bowl.bottom.x = shape.bowl.bottom.x + delta_x; 
       shape.bowl.top.y = shape.bowl.top.y + delta_y; 
       shape.bowl.top.x = shape.bowl.top.x + delta_x; 

       return shape;
    }


    draw();
    vertical_ruler.toFront();
    horizontal_ruler.toFront();
    var points = contour_line(canvas, reshape(shape), CONSTRUCTION_AREA);
    mirror_background.toFront();
    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_grafter.fragment);
    return _grafter;
};

module.exports = glass_grafter;
