angular.module('mustard.app.main', [])

/**
 * @module Main
 * @class MainCtrl (controller)
 */
.controller('MainCtrl', function ($scope, $location) {

    $scope.moveToMission = function (id) {
        $location.path('/mission/' + id);
    };
});
