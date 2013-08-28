

var paths = require("../../svg/path");

var contour_line = function(canvas, shape_, BOUNDARIES) {

    var _contour_line = {};

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

    function move(point) {
        return function (dx, dy, x, y, event) {
        };
    }

    function start_move(point) {
        return function (x, y, event) {
        };
    }

    function end_move(point) {
        return function (event) {
        };
    }

    function remove_point(point) {
        return function (event) {
            console.log("removed this point");
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
        point.segment = segment.command;

        if (index > 0) {
            point.prev = points[index-1];
            point.prev.next = point;
        }
        if (index < points.length - 1) {
            point.next = points[index+1];
            point.next.prev = point;
        }

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
        point.remove();
        delete points.splice(index, 1);
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
        i++;
        while (i < segments.length) {
            next_point = add_point(segments, next_point.x, next_point.y, i, "segment");
            i++;
        }

        var j = i;

        part = shape.base;
        path = part.path;
        segments = path.split(/ /);
        i = 0;
        x = part.top.x;
        y = part.top.y;

        next_point = add_point(segments, x, y, i, "part");
        marriage_point = points[j];
        i++;
        while (i < segments.length) {
            next_point = add_point(segments, next_point.x, next_point.y, i, "segment");
            i++;
        }

        add_point([], next_point.x, next_point.y, j+i, "part");
        bottom_point = points[i+j];
        
        function add_point(segments, x, y, index, type) {
            var new_x = x, new_y = y, new_index;

            var segment_string = segments[index] || "";
            var segment = parse_segment(segment_string) || [];

            _contour_line.insert(
                x,
                y,
                index,
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
        console.log(point, x, y);
        switch (point.segment) {
            case "v":
                path = "v" + point.length;
                break;
            case "h":
                path = "h" + point.length;
                break;
            case "l":
                path = "l" + x + "," + y;
                break;
            case "c":
                path = "c" + cp1.x + "," + cp1.y + "," +
                    cp2.x + "," + cp2.y + "," +
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
            paths.push(path_segment(cur));
            cur = cur.next;
        }
        console.log(paths);
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


    var path = canvas.path("M0,0"), 
        mirror = canvas.path("M0,0")
            ;

    path.attr({
        "stroke-width": 2
    });
    mirror.attr({
        "stroke-width": 2
    });
    function draw() {
        var shape = _contour_line.shape();
        var p = shape.bowl.path + paths.complete_path(shape.bowl);

        path.attr({
            path: "M" + shape.bowl.top.x + "," + shape.bowl.top.y + p
        });
        mirror.attr({
            path: "M" + shape.base.top.x + "," + shape.base.top.y + shape.base.path
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
