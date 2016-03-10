/**
 * Adds functionality to the tabs component.
 *
 * @class
 */
export default class Tabs {

	/**
	 * Creates an instance of the tabs component.
	 * 
	 * @param {Element} tablist - The tablist element.
	 * @param {Object} [options] - Config options.
	 * @param {number} [options.activeIndex] - Index of the tab to set active on initialisation.
	 * @param {Function} [options.onActivate] - Callback function that is executed after a tab has been activated.
	 * 
	 * @throws {ReferenceError} - Throws an error when the tablist argument is not provided.
	 * 
	 * @example
	 * var tablist = document.querySelector('.tablist');
	 * var tabsInstance = new HsbcUi.Tabs(tablist);
	 */
	constructor(tablist, options = {}) {

		// Validate arguments
		if (arguments.length < 1) {
			throw new Error('Incorrect number of arguments.');
		}

		// Define default options
		const defaults = {
			activeIndex: 0,
			tabClass: 'tab',
			activeTabClass: 'is-active',
			activePanelClass: 'is-active',
			onActivate: function(){}
		};

		// Assign settings
		this._defaults = defaults;
		this._options = options;
		this._config = Object.assign({}, defaults, options);

		// Define keycode values
		this._keys = {
			tab: 9,
			enter: 13,
			space: 32,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};

		// Assign variables
		this._tablist = tablist;
		this._validateTablist(tablist);
	}

	/**
	 * Initialises the object instance.
	 * 
	 * - Defines the tabs and panels.
	 * - Activates the specified tab.
	 * - Activates the first tab if none have been specified.
	 * - Binds event handlers.
	 * 
	 * @return {Tabs} - Instance.
	 */
	init() {
		// Define tabs and panels
		this._tabs = Array.from(this._tablist.querySelectorAll('.' + this._config.tabClass));
		this._tabs.forEach(tab => {
			tab._active = false;
			tab._panel = document.getElementById(tab.getAttribute('aria-controls'));
			tab._panel._active = false;
		});

		// Initialise each tab
		this._tabs.forEach((tab, i) => {
			if (i === this._config.activeIndex) {
				this._currentIndex = i;
				this._activateTab(tab);
				this._activatePanel(tab);
			} else {
				this._deactivateTab(tab);
				this._deactivatePanel(tab);
			}
		});

		// Bind event handlers
		this._bindHandlers();

		// Return the instance
		return this;
	}

	/**
	 * Destroys the instance.
	 * @example
	 * tabsInstance.destroy();
	 */
	destroy() {

		// Unbind event handlers
		this._unbindHandlers();

		// Reset panels
		this._tabs.forEach(tab => {
			this._deactivatePanel(tab);
		});

		// Reset tabs
		this._tabs.forEach(tab => {
			this._deactivateTab(tab);
			// delete tab._panel;
			// delete tab._active;
		});
	}

	/**
	 * Activates the specified tab and displays the associated panel.
	 * Executes the onActivate() callback when complete.
	 * @param {number|Element} newTab - The tab to activate. Can be either the index value or a reference to the tab element.
	 * @return {Tabs} - Instance.
	 * @example
	 * tabsInstance.activate();
	 */
	activate(newTab) {
		let newIndex;

		// Find the new index
		if (typeof newTab === 'number') {
			newIndex = newTab;
		} else {
			this._tabs.forEach((tab, i) => {
				if (tab === newTab) {
					newIndex = i;
				}
			});
		}

		// Check for a valid index
		if (newIndex !== undefined && newIndex < this._tabs.length) {

			// Update the content
			this._deactivateTab(this._tabs[this._currentIndex]);
			this._deactivatePanel(this._tabs[this._currentIndex]);

			// Activate the new tab and panel
			this._activateTab(this._tabs[newIndex]).focus();
			this._activatePanel(this._tabs[newIndex]);

			// Fire the callback
			this._currentIndex = newIndex;
			this._config.onActivate(newIndex);
		}

		return this;
	}

	/**
	 * Activates the previous tab.
	 * If the first tab is currently active, then the last tab is activated.
	 * @return {Tabs} - Instance.
	 * @example
	 * tabsInstance.prev();
	 */
	prev() {
		let newIndex = (this._currentIndex === 0) ? this._tabs.length - 1 : this._currentIndex - 1;
		this.activate(newIndex);
		return this;
	}

	/**
	 * Activates the next tab.
	 * If the last tab is currently active, then the first tab is activated.
	 * @return {Tabs} - Instance.
	 * @example
	 * tabsInstance.next();
	 */
	next() {
		let newIndex = (this._currentIndex === this._tabs.length - 1) ? 0 : this._currentIndex + 1;
		this.activate(newIndex);
		return this;
	}

	/**
	 * Activates the first tab.
	 * @return {Tabs} - Instance.
	 * @example
	 * tabsInstance.first();
	 */
	first() {
		this.activate(0);
		return this;
	}

