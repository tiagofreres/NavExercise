describe("Navigation Bar Test Suite", function(){
	var nav;

	beforeEach(function(){

	});

	it("Set a singleton", function(){
		var nav = HugeNav.getInstance();
		expect(nav).toEqual(HugeNav.getInstance());
		expect(nav).toEqual(HugeNav.instance);
	});
});