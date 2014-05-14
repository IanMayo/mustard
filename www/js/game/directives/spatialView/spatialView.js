/**
 * @module mustard.game.spatialViewDirective
 */

angular.module('mustard.game.spatialViewDirective', [
    'mustard.game.geoMath',
    'mustard.game.leafletMapDirective'
])

.constant('spatialViewConfig', {
    ownShipVisiblePointsTime: 1000 * 60 * 10, // 10 min
    ownShipVisibleDetectionsTime: 1000 * 60 * 5, // 5 min
    ownShipPointsInterval: 1000 * 60, // each minute
    detectionFanLineLength: 40000 // in m
})

.directive('spatialView', ['spatialViewConfig', 'geoMath', function (spatialViewConfig, geoMath) {
    var opacityStep = spatialViewConfig.ownShipPointsInterval / spatialViewConfig.ownShipVisiblePointsTime;

    return {
        restrict: 'EA',
        scope: true,
        controller: function ($scope) {
            this.updateOwnshipTravelingPoints = function (circleMarkers) {
                _.each(circleMarkers, function (item) {
                    item.setStyle({opacity: item.options.opacity - opacityStep});

                    if (item.options.opacity <= 0) {
                        // delete a point if it becomes invisible
                        $scope.$broadcast('deleteOwnshipTravelingPoint', item);
                    }
                });
            };

            this.ownShipName = function () {
                return $scope.ownShip.name();
            };

            this.setTargetsVisibility = function (value) {
                $scope.targetsVisibility = value;
            };
        },

        templateUrl: 'js/game/directives/spatialView/spatialView.tpl.html',

        link: function (scope) {

            /**
             * Show markers of target vessels on the map
             * @type {Boolean}
             */
            scope.targetsVisibility = false;

            /**
             * Visibility sonar bearing lines on the map
             * @type {Boolean}
             */
            scope.showSonarDetections = false;

            // Interim vessels states
            var localVesselsState = {ownShip: {nextMoveTime: 0}};
            var defaultDetectionLinesCoordinates = [
                [
                    {lat: 0, lng: 0},
                    {lat: 0, lng: 0}
                ],
                [
                    {lat: 0, lng: 0},
                    {lat: 0, lng: 0}
                ]
            ];
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

                scope.$broadcast('addSonarDetection', detectionLinesCoordinates);
            };

            /**
             * Show own ship traveling points on the map
             * @param {Object} newState
             */
            var ownshipTraveling = function (newState) {

                // create a wrapped location
                var newLocation = {'lat': newState.location.lat, 'lng': newState.location.lng};

                // capture the time
                var currentTime = newState.time;

                if ((currentTime > localVesselsState.ownShip.nextMoveTime) || !localVesselsState.ownShip.nextMoveTime) {
                    // add point for a next time interval or first
                    scope.$broadcast('addOwnshipTravelingPoint', newLocation);

                    // ok, when do we drop the next marker?
                    localVesselsState.ownShip.nextMoveTime = currentTime + spatialViewConfig.ownShipPointsInterval;
                }
            };

            /**
             * Show sonar detections lines on the map
             * @param {Object} detections
             */
            var sonarDetections = function (detections) {
                var detectionPoints = [];

                _.each(detections, function (detection, index) {
                    if (!localVesselsState[index]) {
                        // a new detection in object
                        localVesselsState[index] = {history: []}
                    }

                    detection.endPoint = geoMath.rhumbDestinationPoint(
                        detection.origin,
                        geoMath.toRads(detection.bearing),
                        spatialViewConfig.detectionFanLineLength
                    );

                    // split detection points array into two arrays: expired and visible
                    var calculatedTime = detection.time - spatialViewConfig.ownShipVisibleDetectionsTime;
                    detectionPoints = _.partition(localVesselsState[index].history, function (item) {
                        return item.time < calculatedTime;
                    });

                    // keep only visible detection points
                    localVesselsState[index].history = detectionPoints.pop();
                    // add new detection to history
                    localVesselsState[index].history.push(detection);
                });

                if (scope.showSonarDetections) {
                    addSonarDetections();
                }
            };

            scope.$on('vesselsStateUpdated', function () {
                var ownShip = scope.ownShip.vessel();

                // TODO: the following is a workaround, to be resolved once we resume
                // the presumption that there is a vessel named ownShip
                if (ownShip) {
                    ownshipTraveling(ownShip.state);
                    sonarDetections(ownShip.newDetections);
                }
            });

            /**
             * Visibility handler for sonar bearing lines
             */
            scope.$watch('showSonarDetections', function (newVal) {
                if (newVal) {
                    addSonarDetections();
                } else {
                    scope.$broadcast('addSonarDetection', defaultDetectionLinesCoordinates);
                }
            });

            /**
             * Change sonar bearing lines for a selected track only
             */
            scope.$on('shareSelectedTrack', function (event, trackId) {
                detectionTrackId = trackId;

                // NOTE: we no longer wish to switch on display of detections
                // when a sonar track is selected (this was of most value when debugging)
                //   scope.showSonarDetections = true;
            });

            /**
             * Targets visibility mode
             */
            scope.toggleTargets = function () {
                scope.$broadcast('changeTargetsVisibility', scope.targetsVisibility);
            };
        }
    };
}]);
