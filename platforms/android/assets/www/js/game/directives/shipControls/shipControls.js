angular.module('mustard.game.shipControlsDirective', [])

.constant('shipControlsConfig', {
    courseRate: 5.00,
    speed: {
        min: 0,
        max: 40,
        rate: 1
    }
})

.directive('shipControls', ['shipControlsConfig', function (shipControlsConfig) {
    return {
        restrict: 'EA',
        scope: {
            course: '=',
            speed: '='
        },
        templateUrl: 'js/game/directives/shipControls/shipControls.tpl.html',
        link: function (scope) {
            scope.courseRate = shipControlsConfig.courseRate;
            scope.speedRate = shipControlsConfig.speed.rate;

            /**
             * Change own ship course
             * @param {Integer} value
             */
            scope.changeCourse = function (value) {
                var newCourse = scope.course + value;

                if (newCourse >= 360) {
                    newCourse -= 360;
                } else if (newCourse < 0) {
                    newCourse += 360;
                }

                scope.course = parseFloat(newCourse.toFixed(2));
            };

            /**
             * Change own ship speed
             * @param {Integer} value
             */
            scope.changeSpeed = function (value) {
                var newSpeed = scope.speed + value;

                if (newSpeed > shipControlsConfig.speed.max || newSpeed < shipControlsConfig.speed.min) {
                    return;
                }

                scope.speed = parseFloat((newSpeed).toFixed(2));
            };
        }
    };
}]);
