/**
 * @module mustard.game.reviewTourDirective
 */

angular.module('mustard.game.reviewTourDirective', ['mustard.game.leafletMapDirective'])

.directive('reviewTour', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        require: 'leafletMap',
        controller: function () {
            var tour = new Tour({
                storage: false,
                animation: true,
                template: '<div class="popover tour">' +
                    '<div class="arrow"></div>' +
                    '<div class="popover-content"></div>' +
                    '<div class="popover-navigation">' +
                        '<div class="btn-group">' +
                            '<button class="btn btn-sm btn-default" data-role="prev">« Prev</button>' +
                            '<button class="btn btn-sm btn-default" data-role="next">Next »</button>' +
                        '</div>' +
                        '<button class="btn btn-sm btn-default" data-role="end">End tour</button>' +
                    '</div>' +
                '</div>'
            });

            var $stepWindow;
            var step = 0;

            tour.init();

            return {
                setNarrativeSteps: function (steps) {
                    tour.addSteps(steps);
                    tour.start();
                },
                hideSteps: function () {
                    step = tour.getCurrentStep();
                    $stepWindow = $('#step-' + step);
                    $stepWindow.hide();
                },
                showSteps: function () {
                    tour.showStep(step);
                    $timeout(function () {
                        // drag the map changes position of a narrative marker
                        // wait while method showStep() applies new position according to new coordinates of the marker
                        $stepWindow.show();
                    }, 1000);
                }
            }
        }
    }
}]);

