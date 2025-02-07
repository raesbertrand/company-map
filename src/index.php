<?php
require __DIR__ . "/inc/bootstrap.php";
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );
$uriSize=sizeOf($uri);
$module=$uri[$uriSize-2];
$param=$uri[$uriSize-1];
if ((isset($module) && $module != 'company') || !isset($param)) {
    header("HTTP/1.1 404 Not Found");
    exit();
}
require PROJECT_ROOT_PATH . "/Controller/Api/CompanyController.php";
$objFeedController = new CompanyController();
$strMethodName = $param . 'Action';
$objFeedController->{$strMethodName}();
