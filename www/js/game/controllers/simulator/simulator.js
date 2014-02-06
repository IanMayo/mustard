angular.module('mustard.game.simulator', [])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
.controller('SimulatorCtrl', ['$scope', function ($scope) {

    /**
     * Target vessels list
     * @type {Array}
     */
    $scope.vessels = [];

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
