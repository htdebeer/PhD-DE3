
var glass = require("./glass");

var longdrink_glass = function(canvas, model, SCALE, boundaries_) {
    var _glass = glass(canvas, model, SCALE, boundaries_);

    var HANDLE_SPACE = 5,
        HANDLE_SIZE = 2.5,
        handle = canvas.circle( 
                _glass.x + _glass.width + HANDLE_SPACE, 
                _glass.y - HANDLE_SPACE, 
                HANDLE_SIZE);
    _glass.push(handle);

    handle.attr({
        fill: "silver",
        "stroke": "silver"
    });
    handle.hover(enable_resizing, disable_resizing);

    function enable_resizing() {
        handle.attr({
            fill: "yellow",
            stroke: "black",
            "stroke-width": 2,
            r: HANDLE_SIZE * 1.5,
            cursor: "nesw-resize"
        });
        _glass.glass_pane.attr({
            fill: "lightyellow",
            opacity: 0.7
        });
        handle.drag(sizemove, sizestart, sizestop); 
    }

    function disable_resizing() {
        handle.attr({
            fill: "silver",
            stroke: "silver",
            "stroke-width": 1,
            r: HANDLE_SIZE,
            cursor: "default"
        });
        _glass.glass_pane.attr({
            fill: "white",
            opacity: 0
        });
    }



    var delta_x = 0, delta_y = 0;

    function sizemove(dx, dy, x, y, event) {
        var ddx = dx - delta_x,
            ddy = dy - delta_y,
            d_height = ddy / SCALE / 10,
            d_radius = ddx / 2 / SCALE / 10,
            new_radius = model.radius() + d_radius,
            new_height = model.height()  - d_height,
            new_y = y + ddy;


        if (new_height >= 1 && new_radius >= 1){
            model.height(new_height);
            model.radius(new_radius);
            _glass.move_by(0, ddy);
            model.update_views();
        }

        delta_x = dx;
        delta_y = dy;
    }

    function sizestart(x, y, event) {
        delta_x = 0;
        delta_y = 0;
    }

    function sizestop(event) {
        handle.undrag();
    }


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
        _glass.glass_shape.attr({
            path: model.path(SCALE)
        });
        _glass.fill.attr({
            path: model.path(SCALE, true)
        });
        _glass.glass_pane.attr({
            path: model.path(SCALE)
        });
        update_size();
        handle.attr({
            cx: _glass.x + _glass.width + HANDLE_SPACE, 
            cy:  _glass.y - HANDLE_SPACE
        });

        _glass.set_label();

        
    }


    _glass.update = update;

    return _glass;
};

module.exports = longdrink_glass;
