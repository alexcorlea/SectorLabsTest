describe('Search results', () => {
	beforeEach( function() {
		var waitForMe = 10000;
		browser.url('/')
		
		//CSS: enter location Rome
		$('#bigsearch-query-detached-query').waitForDisplayed({timeout: waitForMe })
		$('#bigsearch-query-detached-query').click()
		browser.keys(['R','o','m','e'])
		
		//XPath: select first suggestion
		$('[aria-labelledby=\'predictions-\']').waitForDisplayed({ timeout: waitForMe })
		browser.keys(['ArrowDown','Enter'])
		
		//XPath: enter checkin and checkout dates
		var checkInFormatedDate = (moment().add(7, 'days').format('MMMM D'))
		var checkOutFormatedDate = (moment().add(14, 'days').format('MMMM D'))
		var el1 = $('//td[contains(@aria-label,\'' + checkInFormatedDate + '\')]')
		var el2 = $('//td[contains(@aria-label,\'' + checkOutFormatedDate + '\')]')
		
		$('[data-testid=\'structured-search-input-field-dates-panel\']').waitForDisplayed({ timeout: waitForMe })
				
		el1.waitForDisplayed()
		el1.click()
		el2.waitForDisplayed()
		el2.click()
				
		//CSS: click for guests
		$('[data-testid=structured-search-input-field-guests-button]').click()
		
		//XPath: click two adults
		$('//div[@id=\'stepper-adults\']//button[2]').doubleClick()
		
		//XPath: click one child
		$('//div[@id=\'stepper-children\']//button[2]').click()
		
		//XPath: click search
		$('//button[@class=\'_1mzhry13\']').click()
		
		//Partial Link: sync wait for the search page
		$('div*=Add a place or address to the map').waitForDisplayed({timeout: waitForMe })
	})
	
	it('should match the search criteria', () => {
		//XPath: check search results
		var searchResult = $('//div[@class=\'_1snxcqc\']').getText()
		expect(searchResult).to.include('3 guests')
		expect(browser.getTitle()).to.include('Rome')
		
		var checkInReformated = (moment().add(7, 'days').format('YYYY-MM-DD'))
		var checkOutReformated = (moment().add(14, 'days').format('YYYY-MM-DD'))
		expect(browser.getUrl()).to.include('checkin=' + checkInReformated + '&checkout=' + checkOutReformated)
	})
	
	it('can accomodate at least my 3 people', () => {
		//Element with partial text: get all accomodations' display area from this page
		var accomodations = $$('._kqh46o*=guests')
		
		//iterate, identify number of guests, test for min value
		accomodations.forEach(function(unit) {
			var info = unit.getText().split(' ');
			var guests = parseInt(info[0]);
			expect(guests, 'Check for min number of guests failed').to.be.at.least(3)
		})
	})
	
	it('should have 5 bedrooms because I want them all', () => {
		//apply extra filters defined in a custom function in wdio.conf.js before hook
		browser.applyExtraFilters()
		
		//Element with partial text: get all accomodations' display area from this page
		var accomodations = $$('._kqh46o*=bedrooms')
		
		//iterate, identify number of guests, test for min value
		accomodations.forEach(function(unit) {
			var info = (unit.getText()).split(' ')
			var bedrooms = parseInt(info[3])
			expect(bedrooms, 'Check for min number of guests failed').to.be.at.least(5)
		})
	})
	
	it('should show me the pool', () => {
		//apply the extra filters defined in a custom function in wdio.conf.js before hook
		browser.applyExtraFilters()
		//XPath: click the first result, will open a new tab
		$('[class=_gjfol0').click()
		
		//switch to new window/tab 
		browser.switchToWindow(browser.getWindowHandles()[1])
		
		//CSS: click Show all amenities, first of three same-class buttons on the page
		$('[class=_13e0raay]').click()
		
		//XPath: wait for amenities display
		$('[class=_1n4z1hs]').waitForDisplayed()
		
		//XPath: check pool
		expect($('//div[@class=\'_vzrbjl\'][contains(text(),\'Pool\')]').isDisplayed(), 'Pool was not an amenity of the slected property').to.be.true
	})
	
	it('shows nicely on map', () => {
		//CSS: extract the current pricing text field of the first accomodation, filter out "previous price" if present, filter out currency symbol, so that we have just the number; to be used later
		var realPrice = $('[class=_1p7iugi]').getText().split('\n').pop().match(/\d+/)[0]
		
		//CSS: get the corresponding element on map; to check when highlighted
		var elem = $('[aria-label*=\'' + realPrice + '\']').$('<div />').$('<div />')
		elem.waitForDisplayed({ timeout: 10000 })
		
		//element not highlighted
		expect((elem.getCSSProperty('background-color').value), "element does not appear normal on map").to.include('rgb(255,255,255)')
		
		//XPath: click to close annoying info message overlay
		$('[class=_1eh0dqc]').click()
		
		//CSS: mouse hover over the first accomodation
		$('[class=_gjfol0]').moveTo()
		
		//element highlighted
		browser.pause(2000)
		expect((elem.getCSSProperty('background-color').value), "element does not appear highlighted on map").to.not.include('rgb(255,255,255)')
		
		//click highlighted elem on map
		elem.click()
		//test the property name is the same on map as in list
		console.log($('[class=_1q6k59c]').$('[class=_v96gnbz').getText())
		
		expect($('[class=_1q6k59c]').$('[class=_v96gnbz').getText(),'not the same property name in the minimap').to.equal($('[class=_1c2n35az]').getText())
		
		//CSS: extract minimap price using same logic as above
		var minimapPrice = $('[class=_1p7iugi]').getText().split('\n').pop().match(/\d+/)[0]
		
		//test price of accomodation is the same on the minimap as in the search results
		expect(realPrice, 'price on minimap is different than price of accomodation').to.equal(minimapPrice)
	})
})
