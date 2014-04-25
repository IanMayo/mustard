angular.module('DemoApp', ['mustard.game.sonarBearing']);

function DemoCtrl($scope, $interval) {

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    $interval(function () {
        var data = new Date();
        $scope.$broadcast('addDetections', [new Date(), getRandomInt(110,120), getRandomInt(140,150), getRandomInt(130,140)]);
    }, 2000);
}