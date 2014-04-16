angular.module('mustard.game.eventPickerDirective', [])

    .directive('eventPicker', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                vessels: '=',
                history: '=',
                time: '@',
                timer: '='
            },
            templateUrl: 'js/game/directives/eventPicker/eventPicker.tpl.html',
            link: function (scope, element) {
                /**
                 * Event icon marker width
                 */
                var iconMarkerWidth = 0;

                /**
                 * Width of event markers wrapper
                 */
                var containerWidth = 0;

                /**
                 * Calculate width of event icon marker and event wrapper.
                 */
                var calcDimensions = function () {
                    // in the template there is short term element (.glyphicon)
                    // it is used to calculate marker width
                    iconMarkerWidth = element.children()[0].getBoundingClientRect().width;
                    // we can remove it now
                    element.children().remove();

                    containerWidth = element[0].getBoundingClientRect().width - iconMarkerWidth;
                };

                calcDimensions();

                scope.timePoints = {};

                scope.$watch('history', function (history) {
                    _.each(history.narratives, function (narrative, index) {
                        scope.timePoints['narrative' + index] = {
                            position: narrative.time / parseInt(scope.time) * containerWidth,
                            time: narrative.time
                        }
                    });
                });

                scope.changeEvent = function (time) {
                    scope.timer = time;
                };
            }
        };
    });
