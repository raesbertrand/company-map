-- --------------------------------------------------------

--
-- Structure de la table `company_notes`
--

DROP TABLE IF EXISTS `company_notes`;
CREATE TABLE IF NOT EXISTS `company_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `siret` int NOT NULL,
  `note` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
