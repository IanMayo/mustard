/**
 * @module Sonar Plot
 *
 * Creates plot with one (live) sonar sub plot
 * Or several sub plots (live sonar plus sonars with time offset to show historical detections)
 */

angular.module('subtrack90.game.sonarPlot', ['subtrack90.game.sonarSubPlot'])

/**
 * @module Sonar Plot
 * @class Service
 */

.service('sonarPlot', ['sonarSubPlot', function (sonarSubPlot) {
    var config = {
        sonarElement: null,
        subPlots: [],
        colors : {
            indicator: "#aace00",
            heading: "#1A68DB"
        }
    };

    var seriesStack = [];

    var $sonarElement = null;
    var subPlots;

    var dataSeriesCache = [];

    var prevIndexesRange = [0, 0];

    init();

    /**
     * Configure plot.
     *
     * @param {Object} options
     * @returns {Object} Service instance
     */
    this.setup = function (options) {
        config = _.extend(config, options);
        $sonarElement = $(config.sonarElement);
        subPlots = [];

        _.map(config.subPlots, function (subPlot) {
            subPlot.element = $(subPlot.element);
            subPlot.timeLatency = subPlot.duration * 60 * 1000; // milliseconds
        });

        fitSubPlotsHeight();

        return this;
    };

    /**
     * Create plot.
     *
     * @param {Object} options
     */
    this.createPlot = function () {
        _.each(config.subPlots, function (subPlot) {
            var sonarConfig = {
                containerElement: subPlot.element.get(-1),
                yTicks: subPlot.yTicks,
                yDomainDensity: subPlot.duration,
                yAxisLabel: subPlot.yAxisLabel,
                showXAxis: subPlot.showXAxis,
                margin: subPlot.margin,
                serialRenderingMode: !config.reviewMode,
                elementSize: subPlotDimension(subPlot.element),
                detectionSelect: config.detectionSelect,
                initialTime: config.initialTime
            };

            var subPlot = sonarSubPlot.build(sonarConfig);
            subPlots.push(subPlot);
        });
    };

    /**
     * Add detections to plot.
     *
     * @param {Object} series
     */
    this.addDetection = function (series) {
        var lastDetectionTime;

        _.each(subPlots, function (sonar, index) {
            if (index > 0) {
                if (lastDetectionTime > config.subPlots[index - 1].timeLatency) {
                    // a sub plot with historical data is ready to be rendered
                    sonar.addDetection(seriesStack.shift());
                } else {
                    // detection can't be rendered because its date is within live-time fragment
                    // just update time axis on the sub plot
                    var detectionsForAxis = _.map(series, fixTime);
                    sonar.changeYAxisDomain(detectionsForAxis);
                }
            } else {
                // add detection to the sub plot with live data
                sonar.addDetection(series);

                // add detection to the cached stack
                seriesStack.push(series);
                lastDetectionTime = series[0].date.getTime();
            }
        });
    };

    /**
     * Update current time in plot
     *
     * @param {Date} Time
     */
    this.updatePlotTime = function (time) {
        _.each(subPlots, function (subPlot) {
            subPlot.changeYAxisDomain(time);
        });
    };

    /**
     * Update plot.
     * Used in review mode.
     *
     * @param {Date} reviewTime
     * @param {Array} dataSeries
     */
    this.updateReviewPlot = function (reviewTime, dataSeries) {

        if (dataSeries) {
            dataSeriesCache = dataSeries;
        }

        _.each(subPlots, function (subPlot) {
            // Current indexes of tracks according to current time axis boundaries
            var currentIndexesRange = _.map(subPlot.timeAxisBoundaries(reviewTime), function (item) {
                    var time = item.getTime() / parseInt(config.trackTimeStep);
                    if (time > 0) {
                        return time;
                    }
                    return 0;
                });

                var newIndexesRange = rangeBoundaries(currentIndexesRange);
                var partialTrackSeries = Array.prototype.slice.apply(dataSeriesCache, newIndexesRange);


            _.each(partialTrackSeries, function (series) {
                if (series.detections.length) {
                    var detections = config.dataSeriesHandler(series);
                    subPlot.addDetection(detections);
                }
            });

            subPlot.changeYAxisDomain(reviewTime);
        });
    };

    /**
     * Remove Sonar Plot
     */
    this.remove = function () {
        $(window).off('resize.sonarPlot');
        _.each(subPlots, function (subPlot) {
            subPlot.remove();
        });
    };

    /**
     * Initialise service
     *
     */
    function init() {
        $(window).on('resize.sonarPlot', resizeWindowHandler);
    }

    /**
     * Set sub plot height in plot
     *
     */
    function fitSubPlotsHeight() {
        var height = $sonarElement.height();

        _.each(config.subPlots, function (subPlot) {
            subPlot.element.height(Math.floor(subPlot.height * height));
        });
    }

    /**
     * Get height and width of element
     *
     * @return {Object} element dimension
     */
    function subPlotDimension($element) {
        return {
            height: $element.height(),
            width: $element.width()
        };
    }

    /**
     * Change date in detection according to time latency of a previous sub plot
     *
     * @return {Object} detection
     */
    function fixTime(detection) {
        var detection = _.extend({}, detection); // "copy" object
        var time = detection.date.getTime() - _.first(config.subPlots).timeLatency;
        detection.date = new Date(time);
        return detection;
    }

    /**
     * Resize window handler.
     *
     */
    function resizeWindowHandler() {
        fitSubPlotsHeight();

        _.each(subPlots, function (subPlot, index) {
            subPlot.changeSubPlotHeight(subPlotDimension(config.subPlots[index].element));
        });
    }

    /**
     * Create boundaries for a new data series
     *
     * @param {Array} indexesRange
     * @returns {Array}
     */
    function rangeBoundaries(indexesRange) {
        var start = 0, end = 0;

        if (prevIndexesRange[0] > indexesRange[0] || prevIndexesRange[1] > indexesRange[1]) {
            // draw points in chronological order
            if (prevIndexesRange[0] > 0) {
                start = indexesRange[0];
                end = prevIndexesRange[0];
            }
        } else {
            // draw points in reverse order
            start = prevIndexesRange[1];
            end = indexesRange[1];
        }

        prevIndexesRange = indexesRange;

        return [start, end];
    }

}]);
