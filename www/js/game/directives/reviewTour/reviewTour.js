/**
 * @module mustard.game.reviewTourDirective
 */

angular.module('mustard.game.reviewTourDirective', ['mustard.game.leafletMapDirective'])

.directive('reviewTour', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        controller: ['$scope', function ($scope) {
            var narrativeSteps = [];
            var tour;
            var $stepWindow;
            var stepChangedListener = angular.noop;

            var changeTime = function () {
                var step = tour.getCurrentStep();
                $timeout(function () {
                    $scope.reviewState.reviewTime = narrativeSteps[step].time;

                    stepChangedListener(narrativeSteps[step]);
                });
            };

            tour = new Tour({
                onShown: changeTime,
                storage: false,
                animation: true,
                template: '<div class="popover tour">' +
                    '<div class="arrow"></div>' +
                    '<div class="popover-title"></div>' +
                    '<div class="popover-content"></div>' +
                    '<div class="popover-navigation">' +
                        '<div class="btn-group">' +
                            '<button class="btn btn-sm btn-default" data-role="prev"><span class="glyphicon glyphicon-backward"></span></button>' +
                            '<button class="btn btn-sm btn-default" data-role="next"><span class="glyphicon glyphicon-forward"></span></button>' +
                        '</div>' +
                        '<button class="btn btn-sm btn-default" data-role="end"><span class="glyphicon glyphicon-stop"></span></button>' +
                    '</div>' +
                '</div>'
            });

            tour.init();

            $scope.showNarrative = function () {
                tour.end();
                tour.restart();
                $scope.$broadcast('addBreakReviewTour');
            };


            $scope.$on("$routeChangeStart", function () {
                tour.end();
            });

            return {
                setNarrativeSteps: function (steps) {
                    narrativeSteps = steps;
                    tour.addSteps(steps);
                    tour.start();
                },
                hideSteps: function () {
                    $stepWindow = $('#step-' + (tour.getCurrentStep() || '0').toString());
                    $stepWindow.hide();
                },
                showCurrentStep: function () {
                    tour.showStep(tour.getCurrentStep());
                },
                showSteps: function () {
                    $stepWindow.show();
                },
                currentStep: function () {
                    return tour.getCurrentStep();
                },
                setStepChangeListener: function (listener) {
                    stepChangedListener = listener || stepChangedListener;
                },
                breakTour: function () {
                    tour.end();
                },
                isTourEnded: function () {
                    return tour.ended();
                }
            };
        }]
    }
}])

.directive('breakReviewTour', function () {
    return {
        restrict: 'A',
        require: '?^reviewTour',
        link: function (scope, elemment, attr, controller) {
            var pointer = null;
            // bind() doesn't support namespace in events, use the flag
            var doEventHandler = true;

            _.each(elemment.children(), function(elem) {
                var elem = angular.element(elem);
                if (elem.hasClass('pointer')) {
                    pointer = elem;
                }
            });

            scope.$on('addBreakReviewTour', function () {
                doEventHandler = true;
            });

            pointer.bind('mousedown touchstart', function () {
                if(doEventHandler) {
                    controller.breakTour();
                    doEventHandler = false;
                }
            });
        }
    }
});

