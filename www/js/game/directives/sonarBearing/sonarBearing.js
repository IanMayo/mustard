/**
 * @module mustard.game.sonarBearing
 */

angular.module('mustard.game.sonarBearing', [])

.directive('sonarBearing', ['$timeout', function ($timeout) {
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
            var sonar_minor_el;
            var sonar_major_el;
            var plotElements = {
                sonar_el: containerElement[0],
                major_el: null,
                minor_el: null
            };

            angular.forEach(containerElement.children(), function (el, index) {
                switch(index) {
                    case 0: sonar_major_el = el;
                        plotElements.minor_el = el;
                        break;
                    case 1: sonar_minor_el = el;
                        plotElements.major_el = el;
                        break;
                }
            });

            var pointClickCallback = function (point) {
                // 'Safe' $apply
                $timeout(function () {
                    scope.$emit('sonarTrackSelected', point.key);
                });
            };

            var configurePlots = function () {
                var firstRunTime = new Date().getTime();

                // set major viz's yDomain
                plot.major_viz().yDomain([firstRunTime - options.PAST_TIME_JAR, firstRunTime + options.LIVE_TIME_JAR ]);
                plot.major_viz()();

                plot.major_viz().onclick(pointClickCallback);
                plot.minor_viz().onclick(pointClickCallback);
            };

            var addDetection = function(time, seriesName, bearing, strength) {
                plot.addDetection(time, seriesName, bearing, strength);
            };

            var options = _.extend({
                PAST_TIME_JAR: 16 * 60 * 1000,
                LIVE_TIME_JAR: 1 * 60 * 1000
            }, plotElements, colors);

            var plot = PlotSonar()
                .options(options)  // do initialization settings
                .createPlot();

            configurePlots();

            scope.$on('addDetections', function (event, dataValues) {
                // extract track names from detections
                var tracks = [].concat(_.pluck(scope.series, 'trackId'));
                // replace default label names by track names
                labels = _.map(labels, function (label, index) {
                    return tracks[index] || label;
                });


                _.each(dataValues, function (values) {
                    var time = values[0];
                    var currentTime = new Date();
                    currentTime.setSeconds(time.getSeconds());
                    currentTime.setMinutes(time.getMinutes());
                    var detections = _.rest(values);
                    _.each(labels, function (label, index) {
                        if (detections[index]) {
                            addDetection(currentTime, label, detections[index], lineStroke);
                        }
                    });
                })
            });
        }
    }
}]);
