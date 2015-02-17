/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
!function($){
var objects = [];
window.map = null;
window.module_id = false;
window.sizerBox = false;
ymaps.ready(function () {
	var center		= $('#jform_params_center').val()?$('#jform_params_center').val().split(','):[ymaps.geolocation.latitude, ymaps.geolocation.longitude],
			zoom 			= parseInt($('#jform_params_zoom').val()),
			type 			= $('#jform_params_type').val(),
			height 		= parseInt($('#jform_params_height').val()),
			width 		= parseInt($('#jform_params_width').val());
	
	window.module_id = parseInt($('#module_id').val());
	
	if( isNaN(height) ){
		height = 300;	
	}
	
	if( isNaN(width) ){
		width = 'auto';
	}
	
	$('#work_area_map')
		.width(width=='auto'?440:parseInt(width))
		.height(height);
	
	$('#jform_params_height')
		.val(height);
	
	$('#jform_params_width')
		.val(width);
	
	
	
	map = new ymaps.Map("work_area_map", {
		center: center,
		zoom: 	zoom,
		type: 	type,
		flying: true,
		behaviors: ['scrollZoom','drag']
	});
	
	$('#jform_params_height,#jform_params_width').on('change',function(){
		$('#work_area_map')
			.width($('#jform_params_width').val()=='auto'?440:parseInt($('#jform_params_width').val()))
			.height($('#jform_params_height').val());
		
		map.container.fitToViewport();
	});
	
	$('#basic-options').click(function(){
		map.container.fitToViewport();
	});
	
	map.events.add(['boundschange', 'typechange', 'balloonclose'], function(){
		$('#jform_params_center').val(map.getCenter());
		$('#jform_params_zoom').val(map.getZoom());
		$('#jform_params_type').val(map.getType());
	});

	map.events.fire('boundschange');
	
	$('#jform_params_center,#jform_params_zoom,#jform_params_type').change(function(){
		switch( this.id ){
			case 'jform_params_center':
				map.setCenter(this.value);
			break;
			case 'jform_params_zoom':
				map.setZoom(this.value);
			break;
			case 'jform_params_type':
				map.setType(this.value);
			break;
		}
	});
	
	sizerBox = new SizerBox(map);
	
	var 
		elm, 
		controls = ['zoomControl','typeSelector','mapTools','miniMap','searchControl','smallZoomControl','trafficControl'],
		behaviors = ['scrollZoom','drag','dblClickZoom','multiTouch','rightMouseButtonMagnifier'],		
		r;
	
	for(r = 0; r < controls.length; r = r+1){
		elm = document.getElementById('jform_params_'+controls[r].toLowerCase()+'1');
		
		if( !elm )
			continue;
		
		if( elm.checked ){
			map.controls.add(controls[r]);
		}
		
		$(elm).on('change',function(){
			var id = this.id.replace('jform_params_','');
			map.controls[this.checked?'add':'remove'](id)
		});
	}
	
	for(r = 0; r < behaviors.length; r = r+1){
		elm = document.getElementById('jform_params_'+behaviors[r]+controls[r].toLowerCase()+'1');
		
		if( !elm )
			continue;
		
		map.behaviors[elm.checked?'enable':'disable'](behaviors[r]);
		
		$(elm).on('change',function(){
			var id = this.id.replace('jform_params_','');
			map.behaviors[this.checked?'enable':'disable'](id);
		});
	}
	
	window.selectOneObject = false;
	function pos(obj){
		return (function (crd){
			if(jQuery.isArray(crd[0])){
				return arguments.callee(crd[0]);
			};
			return crd;
		})(obj.geometry.getCoordinates());
	};
	window.addYMapsObject = function ( object_type,coordinates,id,options,properties ){
		var object = null;
		if( !coordinates||!coordinates.length )
			return;
		if( options )
			options['draggable'] = true;
		
		switch( object_type ){
			case 'polygon':case 'polyline':
				object = new ymaps[object_type=='polygon'?'Polygon':'Polyline']( coordinates,properties,options)
				map.geoObjects.add(object);
				object.editor[!id?'startDrawing':'startEditing']();
			break;
			case 'placemark':case 'circle':
				object = new ymaps[object_type=='circle'?'Circle':'Placemark'](coordinates,properties,options);
				map.geoObjects.add(object);
			break;
		}
		
		object.events.add('dblclick',function(e){
			$('#xdsoft_options a#delete').removeClass('btn-disabled');
			initForm(object_type,object);
			window.selectOneObject = object;
			sizerBox.init(object);
			map.setCenter(pos(object));
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
		object.events.add('click',function(e){
			$('#xdsoft_options a#delete').removeClass('btn-disabled');
			initForm(object_type,object,window.selectOneObject == object);
			window.selectOneObject = object;
			sizerBox.init(object);
		});
		
		sizerBox.init(object);
		
		if( !id ){
			initForm(object_type,object,true);
			updateObject(object);
		}else{
			object.options.set('xdsoft_id',id);
		}
		object.events
			.add(['geometrychange','optionschange','propertieschange'],function(){
					updateObject(object);
			});
			
		window.selectOneObject = object;
		
		$('.toolbar a#delete').removeClass('btn-disabled');
	}
	map.events.add('click',function(e){
		if( e.get('domEvent').get('which')===1 ){
			var object_type = $('.toolbar a.active').eq(0).attr('id'),
					cur = e.get('coordPosition');
			switch( object_type ){
				case 'polygon':
					addYMapsObject(object_type,[[cur]],null,{
						strokeWidth: 3,
						strokeColor: '#0000FF',
						strokeOpacity: 1,
						fillOpacity: 1,
						fillColor: '#FFFF00',
						draggable: true,
						visible:true
					},
					{metaType:"Polygon","balloonContent":""});
				break;
				case 'polyline':
					addYMapsObject(object_type,[cur],null,{
						strokeWidth: 3,
						strokeColor: '#0000FF',
						strokeOpacity: 1,
						draggable: true
					},
					{metaType:"Polyline","balloonContent":""});
				break;
				case 'circle':
					var proj = map.options.get('projection');
					var x = proj.fromGlobalPixels ([300,0], map.getZoom()), y = proj.fromGlobalPixels ([0,0], map.getZoom());
					addYMapsObject(object_type,[cur,ymaps.coordSystem.geo.getDistance(x, y)],null,{
						"fillColor":"#DB7093",
						"fillOpacity":1,
						"strokeColor":"#990066",
						"strokeOpacity":0.8,
						"strokeWidth":3,
						"visible":true,
						draggable:true
					},{
						"balloonContent":"",
						"hintContent":"",
						"metaType":"Circle"
					});
				break;
				case 'placemark':
					addYMapsObject(object_type,cur,null,{
						preset: 'twirl#blueStretchyIcon',
						draggable: true,
						visible:true
					},{
						iconContent: 'Marker',
						balloonContent:"",
						metaType:"Point"
					});
				break;
			}
		}
		e.preventDefault();
	});
});
var timeoutupdate = 0; 
var _opt = {options:['strokeColor','strokeOpacity','strokeWidth','fillColor','fillOpacity','preset'],properties:['metaType','iconContent','balloonContent']};
function deleteObject( object ){
	$.post('/modules/mod_xdsoft_ymaps/ajax_input.php',{action:'deleteobject',id:object.options.get('xdsoft_id'),module_id:window.module_id},function(resp){
		if( !resp.error ){
			map.geoObjects.remove(object);
			sizerBox.hide();
			delete object;
			$('.toolbar a#delete').addClass('btn-disabled');
			$('#xdsoft_options,#xdsoft_options>div').hide();
		}
	},'json');
}
function validateGeometry(geometry){
	var coords = geometry;
	if (jQuery.type(geometry) == 'string') {
		try{
			coords = JSON.parse(geometry);
		} catch (e) {
			return false;
		}
	}
	if (jQuery.type(coords) == 'array') {
		if (coords.length) {
			for (var r in coords) {
				if (coords.hasOwnProperty(r)) {
					if (jQuery.type(coords[r]) == 'array') {
						if (!validateGeometry(coords[r])) {
							return false;
						}
					} else {
						if (isNaN(coords[r]) || coords[r] === null) {
							return false;
						}
					}
				}
			}
			return true;
		}
	}
	return false;
}
function updateObject( object ){
	clearTimeout(timeoutupdate);
	timeoutupdate = setTimeout(function(){
		var object_type = object.properties.get('metaType')?object.properties.get('metaType').toLowerCase():'polygon',
			id = object.options.get('xdsoft_id'),
			geometry = {},
			optes = {properties:{},options:{}};
		
		geometry = object_type!='circle'?object.geometry.getCoordinates():[object.geometry.getCoordinates(),object.geometry.getRadius()];
		
		if( geometry.length==0 || !validateGeometry(geometry)){
			deleteObject(object);
			return;
		}
		
		for(var _name in _opt){
			if (_opt.hasOwnProperty(_name)) {
				for(var _key=0;_key<_opt[_name].length;_key++){
					if( object[_name].get(_opt[_name][_key])!==undefined ){
						optes[_name][_opt[_name][_key]] = object[_name].get(_opt[_name][_key]);
					}
				}
			}
		}
		
		$.post('/modules/mod_xdsoft_ymaps/ajax_input.php',{action:'saveobject',type:object_type,module_id:module_id,id:parseInt(object.options.get('xdsoft_id')),coordinates:JSON.stringify(geometry),options:JSON.stringify(optes['options']),properties:JSON.stringify(optes['properties'])},function(resp){
			if( !resp.error )
				object.options.set('xdsoft_id',resp.id);
		},'json');
	},200);
}
function initForm(object_type,object,noshow){
	$('#xdsoft_options>div').hide();
	
	if( !noshow ){
		$('#xdsoft_options,#'+object_type+'_options').show();
	}else{
		$('#'+object_type+'_options').show();
	}
	$('#'+object_type+'_options').find('textarea,input,select').each(function(){
		var mode = $(this).hasClass('options')?'options':'properties';	
		var val = object[mode].get(this.id);
		this.value = this.getAttribute('type')=='range'?val*10:val;	
	});
}
$(function(){

window.module_id = parseInt($('#module_id').val());

$('.toolbar a.objects')
	.click(function(){
		$('.toolbar a.objects').removeClass('active');
		$(this).addClass('active');
	});
	
var timeoutKeyup = 0;
$('#xdsoft_options').find('textarea,input,select').on('change blur keypress',function(){
	var _this = this;
	clearTimeout(timeoutKeyup);
	timeoutKeyup = setTimeout(function(){
		if( window.selectOneObject ){
			var mode = $(_this).hasClass('options')?'options':'properties';
			var val = _this.getAttribute('type')=='range'?_this.value/10:_this.value;	
			window.selectOneObject[mode].set(_this.id,val);
		}
	},200);
});

$('#xdsoft_options a.close').click(function(){
	$('#xdsoft_options,#xdsoft_options>div').hide();
});

$('#xdsoft_options a#delete')
	.click(function(){
		if( window.selectOneObject ){
			deleteObject(window.selectOneObject);
		}
	});
	
$('#sizer_for_map .icon-sizer')
	.on('mousedown',function(e){
		var sX = $("#work_area_map").width(),
				sY = $("#work_area_map").height();
				
		$(window)
			.on('mousemove', function(e1){
				var nX = sX+e1.screenX-e.screenX,
						nY = sY+e1.screenY-e.screenY;
				if(nX>100)
					$("#work_area_map").width(nX);
				if(nY>100)
					$("#work_area_map").height(nY);
			})
			.on('mouseup',function(){
				$('#jform_params_height')
					.val($("#work_area_map").height());
				
				$('#jform_params_width')
					.val($("#work_area_map").width());
					
				map.container.fitToViewport();
				
				$(window)
					.off('mousemove')
					.off('mouseup');
			});
	});

/**
 * Поиск по карте
 */
$('.search_box input').parentsUntil('div.panel').css('overflow','visible');
var objects_finder = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  remote: {
		url:'http://geocode-maps.yandex.ru/1.x/?callback=?&format=json&lang='+xdsoft_lang+'&geocode=%QUERY',
		filter: function(data) {
      return $.map(data.response.GeoObjectCollection.featureMember, function(val) { 
				return { 
					name: val.GeoObject.metaDataProperty.GeocoderMetaData.text.toLowerCase(),
					value: val.GeoObject.Point.pos 
				};
			});
    },
		ajax:{
			beforeSend:function(){
				$('.search_box input')
					.addClass('loaded');
			},
			complete:function(){
				$('.search_box input')
					.removeClass('loaded');
			},
		}
	}
});
var setMapCenter = function setMapCenter(value){
	ymaps.geocode(value, { results: 1 }).then(function (res) {
		var firstGeoObject = res.geoObjects.get(0);
		if( firstGeoObject ){
			window.map.panTo(firstGeoObject.geometry.getCoordinates());
			window.map.setBounds( firstGeoObject.properties.get('boundedBy') );
		}
	}, function (err) {
		alert(err.message);
	})
};
objects_finder.initialize();
 
$('.search_box input')
	.typeahead({
			minLength: 3,
			highlight: true,
		},{
			displayKey: 'name',
			source: objects_finder.ttAdapter()
		}
	)
	.on('typeahead:selected typeahead:autocompleted',function(e,datum){
		setMapCenter(datum.name);
	});;
 /*****************************************************************/
 });
}(window.jQuery);