<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdsoft.net) chupurnov@gmail.com. All rights reserved.
 * @license		http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
 */
defined('JPATH_BASE') or die;

jimport('joomla.form.formfield');
include realpath(dirname(__FILE__).'/../').'/helper.php';

class JFormFieldMap extends JFormField {

	protected $type = 'Map';
	protected $constructor;
	protected $form = null;

	
	public function getLabel() {
		return '';
	}
	public function __construct($form = null){
		$this->form = $form;
		parent::__construct($form);
	}
	public function getInput() {
		$session = JFactory::getSession();
		$session->set('mod_xdsoft_ymaps','valid');
		
		$module_id = intval(@$_REQUEST['id']);
		
		$html = '
		<div class="xdsoft_main_content">
			<div id="sizer_for_map">
				<div id="work_area_map">
					<div class="toolbar">
						<a id="polygon" class="btn objects active"><i class="icon icon-polygon"></i></a>
						<a id="polyline" class="btn objects"><i class="icon icon-polyline"></i></a>
						<a id="circle" class="btn objects"><i class="icon icon-circle"></i></a>
						<a id="placemark" class="btn objects"><i class="icon icon-marker"></i></a>
					</div>
					<div id="xdsoft_options">
						<a id="delete" title="'.JText::_('MOD_XDSOFT_YMAPS_SENT_TO_RECICLE').'" class="icon icon-delete"></a>
						<a class="close"></a>
						<div id="polygon_options">
							<table>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_BALLOON').':</th><td><textarea id="balloonContent" placeholder="'.JText::_('MOD_XDSOFT_YMAPS_BALLOON_TEXT_DESCR').'"></textarea></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_COLOR').':</th><td><input class="options" id="strokeColor" type="color"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_OPACITY').':</th><td><input class="options" id="strokeOpacity" type="range" min="0" max="10"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_WIDTH').':</th><td><input class="options" id="strokeWidth" type="number" min="0"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_FILL_COLOR').':</th><td><input class="options" id="fillColor" type="color"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_FILL_OPACITY').':</th><td><input class="options" id="fillOpacity" type="range" min="0" max="10"/></td></tr>
							</table>
						</div>
						<div id="polyline_options">
							<table>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_BALLOON').':</th><td><textarea id="balloonContent" placeholder="'.JText::_('MOD_XDSOFT_YMAPS_BALLOON_TEXT_DESCR').'"></textarea></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_COLOR').':</th><td><input class="options" id="strokeColor" type="color"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_OPACITY').':</th><td><input class="options" id="strokeOpacity" type="range" min="0" max="10"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_WIDTH').':</th><td><input class="options" id="strokeWidth" type="number" min="0"/></td></tr>
							</table>
						</div>
						<div id="circle_options">
							<table>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_BALLOON').':</th><td><textarea id="balloonContent" placeholder="'.JText::_('MOD_XDSOFT_YMAPS_BALLOON_TEXT_DESCR').'"></textarea></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_COLOR').':</th><td><input class="options" id="strokeColor" type="color"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_OPACITY').':</th><td><input class="options" id="strokeOpacity" type="range" min="0" max="10"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_LINE_WIDTH').':</th><td><input class="options" id="strokeWidth" type="number" min="0"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_FILL_COLOR').':</th><td><input class="options" id="fillColor" type="color"/></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_FILL_OPACITY').':</th><td><input class="options" id="fillOpacity" type="range" min="0" max="10"/></td></tr>
							</table>
						</div>
						<div id="placemark_options">
							<table>
								<tr><th>Надпись:</th><td><textarea id="iconContent" placeholder="Надпись на метке"></textarea></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_BALLOON').':</th><td><textarea id="balloonContent" placeholder="'.JText::_('MOD_XDSOFT_YMAPS_BALLOON_TEXT_DESCR').'"></textarea></td></tr>
								<tr><th>'.JText::_('MOD_XDSOFT_YMAPS_STYLE').':</th><td><select id="preset" class="options">
								<option>twirl#lightblueStretchyIcon</option><option>twirl#blueIcon</option><option>twirl#darkblueIcon</option><option>twirl#darkgreenIcon</option><option>twirl#darkorangeIcon</option><option>twirl#greenIcon</option><option>twirl#greyIcon</option><option>twirl#lightblueIcon</option><option>twirl#nightIcon</option><option>twirl#blueDotIcon</option><option>twirl#darkblueDotIcon</option><option>twirl#darkgreenDotIcon</option><option>twirl#darkorangeDotIcon</option><option>twirl#greenDotIcon</option><option>twirl#greyDotIcon</option><option>twirl#lightblueDotIcon</option><option>twirl#nightDotIcon</option><option>twirl#blueStretchyIcon</option><option>twirl#darkblueStretchyIcon</option><option>twirl#darkgreenStretchyIcon</option><option>twirl#darkorangeStretchyIcon</option><option>twirl#greenStretchyIcon</option><option>twirl#greyStretchyIcon</option><option>twirl#nightStretchyIcon</option><option>twirl#airplaneIcon</option><option>twirl#anchorIcon</option><option>twirl#badmintonIcon</option><option>twirl#bankIcon</option><option>twirl#barIcon</option><option>twirl#barberShopIcon</option><option>twirl#bicycleIcon</option><option>twirl#bowlingIcon</option><option>twirl#buildingsIcon</option><option>twirl#busIcon</option><option>twirl#cafeIcon</option><option>twirl#campingIcon</option><option>twirl#carIcon</option><option>twirl#cellularIcon</option><option>twirl#cinemaIcon</option><option>twirl#downhillSkiingIcon</option><option>twirl#dpsIcon</option><option>twirl#dryCleanerIcon</option><option>twirl#electricTrainIcon</option><option>twirl#factoryIcon</option><option>twirl#theaterIcon</option>			
								</select></td></tr>		
							</table>
						</div>
					</div>
				</div>
				<a class="icon icon-sizer"></a>
			</div>
			<div>
				<div class="search_box">
					<input placeholder="'.JText::_('MOD_XDSOFT_YMAPS_START_INPUT_YOUR_PLACE').'" type="text"/>
					<input type="hidden" id="module_id" value="'.$module_id.'"/>
				</div>
			</div>
			<div><a href="http://maps.xdan.ru" target="_blank">'.JText::_('MOD_XDSOFT_YMAPS_MAPSXDANRU').'</a></div>
		</div>
';
		$doc = JFactory::getDocument();
		
		$lang = in_array(JFactory::getLanguage()->getTag(),array('ru-RU','en-US','tr-TR','uk-UA'))?JFactory::getLanguage()->getTag():'en-US';
	
		$doc->addScript("//api-maps.yandex.ru/2.0-stable/?load=package.full&lang=".$lang);
		
		if (version_compare( '3.0.0', JVERSION, '>')) {
			$doc->addScript(JURI::root()."/modules/mod_xdsoft_ymaps/assets/jquery.min.js");
		}

		$doc->addScript(JURI::root()."/modules/mod_xdsoft_ymaps/assets/typeahead.bundle.min.js");
		$doc->addScript(JURI::root()."/modules/mod_xdsoft_ymaps/assets/xdsoft_sizerbox.js");
		$doc->addScript(JURI::root()."/modules/mod_xdsoft_ymaps/assets/xdsoft_maps.js");
		
		$doc->addScriptDeclaration('window.xdsoft_lang = "'.$lang.'";');
		
		$db = JFactory::getDBO();
		$db->setQuery("SELECT * FROM #__mod_xdsoft_ymaps where del=0 and module_id=$module_id");
		$objects = $db->loadAssocList();
		$js = 'ymaps.ready(function () {';
		
		foreach($objects as $object){
			if( !empty($object['coordinates']) and validateGeometry($object['coordinates']) )
				$js.='addYMapsObject("'.$object['type'].'",'.$object['coordinates'].','.$object['id'].($object['options']?','.$object['options']:'').($object['properties']?','.$object['properties']:'').');'."\n";
		}
		
		$doc->addScriptDeclaration($js.'});');
		$doc->addHeadLink (JURI::root()."/modules/mod_xdsoft_ymaps/assets/style.css",'stylesheet');

		return $html;
	}
}
