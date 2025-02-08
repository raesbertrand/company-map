<?php 
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
class CompanyModel extends Database
{
    public function getCompanies($limit)
    {
        return $this->select("SELECT * FROM company ORDER BY id ASC LIMIT ?", ["i", $limit]);
    }

    public function getCompanysAround($lat,$long,$radius){
        // TODO search in cache : and refresh it if necessary

        // return cached values
        $dbResult=$this->select("SELECT * , ( 6371000 * acos( cos( radians(45.815005) ) * cos( radians( ".$lat." ) ) * cos( radians( ".$long." ) - radians(15.978501) ) + sin( radians(45.815005) ) * sin(radians(".$lat.")) ) ) AS distance FROM company HAVING distance < ?", ["i", $radius]);
        return $dbResult;
    }
}
