
var glass = require("./glass");

var longdrink_glass = function(canvas, model) {
    var _glass = glass(canvas, model);


    var height = model.height,
        radius = model.radius,
        flow_rate = model.flow_rate,
        color = model.color || "blue";


    function set_height(h) {
        model.height(h);
        height = h;
        update();
    }

    function set_radius(r) {
        model.radius(r);
        radius = r;
        update();
    }



    function update() {
    }

    _glass.draw = draw;
    _glass.update = update;

    return _glass;
};

module.exports = longdrink_glass;
