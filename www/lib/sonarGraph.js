(function (exports) {

    var sonarGraph = function (options) {

        var xDomain = [0, 360];
        var xTickValues = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        var xTickFormat = function (d) {return (d <= 180) ? ((d + 180) === 360 ? 0: (d + 180)) : d - 180};
        var xTickFormatInverse = function (d) {return (d <= 180) ? d + 180 : d - 180;};

        var d3MapDetections = d3.map([]);
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

        var yAxis = d3.time.scale();
        var xAxis;

        var config = {
            containerElement: null,
            yTicks: 5,
            yDomainDensity: 1,
            detectionPointRadii: {rx: 0, ry: 0},
            yAxisLabel: "Time",
            showXAxis: true,
            margin: {top: 25, left: 100, bottom: 5, right: 50}
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
            graph = d3.select(config.containerElement)
                .append('svg')
                .attr('class', 'graph g-wrapper')
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
            xAxis = d3.scale.linear()
                .domain(xDomain)
                .range([0, containerElementSize.width]);

            yAxis.range([containerElementSize.height, 0]);
        }

        function addClipPath() {

            mainClipPath = graph
                .append('defs')
                .append('clipPath')
                .attr('id', 'clipPath_' + config.containerElement.id)
                .append('rect')
                .attr('width', containerElementSize.width)
                .attr('height', containerElementSize.height);

            graph.append('defs')
                .append('marker')
                .attr('id', 'pathMarker_' + config.containerElement.id)
                .attr('markerWidth', 6)
                .attr('markerHeight', 9)
                .append('ellipse')
                .attr('cx', 2.5)
                .attr('cy', 4)
                .attr('rx', config.detectionPointRadii.rx)
                .attr('ry', config.detectionPointRadii.ry)
                .style({'fill': 'rgb(170, 206, 0)'});
        }

        function addGxAxis() {
            xAxisElement = graph.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, 0)')
                .style('opacity', config.showXAxis ? 1 : 0)
                .call(xAxis.axis = d3.svg.axis()
                    .scale(xAxis)
                    .tickValues(xTickValues)
                    .tickFormat(xTickFormat)
                    .orient("top"))

            xAxisElement.append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(' + containerElementSize.width + ',0)')
                .attr('y', 0)
                .attr('dy', '1.71em')
                .style('text-anchor', 'end')
                .text(xAxisLabel);
        }

        function addGyAxis() {
            yAxisElement = graph.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(0,0)')
                .call(yAxis.axis = d3.svg.axis()
                    .scale(yAxis)
                    .ticks(config.yTicks)
                    .tickFormat(function (d) {
                        return yAxisFormat(d);
                    })
                    .orient('left'));

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

                yAxis.domain([firstRunTime - config.yDomainDensity * 60 * 1000, firstRunTime]);
                yAxisElement
                    .call(yAxis.axis);
            }
        }

        function render() {
            _.each(d3MapDetections.entries(), function (detection) {
                if (detection.key === 'Time' || detection.key === 'S1' || detection.key === 'S2') {
                    // skip useless paths
                    return;
                }

                if (!renderedDetections[detection.key]) {
                    // there is no element, need to create it
                    var data = [];

                    var line = d3.svg.line()
                        .interpolate('linear')
                        .y(function(d) {
                            return yAxis(d[detectionKeys.y]);
                        })
                        .x(function(d) {
                            return xAxis(xTickFormatInverse(d[detectionKeys.x]));
                        });

                    var path = gMain
                        .append("path")
                        .data([data])
                        .attr("d", line)
                        .attr('marker-mid', 'url(#pathMarker_' + config.containerElement.id +')')
                        .style('stroke-opacity', 0)
                        .attr('fill', 'none')
                        .attr('class', 'line ' + detection.key);


                    // add detection path to the list
                    renderedDetections[detection.key] = {
                        path: path,
                        line: line,
                        data: data
                    };

                } else {
                    var lastPoint = _.last(detection.value);

                    if (renderedDetections[detection.key]) {
                        renderedDetections[detection.key].data.push(lastPoint);
                        renderedDetections[detection.key].path
                            .attr('d', function (d) {return renderedDetections[detection.key].line(d)})
                            .attr("transform", null);

                        if (yAxis.domain()[0].getTime() >
                            (_.first(renderedDetections[detection.key].data).date.getTime() + 1 * 1 * 1000)) {
                            renderedDetections[detection.key].data.shift();
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
                addDatapoint(d3MapDetections, detection);
            });

            render();
            changeYAxisDomain(detections);
        }

        function addDatapoint(dataset, row) {
            // check if key exists
            if ( dataset.has(row.name) ) {
                var dataSet = dataset.get(row.name);
                dataSet.push({
                    date: row.date,
                    degree: row.degree,
                    strength: row.strength ? row.strength : null
                });
                dataSet.shift();
            } else {
//              // add the new key
                dataset.set(row.name, [{
                        date: row.date,
                        degree: row.degree,
                        strength: row.strength ? row.strength : null
                    }]
                );
            }
        }

        function changeGraphHeight(dimension) {
            elementSize(dimension);
            yAxis.range([containerElementSize.height, 0]);
        }

        return {
            changeYAxisDomain: changeYAxisDomain,
            addDetection: addDetection,
            changeGraphHeight: changeGraphHeight
        };
    };

    exports.sonarGraph = sonarGraph;

})(window);
