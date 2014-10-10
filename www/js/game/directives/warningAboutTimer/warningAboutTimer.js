/**
 * @module subtrack90.game.warningAboutTimer
 */

angular.module('subtrack90.game.warningAboutTimer', [
    'subtrack90.app.sound',
    'subtrack90.game.timeDisplayDirective'
])
    
.directive('warningAlarm', ['$sce', 'timeAccelerated', 'sound', function ($sce, timeAccelerated, sound) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            time: '=',
            timeStep: '&',
            warn: '&'
        },

        controller: function ($scope) {
            var warningIsActive = false;
            var tasks = [];

            var runTask = function (type) {
                _.each(tasks, function (task) {
                    if (angular.isFunction(task[type])) {
                        task[type]();
                    }
                })
            };

            $scope.$watch('time', function (millisec, oldVal) {
                if (oldVal > millisec) {
                    // show warning background for a new time-out
                    if (false === warningIsActive &&
                        millisec / timeAccelerated.current() < parseInt($scope.warn().inSecond) * $scope.timeStep()) {

                        // play alarm sound
                        $scope.warn().sound && sound.play($scope.warn().sound);

                        // show warning only once for the time-out
                        runTask('warn');
                        warningIsActive = true;
                    }
                } else {
                    // next time-out alarm was added
                    runTask('removeWarn');
                    warningIsActive = false;
                }
            });

            this.addTask = function (task) {
                tasks.push(task);
            };
        }
    }
}])

.directive('warningBackground', function () {
    return {
        restrict: 'EA',
        require: 'warningAlarm',
        link: function (scope, element, attr, controller) {
            controller.addTask({
                warn: function () {
                    element.addClass('play-warning');
                },
                removeWarn: function () {
                    if (element.hasClass('play-warning')) {
                        // Remove warning background what was shown for previous time-out
                        element.removeClass('play-warning');
                    }
                }
            });
        }
    }
});
