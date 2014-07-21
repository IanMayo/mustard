(function (exports) {

    var sonarGraph = function (options) {

        var xDomain = [0, 360];
        var xTickValues = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        var xTickFormat = function (d) {return (d <= 180) ? ((d + 180) === 360 ? 0: (d + 180)) : d - 180};
        var xTickFormatInverse = function (d) {return (d <= 180) ? d + 180 : d - 180;};

        var d3MapDetections = {};
        var detectionKeys = {x: 'degree', y: 'date'};
        var renderedDetections = {};
        var graph;
        var mainClipPath;
        var gMain;
        var containerElementSize;

        var yAxisFormat = d3.time.format("%H:%M:%S");
        var xAxisLabel = "Degree º";

        var xAxisElement;
        var yAxisElement;

        var yAxisScale = d3.time.scale();
        var xComponent;

        var initialTime;

        var config = {
            containerElement: null,
            yTicks: 5,
            yDomainDensity: 1,
            detectionPointRadii: {rx: 0, ry: 0},
            yAxisLabel: "Time",
            showXAxis: true,
            margin: {top: 25, left: 100, bottom: 5, right: 50},
            detectionSelect: function () {}
        };

        init();

        function init() {
            config = _.extend(config, options);
            addSvgElement();
            elementSize(config.elementSize);
            configureScale();

            addClipPath();
            addGxAxis();
            addGyAxis();
            addGroupContainer();
        }

        function addSvgElement() {
            var svg = d3.select(config.containerElement)
                .append('svg')
                .attr('class', 'graph g-wrapper');

            // https://bugzilla.mozilla.org/show_bug.cgi?id=779368
            // http://thatemil.com/blog/2014/04/06/intrinsic-sizing-of-svg-in-responsive-web-design/
            svg.style({width: '100%', height: '100%'});

            graph = svg
                .append('g')
                .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');
        }

        function elementSize(dimension) {
            containerElementSize = {
                width: dimension.width - (config.margin.left + config.margin.right),
                height: dimension.height - (config.margin.top + config.margin.bottom)
            };
        }

        function configureScale() {
            xComponent = d3.scale.linear()
                .domain(xDomain)
                .range([0, containerElementSize.width]);

            yAxisScale.range([containerElementSize.height, 0]);
        }

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

        function addGxAxis() {
            xComponent.axis = d3.svg.axis()
                .scale(xComponent)
                .tickValues(xTickValues)
                .tickFormat(xTickFormat)
                .orient("top");

            xAxisElement = graph.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, 0)')
                .style('opacity', config.showXAxis ? 1 : 0)
                .call(xComponent.axis);

            xAxisElement.append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(' + containerElementSize.width + ',0)')
                .attr('y', 0)
                .attr('dy', '1.71em')
                .style('text-anchor', 'end')
                .text(xAxisLabel);
        }

        function addGyAxis() {
            yAxisScale.axis = d3.svg.axis()
                .scale(yAxisScale)
                .ticks(config.yTicks)
                .tickFormat(function (d) {
                    return yAxisFormat(d);
                })
                .orient('left');

            yAxisElement = graph.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(0,0)')
                .call(yAxisScale.axis);

            yAxisElement
                .append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(0,' + containerElementSize.height + ')rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .attr('dx', '2.71em')
                .style('text-anchor', 'end')
                .text(config.yAxisLabel);
        }

        function changeYAxisDomain(detections) {
            var currentDate = _.first(detections).date;
            var firstRunTime;

            if (currentDate) {
                firstRunTime = currentDate.getTime();

                yAxisScale.domain([firstRunTime - config.yDomainDensity * 60 * 1000, firstRunTime]);
                yAxisElement
                    .call(yAxisScale.axis);
            }
        }

        function appendDetectionPointToGroup(group, detection, name) {
            return group
                .append('use')
                .attr("xlink:href", '#pathMarker_' + config.containerElement.id)
                .attr('x', xComponent(xTickFormatInverse(detection[detectionKeys.x])))
                .attr('y', -yAxisScale(initialTime))
                .attr('class', name)
        }

        function render() {
            _.each(d3MapDetections, function (detection, name) {

                if (!renderedDetections[name]) {
                    var data = [];
                    var group = gMain.append('g')
                        .attr('class', 'line ' + name)
                    .on('click', function () {
                            var detectionName = '';
                            if(event.target.getAttribute) {
                                detectionName = event.target.getAttribute('class');
                            } else if (event.target.correspondingUseElement) {
                                detectionName = event.target.correspondingUseElement.getAttribute('class');
                            } else {
                                alert('Can\'t get class attribute of the target');
                            }
                            config.detectionSelect(detectionName);
                    });

                    detection.pointElement = appendDetectionPointToGroup(group, detection, name);
//                    // there is no element, need to create it
                    data.push(detection);
                    renderedDetections[name] = {
                        data: data,
                        group: group
                    };

                } else {
                    // move group element
                    renderedDetections[name].group
                        .attr('transform', 'translate(0, ' + yAxisScale(initialTime) +')');

                    if (!renderedDetections[name].isExpired) {
                        detection.pointElement = appendDetectionPointToGroup(renderedDetections[name].group, detection, name);
                        renderedDetections[name].data.push(detection);

                        if (yAxisScale.domain()[0].getTime() >
                            (_.first(renderedDetections[name].data).date.getTime() + 1 * 60 * 1000)) {
                            var expiredDetection = renderedDetections[name].data.shift();
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

        function addDetection(detections){
            // create list of path names from detections
            _.each(detections, function (detection) {
                // exclude a detection path name from the list
                addDatapoint(d3MapDetections, detection);
            });

            findExpiredDetections(detections);

            render();
            changeYAxisDomain(detections);
        }

        function findExpiredDetections(detections) {
            var existedDetections = _.keys(renderedDetections);
            var newDetections = _.pluck(detections, 'name');
            var expiredDetections = [];

            _.each(existedDetections, function (detection) {
                if (!_.contains(newDetections, detection)) {
                    expiredDetections.push(detection);
                    renderedDetections[detection].isExpired = true;
                }
            });

            if (expiredDetections.length) {
                // if list still contains detections - just move the corresponded path
                removeExpiredDetection(d3MapDetections, expiredDetections);
            }
        }

        function removeExpiredDetection(_map_detections, datapoints) {
            _.each(datapoints, function (datapoint) {

            var expiredDetection = renderedDetections[datapoint].data.shift();
                expiredDetection.pointElement.remove();

                if (!renderedDetections[datapoint].data.length) {
                    delete renderedDetections[datapoint];
                    delete _map_detections[datapoint];
                    $('#' + config.containerElement.id + ' .' + datapoint).remove();
                }
            });
        }

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

            if (!initialTime) {
                initialTime = row.date;
            }
        }

        function changeGraphHeight(dimension) {
            elementSize(dimension);
            yAxisScale.range([containerElementSize.height, 0]);
        }

        return {
            changeYAxisDomain: changeYAxisDomain,
            addDetection: addDetection,
            changeGraphHeight: changeGraphHeight
        };
    };

    exports.sonarGraph = sonarGraph;

})(window);
