angular.module('mustard.app.mission', [])

/**
 * @module Mission
 * @class MissionCtrl (controller)
 */
  .controller('MissionCtrl', function ($scope, $routeParams, $location) {

    $scope.missionNumber = $routeParams.id;

    $scope.moveToMission = function (id) {
      $location.path('/game/mission/' + id);
    };
  });
