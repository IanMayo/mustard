angular.module('mustard.game.review', [
    'mustard.game.spatialViewDirective',
    'mustard.game.timeDisplayDirective',
    'mustard.game.timeRemainingDirective',
    'mustard.game.shipStateDirective',
    'mustard.game.timeBearingDisplayDirective',
    'mustard.game.objectiveListDirective',
    'mustard.game.reviewSnapshot',
    'mustard.game.geoMath'
  ])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
  .controller('ReviewCtrl', ['$scope', 'reviewSnapshot', function ($scope, reviewSnapshot) {

    /**
     *  indexed list of vessels in scenario
     * @type {Array}
     */
    $scope.history = reviewSnapshot.get();

    /**
     * Current state of review
     * @type {Object}
     */
    $scope.reviewState = {
      accelRate: 0,
      reviewTime: 0,
      reviewTimeStep: 2000
    };

    $scope.vesselsMarker = {};
  }])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
  .controller('MissionReviewCtrl', ['$scope', '$interval', '$q', 'geoMath',
    'reviewSnapshot',
    function ($scope, $interval, $q, geoMath, reviewSnapshot) {

      var gameAccelRateIntervalId;

      /**
       * Create (and update) config object for a vessel marker
       * @param {Object} vessel
       * @returns {Object}
       */
      var updateMarker = function (vessel) {

        // does the object have the magic leaflet goodness inserted?
        if (!vessel.layer) {
          // ok, show it.
          vessel.layer = "ownShip";

          // produce the icon for this vessel type
          var vType = vessel.categories.type.toLowerCase();

          // ok, and the icon initialisation bits
          var iconSize;
          switch (vessel.categories.type) {
            case "WARSHIP":
              iconSize = 64;
              break;
            case "TORPEDO":
              iconSize = 32;
              break;
            case "SUBMARINE":
              iconSize = 48;
              break;
            case "MERCHANT":
              iconSize = 64;
              break;
            case "FISHERMAN":
              iconSize = 32;
              break;
            case "HELICOPTER":
              iconSize = 32;
              break;
            default:
              console.log("PROBLEM - UNRECOGNISED VEHICLE TYPE: " + vessel.categories.type);
              break;
          }

          vessel = _.extend(vessel, {
            focus: false,
            message: vessel.name,
            lat:0,
            lng:0,
            time:0,
            icon: {
              iconUrl: 'img/vessels/' + iconSize + '/' + vType + '.png',
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize - iconSize / 5],  // put it just at the back of the vessel
              shadowSize: [0, 0]
            }
          });
        }

        return vessel;
      };

      var configureMap = function () {
        angular.extend($scope, {
          mapCenter: {
            lat: $scope.history.center.lat,
            lng: $scope.history.center.lng,
            zoom: 9
          },
          layers: {
            baselayers: {
              map: {
                name: 'map',
                type: 'xyz',
                url: 'img/mobac/atlases/MapQuest/{z}/{x}/{y}.jpg'
              }
            },
            overlays: {
              ownShip: {
                type: 'group',
                name: 'ownShip',
                visible: true
              },
              targets: {
                type: 'group',
                name: 'targets',
                visible: false
              }
            }
          },
          vesselsMarker: {},
          paths: {}
        });
      };


      configureMap();

      // Target vessels marker
      _.each($scope.history.vessels, function (track, name) {
        var shortName = name.replace(/\s+/g, '');
        $scope.vesselsMarker[shortName] = updateMarker(track);
      });

      var doStep = function()
      {
        // get the time
        var tNow = $scope.reviewState.reviewTime;

        // move the scenario forward
        $scope.reviewState.reviewTime += $scope.reviewState.reviewTimeStep;

        // and update the plot
        doUpdate();
      }

      var doUpdate = function () {

        // shortcut to the time
        var tNow = $scope.reviewState.reviewTime;

        // ok, retrieve the state, to update teh marker
        _.each($scope.history.vessels, function (vessel, name) {

          // what's the time of the first element in this array
          var firstTime = vessel.track[0].time;

          // how much further along are we?
          var delta = tNow - firstTime;

          // what's the index of the relevant array item
          var index = delta / $scope.history.stepTime;

          // is this less than the length?
          if (index < vessel.track.length) {
            var nearest = vessel.track[index];
            if (nearest) {
              var shortName = name.replace(/\s+/g, '');
              var thisV = $scope.vesselsMarker[shortName];

              // copy the status update into the vessel marker
              thisV.lat = nearest.lat;
              thisV.lng = nearest.lng;
              thisV.iconAngle = nearest.course;
            }
          }
        });

        if (!markersDone) {
          markersDone = true;
        }
      };

      var markersDone = false;


      $scope.$watch('reviewState.accelRate', function (newVal) {
        $interval.cancel(gameAccelRateIntervalId);

        if (newVal) {
          // do play
          gameAccelRateIntervalId = $interval(doStep, 1000 / $scope.reviewState.accelRate);
        }
      });

      $scope.goBack = function () {
        window.history.back();
      }
    }])
;
