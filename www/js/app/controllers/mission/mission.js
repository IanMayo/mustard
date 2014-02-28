angular.module('mustard.app.mission', [])

/**
 * @module Mission
 * @class MissionCtrl (controller)
 */
.controller('MissionCtrl', function ($scope, $routeParams) {

    $scope.missionNumber = $routeParams.id;
});
