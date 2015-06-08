(function(){
	"use strict";
	window.onload = init;
	function init(){
		// Init HugeNav
		var nav = HugeNav.getInstance();
		nav.itemTmpl = document.getElementById('item-tmpl').innerHTML.trim();
		nav.menuTmpl = document.getElementById('menu-tmpl').innerHTML.trim();
		nav.parentDom = document.getElementById('menu');
		nav.toggleButton = document.getElementById('nav-toggle');
		nav.menuDom = document.getElementById('menu');
		nav.navAccessDom = document.getElementById('access-nav');
		nav.mainDom = document.getElementById('main');
		nav.maskDom = document.getElementById('mask');
		HugeNav.init();
	}
})();

