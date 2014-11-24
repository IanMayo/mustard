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

.factory('sonarGraph', ['svgFilterConfig', function (svgFilterConfig) {

    /**
     * Graph class.
     * @param {Object} options
     * @returns {Object}
     */
    function Graph(options) {

        var xDomain = [-180, 180];
        var xTickValues = _.range(-180, 181, 45);
        var xTickFormat = function (d) { return d; };

        var detectionKeys = {x: 'degree', y: 'date'};
        var yAxisFormat = d3.time.format("%H:%M:%S");
        var xAxisLabel = "Degree º";

        var detectionExpireTime =  1 * 60 * 1000; // 1 minute

        var svgContainer;
        var graph;
        var mainClipPath;
        var gMain;
        var gTrack;
        var containerElementSize;


        var xAxisElement;
        var yAxisElement;

        var yAxisScale = d3.time.scale();
        var xComponent;

        var d3MapDetections = {};
        var renderedDetections = {};

        var rS = new rStats({
            values: {
                frame: { caption: 'Total frame time (ms)', below: 2 },
                raf: { caption: 'Time since last rAF (ms)' },
                fps: { caption: 'Framerate (FPS)', below: 1.5 },
                action1: { caption: 'Render action #1 (ms)' },
                render: { caption: 'WebGL Render (ms)' }
            }
        } );

        var requestSimulationTime;
        var _simulationTime;

        var config = {
            containerElement: null,
            yTicks: 5,
            yDomainDensity: 1,
            detectionPointRadii: {rx: 0, ry: 0},
            yAxisLabel: "Time",
            showXAxis: true,
            margin: {top: 25, left: 100, bottom: 5, right: 50},
            detectionSelect: function () {},
            initialTime: new Date(),
            serialRenderingMode: false
        };

        init(options);

        function init(options) {
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
         * Change detections positions according to settings of axis.
         *
         */
        function changeDetectionsPosition() {
            _.each(renderedDetections, function (detection, name) {
                var groupOffset = yAxisScale(renderedDetections['Ownship'].date);
                // move group container
                gTrack
                    .attr('transform', 'translate(0,' + yAxisScale(detection.date) + ')');

                // move detections points within group
                var lineData = [];

                _.each(detection.data, function (data) {
                    lineData.push({
                        x: xComponent(xTickFormat(data[detectionKeys.x])),
                        y: - (groupOffset - yAxisScale(data.date))
                    });
                });

                renderedDetections[name].lineDatum = lineData;
                renderedDetections[name].linePath.attr('d', renderedDetections[name].lineGenerator(lineData));
            });
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
                .attr({
                    'transform': 'translate(' + config.margin.left + ',' + config.margin.top + ')',
                    'filter': 'url(#' + svgFilterConfig.blurFilterName + ')'
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
         * Configure d3 lib scale for axes
         */
        function configureScale() {
            xComponent = d3.scale.linear()
                .domain(xDomain)
                .range([0, containerElementSize.width]);

            yAxisScale.range([containerElementSize.height, 0]);
        }

        /**
         * Add clip path for sonar graph and reusable detection point.
         */
        function addClipPath() {

            mainClipPath = graph
                .append('defs')
                .append('clipPath')
                .attr('id', 'clipPath_' + config.containerElement.id)
                .append('rect')
                .attr('width', containerElementSize.width)
                .attr('height', containerElementSize.height);
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
         * Render added detections on graph.
         */
        function render() {
            _.each(d3MapDetections, function (detection, name) {
                if (!renderedDetections[name]) {
                    // new detection
                    var data = [];
                    var generator = d3.svg.line()
                        .x(function(d) { return d.x})
                        .y(function(d) { return d.y})
                        .defined(function(d) { return d.y != null;});

                    var lineDatum = [];
                    var linePath = gTrack
                        .append('path')
                        .datum(lineDatum)
                        .attr('d', generator)
                        .attr('class', 'line detectionPath ' + name)
                        .attr('detection-name', detection.trackName)
                        .attr('stroke-linecap', "round")
                        .attr('stroke-linejoin', "round");

                    // bind click delegate handler
                    linePath.on('click', selectedDetectionHandler);

                    // there is no element, need to create it
                    data.push(detection);

                    // add detection data to rendered collection
                    renderedDetections[name] = {
                        lineDatum: lineDatum,
                        lineGenerator: generator,
                        linePath: linePath,
                        data: data,
                        date: detection.date,
                        isExpired: false
                    };

                } else {
                    var nextPointDegree = detection.degree;
                    var lastPointDegree = renderedDetections[name] && _.last(renderedDetections[name].data).degree;
                    var sortedPoints = _.sortBy([nextPointDegree, lastPointDegree], function (num) {return num});
                    var changeSign = Math.abs(sortedPoints[0] - sortedPoints[1]) > 350;

                    if (!renderedDetections[name].isExpired) {
                        var groupOffset = yAxisScale(renderedDetections['Ownship'].date);

                        renderedDetections[name].lineDatum.push({
                            x: xComponent(xTickFormat(detection[detectionKeys.x])),
                            y: changeSign ? null : - (groupOffset - yAxisScale(detection.date))
                        });

                        renderedDetections[name].linePath.attr('d',
                            renderedDetections[name].lineGenerator(renderedDetections[name].lineDatum));

                        // add detection to rendered collection
                        renderedDetections[name].data.push(detection);

                        if (config.serialRenderingMode && yAxisScale.domain()[0].getTime() >
                            (_.first(renderedDetections[name].data).date.getTime() + detectionExpireTime)) {
                            // datapoint became "invisible" - its time is less then time axis domain lower value

                            // remove datapoint from collection
                            renderedDetections[name].data.shift();
                            renderedDetections[name].lineDatum.shift();
                        }
                    }
                }
            });
        }

        function addGroupContainer() {
            gMain = graph.append("g")
                .attr('class', 'gMain')
                .attr('clip-path', 'url(#clipPath_'+config.containerElement.id+')');

            gTrack = gMain.append('g');
        }

        /**
         * Find expired detections by comparing new detections list and existed.
         *
         * @param {Object} detections
         */
        function findExpiredDetections(detections) {
            var existedDetections = _.keys(renderedDetections);
            var newDetections = _.pluck(detections, 'name');
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

                if (yAxisScale.domain()[0].getTime() >
                    (_.first(renderedDetections[datapoint].data).date.getTime() + detectionExpireTime)) {
                    // datapoint became "invisible" - its time is less then time axis domain lower value

                    // extract first datapoint
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
            dataset[row.name] = {
                trackName: row.trackName,
                date: row.date,
                degree: row.degree,
                strength: row.strength ? row.strength : null
            };
        }

        function updateClipPathHeight() {
            graph
                .select('#clipPath_' + config.containerElement.id + ' rect')
                .attr('width', containerElementSize.width)
                .attr('height', containerElementSize.height);
        }

        function updateLabelPosition() {
            yAxisElement
                .select('.axis-unit')
                .attr('transform', 'translate(0,' + containerElementSize.height + ') rotate(-90)');
        }

        /**
         * Reconfigure Y-axis domain.
         *
         * @param {Date} simulationTime
         */
        function changeYAxisDomain(simulationTime) {
            _simulationTime = simulationTime;
            var time;

            function animationFrame() {
                rS( 'frame' ).start();
                rS( 'rAF' ).tick();
                rS( 'FPS' ).frame();
                rS( 'render' ).start();

                time = getSimulationTime();
                if (time !== requestSimulationTime) {

                    requestSimulationTime = time;

                    yAxisScale.domain([time - config.yDomainDensity * 60 * 1000, time]);
                    yAxisElement
                        .call(yAxisScale.axis);

                    if (renderedDetections.Ownship) {
                        gTrack
                            .attr('transform', 'translate(0,' + yAxisScale(renderedDetections.Ownship.date) + ')');
                    }

                    if (!config.serialRenderingMode) {
                        removeAllExpiredDetections();
                    }
                }

                rS( 'render' ).end();
                rS( 'frame' ).end();
                rS().update();

                requestAnimationFrame(animationFrame);
            }

            function getSimulationTime() {
                return _simulationTime.getTime();
            }

            if (!requestSimulationTime) {
                requestAnimationFrame(animationFrame);
            }
        }

        /**
         * Remove all expired detections.
         * Used in review mode
         */
        function removeAllExpiredDetections() {
            _.each(d3MapDetections, function (detection, name) {
                if (renderedDetections[name].data.length) {
                    _.each(renderedDetections[name].data, function (item, index) {
                        if (item.date.getTime() >= yAxisScale.domain()[1].getTime() ||
                            item.date.getTime() <= yAxisScale.domain()[0].getTime()) {
                            renderedDetections[name].data.splice(index, 1).pop();
                            removeExpiredDatapointGroup(name);
                        }
                    });
                }
            });
        }

        /**
         * Remove group wrapper element of detections.
         *
         * @param {String} name
         */
        function removeExpiredDatapointGroup (name) {
            if (!renderedDetections[name].data.length) {
                // if collection is empty
                // remove empty collection
                delete renderedDetections[name];
                // remove detection collection respectively
                delete d3MapDetections[name];
            }
        }

        /**
         * Add new detections to graph.
         *
         * @param {Object} detections
         */
         function addDetection(detections){
            // create list of path names from detections
            _.map(detections, function (item) {
                // use normalized name to work with collection correctly
                // replace spaces
                item.name = item.trackName.replace(/\W/, '_');
                addDatapoint(d3MapDetections, item);
            });

            //findExpiredDetections(detections);

            render();
        }

        function selectedDetectionHandler () {
            var target = event.target;
            var detectionName;

            detectionName = target.getAttribute('detection-name');
            config.detectionSelect(detectionName);
            highlightGroup(target);
        }

        function highlightGroup(element) {
            gMain.selectAll('.detectionPath').call(removeHighlightSelection);
            d3.select(element).classed('selected', true);
        }

        function removeHighlightSelection(selection) {
            _.each(selection[0] ,function (path) {
                d3.select(path).classed('selected', false);
            });
        }

        /**
         * Update graph height value and reconfigure Y-axis with a new range.
         *
         * @param {Object} dimension
         */
        function changeGraphHeight(dimension) {
            elementSize(dimension);
            yAxisScale.range([containerElementSize.height, 0]);
            updateClipPathHeight();
            changeDetectionsPosition();
            updateLabelPosition();
        }

        /**
         * Return current boundaries of Y axis.
         *
         * @returns {Array}
         */
        function visibleDomain() {
            return yAxisScale.domain();
        }

        /**
         * Remove graph from DOM and remove handlers
         */
        function remove () {
            _.each(renderedDetections, function (detection) {
                detection.linePath.on('click', null);
            });
            svgContainer.remove();
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
