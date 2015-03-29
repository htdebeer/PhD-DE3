<?php
const data_dir = "data";
$base_url = "http://primarycalculus.org/DOEN/data/";
// get filter constraints
//
// find all files given those constrainta
//
$files = glob(data_dir . "/*.meta");
// create a JSON array of model specs based on the .meta files.
$model_specs = array();

foreach ($files as $file) {
    $basename = basename($file, ".meta");
    $data_file = $basename . ".data";
    $data_path = data_dir . "/" . $data_file;
    if (file_exists($data_path) && filesize($data_path) > 0) {
        $content = file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);

            if (!$data["name"]) {
                $data["name"] = $basename;
            }
            $data["data_model"] = true;
            $data["data_url"] = $base_url . $basename . ".data";

            array_push($model_specs, $data);
        }
    } else {
        // skip
    }
}

echo json_encode($model_specs);
?>
