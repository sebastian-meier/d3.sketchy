/*global d3:false */
/*jshint unused:false*/

/**
 * Initiate the sketchy library
 * @constructor
 */
var d3sketchy = function(){

	/**
	* Default attributes for generating the shapes, doing this we don't need to check if all parameters are provided
	* And if someone wants to build a lot of shapes with the same properties she just needs to use "setDefaults" to change them
	* @type {object}
	* @defaultvalue
	*/
	var defaults = {
		x:0,
		y:0,
		width:20,
		height:20,
		sketch:1,
		density:1,
		radius:10,
		angle:45,
		count:2,
		shape:"circle",
		clip:"",
		margin:2
	};

	/**
	* Changing the default attributes
	* @param {object} opts - object with default attributes see "var defaults"
	* @return {object} defaults - the full default object
	*/
	function setDefaults(opts){
		defaults = extend(defaults, opts);
		return defaults;
	}

	/**
	* merging two objects, source will replace duplicates in destination
	* @param {object} destination
	* @param {object} source
	*/
	function extend(destination, source) {
		var returnObj = {}, attrname;
		for (attrname in destination) { returnObj[attrname] = destination[attrname]; }
		for (attrname in source) { returnObj[attrname] = source[attrname]; }
		return returnObj;
	}

	/**
	* Generate random number between min and max
	* @param {float|int} min
	* @param {float|int} max
	* @return {float}
	*/
	function rand(min, max){
		return Math.random()* (max-min) + min;
	}

	/**
	* Create sketchy
	* @constructor
	*/
	function sketchy(){
	}

	/**
	* drawing a sketchy line
	* this is kind of the heart of the whole tool.
	* so if you want to make changes to the appearance of the lines, tweak the following lines
	* @param {object} opts
	* @param {d3.selection} opts.svg
	* @param {float|int} opts.x1 - x point 1
	* @param {float|int} opts.y1 - y point 1
	* @param {float|int} opts.x2 - x point 2
	* @param {float|int} opts.y2 - y point 2
	* @param {object} opts.sketch
	* @param {object} opts.sketch.x - sketchiness on the x-axis
	* @param {object} opts.sketch.y - sketchiness on the y-axis
	*/
	sketchy.drawLine = function(opts){
		//Each line is drawn twice the increase sketchiness
		for(var i = 1; i<3; i++){

			var or2 = rand(0.2, 0.8);

			var cx2 = opts.x1+ (opts.x2-opts.x1)*or2+rand(-1,1);
			var cy2 = opts.y1+ (opts.y2-opts.y1)*or2+rand(-1,1);

			var or1 = or2 + rand(-0.3, -0.2);

			var cx1 = opts.x1+ (opts.x2-opts.x1)*or1+rand(-1,1);
			var cy1 = opts.y1+ (opts.y2-opts.y1)*or1+rand(-1,1);

			opts.svg.append("path")
				.attr("d", "M"+
								(opts.x1 + rand(-1,0)*opts.sketch.x/i)+" "+
								(opts.y1 + rand(-1,1)*opts.sketch.y/i)+" Q"+
								cx1+" "+cy1+" "+
								cx2+" "+cy2+" T"+
								(opts.x2 + rand(0,1)*opts.sketch.x/i)+" "+
								(opts.y2 + rand(-1,1)*opts.sketch.y/i));

		}
	};

	/**
	* drawing a circle shape
	* no outline just the fill
	* @param {object} opts - object containing the attributes
	* @param {float|int} opts.x - x position
	* @param {float|int} opts.y - y position
	* @param {float|int} opts.r - radius
	* @param {float|int} opts.angle - angle of the lines (0-360)
	* @param {float|int} opts.density - distance between lines
	* @param {float|int} opts.sketch - sketchiness factor
	* @param {string} opts.shape - this is a development relic, default is "circle", alternatives "cut" and "star"
	* @return {object} svg - d3.selection of a group object, containing the circle
	*/
	sketchy.circleFill = function(opts){
		//merging default attributes with user attributes
		var merged_opts = extend(defaults, opts);

		//create a container, this is used to translate and rotate the circle, this container will be returned at the end of this function
		var svg = merged_opts.svg.append("g").attr("transform", "translate("+merged_opts.x+" "+merged_opts.y+") rotate("+merged_opts.angle+")");

		//Looping through the lines
		var y_dist = 0;
		while(y_dist > -2*opts.r){
			var x;
			//During the development i accidentaly generated those shapes and kept them :)
			if(merged_opts.shape==="cut"){
				x = Math.sqrt( ( Math.pow(merged_opts.r, 2) - Math.pow((merged_opts.r-Math.abs(y_dist)), 2) ) );
			}else if(merged_opts.shape==="star"){
				x = merged_opts.r - Math.sqrt( ( Math.pow(merged_opts.r, 2) - Math.pow((merged_opts.r-Math.abs(y_dist)), 2) ) );
			}else{
				x = Math.sqrt( ( Math.pow(merged_opts.r, 2) - Math.pow((merged_opts.r-Math.abs(y_dist)), 2) ) );
			}

			//Draw the sketchy lines
			sketchy.drawLine({
				svg:svg,
				x1:-x,
				y1:y_dist+merged_opts.r,
				x2:x,
				y2:y_dist+merged_opts.r,
				sketch:{
					x:merged_opts.density*merged_opts.sketch,
					y:merged_opts.density*merged_opts.sketch
				}
			});

			y_dist -= merged_opts.density;
		}

		return svg;
	};

	/**
	* draws a rectangle
	* no outline just the fill
	* @param {object} opts - object containing the attributes
	* @param {float|int} opts.x - x position
	* @param {float|int} opts.y - y position
	* @param {float|int} opts.width - width
	* @param {float|int} opts.height - height
	* @param {float|int} opts.angle - angle of the lines (0-360)
	* @param {float|int} opts.density - distance between lines
	* @param {float|int} opts.sketch - sketchiness factor
	* @return {object} svg - d3.selection of a group object, containing the rectangle
	*/
	sketchy.rectFill = function(opts){
		var svg = opts.svg.append("g").attr("transform", "translate("+opts.x+" "+opts.y+")");
		opts.svg = svg;
		return sketchy.drawPattern(opts);
	};

	/**
	* draws a background pattern in the shape of a square according to x,y,with,height
	* @param {object} opts - object containing the attributes
	* @param {float|int} opts.x - x position
	* @param {float|int} opts.y - y position
	* @param {float|int} opts.width - width
	* @param {float|int} opts.height - height
	* @param {float|int} opts.angle - angle of the lines (0-360)
	* @param {float|int} opts.density - distance between lines
	* @param {float|int} opts.sketch - sketchiness factor
	* @return {object} svg - d3.selection of a group object, containing the background
	*/
	sketchy.drawPattern = function(opts){
		var svg = opts.svg;

		//angle for strokes
		var angle = opts.angle;
		while(angle > 360){angle -= 360;}
		if(angle > 180){angle -= 180;}
		var radian = (Math.PI/180)*(90-angle);
		var vector = {
			y:1,
			x:-1/Math.tan(radian)
		};

		//distance between strokes
		var dist = opts.density;

		var vy, tx, ty, vx, y1, x1, y_dist, x_dist;

		var x = opts.x, y = opts.y;
		if(Math.abs(angle) === 90){
			while(y < opts.y+opts.height){
				sketchy.drawLine({
					svg:svg,
					x1:x,
					y1:y,
					x2:x+opts.width,
					y2:y,
					sketch:{
						x:dist*opts.sketch,
						y:dist*opts.sketch
					}
				});
				y += dist;
			}
		}else if((Math.abs(angle) === 180)||(angle === 0)){
			while(x < opts.x+opts.width){
				sketchy.drawLine({
					svg:svg,
					x1:x,
					y1:y,
					x2:x,
					y2:y+opts.height,
					sketch:{
						x:dist*opts.sketch,
						y:dist*opts.sketch
					}
				});
				x += dist;
			}
		}else if(angle < 90){
			y_dist = Math.abs(dist / Math.sin(Math.PI/180*angle));
			x_dist = Math.abs(dist / Math.sin(Math.PI/180*(90-angle)));

			y += y_dist;
			y1 = opts.y;
			x1 = opts.x;
			while(y1 < opts.y+opts.height){
				vx = opts.width / vector.x;
				x1 = opts.width + x;
				y1 = y + vector.y * vx;
				ty = y;
				tx = x;

				if(y1<opts.y){
					vy = (y-opts.y)/vector.y;
					x1 = x + Math.abs(vector.x) * vy;
					y1 = opts.y;
				}else if(y > (opts.y+opts.height)){
					ty = opts.y+opts.height;
					vy = (ty-y1)/vector.y;
					tx = x + opts.width - vy*Math.abs(vector.x);
				}

				sketchy.drawLine({
					svg:svg,
					x1:tx,
					y1:ty,
					x2:x1,
					y2:y1,
					sketch:{
						x:x_dist*opts.sketch,
						y:y_dist*opts.sketch
					}
				});

				y += y_dist;
			}

		}else{
			y_dist = Math.abs(dist / Math.sin(Math.PI/180*angle));
			x_dist = Math.abs(dist / Math.sin(Math.PI/180*(180-angle)));

			y = opts.y+opts.height;
			y -= y_dist;
			y1 = opts.y+opts.height;
			x1 = opts.x;
			while(y1 > opts.y){
				vx = opts.width / vector.x;
				x1 = opts.width + x;
				y1 = y + vector.y * vx;
				ty = y;
				tx = x;

				if(y1>(opts.y+opts.height)){
					vy = (y-(opts.y+opts.height))/vector.y;
					x1 = x + Math.abs(vector.x * vy);
					y1 = opts.y+opts.height;
				}else if(y < opts.y){
					ty = opts.y;
					vy = (ty-y1)/vector.y;
					tx = x + opts.width - Math.abs(vy*vector.x);
				}

				sketchy.drawLine({
					svg:svg,
					x1:tx,
					y1:ty,
					x2:x1,
					y2:y1,
					sketch:{
						x:x_dist*opts.sketch,
						y:y_dist*opts.sketch
					}
				});

				y -= y_dist;
			}
		}

		return svg;
	};

	/**
	* draws a background pattern in the shape of a square according to the position and size of the clip-path object
	* @param {object} opts - object containing the attributes
	* @param {string} opts.clip - id of the clip path
	* @param {float|int} opts.angle - angle of the lines (0-360)
	* @param {float|int} opts.density - distance between lines
	* @param {float|int} opts.sketch - sketchiness factor
	* @param {float|int} opts.margin - extra margin for the background
	* @return {object} svg - d3.selection of a group object, containing the background
	*/
	sketchy.fill = function(opts){
		var merged_opts = extend(defaults, opts);

		var svg = merged_opts.svg.append("g")
			.attr("clip-path", "url(#"+merged_opts.clip+")");

		//Get the bounding box of the object that wants a background
		var bb = d3.select("#"+merged_opts.clip).node().getBBox();

		//To make sure that the background covers the whole are we increase the background by a few pixels
		merged_opts.x = bb.x-merged_opts.margin;
		merged_opts.y = bb.y-merged_opts.margin;
		merged_opts.width = bb.width + 2*merged_opts.margin;
		merged_opts.height = bb.height + 2*merged_opts.margin;
		merged_opts.svg = svg;

		return sketchy.drawPattern(merged_opts);
	};

	

	/**
	* draws a background pattern in the shape of a square according to the position and size of the clip-path object
	* @param {object} opts - object containing the attributes
	* @param {array} opts.path - array of points {x:float|integer, y:float|integer}
	* @param {int} opts.count - how many altered paths should be generated
	* @param {float|int} opts.sketch - sketchiness factor
	* @return {array} paths - altered paths
	*/
	sketchy.alterPath = function(opts){
		var merged_opts = extend(defaults, opts);
		var paths = [];
		for(var i = 0; i<merged_opts.count; i++){
			var t_path = [];
			for(var j = 0; j<merged_opts.path.length; j++){
				t_path.push({
					x:merged_opts.path[j].x + rand(-1,1)*merged_opts.sketch/(i+1),
					y:merged_opts.path[j].y + rand(-1,1)*merged_opts.sketch/(i+1)
				});
			}
			paths.push(t_path);
		}
		return paths;
	};

	/**
	* Draws alterPath() paths
	* only straight lines, use alterPath and your own drawing function to draw curves etc.
	* @param {object} opts - object containing the attributes
	* @param {array} opts.svg - d3.selection of an svg
	* @param {array} opts.path - array of points {x:float|integer, y:float|integer}
	* @param {int} opts.count - how many altered paths should be generated
	* @param {float|int} opts.sketch - sketchiness factor
	* @return {object} svg - svg with the strokes
	*/
	sketchy.pathStroke = function(opts){
		var paths = sketchy.alterPath(opts);
		var svg = opts.svg.append("g");
		for(var i = 0; i<paths.length; i++){
			for(var j = 0; j<paths[i].length; j++){
				var x1 = paths[i][j].x;
				var y1 = paths[i][j].y, x2, y2;
				if(j<(paths[i].length-1)){
					x2 = paths[i][j+1].x;
					y2 = paths[i][j+1].y;
				}else{
					x2 = paths[i][0].x;
					y2 = paths[i][0].y;
				}
				sketchy.drawLine({
					svg:svg,
					x1:x1,
					y1:y1,
					x2:x2,
					y2:y2,
					sketch:{
						x:opts.sketch,
						y:opts.sketch
					}
				});
			}
		}
		return svg;
	};

	/**
	* Helper function for circleStroke
	* Adapted from http://codepen.io/spencerthayer/pen/nhjwu
	* Generates an altered circle path
	* @param {float|int} radius - radius of the circle
	* @param {float|int} radius_min - alternating radius min
	* @param {float|int} radius_max - alternating radius max
	* @param {float|int} s_angle_min - alternating angle min
	* @param {float|int} s_angle_max - alternating angle max
	* @param {float|int} rotation_min - alternating rotation min
	* @param {float|int} rotation_max - alternating rotation max
	* @return {string} path - altered circle svg path
	*/
	function circlePath(radius, radius_min,radius_max, s_angle_min, s_angle_max, rotation_min,rotation_max) {
		var c = 0.551915024494,
			b = Math.atan(c),
			d = Math.sqrt(c*c+1*1),
			r = radius,
			o = rand(s_angle_min, s_angle_max)*Math.PI/180,
			path = 'M';

		path += [r * Math.sin(o), r * Math.cos(o)];
		path += ' C' + [d * r * Math.sin(o + b), d * r * Math.cos(o + b)];

		for (var i=0; i<4; i++) {
			o += Math.PI/2 * (1 + rand(rotation_min, rotation_max));
			r *= (1 + rand(radius_min, radius_max));
			path += ' ' + (i?'S':'') + [d * r * Math.sin(o - b), d * r * Math.cos(o - b)];
			path += ' ' + [r * Math.sin(o), r * Math.cos(o)];
		}

		return path;
	}

	/**
	* Helper function for circleStroke
	* Adapted from http://codepen.io/spencerthayer/pen/nhjwu
	* Generates the transform value for squashing and rotating
	* @param {float|int} squash_min - squashing min
	* @param {float|int} squash_max - squashing max
	* @param {float|int} squash_rotation_min - squashing rotation min
	* @param {float|int} squash_rotation_max - squashing rotation max
	* @return {string} path - transform string
	*/
	function circleTransform(squash_min, squash_max, squash_rotation_min, squash_rotation_max) {
		var o = rand(squash_rotation_min, squash_rotation_max);
		return 'rotate('+o+')'+'scale(1,'+rand(squash_min, squash_max) + ')';
	}

	/**
	* Draw a sketch circle stroke
	* Adapted from http://codepen.io/spencerthayer/pen/nhjwu
	* @param {object} opts - object containing the attributes
	* @param {object} opts.svg - svg container
	* @param {float|int} opts.x - center x of circle
	* @param {float|int} opts.y - center y of circle
	* @param {float|int} opts.r - radius of circle
	* @param {int} count - number of strokes
	* @param {float|int} sketch - sketchiness factor
	* @return {object} svg - d3.selection of the svg containing the circles
	*/
	sketchy.circleStroke = function(opts){
		var merged_opts = extend(defaults, opts);

		var svg =  merged_opts.svg.append("g").attr('transform', function() { return "translate("+merged_opts.x+" "+merged_opts.y+") "+circleTransform(1,1, 0,360); });

		for(var i = 0; i<merged_opts.count; i++){
			svg.append('path')
				.attr('d', function() {
					return circlePath(merged_opts.r, merged_opts.sketch/-50/(i+1),merged_opts.sketch/10/(i+1), 200,240, 0,merged_opts.sketch/5/(i+1));
				});
		}

		return svg;
	};

	/**
	* Draw a sketch rectangle stroke
	* @param {object} opts - object containing the attributes
	* @param {object} opts.svg - svg container
	* @param {float|int} opts.x - x coordinate
	* @param {float|int} opts.y - y coordinate
	* @param {float|int} opts.width - width
	* @param {float|int} opts.height - height
	* @param {int} count - number of strokes
	* @param {float|int} sketch - sketchiness factor
	* @return {object} svg - d3.selection of the svg containing the rectangles
	*/
	sketchy.rectStroke = function(opts){
		var merged_opts = extend(defaults, opts);
		var svg = merged_opts.svg.append("g");


		var path = [
			{x:merged_opts.x, y:merged_opts.y},
			{x:merged_opts.x+merged_opts.width, y:merged_opts.y},
			{x:merged_opts.x+merged_opts.width, y:merged_opts.y+merged_opts.height},
			{x:merged_opts.x, y:merged_opts.y+merged_opts.height}
		];

		return sketchy.pathStroke({svg:svg, path:path, count:merged_opts.count, sketch:merged_opts.sketch});
	};

	return sketchy;
};