


var glass = function(canvas, model) {
    var _glass = canvas.set();

    var GLASS_BORDER = 3;

    var fill, glass_shape, glass_pane;

    function update() {
        draw();
        style(model.color());
    }

    function style(config) {
        if (config.color) {
            fill.attr("fill", config.color);
        }
    }
    
    function draw() {
        fill = canvas.path(glass_shape_path());
        fill.attr({
            fill: color,
            stroke: "none",
            opacity: 0.4
        });
        _glass.push(fill);

        glass_shape = canvas.path(glass_shape_path());
        glass_shape.attr({
            "stroke": "dimgray",
            "stroke-width": GLASS_BORDER,
            "fill": "none"
        });
        _glass.push(glass_shape);  

        glass_pane = cavas.path(glass_shape_path());
        glass_pane.attr({
            fill: "white",
            opacity: 1,
            stroke: "white",
            opactity: 1,
            "stroke-width": GLASS_BORDER
        });
        _glass.push(glass_pane);
    }

    function glass_shape_path(fill) {
        var path = "";
        path = "M0,0v100h50v-100";
        return path;
    }

    _glass.draw = draw;
    _glass.update = update;
    _glass.fill = fill;
    _glass.glass_shape = glass_shape;
    _glass.glass_pane = glass_pane;
    return _glass;
};

module.exports = glass;
