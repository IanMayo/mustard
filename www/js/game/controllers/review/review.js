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
  }])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
  .controller('MissionReviewCtrl', ['$scope', '$interval', '$q', 'geoMath',
    'reviewSnapshot',
    function ($scope, $interval, $q, geoMath, reviewSnapshot) {

      var gameAccelRateIntervalId;


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


      // Target vessels marker
      _.each($scope.vesselsScenario, function (vessel) {
        var shortName = vessel.name.replace(/\s+/g, '');
        $scope.vessels[shortName] = updateMarker(vessel);
      });

      // and share the markers
      $scope.vesselsMarker = $scope.vessels;

      configureMap();

      var doStep = function()
      {
        // get the time
        var tNow = $scope.reviewState;
        // loop thorough the data, to get the time

        // move the scenario forward
        $scope.reviewState.reviewTime += $scope.reviewState.reviewTimeStep;

        // ok, get the positions
        console.log("time is:" + $scope.reviewState.reviewTime);

      };


      $scope.$watch('reviewState.accelRate', function (newVal) {
        $interval.cancel(gameAccelRateIntervalId);

        if (newVal) {
          // do play
          gameAccelRateIntervalId = $interval(doStep, 1000 / $scope.reviewState.accelRate);
        }
      });

      $scope.goBack = function () {
        console.log("in call");
        window.history.back();
      }
    }])
;
