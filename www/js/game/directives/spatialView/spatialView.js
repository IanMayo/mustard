/**
 * @module mustard.game.spatialViewDirective
 */

angular.module('mustard.game.spatialViewDirective', [
    'mustard.game.geoMath',
    'mustard.game.panToVesselDirective',
    'mustard.game.mapScale'
])

.constant('spatialViewConfig', {
    ownShipVisiblePointsTime: 1000 * 60 * 10, // 10 min
    detectionFanLineLength: 40000 // in m
})

.directive('spatialView', ['spatialViewConfig', 'geoMath', function (spatialViewConfig, geoMath) {
    return {
        restrict: 'EA',
        scope: true,
        templateUrl: 'js/game/directives/spatialView/spatialView.tpl.html',
        link: function (scope) {

            /**
             * Visibility sonar bearing lines on the map
             * @type {Boolean}
             */
            scope.showSonarDetections = false;

            // Interim vessels states
            var localVesselsState = {ownShip: {history: []}};
            var defaultDetectionLinesCoordinates = [[{lat:0,lng:0}, {lat:0,lng:0}], [{lat:0,lng:0}, {lat:0,lng:0}]];
            // trackId filter for detection lines
            var detectionTrackId;

            /**
             * Add sonar bearing lines to the map
             */
            var addSonarDetections = function () {
                var detectionLinesCoordinates = [];

                // create line coordinates array
                _.each(localVesselsState, function (vesselsState) {
                    _.each(vesselsState.history, function (item) {
                        if (item.origin && item.trackId === detectionTrackId) {
                            // only values which have coordinates and belong to selected track on sonar view
                            detectionLinesCoordinates.push([item.origin, item.endPoint]);
                        }
                    });
                });

                scope.paths['sonarDetections'].latlngs = detectionLinesCoordinates;
            };

            /**
             * Show own ship traveling points on the map
             * @param {Object }newState
             */
            var ownShipTraveling = function (newState) {
                var currentOwnShipState = angular.copy(newState);
                var travelingPoints = [];
                var visiblePoints = [];

                currentOwnShipState.time = angular.copy(scope.gameState.simulationTime);

                // split traveling points array into two arrays: expired and visible
                travelingPoints = _.partition(localVesselsState.ownShip.history, function (item) {
                    return item.time < (currentOwnShipState.time - spatialViewConfig.ownShipVisiblePointsTime);
                });

                // keep only visible traveling points
                localVesselsState.ownShip.history = travelingPoints.pop();
                // add current state to history
                localVesselsState.ownShip.history.push(currentOwnShipState);

                // create array of points
                visiblePoints = _.map(localVesselsState.ownShip.history, function (item) {
                    return _.pick(item, 'lat', 'lng');
                });

                scope.paths['ownShipTravelling'].latlngs = visiblePoints;

                // adjust the center coordinates of the map if it's needed
                scope.$broadcast('ownShipMoved', currentOwnShipState);
            };

            /**
             * Show sonar detections lines on the map
             * @param {Object} ownShip
             * @param {Object} destinations
             */
            var sonarDetections = function (ownShip, destinations) {
                var detectionPoints = [];

                _.each(destinations, function (destination, index) {
                    if (!localVesselsState[index]) {
                        // a new detection in object
                        localVesselsState[index] = {history: []}
                    }

                    destination.time = angular.copy(scope.gameState.simulationTime);

                    destination.endPoint = geoMath.rhumbDestinationPoint(
                        destination.origin,
                        geoMath.toRads(destination.bearing),
                        spatialViewConfig.detectionFanLineLength
                    );

                    // split detection points array into two arrays: expired and visible
                    detectionPoints = _.partition(localVesselsState[index].history, function (item) {
                        return item.time < (destination.time - spatialViewConfig.ownShipVisiblePointsTime);
                    });

                    // keep only visible detection points
                    localVesselsState[index].history = detectionPoints.pop();
                    // add new detection to history
                    localVesselsState[index].history.push(destination);
                });

                if (scope.showSonarDetections) {
                    addSonarDetections();
                }
            };

            /**
             * Show markers of target vessels on the map
             * @type {Boolean}
             */
            scope.showTargets = false;

            /**
             * Available path types on the map
             * @type {Object}
             */
            scope.paths = {
                sonarDetections : {
                    type: 'multiPolyline',
                    color: '#A9A9A9',
                    weight: 2,
                    latlngs: defaultDetectionLinesCoordinates
                },
                ownShipTravelling: {
                    type: 'polyline',
                    weight: 4,
                    latlngs: []
                }
            };

            /**
             * GeoJson map features
             * @type {Object}
             */
            scope.features = {};

            scope.$on('vesselsStateUpdated', function () {
                var vessels = angular.copy(scope.vesselsMarker);
                var ownShip = vessels.ownShip;
                ownShipTraveling(ownShip);
                sonarDetections(ownShip, ownShip.newDetections);
            });

            /**
             * Add geoJson to the map
             */
            scope.$watch('mapFeatures', function mapFeatures(newVal) {
                if (newVal) {
                    // geoJson directive requires features config with "data" key
                    scope.features.data = newVal.features;
                    // disable default click handler and make the map change zoom on double click
                    scope.features.style = {
                        "clickable": false
                    };
                }
            });

            /**
             * Change  visibility of the layer with target markers
             */
            scope.toggleTargets = function () {
                scope.layers.overlays.targets.visible = !scope.layers.overlays.targets.visible;
            };

            /**
             * Visibility handler for sonar bearing lines
             */
            scope.$watch('showSonarDetections', function (newVal) {
                if (newVal) {
                    addSonarDetections();
                } else {
                    scope.paths['sonarDetections'].latlngs = defaultDetectionLinesCoordinates;
                }
            });

            /**
             * Change sonar bearing lines for a selected track only
             */
            scope.$parent.$on('sonarTrackSelected', function (event, trackId) {
                detectionTrackId = trackId;
                addSonarDetections();
            });
        }
    };
}]);