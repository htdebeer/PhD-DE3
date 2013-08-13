
var view = require("../view"),
    dom = require("../../dom/dom"),
    raphael = require("raphael-browserify");

var temperaturetyper = function(config, scale_, dimensions_) {
    
    var _temperaturetyper = view(config);

    var scale = scale_ || 4; // px per mm

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

    var CONTAINER = {
            width: dimensions.width || 100,
            height: dimensions.height || 320
        };

    var THERMOMETER = {
        x: dimensions.margins.top,
        y: dimensions.margins.left,
        width: CONTAINER.width - dimensions.margins.left - dimensions.margins.right,
        height: CONTAINER.height - dimensions.margins.top - dimensions.margins.bottom,
        rounded_corners: dimensions.margins.top + dimensions.margins.left + dimensions.margins.bottom + dimensions.margins.right
    };

    _temperaturetyper.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "temperaturetyper"
            }
        }));


    var message = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "div",
                attributes: {
                    "class": "message"
                },
                value: "Activate to start measuring"
            }));
    var measuring_container = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "div",
                attributes: {
                    "class": "container"
                }
            }));
    measuring_container.style.height = CONTAINER.height;
    measuring_container.style.width = CONTAINER.width;

    var measuring_simulation = measuring_container.appendChild(
            dom.create({
                name: "figure",
                attributes: {
                    "class": "simulation"
                }
            }));

    var measuring_data = measuring_container.appendChild(
            dom.create({
                name: "textarea",
                attributes: {
                    "class": "data",
                    "cols": 25,
                    "rows": 20
                },
                style: {
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                },
                on: {
                    type: "keydown",
                    callback: add_new_measurement
                },
                value: format_time(0) + "\t"
            }));




    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_temperaturetyper.fragment);

    var canvas = raphael(measuring_simulation, 
            CONTAINER.width, 
            CONTAINER.height);

    var thermometer = draw_thermometer();



    function draw_thermometer() {
        var thermometer = canvas.set(),
            background,
            empty_blob,
            mercury_blob,
            empty_bar,
            mercury_bar,
            scale;

        var 
            MERCURY_BAR_WITH = THERMOMETER.width / 8,
            PADDING = MERCURY_BAR_WITH * 3,
            BLOB = {
                x: THERMOMETER.x + THERMOMETER.width / 2,
                y: THERMOMETER.y + THERMOMETER.height - PADDING,
                r: MERCURY_BAR_WITH
            },
            BAR = {
                x: THERMOMETER.x + THERMOMETER.width / 2 - MERCURY_BAR_WITH / 2,
                y: THERMOMETER.y + PADDING,
                width: MERCURY_BAR_WITH,
                height: BLOB.y - (THERMOMETER.y + PADDING + BLOB.r),
                r: MERCURY_BAR_WITH/2
            },
            SCALE = BAR.height/120,
            BORDER = 1;
            


        background = canvas.rect(THERMOMETER.x, THERMOMETER.y, THERMOMETER.width, THERMOMETER.height, THERMOMETER.rounded_corners);
        background.attr({
            fill: "white",
            stroke: "dimgray",
            "stroke-width": 2
        });
        thermometer.push(background);


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
        thermometer.push(mercury_blob);

        mercury_bar = canvas.rect( BAR.x, BAR.y, BAR.width, BAR.height + BLOB.r, BAR.r);
        mercury_bar.attr( {
            "fill": "red",
            "stroke": "none"
        });
        thermometer.push(mercury_bar);

        function set_temperature( temp ) {
            if (-20 <= temp && temp <= 100) {
                var height = SCALE * (temp + 20),
                    y = BAR.y + BAR.height - height;

                mercury_bar.attr({
                    y: y,
                    height: height + BLOB.r
                });
            }
            return thermometer;
        }

        thermometer.set_temperature = set_temperature;
        
        thermometer.set_temperature(22);


        scale = draw_scale();
        thermometer.push(scale);

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




        return thermometer;
    }

    var time = 0;
    function format_time(time) {
        // time in 0.1 seconds
        var seconds,
            minutes = "00",
            milliseconds;

        if (time >= 600) {
            minutes = ("0" + Math.floor((time / 600))).substr(-2);
        }
        seconds = ("0" + Math.floor((time % 600) / 10)).substr(-2);
        milliseconds = ((time % 600) % 10);

        return "" + minutes + ":" + seconds + "," + milliseconds;
    }

    function add_new_measurement(event) {
        var key = event.key || event.keyCode;
        if (key === 13 || key === 10 || key === "Enter") {
            // enter - key
            event.preventDefault();
            time++;
            var lastline = this.value.substr(this.value.lastIndexOf("\n")+1),
                temperature = parseFloat(lastline.substr(lastline.lastIndexOf("\t")+1));
            if (!isNaN(temperature)) {
                if (-20 <= temperature && temperature <= 100) {
                    thermometer.set_temperature(temperature);
                }
            }
            
            this.value += "\n" + format_time(time) + "\t";
            return false;
        } else if (key === 9 || key === "Tab") {
            // tab - key
            event.preventDefault();
            this.value += "\t";
            return false;
        } 
    }

    _temperaturetyper.update = function(model_name) {
    };

    _temperaturetyper.remove = function(model_name) {
    };



    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_temperaturetyper.fragment);
    return _temperaturetyper;

};

module.exports = temperaturetyper;
