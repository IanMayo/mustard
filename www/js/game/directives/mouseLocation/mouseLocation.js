/**
 * @module subtrack90.game.mouseLocation
 */

angular.module('subtrack90.game.mouseLocation', [])

.directive('mouseLocation', function () {
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
                  L.control.mousePosition().addTo(map);
//                    L.control.scale(scaleConfig).addTo(map);
                });
            });
        }
    };
});
