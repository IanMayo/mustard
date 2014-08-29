angular.module('subtrack90.game.review', [
    'subtrack90.game.spatialViewDirective',
    'subtrack90.game.timeDisplayDirective',
    'subtrack90.game.timeRemainingDirective',
    'subtrack90.game.shipStateDirective',
    'subtrack90.game.objectiveListDirective',
    'subtrack90.game.reviewSnapshot',
    'subtrack90.game.eventPickerDirective',
    'subtrack90.game.reviewTourDirective',
    'subtrack90.game.geoMath',
    'subtrack90.game.sonarBearing',
    'subtrack90.game.rzslider'
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
//    console.log(JSON.stringify(reviewSnapshot.get()));
    $scope.history = reviewSnapshot.get();

    /**
     * Current state of review
     * @type {Object}
     */
    $scope.reviewState = {
      reviewTime: 0,
      reviewTimeStep: 2000
    };

    /**
     * Indexed list of vessels in scenario
     * @type {Array}
     */
    $scope.vessels = {};
}])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
.controller('MissionReviewCtrl', ['$scope', '$interval', '$timeout', 'steppingControls',
    function ($scope, $interval, $timeout, steppingControls) {

    /**
     * Apply filter to a vessel name.
     * @param {String} name
     * @returns {String}
     */
    var vesselShortName = function (name) {
        return name.replace(/\s+/g, '');
    };

    /**
     * Ownship vessel API helper (since the ownship name 'may' change)
     * @returns {Object}
     */
    var ownShipApi = function () {
        var ownShipName = vesselShortName(_.keys($scope.history.vessels).shift());

        return {
            name: function () {
              return ownShipName;
            }
        }
    };

    var lockedVessels = {};

    /**
     * Add necessary properties to create a map marker
     * @param {Object} vessel
     * @param {String} name
     * @returns {Object}
     */
    var markerOptions = function (vessel, name) {
        var stateData = {
            name: name,
            state: {
            course: 0,
                location: {
                    lat: 0,
                    lng: 0
                }
            }
        };

        return _.extend(vessel, stateData);
    };

    /**
     * Set state options to vessel from track step.
     *
     * @param {Object} reviewTrack
     * @param {Object} historyVessel
     * @param {String} shortName
     */
    var applyTrackState = function (reviewTrack, historyVessel, shortName) {
        var vessel;
        // update state of existed vessel or add a vessel from history
        vessel = $scope.vessels[shortName] || angular.copy(historyVessel);

        // create vessel config state from history track
        var newOptions = {
            name: shortName,
            state: {
                speed: reviewTrack.speed,
                location: {
                    lat: reviewTrack.lat,
                    lng: reviewTrack.lng
                },
                course: reviewTrack.course
            }
        };

        // apply config options
        _.extend(vessel, newOptions);
        $scope.vessels[shortName] = vessel;
    };

    /**
     * Create a list of vessels with track time state.
     *
     * @returns {Object}
     */
    var vesselsTracks = function () {
        // shortcut to the time
        var tNow = $scope.reviewState.reviewTime;
        var vessels = {};

        // ok, retrieve the state, to update teh marker
        _.each($scope.history.vessels, function (vessel, name) {

            // what's the time of the first element in this array
            var firstTime = vessel.track[0].time;

            // how much further along are we?
            var delta = tNow - firstTime;

            // what's the index of the relevant array item
            var index = delta / $scope.history.stepTime;

            var reviewTrack;
            var shortName;

            // is this less than the length?
            reviewTrack = vessel.track[index];
            shortName = vesselShortName(name);

            if (reviewTrack) {
                applyTrackState(reviewTrack, vessel, shortName);
            }

            vessels[shortName] = {vessel: vessel, reviewTrack: reviewTrack};
        });

        return vessels;
    };

    /**
     * Remove destroyed vessels if their track time are outside of simulation step.
     *
     * @param {Object} vessels
     */
    var removeDestroyedVessels = function (vessels) {
        _.each(vessels, function (item, shortName) {
            var reviewTrack = item.reviewTrack;
            var vessel = item.vessel;

            if (reviewTrack) {
                // a vessel has a track options on simulation time step
                if (reviewTrack.destroyed) {
                    if (reviewTrack.wasDestroyed) {
                        // hold a vessel to show it's icon marker
                        // even the vessel doesn't have track options simulation time step (tombstone marker case)
                        lockedVessels[shortName] = reviewTrack;
                        vessel.wasDestroyed = reviewTrack.wasDestroyed;
                        // remove the vessel from scope to prevent broadcasting it to leafletMap directive
                        delete $scope.vessels[shortName];
                    }

                    // remove a vessel's marker or change the icon to tombstone
                    $scope.$broadcast('vesselsDestroyed', vessel);
                }
            } else {
                if ($scope.ownShip.name() === vessel.name) {
                    // stop review process
                    $scope.reviewState.reviewTime = 0;
                } else if (!lockedVessels[shortName] || $scope.reviewState.reviewTime < lockedVessels[shortName].time) {
                    // case to remove torpedo icon marker
                    if ($scope.reviewState.reviewTime > 0) {
                        // if simulation process is running
                        // remove the vessel from scope to prevent broadcasting it to leafletMap directive
                        delete $scope.vessels[shortName];
                        // delete marker from the map
                        $scope.$broadcast('vesselsDestroyed', vessel);
                    }
                }
            }

            if (lockedVessels[shortName] && $scope.reviewState.reviewTime < lockedVessels[shortName].time) {
                // case to remove tombstone icon marker
                if ($scope.reviewState.reviewTime > 0) {
                    // if simulation process is running
                    // remove the vessel from scope to prevent broadcasting it to leafletMap directive
                    delete $scope.vessels[shortName];
                    // delete tombstone from the map
                    $scope.$broadcast('vesselsDestroyed', vessel);
                    // create torpedo icon marker
                    $scope.$broadcast('changeMarkers', [vessel]);
                }
            }
        });
    };

    /**
     * Update the UI to the current review time.
     *
     */
    var doUpdate = function () {
        var vessels = vesselsTracks();

        $scope.$broadcast('updateReviewPlot', $scope.reviewState.reviewTime);

        $scope.$broadcast('changeMarkers', $scope.vessels);

        removeDestroyedVessels(vessels);
    };

    /**
     * Show the vessel markers, plus their routes.
     */
    var showVesselRoutes = function () {
        // store the vessel routes
        var routes = [];

        // start out with the markes
        _.each($scope.history.vessels, function (vessel, name) {

            // store this route
            routes.push(vessel.track);

            // declare this marker
            var shortName = vesselShortName(name);
            $scope.vessels[shortName] = markerOptions(vessel, shortName);
        });

        $timeout(function () {
            $scope.$broadcast('showFeatures', $scope.history.mapFeatures);
            $scope.$broadcast('changeMarkers', $scope.vessels);
            $scope.$broadcast('vesselRoutes', routes);
            $scope.$broadcast('changeTargetsVisibility', true);
        }, 100);
    };

    var showNarrativeMarkers = function () {
        // loop through the narratives
        var narratives = {};

        _.each($scope.history.narratives, function (item, index) {
            var timeLabel = new Date(item.time);
            timeLabel = timeLabel.toLocaleTimeString();

            narratives['narrative_' + index] = {
                location: {
                    lat: item.location.lat,
                    lng: item.location.lng
                },
                message: item.message,
                name: _.uniqueId('narrative'),
                time: item.time,
                timerLabel: timeLabel
            };

          // TODO: we should also create tour "stops" for each narrative entry
        });

        $timeout(function () {
            $scope.$broadcast('narrativeMarkers', narratives);
        }, 100);
    };

    // create a wrapped ownship instance, for convenience
    $scope.ownShip = ownShipApi();

    $timeout(function () {
        $scope.$broadcast('updateReviewPlot', $scope.reviewState.reviewTime, $scope.history.detections);
        $scope.history.detections = null;
    });

    $scope.$watch('reviewState.reviewTime', function (newVal) {
        if (newVal) {
            doUpdate();
        }
    });

    /**
     * Provide back button support
     */
    $scope.goBack = function () {
        window.history.back();
    };

    /** formatting function for the slider control
     *
     * @param value the current slider value (millis)
     * @returns {string} a time-string representation of the value
     */
    $scope.translate = function(value) {
      var date = new Date(value);
      return date.toLocaleTimeString();
    };

    $scope.simulationTimeEnd = function () {
        return _.last($scope.history.vessels[$scope.ownShip.name()].track).time;
    };

    // show the markers, plus their routes
    showVesselRoutes();

    // show markers for the narrative entires
    showNarrativeMarkers();

    // put the markers on the map in their initial locations
    doUpdate();

    // hide Stepping controls in TimeDisplay directive
    steppingControls.setVisibility(false);

}]);
