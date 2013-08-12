
var ruler = function(canvas, config) {
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
        glass_pane;

    draw();
    style({
        background: "yellow",
        stroke: "dimgray",
        stroke_width: 2,
        font_size: "12pt"
    });


    
    function draw() {
        background = canvas.rect(x, y, width, height);
        _ruler.push(background);
        _ruler.push(draw_ticks());
        _ruler.push(draw_labels());
        glass_pane = canvas.rect(x, y, width, height);
        glass_pane.attr({
            fill: "white",
            opacity: 0,
            stroke: "white",
            "stroke-opacity": 0
        });
        _ruler.push(glass_pane);

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
