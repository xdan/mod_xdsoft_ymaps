<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdsoft.net) chupurnov@gmail.com. All rights reserved.
 * @license		http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
 */

defined('_JEXEC') or die;
$lang = in_array(JFactory::getLanguage()->getTag(),array('ru-RU','en-US','tr-TR','uk-UA'))?JFactory::getLanguage()->getTag():'en-US';
$doc->addScript($params->get('api', '//api-maps.yandex.ru/2.1/?lang=').$lang);
?>
<div id="<?php echo $map_unique_id; ?>" style="width:<?php echo $width;?>;height:<?php echo $height;?>;"></div>
<div style="text-align:right;text-transform:lowercase;font-size:0.8em;line-height:0.9em;width:<?php echo $width;?>;"><<?php echo '';?>a target="_bla<?php echo '';?>nk" style="co<?php echo '';?>lor:#ccc;" href="ht<?php echo '';?>tp://xd<?php echo '';?>an.ru/joo<?php echo '';?>mla-modu<?php echo '';?>le-constructor-yandex-kart.html">Мод<?php echo '';?>уль Конст<?php echo '';?>руктор Янд<?php echo '';?>екс К<?php echo '';?>арт дл<?php echo '';?>я J<?php echo '';?>oo<?php echo '';?>mla</a></div>
<script>
<?php
$behaviors = array(
	'drag',
	'scrollZoom',
	'dblClickZoom',
	'multiTouch',
	'rightMouseButtonMagnifier',
	'leftMouseButtonMagnifier',
	'ruler',
	'routeEditor',
);
$bhvrs = array();
foreach($behaviors as $behavior){
	if ($params->get(strtolower($behavior))) {
		$bhvrs[]=$behavior;
	}
}
$bhvrs = count($bhvrs)?'["'.implode('","',$bhvrs).'"]':'[]';
if ($params->get(strtolower('scrollZoom')) === null) {
	$bhvrs = '["drag","scrollZoom","dblClickZoom"]';
}
?>
ymaps.ready(function(){
	var <?php echo $map_unique_id; ?> = new ymaps.Map("<?php echo $map_unique_id; ?>", {
		center: [<?php echo $center;?>],
		zoom: 	<?php echo intval($zoom);?>,
		type: 	'<?php echo $type;?>',
		controls: [],
		flying: true,
		behaviors: <?php echo $bhvrs;?>
	});
<?php
	$controls = array(
		'fullscreenControl',
		'geolocationControl',
		'routeEditor',
		'rulerControl',
		'zoomControl',
		'typeSelector', 
		'searchControl',
		'trafficControl',
		//'mapTools',//2.0
		//'miniMap',//2.0
		//'smallZoomControl',//2.0
	);
	foreach ($controls as $control) {
		if ($params->get(strtolower($control), 1)) {
			echo $map_unique_id.'.controls.add("'.$control.'");';
		}
	}
	
	foreach($objects as $object){
		if( !empty($object['coordinates']) and validateGeometry($object['coordinates']) ){
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
<?php if($params->get('autocenter', 0)){ ?>
	ymaps.geolocation.get({
		provider: 'yandex',
		mapStateAutoApply: true
	}).then(function (result) {
		var marker = result.geoObjects.get(0),
			mapContainer = document.getElementById('#<?php echo $map_unique_id; ?>'),
			bounds = marker.properties.get('boundedBy'),
			mapState = ymaps.util.bounds.getCenterAndZoom(
				bounds,
				[mapContainer.offsetWidth, mapContainer.offsetHeight]
			);
		<?php echo $map_unique_id; ?>.setCenter(mapState.center);
		<?php echo $map_unique_id; ?>.setZoom(parseInt(mapState.zoom, 10) || 10);
	});
<?php } ?>
});
</script>
