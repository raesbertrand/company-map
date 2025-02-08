<?php 
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
class CompanyModel extends Database
{
    public function getCompanys($limit)
    {
        return $this->select("SELECT * FROM company ORDER BY id ASC LIMIT ?", ["i", $limit]);
    }

    public function getCompanysAround($lat,$long,$distance){
        // TODO search in cache : and refresh it if necessary

        // return cached values
        $dbResult=$this->select("SELECT * , ( 6371000 * acos( cos( radians(45.815005) ) * cos( radians( ? ) ) * cos( radians( ? ) - radians(15.978501) ) + sin( radians(45.815005) ) * sin(radians(stuff.lat)) ) ) AS distance FROM company HAVING distance < ?", ["i", $lat, $long, $distance]);
        return $dbResult;
    }
}
