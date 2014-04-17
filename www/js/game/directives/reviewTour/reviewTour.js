/**
 * @module mustard.game.reviewTourDirective
 */

angular.module('mustard.game.reviewTourDirective', ['mustard.game.leafletMapDirective'])

.directive('reviewTour', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        controller: ['$scope', function ($scope) {
            var narrativeSteps = [];
            var currentStep = 0;
            var tour;
            var $stepWindow;

            var changeTime = function () {
                var step = tour.getCurrentStep();
                $timeout(function () {
                    $scope.reviewState.reviewTime = narrativeSteps[step].time;
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
                    currentStep = tour.getCurrentStep();
                    $stepWindow = $('#step-' + currentStep);
                    $stepWindow.hide();
                },
                changeTour: function () {
                    tour.showStep(currentStep);
                    $timeout(function () {
                        // drag the map changes position of a narrative marker
                        // wait while method showStep() applies new position according to new coordinates of the marker
                        $stepWindow.show();
                    }, 1000);
                },
                showSteps: function () {
                    $stepWindow.show();
                },
                currentStep: function () {
                    return tour.getCurrentStep();
                }
            };
        }]
    }
}])

.directive('rzslider', function () {
    return {
        restrict: 'E',
        require: '?^reviewTour',
        link: function (scope, elemment, attr, controller) {
            var pointer = null;
            _.each(elemment.children(), function(elem, index) {
                var elem = angular.element(elem);
                if (elem.hasClass('pointer')) {
                    pointer = elem;
                }
            });

            pointer.bind('mousedown touchstart', function () {
                controller.hideSteps();
            });

            pointer.bind('mouseup touchend', function () {
                controller.showSteps();
            });
        }
    }
});

