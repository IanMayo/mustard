/**
 * @module subtrack90.game.warningAboutTimer
 */

angular.module('subtrack90.game.warningAboutTimer', ['subtrack90.game.timeDisplayDirective'])
    
.directive('warningAlarm', ['$sce', 'timeAccelerated', function ($sce, timeAccelerated) {
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

            this.getAudioUrl = function () {
                return $sce.trustAsResourceUrl('audio/' + $scope.warn().sound);
            };

            this.addTask = function (task) {
                tasks.push(task);
            };
        }
    }
}])
    
.directive('soundAtSecond', function () {
    return {
        restrict: 'EA',
        replace: true,
        require: 'warningAlarm',
        template: "<audio><source src=\"{{getAudioUrl()}}\" type=\"audio/mpeg\">" +
            "Your browser does not support the audio tag. " +
            "</audio>",
        link: function (scope, element, attr, controller) {
            scope.getAudioUrl = function () {
                return controller.getAudioUrl();
            };

            controller.addTask({
                warn: function () {
                    element[0].play();
                }
            });
        }
    }
})

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
