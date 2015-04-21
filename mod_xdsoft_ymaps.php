<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;
#error_reporting(E_ALL);
$doc = JFactory::getDocument();

include 'helper.php';

$width 			= $params->get("width", 'auto');
$height 		= $params->get("height", '300px');
$center 		= $params->get("autocenter", 0) ? '55,34':$params->get("center", '55,34');
$zoom 			= $params->get("zoom", 10);
$type 			= $params->get("type", 'yandex#map');

if (is_numeric($width)) {
	$width.='px';
}
if (is_numeric($height)) {
	$height.='px';
}

$autotrafficupdate 			= floatval($params->get('autotrafficupdate', 4));

	
$map_unique_id = 'map'.uniqid();
$db = JFactory::getDBO();
$db->setQuery("SELECT * FROM #__mod_xdsoft_ymaps where del=0 and module_id=".$module->id);
$objects = $db->loadAssocList();
require JModuleHelper::getLayoutPath('mod_xdsoft_ymaps', $params->get('layout', 'default'));