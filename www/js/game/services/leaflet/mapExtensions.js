/**
 * @module Leaflet Map Extensions
 *
 * Load custom plugin for leaflet map
 */

angular.module('subtrack90.game.mapExtensions', [
    'subtrack90.game.mapGraticule',
    'subtrack90.game.mapIconLabel',
    'subtrack90.game.mapMarkerRotate',
    'subtrack90.game.mapPathHook',
    'subtrack90.game.mapVectorMarker'
])
.service('mapExtensions', [
    'mapGraticule', 'mapIconLabel', 'mapMarkerRotate', 'mapPathHook', 'mapVectorMarker',
    function (mapGraticule, mapIconLabel, mapMarkerRotate, mapPathHook, mapVectorMarker) {
        var extensions = arguments;
        this.load = function () {
            angular.forEach(extensions, function (extension) {
                if (angular.isDefined(extension.init)) {
                    extension.init();
                }
            });

            // prevent loading modules next time
            this.load = angular.noop;
        }
}]);
