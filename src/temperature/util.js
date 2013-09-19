
var utils = {};

utils.parse_data = function(data) {

    function parse_time(time) {
        var parts = time.split(":"),
            minutes = parseInt(parts[0], 10),
            seconds_parts = parts[1].split("."),
            seconds = parseInt(seconds_parts[0], 10),
            milliseconds = parseInt(seconds_parts[1], 10);

        return (minutes*60 + seconds)*1000 + milliseconds*100;
    }

    function measurements(line) {
        var parts = line.trim().split(/\t| {2,}/),
            time_part = parts[0],
            temp_part = parts[1];

        return {
            tijd: parse_time(time_part),
            temperatuur: parseFloat(temp_part)
        };
    }

    function no_comments(line) {
        return line.trim().charAt(0) !== "#";
    }

    return data.split("\n").filter(no_comments).map(measurements);
    
};

module.exports = utils;
