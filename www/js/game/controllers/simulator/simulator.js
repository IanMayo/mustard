angular.module('mustard.game.simulator', [])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
.controller('SimulatorCtrl', ['$scope', function ($scope) {

    /**
     * Target vessels state.
     * @type {Array}
     */
    $scope.vesselsState = [];

    /**
     * Environment state
     * @type {Object}
     */
    $scope.environment = {};

    /**
     * Mission objectives
     * @type {Object}
     */
    $scope.objectives = {};

    /**
     * Initial properties properties for vessels
     * @type {Array}
     */
    $scope.vesselsScenario = [];

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
