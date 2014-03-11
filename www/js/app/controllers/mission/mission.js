angular.module('mustard.app.mission', [])

/**
 * @module Mission
 * @class MissionCtrl (controller)
 */
  .controller('MissionCtrl', ['$scope', '$routeParams', '$location', 'reviewSnapshot',
    function ($scope, $routeParams, $location, reviewSnapshot) {

      /** make the id available to the scope
       *
       */
      $scope.missionNumber = $routeParams.id;

      /* TODO: So let's keep things simple for now and leave this url creating and potential 404 problem here.
       * for managing potential 404 error we could use something like this
       * https://github.com/matys84pl/angularjs-nginclude-handling-404/blob/master/www/js/app/main.js
       * or this
       * http://stackoverflow.com/questions/20836374/how-to-catch-angular-ng-include-error
       */
      $scope.guidanceUrl = 'guidance/' + $routeParams.id + '/index.html';

      $scope.moveToMission = function (id) {
        $location.path('/game/mission/' + id);
      };

      $scope.doReview = function () {
        $location.path('/review/mission');
      };

      $scope.reviewEnabled = function () {
        return reviewSnapshot.isPresent();
      };
    }]);
