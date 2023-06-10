"use strict"
var inloop = false
var originaltext =[]
var haveinit= false
var booktitle_loop
var scrollCD = false
var resizeCD = false
/*var file = ['Text/cover.html',
			'Text/introduction.html',
			'Text/illustration1.html',
			'Text/illustration2.html',
			'Text/illustration3.html',
			'Text/illustration4.html',
			'Text/contents.html',
            'Text/prologue.html',
            'Text/chapter1.html',
            'Text/chapter2.html',
            'Text/chapter3.html',
            'Text/chapter4.html',
			'Text/postscript.html',
			'Text/backcover.html']*/
var iscrollHeight = 0
var iclientHeight = 0
var iclientWidth = 0
var iclientLength = 0
var iscrollWidth = 0
var iscrollLength = 0
var iscrollPos = 0
var ipage=1
var maxipage = 1
var lastchapter = false
const PAGED = true
const SCROLL = false
var readerMode = SCROLL
var idocname= ''
var bookname = document.querySelector('title').innerHTML
var mode_change = false
const HORIZONTAL = false
const VERTICAL = true
var writing_mode = HORIZONTAL
var writing_mode_change = false
var body_margin_rl = 0
var body_margin_tb = 0
//const j$ = $
var $ = document.querySelector.bind(document)
var $$ = document.querySelectorAll.bind(document)
var idoc = $('#ebook').contentDocument
var ihtml = idoc.querySelector('html')
idoc.$ = document.querySelector.bind(idoc)
idoc.$$ = document.querySelectorAll.bind(idoc)

Node.prototype.$ = function(selector){
	return this.querySelector(selector)
}
Node.prototype.$$ = function(selector){
	return this.querySelectorAll(selector)
}



String.prototype.fixindent = function(indent_count){
	var indent='^'
	for(; indent_count > 0; indent_count --)
		indent += '\t'

	var re = new RegExp(indent,"gm")
	return this.replaceAll(re,'')
} 

document.addEventListener("DOMContentLoaded", () => {
//j$(document).ready(function(){
	$$("sidebar, content a").forEach(e => e.addEventListener('mousemove', () => {
		if(!inloop)
			AutoScroll(e)
	}))
})

document.addEventListener("DOMContentLoaded", () => {
//j$(document).ready(function(){
	$$("content button").forEach(e => e.addEventListener('click', function() {
		if(this.innerHTML == '–'){
			this.innerHTML = '+'
			this.parentNode.parentNode.$$('div ~ a')?.forEach(e => e.style.display = 'none')
		}
		else{
			this.innerHTML = '–'
			this.parentNode.parentNode.$$('div ~ a')?.forEach(e => e.style.display = 'block')		
		}
	}))
})

$('#ebook').addEventListener('load', () => {
//j$('#ebook').load(function(){
    idoc.addEventListener('keyup', e => {
        if(e.keyCode == 39)//right arrow
			nextpage()
		else if(e.keyCode == 37)//left arrow
			lastpage()
    })
	document.addEventListener('keyup', e => {
		if(e.keyCode == 39)//right arrow
			nextpage()
		else if(e.keyCode == 37)//left arrow
			lastpage()
	})
	if(readerMode == SCROLL){
		//var timer
		idoc.addEventListener('scroll',() => {
			//clearTimeout(timer)
			//timer = setTimeout( stopscroll , 250 )
			var currentpos = writing_mode == HORIZONTAL ? ihtml.scrollTop : ihtml.scrollLeft
			//if(writing_mode == HORIZONTAL)
			//	var currentpos = ihtml.scrollTop
			//else
			//	var currentpos = ihtml.scrollLeft

			Cookies.set(`${bookname}_${idocname}_scroll`,currentpos ,{expires: 365 })
			//console.log(bookname,idocname)
		})
		//stopscroll = function(){
		//}
	}
	
	var init_touchX,init_touchY
	var long_touch = true
	var touch_timeout
	var touch_prevent = false
	idoc.addEventListener('touchstart', e => {
        init_touchX = e.touches[0].clientX
		init_touchY = e.touches[0].clientY
		long_touch = false
		if(e.touches[1])
			touch_prevent = true

		touch_timeout = setTimeout(() => long_touch = true,300)
    })
	idoc.addEventListener('touchend', e => {
		if(!touch_prevent){
			let deltaX = e.changedTouches[0].clientX - init_touchX
			let deltaY = e.changedTouches[0].clientY - init_touchY
			clearTimeout(touch_timeout)
			if(-50 < deltaY < 50 ){
				if(writing_mode == HORIZONTAL)
					if(deltaX > 100)
						lastpage()
					else if(deltaX < -100)
						nextpage()
			}
			if(!long_touch){
				if(deltaX == 0 && deltaX == 0){
					if(init_touchX > window.innerWidth / 2){
						if(readerMode == SCROLL){
							if(writing_mode == HORIZONTAL){
								var initiscrollTop = ihtml.scrollTop
								ihtml.scrollTop += ihtml.clientHeight - 15
								if(ihtml.scrollTop == initiscrollTop)
									nextpage()
							}else{
								var initiscrollLeft = ihtml.scrollLeft
								ihtml.scrollLeft -= ihtml.clientWidth + 15
								if(ihtml.scrollLeft == initiscrollLeft)
									nextpage()
							}
						}else{
							nextpage()
						}
					}
					else{
						if(readerMode == SCROLL){
							if(writing_mode == HORIZONTAL){
								var initiscrollTop = ihtml.scrollTop
								ihtml.scrollTop -= ihtml.clientHeight + 15
								if(ihtml.scrollTop == initiscrollTop)
									lastpage()
							}else{
								var initiscrollLeft = ihtml.scrollLeft
								ihtml.scrollLeft += ihtml.clientWidth - 15
								if(ihtml.scrollLeft == initiscrollLeft)
									lastpage()
							}
						}else{
							lastpage()
						}
					}
				}
			}
			long_touch = true
		}else{
			touch_prevent = false
		}
    })
})

