
var mg_util = {};
mg_util.distance_units_conversion_table = {
    "mm": {
        "mm": function(distance) {
            return distance;
        },
        "cm": function(distance) {
            return distance/10;
        },
        "m": function(distance) {
            return distance/1000;
        },
        "km": function(distance) {
            return distance/1000000;
        }
    },
    "cm": {
        "mm": function(distance) {
            return distance*10;
        },
        "cm": function(distance) {
            return distance;
        },
        "m": function(distance) {
            return distance/100;
        },
        "km": function(distance) {
            return distance/100000;
        }
    },
    "m": {
        "mm": function(distance) {
            return distance*1000;
        },
        "cm": function(distance) {
            return distance*100;
        },
        "m": function(distance) {
            return distance;
        },
        "km": function(distance) {
            return distance/1000;
        }
    },
    "km": {
        "mm": function(distance) {
            return distance*1000000;
        },
        "cm": function(distance) {
            return distance*100000;
        },
        "m": function(distance) {
            return distance*1000;
        },
        "km": function(distance) {
            return distance;
        }
    }
};

mg_util.is_distance_unit = function(unit) {
    return Object.keys(distance_units_conversion_table).indexOf(unit) !== -1;
};

mg_util.convert_distance = function(distance, from_unit, to_unit) {
    return mg_util.distance_units_conversion_table[from_unit][to_unit](distance);
};

mg_util.time_units_conversion_table = {
    "ms": {
        "ms": function(time) {
            return time;
        },
        "sec": function(time) {
            return time/1000;
        },
        "min": function(time) {
            return time/60000;
        },
        "uur": function(time) {
            return time/3600000;
        }
    },
    "sec": {
        "ms": function(time) {
            return time*1000;
        },
        "sec": function(time) {
            return time;
        },
        "min": function(time) {
            return time/60;
        },
        "uur": function(time) {
            return time/3600;
        }
    },
    "min": {
        "ms": function(time) {
            return time*60000;
        },
        "sec": function(time) {
            return time*60;
        },
        "min": function(time) {
            return time;
        },
        "uur": function(time) {
            return time/60;
        }
    },
    "uur": {
        "ms": function(time) {
            return time*3600000;
        },
        "sec": function(time) {
            return time*3600;
        },
        "min": function(time) {
            return time*60;
        },
        "uur": function(time) {
            return time;
        }
    }
};

mg_util.is_time_unit = function(unit) {
    return Object.keys(time_units_conversion_table).indexOf(unit) !== -1;
};

mg_util.convert_time = function(time, from_unit, to_unit) {
        return mg_util.time_units_conversion_table[from_unit][to_unit](time);
};

mg_util.time_to_seconds = function(time, from_unit) {
        return mg_util.convert_time(time, from_unit, "sec");
};

module.exports = mg_util;
