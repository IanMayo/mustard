angular.module('subtrack90.game.timeBearingDisplayDirective', ['subtrack90.game.spatialViewDirective'])

.directive('timeBearingDisplay', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            series: '='
        },
        templateUrl: 'js/game/directives/timeBearingDisplay/timeBearingDisplay.tpl.html',
        link: function (scope) {
            // create default values for Dygraph config
            var seriesNum = _.range(16);
            var labels = ['Time'].concat(_.map(seriesNum, function (num) {return 'S' + (num + 1).toString();}));
            var data = [new Date(0)].concat(_.map(seriesNum, function () {return 0;}));
            var colors = _.map(seriesNum, function () {return '#0f0'});

            var graphInitializer = [
                'Sonar',
                data,
                labels,
                'Bearing',
                [-180, 180]
            ];

            // collections of graphs & data series'
            var dataSeries = {};
            var graphs = {};

            var initGraph = function (name, datum, labels, yLabel, valueRange) {
                var data = [datum];
                var thisGraph = new Dygraph(document.getElementById(name), data,
                    {
                        drawPoints: true,
                        showRoller: false,
                        valueRange: valueRange,
                        legend: 'always',
                        labels: labels,
                        ylabel: yLabel,
                        yLabelWidth: 12,
                        axes: {
                            x: {axisLabelFontSize: 10},
                            y: {axisLabelFontSize: 10}
                        },
                        pointClickCallback: function (event, point) {
                            // 'Safe' $apply
                            $timeout(function () {
                                scope.$emit('sonarTrackSelected', point.name);
                            });
                        }
                    }
                );
                // and store them
                dataSeries[name] = data;
                graphs[name] = thisGraph;
            };

            initGraph.apply(null, graphInitializer);

            scope.$on('addDetections', function (event, dataValues) {
                var data = dataSeries["Sonar"];
                var graph = graphs["Sonar"];

                // extract track names from detections
                var tracks = [labels[0]].concat(_.pluck(scope.series, 'trackId'));
                // replace default label names by track names
                labels = _.map(labels, function (label, index) {
                    return tracks[index] || label;
                });

                _.each(dataValues, function (values) {
                    data.push(values);
                });

                // calculate the 5 minute window
                var time = dataValues[0][0];
                var newStart = new Date(time - 10000 * 60);

                // get the chart to redraw
                graph.updateOptions({
                    labels: labels,
                    file: data,
                    colors: colors,
                    strokePattern: [0, 4],
                    showLabelsOnHighlight: false,
                    axes: {
                        x: {axisLabelColor: colors[0]},
                        y: {axisLabelColor: colors[0]}
                    },
                    pointSize: 4,
                    dateWindow: [newStart, new Date(time)]
                });
            });
        }
    };
}]);
