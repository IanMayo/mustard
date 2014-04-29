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
            '<div id="viz_container" class="visContainer">' +
                '<div id="viz-major"></div>' +
                '<div id="viz-minor"></div>' +
                '<div id="legend"></div>' +
            '</div>',
        link: function (scope, element) {
            var seriesNum = _.range(16);
            var labels = ['Time'].concat(_.map(seriesNum, function (num) {return 'S' + (num + 1).toString();}));

            var lineStroke = 2;
            var MINOR_TIME_JAR = 30 * 1000; // 30 seconds
            var UPDATE_STEP = 2000; // 2 seconds
            var colors = {
                indicator: "#aace00",
                heading: "#1A68DB"
            };
            var containerElement = element.children();
            var _t_step_init;
            var sonar_minor_el;
            var sonar_major_el;

            angular.forEach(containerElement.children(), function (el, index) {
                switch(index) {
                    case 0: sonar_minor_el = el; break;
                    case 1: sonar_major_el = el; break;
                }
            });

            var getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            var _t_step = function (n) {
                return new Date( _t_step_init + n*UPDATE_STEP );
            };

            // Minor Viz
            var sonar_minor_viz = d3.sonar()
                .container_el(sonar_minor_el)
                .xTickValues([0, 45, 90, 135, 180, 225, 270, 315, 360])
                .xTickFormat(function (d) {
                        return (d <= 180) ? ((d+180) === 360 ? 0: (d+180)) : d-180;
                    }
                )
                .xTickFormatInverse(function (d) {
                        return (d <= 180) ? d+180 : d-180;
                    }
                )
                .yTicks(3)
                .headingKeys({
                    x: 'degree',
                    y: 'date'
                })
                .detectionKeys({
                    x: 'degree',
                    y: 'date'
                })
                .showXAxis(true)
                .margin({top: 40, left: 100, bottom: 0, right: 50})
                .dataAge(MINOR_TIME_JAR)
                .colors(colors);

            var setDataUpdateRoutine = function () {
                var i = 0;
                _t_step_init = new Date().getTime();

                addHeading(_t_step(++i), getRandomInt(110,150));
            };

            var addHeading = function (time, bearing) {
                var data = {
                    name: 'Heading',
                    time: new Date(time),
                    value: bearing
                }

                sonar_minor_viz
                    .purgeOldData(true)
                    .addHeading(data);
            };

            var addDetection = function(time, seriesName, bearing, strength) {
                var data = {
                    name: seriesName,
                    time: new Date(time),
                    value: bearing,
                    strength: strength
                };

                sonar_minor_viz
                    .purgeOldData(true)
                    .addDetection(data);
            };

            // begin
            sonar_minor_viz();
            // update dataset
            setDataUpdateRoutine();

            scope.$on('addDetections', function (event, dataValues) {
                // extract track names from detections
                var tracks = [].concat(_.pluck(scope.series, 'trackId'));
                // replace default label names by track names
                labels = _.map(labels, function (label, index) {
                    return tracks[index] || label;
                });

                var time = _.first(dataValues);
                var detections = _.rest(dataValues);
                var currentTime = new Date();
                currentTime.setSeconds(time.getSeconds());
                currentTime.setMinutes(time.getMinutes());
                _.each(labels, function (label, index) {
                    if (detections[index]) {
                        addDetection(currentTime, label, detections[index], lineStroke);
                    }
                });
            });
        }
    }
});
