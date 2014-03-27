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
.controller('MissionReviewCtrl', ['$scope', '$interval', '$timeout', function ($scope, $interval, $timeout) {

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
     * Update the UI to the current review time
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

            var nearest;
            var shortName;
            var thisV;

            // is this less than the length?
            if (index < vessel.track.length) {
                nearest = vessel.track[index];

                if (nearest) {
                    shortName = vesselShortName(name);
                    thisV = $scope.vessels[shortName];

                    thisV.name = shortName
                    thisV.state = {
                        speed: nearest.speed,
                        location: {
                            lat: nearest.lat,
                            lng: nearest.lng
                        },
                        course: nearest.course
                    }
                }
            } else {
                // stop review process
                $scope.reviewState.reviewTime = 0;
            }
        });

        $scope.$broadcast('changeMarkers', $scope.vessels);
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
            $scope.$broadcast('changeMarkers', $scope.vessels);
            $scope.$broadcast('vesselRoutes', routes);
            $scope.$broadcast('changeTargetsVisibility', true);
        }, 100);
    };

    var showNarrativeMarkers = function () {
        // loop through the narratives
        var narratives = {};

        _.each($scope.history.narratives, function (item, index) {
            var narrMessage = "Time:" + item.time + "<br/>" + item.message;
            narratives['narrative_' + index] = {
                location: {
                    lat: item.location.lat,
                    lng: item.location.lng
                },
                message: narrMessage
            };

          // TODO: we should also create tour "stops" for each narrative entry
        });

        $timeout(function () {
            $scope.$broadcast('narrativeMarkers', narratives);
        }, 100);
    };

    // create a wrapped ownship instance, for convenience
    $scope.ownShip = ownShipApi();

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

    // show the markers, plus their routes
    showVesselRoutes();

    // show markers for the narrative entires
    showNarrativeMarkers();

    // put the markers on the map in their initial locations
    doUpdate();

    // Note: the narrative "tour" should not require a button press to start, it should just run.
    // but, we may provide UI control to restart tour.
    $scope.showNarrative = function () {

    // start the tour
    }
}]);
