/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
var SizerBox = function(map, ymaps){
	var proj = map.options.get('projection'),
		coords = [], 
		bounde = [], 
		self = this,
		center = [],
		scale = [1,1],
		x = 0,
		y = 0,
		metaType = 'polygon',
		sizerBoxContainer = null, 
		workObject = null,
		oldFocusObject = null,
		bc = map.getCenter(),
		zoom = map.getZoom(),
		supportMetaTypes = {polyline:1,linestring:1,polygon:1,circle:1};

	var  isset = function( b ){ return typeof b!=='undefined'; }		
	var  isArray = function( b ){ return ( Object.prototype.toString.call( b ) === '[object Array]' );};	
	var findBoundeBox = function (coords){
		if (!isset(coords)){
			coords = workObject.geometry.getCoordinates();
			
			if (!coords || !coords.length){
				self.hide();
				return [map.getCenter(),map.getCenter()];
			}
			//return 	workObject.geometry.getBounds();

			if (self.metaType=='circle') {
				var direction = [1, Math.cos(Math.PI / 2)],
					direction1 = [Math.sin(Math.PI), -1],
					one = ymaps.coordSystem.geo.solveDirectProblem(coords, direction, workObject.geometry.getRadius()).endPoint,
					two = ymaps.coordSystem.geo.solveDirectProblem(coords, direction1, workObject.geometry.getRadius()).endPoint,
					step = [Math.abs(one[0]-coords[0]),Math.abs(two[1]-coords[1])];
					
				coords  = [[coords[0]+step[0],coords[1]+step[1]],[coords[0],coords[1]+step[1]],[coords[0]+step[0],coords[1]],[coords[0]-step[0],coords[1]-step[1]]];
			}
		};
		var max = [] , min = [],crnt = [];
		if( isset(coords)&&isArray(coords) )
			for(var i=0;i<coords.length;i++){
				if( isArray(coords[i]) && isArray(coords[i][0]) )
					crnt = findBoundeBox(coords[i]);
				else{
					crnt = [[coords[i][0],coords[i][1]],[coords[i][0],coords[i][1]]];
				}
				if( !isset(max[0])||max[0]<crnt[0][0] )
					max[0] = crnt[0][0];
				if( !isset(max[1])||max[1]<crnt[0][1] )
					max[1] = crnt[0][1];
				
				if( !isset(min[0])||min[0]>crnt[1][0] )
					min[0] = crnt[1][0];
				if( !isset(min[1])||min[1]>crnt[1][1] )
					min[1] = crnt[1][1];
			}
		return [max,min];
	};
	var getBoundeCenter = function (){
		return [self.bounde[0][0]+(self.bounde[1][0]-self.bounde[0][0])/2,self.bounde[0][1]+(self.bounde[1][1]-self.bounde[0][1])/2];
	};
	var findFirstCoord = function ( coords ){
		if( isArray(coords) && isArray(coords[0])){
			for(var i=0;i<coords.length;i++){
				if( isArray(coords[i]) && isArray(coords[i][0]) )
					return arguments.callee(coords[i]);
				else return coords[i];
			}
			return coords[0];
		}else 
			return coords;
	};
	var arrayClone = function(){
		var newArray = [];
		for(var i=0;i<this.length;i++)
			if( isArray(this[i]) )
				newArray[i] = arrayClone.call(this[i]);
			else
				newArray[i] = this[i];
		return newArray;
	};
	var findAngle = function (p1,zoom) {
			var _p1 = proj.toGlobalPixels(p1,zoom),
					_c = proj.toGlobalPixels(center,zoom);
			return Math.atan2(_p1[1]-_c[1], _p1[0]-_c[0]);
	};
	var _init = function(){
		if( !sizerBoxContainer ){
			sizerBoxContainer = [];
			
			// грани
			sizerBoxContainer[6] = new ymaps.Polyline([],{},{strokeWidth: 2, strokeStyle: '5 2',strokeOpacity:0.4,draggable: true,cursor: 'move'});
			sizerBoxContainer[7] = new ymaps.Polyline([],{},{strokeWidth: 2, strokeStyle: '5 2',strokeOpacity:0.4,draggable: true,cursor: 'move'});
			sizerBoxContainer[8] = new ymaps.Polyline([],{},{strokeWidth: 2, strokeStyle: '5 2',strokeOpacity:0.4,draggable: true,cursor: 'move'});
			sizerBoxContainer[9] = new ymaps.Polyline([],{},{strokeWidth: 2, strokeStyle: '5 2',strokeOpacity:0.4,draggable: true,cursor: 'move'});
			
		
			// вершины
			sizerBoxContainer[1] = new ymaps.Rectangle([],{},{cursor: 'grab', strokeOpacity:0.4,draggable: true});
			sizerBoxContainer[3] = new ymaps.Rectangle([],{},{cursor: 'grab',strokeOpacity:0.4,draggable: true});
			sizerBoxContainer[4] = new ymaps.Rectangle([],{},{cursor: 'grab',strokeOpacity:0.4,draggable: true});

			//центральная точка
			sizerBoxContainer[5] = new ymaps.Rectangle([],{},{cursor: 'grab',draggable: true});
			
			//иконка вращения
			sizerBoxContainer[2] = new ymaps.GeoObject({
				geometry: {
					type: "Point",
					//preset: "islands#yellowCircleIcon",
					coordinates: []
				},
				properties: {
						hintContent: "Вращать",
				}
			}, {
				iconImageHref:'/modules/mod_xdsoft_ymaps/assets/images/rotate.png',
				iconImageSize: [16, 16], // размеры картинки
				iconImageOffset: [-3,-3],// смещение картинки
				preset: "islands#yellowCircleIcon",
				draggable: true,
			});
		
			var oldposition = [],newposition = [], oldcoordinates = [], oldangle = 0, oldradius = 0, scale = [1,1];
			
			for(var ob=1;isset(sizerBoxContainer[ob]);ob++){
				map.geoObjects.add(sizerBoxContainer[ob]);
				(function(ob){
					sizerBoxContainer[ob].events
						.add('dragstart', function(e){
							self.noUpdate = true;
							oldposition = findFirstCoord(e.get('target').geometry.getCoordinates());
							oldcoordinates = arrayClone.call(workObject.geometry.getCoordinates());
							center = getBoundeCenter();
							oldangle = findAngle(oldposition,zoom);
							if( self.metaType=='circle' )
								oldradius = workObject.geometry.getRadius();
							self.hide(ob);
						})
						.add('drag', function(e){
								switch(ob){
									case 2:
										if( self.metaType=='circle' )
											return false;
										newposition = findFirstCoord(e.get('target').geometry.getCoordinates());
										var degree = findAngle(newposition,map.getZoom())-oldangle;
				
										var coords = (function(coords){
											var newArray = [];
											if( isArray(coords) )
												for(var i=0;i<coords.length;i++){
													if( isArray(coords[i])&&isArray(coords[i][0]) )
														newArray[i] = arguments.callee(coords[i]);
													else newArray[i] = rotateOnePoint(coords[i],degree,zoom);
												}
												return newArray;
										})(arrayClone.call(oldcoordinates));
										workObject.geometry.setCoordinates(coords);
									break;

									case 7:
									case 9:
									case 6:
									case 8:
									case 1:
									case 3:
									case 4:
										newposition = findFirstCoord(e.get('target').geometry.getCoordinates());
										scale = [1,1];
										switch(ob){
											case 7:
												scale[0] = Math.abs((newposition[0] - self.bounde[0][0])/(oldposition[0] - self.bounde[0][0]));
											break;
											case 9:
												scale[0] = Math.abs((newposition[0] - self.bounde[1][0])/(oldposition[0] - self.bounde[1][0]));
											break;
											case 6:
												scale[1] = Math.abs((newposition[1] - self.bounde[1][1])/(oldposition[1] - self.bounde[1][1]));
											break;
											case 8:
												scale[1] = Math.abs((newposition[1] - self.bounde[0][1])/(oldposition[1] - self.bounde[0][1]))
											break;
											case 1:
											case 3:
											case 4:
												scale = [
													Math.abs((newposition[0] - center[0])/(oldposition[0] - center[0])),
													Math.abs((newposition[1] - center[1])/(oldposition[1] - center[1]))
												];
											break;
										};
										var coords = (function(coords){
											var newArray = [];
											if( isArray(coords) )
												for(var i=0;i<coords.length;i++){
													if( isArray(coords[i])&&isArray(coords[i][0]) )
														newArray[i] = arguments.callee(coords[i]);
													else{ 
														switch(ob){
															case 7:
																newArray[i] = [
																	(coords[i][0]-self.bounde[0][0])*scale[0]+self.bounde[0][0],
																	coords[i][1]
																];
															break;
															case 9:
																newArray[i] = [
																	(coords[i][0]-self.bounde[1][0])*scale[0]+self.bounde[1][0],
																	coords[i][1]
																];
															break;
															case 6:
																newArray[i] = [
																	coords[i][0],
																	(coords[i][1]-self.bounde[1][1])*scale[1]+self.bounde[1][1]
																];
															break;	
															case 8:
																newArray[i] = [
																	coords[i][0],
																	(coords[i][1]-self.bounde[0][1])*scale[1]+self.bounde[0][1]
																];
															break;
															case 1:
															case 3:
															case 4:
																newArray[i] = [
																	(coords[i][0]-center[0])*scale[0]+center[0],
																	(coords[i][1]-center[1])*scale[1]+center[1]
																];
															break;
														}
													}
												}
												return newArray;
										})( arrayClone.call(oldcoordinates) );
										if( self.metaType!='circle' )
											workObject.geometry.setCoordinates(coords);
										else{
											workObject.geometry.setRadius(oldradius*Math.max(scale[0],scale[1]));
										}
									break;
								}
						})
						.add('dragend',function(){self.noUpdate = false;self.show();});
				})(ob);
			}
			self.hide();
			map.events.add(['boundschange', 'typechange', 'balloonclose'], function(){
				self.updateValues();
				self.update();
			}); 
		}	
	}
	var rotateOnePoint = function ( d,fi,zoom ){
		var tx = 0,
				_d = proj.toGlobalPixels(d,zoom),
				_center = proj.toGlobalPixels(center,zoom);
		
		_d[0] = _d[0] - _center[0];
		_d[1] = _d[1] - _center[1];

		tx = _d[0];
		_d[0] = tx * Math.cos(fi) -  _d[1] * Math.sin(fi);
		_d[1] = tx * Math.sin(fi) + _d[1] * Math.cos(fi);

		_d[0] = _d[0] + _center[0];
		_d[1] = _d[1] + _center[1];

		return proj.fromGlobalPixels(_d,zoom);
	};
	
	self.init = function( obj ){
		var metaType = obj.properties.getAll().metaType?obj.properties.getAll().metaType.toLowerCase():'polygon';
		if( !supportMetaTypes[metaType] )
			return;
			
		workObject = obj;
		self.metaType = metaType;
		if( oldFocusObject )
			oldFocusObject.events
				.remove('geometrychange',self.update);
		workObject.events
			.add('geometrychange',self.update);
		oldFocusObject = workObject;
		self.updateValues();
		self.show();
	};
	
	self.updateValues = function(){
		x = proj.fromGlobalPixels ([5,30], map.getZoom());
		y = proj.fromGlobalPixels ([0,0], map.getZoom());
	};
	self.noUpdate = false;
	
	self.update = function(){
		if( self.noUpdate||!workObject )
			return true;
		
		bounde = self.bounde = findBoundeBox();
		
		sizerBoxContainer[1].geometry.setCoordinates([[bounde[0][0]-Math.abs(x[0]-y[0]),bounde[0][1]-Math.abs(x[1]-y[1])],[bounde[0][0]+Math.abs(x[0]-y[0]),bounde[0][1]+Math.abs(x[1]-y[1])]]);
		sizerBoxContainer[3].geometry.setCoordinates([[bounde[1][0]-Math.abs(x[0]-y[0]),bounde[1][1]-Math.abs(x[1]-y[1])],[bounde[1][0]+Math.abs(x[0]-y[0]),bounde[1][1]+Math.abs(x[1]-y[1])]]);
		sizerBoxContainer[4].geometry.setCoordinates([[bounde[0][0]-Math.abs(x[0]-y[0]),bounde[1][1]-Math.abs(x[1]-y[1])],[bounde[0][0]+Math.abs(x[0]-y[0]),bounde[1][1]+Math.abs(x[1]-y[1])]]);
		bc = getBoundeCenter();
		
		sizerBoxContainer[5].geometry.setCoordinates([[bc[0]-Math.abs(x[0]-y[0]),bc[1]-Math.abs(x[1]-y[1])],[bc[0]+Math.abs(x[0]-y[0]),bc[1]+Math.abs(x[1]-y[1])]]);
		sizerBoxContainer[2].geometry.setCoordinates([bounde[1][0],bounde[0][1]]);
		
		sizerBoxContainer[6].geometry.setCoordinates([bounde[0],[bounde[1][0],bounde[0][1]]]);
		sizerBoxContainer[7].geometry.setCoordinates([[bounde[1][0],bounde[0][1]],bounde[1]]);
		sizerBoxContainer[8].geometry.setCoordinates([bounde[1],[bounde[0][0],bounde[1][1]]]);
		sizerBoxContainer[9].geometry.setCoordinates([[bounde[0][0],bounde[1][1]],bounde[0]]);
	};
	
	self.show = function (){
		self.update();
		for(var i=1;isset(sizerBoxContainer[i]);i++){
			if( self.metaType.toLowerCase()=='circle'&&i==2 )
				continue;
			sizerBoxContainer[i].options.set({visible:true});
		}
	};
	
	self.hide = function (j){
		for(var i=1;isset(sizerBoxContainer[i]);i++)
			if( i!==j&&!(isset(j)&&i==5) )
				sizerBoxContainer[i].options.set({visible:false});
	};
	
	_init();
};