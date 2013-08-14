


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

    var fill, glass_shape, label, glass_pane;

    function update() {
        style({
            color: model.color()
        });
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
        _glass.transform("...T" + dx + "," + dy );
        x = new_x;
        y = new_y;
        return _glass;
    }

    function move_to(new_x, new_y) {
        // check x and y
        var delta_x = new_x - x,
            delta_y = new_y - y;
        _glass.transform("...t" + delta_x + "," + delta_y );
        x += delta_x;
        y += delta_y;
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
        set_label();

        glass_pane.hover(onmovehover, offmovehover);
        move_by(BOUNDARIES.left - 10, BOUNDARIES.bottom + 10);

    }

    function set_label() {
        update_size();
        model.compute_maxima();
        label.attr({
            x: width/2,
            y: height/2,
            "font-size": compute_font_size(),
            text: model.get_maximum("volume") + " ml"
        });
        function compute_font_size() {
            return Math.max((((width -2*PADDING)/ ((model.get_maximum("volume") + "").length + 3)) - PADDING), 8) + "px";
        }
    }
    _glass.set_label = set_label;

    function update_size() {
        var bbox = _glass.getBBox();

        width = bbox.width;
        height = bbox.height;
    }

    function make_moveable() {
        _glass.drag(onmove, onstart, onend);
    }
    _glass.make_moveable = make_moveable;

    function make_unmoveable() {
        _glass.undrag();
    }
    _glass.make_unmoveable = make_unmoveable;

    var delta_x, delta_y;
    function onmove(dx, dy, x, y, event) {
        var ddx = dx - delta_x,
            ddy = dy - delta_y;

        move_by(ddx, ddy);
        delta_x = dx;
        delta_y = dy;
    }

    function onstart(x, y, event) {
        delta_x = delta_y = 0;
        glass_pane.unhover(onmovehover, offmovehover);
    }

    function onend(event) {
        glass_pane.hover(onmovehover, offmovehover);
    }

    function onmovehover() {
        _glass.attr({
            "cursor": "move"
        });
        make_moveable();
    }

    function offmovehover() {
        make_unmoveable();
        delta_x = delta_y = 0;
        _glass.attr({
            "cursor": "default"
        });
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
    _glass.move_to = move_to;
    _glass.move_by = move_by;
    return _glass;
};

module.exports = glass;
