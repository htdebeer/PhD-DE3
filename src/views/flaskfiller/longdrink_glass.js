
var glass = require("./glass");

var longdrink_glass = function(canvas, model, SCALE, boundaries_) {
    var HANDLE_SPACE = 15,
        HANDLE_SIZE = 2.5;

    var PADDING = 5;

    var _glass = glass(canvas, model, SCALE, boundaries_);

    _glass.handle = canvas.circle( 
            _glass.x + _glass.width + HANDLE_SPACE, 
            _glass.y - HANDLE_SPACE, 
            HANDLE_SIZE);
    _glass.handle.attr({
        fill: "silver",
        "stroke": "silver"
    });
    _glass.push(_glass.handle);
    _glass.handle.hover(enable_resizing, disable_resizing);
    _glass.handle.drag(sizemove, sizestart, sizestop);

    var old_height, old_radius, delta_x, delta_y;
    function sizemove(dx, dy) {
        var 
            d_height = dy / SCALE / 10,
            d_radius = dx / 2 / SCALE / 10,
            new_radius = old_radius + d_radius,
            new_height = old_height - d_height,
            area = Math.PI * new_radius * new_radius;


        if (area*new_height >= 5){
            delta_y = dy;
            model.height(new_height);
            model.radius(new_radius);
            _glass.draw_at(_glass.x, _glass.y+dy);
        }

    }

    function sizestart() {
        delta_x = 0;
        delta_y = 0;
        old_height = model.height();
        old_radius = model.radius();
        model.action("reset").callback(model)();
    }

    function sizestop() {
        _glass.y += delta_y;
    }


    function enable_resizing() {
        _glass.handle.attr({
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
    }

    function disable_resizing() {
        _glass.handle.attr({
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

    function update_size() {
        var bbox = _glass.glass_pane.getBBox();

        _glass.width = bbox.width;
        _glass.height = bbox.height;
    }

    _glass.draw_at = function (x, y) {

        _glass.fill.attr({path: model.bowl_path(SCALE, true, x, y)});
        _glass.bowl_shape.attr({path: model.bowl_path(SCALE, false, x, y)});
        _glass.base_shape.attr({path: model.base_path(SCALE, x, y)});
        _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
        update_size();
        var MAX_LINE_WIDTH = Math.min(30, _glass.width / 2),
            MAX_LINE_SKIP = 5,
            MAX_LINE_Y = y + _glass.height - model.get_maximum("hoogte") * 10 * SCALE;
        _glass.max_line.attr({
            path: "M" + x + "," + MAX_LINE_Y + 
                "h" + MAX_LINE_WIDTH
        });
        _glass.max_label.attr({
            x: x + MAX_LINE_WIDTH / 1.5,
            y: MAX_LINE_Y - MAX_LINE_SKIP            
        });

        _glass.handle.attr({
            cx: x + _glass.width + HANDLE_SPACE, 
            cy: y - HANDLE_SPACE
        });
        _glass.set_label(x, y);
    };

    _glass.set_label = function(x_, y_) {
        var x = x_, y = y_;
        model.compute_maxima();
        _glass.label.attr({
            x: x + _glass.width / 2,
            y: y + _glass.height/2,
            "font-size": compute_font_size(),
            text: model.get_maximum("volume") + " ml"
        });
        function compute_font_size() {
            return Math.max((((_glass.width - 2*PADDING)/ ((model.get_maximum("volume") + "").length + 3)) - PADDING), 8) + "px";
        }
    };



    return _glass;
};

module.exports = longdrink_glass;
