

var paths = require("../../svg/path");

var contour_line = function(canvas, shape_, BOUNDARIES) {

    var _contour_line = {};

    var SCALE = shape_.scale;

    var points = [],
        bottom_point,
        marriage_point,
        top_point;

    function create_point(x, y, type) {
        var r, attributes;
        switch(type) {
            case "part":
                r = 3;
                attributes = {
                    fill: "white",
                    stroke: "black",
                    "stroke-width": 2
                };
                break;
            case "segment":
                r = 2;
                attributes = {
                    fill: "black",
                    stroke: "black"
                };
                break;
            case "control":
                r = 2;
                attributes = {
                    fill: "silver",
                    stroke: "silver"
                };
                break;
        }
                  
        var point = canvas.circle(x, y, r);
        point.type = type;
        point.x = function() {return point.attr("cx");};
        point.y = function() {return point.attr("cy");};
        point.attr(attributes);
        point.drag( move(point), start_move(point), end_move(point) );
        if (type==="segment") point.dblclick(remove_point(point));
        return point;
    }

    var original_x = 0, original_y = 0;
    function move(point) {

        function moveable(new_x, new_y) {
            if (BOUNDARIES.x < new_x && new_x < BOUNDARIES.x + BOUNDARIES.width) {
                switch (point.name) {
                    case "top":
                        if (BOUNDARIES.y < new_y && new_y < point.next.y()) {
                            return true;
                        } else {
                            return false;
                        }
                        break;
                    case "bottom":
                        return true;
                    default:
                        if (point.prev.y() < new_y && new_y < point.next.y()) {
                            return true;
                        } else {
                            return false;
                        }
                    }
            } else {
                return false;
            }
            return true;
        }

        return function (dx, dy) {
            var new_x = original_x + dx,
                new_y;    
            if (point.name === "bottom") {
                new_y = original_y;
            } else {
                new_y = original_y + dy;
            }
            if (moveable(new_x, new_y)) {
                update_point(point, new_x, new_y);
                draw();
            }
        };
    }

    function update_point(point, x, y) {
        if (point.name !== "top" && (
                    point.prev.segment.command === "c" ||
                    point.prev.segment.command === "l")) {
            point.prev.segment.x = x;
            point.prev.segment.y = y;
        }
        
        point.attr({
            "cx": x,
            "cy": y
        });
    }

    function start_move(point) {
        return function () {
            original_x = point.x();
            original_y = point.y();
        };
    }

    function end_move(point) {
        return function (event) {
        };
    }

    function remove_point(point) {
        return function (event) {
            var index = points.indexOf(point);
            _contour_line.remove(index);    
        };
    }

    function parse_segment(segment) {
        var command = segment.charAt(0),
            elts = segment.slice(1).split(/ |,/),
            specification = {
                command: command
            };

        switch (command) {
            case "v":
                specification.length = parseFloat(elts[0]);
                break;
            case "h":
                specification.length = parseFloat(elts[0]);
                break;
            case "l":
                specification.x = parseFloat(elts[0]);
                specification.y = parseFloat(elts[1]);
                break;
            case "c":
                specification.cp1 = {
                    x: parseFloat(elts[0]),
                    y: parseFloat(elts[1])
                };
                specification.cp2 = {
                    x: parseFloat(elts[2]),
                    y: parseFloat(elts[3])
                };
                specification.x = parseFloat(elts[4]);
                specification.y = parseFloat(elts[5]);
                break;
        }
        return specification;
    }

    _contour_line.insert = function(x, y, index, type, segment) {
        var point = create_point(x, y, type);
        point.segment = segment;

        if (index > 0) {
            point.prev = points[index-1];
            point.prev.next = point;
        }
        if (index < points.length - 1) {
            point.next = points[index+1];
            point.next.prev = point;
        }

        point.name = "";
        points.splice(index, 0, point);
        return point;
    };

    _contour_line.remove = function(index) {
      
        var point = points[index];
        if (point.type === "part") {
            throw new Error("cannot remove part-point");
        }

        var prev = point.prev,
            next = point.next;
        prev.next = next;
        next.prev = prev;        
        prev.segment = {
            command: "l",
            x: next.x() - prev.x(),
            y: next.y() - prev.y()
        };
        point.remove();
        delete points[index];
        points.splice(index, 1);
        draw();
    };

    function populate_points(shape) {
        var part = shape.bowl,
            path = part.path,
            segments = path.split(/ /);

        var i = 0, next_point,
            x = part.top.x,
            y = part.top.y
            ;
        
        next_point = add_point(segments, x, y, i, "part");
        top_point = points[i];
        top_point.name = "top";
        i++;
        while (i < segments.length) {
            next_point = add_point(segments, next_point.x, next_point.y, i, "segment");
            i++;
        }

        var bowl_number_of_points = i;

        part = shape.base;
        path = part.path;
        segments = path.split(/ /);
        i = 0;
        x = part.top.x;
        y = part.top.y;

        next_point = add_point(segments, x, y, i, "part", bowl_number_of_points);
        marriage_point = points[bowl_number_of_points];
        marriage_point.name = "marriage";
        i++;
        while (i < segments.length) {
            next_point = add_point(segments, next_point.x, next_point.y, i, "segment", bowl_number_of_points);
            i++;
        }

        add_point([], next_point.x, next_point.y, i, "part", bowl_number_of_points);
        bottom_point = points[i+bowl_number_of_points];
        bottom_point.name = "bottom";

        function add_point(segments, x, y, index, type, addendum) {
            var new_x = x, new_y = y, new_index,
                add_to_index = addendum || 0;

            var segment_string = segments[index] || "";
            var segment = parse_segment(segment_string) || [];

            _contour_line.insert(
                x,
                y,
                index + addendum,
                type,
                segment
            );

            switch (segment.command) {
                case "v":
                    new_y = y + segment.length;
                    break;
                case "l":
                    new_x = x + segment.x;
                    new_y = y + segment.y;
                    break;
                case "c":
                    new_x = x + segment.x;
                    new_y = y + segment.y;
                    break;
                case "h":
                    new_x = x + segment.length;
                    break;
                default:
                    new_x = 0;
                    new_y = 0;
                    break;
            }
            
            return {
                x: new_x,
                y: new_y
            };
        }
    }




    function path_segment(point) {
        var path = "",
            x = point.next.x() - point.x(),
            y = point.next.y() - point.y();
        switch (point.segment.command) {
            case "v":
                path = "v" + point.segment.length;
                break;
            case "h":
                path = "h" + point.segment.length;
                break;
            case "l":
                path = "l" + x + "," + y;
                break;
            case "c":
                path = "c" + point.segment.cp1.x + "," + point.segment.cp1.y + "," +
                    point.segment.cp2.x + "," + point.segment.cp2.y + "," +
                    x + "," + y;
                break;
        }
        return path;
    }


    function part_path(start) {
        var cur = start,
            paths =[];
        paths.push(path_segment(cur));
        while (cur.next.type !== "part") {
            cur = cur.next;
            paths.push(path_segment(cur));
        }
        return paths.join(" ");
    }

    _contour_line.shape = function() {
        return {
            bowl: {
                top: {
                    x: top_point.x(),
                    y: top_point.y()
                },
                bottom: {
                    x: marriage_point.x(),
                    y: marriage_point.y()
                },
                path: part_path(top_point)
            },
            base: {
                top: {
                    x: marriage_point.x(),
                    y: marriage_point.y()
                },
                bottom: {
                    x: bottom_point.x(),
                    y: bottom_point.y()
                },
                path: part_path(marriage_point)
            },
            scale: shape_.scale
        };
    };


    var bowl_path = canvas.path("M0,0"), 
        base_path = canvas.path("M0,0")
            ;

    base_path.attr({
        "stroke-width":4,
        "fill": "dimgray",
        "fill-opacity": 0.5
    });
    bowl_path.attr({
        "stroke-width": 4,
        "fill": "none"
    });

    bowl_path.click(add_point);

    var add_point_dot = canvas.circle(0,0,6);
    add_point_dot.attr({
        fill: "orange",
        "fill-opacity": 0.5,
        stroke: "dimgray"
    });
    add_point_dot.hide();

    function add_point(event, x, y) {
        console.log(x, y);
        // find point directly above
    }


    function normalize_shape(shape) {
        var MID_X = BOUNDARIES.x;
        shape.bowl.top.x -= MID_X;
        shape.bowl.bottom.x -= MID_X;
        shape.base.top.x -= MID_X;
        shape.base.bottom.x -= MID_X;
        return shape;
    }

    function draw() {
        var shape = normalize_shape(_contour_line.shape());
        var x = BOUNDARIES.x,
            y = 0;

        bowl_path.attr({
            path: "M" + x + "," + y + paths.complete_path(shape.bowl)
        });

        p = paths.complete_path(shape.base);
        base_path.attr({
            path: "M" + x + "," + y + paths.complete_path(shape.base) + "z"
        });

    }


    populate_points(shape_);
    draw();
    _contour_line.bottom = bottom_point;
    _contour_line.marriage = marriage_point;
    _contour_line.top = top_point;
    return _contour_line;
};

module.exports = contour_line;
