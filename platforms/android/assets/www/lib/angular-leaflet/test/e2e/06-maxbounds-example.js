'use strict';

describe('Loading maxbounds-example.html', function() {

    var ptor, driver;
    beforeEach(function() {
        ptor = protractor.getInstance();
        browser.get('maxbounds-example.html');
        driver = ptor.driver;
    });

    it('should update the maxbounds values if clicked the buttons', function() {
        ptor.wait(function() {
            return ptor.isElementPresent(by.css('img.leaflet-tile-loaded'));
        });

        element(by.xpath('.//button[text()="London region"]')).click().then(function() {
            expect(element(by.css("p.result")).getText()).toBe("Maxbounds: NE(lat: 51.51280224425956, lng: -0.11681556701660155) SW(lat: 51.50211782162702, lng: -0.14428138732910156)");
        });

        element(by.xpath('.//button[text()="Lisbon region"]')).click().then(function() {
            element(by.xpath('.//*[@title="Zoom out"]')).click().then(function() {
                expect(element(by.css("p.result")).getText()).toBe("Maxbounds: NE(lat: 38.72703673982525, lng: -9.110498428344725) SW(lat: 38.700247900602726, lng: -9.165430068969727)");
            });
        });

        element(by.xpath('.//button[text()="Warszawa region"]')).click().then(function() {
            var zoomout = element(by.xpath('.//*[@title="Zoom out"]'));
            zoomout.click();
            zoomout.click();
            zoomout.click().then(function() {
                expect(element(by.css("p.result")).getText()).toBe("Maxbounds: NE(lat: 52.31645452105213, lng: 21.233139038085938) SW(lat: 52.14823737817847, lng: 20.793685913085934)");
            });
        });
        element(by.xpath('.//button[text()="Unset maxbounds"]')).click().then(function() {
            expect(element(by.css("p.result")).getText()).toBe("");
        });
    });
});
