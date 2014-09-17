<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;
$lang = in_array(JFactory::getLanguage()->getTag(),array('ru-RU','en-US','tr-TR','uk-UA'))?JFactory::getLanguage()->getTag():'en-US';
$doc->addScript('//api-maps.yandex.ru/2.0/?load=package.full&wizard=mod_xdsoft_ymaps&lang='.$lang);
?>
<div id="<?php echo $map_unique_id; ?>" style="width:<?php echo $width;?>px;height:<?php echo $height;?>px;"></div>
<script>
<?php
$behaviors = array('scrollZoom','drag','dblClickZoom','multiTouch','rightMouseButtonMagnifier');
$bhvrs = array();
foreach($behaviors as $behavior){
	if( $params->get($behavior) )
		$bhvrs[]=$behavior;
}
$bhvrs = count($bhvrs)?'["'.implode('","',$bhvrs).'"]':'[]';
?>
ymaps.ready(function(){
	var <?php echo $map_unique_id; ?> = new ymaps.Map("<?php echo $map_unique_id; ?>", {
		center: [<?php echo $center;?>],
		zoom: 	<?php echo intval($zoom);?>,
		type: 	'<?php echo $type;?>',
		flying: true,
		behaviors: <?php echo $bhvrs;?>
	});
<?php
	$controls = array('zoomControl','typeSelector','mapTools','miniMap','searchControl','smallZoomControl','trafficControl');
	foreach($controls as $control){
		if( $params->get($control) )
			echo $map_unique_id.'.controls.add("'.$control.'");';
	}
	
	foreach($objects as $object){
		if( !empty($object['coordinates']) ){
			echo $map_unique_id.'.geoObjects.add(new ymaps.'.ucfirst($object['type']).'('.$object['coordinates'].','.$object['properties'].','.$object['options'].'));';
		}
	}
?>
<?php if($params->get('autotraffic')){ ?>
	var trafficControl = new ymaps.control.TrafficControl({shown: true},{visible:false});
	<?php echo $map_unique_id; ?>.controls.add(trafficControl);
	window.setInterval(function () {
		trafficControl.getProvider('traffic#actual').update();  
	}, <?php echo $autotrafficupdate;?> * 60 * 1000);
<?php } ?>
});
</script>
