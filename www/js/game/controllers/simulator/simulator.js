angular.module('mustard.game.simulator', [])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
.controller('SimulatorCtrl', ['$scope', 'scenario', function ($scope, scenario) {
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
    $scope.gameState = {};
}])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
.controller('MissionSimulatorCtrl', ['$scope', function ($scope) {

}])

/**
 * @module Game
 * @class TrainingCtrl (controller)
 */
.controller('TrainingSimulatorCtrl', ['$scope', function ($scope) {

}]);
