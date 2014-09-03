angular.module('subtrack90.game.shipControlsDirective', [])

.constant('shipControlsConfig', {
    courseRate: 5.00,
    speed: {
        min: 0,
        max: 40,
        rate: 1
    }
})

.constant('KNOTS_IN_MPS', 1.943844)// knots and m/s relation

.directive('shipControls', ['shipControlsConfig', 'KNOTS_IN_MPS', function (shipControlsConfig, KNOTS_IN_MPS) {
    return {
        restrict: 'EA',
        scope: {
            course: '=',
            speed: '='
        },
        templateUrl: 'js/game/directives/shipControls/shipControls.tpl.html',
        link: function (scope) {
            var speedInKnots = parseInt(scope.speed * KNOTS_IN_MPS);

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
                var newMPSSpeed;
                var newKnotsSpeed = speedInKnots + value;

                newMPSSpeed = newKnotsSpeed * 1 / KNOTS_IN_MPS;

                if (newMPSSpeed > shipControlsConfig.speed.max || newMPSSpeed < shipControlsConfig.speed.min) {
                    return;
                }

                speedInKnots = newKnotsSpeed;
                scope.speed = newMPSSpeed;
            };

            /**
             * Return onwship in knots.
             *
             * @returns {Number} speed in knots
             */
            scope.knotsSpeed = function () {
                return speedInKnots;
            };
        }
    };
}]);
