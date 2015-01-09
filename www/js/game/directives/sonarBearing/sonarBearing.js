/**
 * @module subtrack90.game.sonarBearing
 */

angular.module('subtrack90.game.sonarBearing', ['subtrack90.game.plotGraphs'])

/**
 * Create composite sonar plot.
 *
 * The sonar plot can be configured to contain one or move custom graphs (plotGraphs).
 * Previously, multiple plotGraphs have been present to allow different zoom levels
 */
.directive('sonarBearing', ['plotGraphs', function (plotGraphs) {
    return {
        restrict: 'EA',
        scope: {
            initialTime: '@timer'
        },
        template: '' +
            '<div id="viz-container" class="visContainer">' +
                '<div id="viz-minor" class="vizSonar retro-font">' +
                '</div>' +
            '</div>',
        link: function (scope, element, attrs) {

            var colors = {
                indicator: "#aace00",
                heading: "#1A68DB"
            };
            var containerElement = element.children();
            var plotElements = {
                sonarElement: containerElement[0],
                graphs: []
            };

            // Add sonar graphs to the sonar plot.
            angular.forEach(containerElement.children(), function (el, index) {
                switch(index) {
                    case 0: plotElements.liveGraphElement = el;
                        plotElements.graphs.push({
                            element: el,
                            height: 1,
                            duration: 4,
                            yTicks: 15,
                            margin: {top: 25, left: 60, bottom: 5, right: 10}
                        });
                        break;
                }
            });

            /**
             * Send a message when a detection path was selected.
             *
             * @param {String} detectionName detection path name
             */
            var pointClickCallback = function (detectionName) {
                // 'Safe' $apply
                scope.$evalAsync(function (scope) {
                    scope.$emit('sonarTrackSelected', detectionName);
                });
            };

            /**
             * Create correct signal strength value to use it in the detection path transparency factor.
             *
             * @param {Float} strength Signal strength
             * @returns  {Float} signal strength value from 0 to 1 with 0.01 step
             */
            var normalizeSignalStrength = function (strength) {
                // use signal strength values from 0 to 10
                var signalStrength =  Math.max(0, strength);
                signalStrength = Math.min(10, signalStrength);

                // change the basis from 0-10 to 0-1
                signalStrength = Math.round(signalStrength / 10 * 100) / 100;

                return signalStrength;
            };

            /**
             * Map detections points to detections names
             * @param {Array} detections Detections series
             * @returns {Array} detections
             */
            var assignDetectionsPointsToNames = function (detections) {
                var detectionsAssociatedWithLabels = [];
                var time = detections.detections[0];
                var currentTime = new Date(time);
                var detectionsPoints = _.rest(detections.detections);

                _.each(detectionsPoints, function (point, index) {
                    detectionsAssociatedWithLabels.push({
                        trackName: detections.tracks[index],
                        date: currentTime,
                        degree: point.bearing,
                        strength: normalizeSignalStrength(point.strength)
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
