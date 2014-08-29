/**
 * @module Sonar Graph
 *
 * Factory class to create a single sonar graph
 */

angular.module('subtrack90.game.sonarGraph', [])

/**
 * @module Sonar Graph
 * @class Service
 * @description Sonar Graph. Depends on d3 lib (http://d3js.org/)
 */

.factory('sonarGraph', function () {

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
        var containerElementSize;


        var xAxisElement;
        var yAxisElement;

        var yAxisScale = d3.time.scale();
        var xComponent;

        var d3MapDetections = {};
        var renderedDetections = {};

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
            _.each(renderedDetections, function (detection, key) {
                var groupOffset = yAxisScale(detection.date);

                // move group container
                gMain.select('.' + key).
                    attr('transform', 'translate(0,' + yAxisScale(detection.date) + ')');

                // move detections points within group
                _.each(detection.data, function (element) {
                    element.pointElement.attr('y', - (groupOffset - yAxisScale(element.date - config.initialTime)));
                });
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
                .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');
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

            graph
                .append('defs')
                .append('ellipse')
                .attr('cx', 2.5)
                .attr('cy', 4)
                .attr('rx', config.detectionPointRadii.rx)
                .attr('ry', config.detectionPointRadii.ry)
                .attr('id', 'pathMarker_' + config.containerElement.id)
                .style({'fill': 'rgb(170, 206, 0)'});
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
         * Append datapoint element to group.
         *
         * @param {Object} group
         * @param {Object} detectionPoint
         * @param {String} name
         * @param {Number} offset
         * @returns {Object}
         */
        function appendDetectionPointToGroup(group, detectionPoint, name, offset) {
            return group
                .append('use')
                .attr("xlink:href", '#pathMarker_' + config.containerElement.id)
                .attr('x', xComponent(xTickFormat(detectionPoint[detectionKeys.x])))
                .attr('y', - (offset - yAxisScale(detectionPoint.date - config.initialTime)))
                .attr('class', name);
        }

        /**
         * Render added detections on graph.
         */
        function render() {
            _.each(d3MapDetections, function (detection, name) {
                if (!renderedDetections[name]) {
                    var groupOffset = yAxisScale(detection.date);
                    // new detection
                    var data = [];
                    // add group element
                    var group = gMain.append('g')
                        .attr('class', 'detectionPath ' + name)
                        .attr('detection-name', name);

                    // bind click handler
                    group.on('click', function () {
                        var detectionName = '';
                        if(event.target.getAttribute) {
                            // <g> element selected
                            detectionName = event.target.getAttribute('detection-name');
                        } else if (event.target.correspondingUseElement) {
                            // <use> element selected
                            detectionName = event.target.correspondingUseElement.getAttribute('class');
                        } else {
                            alert('Can\'t get class attribute of the target');
                        }
                        config.detectionSelect(detectionName);
                    });

                    // append new point element based on detection
                    detection.pointElement = appendDetectionPointToGroup(group, detection, name, groupOffset);
                    // there is no element, need to create it
                    data.push(detection);

                    // add detection data to rendered collection
                    renderedDetections[name] = {
                        data: data,
                        group: group,
                        date: detection.date,
                        isExpired: false
                    };

                } else {
                    // move group element
                    renderedDetections[name].group
                        .attr('transform', 'translate(0, ' + yAxisScale(renderedDetections[name].date) +')');

                    if (!renderedDetections[name].isExpired) {
                        // append new point element based on detection
                        var groupOffset = yAxisScale(renderedDetections[name].date);
                        detection.pointElement = appendDetectionPointToGroup(renderedDetections[name].group, detection, name, groupOffset);
                        // add detection to rendered collection
                        renderedDetections[name].data.push(detection);

                        if (config.serialRenderingMode && yAxisScale.domain()[0].getTime() >
                            (_.first(renderedDetections[name].data).date.getTime() + detectionExpireTime)) {
                            // datapoint became "invisible" - its time is less then time axis domain lower value

                            // remove datapoint from collection
                            var expiredDetection = renderedDetections[name].data.shift();
                            // remve datapoint element
                            expiredDetection.pointElement.remove();
                        }
                    }
                }
            });
        }

        function addGroupContainer() {
            gMain = graph.append("g")
                .attr('class', 'gMain')
                .attr('clip-path', 'url(#clipPath_'+config.containerElement.id+')');
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
                    var expiredDetection = renderedDetections[datapoint].data.shift();
                    // and remove it
                    expiredDetection.pointElement.remove();

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
            if (row.name === 'Time' || row.name === 'S1' || row.name === 'S2') {
                // skip useless paths
                return;
            }

            dataset[row.name] = {
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
            var time = simulationTime.getTime();

            yAxisScale.domain([time - config.yDomainDensity * 60 * 1000, time]);
            yAxisElement
                .call(yAxisScale.axis);

            _.each(renderedDetections, function (detection, key) {
                // move group container
                gMain.select('.' + key).
                    attr('transform', 'translate(0,' + yAxisScale(detection.date) + ')');
            });

            if (!config.serialRenderingMode) {
                removeAllExpiredDetections();
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
                            var expiredDetection = renderedDetections[name].data.splice(index, 1).pop();
                            expiredDetection.pointElement.remove();

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
                // remove group wrapper element
                $('#' + config.containerElement.id + ' .' + name).remove();
            }
        }

        /**
         * Add new detections to graph.
         *
         * @param {Object} detections
         */
         function addDetection(detections){
//            console.log('detections', detections);
            // create list of path names from detections
            _.each(detections, function (detection) {
                // exclude a detection path name from the list
                addDatapoint(d3MapDetections, detection);
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
                detection.group.on('click', null);
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
});
