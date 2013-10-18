
var view = require("../view"),
    draw_thermometer = require("./thermometer"),
    data_util = require("../../data/util"),
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


    var title = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "h2",
                attributes: {},
                value: "Meet de temperatuur met een sensor"
            }));

    var metadata_form = _temperaturetyper.fragment.appendChild(
        dom.create({
            name: "form",
            attributes: {
                action: "/",
                method: "POST",
                "class": "metadata"
            },
            style: {
                "border-bottom": "1px solid dimgray",
                "padding-bottom": "1ex"
            }
        }));

    var name_label = metadata_form.appendChild(
        dom.create({
            name: "label",
            attributes: {
                "for": "name"
            },
            value: "Naam"
        }));
    var name_field = metadata_form.appendChild(
        dom.create({
            name: "input",
            attributes: {
                id: "name",
                type: "text",
                size: "30",
                placeholder: "Geef deze meting een naam"
            }            
        }));

    metadata_form.appendChild(
            dom.create({
                name: "br"
            }));

    var description_label = metadata_form.appendChild(
        dom.create({
            name: "label",
            attributes: {
                "for": "description"
            },
            value: "Omschrijving"
        }));
    var description_field = metadata_form.appendChild(
        dom.create({
            name: "input",
            attributes: {
                id: "description",
                type: "text",
                size: "30",
                placeholder: "Type hier een korte omschrijving"
            }            
        }));

    var message = metadata_form.appendChild(
            dom.create({
                name: "p",
                attributes: {
                    "class": "message"
                },
                value: "Geef deze meting een naam en een korte omschrijving en klik de Startknop om te beginnen met meten. Let op, verbind de sensor nog <strong>niet</strong> met de computer!"
            }));

    var start_button = metadata_form.appendChild(
            dom.create({
                name: "button",
                attributes: {
                    id: "start_measurement_button"
                },
                value: "Start meten",
                on: {
                    type: "click",
                    callback: start_measuring
                }
            }));

    var stop_button = metadata_form.appendChild(
            dom.create({
                name: "button",
                attributes: {
                    id: "stop_measurement_button",
                    disabled: true
                },
                value: "Stop meten",
                on: {
                    type: "click",
                    callback: stop_measuring
                }
            }));

    var measuring_container = _temperaturetyper.fragment.appendChild(
            dom.create({
                name: "div",
                attributes: {
                    "class": "container"
                },
                style: {
                    "margin": "1ex",
                    "padding": "1ex"
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
                    "rows": 20,
                    "readonly": true
                },
                style: {
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                },
                on: {
                    type: "keydown",
                    callback: add_new_measurement
                }
            }));




    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_temperaturetyper.fragment);

    var canvas = Raphael(measuring_simulation, 
            CONTAINER.width, 
            CONTAINER.height);
    
    var thermometer = draw_thermometer(canvas);

    var measurement_buffer = [];
    function add_new_measurement(event) {
        var key = event.key || event.keyCode;
        if (key === 13 || key === 10 || key === "Enter") {
            // enter - key
            event.preventDefault();
            var lastline = this.value.substr(this.value.lastIndexOf("\n")+1),
                temperature = parseFloat(lastline.substr(lastline.lastIndexOf(";")+1));
            if (!isNaN(temperature)) {
                if (-20 <= temperature && temperature <= 100) {
                    thermometer.set_temperature(temperature);
                }
                measurement_buffer.push(lastline);
            }
            this.value += "\n";
            return false;
        } else if (key === 9 || key === "Tab") {
            // tab - key
            event.preventDefault();
            this.value += "\t";
            return false;
        } 
    }

    var upload_interval;
    var can_upload = false;
    function upload_measurements() {
        if (can_upload && measurement_buffer.length > 0) {
            var upload_buffer = measurement_buffer.slice(0);
            measurement_buffer = [];
            data_util.update(upload_buffer);
        }
    }

    function start_measuring() {
        var data = {};
        data.name = name_field.value;
        data.description = description_field.value;
        data.quantities = [];
        Object.keys(config.quantities).forEach(function(q) {
            data.quantities.push(config.quantities[q]);
        });
        data.format = "SSV"; // semicolon separated values

        if (data.name && data.name !== "") {
            name_field.setAttribute("readonly", true);
            description_field.setAttribute("readonly", true);
            message.classList.remove("error");
            stop_measurement_button.removeAttribute("disabled");
            start_measurement_button.setAttribute("disabled", true);
            message.innerHTML = "Verbind de sensor met de computer. <strong>Blijf tijdens het meten af van het toetsenbord en de muis</strong>, behalve om de meting te stoppen met behulp van de Stopknop";

            measuring_data.removeAttribute("readonly");
            measuring_data.focus();
            data_util.create(data, function() {
                can_upload = true;
            });
            upload_interval = setInterval(upload_measurements, 30000);
        } else {
            message.classList.add("error");
            message.innerHTML = "Geef de meting een naam.";
        }

    }

    function stop_measuring() {
        measuring_data.setAttribute("readonly", true);
        message.classList.remove("error");
        stop_measurement_button.setAttribute("disabled", true);
        message.innerHTML = "Haal de sensor uit de computer. De meting wordt opgeslagen op de server ...";
        clearInterval(upload_interval);
        upload_measurements();
        can_upload = false;
        data_util.close(
                function(url) {
                    message.innerHTML = "De meting is opgeslagen en kan worden opgevraagd als een <a href='http://primarycalculus.org/DOEN/" + url + "'>databestand</a> of ingelezen worden als een <a href='temperatuurgrafiek.html'>temperatuurgrafiek</a>.";
                }
        );
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
