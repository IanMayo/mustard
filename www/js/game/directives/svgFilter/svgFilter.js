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
        template: '<select ng-model="svgFilter" ng-options="filter as filter.name for filter in filters"></select>',
        link: function (scope, el) {
            var blurFilterName = 'blurElement';
            var svgContainer = d3.select(el[0])
                .append('svg')
                .style({height: '0', width: 0, position: 'absolute'});

            var defs = svgContainer
                .append('defs');

            var filter = defs.append('filter')
                .attr('id', blurFilterName);

            function blurFilter() {
                removeFilter();
                var feGaussianBlur = filter.append('feGaussianBlur')
                    .attr({'in': 'SourceGraphic', 'stdDeviation': '2' })
            }

            function blendBlurFilter() {
                removeFilter();

                filter.append('feOffset')
                    .attr({
                        'in': 'SourceGraphic',
                        'result': 'offset',
                        'dx': '2',
                        'dy': '2'
                    });

                var feGaussianBlur = filter.append('feGaussianBlur')
                    .attr({'in': 'SourceGraphic', 'stdDeviation': '2' })
                    .attr('result', 'blur');

                filter.append('feBlend')
                    .attr('in', 'blur')
                    .attr('in2', 'SourceGraphic')
                    .attr('mode', 'screen');
            }

            function compositeFilter() {
                removeFilter();
                var feGaussianBlur = filter.append('feGaussianBlur')
                    .attr({'in': 'SourceGraphic', 'stdDeviation': '2' })
                    .attr('result', 'blur');

                filter.append('feComposite')
                    .attr({
                        'in2': 'blur',
                        'in': 'SourceGraphic',
                        'operator': 'arithmetic',
                        'k1': 0,
                        'k2': .5,
                        'k3': .6,
                        'k4': 0
                    });
            }

            function convolveFilter() {
                removeFilter();
                filter.append('feConvolveMatrix')
                        .attr('result', 'convolve')
                        .attr('order', '10,1')
                        .attr('kernelMatrix', '1 1 1 1 1 1 1 1 1 1');

                filter.append('feBlend')
                    .attr('in', 'SourceGraphic')
                    .attr('in2', 'convolve')
                    .attr('mode', 'screen');
            }

            function convolveNoiseFilter() {
                removeFilter();
                filter.append('feConvolveMatrix')
                        .attr('result', 'convolve')
                        .attr('order', '10,1')
                        .attr('kernelMatrix', '1 1 0 0 0 0 1 1 1 1');

                filter.append('feBlend')
                    .attr('in', 'SourceGraphic')
                    .attr('in2', 'convolve')
                    .attr('mode', 'screen');
            }

            function filterList() {
                scope.filters = [
                    {
                        name: 'blur',
                        handler: blurFilter
                    },
                    {
                        name: 'blur + blend',
                        handler: blendBlurFilter
                    },
                    {
                        name: 'composite',
                        handler: compositeFilter
                    },
                    {
                        name: 'convolve',
                        handler: convolveFilter
                    },
                    {
                        name: 'convolve + noise',
                        handler: convolveNoiseFilter
                    }
                ];
                scope.svgFilter = scope.filters[0];
                el.css({display: 'block', position: 'absolute', right: '20px', top: '30px', zIndex: 1000});

                scope.$watch('svgFilter', function (selectedFilter) {
                    selectedFilter.handler.call();
                });
            }

            function removeFilter() {
                $(filter[0][0]).empty();
            }

            filterList();
        }
    }
});
