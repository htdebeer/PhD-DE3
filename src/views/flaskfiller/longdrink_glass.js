
var glass = require("./glass");

var longdrink_glass = function(canvas, model, SCALE, boundaries_) {
    var _glass = glass(canvas, model, SCALE, boundaries_);
    _glass.handle.show();







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

    function update_size() {
        var bbox = _glass.glass_pane.getBBox();

        _glass.width = bbox.width;
        _glass.height = bbox.height;
    }

    function update() {
    }


    //_glass.update = update;

    return _glass;
};

module.exports = longdrink_glass;
