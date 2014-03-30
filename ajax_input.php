<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
define('_JEXEC', 1);
define('JPATH_BASE', dirname(__FILE__) . '/../../' );
define('DS', DIRECTORY_SEPARATOR);
require_once(JPATH_BASE.DS.'includes'.DS.'defines.php');
require_once(JPATH_BASE.DS.'includes'.DS.'framework.php');
JFactory::getApplication('administrator')->initialise();
$session = JFactory::getSession(); 

if( $session->get('mod_xdsoft_ymaps')=='valid' ){
	$module_id = intval(@$_REQUEST['module_id']);
	$db = JFactory::getDBO();
	if( !$module_id ){
		$db->setQuery("SELECT max(id) as maxid FROM #__modules");
		$mod = $db->loadObject();
		$module_id = $mod->maxid+1;
	}
	$action = ( isset($_REQUEST['action']) and in_array($_REQUEST['action'],array('saveobject','deleteobject','index')) )?$_REQUEST['action']:'index';
	$res = array('error'=>0);
	switch( $action ){
		case 'saveobject':
			$id = intval($_REQUEST['id']);
			$type = (isset($_REQUEST['type'])and in_array($_REQUEST['type'],array('placemark','circle','polygon','polyline')))?$_REQUEST['type']:'placemark';
			if( $id ){
				$db->setQuery("SELECT * FROM #__mod_xdsoft_ymaps where module_id=$module_id and id=".$id);
				$object = $db->loadObject();
				if( !isset($object->id) )
					$id = 0;
			}
			if( !$id ){
				$object = new stdClass();
				$object->module_id = $module_id;
				$object->type = $type;
				$db->insertObject('#__mod_xdsoft_ymaps', $object);
				$object->id = $db->insertid();;
			}
			$object->coordinates 		= @$_REQUEST['coordinates'];
			$object->options 				= @$_REQUEST['options'];
			$object->properties 		= @$_REQUEST['properties'];
			
			$result = $db->updateObject('#__mod_xdsoft_ymaps', $object,'id');
			if ( !$result ){
				$res['error'] = 1;
				$res['msg'] = $db->getErrorMsg();
			}
			
			$res['id'] = $object->id;
		break;
		case 'deleteobject':
			$id = intval($_REQUEST['id']);
			$object = new stdClass();
			$object->id = $id;
			$object->del = 1;
			
			$result = $db->updateObject('#__mod_xdsoft_ymaps', $object,'id');
			if ( !$result ){
				$res['error'] = 1;
				$res['msg'] = $db->getErrorMsg();
			}
		break;
		case 'index':
			echo $action;
		break;
	}
	exit(json_encode($res));
};