var HugeNav = (function(){
	"use strict";

	/**
	 * Class constructor
	 * @constructor
	 */
	var HugeNav = function(){
		// Config
		this.dataEndpoint = "/api/nav.json";
		this.menuTmpl = "{{:classname}}";
		this.itemTmpl = "{{:classname}}";
		this.chevron = '<i class="chevron"></i>';
		this.primaryNavPrefix = "primer-";
		this.secondaryNavPrefix = "sec-";
		this.menuClassname = "menu";
		this.menuItemClassname = "menu-item";

		// Navigation bar main Elements
		this.parentDom = document.body;
		this.toggleButton = null;
		this.menuDom = null;
		this.navAccessDom = null;
		this.mainDom = null;
		this.maskDom = null;
		this.primaryNav = null;
		

		// Model
		this.data = {};
		this.menuOpened = false;
		this.dataLoaded = false;
		this.menuBuilt = false;
		this.secondaryNavOpened = false;
	};

	// Public methods
	HugeNav.prototype.callback = callback;
	HugeNav.prototype.loadData = loadData;
	HugeNav.prototype.buildMenu = buildMenu;
	HugeNav.prototype.getClassname = getClassname;
	HugeNav.prototype.unserialize = unserialize;

	// private methos
	HugeNav.prototype._buildMenuFragment = _buildMenuFragment;
	HugeNav.prototype._resetSecondaryNav = _resetSecondaryNav;

	// Static
	HugeNav.PRIMARY_NAV = 1;
	HugeNav.SECONDARY_NAV = 2;
	HugeNav.MENU_ITEM = 1;
	HugeNav.MENU_ITEM_ELEM = 2;

	// Singleton
	HugeNav.instance = null;
	HugeNav.getInstance = getInstance;

	// Static methods
	HugeNav.toggleEventHandler = toggleEventHandler;
	HugeNav.toggleNav = toggleNav;
	HugeNav.removeOpenClass = removeOpenClass;

	// Init
	HugeNav.init = init;

	return HugeNav;

	////////////////////

	/**
	 * Navigation singleton
	 * @return {HugeNav}
	 */
	function getInstance(){
		if (HugeNav.instance === null) HugeNav.instance = new HugeNav();
		return HugeNav.instance;
	}

	/**
	 * Actions to make after loading navigation data
	 * @param  {XMLHttpRequest}
	 * @return {void}
	 */
	function callback(xhr){
		var nav = HugeNav.getInstance();
		nav.data = JSON.parse(xhr.responseText);
		nav.buildMenu();
	};

	/**
	 * Load navigation data at 'this.dataEndpoint' execution 'this.callback'
	 * @return {boolean} Representing success (true) or failure (false)
	 */
	function loadData(){
		if (!!ajax) {
			ajax(this.dataEndpoint, this.callback);
			return true;
		}
		else {
			throw new Error("ajax is not present.");
			return false;
		}
	};

	/**
	 * Build navigation bar on DOM at 'this.parentDom' Element
	 * @return {void}
	 */
	function buildMenu(){
		if (!this.dataLoaded) {
			this.loadData();
		}
		else {
			var menu = this._buildMenuFragment(this.data.items, HugeNav.PRIMARY_NAV);
			this.parentDom.innerHTML = menu + 
				'<div class="copyright">©2014 Huge. All Rights Reserved.</div>';
			this.menuBuilt = true;
		}
	}

	/**
	 * Returns a HTML fragment string of navigation bar 
	 * corresponding a specific level
	 * @param  {Object[]} items
	 * @param {string} items[].label
	 * @param {string} items[].url
	 * @param {Object[]=} items[].items
	 * @param  {number} navType
	 * @return {string}
	 */
	function _buildMenuFragment(items, navType) {
		var menu = "",
				menuClassname = this.getClassname(HugeNav.MENU_ELEM, navType),
				list = "";

		if (navType === HugeNav.PRIMARY_NAV) {}
		else if (navType === HugeNav.SECONDARY_NAV) {}
		else throw new Error("Invalid navType");
		
		items.forEach(function(item){
			var data = item;
			data["classname"] = this.getClassname(HugeNav.MENU_ITEM_ELEM, navType);
			data["url"] = !!item.url ? item.url : "#";
			if (item.items && item.items.length > 0) {
				data["menu"] = this._buildMenuFragment(item.items, HugeNav.SECONDARY_NAV);
				data["chevron"] = this.chevron;
			}
			else {
				data["menu"] = "";
				data["chevron"] = "";
			}
			list += render(this.itemTmpl, data);
		}, this);

		menu = render(this.menuTmpl, {"classname":menuClassname, "list":list});

		return menu;
	}

	/**
	 * Returns the specific class for navigation elements
	 * @param  {number}
	 * @param  {number}
	 * @return {string}
	 */
	function getClassname(navElem, navType){
		var classname = "", prefix = "";
		switch (navElem) {
			case (HugeNav.MENU_ELEM):
				classname = this.menuClassname;
				break;
			case (HugeNav.MENU_ITEM_ELEM):
				classname = this.menuItemClassname;
				break;
			default:
				throw new Error("Invalid navElem");
		}
		switch (navType) {
			case (HugeNav.PRIMARY_NAV):
				prefix = this.primaryNavPrefix;
				break;
			case (HugeNav.SECONDARY_NAV):
				prefix = this.secondaryNavPrefix;
				break;
			default:
				throw new Error("Invalid navType");
		}
		return prefix + classname;
	}

	/**
	 * Event handler for toggle button
	 * @param {Event} e Event triggered
	 * @return {void}
	 */
	function toggleEventHandler(e){
		var nav = HugeNav.getInstance();
		nav._resetSecondaryNav();
		nav.menuOpened = e.target === nav.maskDom ? false : !nav.menuOpened;
		nav.unserialize();
	}

	/**
	 * Secondary navigation trigger
	 * @param  {Element} Element that triggered it
	 * @return {void}
	 */
	function toggleNav(elem){
		var nav = HugeNav.getInstance(),
				node = elem.parentNode;
		// start data control
		if (!node.data) node.data = [];
		// reset last opened navigation bar
		if (nav.primaryNav !== null && nav.primaryNav !== node) {
			nav._resetSecondaryNav();
		}
		// just change navigation state if the trigger have more than 2 childrens
		// that means it have submenu level, in this case, a secondary menu
		if (node.childNodes.length > 2){
			// remove open class, if have been left over
			HugeNav.removeOpenClass(node);
			// change node state
			node.className += !node.data["opened"] ? " open" : "";
			node.data["opened"] = !node.data["opened"];
			// update navigation control state
			nav.primaryNav = node;
			nav.secondaryNavOpened = node.data["opened"];	
		}
		// render navigation control state
		nav.unserialize();
	}

	/**
	 * Remove control classname 'open' from a node,
	 * this is an inner private function of toggleNav
	 * @param  {Element}
	 * @return {void}
	 */
	function removeOpenClass(e){
		e.className = e.className.replace(/\s*open\s*/, "");
	}

	/**
	 * Reset secondary navigation state
	 * @return {void}
	 */
	function _resetSecondaryNav(){
		if (!!this.primaryNav) {
			this.primaryNav.data["opened"] = false;
			HugeNav.removeOpenClass(this.primaryNav);
		}
		this.primaryNav = null;
		this.secondaryNavOpened = false;
	}

	/**
	 * Render Navigation component based on state.
	 * @return {void}
	 */
	function unserialize() {
		HugeNav.removeOpenClass(this.toggleButton);
		HugeNav.removeOpenClass(this.mainDom);
		HugeNav.removeOpenClass(this.navAccessDom);
		HugeNav.removeOpenClass(this.menuDom);
		HugeNav.removeOpenClass(this.maskDom);

		this.toggleButton.className += this.menuOpened ? " open" : "";
		this.mainDom.className += this.menuOpened ? " open" : "";
		this.navAccessDom.className += this.menuOpened ? " open" : "";
		this.menuDom.className += this.menuOpened ? " open" : "";
		this.maskDom.className += this.menuOpened || this.secondaryNavOpened 
				? " open" : "";
	}

	/**
	 * Method that start Navigation component:
	 *  - loading navigation data
	 *  - building navigation structure
	 *  - setting event listeners
	 *  - rendering actual state
	 * @return {[type]}
	 */
	function init(){
		var nav = HugeNav.getInstance();
		if (!nav.dataLoaded) nav.dataLoaded = nav.loadData();
		nav.toggleButton.addEventListener('click', HugeNav.toggleEventHandler);
		nav.maskDom.addEventListener('click', HugeNav.toggleEventHandler);
		window.onresize = function(){
			nav.menuOpened = false; 
			nav.secondaryNavOpened = false;
			nav.unserialize();
		};
		nav.unserialize();
	};
})();
	
