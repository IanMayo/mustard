angular.module('mustard.game.simulator', [
    'mustard.game.movementSimulation',
    'mustard.game.spatialViewDirective',
    'mustard.game.timeDisplayDirective',
    'mustard.game.timeRemainingDirective',
    'mustard.game.shipControlsDirective',
    'mustard.game.fireWeaponDirective',
    'mustard.game.shipStateDirective',
    'mustard.game.timeBearingDisplayDirective',
    'mustard.game.objectiveListDirective',
    'mustard.game.decision',
    'mustard.game.detection',
    'mustard.game.geoMath',
    'mustard.game.movement',
    'mustard.game.objectives'
  ])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
  .controller('SimulatorCtrl', ['$scope', 'scenario', 'movement', function ($scope, scenario) {

    /**
     * Name indexed list of vessels in scenario
     * @type {Array}
     */
    $scope.vessels = {};

    /**
     * Environment state
     * @type {Object}
     */
    $scope.environment = scenario.environment;

    /**
     * Mission objectives
     * @type {Object}
     */
    $scope.objectives = scenario.objectives;

    /**
     * Welcome message
     * @type {String}
     */
    $scope.welcome = scenario.welcome;

    /**
     * Initial properties properties for vessels
     * @type {Array}
     */
    $scope.vesselsScenario = scenario.vessels;

    /**
     * GeoJson map features
     * @type {Object}
     */
    $scope.mapFeatures = scenario.features;

    /**
     * what the user wishes the ownship vessel to do
     * @type {{course: number, speed: number}}
     */
    $scope.demandedState = {
      course: 0.00,
      speed: 1
    };

    /**
     * Current state of game
     * @type {Object}
     */
    $scope.gameState = {
      state: 'DO_STOP',
      accelRate: 0,
      simulationTime: 0,
      simulationTimeStep: 2000,
      patrolArea: scenario.patrolArea
    };
  }])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
  .controller('MissionSimulatorCtrl', ['$scope', '$interval', '$q', 'geoMath', 'movement', 'decision', 'objectives', 'detection',
    function ($scope, $interval, $q, geoMath, movement, decision, objectives, detection) {

      var gameAccelRateIntervalId;

      /**
       * Create config object for a vessel marker
       * @param {String} layerName Layer name
       * @param {Object} vessel
       * @returns {Object}
       */
      var vesselMarker = function (vessel) {

        // does the object have the magic leaflet goodness inserted?
        if (!vessel.layer) {
          // nope, in that case, make it suitable to be shown in leaflet

          // ok, is it a friendly vessel?
          if (vessel.categories.force == "RED") {
            // nope, hide it by default
            vessel.layer = "targets";
          }
          else {
            // ok, show it.
            vessel.layer = "ownShip";
          }

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
            icon: {
              iconUrl: 'img/vessels/' + iconSize + '/' + vType + '.png',
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize - iconSize / 5],  // put it just at the back of the vessel
              shadowSize: [0, 0]
            }
          });
        }

        // update the lat/long
        vessel.lat = vessel.state.location ? vessel.state.location.lat : 0;
        vessel.lng = vessel.state.location ? vessel.state.location.lng : 0;
        vessel.iconAngle = vessel.state.course;

        return vessel;
      };

      var initializeTargetShips = function () {
        var deferred = $q.defer();

        _.each($scope.vessels, function (targetShip) {
          // see if the target has a location
          if (!targetShip.state.location) {

            // cool, generate one - up to 10 miles from v1
            var direction = Math.random() * 360;
            var range = 2000 + Math.random() * 20000;

            if ($scope.gameState.patrolArea) {
              var pBounds = L.latLngBounds($scope.gameState.patrolArea);
              targetShip.state.location = geoMath.rhumbDestinationPoint(pBounds.getCenter(),
                geoMath.toRads(direction), range);
            } else {
              targetShip.state.location = geoMath.rhumbDestinationPoint($scope.vessels.ownShip.state.location,
                geoMath.toRads(direction), range);
            }
          }

          if (!targetShip.state.course) {
            var newCourse = Math.random() * 360;
            targetShip.state.course = newCourse;
            targetShip.state.demCourse = newCourse;
          }

          if (!targetShip.state.speed) {
            var newSpeed = 6 + Math.random() * 8;
            targetShip.state.speed = newSpeed;
            targetShip.state.demSpeed = newSpeed;
          }
        });

        $scope.gameState.state = 'RUNNING';

        deferred.resolve();
        return deferred.promise;
      };

      var shareSonarDetections = function () {
        // share the good news about detections
        var detections = null;
        var thisB;

        _.each($scope.vessels.ownShip.newDetections, function (detection) {
          // is this the first item?
          if (!detections) {
            detections = [new Date(detection.time)];
          }

          thisB = detection.bearing;

          // clip to +/- 180
          if (thisB > 180) {
            thisB -= 360;
          }

          // add this detection to the list
          detections.push(thisB);
        });

        // did we find any?
        if (detections) {
          $scope.$broadcast('addDetections', detections);
        }
      };

      var missionStatus = function () {
        // do we need to pause/stop?
        if (($scope.gameState.state === 'DO_PAUSE') || ($scope.gameState.state === 'DO_STOP')) {

          // take copy of game state
          var timeState = $scope.gameState.state;

          // scenario complete?
          if ($scope.gameState.successMessage) {
            $scope.gameState.state = 'SUCCESS';
            alert($scope.gameState.successMessage);
            delete $scope.gameState.successMessage;
          } else if ($scope.gameState.failureMessage) {
            $scope.gameState.state = 'FAILED';
            alert($scope.gameState.failureMessage);
            delete $scope.gameState.failureMessage;
          }

          // are there any achievements?
          if ($scope.gameState.achievements) {
            var showIt = function (element) {
              if (!element.hasDisplayed) {
                alert("Well done, you've been awarded a new achievement:\n'" + element.name + "'\n\n" + element.message);
                element.hasDisplayed = true;
              }
            };
            _.each($scope.gameState.achievements, showIt);
          }

          if (timeState === 'DO_PAUSE') {

            // ok, resume
            $scope.gameState.state = 'RUNNING';

          } else if ((timeState === 'DO_STOP') || (timeState === 'FAILED')) {

            // ok, stop the scenario
            $scope.gameState.accelRate = 0;

            // for diagnostics, show any narrative entries
            if ($scope.gameState.narratives) {
              var showOnConsole = function (element) {
                console.log("narrative. time:" + element.dateTime + " location:" + element.location + " msg:" + element.message);
              };
              console.log("== NARRATIVE ENTRIES FOR THIS MISSION ===");
              _.each($scope.gameState.narratives, showOnConsole);
              console.log("== ================================== ===");
            }

            // ok, move on to the review stage
            var r = confirm("Ready for the debriefing?");
            if (r == true) {
              alert("switch to the new route");
            } else {
              alert("let the user view/pan/zoom the plot");
            }
          }
        }
      };

      var updateMapMarkers = function () {
        _.each($scope.vessels, function (vessel) {
          return vesselMarker(vessel)
        });

        $scope.vesselsMarker = $scope.vessels;
        $scope.$broadcast('vesselsStateUpdated');
      };

      var configureMap = function () {
        angular.extend($scope, {
          mapCenter: {
            lat: $scope.vessels.ownShip.lat,
            lng: $scope.vessels.ownShip.lng,
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

      /** capture (and store) the state of the vessel at this time
       *
       * @param vessel the vessel who's date wa are archiving
       * @param timeIndex used to index the state data
       */
      var storeState = function (vessel, timeIndex) {
        // capture the state
        if (!vessel.stateHistory) {
          vessel.stateHistory = {};
        }
        vessel.stateHistory[timeIndex] = angular.copy(vessel.state);

        // does the vessel have any detections? If so, archive them
        if (vessel.newDetections && vessel.newDetections.length > 0) {
          // does it have a history?
          if (!vessel.detectionHistory) {
            vessel.detectionHistory = {};
          }
          vessel.detectionHistory[timeIndex] = vessel.newDetections;
        }
      };

      /** move the scenario forwards one step - including all the simulated processes
       *
       */
      var doStep = function () {

        // capture any existing data
        // DEFER IMPLEMENTATION - GROSS NEGATIVE EFFECT ON PERFORMANCE
        //        storeState($scope.vesselsState.ownShip, $scope.gameState.simulationTime);
        //        _.each($scope.vesselsState.targets, function (vessel) {
        //          storeState(vessel, $scope.gameState.simulationTime);
        //        });


        $scope.vessels.ownShip.state.demCourse = parseInt($scope.demandedState.course);
        $scope.vessels.ownShip.state.demSpeed = parseInt($scope.demandedState.speed);

        /////////////////////////
        // GAME LOOP STARTS HERE
        /////////////////////////

        // put all of the vessels into a named collection
        var vessels = $scope.vessels;


        // move the scenario forward
        $scope.gameState.simulationTime += $scope.gameState.simulationTimeStep;

        // loop through the vessels
        _.each(vessels, function (vessel) {
          movement.doMove($scope.gameState.simulationTime, vessel.state, vessel.perf);
        });

        // now that everyone is in their new location, do the detections
        detection.doDetections($scope.gameState.simulationTime, vessels);

        // and now the decisions
        _.each(vessels, function (vessel) {
          decision.doDecisions($scope.gameState.simulationTime, vessel.state, vessel.newDetections, vessel.behaviours);
        });

        // let the referees run
        objectives.doObjectives($scope.gameState, $scope.objectives, vessels);

        // update the UI
        shareSonarDetections();
        missionStatus();
        updateMapMarkers();

        /////////////////////////
        // GAME LOOP ENDS HERE
        /////////////////////////
      };

      // Target vessels marker
      _.each($scope.vesselsScenario, function (vessel) {
        var shortName = vessel.name.replace(/\s+/g, '');
        $scope.vessels[shortName] = vesselMarker(vessel);
      });

      // also give us a reliable instance of ownship
      $scope.vessels.ownShip = $scope.vessels.Ownship;

      var showWelcome = function () {
        // show the welcome message
        if ($scope.welcome) {
          alert($scope.welcome);
        }
      };

      initializeTargetShips().then(function () {
        configureMap();

        showWelcome();

        $scope.demandedState.course = parseInt($scope.vessels.ownShip.state.demCourse);
        $scope.demandedState.speed = parseInt($scope.vessels.ownShip.state.demSpeed);
      });

      $scope.$watch('gameState.accelRate', function (newVal) {
        $interval.cancel(gameAccelRateIntervalId);

        if (newVal) {
          // do play
          gameAccelRateIntervalId = $interval(doStep, 1000 / $scope.gameState.accelRate);
        }
      });
    }])

/**
 * @module Game
 * @class TrainingCtrl (controller)
 */
  .controller('TrainingSimulatorCtrl', ['$scope', function ($scope) {

  }]);
