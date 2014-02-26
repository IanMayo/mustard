/**
 * @module mustard.game.panToVesselDirective
 */

angular.module('mustard.game.panToVesselDirective', [])

.directive('panToVesselPosition', [function () {
    return {
        restrict: 'A',
        require: 'leaflet',
        link: function (scope, element, attrs, controller) {
            controller.getMap().then(function(map) {
                map.whenReady(function () {
                    scope.$on('ownShipMoved', function (event, ownShipState) {
                        var ownShipPosition = L.latLng(ownShipState.lat, ownShipState.lng);

                        if (!map.getBounds().contains(ownShipPosition)) {
                            map.panTo(ownShipPosition);
                        }
                    });
                });
            });
        }
    };
}]);
