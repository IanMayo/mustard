/**
 * @module subtrack90.game.panToVesselDirective
 */

angular.module('subtrack90.game.panToVesselDirective', [])

.directive('panToVesselPosition', [function () {
    return {
        restrict: 'A',
        require: 'leaflet',
        link: function (scope, element, attrs, controller) {
            controller.getMap().then(function(map) {
                map.whenReady(function () {
                    scope.$on('ownShipMoved', function (event, newLocation) {
                        var ownShipPosition = L.latLng(newLocation.lat, newLocation.lng);

                        if (!map.getBounds().contains(ownShipPosition)) {
                            map.panTo(ownShipPosition);
                        }
                    });
                });
            });
        }
    };
}]);
