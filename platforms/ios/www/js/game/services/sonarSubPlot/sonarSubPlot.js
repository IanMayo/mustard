/**
 * @module Sonar SubPlot
 *
 * Factory class to create a sonar subplot.
 */

angular.module('subtrack90.game.sonarSubPlot', ['subtrack90.game.svgFilter'])

/**
 * @module Sonar SubPlot
 * @class Service
 * @description Sonar SubPlot. Depends on d3 lib (http://d3js.org/)
 */

.factory('sonarSubPlot', ['svgFilterConfig', 'IS_MOBILE', function (svgFilterConfig, IS_MOBILE) {

    var extendClass = function (desctination, source) {
        desctination.prototype = Object.create(source.prototype);
        desctination.prototype.constructor = desctination;
    };

    /**
     * SvgView class.
     * @class SvgView
     * @param {Object} options
     * @returns {Object}
     */
    function SvgView(options) {

        /**
         * X axis domain valid values
         *
         * @type {Array}
         */
        var xDomain = [-180, 180];

        /**
         * X axis tick values
         *
         * @type {Array}
         */
        var xTickValues = _.range(-180, 181, 45);

        /**
         * X axis tick format function
         *
         * @returns {String}
         */
        var xTickFormat = function (d) {return d;};

        /**
         * Y axis tick format template
         *
         * @type {String}
         */
        var yTickFormat = d3.time.format("%H:%M:%S");

        /**
         * X axis label
         *
         * @type {String}
         */
        var xAxisLabel = "Degree º";

        /**
         * Svg element
         *
         * @type {Object}
         */
        var svgElement;

        /**
         * Svg container of internal content
         *
         * @type {Object}
         */
        var svgElementsContainer;

        /**
         * Group element with defined clip path
         *
         * @type {Object}
         */
        var detectionsVisibleArea;

        /**
         * Group element for detections translation
         *
         * @type {Object}
         */
        var detectionsTranslationGroup;

        /**
         * Height and width of the container element
         *
         * @type {Object}
         */
        var containerElementSize;

        /**
         * X axis component
         *
         * @type {Object}
         */
        var xComponent;

        /**
         * X axis element
         *
         * @type {Object}
         */
        var xAxisElement;

        /**
         * Y axis element
         *
         * @type {Object}
         */
        var yAxisElement;

        /**
         * Y axis scale function
         *
         * @type {Object}
         */
        var yAxisScale = d3.time.scale();

        /**
         * Sonar config
         *
         * @type {Object}
         */
        var config = {};

        /**
         * Highlighted track name
         *
         * @type {String}
         */
        var highlightedTrack;

        /**
         * Default config values
         *
         * @type {Object}
         */
        var defaults = {
            containerElement: null,
            yTicks: 5,
            yDomainDensity: 1,
            yAxisLabel: "Time",
            showXAxis: true,
            margin: {top: 25, left: 100, bottom: 5, right: 50},
            detectionSelect: function () {},
            selectedPathClass: 'selectedPath',
            highlightedSegmentClass: 'highlightedSegment'
        };

        init();

        function init() {
            config = _.extend({}, defaults, options);

            svgElement = addSvgElement();
            svgElementsContainer = addSvgElementsContainer();
            elementSize(config.elementSize);
            xComponent = addXComponent();
            setYAxisRange();

            addClipPath();
            xAxisElement = addGxAxis();
            yAxisElement = addGyAxis();
            detectionsVisibleArea = addGroupContainer();
            detectionsTranslationGroup = addGroupToTranslate();
        }

        /**
         *  Add svg element.
         *
         *  @return {Object}
         */
        function addSvgElement() {
            var element = d3.select(config.containerElement)
                .append('svg')
                .attr('class', 'graph');

            // https://bugzilla.mozilla.org/show_bug.cgi?id=779368
            // http://thatemil.com/blog/2014/04/06/intrinsic-sizing-of-svg-in-responsive-web-design/
            element.style({width: '100%', height: '100%'});

            return element;
        }

        /**
         *  Add svg elements container.
         *
         *  @return {Object}
         */
        function addSvgElementsContainer() {
            var element = svgElement
                .append('g')
                .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');

            if (!IS_MOBILE) {
                element.attr('filter', 'url(#' + svgFilterConfig.blurFilterName + ')');
            }

            return element;
        }

        /**
         * Create group element to define clip path.
         *
         *  @return {Object}
         */
        function addGroupContainer() {
            return svgElementsContainer.append("g")
                .attr({
                    'class': 'gMain',
                    'clip-path': 'url(#clipPath_' + config.containerElement.id + ')'
                });
        }

        /**
         * Add group element wrapper for detections paths.
         * Element is used to translate all detections paths.
         *
         *  @return {Object}
         */
        function addGroupToTranslate() {
            return detectionsVisibleArea.append('g');
        }

        /**
         * Add clip path element for sub plot.
         */
        function addClipPath() {
            svgElementsContainer
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
         * Update dimensions of the clip path
         */
        function updateClipPathDimensions() {
            svgElementsContainer
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
         * Update label position of Y axis
         */
        function updateLabelPosition() {
            yAxisElement
                .select('.axis-unit')
                .attr('transform', 'translate(0,' + containerElementSize.height + ') rotate(-90)');
        }

        /**
         * Add X axis to the sub plot
         *
         * @return {Object}
         */
        function addGxAxis() {
            // d3 axis component
            xComponent.axis = d3.svg.axis()
                .scale(xComponent)
                .tickValues(xTickValues)
                .tickFormat(xTickFormat)
                .orient("top");

            // add axis element and apply axis component
            var axis = svgElementsContainer.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, 0)')
                .style('opacity', config.showXAxis ? 1 : 0)
                .call(xComponent.axis);

            // axis label
            axis.append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(' + containerElementSize.width + ',0)')
                .attr('y', 0)
                .attr('dy', '1.71em')
                .style('text-anchor', 'end')
                .text(xAxisLabel);

            return axis;
        }

        /**
         * Add Y axis to the sub plot
         *
         * @return {Object}
         */
        function addGyAxis() {
            // d3 axis component
            yAxisScale.axis = d3.svg.axis()
                .scale(yAxisScale)
                .ticks(config.yTicks)
                .tickFormat(function (d) {
                    return yTickFormat(d);
                })
                .orient('left');

            // add axis element and apply axis component
            var axis = svgElementsContainer.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(0,0)')
                .call(yAxisScale.axis);

            // axis label
            axis
                .append('text')
                .classed('axis-unit', true)
                .attr('transform', 'translate(0,' + containerElementSize.height + ') rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .attr('dx', '2.71em')
                .style('text-anchor', 'end')
                .text(config.yAxisLabel);

            return axis;
        }

        /**
         * Configure scale of X axis
         *
         * @return {Object}
         */
        function addXComponent() {
            return d3.scale.linear()
                .domain(xDomain)
                .range([0, containerElementSize.width]);
        }

        /**
         * Update range values of Y axis
         */
        function setYAxisRange() {
            yAxisScale.range([containerElementSize.height, 0]);
        }

        /**
         * Settings getter
         *
         * @returns {Object}
         */
        this.config = function () {
            return config;
        };

        /**
         * Remove highlighting from line paths
         *
         * @param {Array} selection Line paths collection
         */
        this.removeHighlightSelection = function (selection) {
            _.each(selection[0], function (path) {
                d3.select(path)
                    .attr('filter', null);
            });
        };

        /**
         * Remove svg element from DOM.
         */
        this.removeContainer = function () {
            svgElement.remove()
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
            detectionsTranslationGroup
                .attr('transform', 'translate(0,' + yAxisScale(timeOffset) + ')');
        };

        /**
         * Change height of svg view.
         *
         * @param {Object} dimension Height and width new values
         */
        this.changeSubPlotHeight = function (dimension) {
            elementSize(dimension);
            yAxisScale.range([containerElementSize.height, 0]);
            updateClipPathDimensions();
            updateLabelPosition();
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

        this.detectionContainer = function () {
            return detectionsVisibleArea;
        };

        this.detectionWrapper = function () {
            return detectionsTranslationGroup;
        };

        /**
         * Set highlighted track name.
         *
         * @param {String} trackName
         */
        this.setHighlightedTrackName = function (trackName) {
            highlightedTrack = trackName;
        };

        /**
         * Get highlighted track name.
         *
         * @returns {String} highlighted track name
         */
        this.highlightedTrackName = function () {
            return highlightedTrack;
        };
    }

    /**
     * LinesSvgView class.
     * @class LinesSvgView
     * @param {Object} options
     * @returns {Object}
     */
    function LinesSvgView(options) {
        SvgView.call(this, options);

        var self = this;

        /**
         * Selected line path handler.
         */
        function selectLinePath() {
            var target = event.target;
            var detectionName;

            detectionName = target.getAttribute('detection-name');
            self.config().detectionSelect(detectionName);
            highlightLinePath(detectionName);
        }

        /**
         * Highlight line path.
         *
         * @param {Object} detectionName Element Target line path
         */
        function highlightLinePath(detectionName) {
            self.removeHighlightingFromDetection();
            self.detectionWrapper().selectAll('.' + detectionName).classed(self.config().selectedPathClass, true);
        }

        /**
         * Remove highlighting from detection path.
         */
        this.removeHighlightingFromDetection = function () {
            self.detectionContainer().selectAll('.detectionPath').call(self.removeHighlightSelection);
        };

        /**
         * Create Line path.
         *
         * @param {String} pathName
         * @param {Float} opacity
         * @returns {Object} Line path
         */
        this.linePath = function (pathName, opacity) {
            var lineDatum = [{x: null, y: 0}];
            var linePath = this.detectionWrapper()
                .append('path')
                .datum(lineDatum)
                .attr('d', this.lineGenerator())
                .attr('class', 'line detectionPath ' + pathName)
                .attr('detection-name', pathName)
                .attr('stroke-linecap', "round")
                .attr('stroke-linejoin', "round")
                .attr('stroke-opacity', opacity)
                .attr('stroke-dasharray', '0.3')
                .attr('stroke-linecap', 'butt');

            var existed = this.detectionWrapper().selectAll('.' + self.config().selectedPathClass + '.' + pathName);
            if (existed.size()) {
                linePath.classed(self.config().selectedPathClass, true);
            }

            // bind click delegate handler
            linePath.on('click', selectLinePath);

            return linePath;
        };

        /**
         * Line path generator function.
         *
         * @returns {Object} Line generator
         */
        this.lineGenerator = function () {
            return d3.svg.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .defined(function (d) { return d.x != null; });
        };

        /**
         * Line path properties.
         *
         * @returns {Object} Line path properties
         */
        this.createLinePath = function (pathName, opacity) {
            return {
                generator: this.lineGenerator(),
                path: this.linePath(pathName, opacity),
                datum: [{x: null, y: 0}]
            }
        };
    }

    extendClass(LinesSvgView, SvgView);

    /**
     * DotsSvgView class.
     * @class DotsSvgView
     * @param {Object} options
     * @returns {Object}
     */
    function DotsSvgView(options) {
        options = _.extend(options, {
            detectionPointRadii: {rx: 5, ry: 6},
            opaqueClipPathPrefix: 'opaque-clip-path',
            transparentClipPathPrefix: 'transparent-clip-path',
            selectedPathColorFilter: 'selected-path-color-filter',
            colorModel: {
                hue: 70,
                saturation: 1,
                lightness: d3.scale.linear()
                    .domain([0, 1])
                    .range([0, 0.45])
            },
            hueValueForSelectedPath: 155
        });

        SvgView.call(this, options);

        var self = this;
        // IE9 doesn't support filters based on color matrix
        var presentColorMatrixFilter = !!window['SVGFEColorMatrixElement'];

        reusableShapes();

        /**
         * Create a new line path.
         *
         * @param {String} pathName
         * @returns {Object} line path properties
         */
        this.createPointsGroup = function (point, name) {
            var group = self.detectionWrapper().append('g')
                .attr('class', 'detectionPath ' + name)
                .attr('detection-name', point.trackName);

            // bind click delegate handler
            group.on('click', selectDetectionGroup);

            return group;

        };

        /**
         * Append detection point element to detection path.
         *
         * @param {Object} detection
         * @param {Object} segment
         * @param {Number} groupOffset
         * @returns {Object} d3js element
         */
        this.addDetectionToGroup = function (detection, segment, groupOffset) {
            var config = this.config();
            var colorModel = config.colorModel;
            var hueValue = colorModel.hue;

            if (!presentColorMatrixFilter) {
                // highlight fresh-added points
                if (segment.classed(self.config().highlightedSegmentClass)) {
                    hueValue = config.hueValueForSelectedPath;
                }
            }

            var point = segment
                .append('use')
                .attr({
                    'x': self.xCoordinate(detection.degree),
                    'y': - (groupOffset - self.yCoordinate(detection.date - config.initialTime)),
                    'class': 'point',
                    'detection-name': detection.trackName
                })
                .style({fill:
                    d3.hsl(hueValue, colorModel.saturation, colorModel.lightness(detection.strength))});

            detectionPointShape(point, detection.strength);

            return point;
        };

        /**
         * Remove highlighting from detection path.
         */
        this.removeHighlightingFromDetection = function () {
            if (presentColorMatrixFilter) {
                // browser supports filter type - just remove filter attribute
                self.removeHighlightSelection();
            } else {
                // need to change color of each point within a group
                removeHighlightingFromPoints();
            }
        };

        /**
         * Remove highlighting from detection paths.
         */
        this.removeHighlightSelection = function () {
            var selectedPath = self.detectionContainer().select('.' + self.config().selectedPathClass);

            selectedPath.classed(self.config().selectedPathClass, false);
            selectedPath.selectAll('g').each(function () {
                d3.select(this)
                    .attr('filter', null)
                    .classed(self.config().highlightedSegmentClass, false);
            });
        };

        /**
         * Set shape for a detection point
         * @param {Object} point
         * @param {Float} strength
         */
        function detectionPointShape(point, strength) {
            var clipPathPrefix;

            if (strength >= 0.95) {
                clipPathPrefix = self.config().opaqueClipPathPrefix;
            } else {
                var transparencyGroup = ((Math.round(strength * 10) || 1) * 10).toString() + 'p';
                clipPathPrefix = self.config().transparentClipPathPrefix + '-' + transparencyGroup;
            }

            point.attr({
                'xlink:href': '#' + clipPathPrefix +  '-' + _.random(1, 10)
            });
        }

        /**
         * Handler of selected detection group
         */
        function selectDetectionGroup() {
            var detectionName;
            var segmentElement;
            var target = d3.event.target;

            if (target.tagName && 'g' === target.tagName.toLowerCase()) {
                segmentElement = target;
            } else {
                if (target.getAttribute) {
                    segmentElement = target.parentElement;
                } else if (target.correspondingUseElement) {
                    // Safari browser and IE
                    segmentElement = target.correspondingUseElement.parentNode;
                }
            }

            if (segmentElement) {
                var groupElement = segmentElement.parentNode;
                if (groupElement) {
                    detectionName = groupElement.getAttribute('detection-name');
                    self.config().detectionSelect(detectionName);
                    self.setHighlightedTrackName(detectionName);

                    highlightSegment(segmentElement);
                }
            }
        }

        /**
         * Highlight a target detection group.
         */
        function highlightSegment(element) {
            var segmentElement = d3.select(element);
            self.removeHighlightingFromDetection();
            d3.select(element.parentNode).classed(self.config().selectedPathClass, true);
            segmentElement.classed(self.config().highlightedSegmentClass, true);

            if (presentColorMatrixFilter) {
                segmentElement
                    .attr('filter', 'url(#' + self.config().selectedPathColorFilter + ')');
            } else {
                var hueVale = self.config().hueValueForSelectedPath;
                changeColorHueValueOnPoints(segmentElement, hueVale);
            }
        }

        /**
         * Remove highlighting from detections points within a group element.
         */
        function removeHighlightingFromPoints() {
            var hueValue = self.config().colorModel.hue;
            var selectedGroup = self.detectionContainer().select('.' + self.config().selectedPathClass);
            selectedGroup.classed(self.config().selectedPathClass, false);
            changeColorHueValueOnPoints(selectedGroup, hueValue);
        }

        /**
         * Change hue value on detection points within a group element.
         *
         * @param {Object} d3 wrapped element groupElement
         * @param {Integer} hueValue
         */
        function changeColorHueValueOnPoints(groupElement, hueValue) {
            groupElement.selectAll('use').each(function () {
                var useElement = d3.select(this);
                var oldColor = d3.hsl(useElement.style('fill'));
                var newColor = d3.hsl(hueValue, oldColor.s, oldColor.l);
                useElement.style('fill', newColor);
            });
        }

        /**
         * Create color filter for selected detection path
         *
         * @param {Object} defs element
         */
        function selectedPathColor(defs) {
            defs.append('filter')
                .attr('id', self.config().selectedPathColorFilter)
                .append('feColorMatrix')
                .attr({
                    'in': 'SourceGraphic',
                    'type': 'hueRotate',
                    'values': '40'
                });
        }

        /**
         * Create reusable shapes for detections points
         */
        function reusableShapes() {
            var graphNode = self.detectionContainer().node().parentNode;
            var defs = d3.select(graphNode).select('defs');

            addReusableShapesForTransparentPoints(defs);
            addReusableShapesForOpaquePoints(defs);
            selectedPathColor(defs);
        }

        /**
         * Create reusable random shapes for transparent points.
         *
         * @param {Object} parentElement
         */
        function addReusableShapesForTransparentPoints(parentElement) {
            // transparency step
            var transparency;
            // number of points in path for a specific transparency step.
            var pointsInPath;

            var x = self.config().detectionPointRadii.rx;
            var y = self.config().detectionPointRadii.ry;

            /**
             * Create a shape element for a specific number of points and transparency step
             *
             * @param pointsDensity
             * @param transparencyStep
             */
            var createClipPath = function (pointsDensity, transparencyStep) {
                var rx = self.config().detectionPointRadii.rx;
                var ry = self.config().detectionPointRadii.ry;

                // The fewer density of density is, the fewer scatters of radii are
                var radiiFactor = Math.round(Math.pow(Math.log(pointsDensity), 2));
                var xRadiusInterval = [rx - radiiFactor, rx + radiiFactor];
                var yRadiusInterval = [ry - radiiFactor, ry + radiiFactor];

                var pointsNumber = _.range(Math.round(pointsDensity + Math.pow(Math.log(pointsDensity), 3)));

                var pathFunction =
                    d3.svg.line()
                        .x(function () { return _.random.apply(this, xRadiusInterval) })
                        .y(function () { return _.random.apply(this, yRadiusInterval) });

                for (var i = 1; i <= 10; i++) {
                    parentElement
                        .append('path')
                        .attr('id', self.config().transparentClipPathPrefix + '-' + transparencyStep + 'p-' + i)
                        .attr('d', function () {
                            return pathFunction(pointsNumber) + 'Z';
                        });
                }
            };

            // initial values
            transparency = 10;
            pointsInPath = 3;

            do {
                createClipPath(pointsInPath, transparency);
                transparency += 10;
                pointsInPath += 1;
            } while (transparency < 100);
        }

        /**
         * Create reusable random shapes for opaque points.
         *
         * @param {Object} parentElement
         */
        function addReusableShapesForOpaquePoints(parentElement) {
            var pointsNumberInPath = _.range(30);
            var clipPathsNumber = 10;
            var x = self.config().detectionPointRadii.rx * 2;
            var y = self.config().detectionPointRadii.ry * 2;

            var pathFunction = d3.svg.line()
                    .x(function () { return _.random(x) })
                    .y(function () { return _.random(y) });

            for (var i = 1; i <= clipPathsNumber; i++) {
                parentElement
                    .append('path')
                    .attr('id', self.config().opaqueClipPathPrefix + '-' + i)
                    .attr('d', function () {return pathFunction(pointsNumberInPath) + 'Z'});
            }
        }
    }

    extendClass(DotsSvgView, SvgView);

    /**
     * Detections class.
     * @class Detections
     * @abstract
     * @param {Object} options
     * @returns {Object}
     */
    function Detections(options) {
        this.detectionExpireTime =  1 * 60 * 1000; // 1 minute
        this.pointsTimeGap = 2000;
        this.svgView = null;

        var processedDetections = {};
        var renderedDetections = {};
        var self = this;

        if (this.constructor === Detections) {
            throw new Error("Can't instantiate abstract class!");
        }

        /**
         * Find expired detections by comparing new detections list and existed.
         *
         * @param {Object} detections
         */
        function findExpiredDetections(detections) {
            var existedDetections = _.keys(this.renderedDetections);
            var newDetections = _.pluck(detections, 'groupId');
            var expiredDetections = [];

            _.each(existedDetections, function (detection) {
                if (!_.contains(newDetections, detection)) {
                    // a detection series disappeared
                    expiredDetections.push(detection);
                    this.renderedDetections[detection].isExpired = true;
                } else {
                    // a detection series appeared again
                    this.renderedDetections[detection].isExpired = false;
                }
            }, this);

            if (expiredDetections.length) {
                // expired series exist - analise them
                this.removeExpiredDetection(expiredDetections);
            }
        }

        /**
         * Add detection to the processed detection.
         *
         * @param {Object} detection
         */
        function addProcessedDetection(detection) {
            if (detection.strength === 0) {
                // invisible detection can be omitted
                return;
            }

            processedDetections[detection.groupId] = {
                groupId: detection.groupId,
                trackName: detection.trackName,
                date: detection.date,
                degree: detection.degree,
                strength: detection.strength
            };
        }
        
        function deselectPath() {
            _.each(renderedDetections, function (detection, groupId) {
                if (!processedDetections[groupId]) {
                    // there was no a new detection data for a rendered path
                    if (detection.segment.node().hasChildNodes()) {
                        // create a new segment only if the segment is not empty
                        var segment = detection.group.append('g');
                        segment.classed('contactSegment', true);
                        detection.segment = segment;
                    }
                }
            });
        }

        this.addDetection = function (detections) {
            // create list of path names from detections
            _.map(detections, function (detection) {
                // use normalized id to work with collection correctly
                // replace spaces
                detection.groupId = this.createGroupId(detection);
                if (detection.groupId !== 'Ownship') {
                }
                addProcessedDetection(detection);
            }, this);

            findExpiredDetections(detections);
            this.addDetections();
        };

        this.processedDetections = function () {
            return processedDetections;
        };

        this.renderedDetections = function (detection) {
            if (detection) {
                return renderedDetections[detection];
            }

            return renderedDetections;
        };

        this.setRenderedDetections = function (name, detection) {
            renderedDetections[name] = detection;
        };

        this.settings = function () {
            return options;
        };

        /**
         * Remove group wrapper element of detections.
         *
         * @param {String} groupId
         */
        this.removeExpiredDatapointGroup = function (groupId) {
            if (!this.renderedDetections[groupId].data.length) {
                // if collection is empty
                // remove a path element from DOM
                this.renderedDetections[groupId].linePath.remove();
                // remove empty collection
                delete this.renderedDetections[groupId];
                // remove detection collection respectively
                delete processedDetections[groupId];
            }
        };

        /**
         * Change detections positions according to settings of axis.
         */
        this.changeDetectionsPosition = function (dimension) {
            this.svgView.changeSubPlotHeight(dimension);
            this.svgView.changeTracksOffset(this.settings().initialTime);

            var groupOffset = this.yAxisOriginCoordinate();
            _.each(renderedDetections, function (detection) {
                this.updateDetection(detection, groupOffset);
            }, this);
        };

        this.addDetections = function () {
            var groupOffset = this.yAxisOriginCoordinate();
            _.each(processedDetections, function (detectionPoint, groupId) {
                var detectionPath = renderedDetections[groupId];
                if (!detectionPath) {
                    this.createPathContainer(detectionPoint, groupId);
                } else {
                    this.addPointToPath(detectionPoint, detectionPath, groupOffset);
                }
            }, this);
        };

        /**
         * Returns Y-coordinate depend on Y-axis domain
         *
         * @returns {Integer}
         */
        this.yAxisOriginCoordinate = function () {
            return self.svgView.yCoordinate(options.initialTime);
        };

        this.moveDetections = function (simulationTime) {
            this.svgView.updateVisibleDomain(simulationTime.getTime());
            this.svgView.changeTracksOffset(options.initialTime);
            deselectPath();

            if (!options.serialRenderingMode) {
                this.removeAllExpiredDetections();
            }

            processedDetections = {};
        };

        this.currentTimeBoundaries = function (time) {
            return this.svgView.visibleDomain(time);
        }
    }

    /**
     * @abstract method
     */
    Detections.prototype.createPathContainer = function () {};

    /**
     * @abstract method
     */
    Detections.prototype.addPointToPath = function () {};

    /**
     * @abstract method
     */
    Detections.prototype.removeAllExpiredDetections = function () {};

    /**
     * @abstract method
     */
    Detections.prototype.removeDetections = function () {};

    /**
     * @abstract method
     */
    Detections.prototype.createGroupId = function () {};

    /**
     * @abstract method
     */
    Detections.prototype.updateDetection = function () {};

    /**
     * DotDetections class.
     * @class DotDetections
     * @param {Object} options
     * @returns {Object}
     */
    function DotDetections(options) {
        Detections.call(this, options);

        this.svgView = new DotsSvgView(options);

        /**
         * Remove group wrapper element of detections.
         *
         * @param {String} groupId
         */
        this.removeExpiredDatapointGroup = function (groupId) {
            if (!this.renderedDetections(groupId).data.length) {
                // if collection is empty
                // remove empty collection
                delete this.renderedDetections(groupId);
                // remove detection collection respectively
                delete this.processedDetections(groupId);
                // remove group wrapper element
                //$('#' + options.containerElement.id + ' .' + groupId).remove();
            }
        };

        /**
         * Remove expired (out of clip path) element from DOM and detection points respectively.
         *
         * @param {Object} groupIds
         */
        this.removeExpiredDetection = function (groupIds) {
            _.each(groupIds, function (groupId) {
                if (this.svgView.visibleDomain()[0].getTime() >
                    (_.first(this.renderedDetections(groupId).data).date.getTime() + this.detectionExpireTime)) {
                    // datapoint became "invisible" - its time is less then time axis domain lower value

                    // extract first datapoint
                    var expiredDetection = this.renderedDetections(groupId).data.shift();
                    // and remove it
                    if (expiredDetection.pointElement) {
                        expiredDetection.pointElement.remove();
                    }

                    this.removeExpiredDatapointGroup(groupId);
                }
            }, this);
        }
    }

    extendClass(DotDetections, Detections);

    /**
     * Remove all expired detections.
     * Used in review mode
     */
    DotDetections.prototype.removeAllExpiredDetections = function () {
        _.each(this.processedDetections(), function (detection, groupId) {
            _.each(this.renderedDetections(groupId).data, function (item, index) {
                if (item.date.getTime() >= this.svgView.visibleDomain()[1].getTime() ||
                    item.date.getTime() <= this.svgView.visibleDomain()[0].getTime()) {
                    var expiredDetection = this.renderedDetections(groupId).data.splice(index, 1).pop();
                    if (expiredDetection.pointElement) {
                        expiredDetection.pointElement.remove();
                    }

                    this.removeExpiredDatapointGroup(groupId);
                }
            }, this);
        }, this);
    };

    DotDetections.prototype.createPathContainer = function (detection, name) {
        var data = [];
        var group = this.svgView.createPointsGroup(detection, name);
        var segment = group.append('g');
        segment.classed('contactSegment', true);

        // there is no element, need to create it
        data.push(detection);

        // add detection data to rendered collection
        this.setRenderedDetections(name, {
            data: data,
            group: group,
            date: detection.date,
            isExpired: false,
            segment: segment // wrap detections points in segments for each detection contact series
        });
    };

    DotDetections.prototype.removeDetections = function () {
        _.each(this.renderedDetections(), function (detection) {
            detection.group.on('click', null);
        });

        this.svgView.removeContainer();
    };

    DotDetections.prototype.addPointToPath = function (detection, detectionPath, groupOffset) {
        if (!detectionPath.isExpired) {
            // append new point element based on detection
            detection.pointElement = this.svgView.addDetectionToGroup(detection, detectionPath.segment, groupOffset);
            // add detection to rendered collection
            detectionPath.data.push(detection);

            if (this.settings().serialRenderingMode && this.svgView.visibleDomain()[0].getTime() >
                (_.first(detectionPath.data).date.getTime() + this.detectionExpireTime)) {
                // detection point became "invisible" - its time is less then time axis domain lower value

                // remove datapoint from collection
                var expiredDetection = detectionPath.data.shift();
                // remove datapoint element
                if (expiredDetection.pointElement) {
                    expiredDetection.pointElement.remove();
                }
            }
        }
    };

    DotDetections.prototype.createGroupId = function (detection) {
        return detection.trackName.replace(/\W/, '_');
    };

    DotDetections.prototype.updateDetection = function (detection, groupOffset) {
        _.each(detection.data, function (element) {
            if (element.pointElement) {
                element.pointElement.attr('y', - (groupOffset - this.svgView.yCoordinate(element.date)));
            }
        }, this);
    };

    /**
     * LineDetections class.
     * @class LineDetections
     * @param {Object} options
     * @returns {Object}
     */
    function LineDetections(options) {
        Detections.call(this, options);

        this.svgView = new LinesSvgView(options);

        /**
         * Remove expired (out of clip path) element from DOM and datapoint respectively.
         *
         * @param {Object} dataset
         * @param {Object} datapoints
         */
        this.removeExpiredDetection = function (datapoints) {
            _.each(datapoints, function (datapoint) {
                if (this.svgView.visibleDomain()[0].getTime() >
                    (_.first(this.renderedDetections[datapoint].data).date.getTime() + this.detectionExpireTime)) {
                    // datapoint became "invisible" (outdated) - its time is less then time axis domain lower value

                    // remove outdated point (the first)
                    this.renderedDetections[datapoint].data.shift();
                    this.renderedDetections[datapoint].lineDatum.shift();

                    this.removeExpiredDatapointGroup(datapoint);
                }
            }, this);
        };

        /**
         * Determine x-coordinate of a next point.
         * null value assumes that line path "changes side of the sonar" form let
         *
         * @param {Object} nextPoint
         * @param {Object} lastPoint
         * @returns {null|Integer} x-coordinate of a next point
         */
        this.xCoordinate = function (nextPoint, lastPoint) {
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

            if (changeSign || ((nextPoint.date.getTime() - lastPointTime) > this.pointsTimeGap)) {
                return null;
            }

            return this.svgView.xCoordinate(nextPoint.degree);
        }
    }

    extendClass(LineDetections, Detections);

    /**
     * Remove all expired detections.
     * Used in review mode
     */
    LineDetections.prototype.removeAllExpiredDetections = function () {
        var timeAxisUpperBound = this.svgView.visibleDomain()[1].getTime();
        var timeAxisLowerBound = this.svgView.visibleDomain()[0].getTime();
        var groupOffset = this.yAxisOriginCoordinate();
        var testPointDate;

        _.each(this.renderedDetections, function (detection, groupId) {

            if (detection.data.length) {
                _.each(detection.data, function (item, index) {
                    testPointDate = item.date.getTime();
                    if (testPointDate >= timeAxisUpperBound || testPointDate <= timeAxisLowerBound) {
                        detection.data.splice(index, 1);
                        detection.lineDatum.splice(index, 1);
                    }
                });

                this.removeExpiredDatapointGroup(groupId);

                if (detection) {
                    detection.data = _.sortBy(detection.data, function (d) {return d.date.getTime()});
                    this.updateDetection(detection, groupOffset);
                }
            }
        }, this);
    };

    LineDetections.prototype.createPathContainer = function (detection, name) {
        var data = [];
        var linePath = this.svgView.createLinePath(detection.trackName,  detection.strength);

        // there is no element, need to create it
        data.push(detection);

        // add detection data to rendered collection
        this.setRenderedDetections(name, {
            lineDatum: linePath.datum,
            lineGenerator: linePath.generator,
            linePath: linePath.path,
            data: data,
            date: detection.date,
            isExpired: false
        });
    };

    LineDetections.prototype.addPointToPath = function (detection, detectionPath, groupOffset) {
        var nextPoint = detection;
        var lastPoint = _.last(detectionPath.data);

        if (!detectionPath.isExpired) {
            detectionPath.lineDatum.push({
                x: this.xCoordinate(nextPoint, lastPoint),
                y: -(groupOffset - this.svgView.yCoordinate(detection.date))
            });

            // add detection to rendered collection
            detectionPath.data.push(detection);

            if (this.settings().serialRenderingMode) {
                detectionPath.linePath.attr('d', detectionPath.lineGenerator(detectionPath.lineDatum));

                if (this.svgView.visibleDomain()[0].getTime() >
                    (_.first(detectionPath.data).date.getTime() + this.detectionExpireTime)) {
                    // datapoint became "invisible" - its time is less then time axis domain lower value

                    // remove datapoint from collection
                    detectionPath.data.shift();
                    detectionPath.lineDatum.shift();
                }
            }
        }
    };

    LineDetections.prototype.removeDetections = function () {
        _.each(this.renderedDetections(), function (detection) {
            detection.linePath.on('click', null);
        });

        this.svgView.removeContainer();
    };

    LineDetections.prototype.createGroupId = function (detection) {
        return detection.trackName.replace(/\W/, '_') + ':' + detection.strength;
    };

    LineDetections.prototype.updateDetection = function (detection, offset) {
        var lineDatum = [];
        var nextPoint;
        var lastPoint;

        _.each(detection.data, function (data) {
            nextPoint = data;
            lineDatum.push({
                x: this.xCoordinate(nextPoint, lastPoint),
                y: - (offset - this.svgView.yCoordinate(data.date))
            });

            lastPoint = nextPoint;
        }, this);

        detection.lineDatum = lineDatum;
        detection.linePath.attr('d', detection.lineGenerator(lineDatum));
        lineDatum = [];
    };

    /**
     * SubPlot class.
     * @class SubPlot
     * @param {Object} options
     * @returns {Object}
     */
    function SubPlot(options) {
        var builder;

        var config = {
            serialRenderingMode: false
        };

        var builderDotMode = true;

        _.each(options, function (value, key) {
            if (value !== undefined) {
                config[key] = value;
            }
        });

        if (builderDotMode) {
            builder = new DotDetections(config);
        } else {
            builder = new LineDetections(config);
        }

        return {

            /**
             * Reconfigure Y-axis domain.
             *
             * @param {Date} simulationTime
             */
            changeYAxisDomain: function (simulationTime) {
                builder.moveDetections(simulationTime);
            },

            /**
             * Add new detections to sub plot.
             *
             * @param {Object} detections
             */
            addDetection: function (detections) {
                builder.addDetection(detections);
            },

            /**
             * Update sub plot height value and reconfigure Y-axis with a new range.
             *
             * @param {Object} dimension
             */
            changeSubPlotHeight: function (dimension) {
                builder.changeDetectionsPosition(dimension);
            },

            /**
             * Return current boundaries of Y axis.
             *
             * @returns {Array}
             */
            timeAxisBoundaries: function (time) {
                return builder.currentTimeBoundaries(time);
            },

            /**
             * Remove sub plot from DOM and remove handlers
             */
            remove: function () {
                builder.removeDetections();
            }
        }
    }

    /**
     * Create an instance of the SubPlot class.
     *
     * @param {Object} config
     * @returns {Object} SubPlot class instance
     */
    SubPlot.build = function (config) {
        return new SubPlot(config);
    };

    return SubPlot;
}]);
