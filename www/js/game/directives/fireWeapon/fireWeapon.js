angular.module('mustard.game.fireWeaponDirective', [])

  .directive('fireWeapon', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      scope: {
        ownship: '='
      },
      templateUrl: 'js/game/directives/fireWeapon/fireWeapon.tpl.html',
      link: function (scope) {

        scope.doFire = function () {

          // 'Safe' $apply
          $timeout(function () {

            console.log("FIRE WEAPON from:" + scope.ownship.name);

            var state = scope.ownship.state;

            // check ownship has actions array
            if (!state.actions) {
              state.actions = [];
            }

            // register request to fire
            var course = 90;
            var name = _.uniqueId("W_");
            state.actions.push({"type": "FIRE_WEAPON", "name": name,
              "course": course, "duration": 120, "radius":1000});
          });
        }
      }
    };
  }]);