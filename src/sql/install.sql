/* Table api_cache {
  id integer [primary key]
  source text
  result text
  cached_at timestamp 
}
*/

CREATE DATABASE company_map;
USE company_map;

CREATE TABLE IF NOT EXISTS `api_cache` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` text COLLATE utf8mb4_0900_as_cs NOT NULL,
  `result` text COLLATE utf8mb4_0900_as_cs,
  `cached_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;