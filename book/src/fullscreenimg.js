var fullscreenStatus = false
var rotate_press = false
var rotate_deg = 0
var $ = document.querySelector.bind(document)
var $$ = document.querySelectorAll.bind(document)


function fullscreen(e){
	fullscreenStatus = true
	var fullscreenbg = document.createElement('div')
	fullscreenbg.setAttribute('id', 'fullscreenbg')
	document.body.appendChild(fullscreenbg)
	
	var fullscreenimg = document.createElement('img')
	fullscreenimg.setAttribute('id', 'fullscreenimg')
	fullscreenimg.setAttribute('src',e.src)
	$('#fullscreenbg').appendChild(fullscreenimg)
	
	var rotateL_button = document.createElement('button')
	rotateL_button.setAttribute('class', 'rotate')
	rotateL_button.setAttribute('id', 'rotateL')
	rotateL_button.innerHTML ="&#8630;"//↶
	rotateL_button.setAttribute("onmousedown", 'rotateL()')
	rotateL_button.setAttribute("onmouseup", "rotate_end()")
	$('#fullscreenbg').appendChild(rotateL_button)

	var rotateR_button = document.createElement('button')
	rotateR_button.setAttribute('class', 'rotate')
	rotateR_button.setAttribute('id', 'rotateR')
	rotateR_button.innerHTML ="&#8631;"// ↷
	rotateR_button.setAttribute("onmousedown", 'rotateR()')
	rotateR_button.setAttribute("onmouseup", "rotate_end()")
	$('#fullscreenbg').appendChild(rotateR_button)

	wheelzoom($('#fullscreenimg'))
}

$$('img:not(#fullscreenbg)').forEach(e => e.addEventListener('click', () => {
	fullscreen(e);
	$("#fullscreenbg").addEventListener('mousedown', () => {
		var mousedowntime = Date.now()
		var initposX = window.event.clientX
		var initposY = window.event.clientY
		$("#fullscreenbg").addEventListener('mouseup', removeFullScreenImg)

		function removeFullScreenImg(){
			let mouseuptime = Date.now()
			let finalposX = window.event.clientX
			let finalposY = window.event.clientY
			if(mouseuptime - mousedowntime < 1000 && Math.abs(initposX - finalposX) < 5 && Math.abs(initposY - finalposY) < 5){
				$("#fullscreenbg").removeEventListener('mouseup', removeFullScreenImg)
				if(fullscreen && !rotate_press){
					rotate_deg = 0
					$('#fullscreenimg')?.dispatchEvent(new CustomEvent('wheelzoom.destroy'))
					$('#fullscreenbg').remove()
					fullscreenStatus = false
				}
			}
		}
	})
}))

function rotateR () {
	rotate_press = true
	$('#fullscreenimg').dispatchEvent(new CustomEvent('wheelzoom.rotateR'))
}

function rotateL () {
	rotate_press = true
	$('#fullscreenimg').dispatchEvent(new CustomEvent('wheelzoom.rotateL'))
}



function rotate_end() {
	setTimeout(() => rotate_press = false, 1)
}

