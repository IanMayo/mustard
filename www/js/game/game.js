angular.module('mustard.game', [])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
.controller('GameCtrl', ['$scope', function ($scope) {

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
.controller('MissionCtrl', ['$scope', function ($scope) {

}])

/**
 * @module Game
 * @class TrainingCtrl (controller)
 */
.controller('TrainingCtrl', ['$scope', function ($scope) {

}]);
