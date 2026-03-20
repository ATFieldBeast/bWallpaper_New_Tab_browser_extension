// set wallpaper to default
function showDefaultWallpaper() {
	// set wallpaper
	var body = document.getElementById('main-body');
	body.style.backgroundImage = "url('./images/default.png')";
	// set download button
	setDownloadBtn();
}

// set footer text
function setFooterText(text) {
	var footer_text = document.getElementById('footer-text');
	footer_text.innerHTML = text;
	// display / hide the uhd badge
	var uhd_badge = document.getElementById('uhd-badge');
	if (readConf('enable_uhd_wallpaper') == 'yes') {
		uhd_badge.innerHTML = i18n('btr_download_wallpaper_uhd_badge');
	}
	else {
		uhd_badge.innerHTML = '';
	}
}

// display loading animation
function showLoadingAnim() {
	var circle = document.getElementById('loading-circle');
	circle.style.display = 'inline-block';
}

// hide loading animation
function hideLoadingAnim() {
	var circle = document.getElementById('loading-circle');
	circle.style.display = 'none';
}

// pre-load image from url
// then change background image and footer text after loading is finished
function loadAndChangeOnlineWallpaper(url, text) {
	showDefaultWallpaper();
	showLoadingAnim();
	// use copyright text as image name for download
	currentImageName = text;
	// preload wallpaper
	var tmp_img = new Image();
	tmp_img.src = url;
	tmp_img.onload = function() {
  	// set wallpaper
  	var body = document.getElementById('main-body');
  	body.style.backgroundImage = "url('" + url + "')";
  	// set footer text
  	hideLoadingAnim();
  	setFooterText(text);
  	// update conf
  	writeConf("wallpaper_date", getDateString());
  	writeConf("wallpaper_url", url);
  	writeConf("wallpaper_text", text);
  	// set download button
  	setDownloadBtn();
	};
}

// get latest wallpaper url from bing.com 
// then load and change wallpaper
function updateWallpaper(idx) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var obj = JSON.parse(xhr.responseText);
			var url = readConf('api_url') + obj.images[0].url;
			// if UHD enabled
			if (readConf('enable_uhd_wallpaper') == 'yes') {
				url = url.replaceAll('1920x1080', 'UHD');
			}
			// store copyright as image name for download
			currentImageName = obj.images[0].copyright;
			loadAndChangeOnlineWallpaper(url, obj.images[0].copyright);
		}
		else {
			showDefaultWallpaper();
		}
	}
	var current_lang = window.navigator.language;
	xhr.open('get', readConf('api_url') + '/HPImageArchive.aspx?format=js&n=1&mkt=' + current_lang + '&idx=' + idx);
	xhr.send(null);
}

// initialize wallpaper on page load
function initWallpaper() {
	// get cache date
	var cache_date = readConf("wallpaper_date");
	if (cache_date == getDateString()) {
		// if today matches cache date, get cache url and text
		var cache_url = readConf("wallpaper_url");
		var cache_text = readConf("wallpaper_text");
		if (cache_url != "" && cache_text != "") {
			loadAndChangeOnlineWallpaper(cache_url, cache_text);
		}
		else {
			// cache is broken, update wallpaper
			updateWallpaper(0);
		}
	}
	else {
		// if today does not match cache date, update wallpaper
		updateWallpaper(0);
		// reset old wallpaper days offset conf
		writeConf("offset_idx", "0");
	}
}

// if user want to show prev wallpapers.
function switchPrevWallpaper() {
	var MAX_OLD_DAYS = 7;
	// calculate idx
	var cache_idx = readConf("offset_idx");
	if (cache_idx === "") {
		cache_idx = 0;
	}
	cache_idx = parseInt(cache_idx);
	cache_idx = (cache_idx + 1) % MAX_OLD_DAYS;
	writeConf("offset_idx", cache_idx.toString());
	// reload wallpaper
	updateWallpaper(cache_idx);
}

// if user want to show next wallpapers.
function switchNextWallpaper() {
	var MAX_OLD_DAYS = 7;
	// calculate idx
	var cache_idx = readConf("offset_idx");
	if (cache_idx === "") {
		cache_idx = 0;
	}
	cache_idx = parseInt(cache_idx);
	cache_idx = (cache_idx - 1 + MAX_OLD_DAYS) % MAX_OLD_DAYS;
	writeConf("offset_idx", cache_idx.toString());
	// reload wallpaper
	updateWallpaper(cache_idx);
}

// store current image name for download
var currentImageName = '';

// sanitize filename for Windows compatibility
// replace characters: < > : " / \ | ? * and control characters
function sanitizeFilename(name) {
	if (!name) return 'bing-wallpaper-' + getDateString();
	// replace / with underscore to preserve structure
	name = name.replace(/\//g, '_');
	// decode URI components first
	try {
		name = decodeURIComponent(name);
	} catch (e) {}
	// replace invalid chars with underscore
	name = name.replace(/[<>:"\\|?*\x00-\x1f]/g, '_').replace(/__+/g, '_').replace(/^_|_$/g, '');
	return name.trim();
}

// fetch image as blob and trigger download with correct filename
async function downloadWallpaper() {
	var imgUrl = document.getElementById('main-body').style.backgroundImage.replace('url("', '').replace('")', '');
	var safeName = sanitizeFilename(currentImageName);
	var filename = safeName + '.jpg';

	try {
		var response = await fetch(imgUrl);
		var blob = await response.blob();
		var blobUrl = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = blobUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(blobUrl);
	} catch (e) {
		// fallback: open in new tab
		window.open(imgUrl, '_blank');
	}
}

// set wallpaper download button
function setDownloadBtn() {
	var download_wp_btn = document.getElementById('download-wallpaper');
	download_wp_btn.onclick = downloadWallpaper;
}

// --------------------------------------------------

// init wallpaper
initWallpaper();

// bind switch prev wallpaper click event
var prev_wp_btn = document.getElementById('prev-wallpaper');
prev_wp_btn.onclick = switchPrevWallpaper;

// bind switch next wallpaper click event
var next_wp_btn = document.getElementById('next-wallpaper');
next_wp_btn.onclick = switchNextWallpaper;