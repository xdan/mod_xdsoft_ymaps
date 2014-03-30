DROP TABLE IF EXISTS `#__mod_xdsoft_ymaps`;
CREATE TABLE IF NOT EXISTS `#__mod_xdsoft_ymaps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `type` enum('placemark','circle','polygon','polyline') NOT NULL DEFAULT 'placemark',
  `link` varchar(255) DEFAULT NULL,
  `coordinates` text,
  `options` text,
  `properties` text,
  `descr` text,
	`del` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Объекты для модуля Яндекс Карты на Joomla http://xdan.ru' AUTO_INCREMENT=1;
