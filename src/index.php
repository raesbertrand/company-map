<?php
require __DIR__ . "/inc/bootstrap.php";
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );
$uriSize=sizeOf($uri);
$module=$uri[$uriSize-2];
$param=$uri[$uriSize-1];

$allowedModules=['company', 'cache', 'note'];

/* check if module is allowed */
if (
    // (isset($module) && $module != 'company' && $module != 'cache')
    (isset($module) && array_search($module, $allowedModules)===false)
     || 
     !isset($param)) {
    header("HTTP/1.1 404 Not Found");
    exit();
}


require PROJECT_ROOT_PATH . "/Controller/Api/CompanyController.php";
require PROJECT_ROOT_PATH . "/Controller/Api/CacheController.php";
require PROJECT_ROOT_PATH . "/Controller/Api/NoteController.php";


$className = ucfirst($module) . 'Controller';
$strMethodName = $param . 'Action';
$objFeedController=new $className();

$objFeedController->{$strMethodName}();