function lastpage(){
	if(!scrollCD){
		scrollCD = true
		if(ipage > 1 && readerMode == PAGED){
			ipage--
			switch(writing_mode){
				case VERTICAL:
					idoc.body.style.top = `${-100 * (ipage - 1)}vh`
					break
				case HORIZONTAL:
					idoc.body.style.left = `${-100 * (ipage - 1)}vw`
					break
			}
			setTimeout(() => scrollCD = false, 100)
			Cookies.set(`${bookname}_${idocname}_page`, ipage, {expires: 365 })
		}
		else{
			for(let i = file.length - 1;  i >= 0;  i--){
				if($('#ebook').getAttribute('src') === file[i]){
					if(i > 0)
						changeSrc(file[i-1])
					break
				}
			}
			if(readerMode == PAGED)
				lastchapter = true
			
			setTimeout(() => scrollCD = false, 200)
		}
	}
}

function nextpage(){
	if(!scrollCD){
		scrollCD = true
		if(ipage < maxipage && readerMode == PAGED){
			ipage++
			switch(writing_mode){
				case VERTICAL:
					idoc.body.style.top = `${-100 * (ipage - 1)}vh`
					break
				case HORIZONTAL:
					idoc.body.style.left = `${-100 * (ipage - 1)}vw`
					break
			}
			setTimeout( () => scrollCD = false, 100)
			Cookies.set(`${bookname}_${idocname}_page`,ipage ,{expires: 365 })
		}
		else{
			ipage = 1
			Cookies.set(`${bookname}_${idocname}_page`,1,{expires: 365 })
			for(let i = 0;  i < file.length; i++){
				if($('#ebook').getAttribute('src') === file[i]){
					if(i+1 < file.length)
						changeSrc(file[i+1])
					break
				}
			}

			setTimeout( () => scrollCD = false, 200)
		}
	}
}

var resize_timeout
window.addEventListener('resize', () => {
	clearTimeout(resize_timeout)
	resize_timeout = setTimeout(resize, 10)
})

function resize(){
	if(readerMode == PAGED){
		var current_scroll = ipage * iclientWidth

		//var lastpage = (ipage == maxipage) ? true : false
		//if(ipage == maxipage)
		//	lastpage = true
		idoc.body.style.transition = "initial"
		idoc.body.style.position = ''
		ihtml.scrollLeft = -current_scroll
		ihtml.scrollTop = current_scroll
		
		switch(writing_mode){
			case HORIZONTAL:
				iclientWidth = ihtml.clientWidth
				iscrollWidth = ihtml.scrollWidth
				break
			case VERTICAL:
				iclientWidth = ihtml.clientHeight
				iscrollWidth = ihtml.scrollHeight
				break
		}

		let newipage = Math.round((iscrollWidth * ipage / maxipage) / iclientWidth)
		maxipage = Math.round(iscrollWidth / iclientWidth)
		ipage = newipage
		if(ipage > maxipage)
			ipage = maxipage
		if(ipage < 1)
			ipage = 1
		idoc.body.style.position = 'fixed'
		
		if(writing_mode == VERTICAL)
			idoc.body.style.top = `${-100*(ipage-1)}vh`
		else
			idoc.body.style.left = `${-100*(ipage-1)}vw`
		
		setTimeout( () => idoc.body.style.transition = '', 100)
	}
	if(!resizeCD){
		if(haveinit){
			resizeCD = true

			setTimeout( () => {
				var content = $$("content > div > a, content > a, bookname")
				for(let i = 0;  i < content.length;  i++)
					content[i].innerHTML = originaltext[i]
				clearInterval(booktitle_loop)
				init()
				resizeCD = false
			}, 1000)
		}
	}
}

