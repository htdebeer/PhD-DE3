


var glass = function(canvas, model, SCALE, boundaries_) {
    var _glass = canvas.set();

    var GLASS_BORDER = 3;

    var x = 0, 
        y = 0, 
        width, 
        height;

    var BOUNDARIES = boundaries_ || {
            left: 0,  
            right: canvas.width,
            top: 0,
            bottom: canvas.height
    },
        PADDING = 5;
    var HANDLE_SPACE = 15,
        HANDLE_SIZE = 2.5;

    var fill, glass_shape, label, glass_pane, handle;

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

    function move_by(dx, dy) {
        var new_x = x + dx,
            new_y = y + dy;
        if (new_x <= BOUNDARIES.left) {
            dx = BOUNDARIES.left - x;
            new_x = BOUNDARIES.left;
        }
        if (new_y <= BOUNDARIES.top) {
            dy = BOUNDARIES.top - y;
            new_y = BOUNDARIES.top;
        }
        if (BOUNDARIES.right <= (new_x + width)) {
            dx = BOUNDARIES.right - (x + width);
            new_x = BOUNDARIES.right - width;
        }
        if (BOUNDARIES.bottom <= (new_y + height)) {
            dy = BOUNDARIES.bottom - (y + height);
            new_y = BOUNDARIES.bottom - height;
        }
        _glass.transform("...t" + dx + "," + dy );
        x = new_x;
        y = new_y;
        return _glass;
    }

    function draw() {
        label = canvas.text(x, y, model.get_maximum("volume") + " ml");
        label.attr({
        });
        _glass.push(label);
        fill = canvas.path(model.path(SCALE, true));
        fill.attr({
            fill: model.color(),
            stroke: "none",
            opacity: 0.4
        });
        _glass.push(fill);

        glass_shape = canvas.path(model.path(SCALE));
        glass_shape.attr({
            "stroke": "black",
            "stroke-width": GLASS_BORDER,
            "fill": "none"
        });
        _glass.push(glass_shape);  


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
    }

    function set_label(x, y) {
        model.compute_maxima();
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
            d_radius = dx / 2 / SCALE ,
            new_radius = old_radius + d_radius,
            new_height = old_height - d_height;

        if (new_height >= 1 && new_radius >= 1){
            model.height(new_height);
            model.radius(new_radius);
            model.update_views();
        }

    }

    function sizestart() {
        delta_x = 0;
        delta_y = 0;
        old_height = model.height();
        old_radius = model.radius();
    }

    function sizestop(event) {
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
        _glass.fill.attr({path: model.path(SCALE, true, x, y)});
        _glass.glass_shape.attr({path: model.path(SCALE, false, x, y)});
        _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
        update_size();
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
    _glass.glass_shape = glass_shape;
    _glass.glass_pane = glass_pane;
    _glass.handle = handle;
    return _glass;
};

module.exports = glass;
