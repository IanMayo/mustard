/**
 * @module mustard.game.sonarBearing
 */

angular.module('mustard.game.sonarBearing', [])

.directive('sonarBearing', function () {
    return {
        restrict: 'EA',
        scope: {
            series: '='
        },
        template: '' +
            '<div id="viz-container" class="visContainer">' +
                '<div id="viz-minor" class="viz-sonar viz-minor"></div>' +
                '<div id="viz-major" class="viz-sonar viz-major"></div>' +
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
                sonarElement: containerElement[0]
            };

            angular.forEach(containerElement.children(), function (el, index) {
                switch(index) {
                    case 0: plotElements.liveGraphElement = el;
                        break;
                    case 1: plotElements.reviewGraphElement = el;
                        break;
                }
            });

            var options = _.extend({}, plotElements, colors);

            var plotGraphs = PlotGraphs(options);
            plotGraphs.createPlot();

            scope.$on('addDetections', function addDetectionsToPlots(event, dataValues) {
                // extract track names from detections
                var tracks = [].concat(_.pluck(scope.series, 'trackId'));
                // replace default label names by track names
                labels = _.map(labels, function mapLabels(label, index) {
                    return tracks[index] || label;
                });

                _.each(dataValues, function (values) {
                    var detections = [];
                    var time = values[0];
                    var currentTime = new Date(time.getTime());
                    var detectionsValue = _.rest(values);
                    _.each(labels, function (label, index) {
                        if (detectionsValue[index]) {
                            detections.push({
                                name: label,
                                date: currentTime,
                                degree: detectionsValue[index],
                                strength: lineStroke
                            });
                        }
                    });

                    plotGraphs.addDetection(detections);
                })
            });
        }
    }
});