function init(){
	for (var e of $$("content > div > a, content > a, bookname")){
		if(!haveinit)
			originaltext.push(e.textContent)
		if(e.scrollWidth > e.offsetWidth){
			let text = `${e.textContent}    `
			e.innerHTML=text+text
		}
	}

	if(!haveinit){
		$$(`[href="javascript:changeSrc('${file[0]}');"]`).forEach(e => e.classList.add("currentcontent"))
		
		if(Cookies.get(`${bookname}_cache_iframe`) !== undefined)
			changeSrc(Cookies.get(`${bookname}_cache_iframe`))
		else
			changeSrc(file[0])
		
		if(Cookies.get('WritingMode') !== undefined){
			if(Cookies.get('WritingMode') == VERTICAL.toString()){
				$('#writing_mode_v').checked = true
				writing_mode = VERTICAL
			}
		}
		
		if(Cookies.get('ReaderMode') !== undefined){
			if(Cookies.get('ReaderMode') == PAGED.toString()){
				$('#mode_paged').checked = true
				readerMode = PAGED
				switch (writing_mode){
					case HORIZONTAL:
						iclientHeight = ihtml.clientHeight
						iscrollHeight = ihtml.scrollHeight
						iscrollPos = ihtml.scrollTop
						break
					case VERTICAL:
						iclientHeight = ihtml.clientWidth
						iscrollHeight = ihtml.scrollWidth
						iscrollPos = -ihtml.scrollLeft
						break
				}
			}
		}
	}
	
	AutoScroll($("bookname"))
	haveinit = true
}


function AutoScroll(e){
	if(e.scrollWidth > document.body.offsetWidth/4){
		if(e == $("bookname"))
			booktitle_loop = setInterval(scroll,20)
		else{
			var loop = setInterval(scroll,6)
			inloop = true
		}
		function scroll(){
			if(e != $(":hover") && e != $("bookname")){
				clearInterval(loop)
				e.scrollLeft = 0
				inloop = false
				return
			}
			if(e.scrollLeft >= e.scrollWidth / 2)
				e.scrollLeft = 0
			else
				e.scrollLeft ++
		}
	}
}

function showSidebar() {
    $("#SidebarTrigger").style.display = "none"
    $("sidebar").style.visibility = "visible"
}
function hideSidebar() {
    $("sidebar").style.visibility = "hidden"
	$("#SidebarTrigger").style.display = "block"
}

function showOption() {
    $("#OptionTrigger").style.display = "none"
    $("setting").style.visibility = "visible"
}
function hideOption() {
    $("setting").style.visibility = "hidden"
	$("#OptionTrigger").style.display = "block"
}

function changeSrc(chapterlink){
	//j$("#ebook").attr("src",chapterlink)
	$("#ebook").setAttribute('src',chapterlink)
	if(idocname != chapterlink.split('/').pop()){
		Cookies.remove(`${bookname}_${idocname}_scroll`)
		Cookies.remove(`${bookname}_${idocname}_page`)
	}
	Cookies.set(bookname+'_cache_iframe', chapterlink,{expires: 365})
	
	$$(".currentcontent").forEach(e => e.classList.remove("currentcontent"))
	$$(`[href="javascript:changeSrc('${chapterlink}');"]`)?.forEach(e => e.classList.add("currentcontent"))
}

