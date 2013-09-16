
var view = require("./view"),
    dom = require("../dom/dom");


var motion_editor = function(config_) {
    var config = Object.create(config_);
    config.type = "motion_editor";
    var _editor = view(config);
    
    var dimensions = {
        width: config.dimensions.width,
        height: config.dimensions.height,
        margins: {
            top: 10,
            right: 20,
            left: 80,
            bottom: 80
        }
    };

    _editor.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "div",
            attributes: {
                "class": "motion_editor"
            },
            style: {
                visibility: "hidden",
                "z-index": 99,
                position: "absolute",
                top: "2em",
                left: "2em",
                right: "2em",
                width: "35em",
                padding: "1ex",
                background: "white",
                border: "dimgray 2px solid"
            }
        }));

    function show_editor() {
        _editor.fragment.style.visibility = "visible";
    }
    _editor.show = show_editor;

    function hide_editor() {
        _editor.fragment.style.visibility = "hidden";
    }
    _editor.hide = hide_editor;

    function active_keys(e) {
        var key = event.key || event.keyCode;
        if (key === 13 || key === 10 || key === "Enter") {
            // enter - key
            //event.preventDefault();
            return false;
        } else if (key === 9 || key === "Tab") {
            // tab - key
            var start = this.selectionStart,
                end = this.selectionEnd;

            var target = e.target;
            var value = target.value;

            target.value = value.substring(0, start)+ "\t" + value.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;

            event.preventDefault();
            return false;
        } 
    }

    var title, textarea, update_button, cancel_button;
    function create_editor() {
        title = _editor.fragment
            .appendChild(dom.create({
                name: "h2",
                value: "Stel de fietsroute in"
            }));

        textarea = _editor.fragment
            .appendChild(dom.create({
                name: "textarea",
                attributes: {
                    rows: 15,
                    cols: 70
                },
                on: {
                    type: "keydown",
                    callback: active_keys
                }
            }));

        var button_group = _editor.fragment
            .appendChild(dom.create({
                name: "p"
            }));

        update_button = button_group
            .appendChild(dom.create({
                name: "button",
                value: "Update"
            }));
        cancel_button = button_group
            .appendChild(dom.create({
                name: "button",
                value: "Annuleren",
                on: {
                    type: "click",
                    callback: function() {
                        console.log("geannuleerd");
                        _editor.hide();
                    }
                }
            }));
    }
    create_editor();

    function update_movement(model) {
        var listener = this;

        return function() {
            model.specification(textarea.value.trim());
            model.compute_maxima();
            _editor.hide();
            update_button.removeEventListener("click", listener);
        };
    }



    _editor.show_model = function(model) {
        title.innerHTML = "Stel de fietsroute van " + model.name.replace("_", " ") + " in";
        textarea.innerHTML = model.specification();
        update_button.addEventListener("click", update_movement(model));
        _editor.show();
    };


    return _editor;
};

module.exports = motion_editor;
