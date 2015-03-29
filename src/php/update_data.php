<?php
session_start();

if (isset($_SESSION["data_file"]) and !empty($_SESSION["data_file"])) {

        $raw_data = file_get_contents("php://input");

        $data = json_decode($raw_data, true);
        $data_file = fopen($_SESSION["data_file"], "a");
        foreach($data as $datum) {
            fwrite($data_file, $datum);
            fwrite($data_file, "\n");
        }
        fclose($data_file);
}
?>
