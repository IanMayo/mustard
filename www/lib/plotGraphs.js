(function(exports){

    function PlotGraphs(options) {

        var config = {
            sonarElement: null,
            reviewGraphElement: null,
            liveGraphElement: null,
            liveGraphTimeLength : 1 * 60 * 1000, // 1 minute in milliseconds
            colors : {
                indicator: "#aace00",
                heading: "#1A68DB"
            }
        };

        var config = _.extend(config, options);
        var seriesStack = [];
        var liveGraph,
            reviewGraph;

        var $sonarElement = null;
        var $liveGraphElement = null;
        var $reviewGraphElement = null;

        init();

        function init() {
            $sonarElement = $(config.sonarElement);
            $liveGraphElement = $(config.liveGraphElement);
            $reviewGraphElement = $(config.reviewGraphElement);

            fitGraphsHeight();
            $(window).on('resize', windowResizeHandler);
        }

        function fitGraphsHeight() {
            var height = $sonarElement.height();
            var liveGraphHeight = Math.floor(height * 0.25);
            var reviewGraphHeight = Math.floor(height * 0.75);

            $liveGraphElement.height(liveGraphHeight);
            $reviewGraphElement.height(reviewGraphHeight);
        }

        function graphDimension($element) {
            return {
                height: $element.height(),
                width: $element.width()
            };
        }

        function fixTime(detection) {
            var detection = _.extend({}, detection); // "copy" object
            var time = detection.date.getTime() - config.liveGraphTimeLength;
            detection.date = new Date(time);
            return detection;
        }

        function addDetection(series) {
            var lastDetectionTime;

            liveGraph.addDetection(series);

            seriesStack.push(series);
            lastDetectionTime = series[0].date.getTime();

            if (lastDetectionTime > config.liveGraphTimeLength) {
                reviewGraph.addDetection(seriesStack.shift());
            } else {
                var detectionsForAxis = _.map(series, fixTime);
                reviewGraph.changeYAxisDomain(detectionsForAxis);
            }
        }

         function addGraphs() {
            liveGraph = sonarGraph({
                containerElement: config.liveGraphElement,
                yTicks: 5,
                yDomainDensity: 1,
                detectionPointRadii: {rx: 2.33, ry: 4.29},
                yAxisLabel: '',
                elementSize: graphDimension($liveGraphElement)
            });

            reviewGraph = sonarGraph({
                containerElement: config.reviewGraphElement,
                yTicks: 12,
                yDomainDensity: 16,
                detectionPointRadii: {rx: 2, ry: 1},
                yAxisLabel: '',
                showXAxis: false,
                margin: {top: 0, left: 100, bottom: 10, right: 50},
                elementSize: graphDimension($reviewGraphElement)
            });
        }

        function windowResizeHandler() {
            fitGraphsHeight();
            liveGraph.changeGraphHeight(graphDimension($liveGraphElement));
            reviewGraph.changeGraphHeight(graphDimension($reviewGraphElement));
        }

        return {
            createPlot: addGraphs,
            addDetection: addDetection
        }
    }

    exports.PlotGraphs = PlotGraphs;

})(window);