

function start_of_path(path) {
    return Raphael.getPointAtLength(path, 0);
}

function end_of_path(path) {
    return Raphael.getPointAtLength(path,
            Raphael.getTotalLength());
}

function complete_path(part, fill_length) {
    var start = part.top,
        end = part.bottom,
        path = part.path;
    
    if (fill_length) {
        path = "m" + start.x + "," + start.y + path;
        start = Raphael.getPointAtLength(path, fill_length);

        var total_length = Raphael.getTotalLength(path);

        path = Raphael.getSubpath(path, fill_length, total_length);
        path = Raphael.pathToRelative(path);
        path.shift(); // remove the M command
        path = path.toString();
    }
   
    var segments = Raphael.parsePathString(path),
        completed_path = "m" + start.x + "," + start.y + path;


    completed_path += "h-" +(Math.abs(0 - end.x) * 2);

    var mirror_segment = function(segment) {
        var command = segment[0],
            x,y, cp1, cp2,
            mirrored_segment = "";

        switch (command) {
            case "l":
                x = segment[1];
                y = segment[2];
                mirrored_segment = "l" + x + "," + (-y);
                start = {
                    x: start.x + x,
                    y: start.y + y
                };
                break;
            case "c":
                cp1 = {
                    x: segment[1],
                    y: segment[2]
                };
                cp2 = {
                    x: segment[3],
                    y: segment[4]
                };

                x = segment[5];
                y = segment[6];
                end = {
                    x: x,
                    y: y
                };
                mirrored_segment = "c" + (end.x - cp2.x) + "," + (-(end.y - cp2.y)) + "," +
                    (end.x - cp1.x) + "," + (-(end.y - cp1.y)) + "," + 
                    (x) + "," + (-y);
                start = {
                    x: start.x + x,
                    y: start.y + y
                };
                break;
            case "v":
                y = segment[1];
                mirrored_segment = "v" + (-y);
                start = {
                    x: start.x,
                    y: start.y + y
                };
                break;
            case "h":
                x = segment[1];
                mirrored_segment = "h" + x;
                start = {
                    x: start.x + x,
                    y: start.y
                };
                break;
            case "m":
                // skip

                break;
        }

        return mirrored_segment;
    };

    completed_path += segments.map(mirror_segment).reverse().join("");


    return completed_path;
}

function scale_shape(shape, scale_) {
    var model_scale = shape.scale,
        factor = scale_/model_scale;

    var scale = function(number) {
            return number * factor;
        };

    function scale_path(path, factor) {
        var path_segments = Raphael.parsePathString(path),
            scale_segment = function(segment) {
                var segment_arr = segment,
                    command = segment_arr.shift();

                return command + segment_arr.map(scale).join(",");
            };

        return path_segments.map(scale_segment).join("");
    }

    return {
        base: {
            path: scale_path(shape.base.path, factor),
            bottom: {
                x: scale(shape.base.bottom.x),
                y: scale(shape.base.bottom.y)
            },
            top: {
                x: scale(shape.base.top.x),
                y: scale(shape.base.top.y)
            }
        },
        bowl: {
            path: scale_path(shape.bowl.path, factor),
            bottom: {
                x: scale(shape.bowl.bottom.x),
                y: scale(shape.bowl.bottom.y)
            },
            top: {
                x: scale(shape.bowl.top.x),
                y: scale(shape.bowl.top.y)
            }
        },
        scale: scale_,
        factor: factor
    };
}

module.exports = {
    start: start_of_path,
    end: end_of_path,
    complete_path: complete_path,
    scale_shape: scale_shape
};
