angular.module('mustard.game.simulator', [
        'mustard.game.movementSimulation',
        'mustard.game.spatialViewDirective',
        'mustard.game.timeDisplayDirective',
        'mustard.game.timeRemainingDirective',
        'mustard.game.rangeCalculatorDirective',
        'mustard.game.shipControlsDirective',
        'mustard.game.fireWeaponDirective',
        'mustard.game.shipStateDirective',
        'mustard.game.timeBearingDisplayDirective',
        'mustard.game.objectiveListDirective',
        'mustard.game.decision',
        'mustard.game.detection',
        'mustard.game.reviewSnapshot',
        'mustard.game.geoMath',
        'mustard.game.movement',
        'mustard.game.objectives',
        'mustard.app.user'
    ])

/**
 * @module Game
 * @class GameCtrl (controller)
 */.controller('SimulatorCtrl', ['$scope', 'scenario', function ($scope, scenario) {

        /**
         * Indexed list of vessels in scenario
         * @type {Array}
         */
        $scope.vesselsScenario = scenario.vessels;

        /**
         * Indexed list of vessels in scenario
         * @type {Array}
         */
        $scope.vessels = {};

        /** the id for this mission (used to update user progress
         *
         * @type {String}
         */
        $scope.missionID = scenario.id;

        /**
         * OwnShip vessel API
         */
        $scope.ownShip = {};

        /** indexed list of dead vessels
         *
         * @type {{}}
         */
        $scope.deadVessels = {};

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
         * GeoJson map features
         * @type {Object}
         */
        $scope.mapFeatures = scenario.features;

        /** the vessel markers that we show on the map
         *
         * @type {{}}
         */
        $scope.vesselsMarker = {};

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
            accelRate: 16,
            simulationTime: 0,
            simulationTimeStep: 2000,
            patrolArea: scenario.patrolArea
        };
    }])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */.controller('MissionSimulatorCtrl', ['$scope', '$interval', '$q', 'geoMath', 'movement', 'decision', 'objectives', 'detection', 'reviewSnapshot', 'user', function ($scope, $interval, $q, geoMath, movement, decision, objectives, detection, reviewSnapshot, user) {

        var gameAccelRateIntervalId;

        var trackHistory = {};

        var startTime; // keep track of the start time, so we can pass the period to the history object.

        var updateMarker = function (vessel) {

            // the markers are indexed by vessel name, but that can't handle spaces,
            // so tidy the vessel name
            var shortName = vessel.name.replace(/\s+/g, '');

            // retrieve the marker
            var marker = $scope.vesselsMarker[shortName];

            // did we find a marker?
            if (!marker) {
                // nope, better create one
                marker = $scope.vesselsMarker[shortName] = createMarker(vessel);
            }

            var state = vessel.state;

            marker.lat = state.location ? state.location.lat : 0;
            marker.lng = state.location ? state.location.lng : 0;
            marker.iconAngle = state.course;
        };

        /**
         * Ownship vessel API helper (since the ownship name 'may' change)
         * @returns {Object}
         */
        var ownShipApi = function () {
            var ownShipName = _.first(_.toArray($scope.vessels)).name;
            var vessel = $scope.vessels[ownShipName];

            return {
                name: function () {
                    return ownShipName;
                },
                vessel: function () {
                    return vessel;
                },
                location: function () {
                    return vessel.state.location;
                },
                state: function () {
                    return vessel.state;
                },
                detections: function () {
                    return vessel.newDetections;
                },
                updateState: function (data) {
                    _.extend(vessel.state, data);
                }
            }
        };

        /**
         * Create (and update) config object for a vessel marker
         * @param {Object} vessel
         * @returns {Object}
         */
        var createMarker = function (vessel) {

            // ok, is it a friendly vessel?
            var layerName;
            if (vessel.categories.force == "RED") {
                // nope, hide it by default
                layerName = "targets";
            } else {
                // ok, show it.
                layerName = "ownShip";
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

            return {
                focus: false,
                lat: 0,
                lng: 0,
                message: vessel.name,
                layer: layerName,
                icon: {
                    iconAngle: 0,
                    iconUrl: 'img/vessels/' + iconSize + '/' + vType + '.png',
                    iconSize: [iconSize, iconSize],
                    iconAnchor: [iconSize / 2, iconSize - iconSize / 5],  // put it just at the back of the vessel
                    shadowSize: [0, 0]
                }
            };
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
                        targetShip.state.location = geoMath.rhumbDestinationPoint(pBounds.getCenter(), geoMath.toRads(direction), range);
                    } else {
                        targetShip.state.location = geoMath.rhumbDestinationPoint($scope.ownShip.vessel().state.location, geoMath.toRads(direction), range);
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

            _.each($scope.ownShip.detections(), function (detection) {
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
                    $scope.gameState.state = 'FAILURE';
                    alert($scope.gameState.failureMessage);
                    delete $scope.gameState.failureMessage;
                }

                // are there any achievements?
                if ($scope.gameState.achievements) {
                    _.each($scope.gameState.achievements, function (element) {

                        // has this achievement already been processed?
                        if (!element.processed) {
                            element.processed = true;

                            // has the user already earned it?
                            if (!user.isAchievementPresent(element.name)) {
                                // ok, display it
                                user.addAchievement(element.name);

                                // and display the alert
                                alert("Well done, you've been awarded a new achievement:\n'" + element.name + "'\n\n" + element.message);
                            }
                        }
                    });
                }

                if (timeState === 'DO_PAUSE') {

                    // ok, resume
                    $scope.gameState.state = 'RUNNING';

                } else if ((timeState === 'DO_STOP') || (timeState === 'FAILURE')) {

                    // ok, stop the scenario
                    $scope.gameState.accelRate = 0;

                    // hey was it success or failure?
                    if ($scope.gameState.state == "SUCCESS") {
                        user.missionCompleted($scope.missionID);
                    }
                    else if ($scope.gameState.state == "FAILURE") {
                        user.missionFailed($scope.missionID);
                    }

                    // for diagnostics, show any narrative entries
                    if ($scope.gameState.narratives) {
                        var showOnConsole = function (element) {
                            console.log("narrative. time:" + element.time + " location:" + element.location + " msg:" + element.message);
                        };
                        console.log("== NARRATIVE ENTRIES FOR THIS MISSION ===");
                        _.each($scope.gameState.narratives, showOnConsole);
                        console.log("== ================================== ===");
                    }

                    // ok, store the snapshot
                    storeHistory();

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

        var storeHistory = function () {
            // put in the categories
            _.each($scope.vessels, function (vessel) {
                // get history
                var history = trackHistory[vessel.name];
                if (history) {
                    history.categories = angular.copy(vessel.categories);
                }
            });

            // do we have a track history
            if (_.size(trackHistory)) {
                reviewSnapshot.put({
                    "period": [startTime, $scope.gameState.simulationTime],
                    "narratives": $scope.gameState.narratives,
                    "stepTime": $scope.gameState.simulationTimeStep,
                    "center": $scope.ownShip.location(),
                    "vessels": trackHistory
                })
            }
        };

        var updateMapMarkers = function () {
            _.each($scope.vessels, function (vessel) {
                updateMarker(vessel);
            });

            $scope.$broadcast('vesselsStateUpdated');
        };

        var configureMap = function (center) {
            angular.extend($scope, {
                mapCenter: {
                    lat: center.lat,
                    lng: center.lng,
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
                paths: {}
            });
        };

        /** capture (and store) the state of the vessel at this time
         *
         * @param vessel the vessel who's date wa are archiving
         * @param timeIndex used to index the state data
         */
        var storeState = function (vessel, timeIndex) {
            if (!trackHistory[vessel.name]) {
                trackHistory[vessel.name] = {};
                trackHistory[vessel.name].track = [];
            }

            trackHistory[vessel.name].track.push({'time': timeIndex, 'lat': vessel.state.location.lat, 'lng': vessel.state.location.lng,
                'course': vessel.state.course, 'speed': vessel.state.speed})
        };

        /** move the scenario forwards one step - including all the simulated processes
         *
         */
        var doStep = function () {

            // capture any existing data
            var ownShipDone = false;
            _.each($scope.vessels, function (vessel) {

                // TODO: once we've overcome the requirement for the artificial ownship, remove this name test

                if (vessel.name == $scope.ownShip.name()) {
                    if (!ownShipDone) {
                        storeState(vessel, $scope.gameState.simulationTime);
                        ownShipDone = true;
                    }
                } else {
                    storeState(vessel, $scope.gameState.simulationTime);

                }

            });

            $scope.ownShip.updateState({
                demCourse: parseInt($scope.demandedState.course),
                demSpeed: parseInt($scope.demandedState.speed)
            });

            /////////////////////////
            // GAME LOOP STARTS HERE
            /////////////////////////

            // move the scenario forward
            $scope.gameState.simulationTime += $scope.gameState.simulationTimeStep;

            // loop through the vessels
            _.each($scope.vessels, function (vessel) {
                movement.doMove($scope.gameState.simulationTime, vessel.state, vessel.perf);
            });

            // now that everyone is in their new location, do the detections
            detection.doDetections($scope.gameState.simulationTime, $scope.vessels);

            // and now the decisions
            _.each($scope.vessels, function (vessel) {
                decision.doDecisions($scope.gameState.simulationTime, vessel.state, vessel.newDetections, vessel.behaviours);
            });

            // let the referees run
            objectives.doObjectives($scope.gameState, $scope.objectives, $scope.vessels, $scope.deadVessels);

            // update the UI
            shareSonarDetections();
            missionStatus();
            updateMapMarkers();
            /////////////////////////
            // GAME LOOP ENDS HERE
            /////////////////////////
        };


        var showWelcome = function () {
            // show the welcome message
            if ($scope.welcome) {
                alert($scope.welcome);
            }
        };


        var doInit = function () {

            // loop through the scenario vessels, to do initialization
            _.each($scope.vesselsScenario, function (vessel) {

                // create a collection of vessels, indexed by name
                // NOTE: we're not using the short version of the name here.
                // in some scenarios Objectives objects specify which target
                // they relate to, by target name. So, we can't mangle the
                // indexed name value.
                $scope.vessels[vessel.name] = vessel;

                // and initialise the vessel marker (used in the spatial view)
                updateMarker(vessel);
            });

            // create a wrapped ownship instance, for convenience
            $scope.ownShip = ownShipApi();

            initializeTargetShips();

            configureMap($scope.ownShip.location());

            $scope.demandedState.course = parseInt($scope.ownShip.state().demCourse);
            $scope.demandedState.speed = parseInt($scope.ownShip.state().demSpeed);

            // initialiee the start time
            startTime = $scope.gameState.simulationTime;

            showWelcome();
        };

        $scope.$watch('gameState.accelRate', function (newVal) {
            $interval.cancel(gameAccelRateIntervalId);

            if (newVal) {
                // do play
                gameAccelRateIntervalId = $interval(doStep, 1000 / $scope.gameState.accelRate);
            }
        });

        $scope.goBack = function () {
            storeHistory();
            window.history.back();
        };

        // ok, do the init
        doInit();
    }])

/**
 * @module Game
 * @class TrainingCtrl (controller)
 */.controller('TrainingSimulatorCtrl', ['$scope', function ($scope) {

    }]);
