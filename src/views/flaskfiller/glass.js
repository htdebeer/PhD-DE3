


var glass = function(canvas, model, SCALE) {
    var _glass = canvas.set();

    var GLASS_BORDER = 3;

    var x = 0, 
        y = 0, 
        width, 
        height;

    var PADDING = 5;
    var HANDLE_SPACE = 15,
        HANDLE_SIZE = 2.5;

    var fill, base_shape, bowl_shape, max_line, max_label, label, glass_pane, handle;

    function update() {
        style({
            color: model.color()
        });
        draw_at(x, y);
    }

    function style(config) {
        if (config.color) {
            fill.attr("fill", config.color);
        }
    }

    function draw() {
        label = canvas.text(x, y, model.get_maximum("volume") + " ml");
        label.attr({
        });
        _glass.push(label);
        fill = canvas.path(model.bowl_path(SCALE, true));
        fill.attr({
            fill: model.color(),
            stroke: "none",
            opacity: 0.4
        });
        _glass.push(fill);

        max_line = canvas.path("M0,0");
        max_line.attr({
            stroke: "dimgray",
            "stroke-width": 1
        });
        _glass.push(max_line);

        max_label = canvas.text(x, y, "max");
        max_label.attr({
            stroke: "none",
            fill: "dimgray",
            "font-family": "inherit",
            "font-size": "10pt"
        });
        _glass.push(max_label);

        bowl_shape = canvas.path(model.bowl_path(SCALE));
        bowl_shape.attr({
            "stroke": "black",
            "stroke-width": GLASS_BORDER,
            "fill": "none"
        });
        _glass.push(bowl_shape);  

        base_shape = canvas.path(model.base_path(SCALE));
        base_shape.attr({
            "stroke": "black",
            "stroke-width": GLASS_BORDER,
            "fill": "dimgray"
        });
        _glass.push(base_shape);  

        glass_pane = canvas.path(model.path(SCALE));
        glass_pane.attr({
            fill: "white",
            opacity: 0,
            stroke: "white",
            "stroke-opacity": 0,
            "stroke-width": GLASS_BORDER
        });
        _glass.push(glass_pane);


        update_size();

        handle = canvas.circle( 
                x + width + HANDLE_SPACE, 
                y - HANDLE_SPACE, 
                HANDLE_SIZE);
        handle.attr({
            fill: "silver",
            "stroke": "silver"
        });
        handle.hide();
        handle.hover(enable_resizing, disable_resizing);
        handle.drag(sizemove, sizestart, sizestop);


        _glass.push(handle);

        set_label();

        glass_pane.hover(onhover, offhover);
        glass_pane.drag(onmove, onstart, onend);

        glass_pane.dblclick(run_pause);
    }

    function run_pause() {
        if (model.is_finished()) {
            model.action("reset").callback(model)();
        } else {
            model.action("start").callback(model)();
        }
    }

    function set_label(x, y) {
        if (model.type === "longdrinkglas") {
            model.compute_maxima();
        }
        label.attr({
            x: x + width/2,
            y: y + height/2,
            "font-size": compute_font_size(),
            text: model.get_maximum("volume") + " ml"
        });
        function compute_font_size() {
            return Math.max((((width -2*PADDING)/ ((model.get_maximum("volume") + "").length + 3)) - PADDING), 8) + "px";
        }
    }
    _glass.set_label = set_label;

    function update_size() {
        var bbox = glass_pane.getBBox();

        width = bbox.width;
        height = bbox.height;
    }


    var delta_x = 0, delta_y = 0;
    function onmove(dx, dy) {
        delta_x = dx;
        delta_y = dy;
        draw_at(x+dx, y+dy);
        return;
    }

    function onstart(x, y, event) {
        model.action("pause").callback(model)();
        delta_x = 0;
        delta_y = 0;
    }

    function onend(event) {
        x += delta_x;
        y += delta_y;
    }

    function onhover() {
        _glass.attr({
            "cursor": "move"
        });
    }

    function offhover() {
        delta_x = delta_y = 0;
        _glass.attr({
            "cursor": "default"
        });
    }

    var old_height, old_radius;
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
            draw_at(x, y+dy);
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
        y += delta_y;
    }


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

    function draw_at(x, y) {

        _glass.fill.attr({path: model.bowl_path(SCALE, true, x, y)});
        _glass.bowl_shape.attr({path: model.bowl_path(SCALE, false, x, y)});
        _glass.base_shape.attr({path: model.base_path(SCALE, false, x, y)});
        _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
        update_size();
        var MAX_LINE_WIDTH = Math.min(30, width / 2),
            MAX_LINE_SKIP = 5,
            MAX_LINE_Y = y + height - model.get_maximum("hoogte") * 10 * SCALE;
        _glass.max_line.attr({
            path: "M" + x + "," + MAX_LINE_Y + 
                "h" + MAX_LINE_WIDTH
        });
        _glass.max_label.attr({
            x: x + MAX_LINE_WIDTH / 1.5,
            y: MAX_LINE_Y - MAX_LINE_SKIP            
        });
        _glass.handle.attr({
            cx: x + width + HANDLE_SPACE, 
            cy: y - HANDLE_SPACE
        });
        set_label(x, y);
    }


    function update_color() {
        fill.attr("fill", model.color());
    }


    draw();
    _glass.height = height;
    _glass.width = width;
    _glass.x = x;
    _glass.y = y;
    _glass.draw = draw;
    _glass.update = update;
    _glass.update_color = update_color;
    _glass.fill = fill;
    _glass.bowl_shape = bowl_shape;
    _glass.base_shape = base_shape;
    _glass.max_line = max_line;
    _glass.max_label = max_label;
    _glass.glass_pane = glass_pane;
    _glass.handle = handle;
    return _glass;
};

module.exports = glass;
