
var ruler = function(canvas, config, MEASURE_LINE_WIDTH) {
    var _ruler = canvas.set();

    var x = config.x || 0,
        y = config.y || 0,
        width = config.width || 50,
        height = config.height || 500,
        scale = config.scale || 2,
        orientation = config.orientation || "vertical";

    var background,
        ticks,
        labels,
        measure_line,
        glass_pane;

    draw();
    style({
        background: "yellow",
        stroke: "dimgray",
        stroke_width: 2,
        font_size: "12pt"
    });


    function move_measuring_line(e, x_, y_) {
        var path;

        var svgbb = canvas.canvas.getBoundingClientRect(),
            plus_left = svgbb.left +  window.pageXOffset,
            plus_top = svgbb.top + window.pageYOffset;

        if (orientation === "horizontal") {
            path = "M" + (x_ - plus_left) + "," + (y + height) + "v-" + MEASURE_LINE_WIDTH;
        } else {
            path = "M" + x + "," + (y_ - plus_top) + "h" + MEASURE_LINE_WIDTH;
        }
        measure_line.attr({
            "path": path
        });
    }

    function show_measuring_line() {
        glass_pane.mousemove(move_measuring_line);
        measure_line.show();
    }

    function hide_measuring_line() {
        glass_pane.unmousemove(move_measuring_line);
        measure_line.hide();
    }

    
    function draw() {
        background = canvas.rect(x, y, width, height);
        _ruler.push(background);
        _ruler.push(draw_ticks());
        _ruler.push(draw_labels());
        measure_line = canvas.path("M0,0");
        measure_line.attr({
            stroke: "crimson",
            "stroke-width": 2,
            "stroke-opacity": 0.5
        });
        _ruler.push(measure_line);
        measure_line.hide();
        glass_pane = canvas.rect(x, y, width, height);
        glass_pane.attr({
            fill: "white",
            opacity: 0,
            stroke: "white",
            "stroke-opacity": 0
        });
        _ruler.push(glass_pane);

        glass_pane.mouseover(show_measuring_line);
        glass_pane.mouseout(hide_measuring_line);

        function draw_labels() {
            labels = canvas.set();
            
            var ONE_CM_IN_PX = scale * 10,
                cm = 0;

            if (orientation === "vertical") {
                var h = y + height,
                    y_end = y + ONE_CM_IN_PX,
                    x_start = x + (width/4);

                while (h > y_end) {
                    h = h - ONE_CM_IN_PX;
                    cm++;
                    labels.push(canvas.text(x_start, h, cm));
                }
            } else {
                var w = x,
                    x_end = x + width - ONE_CM_IN_PX,
                    y_start = y + (height/(4/3));

                while (w < x_end) {
                    w = w + ONE_CM_IN_PX;
                    cm++;
                    labels.push(canvas.text(w, y_start, cm));
                }
            }


            return labels;
        }

        function draw_ticks() {
            var CM_SIZE = 13,
                HALF_CM_SIZE = 8,
                MM_SIZE = 5,
                cm_ticks = canvas.path(create_ticks_path(0, CM_SIZE)),
                half_cm_ticks = canvas.path(create_ticks_path(scale*5, HALF_CM_SIZE));

            ticks = canvas.set();
            cm_ticks.attr("stroke-width", 1);
            ticks.push(cm_ticks);
            half_cm_ticks.attr("stroke-width", 1);
            ticks.push(half_cm_ticks);
            [1, 2, 3, 4, 6, 7, 8, 9].forEach(draw_mm_ticks);

            function draw_mm_ticks(step) {
                  var mm_ticks = canvas.path(create_ticks_path(scale*step, MM_SIZE));
                  mm_ticks.attr("stroke-width", 0.5);
                  ticks.push(mm_ticks);
            }

            function create_ticks_path(step, size) {
                var ONE_CM_IN_PX = scale * 10,
                    ticks_path;
                if (orientation === "vertical") {
                    var h = y + height + step,
                        y_end = y + ONE_CM_IN_PX,
                        x_start = x + width;

                    while (h > y_end) {
                        h = h - ONE_CM_IN_PX;
                        ticks_path += "M" + x_start + "," + h + "h-" + size;
                    }
                } else {
                    var w = x - step,
                        x_end = x + width - ONE_CM_IN_PX,
                        y_start = y;

                    while (w < x_end) {
                        w = w + ONE_CM_IN_PX;
                        ticks_path += "M" + w + "," + y_start + "v" + size;
                    }
                }

                return ticks_path;
            }

            return ticks;
        }

    }

    function style(config) {
        if (config.background) {
            background.attr("fill", config.background);
        }
        if (config.stroke) {
            background.attr("stroke", config.stroke);
            ticks.attr("stroke", config.stroke);

        }
        if (config.stroke_width) {
            background.attr("stroke-width", config.stroke_width);
        }
        if (config.font_size) {
            labels.attr("font-size", config.font_size);
        }
        if (config.font_family) {
            labels.attr("font-family", config.font_family);
        }

        return _ruler;
    }

    _ruler.style = style;

    return _ruler;

};

module.exports = ruler;
