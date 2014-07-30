/**
 * @module mustard.game.sonarBearing
 */

angular.module('mustard.game.sonarBearing', ['mustard.game.plotGraphs'])

.directive('sonarBearing', ['$timeout', 'plotGraphs', function ($timeout, plotGraphs) {
    return {
        restrict: 'EA',
        scope: {
            series: '=',
            initialTime: '@timer'
        },
        template: '' +
            '<div id="viz-container" class="visContainer">' +
                '<div id="viz-minor" class="vizSonar"></div>' +
            '</div>',
        link: function (scope, element) {
            var seriesNum = _.range(16);
            var labels = ['Time'].concat(_.map(seriesNum, function (num) {return 'S' + (num + 1).toString();}));

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

            var options = _.extend({
                initialTime: new Date(parseInt(scope.initialTime)),
                detectionSelect: pointClickCallback
            }, plotElements, colors);

            plotGraphs.setup(options);
            plotGraphs.createPlot();

            scope.$on('addDetections', function addDetectionsToPlots(event, detections, simulationTime) {
                // extract track names from detections
                var tracks = [].concat(_.pluck(scope.series, 'trackId'));
                // replace default label names by track names
                labels = _.map(labels, function mapLabels(label, index) {
                    return tracks[index] || label;
                });

                _.each(detections, function (values) {
                    var detectionsAssociatedWithLabels = [];
                    var time = values[0];
                    var currentTime = new Date(time.getTime());
                    var detectionsValue = _.rest(values);
                    _.each(labels, function (label, index) {
                        if (detectionsValue[index]) {
                            detectionsAssociatedWithLabels.push({
                                name: label,
                                date: currentTime,
                                degree: detectionsValue[index],
                                strength: lineStroke
                            });
                        }
                    });

                    plotGraphs.addDetection(detectionsAssociatedWithLabels);
                });

                plotGraphs.updatePlotTime(new Date(simulationTime));
            });
        }
    }
}]);
