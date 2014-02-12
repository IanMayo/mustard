angular.module('mustard.game.spatialViewDirective', [])

.constant('spatialViewConfig', {
    ownShipVisiblePointsTime: 1000 * 20 // 10 min
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
             * Show sonar detections on the map
             * @param {Object} ownShip
             * @param {Object} targets
             */
            var sonarDetections = function (ownShip, targets) {
                var coordinates = [];

                _.each(targets, function (target, index) {
                    if (!localVesselsState[index]) {
                        // a new vessel in object
                        localVesselsState[index] = {history: []}
                    }

                    localVesselsState[index].history.push(target);
                    coordinates.push([ownShip, target]);
                });

                scope.$apply(function () {
                    scope.paths['sonarDetections'].latlngs = coordinates;
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
                    latlngs: [[{lat:0,lng:0}, {lat:0,lng:0}], [{lat:0,lng:0}, {lat:0,lng:0}]]
                },
                ownShipTravelling: {
                    type: 'polyline',
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