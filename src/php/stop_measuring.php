<?php
session_start();

if (isset($_SESSION["data_file"]) and !empty($_SESSION["data_file"])) {
    $url = $_SESSION["data_file"];
    unset($_SESSION["data_file"]);
    session_destroy();
    echo $url;
}
?>
