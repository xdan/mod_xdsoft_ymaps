<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

$doc = JFactory::getDocument();

include 'helper.php';

$width 			= $params->get("width");
$height 		= $params->get("height");
$center 		= $params->get("autocenter")?'ymaps.geolocation.latitude, ymaps.geolocation.longitude':$params->get("center");
$zoom 			= $params->get("zoom");
$type 			= $params->get("type");

$autotrafficupdate 			= floatval($params->get('autotrafficupdate'));

if( !$autotrafficupdate )
	$autotrafficupdate = 4;

if (empty($width)) 
	$width = "auto";
if (empty($height)) 
	$height = "300px";
	
$map_unique_id = 'map'.uniqid();
$db = JFactory::getDBO();
$db->setQuery("SELECT * FROM #__mod_xdsoft_ymaps where del=0 and module_id=".$module->id);
$objects = $db->loadAssocList();
require JModuleHelper::getLayoutPath('mod_xdsoft_ymaps', $params->get('layout', 'default'));