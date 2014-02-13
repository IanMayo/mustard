angular.module('mustard.game.spatialViewDirective', [])

.constant('spatialViewConfig', {
    ownShipVisiblePointsTime: 1000 * 60 * 10 // 10 min
})

.directive('spatialView', ['spatialViewConfig', function (spatialViewConfig) {
    return {
        restrict: 'EA',
        scope: true,
        templateUrl: 'js/game/directives/spatialView/spatialView.tpl.html',
        link: function (scope) {

            // Interim vessels states
            var localVesselsState = {ownShip: {history: []}};

            /**
             * Show own ship traveling points on the map
             * @param {Object }newState
             */
            var ownShipTraveling = function (newState) {
                var ownShipState = angular.copy(newState);
                var travelingPoints = [];
                var visiblePoints = [];

                ownShipState.time = _.now();

                // split traveling points array into two arrays: expired and visible
                travelingPoints = _.partition(localVesselsState.ownShip.history, function (item) {
                    return item.time < (ownShipState.time - spatialViewConfig.ownShipVisiblePointsTime);
                });

                // keep only visible traveling points
                localVesselsState.ownShip.history = travelingPoints.pop();
                // add current state to history
                localVesselsState.ownShip.history.push(ownShipState);

                // create array of points
                visiblePoints = _.map(localVesselsState.ownShip.history, function (item) {
                    return _.pick(item, 'lat', 'lng');
                });

                scope.$apply(function () {
                    scope.paths['ownShipTravelling'].latlngs = visiblePoints;
                });

                // update center coordinates of the map
                scope.mapCenter.lat = ownShipState.lat;
                scope.mapCenter.lng = ownShipState.lng;
            };

            /**
             * Show sonar detections lines on the map
             * @param {Object} ownShip
             * @param {Object} destinations
             */
            var sonarDetections = function (ownShip, destinations) {
                var detectionPoints = [];
                var detectionLinesCoordinates = [];

                _.each(destinations, function (destination, index) {
                    var destinationState = angular.copy(destination);

                    if (!localVesselsState[index]) {
                        // a new detection in object
                        localVesselsState[index] = {history: []}
                    }
                    destinationState.time = _.now();
                    destinationState.origin = {
                        lat: ownShip.lat,
                        lng: ownShip.lng
                    };

                    // split detection points array into two arrays: expired and visible
                    detectionPoints = _.partition(localVesselsState[index].history, function (item) {
                        return item.time < (destinationState.time - spatialViewConfig.ownShipVisiblePointsTime);
                    });

                    // keep only visible detection points
                    localVesselsState[index].history = detectionPoints.pop();
                    // add new detection to history
                    localVesselsState[index].history.push(destinationState);

                    // create line coordinates array
                    _.each(localVesselsState[index].history, function (item) {
                        detectionLinesCoordinates.push([item.origin, _.pick(item, 'lat', 'lng')]);
                    });
                });

                scope.$apply(function () {
                    scope.paths['sonarDetections'].latlngs = detectionLinesCoordinates;
                });
            };

            /**
             * Show markers of target vessels on the map
             * @type {Boolean}
             */
            scope.showTargets = false;

            /**
             * Available path types on the map
             */
            scope.paths = {
                sonarDetections : {
                    type: 'multiPolyline',
                    color: '#A9A9A9',
                    weight: 2,
                    latlngs: [[{lat:0,lng:0}, {lat:0,lng:0}], [{lat:0,lng:0}, {lat:0,lng:0}]]
                },
                ownShipTravelling: {
                    type: 'polyline',
                    weight: 4,
                    latlngs: []
                }
            };

            scope.$on('vesselsStateUpdated', function () {
                var vessels = angular.copy(scope.vesselsMarker);
                var ownShip = vessels.ownShip;
                var targets = _.omit(vessels, 'ownShip');
                ownShipTraveling(ownShip);
                sonarDetections(ownShip, targets);
            });

            scope.toggleTargets = function () {
                scope.layers.overlays.targets.visible = !scope.layers.overlays.targets.visible;
            };
        }
    };
}]);