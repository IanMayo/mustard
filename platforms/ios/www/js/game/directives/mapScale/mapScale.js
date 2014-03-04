/**
 * @module mustard.game.mapScale
 */

angular.module('mustard.game.mapScale', [])

.directive('mapScale', function () {
    return {
        restrict: 'A',
        require: 'leaflet',
        link: function (scope, element, attrs, controller) {
            controller.getMap().then(function(map) {
                var scaleConfig = {
                    metric: true,
                    imperial: true
                };

                map.whenReady(function () {
                    L.control.scale(scaleConfig).addTo(map);
                });
            });
        }
    };
});
