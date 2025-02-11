<?php 
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
class CacheModel extends Database
{
    public function getCaches($limit)
    {
        return $this->select("SELECT * FROM api_cache ORDER BY cached_at ASC LIMIT ?", ["i", $limit]);
    }

    public function searchCaches($where, $limit)
    {
        return $this->select("SELECT * FROM api_cache WHERE ? ORDER BY cached_at ASC LIMIT ?", ["ss", $where, $limit]);
    }

    public function pingCache($where)
    {
        return $this->select("SELECT COUNT(*) FROM api_cache WHERE ? ORDER BY cached_at", ["pingcache", $where]);
    }
    
}
