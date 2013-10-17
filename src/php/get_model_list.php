<?php
const data_dir = "data";

// get filter constraints
//
// find all files given those constrainta
//
$files = glob(data . "/*.meta");
// create a JSON array of model specs based on the .meta files.
$model_specs = array();

foreach ($files as $file) {
    array_push($model_specs, $file;
}

echo json_encode($model_specs);
?>
