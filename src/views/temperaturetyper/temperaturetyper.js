
var view = require("../view"),
    draw_thermometer = require("./thermometer"),
    dom = require("../../dom/dom");

var temperaturetyper = function(config, scale_, dimensions_) {
    
    var _temperaturetyper = view(config);

    var scale = scale_ || 4; // px per mm

    var dimensions = dimensions_ || {
        width: 300,
        height: 350,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };

    var CONTAINER = {
            width: dimensions.width,
            height: dimensions.height
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
                value: format_time(0) + "\t\t"
            }));




    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_temperaturetyper.fragment);

    var canvas = Raphael(measuring_simulation, 
            CONTAINER.width, 
            CONTAINER.height);
    
    var thermometer = draw_thermometer(canvas);


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
            
            this.value += "\n" + format_time(time) + "\t\t";
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
