/**
 * d3 Sonar
 * ========
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Ashish Singh [ashish.me@outlook.com]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function(){

    d3.sonar =	function(){

        var container_el,	// JavaScript ref to element which will considered to calculate viz height & width. By default, its the viz wrapper element.
            transitionDuration = 0,
            chart,
            xDomain = [0, 360],
            xTickValues = [0,45,90,135,180,225,270,315,360],
            xTickFormat = function(d){	return d;	},
            xTickFormatInverse = function(d){	return d;	},
            xScale = d3.scale.linear().domain(xDomain),
            xAxis,
            showXAxis = true,
            xAxisLabel = "Time",
            showYAxis = true,
            yAxisLabel = "Degree º",
            gxAxis,
            yScale = d3.time.scale(),
            yAxis,
            yTicks = 5,
            gyAxis,
            yAxisFormat = d3.time.format("%H:%M:%S"),	// %L
            gMain,
            strengthScale = function(){},
            headingPath = function(){},
            detectionPath = function(){},
            headingKeys,
            detectionKeys,
            width,
            height,
            defaultHeight = $(window).height() * 0.8, // 80% of window height
            defaultWidth = $(window).width() * 0.8, // 80% of window height
            maxHeight = 0,	// set this to any positive value, when max chart height needs to be capped. This is an absolute value in pixels.
            margin = {top: 40, left: 100, bottom: 40, right: 50},
            dimension,
            data,
            isResponsive = true,	// true by default
            resizeTimer,
            _map_detections = d3.map([]),
            _map_heading = d3.map([]),
            _prevWidth = 0,
            _prevHeight = 0,
            purge_old_data = true,
            dataAge = 30*1000,	// in milliseconds
            _date_array = [],
            colors = {
                indicator: "#aace00",
                heading: "#1A68DB"
            },
            mainClipPath,
            mainClipPathID = "clip-"+ Math.round(new Date().getTime()*Math.random());

        function sonar(){

            sonar.init();

            sonar.render();

        }

        /**
         * Do first time initiation settings; called only once
         */
        sonar.init = function(){

            //apply_settings(options, opts);
            // apend the svg to container element
            chart = d3.select(container_el).append("svg")
               .attr("class", "chart")
               .append("g")
               .attr("transform","translate("+margin.left+","+margin.top+")");

            firstLoad = true;

            width = container_el.getBoundingClientRect().width;
            height = container_el.getBoundingClientRect().height;

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            dimension = {
                width: width,
                height: height
            }

            xScale
                .domain(xDomain)
                .range([0, width]);

            yScale.range([height,0]);

            xAxis = d3.svg.axis()
                .scale(xScale)
                .tickValues(xTickValues)
                .tickFormat(xTickFormat)
                .orient("top");

            yAxis = d3.svg.axis()
                .scale(yScale)
                .ticks(yTicks)
                .tickFormat(function(d){
                  return yAxisFormat(d) ;
                })
                .orient("left");

            strengthScale = d3.scale.linear()
                .domain([1,10])
                .range([50,100]);

            _prevWidth = width;
            _prevHeight = height;

            // Add the clip path.
            mainClipPath = chart.append("clipPath")
                    .attr("id", mainClipPathID)
                .append("rect")
                    .attr("width", width)
                    .attr("height", height);


            gxAxis = chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0,0)")
                .call(xAxis);

            gxAxis
                .append("text")
                  .classed("axis-unit", true)
                  .attr("transform", "translate("+width+",0)")
                  .attr("y", 0)
                  .attr("dy", "1.71em")
                  .style("text-anchor", "end")
                  .text(yAxisLabel);

            gyAxis = chart.append("g")
                  .attr("class", "y axis")
                  .call(yAxis);

            gyAxis
                .append("text")
                  .classed("axis-unit", true)
                  .attr("transform", "translate(0,"+height+")rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .attr("dx", "2.71em")
                  .style("text-anchor", "end")
                  .text(xAxisLabel);

            gMain = chart.append("g")
                        .classed("gMain",true);

            headingPath = d3.svg.line()
                  .interpolate("basis")
                  .y(function(d) { return yScale(d[headingKeys.y]); })
                  .x(function(d) { return xScale(xTickFormatInverse(d[headingKeys.x])); });

            detectionPath = d3.svg.line()
                  .interpolate("basis")
                  .y(function(d) { return yScale(d[detectionKeys.y]); })
                  .x(function(d) { return xScale(xTickFormatInverse(d[detectionKeys.x])); });


            if(isResponsive){

                setInterval(sonar.reInit, 1000);
            }

            return sonar;
        }

        /**
         * Re calculates basic configuration parameters of the viz
         * like dimensions, scales etc.
         * Usage - Can be called before the viz needs to be redrawn
         * to conform to current viewport
         */
        sonar.reInit = function(){

            width = container_el.getBoundingClientRect().width;
            height = container_el.getBoundingClientRect().height;

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            dimension = {
                width: width,
                height: height
            }

            // re-intialize scales
            xScale.range([0, width]);

            yScale
                .domain(d3.extent(_date_array))
                .range([height, 0]);

            // recalculate no. of ticks automagically
            // NOTE - this is overwriting the API
            yTicks = Math.ceil( height/70 ); // 70 is a magical number
            yAxis.ticks(yTicks);

            // only update if chart size has changed
            if ( (_prevWidth != width) ||
              (_prevHeight != height)) {

                _prevWidth = width;
                _prevHeight = height;

                chart
                    .attr("width", width)
                    .attr("height", height);

                mainClipPath
                    .attr("width", width)
                    .attr("height", height);

                gxAxis
                    .select(".axis-unit")
                    .attr("transform", "translate("+width+",0)");

                gyAxis
                    .select(".axis-unit")
                    .attr("transform", "translate(0,"+height+")rotate(-90)");
            }

            gyAxis
                .style('opacity', showYAxis ? 1 : 0)
                .call(yAxis);

            gxAxis
                .style('opacity', showXAxis ? 1 : 0)
                .call(xAxis);

        }

        /**
         * Render the chart viz with current settings
         */
        sonar.render = function(){

            var tDuration = transitionDuration;

            width = dimension.width;
            height = dimension.height;

            // plot heading
            var heading = gMain.selectAll(".line")
                .data(_map_heading.entries());

            heading
                .enter().append("path")
                .attr("clip-path", "url(#"+mainClipPathID+")")
                .attr("class", "line");

            heading
                .attr("d", function(d) {
                    return headingPath(d.value);
                })
                .style("stroke", function(d) { return colors.heading; })

            heading.exit().remove();

            // plot indicators
            var g_indicators = gMain.selectAll(".indicators")
                .data(_map_detections.entries());

            g_indicators
                .enter().append("path")
                .attr("clip-path", "url(#"+mainClipPathID+")")
                .attr("class", "line");

            g_indicators
                .attr("d", function(d) {
                    return detectionPath(d.value);
                })
                .style("stroke", function(d) { return colors.indicator; })

            g_indicators.exit().remove();

            if (firstLoad){
                firstLoad = false;
            }

            return sonar;
        }


        /**
         * Update the chart;
         * Update - recalculates parameters like viewport dimension, reset scales etc.
         * and then renders the viz. Useful in cases like resizing of viewport.
         */
        sonar.update = function(){

            sonar.reInit();

            // render the viz
            // also does data updates
            sonar.render();
        }


        /**
         *	Chained functions
         */
        sonar.container_el = function (_) {
            if (!arguments.length) return container_el;
            container_el = _;
            return sonar;
        }

        sonar.data = function(value){
            if(!arguments.length) return data;
            data = value;
            return sonar;
        }

        sonar.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return sonar;
        }
        sonar.isResponsive = function(_){
            if (!arguments.length) { return isResponsive; }
            isResponsive = _;
            return sonar;
        }

        sonar.headingPath = function(_){
            if (!arguments.length) { return headingPath; }
            headingPath = _;
            return sonar;
        }

        sonar.detectionPath = function(_){
            if (!arguments.length) { return detectionPath; }
            detectionPath = _;
            return sonar;
        }

        sonar.xScale = function(_){
            if (!arguments.length) { return xScale; }
            xScale = _;
            return sonar;
        }

        sonar.xDomain = function(_){
            if (!arguments.length) { return xDomain; }
            xDomain = _;
            return sonar;
        }

        sonar.xTickValues = function(_){
            if (!arguments.length) { return xTickValues; }
            xTickValues = _;
            return sonar;
        }

        sonar.xTickFormat = function(_){
            if (!arguments.length) { return xTickFormat; }
            xTickFormat = _;
            return sonar;
        }

        sonar.xTickFormatInverse = function(_){
            if (!arguments.length) { return xTickFormatInverse; }
            xTickFormatInverse = _;
            return sonar;
        }

        sonar.xAxisLabel = function(_){
            if (!arguments.length) { return xAxisLabel; }
            xAxisLabel = _;
            return sonar;
        }

        sonar.showXAxis = function(_){
            if (!arguments.length) { return showXAxis; }
            showXAxis = _;
            return sonar;
        }

        sonar.showYAxis = function(_){
            if (!arguments.length) { return showXAxis; }
            showXAxis = _;
            return sonar;
        }

        sonar.yAxisLabel = function(_){
            if (!arguments.length) { return yAxisLabel; }
            yAxisLabel = _;
            return sonar;
        }

        sonar.yScale = function(_){
            if (!arguments.length) { return yScale; }
            yScale = _;
            return sonar;
        }

        sonar.yTicks = function(_){
            if (!arguments.length) { return yTicks; }
            yTicks = _;
            return sonar;
        }

        sonar.headingKeys = function(_){
            if (!arguments.length) { return headingKeys; }
            headingKeys = _;
            return sonar;
        }

        sonar.detectionKeys = function(_){
            if (!arguments.length) { return detectionKeys; }
            detectionKeys = _;
            return sonar;
        }

        sonar.purgeOldData = function(_){
            if (!arguments.length) { return purge_old_data; }
            purge_old_data = _;
            return sonar;
        }

        sonar.dataAge = function(_){
            if (!arguments.length) { return dataAge; }
            dataAge = _;
            return sonar;
        }

        sonar.transitionDuration = function(_){
            if (!arguments.length) { return transitionDuration; }
            transitionDuration = _;
            return sonar;
        }

        sonar.colors = function(_){
            if (!arguments.length) { return colors; }
            colors = _;
            return sonar;
        }

        sonar.addDetection = function(_){
            if (!arguments.length) { return false; }
            sonar.addDatapoint( _map_detections, _ );
            return sonar;
        }

        sonar.addHeading = function(_){
            if (!arguments.length) { return false; }
            sonar.addDatapoint( _map_heading, _ );
            return sonar;
        }

        sonar.addDatapoint = function(dataset_map, data_row){
            var now = new Date().getTime();

            // check if key exists
            if ( dataset_map.has(data_row.name) ) {
              // add the data set
              dataset_map.get(data_row.name).push({
                  date: data_row.time,
                  degree: data_row.value,
                  strength: data_row.strength ? data_row.strength : null
                });
            }else{
              // add the new key
              dataset_map.set( data_row.name, [{
                  date: data_row.time,
                  degree: data_row.value,
                  strength: data_row.strength ? data_row.strength : null
                }]
              );
            }

            _date_array.push( data_row.time );

            if (purge_old_data) {
              var last_index = 0;
              // remove old dataset
              dataset_map.values().forEach(function(_d){
                last_index = 0;

                if ( (now - new Date(_d[0].date).getTime() ) > dataAge )  {
                  //_d.splice(0, 1);
                }

              });

              if ( (now - new Date(_date_array[0]).getTime() ) > dataAge ) {
                _date_array.splice(0,1);
              }

            }

            // update viz
            sonar.update();

        }

        return sonar;

    }
  
})();

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
}
d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
}