var is_iframe_init = false
function iframe_init(){
	idoc = $('#ebook').contentDocument
	ihtml = idoc.querySelector('html')
	idoc.$ = document.querySelector.bind(idoc)
	idoc.$$  = document.querySelectorAll.bind(idoc)
	
	//init()
	is_iframe_init = true
	
	if(!haveinit){
		if(Cookies.get('readerStyle') !== undefined){
			var readerStyle = Cookies.get('readerStyle').split(' ')
			$('#body_margin_rl').value  = Number(readerStyle[0])
			$('#body_margin_tb').value  = Number(readerStyle[1])
			$('#p_space').value         = Number(readerStyle[2])
			$('#p_line_height').value   = Number(readerStyle[3])
			$('#custom_mode_bgc').value = readerStyle[5]
			$('#custom_mode_fc').value  = readerStyle[6]
			$('#font_size').value       = readerStyle[8]
			if(readerStyle[7] == 'true'){
				$('#mode_paged_two').checked = true
			}

			switch(readerStyle[4]){
				case 'dark':
					$('#dark_mode').checked = true
					break
				case 'light':
					$('#light_mode').checked = true
					break
				case 'eyes':
					$('#eyes_mode').checked = true
					break
				default:
					$('#custom_mode').checked = true
			}
			/*
			if(readerStyle[4] == "dark"){
				$('#dark_mode').checked = true
			}
			else if(readerStyle[4] == "light"){
				$('#light_mode').checked = true
			}
			else if(readerStyle[4] == "eyes"){
				$('#eyes_mode').checked = true
			}
			else{
				$('#custom_mode').checked = true
			}*/
		}
		
		if(Cookies.get('customcss') !== undefined){
			$("#customcss").value = Cookies.get('customcss')
		}
	}
	
	//idoc.body.innerHTML = idoc.body.innerHTML.replace(/～/g, '<span class="rotate">～</span>')
	idoc.body.innerHTML = idoc.body.innerHTML.replace(/…/g, '<span class="ellipsis">…</span>')
	idoc.body.innerHTML = idoc.body.innerHTML.replace(/—/g, '<span class="ellipsis">─</span>')
	
	customcss_refresh()
	writing_mode_switch()
	optionRefresh()

	var ilink = idoc.createElement('link')
	ilink.setAttribute('href','fullscreenimg.css')
	ilink.setAttribute('type','text/css')
	ilink.setAttribute('rel','stylesheet')
	idoc.body.appendChild(ilink)
		
	var range = document.createRange()
	range.selectNode(idoc.body)
	
	//var tagString = '<script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>'
	//var documentFragment = range.createContextualFragment(tagString)
	//idoc.body.appendChild(documentFragment)
	
	//var tagString = '<script async type="text/javascript" src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>'
	//var documentFragment = range.createContextualFragment(tagString)
	//idoc.body.appendChild(documentFragment)
	
	var tagString = '<script async type="text/javascript" src="fullscreenimg.js"></script>'
	var documentFragment = range.createContextualFragment(tagString)
	idoc.body.appendChild(documentFragment)
	
	var tagString = '<script async type="text/javascript" src="wheelzoom.js"></script>'
	var documentFragment = range.createContextualFragment(tagString)
	idoc.body.appendChild(documentFragment)

	
	var newStyle = document.createElement('style')  
	newStyle.id = "ellipsis"
	newStyle.textContent = `
	.ellipsis{
	  /*font-family: 新細明體;*/
	  display: inline-flex;
	  transform: translateX(0.9px);
	  text-indent: 0em;
	}`.fixindent(1)
	idoc.head.appendChild(newStyle)
	
	var newStyle = document.createElement('style')  
	newStyle.id = "dash"
	newStyle.textContent = `
	.dash{
	  font-family: 微軟正黑體;
	  vertical-align: top;
	  font-size: 93.5%;
	}`.fixindent(1)
	idoc.head.appendChild(newStyle)

	var newStyle = document.createElement("style")  
	newStyle.id = "rotate"
	idoc.head.appendChild(newStyle)
	
	var column_count = $('#mode_paged_two').checked ? 2 : 1
	
	idocname = $('#ebook').contentWindow.location.pathname.split('/').pop()
	if(readerMode == PAGED){
		let count = 0
		count += idoc.$$("p").length
		count += idoc.$$("h1").length
		count += idoc.$$("h2").length
		count += idoc.$$("a").length
		if(count == 0){
			idoc.getElementsByTagName('img')[0]?.classList.add("imgcenter")
			var centerimg = idoc.querySelector('.imgcenter')
			var imgcontainer = document.createElement('div')
			imgcontainer.classList.add('imgcontainer')
			centerimg.parentNode.replaceChild(imgcontainer, centerimg)
			imgcontainer.appendChild(centerimg)
		}
		
		$('#mode_paged_two').style.visibility = "visible"
		$('[for="mode_paged_two"]').style.visibility = "visible"
		
		let newStyle = idoc.createElement('style')
		let newStyle2 = idoc.createElement('style')
		switch(writing_mode){
			case VERTICAL:
				newStyle.textContent = `
				html{
				  height: 100%;
				}
				body{
				  transition-property: left, top;
				  transition-duration: 0.5s;
				  width: calc(100vw - 2 * ${body_margin_rl}em);
				  column-count: ${column_count};
				  -webkit-column-count: ${column_count};
				  column-gap: ${2 * body_margin_tb}em;
				  height:calc(100% - 2 * ${body_margin_tb}em);
				}
				img:not(#fullscreenimg):not(.imgcenter){
				  object-fit:contain;
				  max-height:calc(${100/column_count}vh - 2 * ${body_margin_tb}em);
				  max-width: calc(100vw - 2 * ${body_margin_rl}em);
				  line-height: 100%;
				}
				body::-webkit-scrollbar{
				  display: none;
				}`.fixindent(4)//99.35
				//idoc.$("#ellipsis").innerHTML = ".ellipsis{fontFamily:}"
				idoc.$("#rotate").innerHTML = `
				.rotate{
				  transform: rotate(90deg);
				  text-indent: 0em;
				  display: inline-block;
				  font-family: 新細明體;
				}`.fixindent(4)

				newStyle2.textContent = `
				.imgcenter{
				  margin:auto;
				  max-height: calc( 100vh - 2 * ${body_margin_tb}em);
				  max-width:calc( 100vw - 2 * ${body_margin_rl}em);
				  line-height: 100%;
				  object-fit: contain;
				}
				.imgcontainer{
				  display: flex;
				  position: absolute;
				  width: 100%;
				  height: 100%;
				}
				`.fixindent(4)
				break
			case HORIZONTAL:
				newStyle.textContent = `
				html{
				  height: 100%;
				}
				body{
				  transition-property: left, top;
				  transition-duration: 0.5s;
				  width: calc( 100vw - 2 * ${body_margin_rl}em);
				  column-count: ${column_count};
				  -webkit-column-count: ${column_count};
				  column-gap: ${2 * body_margin_rl}em;
				  height: calc(100% - 2 * ${body_margin_tb}em);
				}
				img:not(#fullscreenimg):not(.imgcenter){
				  object-fit: contain;
				  max-width: calc(${100/column_count}vw - 2 * ${body_margin_rl}em);
				  max-height: calc(99.1vh - 2 * ${body_margin_tb}em);
				  line-height: 100%;
				}
				body::-webkit-scrollbar{
				  display:none;
				}`.fixindent(4)//99.35

				//idoc.body.innerHTML = idoc.body.innerHTML.replace(/···/g, '...')
				idoc.$("#rotate").innerHTML = ''

				newStyle2.textContent = `
				.imgcenter{
				  margin: auto;
				  max-width: 100vw;
				  max-height: calc(100vh - 2 * ${body_margin_tb}em);
				  line-height: 100%;
				  object-fit: contain;
				}
				.imgcontainer{
				  display: flex;
				  position: absolute;
				  width: 100%;
				  height: 100%;
				}`.fixindent(4)
				break
		}
		newStyle.id = 'pageMode'
		idoc.head.appendChild(newStyle)
		newStyle2.id = 'imgcenter'
		idoc.head.appendChild(newStyle2)
		
		switch(writing_mode){
			case VERTICAL:
				iclientWidth = ihtml.clientHeight
				iscrollWidth = ihtml.scrollHeight
				break
			case HORIZONTAL:
				iclientWidth = ihtml.clientWidth
				iscrollWidth = ihtml.scrollWidth
				break			
		}
		var previous_maxipage = maxipage
		maxipage = Math.round(iscrollWidth/iclientWidth)
		idoc.body.style.position = 'fixed'
		
		if (mode_change){
			ipage = Math.round(maxipage*(iclientHeight+iscrollPos)/iscrollHeight)
			Cookies.set(`${bookname}_${idocname}_page`, ipage ,{expires: 365 })
			mode_change = false
		}
		//else if (writing_mode_change){
		//	ipage = Math.round(maxipage*(ipage/previous_maxipage))
		//	writing_mode_change = false
		//}
		else if (Cookies.get(`${bookname}_${idocname}_page`) !== undefined){ //for init
			ipage = Cookies.get(`${bookname}_${idocname}_page`)
		}else{
			ipage = 1
		}

		if (lastchapter){
			ipage = maxipage
			Cookies.set(`${bookname}_${idocname}_page`, ipage ,{expires: 365 })
			lastchapter = false
		}

		if (ipage > maxipage)
			ipage = maxipage

		if (ipage < 1)
			ipage = 1

		switch(writing_mode){
			case VERTICAL:
				idoc.body.style.top = `${-100*(ipage-1)}vh`
				break
			case HORIZONTAL:
				idoc.body.style.left = `${-100*(ipage-1)}vw`
				break
		}
	}
	else if (readerMode == SCROLL){
		//if(idoc.querySelector('.imgcenter')){
		//	let img = idoc.querySelector('.imgcenter')
		//	img.classList.remove('imgcenter')
		//	img.parentNode.insertBefore(img)
		//	img.parentNode.remove()
		//}
		
		
		$('#mode_paged_two').style.visibility = 'hidden'
		$('[for="mode_paged_two"]').style.visibility ='hidden'

		if (mode_change){
			switch(writing_mode){
				case VERTICAL:
					iscrollHeight = ihtml.scrollWidth
					iclientHeight = ihtml.clientWidth
					ihtml.scrollLeft = -(iscrollHeight*(ipage/maxipage) - iclientHeight)
					break
				case HORIZONTAL:
					iscrollHeight = ihtml.scrollHeight
					iclientHeight = ihtml.clientHeight
					ihtml.scrollTop = iscrollHeight*(ipage/maxipage) - iclientHeight
					break
			}
			mode_change = false
		}
		//else if (writing_mode_change){
		//	switch(writing_mode){
		//		case VERTICAL:
		//			{
		//			let newiscrollHeight = ihtml.scrollWidth
		//			ihtml.scrollLeft = - newiscrollHeight*((iscrollPos+iclientHeight)/iscrollHeight)
		//			console.log(1)
		//			break
		//			}
		//		case HORIZONTAL:
		//			{
		//			let newiscrollHeight = ihtml.scrollHeight
		//			ihtml.scrollTop = newiscrollHeight*((-iscrollPos+iclientHeight)/iscrollHeight)
		//			console.log(2)
		//			break
		//			}
		//	}
		//	writing_mode_change = false	
		//}
		else if (Cookies.get(`${bookname}_${idocname}_scroll`) !== undefined){
			switch(writing_mode){
				case HORIZONTAL:
					ihtml.scrollTop = Cookies.get(`${bookname}_${idocname}_scroll`)
					break
				case VERTICAL:
					ihtml.scrollLeft = Cookies.get(`${bookname}_${idocname}_scroll`)
					break
			}
		}
	}
	is_iframe_init = false
}

