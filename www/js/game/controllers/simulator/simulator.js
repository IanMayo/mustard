angular.module('mustard.game.simulator', [
    'mustard.game.movementSimulation',
    'mustard.game.spatialViewDirective',
    'mustard.game.timeDisplayDirective',
    'mustard.game.shipControlsDirective'
])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
.controller('SimulatorCtrl', ['$scope', 'scenario', 'movement', function ($scope, scenario, movement) {
    /**
     * Target vessels state.
     * @type {Array}
     */
    $scope.vesselsState = [];

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
     * Initial properties properties for vessels
     * @type {Array}
     */
    $scope.vesselsScenario = scenario.vessels;

    /**
     * Current state of game
     * @type {Object}
     */
    $scope.gameState = {
        speed: 0,
        simulationTime: 0,
        ownShip: {
            course: 0.00,
            speed: 1
        }
    };
}])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
.controller('MissionSimulatorCtrl', ['$scope', function ($scope) {

    /**
     * Create config object for a vessel marker
     * @param {String} layer Layer name
     * @param {Object} vessel
     * @returns {Object}
     */
    var vesselMarker = function (layer, vessel) {
        return {
            lat: vessel.initialState.location.lat,
            lng: vessel.initialState.location.long,
            focus: false,
            message: vessel.name,
            layer: layer,
            iconAngle: vessel.initialState.course
        }
    };

    // Own ship marker
    var ownShip = vesselMarker('ownShip', _.first($scope.vesselsScenario));
    var targetShipMarkers = {};

     // Target vessels marker
    _.each(_.rest($scope.vesselsScenario), function (vessel) {
        targetShipMarkers[_.uniqueId('target_')] = vesselMarker('targets', vessel);
    });

    $scope.vesselsState = _.extend({ownShip: ownShip}, targetShipMarkers);

    angular.extend($scope, {
        mapCenter: {
            lat: ownShip.lat,
            lng: ownShip.lng,
            zoom: 8
        },
        layers: {
            baselayers: {
                map: {
                    name: 'map',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
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

    /**
     * Code for demonstration
     * Change vessels states
     */
    var moveVessels = function () {
        _.map($scope.vesselsState, function (vessel) {
            vessel.lat += Math.random() / 5;
            vessel.lng += Math.random() / 5;
            if (vessel.iconAngle) {
                vessel.iconAngle += Math.random() * 10;
            }
            return vessel;
        });
        $scope.vesselsMarker = angular.copy($scope.vesselsState);
        $scope.$broadcast('vesselsStateUpdated', angular.copy($scope.vesselsMarker));
    };

    /**
     * Code for demonstration
     */
    setTimeout(function () {
        $scope.vesselsMarker = angular.copy($scope.vesselsState);
        $scope.$broadcast('vesselsStateUpdated');
        setInterval(moveVessels, 5000);
    }, 1000);
}])

/**
 * @module Game
 * @class TrainingCtrl (controller)
 */
.controller('TrainingSimulatorCtrl', ['$scope', function ($scope) {

}]);
