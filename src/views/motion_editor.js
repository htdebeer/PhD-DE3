
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
            }
        }));

    return _editor;
};

module.exports = motion_editor;
