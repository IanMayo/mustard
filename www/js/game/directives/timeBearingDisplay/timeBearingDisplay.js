angular.module('mustard.game.timeBearingDisplayDirective', ['mustard.game.spatialViewDirective'])

.directive('timeBearingDisplay', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            series: '='
        },
        templateUrl: 'js/game/directives/timeBearingDisplay/timeBearingDisplay.tpl.html',
        link: function (scope) {
            var graphInitializer = [
                'Sonar',
                [new Date(0)],
                ['Time'],
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
                var tracks = _.pluck(scope.series, 'trackId');

                // add options for new sonar tracks
                if (tracks.length !== graph.getLabels().length) {
                    _.each(tracks, function (name) {
                        graphInitializer[1].push(0);
                        graphInitializer[2].push(name);
                    });
                }

                data.push(dataValues);
                // calculate the 5 minute window
                var time = dataValues[0];
                var newStart = new Date(time - 10000 * 60);

                // get the chart to redraw
                graph.updateOptions({
                    'colors': ["#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0"],
                    'strokePattern': [0, 4], showLabelsOnHighlight: false,
                    axes: {
                        x: {axisLabelColor: "#0f0"},
                        y: {axisLabelColor: "#0f0"}
                    },
                    'pointSize': 4, 'file': data,
                    dateWindow: [newStart, new Date(time)] });
            });
        }
    };
}]);