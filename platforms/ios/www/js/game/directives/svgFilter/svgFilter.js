/**
 * @module subtrack90.game.svgFilter
 */

angular.module('subtrack90.game.svgFilter', [])

.constant('svgFilterConfig', {
    blurFilterName: 'blurElement'
})

.directive('svgFilter', ['svgFilterConfig', 'IS_MOBILE', function (svgFilterConfig, IS_MOBILE) {
    return {
        restrict: 'EA',
        link: function (scope, el) {
            if (!IS_MOBILE) {
                addSvgFilter();
            }

            function addSvgFilter() {
                var svg = d3.select(el[0])
                    .append('svg')
                    .style({height: '0', width: 0, position: 'absolute'});

                addDefsElement(svg);
            }

            function addDefsElement(svg) {
                var defs = svg
                    .append('defs');

                addFilter(defs)
            }

            function addFilter(defs) {
                var filter = defs.append('filter')
                        .attr('id', svgFilterConfig.blurFilterName);

                filter.append('feConvolveMatrix')
                    .attr('result', 'convolve')
                    .attr('order', '10,1')
                    .attr('kernelMatrix', '1 1 1 1 1 1 1 1 1 1');

                filter.append('feBlend')
                    .attr('in', 'SourceGraphic')
                    .attr('in2', 'convolve')
                    .attr('mode', 'screen');
            }
        }
    }
}]);
