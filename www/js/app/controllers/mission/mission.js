angular.module('subtrack90.app.mission', [])

/**
 * @module Mission
 * @class MissionCtrl (controller)
 */
.controller('MissionCtrl', ['$scope', '$routeParams', '$location', 'user', 'reviewSnapshot', 'mission',
    function ($scope, $routeParams, $location, user, reviewSnapshot, mission) {

    var nextMission = user.getNextMission(mission.id);
    var missionStatus = user.getMission(mission.id).status;

    $scope.mission = mission;

    /** has this mission been attempted yet?
     * @returns {string}
     */
    $scope.missionAttempted = function () {
        return (missionStatus === 'SUCCESS' || $scope.failedMission());
    };

    $scope.moveToMission = function (missionUrl) {
        $location.path('/game/mission/' + missionUrl);
    };

    $scope.doReview = function () {
        $location.path('/review/mission');
    };

    $scope.reviewEnabled = function () {
        return reviewSnapshot.isPresent();
    };

    $scope.failedMission = function () {
        return missionStatus === 'FAILURE';
    };

    $scope.nextMissionEnabled = function () {
        return nextMission && !$scope.failedMission();
    };

    $scope.nextMission = function () {
        $location.path('/mission/' + nextMission.id)
    };
}]);
