angular.module('mustard.game.eventPickerDirective', [])

.directive('eventPicker', function () {
    return {
        restrict: 'EA',
        scope: {
            vessels: '=',
            history: '=',
            time: '@',
            timer: '='
        },
//        transclude: true,
        templateUrl: 'js/game/directives/eventPicker/eventPicker.tpl.html',
        link: function (scope) {
            
            scope.timePoints = {};

            scope.$watch('history', function (history) {
                var events = _.pick(history, 'narratives', 'vessels');
                _.each(events, function (event, type) {
                    if ('narratives' === type) {
                        _.each(event, function (narrative, index) {
                            scope.timePoints['narrative' + index] = {
                                position: narrative.time / parseInt(scope.time) * 100,
                                time: narrative.time
                            }
                        });
                    } else {
                        _.each(event, function (vessel) {
                            var firstPoint = vessel.track[0].time;
                            scope.timePoints[vessel.name] = {
                                position: firstPoint / parseInt(scope.time) * 100,
                                time: firstPoint
                            }
                        });
                    }
                });
            });
            
//            scope.$watch('vessels', function (vessels) {
//                if (vessels) {
//                    _.each(vessels, function (vessel) {
//                        var firstPoint = vessel.track[0].time;
//                        scope.timePoints[vessel.name] = {
//                            position: firstPoint / parseInt(scope.time) * 100,
//                            time: firstPoint
//                        }
//                    });
//                }
//            });

            scope.changeEvent = function (time) {
                scope.timer = time;
            };
        }
    };
});
