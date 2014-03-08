angular.module('mustard.app.mission', [])

/**
 * @module Mission
 * @class MissionCtrl (controller)
 */
.controller('MissionCtrl',['$scope','$routeParams','$location','reviewSnapshot',
    function ($scope, $routeParams, $location, reviewSnapshot) {

    $scope.missionNumber = $routeParams.id;

    $scope.moveToMission = function (id) {
        $location.path('/game/mission/' + id);
    };

    $scope.reviewEnabled = function(){
      return reviewSnapshot.isPresent();
    }
}]);
