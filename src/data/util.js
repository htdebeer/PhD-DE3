var utils = {};


utils.create = function(metadata, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                callback.call(null, {});
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };

    httpRequest.open("POST", "http://primarycalculus.org/DOEN/start_measuring.php");
    httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    httpRequest.send(JSON.stringify(metadata));
};

utils.update = function(data, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                if (callback) {
                    callback.call(null, {});
                }
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };

    httpRequest.open("POST", "http://primarycalculus.org/DOEN/update_data.php");
    httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    httpRequest.send(JSON.stringify(data));
};

utils.close = function(callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                callback.call(null, httpRequest.responseText);
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };

    httpRequest.open("GET", "http://primarycalculus.org/DOEN/stop_measuring.php");
    httpRequest.send(null);
};



utils.load_model_list = function(callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                var data = JSON.parse(httpRequest.responseText);
                callback.call(null, data);
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };
    httpRequest.open('GET', "http://primarycalculus.org/DOEN/get_model_list.php", true);
    httpRequest.send(null);
};

utils.load = function(model, callback) {
    console.log(model);
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            // everything is good, the response is received
            if (httpRequest.status === 200) {
                // perfect!
                var data = utils.parse_data(httpRequest.responseText,
                        model.format,
                        model.quantities);
                callback.call(null, data);
            } else {
                //     // there was a problem with the request,
                //         // for example the response may contain a 404
                //         (Not Found)
                //             // or 500 (Internal Server Error) response
                //             code
                console.log("Error: " + httpRequest.status);
            }
        } else {
           // still not ready
        }
    };
    httpRequest.open('GET', model.data_url, true);
    httpRequest.send(null);
};

utils.parse_data = function(data, format, quantities) {

    var FIELD_SEP;
    switch (format) {
        case "TAB":
            FIELD_SEP = "\t";
            break;
        case "CSV":
            FIELD_SEP = ",";
            break;
        case "SSV":
            FIELD_SEP = ";";
            break;
        default:
            FIELD_SEP = ";";
    }

    var fields = [];

    function parse_time(time, unit) {

        var parts = time.split(":");
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);
        var seconds, milliseconds;
        if (unit === "ms") {
            var seconds_parts = parts[2].split(".");
            seconds = parseInt(seconds_parts[0], 10);
            milliseconds = parseInt(seconds_parts[1], 10);
        } else {
            seconds = parseInt(parts[2], 10);
        }

        var value;

        switch (unit) {
            case "ms":
                value = (hours * 3600 + minutes * 60 + seconds)*1000 + milliseconds;
                break;
            case "sec":
                value = hours * 3600 + minutes * 60 + seconds;
                break;
            case "min":
                value = hours * 60 + minutes + seconds/60;
                break;
            case "hour":
                value = hours + minutes/60 + seconds/3600;
                break;
        }

        return value;
    }

    function measurements(line) {

        var parts = line.trim().split(FIELD_SEP),
            values = {};

        quantities.forEach(function(q, index) {
            var part = parts[index].trim();
            var value;

            switch (q.type) {
                case "time":
                    value = parse_time(part, q.unit);
                    break;
                case "int":
                    value = parseInt(part, 10);
                    break;
                case "real":
                    value = parseFloat(part);
                    break;
                default:
                    value = "error";
            }

            values[q.name] = value;
        });

        return values;
    }

    function no_comments(line) {
        return line.trim().charAt(0) !== "#";
    }

    function parseable(line) {
        return line.trim().split(FIELD_SEP).length === quantities.length;
    }

    return data.split("\n").filter(no_comments).filter(parseable).map(measurements);
    
};

module.exports = utils;
