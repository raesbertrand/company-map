<?php 
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
class CacheModel extends Database
{
    public function getCaches($limit)
    {
        return $this->select("SELECT * FROM api_cache ORDER BY id ASC LIMIT ?", ["i", $limit]);
    }
}
