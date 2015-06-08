var HugeNav = (function(render, ajax){
	/**
	 * Class constructor
	 * @constructor
	 * @namespace
	 */
	var HugeNav = function(){
		// Config
		/**
		 * Navigation data endpoint
		 * @type {String}
		 */
		this.dataEndpoint = '/api/nav.json';
		/**
		 * Template for navigation level container
		 * @type {String}
		 */
		this.menuTmpl = '<ul class="{{:classname}}">{{:list}}</ul>';
		/**
		 * Template for navigation level item
		 * @type {String}
		 */
		this.itemTmpl = '<li class="{{:classname}}" href="{{:url}}">{{:label}}</li>';
		/**
		 * Chevron template
		 * @type {String}
		 */
		this.chevron = '<i class="chevron"></i>';
		/**
		 * Copyright template
		 * @type {String}
		 */
		this.copyright = '<div class="copyright">©2014 Huge. All Rights Reserved.</div>';
		/**
		 * Classname prefix for primary navigation
		 * @type {String}
		 */
		this.primaryNavPrefix = 'primer-';
		/**
		 * Classname prefix for secondary navigation
		 * @type {String}
		 */
		this.secondaryNavPrefix = 'sec-';
		/**
		 * Classname for navigation container
		 * @type {String}
		 */
		this.menuClassname = 'menu';
		/**
		 * Classname for navigation item
		 * @type {String}
		 */
		this.menuItemClassname = 'menu-item';

		/**
		 * Error message for unsetted element
		 * @type {String}
		 */
		this.domErrorTmpl = '"{{:element}}" is not setted';

		// Navigation bar main Elements
		/**
		 * Navigation menu
		 * @type {Element}
		 */
		this.menuDom = null;
		/**
		 * Navigation icon ("hamburger")
		 * @type {Element}
		 */
		this.toggleButton = null;
		/**
		 * Huge logo and navigation icon container
		 * @type {[type]}
		 */
		this.navAccessDom = null;
		/**
		 * Content container
		 * @type {Element}
		 */
		this.mainDom = null;
		/**
		 * Translucent mask
		 * @type {Element}
		 */
		this.maskDom = null;
		/**
		 * Primary navigation element that triggered and control 
		 * a secondary navigation
		 * @type {[type]}
		 */
		this.primaryNav = null;

		// Model
		/**
		 * Navigation data JSON
		 * @type {Object}
		 */
		this.data = {};
		/**
		 * Indicates that menu is opened
		 * @type {Boolean}
		 */
		this.menuOpened = false;
		/**
		 * Indicates that data is loaded
		 * @type {Boolean}
		 */
		this.dataLoaded = false;
		/**
		 * Indicates that menu is built
		 * @type {Boolean}
		 */
		this.menuBuilt = false;
		/**
		 * Indicates that a secondary navigation is opened
		 * @type {Boolean}
		 */
		this.secondaryNavOpened = false;

		// Define setter and getter for Navigation Dom Elements
		_defineProperty('menuDom');
		_defineProperty('toggleButton');
		_defineProperty('navAccessDom');
		_defineProperty('mainDom');
		_defineProperty('maskDom');
		_defineProperty('primaryNav');

		/**
		 * Define setter and getter to Navigation Dom Elements
		 * @param  {string}
		 * @return {void}
		 */
		function _defineProperty(property){
			Object.defineProperty(HugeNav.prototype, property, {
				set: function(value){
					if (value instanceof Element) {
						this[property] = value;
					}
					else {
						throw new Error('"value" is not an Element');
					}
				},
				get: function(){
					if (!this[property]) {
						throw new Error(render(this.domErrorTmpl),{element:property});
					}
					return this[property];
				}
			});
		}

	};

	// Public methods
	HugeNav.prototype.callback = callback;
	HugeNav.prototype.loadData = loadData;
	HugeNav.prototype.buildMenu = buildMenu;
	HugeNav.prototype.getClassname = getClassname;
	HugeNav.prototype.refresh = refresh;

	// private methods
	HugeNav.prototype._buildMenuFragment = _buildMenuFragment;
	HugeNav.prototype._resetSecondaryNav = _resetSecondaryNav;

	// Static
	HugeNav.PRIMARY_NAV = 1;
	HugeNav.SECONDARY_NAV = 2;
	HugeNav.MENU_ITEM = 1;
	HugeNav.MENU_ITEM_ELEM = 2;

	// Singleton
	/**
	 * Hold singleton object
	 * @type {?HugeNav}
	 */
	HugeNav.instance = null;
	/**
	 * Invocates and return singleton
	 * @type {Function}
	 */
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
		if (HugeNav.instance === null) {
			HugeNav.instance = new HugeNav();
		}
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
	}

	/**
	 * Load navigation data at 'this.dataEndpoint' execution 'this.callback'
	 * @return {boolean} Representing success (true) or failure (false)
	 */
	function loadData(){
		/* jshint validthis: true */
		var self = this;
		if (!!ajax) {
			ajax(self.dataEndpoint, self.callback);
		}
		else {
			throw new Error('ajax is not present.');
		}
		return true;
	}

	/**
	 * Build navigation bar on DOM at 'this.menuDom' Element
	 * @return {void}
	 */
	function buildMenu(){
		/* jshint validthis: true */
		var self = this;
		if (!self.dataLoaded) {
			self.loadData();
		}
		else {
			var menu = self._buildMenuFragment(self.data.items, HugeNav.PRIMARY_NAV);
			self.menuDom.innerHTML = menu + self.copyright;
			self.menuBuilt = true;
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
		/* jshint validthis: true */
		var self = this,
				menu = '',
				menuClassname = self.getClassname(HugeNav.MENU_ELEM, navType),
				list = '';

		if (navType !== HugeNav.PRIMARY_NAV && navType !== HugeNav.SECONDARY_NAV) {
			throw new Error('Invalid navType');
		}
		
		items.forEach(function(item){
			var data = item;
			data.classname = self.getClassname(HugeNav.MENU_ITEM_ELEM, navType);
			data.url = !!item.url ? item.url : '#';
			if (item.items && item.items.length > 0) {
				data.menu = self._buildMenuFragment(item.items, HugeNav.SECONDARY_NAV);
				data.chevron = self.chevron;
			}
			else {
				data.menu = '';
				data.chevron = '';
			}
			list += render(self.itemTmpl, data);
		}, self);

		menu = render(self.menuTmpl, {'classname':menuClassname, 'list':list});

		return menu;
	}

	/**
	 * Returns the specific class for navigation elements
	 * @param  {number}
	 * @param  {number}
	 * @return {string}
	 */
	function getClassname(navElem, navType){
		/* jshint validthis: true */
		var self = this,
				classname = '', prefix = '';
		switch (navElem) {
			case (HugeNav.MENU_ELEM):
				classname = self.menuClassname;
				break;
			case (HugeNav.MENU_ITEM_ELEM):
				classname = self.menuItemClassname;
				break;
			default:
				throw new Error('Invalid navElem');
		}
		switch (navType) {
			case (HugeNav.PRIMARY_NAV):
				prefix = self.primaryNavPrefix;
				break;
			case (HugeNav.SECONDARY_NAV):
				prefix = self.secondaryNavPrefix;
				break;
			default:
				throw new Error('Invalid navType');
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
		nav.refresh();
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
		if (!node.data) {
			node.data = [];
		}
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
			node.className += !node.data.opened ? ' open' : '';
			node.data.opened = !node.data.opened;
			// update navigation control state
			nav.primaryNav = node;
			nav.secondaryNavOpened = node.data.opened;	
		}
		// render navigation control state
		nav.refresh();
	}

	/**
	 * Remove control classname 'open' from a node,
	 * this is an inner private function of toggleNav
	 * @param  {Element}
	 * @return {void}
	 */
	function removeOpenClass(e){
		e.className = e.className.replace(/\s*open\s*/, '');
	}

	/**
	 * Reset secondary navigation state
	 * @return {void}
	 */
	function _resetSecondaryNav(){
		/* jshint validthis: true */
		var self = this;
		if (!!self.primaryNav) {
			self.primaryNav.data.opened = false;
			HugeNav.removeOpenClass(self.primaryNav);
		}
		self.primaryNav = null;
		self.secondaryNavOpened = false;
	}

	/**
	 * Render Navigation component based on state.
	 * @return {void}
	 */
	function refresh() {
		/* jshint validthis: true */
		var self = this;
		HugeNav.removeOpenClass(self.toggleButton);
		HugeNav.removeOpenClass(self.mainDom);
		HugeNav.removeOpenClass(self.navAccessDom);
		HugeNav.removeOpenClass(self.menuDom);
		HugeNav.removeOpenClass(self.maskDom);

		self.toggleButton.className += self.menuOpened ? ' open' : '';
		self.mainDom.className += self.menuOpened ? ' open' : '';
		self.navAccessDom.className += self.menuOpened ? ' open' : '';
		self.menuDom.className += self.menuOpened ? ' open' : '';
		self.maskDom.className += self.menuOpened || 
				self.secondaryNavOpened ? ' open' : '';
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
		if (!nav.dataLoaded) {
			nav.dataLoaded = nav.loadData();
		}
		nav.toggleButton.addEventListener('click', HugeNav.toggleEventHandler);
		nav.maskDom.addEventListener('click', HugeNav.toggleEventHandler);
		window.onresize = function(){
			nav.menuOpened = false; 
			nav.secondaryNavOpened = false;
			nav.refresh();
		};
		nav.refresh();
	}
})(render, ajax);
	
