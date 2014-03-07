/**
 * @module mustard.game.spatialViewDirective
 */

angular.module('mustard.game.spatialViewDirective', [
    'mustard.game.geoMath',
    'mustard.game.panToVesselDirective',
    'mustard.game.mapScale',
    'mustard.game.mouseLocation'
  ])

  .constant('spatialViewConfig', {
    ownShipVisiblePointsTime: 1000 * 60 * 10, // 10 min
    ownShipVisibleDetectionsTime: 1000 * 60 * 5, // 5 min
    ownShipPointsInterval: 1000 * 60, // each minute
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
         * Add ownship traveling point to the map
         * @param {Object} latlngs
         */
        var addOwnShipTravellingPoint = function (latlngs) {
          var key = _.uniqueId('ownShipPoint_');
          var point = {
            type: 'circleMarker',
            radius: 1,
            latlngs: latlngs,
            opacity: 1
          };

          scope.paths[key] = point;
        };

        /**
         * Update ownship traveling points on the map
         */
        var updateOwnShipTravellingPoint = function () {
          var opacityStep = spatialViewConfig.ownShipPointsInterval / spatialViewConfig.ownShipVisiblePointsTime;
          _.map(scope.paths, function (item, key) {
            if (item.type === 'circleMarker') {
              item.opacity -= opacityStep;

              if (item.opacity <= 0) {
                // delete a point if it becomes invisible
                delete scope.paths[key];
              }
            }
          });
        };

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
         * @param {Object} newState
         */
        var addOwnshipUpdate = function (newState) {
          var currentOwnShipState = angular.copy(newState);
          var currentTime = angular.copy(scope.gameState.simulationTime);

          if ((currentTime > localVesselsState.ownShip.nextMoveTime) || !localVesselsState.ownShip.nextMoveTime) {
            // add point for a next time interval or first
            updateOwnShipTravellingPoint();
            addOwnShipTravellingPoint(_.pick(currentOwnShipState, 'lat', 'lng'));
            localVesselsState.ownShip.nextMoveTime = currentTime + spatialViewConfig.ownShipPointsInterval;
          }

          // adjust the center coordinates of the map if it's needed
          scope.$broadcast('ownShipMoved', currentOwnShipState);
        };

        /**
         * Show sonar detections lines on the map
         * @param {Object} ownShip
         * @param {Object} detections
         */
        var sonarDetections = function (ownShip, detections) {
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
          sonarDetections: {
            type: 'multiPolyline',
            color: '#A9A9A9',
            weight: 2,
            latlngs: defaultDetectionLinesCoordinates
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
          addOwnshipUpdate(ownShip);
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
          scope.showSonarDetections = true;
        });
      }
    };
  }]);