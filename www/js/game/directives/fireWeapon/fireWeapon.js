angular.module('mustard.game.fireWeaponDirective', [])

  .directive('fireWeapon', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      scope: {
        ownship: '='
      },
      templateUrl: 'js/game/directives/fireWeapon/fireWeapon.tpl.html',
      link: function (scope) {

        var fireSonar = function(state, course)
        {

          // check ownship has actions array
          if (!state.actions) {
            state.actions = [];
          }

          // register request to fire
          var name = _.uniqueId("W_");
          state.actions.push({"type": "FIRE_WEAPON", "name": name,
            "course": course, "duration": 120, "radius":1000});

        };

        scope.doFireStraight = function () {

          // 'Safe' $apply
          $timeout(function () {
            fireSonar(scope.ownship.state, scope.ownship.state.course);
          });
        };
        scope.doFireSonar = function () {

          // 'Safe' $apply
          $timeout(function () {
            // 'Safe' $apply
            $timeout(function () {
              fireSonar(scope.ownship.state, scope.ownship.state.course);
            });
          });
        }

      }
    };
  }]);