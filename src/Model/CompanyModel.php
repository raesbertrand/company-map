<?php 
require_once PROJECT_ROOT_PATH . "/Model/Database.php";

class CompanyModel extends Database

{

    public function getCompanys($limit)

    {

        return $this->select("SELECT * FROM company ORDER BY id ASC LIMIT ?", ["i", $limit]);

    }

}