function fullscreen(){
	if($('#fullscreen').checked){
		document.fullscreenEnabled =
		document.fullscreenEnabled ||
		document.mozFullScreenEnabled ||
		document.documentElement.webkitRequestFullScreen
	
		function requestFullscreen(element) {
			if (element.requestFullscreen)
				element.requestFullscreen()
			else if (element.mozRequestFullScreen)
				element.mozRequestFullScreen()
			else if (element.webkitRequestFullScreen)
				element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
		}
		
		if (document.fullscreenEnabled)
			requestFullscreen(document.documentElement)
	}else{
		document.webkitExitFullscreen()
	}
}
function option(){
	$('#option').style.display = 'block'
}
function closeOption(){
	$('#option').style.display = 'none'
}

function modeswitch(){
	if($('#mode_scroll').checked){
	
		readerMode = SCROLL
		Cookies.set(`${bookname}_${idocname}_page`, ipage ,{expires: 365 })
		$('#mode_paged_two').style.visibility = 'hidden'
		$('label[for="mode_paged_two"]').style.visibility = 'hidden'
	}else{		
		readerMode = PAGED
		iclientHeight = ihtml.clientHeight
		iscrollHeight = ihtml.scrollHeight
		iscrollPos = ihtml.scrollTop
		if(writing_mode == VERTICAL){
			iclientHeight = ihtml.clientWidth
			iscrollHeight = ihtml.scrollWidth
			iscrollPos  = - ihtml.scrollLeft
		}
		//Cookies.set(bookname + '_' + idocname + '_scroll', iscrollHeight*(ipage/maxipage) -  iclientHeight,{expires: 365 })
		$('#mode_paged_two').style.visibility = 'visible'
		$('label[for="mode_paged_two"]').style.visibility = 'visible'
	}
	
	mode_change = true
	Cookies.set('ReaderMode', readerMode ,{expires: 365 })
	
	
	changeSrc($('#ebook').getAttribute('src'))
}

