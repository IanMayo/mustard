angular.module('mustard.app.mission', [])

/**
 * @module Mission
 * @class MissionCtrl (controller)
 */
.controller('MissionCtrl', ['$scope', '$routeParams', '$location', 'reviewSnapshot', 'mission',
    function ($scope, $routeParams, $location, reviewSnapshot, mission) {

    $scope.mission = mission;

    $scope.moveToMission = function (missionUrl) {
        $location.path('/game/mission/' + missionUrl);
    };

    $scope.doReview = function () {
        $location.path('/review/mission');
    };

    $scope.reviewEnabled = function () {
        return reviewSnapshot.isPresent();
    };
}]);