	/**
	 * Activates the last tab.
	 * @return {Tabs} - Instance.
	 * @example
	 * tabsInstance.last();
	 */
	last() {
		this.activate(this._tabs.length - 1);
		return this;
	}

	/**
	 * Returns the specified tab.
	 * @param {number} index - The index of the tab.
	 * @return {Element} - The tab element at the specified index.
	 * @example
	 * tabsInstance.getTab();
	 */
	getTab(index) {
		return this._tabs[index];
	}

	/**
	 * Returns an array of all tabs.
	 * @return {Array} - An array of tab elements.
	 * @example
	 * tabsInstance.getTabs();
	 */
	getTabs() {
		return this._tabs;
	}

	/**
	 * Returns the specified panel.
	 * @param {number} index - The index of the panel.
	 * @return {Element} - The panel element at the specified index.
	 * @example
	 * tabsInstance.getPanel();
	 */
	getPanel(index) {
		return this._tabs[index]._panel;
	}

	/**
	 * Returns an array of all panels.
	 * @return {Array} - An array of panel elements.
	 * @example
	 * tabsInstance.getPanels();
	 */
	getPanels() {
		return this._tabs.map(function(tab) {
			return tab._panel;
		});
	}

	/**
	 * Checks that the tablist is valid.
	 */
	_validateTablist(tablist) {

		// Check object type
		if (tablist !== 'undefined' && tablist.nodeType !== Node.ELEMENT_NODE) {
			throw new Error('Target argument must be an element node.');
		}

		// Get tabs
		var tabs = Array.from(tablist.querySelectorAll('.' + this._config.tabClass));
		
		// Check number of tabs
		if (tabs.length < 2) {
			throw new Error('Should be at least 2 tabs in the tablist.');
		}

		// Check panels
		tabs.forEach((tab) => {
			let panelId = tab.getAttribute('aria-controls');
			let panel = document.getElementById(tab.getAttribute('aria-controls'));
			if (!panel) {
				throw new Error(`Panel not found for id#{panelId}.`);
			}
		});
	}

	/**
	 * Binds event handlers to each tab.
	 */
	_bindHandlers() {
		this._tabs.forEach(tab => {
			tab._events = [{
				type: 'keydown',
				func: this._handleTabKeyDown.bind(this)
			}, {
				type: 'click',
				func: this._handleTabClick.bind(this)
			}];
			tab._events.forEach(e => tab.addEventListener(e.type, e.func));
		});
	}

	/**
	 * Unbinds event handlers from each tab.
	 */
	_unbindHandlers() {
		this._tabs.forEach(tab => {
			if (tab._events && tab._events.length) {
				tab._events.forEach(e => tab.removeEventListener(e.type, e.func));
			}
			delete tab._events;
		});
	}

	/**
	 * Handles the tab keydown event.
	 */
	_handleTabKeyDown(e) {
		const tab = e.currentTarget;
		const keys = this._keys;
		const runCommand = keyCode => {
			const commands = {
				[keys.left]: () => {
					e.stopPropagation();
					e.preventDefault();
					this.prev();
				},
				[keys.up]: () => {
					e.stopPropagation();
					e.preventDefault();
					this.prev();
				},
				[keys.right]: () => {
					e.stopPropagation();
					e.preventDefault();
					this.next();
				},
				[keys.down]: () => {
					e.stopPropagation();
					e.preventDefault();
					this.next();
				},
				[keys.home]: () => {
					e.stopPropagation();
					e.preventDefault();
					this.first();
				},
				[keys.end]: () => {
					e.stopPropagation();
					e.preventDefault();
					this.last();
				}
			};
			return commands[keyCode] && commands[keyCode]();
		};
		return runCommand(e.keyCode);
	}

	/**
	 * Handles the tab click event.
	 */
	_handleTabClick(e) {
		e.stopPropagation();
		e.preventDefault();
		this.activate(e.currentTarget);
	}

	/**
	 * Activates the specified tab.
	 */
	_activateTab(tab) {
		tab._active = true;
		tab.setAttribute('tabindex', '0');
		tab.setAttribute('aria-selected', 'true');
		tab.classList.add(this._config.activeTabClass);
		return tab;
	}

	/**
	 * Deactivates the specified tab.
	 */
	_deactivateTab(tab) {
		tab._active = false;
		tab.setAttribute('tabindex', '-1');
		tab.setAttribute('aria-selected', 'false');
		tab.classList.remove(this._config.activeTabClass);
		return tab;
	}

	/**
	 * Activates the panel associated with the specified tab.
	 */
	_activatePanel(tab) {
		tab._panel._active = true;
		tab._panel.classList.add(this._config.activePanelClass);
	}

	/**
	 * Deactivates the panel associated with the specified tab.
	 */
	_deactivatePanel(tab) {
		tab._panel._active = false;
		tab._panel.classList.remove(this._config.activePanelClass);
	}

}
