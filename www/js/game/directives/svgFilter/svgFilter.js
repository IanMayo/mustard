/**
 * @module subtrack90.game.svgFilter
 */

angular.module('subtrack90.game.svgFilter', [])

.constant('svgFilterConfig', {
    blurFilterName: 'blurElement'
})

.directive('svgFilter', function () {
    return {
        restrict: 'EA',
        link: function (scope, el) {
            var blurFilterName = 'blurElement';
            var svgContainer = d3.select(el[0])
                .append('svg')
                .style({height: '0', width: 0, position: 'absolute'});

            var defs = svgContainer
                .append('defs');

            var filter = defs.append('filter')
                .attr('id', blurFilterName);

            var feConvolve = filter.append('feConvolveMatrix')
                .attr('result', 'out1');

            var filterType = 5;
            var matrix;
            var order;
            var blendMode;

            switch (filterType) {
                case 1:
                    order = '3';
                    matrix = '1 1 1 1 1 1 1 1 1';
                    break;
                case 2:
                    order = '3';
                    matrix = '1 0 0 0 0 0 0 0 1';
                    break;
                case 3:
                    order = '10,1';
                    matrix = '1 1 1 1 1 1 1 1 1 1';
                    break;
                case 4:
                    order = '1,10';
                    matrix = '1 1 1 1 1 1 1 1 1 1';
                    break;
                case 5:
                    order = '10,1';
                    matrix = '1 1 1 1 1 1 1 1 1 1';
                    blendMode = 'screen';
                    break;
                case 6:
                    order = '10,1';
                    matrix = '0 0 0 0 0 1 1 1 1 1';
                    blendMode = 'screen';
                    break;
            }

            feConvolve
                .attr('kernelMatrix', matrix)
                .attr('order', order);

            if (blendMode) {
                filter.append('feBlend')
                    .attr('in', 'SourceGraphic')
                    .attr('in2', 'out1')
                    .attr('mode', blendMode);
            }
        }
    }
});
