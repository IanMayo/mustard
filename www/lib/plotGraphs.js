(function(exports){

    function PlotGraphs(options) {

        var config = {
            sonarElement: null,
            graphs: [],
            colors : {
                indicator: "#aace00",
                heading: "#1A68DB"
            }
        };

        var config = _.extend(config, options);
        var seriesStack = [];

        var $sonarElement = null;
        var sonarGraphs = [];

        init();

        function init() {
            $sonarElement = $(config.sonarElement);

            _.map(config.graphs, function (graph) {
                graph.element = $(graph.element);
                graph.timeLatency = graph.duration * 60 * 1000; // milliseconds
            });

            fitGraphsHeight();
            $(window).on('resize', windowResizeHandler);
        }

        function fitGraphsHeight() {
            var height = $sonarElement.height();

            _.each(config.graphs, function (graph) {
                graph.element.height(Math.floor(graph.height * height));
            });
        }

        function graphDimension($element) {
            return {
                height: $element.height(),
                width: $element.width()
            };
        }

        function fixTime(detection) {
            var detection = _.extend({}, detection); // "copy" object
            var time = detection.date.getTime() - _.first(config.graphs).timeLatency;
            detection.date = new Date(time);
            return detection;
        }

        function addDetection(series) {
            var lastDetectionTime;

            _.each(sonarGraphs, function (sonar, index) {
                if (index > 0) {
                    if (lastDetectionTime > config.graphs[index - 1].timeLatency) {
                        sonar.addDetection(seriesStack.shift());
                    } else {
                        var detectionsForAxis = _.map(series, fixTime);
                        sonar.changeYAxisDomain(detectionsForAxis);
                    }
                } else {
                    sonar.addDetection(series);

                    seriesStack.push(series);
                    lastDetectionTime = series[0].date.getTime();
                }
            });
        }

         function addGraphs() {
             _.each(config.graphs, function (graph) {
                 var sonarConfig = {
                     containerElement: graph.element.get(-1),
                     yTicks: graph.yTicks,
                     yDomainDensity: graph.duration,
                     detectionPointRadii: graph.detectionPointRadii,
                     yAxisLabel: graph.yAxisLabel,
                     showXAxis: graph.showXAxis,
                     margin: graph.margin,
                     elementSize: graphDimension(graph.element),
                     detectionSelect: config.detectionSelect,
                     initialTime: config.initialTime
                 };

                 sonarGraphs.push(sonarGraph(sonarConfig));
             });
        }

        function windowResizeHandler() {
            fitGraphsHeight();

            _.each(sonarGraphs, function (sonar, index) {
                sonar.changeGraphHeight(graphDimension(config.graphs[index].element));
            });
        }

        function updatePlotTime(time) {
            _.each(sonarGraphs, function (sonar) {
                sonar.changeYAxisDomain(time);
            });
        }

        return {
            createPlot: addGraphs,
            addDetection: addDetection,
            updatePlotTime: updatePlotTime
        }
    }

    exports.PlotGraphs = PlotGraphs;

})(window);