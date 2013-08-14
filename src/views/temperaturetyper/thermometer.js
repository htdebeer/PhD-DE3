
var thermometer = function(canvas, dimensions_) {

    var dimensions = dimensions_ || {
        width: 60,
        height: 325,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };
    
    var THERMOMETER = {
        x: dimensions.margins.top,
        y: dimensions.margins.left,
        width: dimensions.width - dimensions.margins.left - dimensions.margins.right,
        height: dimensions.height - dimensions.margins.top - dimensions.margins.bottom,
        rounded_corners: dimensions.margins.top + dimensions.margins.left + dimensions.margins.bottom + dimensions.margins.right
    };

    var _thermometer = canvas.set(),
        background,
        empty_blob,
        mercury_blob,
        empty_bar,
        mercury_bar,
        scale;

    var 
        MERCURY_BAR_WIDTH = THERMOMETER.width / 8,
        PADDING = MERCURY_BAR_WIDTH * 3,
        BLOB = {
            x: THERMOMETER.x + THERMOMETER.width / 2,
            y: THERMOMETER.y + THERMOMETER.height - PADDING,
            r: MERCURY_BAR_WIDTH
        },
        BAR = {
            x: THERMOMETER.x + THERMOMETER.width / 2 - MERCURY_BAR_WIDTH / 2,
            y: THERMOMETER.y + PADDING,
            width: MERCURY_BAR_WIDTH,
            height: BLOB.y - (THERMOMETER.y + PADDING + BLOB.r),
            r: MERCURY_BAR_WIDTH/2
        },
        SCALE = BAR.height/120,
        BORDER = 1;
        


    background = canvas.rect(THERMOMETER.x, THERMOMETER.y, THERMOMETER.width, THERMOMETER.height, THERMOMETER.rounded_corners);
    background.attr({
        fill: "white",
        stroke: "dimgray",
        "stroke-width": 2
    });
    _thermometer.push(background);


    empty_blob = canvas.circle( BLOB.x, BLOB.y, BLOB.r + BORDER);
    empty_blob.attr({
        fill: "none",
        stroke: "gray",
        "stroke-width": 0.5
    });
    empty_bar = canvas.rect(BAR.x - BORDER, BAR.y - BORDER, BAR.width + BORDER * 2, BAR.height + (2 * BORDER), BAR.r);
    empty_bar.attr({
        fill: "none",
        stroke: "gray",
        "stroke-width": 0.5
    });

    mercury_blob = canvas.circle( BLOB.x, BLOB.y, BLOB.r );
    mercury_blob.attr({
        "fill": "red",
        "stroke": "none"
    });
    _thermometer.push(mercury_blob);

    mercury_bar = canvas.rect( BAR.x, BAR.y, BAR.width, BAR.height + BLOB.r, BAR.r);
    mercury_bar.attr( {
        "fill": "red",
        "stroke": "none"
    });
    _thermometer.push(mercury_bar);

    function set_temperature( temp ) {
        if (-20 <= temp && temp <= 100) {
            var height = SCALE * (temp + 20),
                y = BAR.y + BAR.height - height;

            mercury_bar.attr({
                y: y,
                height: height + BLOB.r
            });
        }
        return _thermometer;
    }

    _thermometer.set_temperature = set_temperature;
    
    _thermometer.set_temperature(22);


    scale = draw_scale();
    _thermometer.push(scale);

    function draw_scale() {
        var scale = canvas.set();

        
        var TEN_DEGREE_SIZE = (THERMOMETER.width / 2) - BAR.width,
            FIVE_DEGREE_SIZE = TEN_DEGREE_SIZE / 2,
            DEGREE_SIZE = FIVE_DEGREE_SIZE / 2,
            ten_degree_ticks = canvas.path(create_ticks_path(0, TEN_DEGREE_SIZE)),
            five_degree_ticks = canvas.path(create_ticks_path(SCALE*5, FIVE_DEGREE_SIZE));

        ten_degree_ticks.attr({
            "stroke-width": 1,
            "stroke": "dimgray"
        });
        scale.push(ten_degree_ticks);
        five_degree_ticks.attr({
            "stroke-width": 1,
            "stroke": "dimgray"
        });
        scale.push(five_degree_ticks);
        [1, 2, 3, 4, 6, 7, 8, 9].forEach(draw_degree_ticks);
        scale.push(draw_labels());
        scale.push(draw_unit());

        function draw_unit() {
            var x = THERMOMETER.x + THERMOMETER.width/2 - PADDING/4,
                y = THERMOMETER.y + PADDING/2,
                unit_label = canvas.text(x, y, "°C");

            unit_label.attr({
                "font-size": PADDING + "px",
                "font-family": "inherit"
            });

            return unit_label;
        }
        

        function draw_labels() {
            var labels = canvas.set();

            
            var TEN_DEGREES_IN_PX = SCALE * 10,
                degrees = -20,
                h = BAR.y + BAR.height,
                y_end = BAR.y,
                x_start = THERMOMETER.x + THERMOMETER.width - BAR.width - PADDING/3,
                label;

            while (h > y_end) {
                label = canvas.text(x_start, h, degrees);
                label.attr({
                    "text-anchor": "right",
                    "font-size": "" + PADDING/2 + "px",
                    "font-family": "inherit"
                });
                labels.push(label);
                h = h - TEN_DEGREES_IN_PX;
                degrees += 10;
            }

            return labels;
        }

        function draw_degree_ticks(step) {
              var degree_ticks = canvas.path(create_ticks_path(SCALE*step, DEGREE_SIZE));
              degree_ticks.attr({
                  "stroke-width": 0.5,
                  "stroke": "dimgray"
              });
              scale.push(degree_ticks);
        }

        function create_ticks_path(step, size) {
            var TEN_DEGREES_IN_PX = SCALE * 10,
                ticks_path;

            var h = BAR.y + BAR.height + step,
                y_end = BAR.y + TEN_DEGREES_IN_PX,
                x_start = THERMOMETER.x;

            while (h > y_end) {
                h = h - TEN_DEGREES_IN_PX;
                ticks_path += "M" + x_start + "," + h + "h" + size;
            }

            return ticks_path;
        }

        return scale;
    }


    _thermometer.set_temperature = set_temperature;

    return _thermometer;

};

module.exports = thermometer;
