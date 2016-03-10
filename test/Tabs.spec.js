import Tabs from '../src/Tabs';

/** @test {Tabs} */
describe('The Tabs class', function() {

	// Define keycode values
	let keys = {
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

	// Define key to function mapping
	let keyMap = {
		'left': 'prev',
		'up': 'prev',
		'right': 'next',
		'down': 'next',
		'home': 'first',
		'end': 'last'
	}

	// Custom matchers
	function toBeActive(util) {
		return {
			compare: function(actual) {
				let result = {};
				result.pass = actual._active;
				if (result.pass) {
					result.message = 'Expected ' + actual + ' not to be activated.';
				} else {
					result.message = 'Expected ' + actual + ' to be activated.';
				}
				return result;
			}
		};
	};

	// Mocks a tablist
	function mockTablist(numTabs = 3) {
		let tablist = document.createElement('div');
		for (let i = 0; i < numTabs; i++) {
			let tab = document.createElement('div');
			tab.setAttribute('class', 'tab');
			tab.setAttribute('aria-controls', `panel#{i}`);
			tablist.appendChild(tab);
		}
		return tablist;
	}

	// Mocks a KeyboardEvent
	function mockKeyboardEvent(keyCode) {
		let event = document.createEvent('Event');
		event.keyCode = keyCode;
		event.initEvent('keydown', true, true);
		return event;
	}

	// Mocks a MouseEvent
	function mockMouseEvent() {
		let event = document.createEvent('Event');
		event.initEvent('click', true, true);
		return event;
	}

	// Defines class options
	let classOptions = {
		tabClass: 'tab',
		activeTabClass: 'active',
		activePanelClass: 'active'
	};

	beforeEach(function() {
		jasmine.addMatchers({
			toBeActive: toBeActive
		});

		spyOn(document, 'getElementById').and.callFake(function(id) {
			let elem = document.createElement('div');
			elem.id = id;
			return elem;
		});
	});

	it('should not be callable as a function', function() {
		expect(function() { Tabs() }).toThrow();
	});

	/** @test {Tabs#constructor} */
	describe('constructor() function', function() {

		it('throws an error if the required arguments are missing', function() {
			expect(function() {
				new Tabs();
			}).toThrowError(Error, /arguments/i);
		});

		it('throws an error if the tablist argument is invalid', function() {
			expect(function() {
				new Tabs({});
			}).toThrowError(Error, /element node/i);
		});

		it('throws an error if there are not enough tabs in the tablist', function() {
			expect(function() {
				new Tabs(mockTablist(2));
			}).toThrowError(Error, /at least/i);
		});
		
		it('throws an error if there is no associated panel with a tab', function() {
			document.getElementById.and.callFake(function() {
				return undefined;
			});
			expect(function() {
				new Tabs(mockTablist(), classOptions);
			}).toThrowError(Error, /not found/i);
		});

	});

	/** @test {Tabs#init} */
	describe('init() function', function() {

		it('registers the correct number of tabs', function() {
			let tabset = new Tabs(mockTablist(), classOptions);
			tabset.init();
			expect(tabset.getTabs().length).toBe(3);
		});

		it('activates the first tab if none have been specified', function() {
			let tabset = new Tabs(mockTablist(), classOptions);
			tabset.init();
			expect(tabset.getTab(0)).toBeActive();
		});

		it('activates the tab as specified in the options', function() {
			let options = Object.assign({}, {
				activeIndex: 2
			}, classOptions);
			let tabset = new Tabs(mockTablist(), options);
			tabset.init();
			expect(tabset.getTab(2)).toBeActive();
		});

		it('deactivates all other tabs', function() {
			let options = Object.assign({}, {
				activeIndex: 2
			}, classOptions);
			let tabset = new Tabs(mockTablist(), options);
			tabset.init();
			expect(tabset.getTab(0)).not.toBeActive();
			expect(tabset.getTab(1)).not.toBeActive();
		});

		it('activates the panel associated with the active tab', function() {
			let options = Object.assign({}, {
				activeIndex: 2
			}, classOptions);
			let tabset = new Tabs(mockTablist(), options);
			tabset.init();
			expect(tabset.getPanel(2)).toBeActive();
		});

		it('deactivates all other panels', function() {
			let options = Object.assign({}, {
				activeIndex: 2
			}, classOptions);
			let tabset = new Tabs(mockTablist(), options);
			tabset.init();
			expect(tabset.getPanel(0)).not.toBeActive();
			expect(tabset.getPanel(1)).not.toBeActive();
		});

	});

	/** @test {Tabs#destroy} */
	describe('destroy() function', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init()
			this.tabset.destroy();
		});

		it('unbinds event handlers', function() {
			for (let key in keyMap) {
				it('calls ' + keyMap[key] + '() on ' + key + ' keydown', function() {
					let event = mockKeyboardEvent(keys[key]);
					spyOn(this.tabset, keyMap[key]);
					this.tabset.getTab(1).dispatchEvent(event);
					expect(this.tabset[keyMap[key]]).not.toHaveBeenCalled();
				});
			}

			let event = mockMouseEvent();
			spyOn(this.tabset, 'activate');
			this.tabset.getTab(1).dispatchEvent(event);
			expect(this.tabset.activate).not.toHaveBeenCalled();
		});

		it('deactivates all tabs', function() {
			this.tabset.getTabs().forEach(function(tab) {
				expect(tab).not.toBeActive();
			});
		});

		it('deactivates all panels', function() {
			this.tabset.getPanels().forEach(function(panel, i) {
				expect(panel).not.toBeActive();
			});
		});

	});

	/** @test {Tabs#activate} */
	describe('activate() function', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		it('activates the specified tab', function() {
			this.tabset.activate(1);
			expect(this.tabset.getTab(1)).toBeActive();
		});

		it('deactivates all other tabs', function() {
			this.tabset.activate(1);
			expect(this.tabset.getTab(0)).not.toBeActive();
			expect(this.tabset.getTab(2)).not.toBeActive();
		});

		it('activates the associated panel', function() {
			this.tabset.activate(1);
			expect(this.tabset.getPanel(1)).toBeActive();
		});

		it('deactivates all other panels', function() {
			this.tabset.activate(1);
			expect(this.tabset.getPanel(0)).not.toBeActive();
			expect(this.tabset.getPanel(2)).not.toBeActive();
		});

		it('calls the onActivate() callback function', function() {
			this.tabset._config.onActivate = jasmine.createSpy();
			this.tabset.activate(1);
			expect(this.tabset._config.onActivate).toHaveBeenCalledWith(1);
		});

	});

	/** @test {Tabs#prev} */
	describe('prev() function', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		it('activates the previous tab', function() {
			this.tabset.activate(2);
			expect(this.tabset.getTab(2)).toBeActive();
			this.tabset.prev();
			expect(this.tabset.getTab(1)).toBeActive();
		});

		it('activates the last tab if on the first tab', function() {
			this.tabset.activate(0);
			expect(this.tabset.getTab(0)).toBeActive();
			this.tabset.prev();
			expect(this.tabset.getTab(2)).toBeActive();
		});

	});

	/** @test {Tabs#next} */
	describe('next() function', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		it('activates the next tab', function() {
			this.tabset.activate(0);
			expect(this.tabset.getTab(0)).toBeActive();
			this.tabset.next();
			expect(this.tabset.getTab(1)).toBeActive();
		});

		it('activates the first tab if on the last tab', function() {
			this.tabset.activate(2);
			expect(this.tabset.getTab(2)).toBeActive();
			this.tabset.next();
			expect(this.tabset.getTab(0)).toBeActive();
		});

	});

	/** @test {Tabs#first} */
	describe('first() function', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		it('activates the first tab', function() {
			this.tabset.activate(2);
			expect(this.tabset.getTab(2)).toBeActive();
			this.tabset.first();
			expect(this.tabset.getTab(0)).toBeActive();
		});

	});

	/** @test {Tabs#last} */
	describe('last() function', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		it('activates the last tab', function() {
			this.tabset.activate(0);
			expect(this.tabset.getTab(0)).toBeActive();
			this.tabset.last();
			expect(this.tabset.getTab(2)).toBeActive();
		});

	});

	/** @test {Tabs#_handleTabKeyDown} */
	describe('tab keydown event', function() {
		
		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		for (let key in keyMap) {
			it('calls ' + keyMap[key] + '() on ' + key + ' keydown', function() {
				let event = mockKeyboardEvent(keys[key]);
				spyOn(this.tabset, keyMap[key]);
				this.tabset.getTab(1).dispatchEvent(event);
				expect(this.tabset[keyMap[key]]).toHaveBeenCalled();
			});
		}

	});

	/** @test {Tabs#_handleTabClick} */
	describe('tab click event', function() {

		beforeEach(function() {
			this.tabset = new Tabs(mockTablist(), classOptions);
			this.tabset.init();
		});

		it('calls activate() on click', function() {
			let event = mockMouseEvent();
			spyOn(this.tabset, 'activate').and.callThrough();
			this.tabset.getTab(1).dispatchEvent(event);
			expect(this.tabset.activate).toHaveBeenCalledWith(this.tabset.getTab(1));
			expect(this.tabset.getTab(1)).toBeActive();
		});

	});

});
