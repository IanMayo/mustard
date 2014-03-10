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
       * Create a marker object for the vessel
       * @param {Object} vessel
       * @returns {Object}
       */
      var createMarker = function (vessel) {

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

        // ok, now create the object
        return {
          focus: false,
          message: vessel.name,
          layer: 'ownShip',
          lat: 0,
          lng: 0,
          time: 0,
          icon: {
            iconUrl: 'img/vessels/' + iconSize + '/' + vType + '.png',
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize / 2, iconSize - iconSize / 5],  // put it just at the back of the vessel
            shadowSize: [0, 0]
          }
        };
      };

      /** pre-initialise the layers for the map
       *
       */
      var configureMap = function () {
        angular.extend($scope, {
          mapCenter: {
            lat: $scope.history.center.lat,
            lng: $scope.history.center.lng,
            zoom: 7
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

      /** move forward a time step
       *
       */
      var doStep = function () {
        // get the time
        var tNow = $scope.reviewState.reviewTime;

        // move the scenario forward
        $scope.reviewState.reviewTime += $scope.reviewState.reviewTimeStep;

        // and update the plot
        doUpdate();
      }

      /** update the UI to the current review time
       *
       */
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
      };

      /** show the vessel markers, plus their routes
       *
       */
      var showVesselRoutes = function () {
        // store the vessel routes
        var routes = [];

        // start out with the markes
        _.each($scope.history.vessels, function (vessel, name) {

          // store this route
          routes.push(vessel.track);

          // declare this marker
          var shortName = name.replace(/\s+/g, '');
          $scope.vesselsMarker[shortName] = createMarker(vessel);
        });

        // put the routes into the scope
        $scope.paths.routes = {
          type: 'multiPolyline',
          color: '#A9A9A9',
          weight: 2,
          latlngs: routes
        }
      }

      showNarrativeMarkers = function () {
        // ok, lastly run the intro tour
        _.each($scope.history.narratives, function (item, index) {

          var narrMessage = "Time:" + item.time + "<br/>" + item.message;
          $scope.vesselsMarker['narrative_' + index] = {'lat': item.location.lat, 'lng': item.location.lng,
            'message': narrMessage};
        });
      }

      /** ok, handle the time rate change
       *
       */
      $scope.$watch('reviewState.accelRate', function (newVal) {
        $interval.cancel(gameAccelRateIntervalId);

        if (newVal) {
          // do play
          gameAccelRateIntervalId = $interval(doStep, 1000 / $scope.reviewState.accelRate);
        }
      });

      /** provide back button support
       *
       */
      $scope.goBack = function () {
        window.history.back();
      }


      // sort out the map layers
      configureMap();

      // show the markers, plus their routes
      showVesselRoutes();

      // show markers for the narrative entires
      showNarrativeMarkers();

      // Note: the narrative "tour" should not require a button press to start, it should just run.
      var narrIndex = 0;
      $scope.showNarrative = function () {

        var narrMarker;
        var item = $scope.history.narratives[narrIndex++];

        // ok, try to highlight the specified item.


      }


    }
  ])
;
