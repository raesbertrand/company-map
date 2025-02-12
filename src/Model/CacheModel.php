<?php
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
class CacheModel extends Database
{
    protected $cacheAge = null;
    public function __construct()
    {
        parent::__construct();
        $this->cacheAge = $_ENV['SOURCE_CACHE'];
    }
    public function getCaches($limit)
    {
        return $this->select("SELECT * FROM api_cache ORDER BY cached_at ASC LIMIT ?", ["i", $limit]);
    }

    public function searchCaches($where, $limit, $age = null)
    {
        if (!$age) {
            $age = $this->cacheAge;
        }
        $period="(NOW() - INTERVAL ".$age.")";
        return $this->select("SELECT * FROM api_cache WHERE source=? AND cached_at > ".$period." ORDER BY cached_at DESC LIMIT ?", ["si", [$where, $limit]]);
    }

    public function pingCache($where)
    {
        return $this->select("SELECT COUNT(*) FROM api_cache WHERE ? ORDER BY cached_at", ["pingcache", $where]);
    }

    public function insertCache($url, $datas)
    {
        return $this->insert("INSERT INTO api_cache (source, result) VALUES(?,?)", ["ss", [$url, $datas]]);
    }

    public function cleanSourceCache($url){
        return $this->delete("DELETE FROM api_cache WHERE source=?",['s',[$url]]);
    }

}