function optionRefresh(){
	body_margin_rl = $('#body_margin_rl').value
	body_margin_tb = $('#body_margin_tb').value
	let p_space =    $('#p_space').value
	let p_line_height = $("#p_line_height").value
	let display_mode = ''
	let custom_bgc = $('#custom_mode_bgc').value
	let custom_fc =  $('#custom_mode_fc').value
	let two_paged_mode = $('#mode_paged_two').checked
	let font_size =  $('#font_size').value

	$('#custom_mode_color').style.display = $('#custom_mode').checked ? 'block' : 'none'
	//if($('#custom_mode').checked)
	//	$('#custom_mode_color').style.display = 'block'
	//else
	//	$('#custom_mode_color').style.display = 'none'
	
	
	if (p_space > 5)
		p_space = $('#p_space').value = 5
	else if (p_space < 0)
		p_space = $('#p_space').value = 0

	if (p_line_height > 5)
		p_line_height = $('#p_line_height').value = 5
	else if (p_line_height < 1)
		p_line_height = $('#p_line_height').value = 1

	if (body_margin_rl > 20)
		body_margin_rl = $('#body_margin_rl').value = 20
	else if (body_margin_rl < 0)
		body_margin_rl = $('#body_margin_rl').value = 0

	if (body_margin_tb > 20)
		body_margin_tb = $('#body_margin_tb').value = 20
	else if (body_margin_tb < 0)
		body_margin_tb = $('#body_margin_tb').value = 0
	
	if (idoc.$('#readerStyle') == null){
		let newStyle = idoc.createElement('style')
		newStyle.innerHTML = ""
		newStyle.id = 'readerStyle'
		idoc.head.appendChild(newStyle)
	}
	var innerHTML= `
	body{
	  margin: ${body_margin_tb}em ${body_margin_rl}em;
	  font-size: ${font_size}%;`.fixindent(1)
	
	var bgcolor = ''
	var fcolor = ''
	var scrollbar_color = ''
	if ($('#dark_mode').checked){
		display_mode = 'dark'
		
		bgcolor = '#000000'
		fcolor = '#dddddd'
		scrollbar_color = '#777777'
	}else if ($('#light_mode').checked){
		display_mode = 'light'
		
		bgcolor = '#ffffff'
		fcolor = '#000000'
		scrollbar_color = '#AAAAAA'
	}else if ($('#eyes_mode').checked){
		display_mode = 'eyes'
		
		bgcolor = '#f5f5dc'
		fcolor = '#000000'
		scrollbar_color = '#AAAAAA'
	}else{
		display_mode = 'custom'
		
		bgcolor = custom_bgc
		fcolor = custom_fc
		scrollbar_color = '#AAAAAA'
	}
	innerHTML += `
	  background-color: ${bgcolor};
	  color: ${fcolor};
	}
	::-webkit-scrollbar{
	  width: 5px;
	  height: 5px;
	}
	::-webkit-scrollbar-thumb:vertical{
	  background: ${scrollbar_color};
	  border-right: 2px ${bgcolor} solid;
	}
	::-webkit-scrollbar-thumb:horizontal{
	  background: ${scrollbar_color};
	  border-bottom: 2px ${bgcolor} solid;
	}
	::-webkit-scrollbar-track{
	  background: ${bgcolor};
	}`.fixindent(1)
	
	/*
	if(writing_mode ==HORIZONTAL){
		innerHTML += `
		p{
		  line-height: ${p_line_height};
		  margin-block-start: ${p_space};
		  margin: ${p_space}em 0em 0em 0em;
		}`.fixindent(2)
	}else{
		innerHTML += `
		p{
		  line-height: ${p_line_height};
		  margin-block-start: ${p_space};
		  margin: 0em ${p_space}em 0em 0em;
		}`.fixindent(2)
	}*/

	innerHTML += `
	p{
	  line-height: ${p_line_height};
	  margin-block: ${p_space}em 0em;
	  margin-inline: auto;
	}`.fixindent(1)
	idoc.$('#readerStyle').innerHTML = innerHTML
	
	var column_count = $('#mode_paged_two').checked ? 2 : 1
	//if($('#mode_paged_two').checked == true)
	//	column_count = 2
	
	if(idoc.$('#pageMode')){
		if(writing_mode == VERTICAL){
			idoc.$('#pageMode').innerHTML = `
			html{
			  height:100%;
			}
			body{
			  transition-property: left, top;
			  transition-duration: 0.5s;
			  width: calc(100vw - 2 * ${body_margin_rl}em);
			  column-count: ${column_count};
			  -webkit-column-count: ${column_count};
			  column-gap: ${2 * body_margin_tb}em;
			  height: calc( 100% - 2 * ${body_margin_tb}em);
			}
			img:not(#fullscreenimg):not(.imgcenter){
			  object-fit: contain;
			  max-height: calc( ${100 / column_count}vh - 2 * ${body_margin_tb}em);
			  max-width: calc( 99.1vw - 2 * ${body_margin_rl}em);
			  line-height: 100%;
			}
			body::-webkit-scrollbar{
			  display: none;
			}`.fixindent(3)//99.35
			//idoc.body.innerHTML = idoc.body.innerHTML.replace(/[.][.][.]/g, '···')
			//idoc.body.innerHTML = idoc.body.innerHTML.replace(/…/g, '…')
			idoc.$('#rotate').innerHTML = `
			.rotate{
			  transform: rotate(90deg);
			  text-indent: 0em;
			  display: inline-block;
			  font-family: 新細明體;
			}`.fixindent(3)

			idoc.$('#imgcenter').innerHTML = `
			.imgcenter{
			  margin: auto;
			  max-height:calc(100vh - 2 * ${body_margin_tb}em);
			  max-width:calc(100vw - 2 * ${body_margin_rl}em);
			  line-height:100%;
			  object-fit:contain;
			}
			.imgcontainer{
			  display: flex;
			  position: absolute;
			  width: 100%;
			  height: 100%;
			}`.fixindent(3)
		}else{
			idoc.$('#pageMode').innerHTML = `
			html{
			  height:100%;
			}
			body{
			  transition-property: left, top;
			  transition-duration: 0.5s;
			  width:calc(100vw - 2 * ${body_margin_rl}em);
			  column-count: ${column_count};
			  -webkit-column-count: ${column_count};
			  column-gap: ${2 * body_margin_rl}em;
			  height: calc(100% - 2 * ${body_margin_tb}em);
			}
			img:not(#fullscreenimg):not(.imgcenter){
			  object-fit: contain;
			  max-width: calc( ${100/column_count}vw - 2 * ${body_margin_rl}em);
			  max-height: calc( 99.1vh - 2 * ${body_margin_tb}em);
			  line-height: 100%;
			}
			body::-webkit-scrollbar{
			  display: none;
			}`.fixindent(3)//99.35
			//idoc.body.innerHTML = idoc.body.innerHTML.replace(/···/g, '...')
			idoc.$('#rotate').innerHTML = ''

			idoc.$('#imgcenter').innerHTML = `
			.imgcenter{
			  margin: auto;
			  max-width: calc(100vw - 2 * ${body_margin_rl}em);
			  max-height: calc(100vh - 2 * ${body_margin_tb}em);
			  line-height: 100%;
			  object-fit: contain;
			}
			.imgcontainer{
			  display: flex;
			  position: absolute;
			  width: 100%;
			  height: 100%;
			}`.fixindent(3)
		}
	}


	
	Cookies.set('readerStyle',`${body_margin_rl} ${body_margin_tb} ${p_space} ${p_line_height} ${display_mode} ${custom_bgc} ${custom_fc} ${two_paged_mode} ${font_size}`,{expires: 365 })
	if (!is_iframe_init) resize()
}

