/*!
	Wheelzoom 4.0.1
	license: MIT
	http://www.jacklmoore.com/wheelzoom
*/
window.wheelzoom = (function(){
	var defaults = {
		zoom: 0.10,
		maxZoom: false,
		initialZoom: 1,
		initialX: 0.5,
		initialY: 0.5,
		maxSize: 'container'
	};

	var main = function(img, options){
		if (!img || !img.nodeName || img.nodeName !== 'IMG') { return; }

		var settings = {};
		var width;
		var height;
		var bgWidth;
		var bgHeight;
		var bgPosX;
		var bgPosY;
		var previousEvent;
		var transparentSpaceFiller;
		var originalHeight
		var originalWidth
		var firstload = false
		var rotate_deg = 0

		function rotateL(){
			rotate_deg += 90

			if(rotate_deg == 360)
				rotate_deg = 0

			reset()
		}

		function rotateR(){
			rotate_deg -= 90

			if(rotate_deg == -90)
				rotate_deg = 270

			reset()
		}

		function setSrcToBackground(img) {
			img.style.backgroundRepeat = 'no-repeat'
			img.style.backgroundImage = `url("${img.src}")`
			transparentSpaceFiller = 'data:image/svg+xml;base64,'+window.btoa('<svg xmlns="http://www.w3.org/2000/svg" width="'+img.naturalWidth+'" height="'+img.naturalHeight+'"></svg>');
			img.src = transparentSpaceFiller

			img.style.width = `${width}px`
			img.style.height = `${height}px`
		}

		function updateBgStyle() {
			var containerWidth 
			var containerHeight
			if(settings.maxSize == 'originalSize'){
				containerWidth = originalWidth
				containerHeight = originalHeight				
			}else{//containerSize
				containerWidth = img.parentNode.getBoundingClientRect().width
				containerHeight = img.parentNode.getBoundingClientRect().height
			}

			if (bgPosX > 0) 
				bgPosX = 0
			else if (bgPosX < containerWidth - bgWidth && (rotate_deg == 0 || rotate_deg == 180))
				bgPosX = containerWidth - bgWidth
			else if (bgPosX < containerHeight - bgWidth && (rotate_deg == 90 || rotate_deg == 270))
				bgPosX = containerHeight - bgWidth

			if (bgPosY > 0)
				bgPosY = 0
			else if (bgPosY < containerHeight - bgHeight && (rotate_deg == 0 || rotate_deg == 180))
				bgPosY = containerHeight - bgHeight
			else if (bgPosY < containerWidth - bgHeight && (rotate_deg == 90 || rotate_deg == 270))
				bgPosY = containerWidth - bgHeight

			img.style.backgroundSize = `${bgWidth}px ${bgHeight}px`
			
			switch (rotate_deg){
				case 0:
				case 180:
					img.style.width = (bgWidth < containerWidth) ? `${bgWidth}px` : `${containerWidth}px`
					img.style.height = (bgHeight < containerHeight) ? `${bgHeight}px` : `${containerHeight}px`

					if (bgWidth < containerWidth)
						bgPosX = 0
					
					if (bgHeight < containerHeight)
						bgPosY = 0
					break
				case 90:
				case 270:
					img.style.width = (bgWidth < containerHeight) ? `${bgWidth}px` : `${containerHeight}px`
					img.style.height = (bgHeight < containerWidth) ? `${bgHeight}px` : `${containerWidth}px`

					if (bgWidth < containerHeight)
						bgPosX = 0
						
					if (bgHeight < containerWidth)
						bgPosY = 0						
			}

			img.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`
		}

		function reset() {
			var containerRect = img.parentNode.getBoundingClientRect()

			resetOriginalStyle()
			originalWidth = img.width
			originalHeight = img.height

			initStyle()
			img.style.height = img.style.width = ''
			
			img.style.backgroundPosition = `0px 0px`
		
			setImgSize()
		
			function setImgSize(){
				switch(rotate_deg){
					case 0:
					case 180:
						img.style.maxWidth =
						`${(settings.maxSize == 'container') ? containerRect.width : originalWidth}px`
						img.style.maxHeight = 
						`${(settings.maxSize == 'container') ? containerRect.height : originalHeight}px`
						img.style.width = `${img.width}px`
						img.style.height = `${img.height}px`
						img.style.backgroundSize = `${img.width}px ${img.height}px`
						break
					case 90:
					case 270:
						img.style.maxWidth = 
						`${(settings.maxSize == 'container') ? containerRect.height : originalHeight}px`
						img.style.maxHeight = 
						`${(settings.maxSize == 'container') ? containerRect.width : originalWidth}px`
						img.style.width = `${img.width}px`
						img.style.height = `${img.height}px`
						img.style.backgroundSize = `${img.height}px ${img.width}px`
				}
			}


			width = img.width
			height = img.height
			if (rotate_deg == 90 || rotate_deg == 270){
				bgWidth = width
				bgHeight = height
			}
			else if (rotate_deg == 0 || rotate_deg == 180){
				bgWidth = height
				bgHeight = width
			}

			img.style.maxWidth = 'none'
			img.style.maxHeight = 'none'

			bgWidth = width
			bgHeight = height

			bgPosX = bgPosY = 0
			updateBgStyle()
		}

		function onwheel(e) {
			var deltaY = 0;

			e.preventDefault();

			if (e.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
				deltaY = e.deltaY;
			} else if (e.wheelDelta) {
				deltaY = -e.wheelDelta;
			}

			// As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
			// We have to calculate the target element's position relative to the document, and subtrack that from the
			// cursor's position relative to the document.
			var rect = img.getBoundingClientRect();
			var offsetX = e.pageX - rect.left - window.pageXOffset;
			var offsetY = e.pageY - rect.top - window.pageYOffset;


			// Record the offset between the bg edge and cursor:
			var bgCursorX
			var bgCursorY
			switch(rotate_deg){
				case 0:
					bgCursorX = offsetX - bgPosX;
					bgCursorY = offsetY - bgPosY;
					break
				case 90:
					bgCursorX = offsetX - bgPosY;
					bgCursorY = e.target.width - offsetY - bgPosX;
					break
				case 180:
					bgCursorX = e.target.width - offsetX - bgPosX;
					bgCursorY = e.target.height - offsetY - bgPosY;
					break
				case 270:
					bgCursorX = e.target.height - offsetX - bgPosY;
					bgCursorY = offsetY - bgPosX;
			}
			
			// Use the previous offset to get the percent offset between the bg edge and cursor:
			var bgRatioX = bgCursorX/bgWidth
			var bgRatioY = bgCursorY/bgHeight

			// Update the bg size:
			if (deltaY < 0) {
				bgWidth += bgWidth*settings.zoom;
				bgHeight += bgHeight*settings.zoom;
			} else {
				bgWidth -= bgWidth*settings.zoom;
				bgHeight -= bgHeight*settings.zoom;
			}

			if (settings.maxZoom) {
				bgWidth = Math.min(originalWidth*settings.maxZoom, bgWidth);
				bgHeight = Math.min(originalHeight*settings.maxZoom, bgHeight);
			}


			// Take the percent offset and apply it to the new size:
			switch(rotate_deg){
				case 0:
					bgPosX = offsetX - (bgWidth * bgRatioX)
					bgPosY = offsetY - (bgHeight * bgRatioY)
					break
				case 90:
					bgPosY = offsetX - (bgWidth * bgRatioX)
					bgPosX = (e.target.width - offsetY) - (bgHeight * bgRatioY)
					break
				case 180:
					bgPosX = (e.target.width - offsetX) - (bgWidth * bgRatioX)
					bgPosY = (e.target.height - offsetY) - (bgHeight * bgRatioY)
					break
				case 270:
					bgPosY = (e.target.height - offsetX) - (bgWidth * bgRatioX)
					bgPosX = offsetY - (bgHeight * bgRatioY)
			}

			// Prevent zooming out beyond the starting size
			if (bgWidth <= width || bgHeight <= height) {
				//reset();
				img.style.width = ''
				img.style.height = ''
	
				bgWidth = width
				bgHeight = height
	
				bgPosX = bgPosY = 0
				updateBgStyle()
			} else {
				updateBgStyle();
			}
		}

		function drag(e) {
			e.preventDefault();
			switch(rotate_deg){
				case 0:
					bgPosX += (e.pageX - previousEvent.pageX)
					bgPosY += (e.pageY - previousEvent.pageY)
					break
				case 90:
					bgPosY += (e.pageX - previousEvent.pageX)
					bgPosX -= (e.pageY - previousEvent.pageY)
					break
				case 180:
					bgPosX -= (e.pageX - previousEvent.pageX)
					bgPosY -= (e.pageY - previousEvent.pageY)
					break
				case 270:
					bgPosY -= (e.pageX - previousEvent.pageX)
					bgPosX += (e.pageY - previousEvent.pageY)
			}

			previousEvent = e;
			updateBgStyle();
		}

		function removeDrag() {
			img.style.cursor = 'auto'
			document.removeEventListener('mouseup', removeDrag);
			document.removeEventListener('mousemove', drag);
		}

		// Make the background draggable
		function draggable(e) {
			e.preventDefault();
			previousEvent = e;
			img.style.cursor = 'move'
			document.addEventListener('mousemove', drag);
			document.addEventListener('mouseup', removeDrag);
		}

		function load() {
			var initial = Math.max(settings.initialZoom, 1);

			if(!firstload){
				originalWidth = img.width
				originalHeight = img.height
				initStyle()

				firstload = true
			}

			if (img.src === transparentSpaceFiller) return;

			var computedStyle = window.getComputedStyle(img, null);

			width = parseFloat(computedStyle.width);
			height = parseFloat(computedStyle.height);
			bgWidth = width * initial;
			bgHeight = height * initial;
			bgPosX = -(bgWidth - width) * settings.initialX;
			bgPosY = -(bgHeight - height) * settings.initialY;

			setSrcToBackground(img);

			img.style.backgroundSize = `${bgWidth}px ${bgHeight}px`
			img.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`
			img.addEventListener('wheelzoom.reset', reset);
			img.addEventListener('wheel', onwheel);
			img.addEventListener('mousedown', draggable);
			window.addEventListener('resize',resize);
		}

		function resize(){
			computedStyle = window.getComputedStyle(img, null);
			width = parseInt(computedStyle.width, 10);
			height = parseInt(computedStyle.height, 10);
			reset()
		}

		//make img center
		function initStyle(){
			img.style.position = 'absolute'
			img.style.top = '50%'
			img.style.left = '50%'
			img.style.transform = `translate(-50%, -50%) rotate(-${rotate_deg}deg)` 
		}

		function destroy (){
			img.removeEventListener('wheelzoom.destroy', destroy);
			img.removeEventListener('wheelzoom.rotateR', destroy)
			img.removeEventListener('wheelzoom.rotateL', destroy)
			img.removeEventListener('wheelzoom.reset', reset);
			img.removeEventListener('load', load);
			img.removeEventListener('mouseup', removeDrag);
			img.removeEventListener('mousemove', drag);
			img.removeEventListener('mousedown', draggable);
			img.removeEventListener('wheel', onwheel);
			window.removeEventListener('resize',resize);

			resetOriginalStyle()
		}

		//record original style of img
		var resetOriginalStyle = function (originalProperties) {
			img.style.backgroundImage = originalProperties.backgroundImage;
			img.style.backgroundRepeat = originalProperties.backgroundRepeat;
			img.style.backgroundPosition = originalProperties.backgroundPosition
			img.style.backgroundSize = originalProperties.backgroundSize
			img.src = originalProperties.src;
			img.style.top = originalProperties.top
			img.style.left = originalProperties.left
			img.style.width = originalProperties.width
			img.style.height = originalProperties.height
			img.style.maxWidth = originalProperties.maxWidth
			img.style.maxHeight = originalProperties.maxHeight
			img.style.transform = originalProperties.transform
			img.style.position = originalProperties.position
		}.bind(null, {
			backgroundImage: img.style.backgroundImage,
			backgroundRepeat: img.style.backgroundRepeat,
			backgroundPosition: img.style.backgroundPosition,
			backgroundSize: img.style.backgroundSize,
			src: img.src,
			top: img.style.top,
			left: img.style.left,
			width: img.style.width,
			height: img.style.height,
			maxWidth: img.style.maxWidth,
			maxHeight: img.style.maxHeight,
			transform: img.style.transform,
			position: img.style.position
		});

		img.addEventListener('wheelzoom.destroy', destroy);
		img.addEventListener('wheelzoom.rotateL', rotateL);
		img.addEventListener('wheelzoom.rotateR', rotateR);

		options = options || {};

		Object.keys(defaults).forEach(function(key){
			settings[key] = options[key] !== undefined ? options[key] : defaults[key];
		});

		if (img.complete) {
			load();
			reset()
		}

		img.addEventListener('load', load);
	};

	// Do nothing in IE9 or below
	if (typeof window.btoa !== 'function') {
		return function(elements) {
			return elements;
		};
	} else {
		return function(elements, options) {
			if (elements && elements.length) {
				Array.prototype.forEach.call(elements, function (node) {
					main(node, options);
				});
			} else if (elements && elements.nodeName) {
				main(elements, options);
			}
			return elements;
		};
	}
}());