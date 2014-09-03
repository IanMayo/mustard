/**
 * @module subtrack90.game.sonarBearing
 */

angular.module('subtrack90.game.sonarBearing', ['subtrack90.game.plotGraphs'])

.directive('sonarBearing', ['$timeout', 'plotGraphs', function ($timeout, plotGraphs) {
    return {
        restrict: 'EA',
        scope: {
            initialTime: '@timer'
        },
        template: '' +
            '<div id="viz-container" class="visContainer">' +
                '<div id="viz-minor" class="vizSonar"></div>' +
            '</div>',
        link: function (scope, element, attrs) {

            var lineStroke = 2;
            var colors = {
                indicator: "#aace00",
                heading: "#1A68DB"
            };
            var containerElement = element.children();
            var plotElements = {
                sonarElement: containerElement[0],
                graphs: []
            };

            angular.forEach(containerElement.children(), function (el, index) {
                switch(index) {
                    case 0: plotElements.liveGraphElement = el;
                        plotElements.graphs.push({
                            element: el,
                            height: 1,
                            duration: 8,
                            yTicks: 25,
                            detectionPointRadii: {rx: 3, ry: 4.5},
                            margin: {top: 25, left: 60, bottom: 5, right: 10}
                        });
                        break;
                }
            });

            var pointClickCallback = function (detectionName) {
                // 'Safe' $apply
                $timeout(function () {
                    scope.$emit('sonarTrackSelected', detectionName);
                });
            };

            var assignDetectionsPointsToNames = function (detections) {
                var detectionsAssociatedWithLabels = [];
                var time = detections.detections[0];
                var currentTime = new Date(time.getTime());
                var detectionsPoints = _.rest(detections.detections);
                _.each(detectionsPoints, function (point, index) {
                    detectionsAssociatedWithLabels.push({
                        name: detections.tracks[index],
                        date: currentTime,
                        degree: point,
                        strength: lineStroke
                    });
                });

                return detectionsAssociatedWithLabels;
            };

            var options = _.extend({
                initialTime: new Date(parseInt(scope.initialTime)),
                detectionSelect: pointClickCallback,
                dataSeriesHandler: assignDetectionsPointsToNames,
                reviewMode: !_.isUndefined(attrs.reviewMode),
                trackTimeStep: attrs.timeStep
            }, plotElements, colors);

            plotGraphs.setup(options);
            plotGraphs.createPlot();

            scope.$on('addDetections', function addDetectionsToPlots(event, detectionSeries, simulationTime) {
                _.each(detectionSeries, function (series) {
                    if (series.detections.length) {
                        var detections = assignDetectionsPointsToNames(series);
                        plotGraphs.addDetection(detections);
                    }
                });

                plotGraphs.updatePlotTime(new Date(simulationTime));
            });

            scope.$on('updateReviewPlot', function (event, time, detections) {
                plotGraphs.updateReviewPlot(new Date(time), detections);
            });

            scope.$on('$destroy', function () {
                plotGraphs.remove();
            });
        }
    }
}]);
