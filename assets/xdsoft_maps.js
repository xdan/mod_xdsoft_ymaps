/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
/*global ymaps,window,document,clearTimeout,setTimeout,SizerBox,initForm,updateObject,addYMapsObject,Bloodhound, xdsoft_lang,alert,confirm,deleteObject*/
(function ($) {
	"use strict";
	var objects = [], timeoutupdate, _opt;
	window.map = null;
	window.module_id = false;
	window.sizerBox = false;
	ymaps.ready(function () {
		var center	= $('#jform_params_center').val() ? $('#jform_params_center').val().split(',') : [55, 34],
			zoom = parseInt($('#jform_params_zoom').val(), 10),
			type = $('#jform_params_type').val(),
			height = $('#jform_params_height').val(),
			width = $('#jform_params_width').val(),
			elm,
			controls = ['zoomControl', 'typeSelector', /*'mapTools', 'miniMap',*/ 'searchControl', /*'smallZoomControl',*/ 'trafficControl', 'fullscreenControl', 'geolocationControl', 'routeEditor', 'rulerControl'],
			behaviors = ['scrollZoom', 'drag', 'dblClickZoom', 'multiTouch', 'leftMouseButtonMagnifier', 'rightMouseButtonMagnifier', 'ruler', 'routeEditor'],
			r;

		window.module_id = parseInt($('#module_id').val(), 10);

		if (!height) {
			height = 300 + 'px';
		}

		if (!width) {
			width = 'auto';
		}

		$('#work_area_map')
			.css('width', (width === 'auto') ? 440 + 'px' : width)
			.css('height', height);

		window.map = new ymaps.Map("work_area_map", {
			center: center,
			zoom: zoom,
			type: type,
			flying: true,
			behaviors: ['scrollZoom', 'drag']
		});

		if (!$('#jform_params_center').val() || $('#jform_params_autocenter1')[0].checked) {
			ymaps.geolocation.get({
				provider: 'yandex',
				mapStateAutoApply: true
			}).then(function (result) {
				var marker = result.geoObjects.get(0),
					mapContainer = $('#work_area_map'),
					bounds = marker.properties.get('boundedBy'),
					mapState = ymaps.util.bounds.getCenterAndZoom(
						bounds,
						[mapContainer.width(), mapContainer.height()]
					);
				window.map.setCenter(mapState.center);
				window.map.setZoom(parseInt(mapState.zoom, 10) || 10);
			});
		}

		$('#jform_params_height, #jform_params_width').on('change', function () {
			$('#work_area_map')
				.css('width', (width === 'auto') ? 440 + 'px' : width)
				.css('height', height);
			window.map.container.fitToViewport();
		});

		$('#basic-options').click(function () {
			window.map.container.fitToViewport();
		});

		window.map.events.add(['boundschange', 'typechange', 'balloonclose'], function () {
			$('#jform_params_center').val(window.map.getCenter());
			$('#jform_params_zoom').val(window.map.getZoom());
			$('#jform_params_type').val(window.map.getType());
		});

		window.map.events.fire('boundschange');

		$('#jform_params_center,#jform_params_zoom,#jform_params_type').change(function () {
			switch (this.id) {
			case 'jform_params_center':
				window.map.setCenter(this.value);
				break;
			case 'jform_params_zoom':
				window.map.setZoom(this.value);
				break;
			case 'jform_params_type':
				window.map.setType(this.value);
				break;
			}
		});

		window.sizerBox = new SizerBox(window.map, ymaps);

		function controlsChanger(event) {
			var id = $(event.currentTarget).id.replace('jform_params_', '');
			window.map.controls[event.currentTarget.checked ? 'add' : 'remove'](id);
		}
		for (r = 0; r < controls.length; r = r + 1) {
			elm = document.getElementById('jform_params_' + controls[r].toLowerCase() + '1');
			if (elm) {
				if (elm.checked) {
					window.map.controls.add(controls[r]);
				}

				$(elm).on('change', controlsChanger);
			}
		}

		function behaviorsChanger(event) {
			var id = event.currentTarget.id.replace('jform_params_', '');
			window.map.behaviors[event.currentTarget.checked ? 'enable' : 'disable'](id);
		}
		for (r = 0; r < behaviors.length; r = r + 1) {
			elm = document.getElementById('jform_params_' + behaviors[r] + controls[r].toLowerCase() + '1');
			if (elm) {
				window.map.behaviors[elm.checked ? 'enable' : 'disable'](behaviors[r]);
				$(elm).on('change', behaviorsChanger);
			}
		}

		window.selectOneObject = false;
		function pos(obj) {
			return (function functionGetFirstCoord(crd) {
				if ($.isArray(crd[0])) {
					return functionGetFirstCoord(crd[0]);
				}
				return crd;
			}(obj.geometry.getCoordinates()));
		}
		window.addYMapsObject = function (object_type, coordinates, id, options, properties) {
			var object = null, div;
			if (!coordinates || !coordinates.length) {
				return;
			}
			if (options) {
				options.draggable = true;
			}

			switch (object_type) {
			case 'polygon':
			case 'polyline':
				object = new ymaps[object_type === 'polygon' ? 'Polygon' : 'Polyline'](coordinates, properties, options);
				window.map.geoObjects.add(object);
				object.editor[!id ? 'startDrawing' : 'startEditing']();
				break;
			case 'placemark':
			case 'circle':
				object = new ymaps[object_type === 'circle' ? 'Circle' : 'Placemark'](coordinates, properties, options);
				window.map.geoObjects.add(object);
				break;
			}

			object.events.add('dblclick', function (e) {
				$('#xdsoft_options a#delete')
					.removeClass('btn-disabled');
				initForm(object_type, object);
				window.selectOneObject = object;
				window.sizerBox.init(object);
				window.map.setCenter(pos(object));
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			object.events.add('click', function (e) {
				$('#xdsoft_options a#delete').removeClass('btn-disabled');
				initForm(object_type, object, window.selectOneObject === object);
				window.selectOneObject = object;
				window.sizerBox.init(object);
			});

			window.sizerBox.init(object);

			object.xditem = div = $('<div><span>' + object_type + '</span><a>&times;</a></div>');

			if (!id) {
				initForm(object_type, object, true);
				updateObject(object);
			} else {
				div.find('span').text(object_type + id);
				object.options.set('xdsoft_id', id);
				object.xditem.addClass('saved');
			}
			div
				.find('span')
				.on('click', function () {
					ymaps
						.geoQuery(object)
						.applyBoundsToMap(window.map, {checkZoomRange: true});
				});
			div
				.find('a')
				.on('click', function () {
					if (confirm('Are you shure? Вы уверены?')) {
						deleteObject(object);
					}
				});

			div.data('object', object);

			$('#xdsoft_objects_list').append(div);

			object.events
				.add(['geometrychange', 'optionschange', 'propertieschange'], function () {
					updateObject(object);
				});

			window.selectOneObject = object;

			object.metaType = object_type;

			$('.toolbar a#delete').removeClass('btn-disabled');
		};
		window.map.events.add('click', function (e) {
			var object_type, cur, proj, x, y;
			if (e.get('domEvent').get('which') === 1) {
				object_type = $('.toolbar a.active').eq(0).attr('id');
				if (window.selectOneObject && (object_type === 'polygon' || object_type === 'polyline')) {
					if (window.selectOneObject.metaType === 'polygon' || window.selectOneObject.metaType === 'polyline') {
						if (window.selectOneObject.editor.state.get('drawing')) {
							return true;
						}
					}
				}
				cur = e.get('coordPosition') || e.get('coords');
				switch (object_type) {
				case 'polygon':
					addYMapsObject(object_type, [[cur]], null, {
						strokeWidth: 3,
						strokeColor: '#0000FF',
						strokeOpacity: 1,
						fillOpacity: 1,
						fillColor: '#FFFF00',
						draggable: true,
						visible: true
					}, {
						metaType: "Polygon",
						balloonContent: ""
					});
					break;
				case 'polyline':
					addYMapsObject(object_type, [cur], null, {
						strokeWidth: 3,
						strokeColor: '#0000FF',
						strokeOpacity: 1,
						draggable: true
					}, {
						metaType: "Polyline",
						balloonContent: ""
					});
					break;
				case 'circle':
					proj = window.map.options.get('projection');
					x = proj.fromGlobalPixels([300, 0], window.map.getZoom());
					y = proj.fromGlobalPixels([0, 0], window.map.getZoom());
					addYMapsObject(object_type, [cur, ymaps.coordSystem.geo.getDistance(x, y)], null, {
						fillColor: "#DB7093",
						fillOpacity: 1,
						strokeColor: "#990066",
						strokeOpacity: 0.8,
						strokeWidth: 3,
						visible: true,
						draggable: true
					}, {
						balloonContent: "",
						hintContent: "",
						metaType: "Circle"
					});
					break;
				case 'placemark':
					addYMapsObject(object_type, cur, null, {
						preset: 'twirl#blueStretchyIcon',
						draggable: true,
						visible: true
					}, {
						iconContent: 'Marker',
						balloonContent: "",
						metaType: "Point"
					});
					break;
				}
			}
			e.preventDefault();
		});
	});

	timeoutupdate = 0;
	_opt = {options: ['strokeColor', 'strokeOpacity', 'strokeWidth', 'fillColor', 'fillOpacity', 'preset'], properties: ['metaType', 'iconContent', 'balloonContent']};
	function deleteObject(object) {
		$.post(window.baseurl + 'modules/mod_xdsoft_ymaps/ajax_input.php', {action: 'deleteobject', id: object.options.get('xdsoft_id'), module_id: window.module_id}, function (resp) {
			if (!resp.error) {
				window.map.geoObjects.remove(object);
				window.sizerBox.hide();
				if (object.xditem) {
					object.xditem.remove();
				}
				object = null;
				$('.toolbar a#delete').addClass('btn-disabled');
				$('#xdsoft_options,#xdsoft_options>div').hide();
			}
		}, 'json');
	}
	function validateGeometry(geometry) {
		var coords = geometry, r;
		if ($.type(geometry) === 'string') {
			try {
				coords = JSON.parse(geometry);
			} catch (e) {
				return false;
			}
		}
		if ($.type(coords) === 'array') {
			if (coords.length) {
				for (r in coords) {
					if (coords.hasOwnProperty(r)) {
						if ($.type(coords[r]) === 'array') {
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
	function updateObject(object) {
		clearTimeout(timeoutupdate);
		timeoutupdate = setTimeout(function () {
			var object_type = object.properties.get('metaType') ? object.properties.get('metaType').toLowerCase() : 'polygon',
				id = object.options.get('xdsoft_id'),
				geometry = {},
				_name,
				_key,
				optes = {properties: {}, options: {}};

			geometry = (object_type !== 'circle') ? object.geometry.getCoordinates() : [object.geometry.getCoordinates(), object.geometry.getRadius()];

			if (
				!geometry.length ||
					!validateGeometry(geometry) ||
					(
						(
							(object_type === 'polyline' && geometry.length === 1) ||
							(object_type === 'polygon' && geometry.length === 1 && geometry[0].length < 3)
						) &&
						!window.selectOneObject.editor.state.get('drawing')
					)
			) {
				deleteObject(object);
				return;
			}

			for (_name in _opt) {
				if (_opt.hasOwnProperty(_name)) {
					for (_key = 0; _key < _opt[_name].length; _key = _key + 1) {
						if (object[_name].get(_opt[_name][_key]) !== undefined) {
							optes[_name][_opt[_name][_key]] = object[_name].get(_opt[_name][_key]);
						}
					}
				}
			}

			$.post(window.baseurl + 'modules/mod_xdsoft_ymaps/ajax_input.php', {
				action: 'saveobject',
				type: object_type,
				module_id: window.module_id,
				id: parseInt(object.options.get('xdsoft_id'), 10),
				coordinates: JSON.stringify(geometry),
				options: JSON.stringify(optes.options),
				properties: JSON.stringify(optes.properties)
			}, function (resp) {
				if (!resp.error) {
					object.options.set('xdsoft_id', resp.id);
					if (object.xditem) {
						object.xditem.find('span').text(object_type + resp.id);
						object.xditem.addClass('saved');
					}
				}
			}, 'json');
		}, 200);
	}
	function initForm(object_type, object, noshow) {
		$('#xdsoft_options>div').hide();

		if (!noshow) {
			$('#xdsoft_options,#' + object_type + '_options').show();
		} else {
			$('#' + object_type + ' _options').show();
		}
		$('#' + object_type + '_options').find('textarea,input,select').each(function () {
			var mode = $(this).hasClass('options') ? 'options' : 'properties',
				val = object[mode].get(this.id);
			this.value = this.getAttribute('type') === 'range' ? val * 10 : val;
		});
	}
	$(function () {
		window.module_id = parseInt($('#module_id').val(), 10);

		$('.toolbar a.objects')
			.click(function () {
				$('.toolbar a.objects').removeClass('active');
				$(this).addClass('active');
				if (window.selectOneObject && (window.selectOneObject.metaType === 'polygon' || window.selectOneObject.metaType === 'polyline')) {
					if (window.selectOneObject.editor.state.get('drawing')) {
						window.selectOneObject.editor.stopDrawing();
						updateObject(window.selectOneObject);
					}
				}
			});

		var timeoutKeyup = 0, objects_finder;
		$('#xdsoft_options').find('textarea,input,select').on('change blur keypress', function () {
			var _this = this;
			clearTimeout(timeoutKeyup);
			timeoutKeyup = setTimeout(function () {
				if (window.selectOneObject) {
					var mode = $(_this).hasClass('options') ? 'options' : 'properties',
						val = (_this.getAttribute('type') === 'range') ? _this.value / 10 : _this.value;
					window.selectOneObject[mode].set(_this.id, val);
				}
			}, 200);
		});

		$('#xdsoft_options a.close').click(function () {
			$('#xdsoft_options,#xdsoft_options>div').hide();
		});

		$('#xdsoft_options a#delete')
			.click(function () {
				if (window.selectOneObject) {
					deleteObject(window.selectOneObject);
				}
			});

		$('#sizer_for_map .icon-sizer')
			.on('mousedown', function (e) {
				var sX = $("#work_area_map").width(),
					sY = $("#work_area_map").height();

				$(window)
					.on('mousemove', function (e1) {
						var nX = sX + e1.screenX - e.screenX,
							nY = sY + e1.screenY - e.screenY;
						if (nX > 100) {
							$("#work_area_map").width(nX);
						}
						if (nY > 100) {
							$("#work_area_map").height(nY);
						}
					})
					.on('mouseup', function () {
						$('#jform_params_height')
							.val($("#work_area_map").height() + 'px');

						$('#jform_params_width')
							.val($("#work_area_map").width() + 'px');

						window.map.container.fitToViewport();

						$(window)
							.off('mousemove')
							.off('mouseup');
					});
			});

		/**
		 * Поиск по карте
		 */
		function setMapCenter(value) {
			ymaps.geocode(value, { results: 1 }).then(function (res) {
				var firstGeoObject = res.geoObjects.get(0);
				if (firstGeoObject) {
					window.map.panTo(firstGeoObject.geometry.getCoordinates());
					window.map.setBounds(firstGeoObject.properties.get('boundedBy'));
				}
			}, function (err) {
				alert(err.message);
			});
		}
		$('.search_box input').autocomplete({
			dropdownWidth: 'auto',
			appendMethod: 'replace',
			valid: function () {
				return true;
			},
			source: [
				function (q, add) {
					$.getJSON("http://geocode-maps.yandex.ru/1.x/?callback=?&format=json&geocode=" + encodeURIComponent(q), function (data) {
						var suggestions = [];
						if (data.response) {
							$.each(data.response.GeoObjectCollection.featureMember, function (i, val) {
								suggestions.push(val.GeoObject.metaDataProperty.GeocoderMetaData.text);
							});
							add(suggestions);
						}
					});
				}
			]
		}).on('selected.xdsoft', function (e, datum) {
			setMapCenter(this.value);
		}).on('keydown.xdsoft', function (e) {
			if (e.keyCode === 13) {
				setMapCenter(this.value);
			}
		});
		/*$('.search_box input').parentsUntil('div.panel').css('overflow', 'visible');
		objects_finder = new Bloodhound({
			datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.value); },
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: 'http://geocode-maps.yandex.ru/1.x/?callback=?&format=json&lang=' + xdsoft_lang + '&geocode=%QUERY',
				filter: function (data) {
					return $.map(data.response.GeoObjectCollection.featureMember, function (val) {
						return {
							name: val.GeoObject.metaDataProperty.GeocoderMetaData.text.toLowerCase(),
							value: val.GeoObject.Point.pos
						};
					});
				},
				ajax: {
					beforeSend: function () {
						$('.search_box input')
							.addClass('loaded');
					},
					complete: function () {
						$('.search_box input')
							.removeClass('loaded');
					}
				}
			}
		});
		function setMapCenter(value) {
			ymaps.geocode(value, { results: 1 }).then(function (res) {
				var firstGeoObject = res.geoObjects.get(0);
				if (firstGeoObject) {
					window.map.panTo(firstGeoObject.geometry.getCoordinates());
					window.map.setBounds(firstGeoObject.properties.get('boundedBy'));
				}
			}, function (err) {
				alert(err.message);
			});
		}
		objects_finder.initialize();
		$('.search_box input')
			.typeahead({
				minLength: 3,
				highlight: true
			}, {
				displayKey: 'name',
				source: objects_finder.ttAdapter()
			})
			.on('typeahead:selected typeahead:autocompleted', function (e, datum) {
				setMapCenter(datum.name);
			});
		 */
	});
}(window.jQuery));