// page title
function i18n_page_title() {
	document.title = i18n('new_tab_title');
}

// bottom-right prev wallpaper btn 
function i18n_btr_prev_wallpaper_btn() {
	var x = document.getElementById('prev-wallpaper');
	x.title = i18n('btr_prev_wallpaper_btn');
}

// bottom-right next wallpaper btn 
function i18n_btr_next_wallpaper_btn() {
	var x = document.getElementById('next-wallpaper');
	x.title = i18n('btr_next_wallpaper_btn');
}

// bottom-right download wallpaper btn 
function i18n_btr_download_wallpaper_btn() {
	var x = document.getElementById('download-wallpaper');
	x.title = i18n('btr_download_wallpaper_btn');
}

function exec_i18n() {
	i18n_page_title();
	i18n_btr_prev_wallpaper_btn();
	i18n_btr_next_wallpaper_btn();
	i18n_btr_download_wallpaper_btn();
}

exec_i18n();