function writing_mode_refresh(){
	switch(writing_mode){
		case HORIZONTAL:
			iclientHeight = ihtml.clientHeight
			iscrollWidth  = ihtml.scrollWidth
			iclientWidth  = ihtml.clientHeight
			iscrollPos = ihtml.scrollTop
			iscrollLength = ihtml.scrollHeight
			break
		case VERTICAL:
			iclientHeight = ihtml.clientWidth
			iscrollWidth  = ihtml.scrollHeight
			iclientWidth  = ihtml.clientWidth
			iscrollPos = ihtml.scrollLeft
			iscrollLength = ihtml.scrollWidth
			break
	}
	idoc.body.style.left = ''
	idoc.body.style.top = ''

	//swap
	$("#body_margin_tb").value = [$("#body_margin_rl").value, $("#body_margin_rl").value = $("#body_margin_tb").value][0]
	
	
	//changeSrc(document.getElementById('ebook').src)
	Cookies.set('WritingMode', $("#writing_mode_v").checked ,{expires: 365})
	writing_mode_change = true
	writing_mode_switch()
	optionRefresh()
	resize()
}

function writing_mode_switch(){	
	if ($("#writing_mode_v").checked == HORIZONTAL && Cookies.get('WritingMode') == HORIZONTAL.toString()){
		writing_mode = HORIZONTAL

		if(idoc.$('#writing_mode'))
			idoc.$('#writing_mode').innerHTML = ''
	}else{
		writing_mode = VERTICAL
		
		if(!idoc.$('#writing_mode')){
			let newStyle = idoc.createElement('style')
			newStyle.id = 'writing_mode'
			idoc.head.appendChild(newStyle)
		}

		idoc.$('#writing_mode').innerHTML = `
		body{
		  writing-mode:vertical-rl;
		}
		img{
		  max-height:100%;
		}`.fixindent(2)
	}

	Cookies.set('WritingMode', writing_mode, {expires: 365})
	
	if (readerMode == SCROLL){
		switch(writing_mode){
			case HORIZONTAL:
				iscrollHeight = ihtml.scrollHeight
				ihtml.scrollTop = - iscrollHeight * (iscrollPos / iscrollLength)
				break
			case VERTICAL:
				iscrollHeight = ihtml.scrollWidth
				ihtml.scrollLeft = - iscrollHeight * (iscrollPos / iscrollLength)	
				break
		}
	}
}

function customcss_refresh(){
	Cookies.set('customcss', $("#customcss").value ,{expires: 365 })
	if (!idoc.$('#customcss')){
		let newStyle = idoc.createElement('style')
		newStyle.innerHTML = $("#customcss").value.replaceAll(';',' !important;')
		newStyle.id = 'customcss'
		idoc.head.appendChild(newStyle)
	}
	idoc.$('#customcss').innerHTML = $("#customcss").value.replaceAll(';',' !important;')
}