<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdsoft.net) chupurnov@gmail.com. All rights reserved.
 * @license		http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
 */
define('_JEXEC', 1);
define('JPATH_BASE', dirname(__FILE__) . '/../../' );
define('DS', DIRECTORY_SEPARATOR);
require_once(JPATH_BASE.DS.'includes'.DS.'defines.php');
require_once(JPATH_BASE.DS.'includes'.DS.'framework.php');

JFactory::getApplication('administrator')->initialise();
$session = JFactory::getSession(); 
$jinput = JFactory::getApplication()->input;

if( $session->get('mod_xdsoft_ymaps')=='valid' ){
	$module_id = intval( $jinput->get('module_id'));
	$db = JFactory::getDBO();
	if( !$module_id ){
		$db->setQuery("SELECT max(id) as maxid FROM #__modules");
		$mod = $db->loadObject();
		$module_id = $mod->maxid+1;
	}
	$action =  $jinput->get('action', 'index');
	$action = ( !empty($action) and in_array($action,array('saveobject','deleteobject','index')) )?$action:'index';
	$res = array('error'=>0);

	switch( $action ){
		case 'saveobject':
			$id = $jinput->get('id', 0,'INT');
			$type = $jinput->get('type', 'placemark');
			$type = (!empty($type)and in_array($type,array('placemark','circle','polygon','polyline')))?$type:'placemark';
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
			
			function xdsoft_decode_magic ($value) {
				return get_magic_quotes_gpc()?stripslashes($value):$value;
			}
			
			$object->coordinates 		= xdsoft_decode_magic($jinput->get('coordinates', '[0,0]','RAW'));
			$object->options 			= xdsoft_decode_magic($jinput->get('options', '{}','RAW'));
			$object->properties 		= xdsoft_decode_magic($jinput->get('properties', '{}','RAW'));
			
			$result = $db->updateObject('#__mod_xdsoft_ymaps', $object,'id');
			if ( !$result ){
				$res['error'] = 1;
				$res['msg'] = $db->getErrorMsg();
			}
			
			$res['id'] = $object->id;
		break;
		case 'deleteobject':
			$id = $jinput->get('id', 0,'INT');
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