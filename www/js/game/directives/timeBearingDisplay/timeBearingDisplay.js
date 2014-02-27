angular.module('mustard.game.timeBearingDisplayDirective', [])

.directive('timeBearingDisplay', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/game/directives/timeBearingDisplay/timeBearingDisplay.tpl.html',
        link: function (scope) {
            var graphInitializer = [
                'Sonar',
                [new Date(0), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                ['Time', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13'],
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
                data.push(dataValues);
                // calculate the 5 minute window
                var time = dataValues[0];
                var newStart = new Date(time - 10000 * 60);

                // get the chart to redraw
                graph.updateOptions({
                    'colors': ["#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0", "#0f0"],
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
});