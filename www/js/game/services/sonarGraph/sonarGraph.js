/**
 * @module Sonar Graph
 *
 * Factory class to create a single sonar graph.
 */

angular.module('subtrack90.game.sonarGraph', ['subtrack90.game.svgFilter'])

/**
 * @module Sonar Graph
 * @class Service
 * @description Sonar Graph. Depends on d3 lib (http://d3js.org/)
 */

.factory('sonarGraph', ['svgFilterConfig', 'IS_MOBILE', function (svgFilterConfig, IS_MOBILE) {

    /**
     * SvgView class.
     * @param {Object} options
     * @returns {Object}
     */
    function SvgView(options) {
        var xDomain = [-180, 180];
        var xTickValues = _.range(-180, 181, 45);
        var xTickFormat = function (d) { return d; };

        var yAxisFormat = d3.time.format("%H:%M:%S");
        var xAxisLabel = "Degree º";

        var svgContainer;
        var graph;
        var gMain;
        var gTrack;
        var containerElementSize;
        var xComponent;
        var mainClipPath;

        var xAxisElement;
        var yAxisElement;
        var yAxisScale = d3.time.scale();

        var config = {
            containerElement: null,
            yTicks: 5,
            yDomainDensity: 1,
            yAxisLabel: "Time",
            showXAxis: true,
            margin: {top: 25, left: 100, bottom: 5, right: 50},
            detectionSelect: function () {}
        };

        init();

        function init() {
            _.each(options, function (value, key) {
                if (value !== undefined) {
                    config[key] = value;
                }
            });

            addSvgElement();
            elementSize(config.elementSize);
            configureScale();

            addClipPath();
            addGxAxis();
            addGyAxis();
            addGroupContainer();
        }

        /**
         * Add svg element and apply margin values.
         */
        function addSvgElement() {
            svgContainer = d3.select(config.containerElement)
                .append('svg')
                .attr('class', 'graph g-wrapper');

            // https://bugzilla.mozilla.org/show_bug.cgi?id=779368
            // http://thatemil.com/blog/2014/04/06/intrinsic-sizing-of-svg-in-responsive-web-design/
            svgContainer.style({width: '100%', height: '100%'});

            graph = svgContainer
                .append('g')
                .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');

            if (!IS_MOBILE) {
                graph.attr('filter', 'url(#' + svgFilterConfig.blurFilterName + ')');
            }
        }

        /**
         * Create group element with clip path attribute.
         * Create group element what contains line paths
         */
        function addGroupContainer() {
            gMain = graph.append("g")
                .attr({
                    'class': 'gMain',
                    'clip-path': 'url(#clipPath_' + config.containerElement.id + ')'
                });

            gTrack = gMain.append('g');
        }

        /**
         * Add clip path for sonar graph.
         */
        function addClipPath() {
            mainClipPath = graph
                .append('defs')
                .append('clipPath')
                .attr('id', 'clipPath_' + config.containerElement.id)
                .append('rect')
                .attr({
                    'height': containerElementSize.height,
                    'width': containerElementSize.width
                });
        }

        /**
         * Highlight line path.
         *
         * @param {Object} element Target line path
         */
        function highlightLinePath(detectionName) {
            gMain.selectAll('.detectionPath').call(removeHighlightSelection);
            gTrack.selectAll('.' + detectionName).classed('selected', true);
        }

        /**
         * Remove highlighting from line paths
         *
         * @param {Array} selection Line paths collection
         */
        function removeHighlightSelection(selection) {
            _.each(selection[0] ,function (path) {
                d3.select(path).classed('selected', false);
            });
        }

        /**
         * Update dimensions of the clip path
         */
        function updateClipPathDimensions() {
            graph
                .select('#clipPath_' + config.containerElement.id + ' rect')
                .attr({
                    'height': containerElementSize.height,
                    'width': containerElementSize.width
                });
        }

        /**
         * Calculate sonar size without margin values.
         */
        function elementSize(dimension) {
            containerElementSize = {
                width: dimension.width - (config.margin.left + config.margin.right),
                height: dimension.height - (config.margin.top + config.margin.bottom)
            };
        }

        /**
         *
         */
        function updateLabelPosition() {
            yAxisElement
                .select('.axis-unit')
                .attr('transform', 'translate(0,' + containerElementSize.height + ') rotate(-90)');
        }

        /**
         * Add X axis to the graph
         */
        function addGxAxis() {
            // d3 axis component
            xComponent.axis = d3.svg.axis()
                .scale(xComponent)
                .tickValues(xTickValues)
                .tickFormat(xTickFormat)
                .orient("top");

            // add axis element and apply axis component
            xAxisElement = graph.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, 0)')
                .style('opacity', config.showXAxis ? 1 : 0)
                .call(xComponent.axis);

            // axis label
            xAxisElement.append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(' + containerElementSize.width + ',0)')
                .attr('y', 0)
                .attr('dy', '1.71em')
                .style('text-anchor', 'end')
                .text(xAxisLabel);
        }

        /**
         * Add Y axis to the graph
         */
        function addGyAxis() {
            // d3 axis component
            yAxisScale.axis = d3.svg.axis()
                .scale(yAxisScale)
                .ticks(config.yTicks)
                .tickFormat(function (d) {
                    return yAxisFormat(d);
                })
                .orient('left');

            // add axis element and apply axis component
            yAxisElement = graph.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(0,0)')
                .call(yAxisScale.axis);

            // axis label
            yAxisElement
                .append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(0,' + containerElementSize.height + ') rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .attr('dx', '2.71em')
                .style('text-anchor', 'end')
                .text(config.yAxisLabel);
        }

        /**
         * Configure d3 lib scale for axes
         */
        function configureScale() {
            xComponent = d3.scale.linear()
                .domain(xDomain)
                .range([0, containerElementSize.width]);

            yAxisScale.range([containerElementSize.height, 0]);
        }

        /**
         * Selected line path handler.
         */
        function selectLinePath() {
            var target = event.target;
            var detectionName;

            detectionName = target.getAttribute('detection-name');
            config.detectionSelect(detectionName);
            highlightLinePath(detectionName);
        }

        /**
         * Create Line path.
         *
         * @param {String} pathName
         * @returns {Object} Line path
         */
        function linePath(pathName, opacity) {
            var lineDatum = [{x: null, y: 0}];
            var linePath = gTrack
                .append('path')
                .datum(lineDatum)
                .attr('d', lineGenerator())
                .attr('class', 'line detectionPath ' + pathName)
                .attr('detection-name', pathName)
                .attr('stroke-linecap', "round")
                .attr('stroke-linejoin', "round")
                .attr('stroke-opacity', opacity)
                .attr('stroke-dasharray', '0.3')
                .attr('stroke-linecap', 'butt');

            var existed = gTrack.selectAll('.selected.' + pathName);
            if (existed.size()) {
                linePath.classed('selected', true);
            }

            // bind click delegate handler
            linePath.on('click', selectLinePath);

            return linePath;
        }

        /**
         * Line path generator function.
         *
         * @returns {Object} Line generator
         */
        function lineGenerator() {
            var generator = d3.svg.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .defined(function (d) { return d.x != null; });
            return generator;
        }

        /**
         * Remove svg element from DOM.
         */
        this.removeContainer = function () {
            svgContainer.remove()
        };

        /**
         * Update Y domain.
         *
         * @param {Integer} time
         */
        this.updateVisibleDomain = function (time) {
            yAxisScale.domain([time - config.yDomainDensity * 60 * 1000, time]);
            yAxisElement
                .call(yAxisScale.axis);
        };

        /**
         * Change vertical offset of line paths group
         * @param timeOffset
         */
        this.changeTracksOffset = function (timeOffset) {
            gTrack
                .attr('transform', 'translate(0,' + yAxisScale(timeOffset) + ')');
        };

        /**
         * Change height of svg view.
         *
         * @param {Object} dimension Height and width new values
         */
        this.changeGraphHeight = function (dimension) {
            elementSize(dimension);
            yAxisScale.range([containerElementSize.height, 0]);
            updateClipPathDimensions();
            updateLabelPosition();
        };

        /**
         * Create a new line path.
         *
         * @param {String} pathName
         * @returns {Object} line path properties
         */
        this.createLinePath = function (pathName, opacity) {
            return {
                generator: lineGenerator(),
                path: linePath(pathName, opacity),
                datum: [{x: null, y: 0}]
            }
        };

        this.visibleDomain = function (time) {
            if (time) {
                this.updateVisibleDomain(time.getTime());
            }
            return yAxisScale.domain();
        };

        /**
         * Convert date value to scalable Y coordinate.
         *
         * @param {Date} date
         * @returns {Integer}
         */
        this.yCoordinate = function (date) {
            return yAxisScale(date);
        };

        /**
         * Convert degree value to scalable X coordinate.
         *
         * @param nextPointDegree
         * @returns {Integer}
         */
        this.xCoordinate = function (nextPointDegree) {
            return xComponent(xTickFormat(nextPointDegree));
        };
    }

    /**
     * Graph class.
     * @param {Object} options
     * @returns {Object}
     */
    function Graph(options) {
        var detectionExpireTime =  1 * 60 * 1000; // 1 minute
        var pointsTimeGap = 2000;
        var processedDetections = {};
        var renderedDetections = {};
        var svgView;

        var config = {
            serialRenderingMode: false
        };

        init(options);

        function init(options) {
            _.each(options, function (value, key) {
                if (value !== undefined) {
                    config[key] = value;
                }
            });

            svgView = new SvgView(options);
        }

        /**
         * Change detections positions according to settings of axis.
         */
        function changeDetectionsPosition() {
            var groupOffset = yAxisOriginCoordinate();
            _.each(renderedDetections, function (detection) {
                updateLinePath(detection, groupOffset);
            });
        }

        /**
         * Render added detections on graph.
         */
        function render() {
            _.each(processedDetections, function (detectionPoint, pathName) {
                var detectionPath = renderedDetections[pathName];
                if (!detectionPath) {
                    createLinePath(detectionPoint, pathName);
                } else {
                    addPointToLinePath(detectionPoint, detectionPath);
                }
            });
        }

        function createLinePath(detection, name) {
            var data = [];
            var linePath = svgView.createLinePath(detection.trackName,  detection.strength / 10);

            // there is no element, need to create it
            data.push(detection);

            // add detection data to rendered collection
            renderedDetections[name] = {
                lineDatum: linePath.datum,
                lineGenerator: linePath.generator,
                linePath: linePath.path,
                data: data,
                date: detection.date,
                isExpired: false
            };
        }

        function addPointToLinePath(detection, detectionPath) {
            var nextPoint = detection;
            var lastPoint = _.last(detectionPath.data);

            if (!detectionPath.isExpired) {
                var groupOffset = yAxisOriginCoordinate();

                detectionPath.lineDatum.push({
                    x: xCoordinate(nextPoint, lastPoint),
                    y: -(groupOffset - svgView.yCoordinate(detection.date))
                });

                // add detection to rendered collection
                detectionPath.data.push(detection);

                if (config.serialRenderingMode) {
                    detectionPath.linePath.attr('d', detectionPath.lineGenerator(detectionPath.lineDatum));

                    if (svgView.visibleDomain()[0].getTime() >
                        (_.first(detectionPath.data).date.getTime() + detectionExpireTime)) {
                        // datapoint became "invisible" - its time is less then time axis domain lower value

                        // remove datapoint from collection
                        detectionPath.data.shift();
                        detectionPath.lineDatum.shift();
                    }
                }
            }
        }

        /**
         * Find expired detections by comparing new detections list and existed.
         *
         * @param {Object} detections
         */
        function findExpiredDetections(detections) {
            var existedDetections = _.keys(renderedDetections);
            var newDetections = _.pluck(detections, 'groupId');
            var expiredDetections = [];

            _.each(existedDetections, function (detection) {
                if (!_.contains(newDetections, detection)) {
                    // a detection series disappeared
                    expiredDetections.push(detection);
                    renderedDetections[detection].isExpired = true;
                } else {
                    // a detection series appeared again
                    renderedDetections[detection].isExpired = false;
                }
            });

            if (expiredDetections.length) {
                // expired series exist - analise them
                removeExpiredDetection(expiredDetections);
            }
        }

        /**
         * Remove expired (out of clip path) element from DOM and datapoint respectively.
         *
         * @param {Object} dataset
         * @param {Object} datapoints
         */
        function removeExpiredDetection(datapoints) {
            _.each(datapoints, function (datapoint) {

                if (svgView.visibleDomain()[0].getTime() >
                    (_.first(renderedDetections[datapoint].data).date.getTime() + detectionExpireTime)) {
                    // datapoint became "invisible" (outdated) - its time is less then time axis domain lower value

                    // remove outdated point (the first)
                    renderedDetections[datapoint].data.shift();
                    renderedDetections[datapoint].lineDatum.shift();

                    removeExpiredDatapointGroup(datapoint);
                }
            });
        }

        /**
         * Add datapoint to the dataset.
         *
         * @param {Object} dataset
         * @param {Object} row
         */
        function addDatapoint(dataset, row) {
            dataset[row.groupId] = {
                trackName: row.trackName,
                date: row.date,
                degree: row.degree,
                strength: row.strength
            };
        }

        /**
         * Reconfigure Y-axis domain.
         *
         * @param {Date} simulationTime
         */
        function changeYAxisDomain(simulationTime) {
            svgView.updateVisibleDomain(simulationTime.getTime());
            svgView.changeTracksOffset(config.initialTime);

            if (!config.serialRenderingMode) {
                removeAllExpiredDetections();
            }
        }
        /**
         * Remove all expired detections.
         * Used in review mode
         */
        function removeAllExpiredDetections() {
            var timeAxisUpperBound = svgView.visibleDomain()[1].getTime();
            var timeAxisLowerBound = svgView.visibleDomain()[0].getTime();
            var groupOffset = yAxisOriginCoordinate();
            var testPointDate;
            
            _.each(renderedDetections, function (detection, groupId) {

                if (detection.data.length) {
                    _.each(detection.data, function (item, index) {
                        testPointDate = item.date.getTime();
                        if (testPointDate >= timeAxisUpperBound || testPointDate <= timeAxisLowerBound) {
                            detection.data.splice(index, 1);
                            detection.lineDatum.splice(index, 1);
                        }
                    });

                    removeExpiredDatapointGroup(groupId);

                    if (detection) {
                        detection.data = _.sortBy(detection.data, function (d) {return d.date.getTime()});
                        updateLinePath(detection, groupOffset);
                    }
                }
            });
        }

        function updateLinePath(detection, offset) {
            var lineDatum = [];
            var nextPoint;
            var lastPoint;

            _.each(detection.data, function (data) {
                nextPoint = data;
                lineDatum.push({
                    x: xCoordinate(nextPoint, lastPoint),
                    y: - (offset - svgView.yCoordinate(data.date))
                });

                lastPoint = nextPoint;
            });

            detection.lineDatum = lineDatum;
            detection.linePath.attr('d', detection.lineGenerator(lineDatum));
            lineDatum = [];
        }

        /**
         * Determine x-coordinate of a next point.
         * null value assumes that line path "changes side of the sonar" form let
         *
         * @param {Object} nextPoint
         * @param {Object} lastPoint
         * @returns {null|Integer} x-coordinate of a next point
         */
        function xCoordinate(nextPoint, lastPoint) {
            var lastPointDegree;
            var lastPointTime;
            var sortedPoints;
            var changeSign;

            if (lastPoint) {
                lastPointDegree = lastPoint.degree;
                lastPointTime = lastPoint.date.getTime();
            } else {
                lastPointDegree = lastPointTime = undefined;
            }

            sortedPoints = _.sortBy([nextPoint.degree, lastPointDegree], function (num) {return num});
            changeSign = Math.abs(sortedPoints[0] - sortedPoints[1]) > 350;

            if (changeSign || ((nextPoint.date.getTime() - lastPointTime) > pointsTimeGap)) {
                return null;
            }

            return svgView.xCoordinate(nextPoint.degree);
        }

        /**
         * Returns Y-coordinate depend on Y-axis domain
         *
         * @returns {Integer}
         */
        function yAxisOriginCoordinate() {
            return svgView.yCoordinate(config.initialTime);
        }

        /**
         * Remove group wrapper element of detections.
         *
         * @param {String} groupId
         */
        function removeExpiredDatapointGroup(groupId) {
            if (!renderedDetections[groupId].data.length) {
                // if collection is empty
                // remove a path element from DOM
                renderedDetections[groupId].linePath.remove();
                // remove empty collection
                delete renderedDetections[groupId];
                // remove detection collection respectively
                delete processedDetections[groupId];
            }
        }

        /**
         * Add new detections to graph.
         *
         * @param {Object} detections
         */
         function addDetection(detections) {
            // create list of path names from detections
            _.map(detections, function (item) {
                // use normalized id to work with collection correctly
                // replace spaces
                item.groupId = item.trackName.replace(/\W/, '_') + ':' + item.strength;
                addDatapoint(processedDetections, item);
            });

            findExpiredDetections(detections);
            render();
        }

        /**
         * Update graph height value and reconfigure Y-axis with a new range.
         *
         * @param {Object} dimension
         */
        function changeGraphHeight(dimension) {
            svgView.changeGraphHeight(dimension);
            svgView.changeTracksOffset(config.initialTime);
            changeDetectionsPosition();
        }

        /**
         * Return current boundaries of Y axis.
         *
         * @returns {Array}
         */
        function visibleDomain(time) {
            return svgView.visibleDomain(time);
        }

        /**
         * Remove graph from DOM and remove handlers
         */
        function remove () {
            _.each(renderedDetections, function (detection) {
                detection.linePath.on('click', null);
            });
            svgView.removeContainer();
        }

        return {
            changeYAxisDomain: changeYAxisDomain,
            addDetection: addDetection,
            changeGraphHeight: changeGraphHeight,
            timeAxisBoundaries: visibleDomain,
            remove: remove
        }
    }

    /**
     * Create an instance of the Graph class.
     *
     * @param {Object} config
     * @returns {Object} Graph class instance
     */
    Graph.build = function (config) {
        return new Graph(config);
    };

    return Graph;
}]);
