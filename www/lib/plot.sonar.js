/**
 * plot.sonar.js
 * =====================
 * This is packager to create a dual-scaled sonar plot
 * using d3.sonar.js
 *
 * =====================
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

(function(exports){

	function PlotSonar(argument) {

    /**
     *  Private variables
     */

    // flags
    var data_updation_interval = 1000,  // in milliseconds
        UPDATE_STEP = 10000, // 2 seconds
        FIRST_RUN_TIME
        ;


    // store data temporarily
    var past_time_jar_set = [],
        active_timers = []
        ;

    // viz holders
    var sonar_minor_viz,
        sonar_major_viz;

    // --------------------------------------------------------------

    /**
     *  Public variables
     */

    var options = {
      sonar_el : document.querySelector("#viz-container"),
      major_el : document.querySelector("#viz-major"),
      minor_el : document.querySelector("#viz-minor"),
      PAST_TIME_JAR : 19 * 60 * 1000, // 19 minutes in milliseconds
      LIVE_TIME_JAR : 1 * 60 * 1000, // 1 minute in milliseconds
      colors : {
        indicator: "#aace00",
        heading: "#1A68DB"
      }
    };

    var addSelectionListener = function( listener ) {
      console.log(listener);
    }

		function x_special_case(d) {
			return (d <= 180) ? ((d+180) === 360 ? 0: (d+180)) : d-180;
		}

		function x_special_case_inverse(d) {
			var _d = (d <= 180) ? d+180 : d-180;
			return _d;
		}

    function main() {}

    function _addHeading(time, bearing) {
  
      var data = {
          name: 'Heading',
          time: time,
          value: bearing,
          strength: getRandomInt(9,10),
          is_heading: true
      }

      // add to dataset
      past_time_jar_set.push(data);

      sonar_minor_viz
        .purgeOldData(true)
        .addHeading(data);

      _add_data_to_major_viz();

      return main;
    }

    function _addDetection(time, seriesName, bearing, strength){
      
      var data = {
          name: seriesName,
          time: time,
          value: bearing,
          strength: strength,
          is_detection: true
      }

      // add to dataset
      past_time_jar_set.push(data);

      sonar_minor_viz
        .purgeOldData(true)
        .addDetection(data);

      _add_data_to_major_viz();

      return main;
    }
    
    function _add_data_to_major_viz(){
      var latest = d3.max( past_time_jar_set, function(d){ return d.time; });

      // data points which need to go to past data viz
      var push_past_time_jar_set = past_time_jar_set.filter(function(d){ 
        return ( ( new Date(latest).getTime() - new Date(d.time).getTime() ) >= options.LIVE_TIME_JAR );
      });
      
      past_time_jar_set = past_time_jar_set.filter(function(d){ 
        return ( ( new Date(latest).getTime() - new Date(d.time).getTime() ) < options.LIVE_TIME_JAR );
      });

      push_past_time_jar_set.forEach(function(d,i){
        
        if ( d.is_heading ) {
          sonar_major_viz
            .purgeOldData(true)
            .addHeading(d);
        }else{
          sonar_major_viz
            .purgeOldData(true)
            .addDetection(d);
        };

      });
      latest=null;
      push_past_time_jar_set=null;
    }

    function _bind_events(){
      $(window).resize(function(e){
        _resize();
      });
    }

    function _resize() {
      // make sure major viz is 75% of total height and minor viz is 25%
      var h = $(window).height(); // this can be a parent container for e.g. viz-container

      $(options.sonar_el).height( h*0.75 );  // let's always set this to be 75% of window height

      h = h*0.75;
      
      $(options.minor_el).height( Math.floor(h*0.25) );
      $(options.major_el).height( Math.floor(h*0.75) );
    }

    /**
     *  CreatePlot - Main function where everything is initiated
     */
    main.createPlot = function(){
     
      // Minor Viz
      sonar_minor_viz = d3.sonar()
        .container_el(options.minor_el)
        .xTickValues([0,45,90,135,180,225,270,315,360])
        .xTickFormat(
          function (d) {
            return (d <= 180) ? ((d+180) === 360 ? 0: (d+180)) : d-180;
          }
        )
        .xTickFormatInverse(
          function (d) {
            return (d <= 180) ? d+180 : d-180;
          }
        )
        .yTicks(4)
        .headingKeys({
          x: 'degree',
          y: 'date'
        })
        .detectionKeys({
          x: 'degree',
          y: 'date'
        })
        .margin({top: 25, left: 100, bottom: 5, right: 50})
        .dataAge(options.LIVE_TIME_JAR)
        .colors(options.colors)
        .yAxisLabel("")
        .onclick(addSelectionListener);

      // Major Viz
      sonar_major_viz = d3.sonar()
        .container_el(options.major_el)
        .xTickValues([0,45,90,135,180,225,270,315,360])
        .xTickFormat(
          function (d) {
            return (d <= 180) ? ((d+180) === 360 ? 0: (d+180)) : d-180;
          }
        )
        .xTickFormatInverse(
          function (d) {
            return (d <= 180) ? d+180 : d-180;
          }
        )
        .yTicks(8)
        .headingKeys({
          x: 'degree',
          y: 'date'
        })
        .showXAxis(false)
        .margin({top: 0, left: 100, bottom: 10, right: 50})
        .detectionKeys({
          x: 'degree',
          y: 'date'
        })
        .dataAge(options.PAST_TIME_JAR)
        .colors(options.colors)
        .onclick(addSelectionListener);
      
      // begin

      // init minor viz
      sonar_minor_viz();
      
      // update dimensions
      _resize();

      _bind_events();

      return main;
    }

    main.addSelectionListener = function(_) {
      if (!arguments.length) { return main; };  // no parameters, return main

      addSelectionListener = _;
      return main;
    }

    main.addDetection = function(time, seriesName, bearing, strength) {
      if (!arguments.length) { return main; };  // no parameters, return main
      
      return _addDetection(time, seriesName, bearing, strength);
    }

    main.addHeading = function(time, bearing) {
      if (!arguments.length) { return main; };  // no parameters, return main

      return _addHeading(time, bearing);
    }

    main.options = function(_){
      if (!arguments.length) { return options };

      $.extend( options, _ );

      return main;
    }

    main.major_viz = function(){
      return sonar_major_viz;
    }

    main.minor_viz = function(){
      return sonar_minor_viz;
    }

		return main;
		
	}

	exports.PlotSonar = PlotSonar;

})(window);