<?php
session_start();

const data_dir = "data/";

$fields = array("name", "description", "authors", "date", "quantities", "format");

function check_field($field, $hash){
    return (isset($hash[$field]) and !empty($hash[$field]));
}

function set_field(&$arr, $field, $data) {
    if (check_field($field, $data)) {
        $arr[$field] = $data[$field];
    }
}

$raw_data = file_get_contents("php://input");

$data = json_decode($raw_data, true);

if (check_field("name", $data)) {

    $name = $data["name"];

    $file_name = str_replace(" ", "_", $name);

    $postfix = 0;
    $file_path = data_dir . $file_name . ".meta";
    while (file_exists($file_path)) {
        $postfix++;
        $file_path = data_dir . $file_name . "_" . $postfix . ".meta";
    }

    $meta_name = $file_path;
    $data_name = data_dir . basename($meta_name, ".meta") . ".data";

    $metadata = array();
    foreach($fields as $field) {
        set_field($metadata, $field, $data);
    }
    $metadata["date"] = date("Y-m-d");
    $metadata["time"] = date("H:i");

    // create meta file
    $meta_file = fopen($meta_name, "w+");
    fwrite($meta_file, json_encode($metadata));
    fclose($meta_file);


    // create data file
    $data_file = fopen($data_name, "w+");
    fclose($data_file);
    $_SESSION["data_file"] = $data_name;
} else {
    // error
}
?>
