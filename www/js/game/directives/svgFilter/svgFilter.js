/**
 * @module subtrack90.game.svgFilter
 */

angular.module('subtrack90.game.svgFilter', [])

.constant('svgFilterConfig', {
    blurFilterName: 'blurElement'
})

.directive('svgFilter', ['svgFilterConfig', function (svgFilterConfig) {
    return {
        restrict: 'EA',
        template: '<select ng-model="svgFilter" ng-options="filter as filter.name for filter in filters"></select>',
        link: function (scope, el) {
            var svgContainer = d3.select(el[0])
                .append('svg')
                .style({height: '0', width: 0, position: 'absolute'});

            var defs = svgContainer
                .append('defs');

            var filter;

            function emptyFilter() {
                removeFilter();
            }

            function blurFilter() {
                addFilter();
                filter.append('feGaussianBlur')
                    .attr({'in': 'SourceGraphic', 'stdDeviation': '2' })
            }

            function blendBlurFilter() {
                addFilter();
                filter.append('feOffset')
                    .attr({
                        'in': 'SourceGraphic',
                        'result': 'offset',
                        'dx': '2',
                        'dy': '2'
                    });

                filter.append('feGaussianBlur')
                    .attr({'in': 'SourceGraphic', 'stdDeviation': '2' })
                    .attr('result', 'blur');

                filter.append('feBlend')
                    .attr('in', 'blur')
                    .attr('in2', 'SourceGraphic')
                    .attr('mode', 'screen');
            }

            function compositeFilter() {
                addFilter();
                filter.append('feGaussianBlur')
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
                addFilter();
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
                addFilter();
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
                        name: 'none',
                        handler: emptyFilter
                    },
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
                scope.svgFilter = scope.filters[4];
                el.css({display: 'block', position: 'absolute', right: '20px', top: '30px', zIndex: 1000});

                scope.$watch('svgFilter', function (selectedFilter) {
                    selectedFilter.handler.call();
                });
            }

            function removeFilter() {
                $('g[filter="url(#' + svgFilterConfig.blurFilterName + ')"]').each(function (i, el) {
                    el.removeAttribute('filter');
                    el.setAttribute('removed-filter', '');
                });

                if (filter) {
                    filter.remove();
                    filter = null;
                }
            }

            function addFilter() {
                if (!filter) {
                    filter = defs.append('filter')
                        .attr('id', svgFilterConfig.blurFilterName);
                }

                $(filter[0][0]).empty();

                $('g[removed-filter]').each(function (i, el) {
                    el.removeAttribute('removed-filter');
                    el.setAttribute('filter', 'url(#' + svgFilterConfig.blurFilterName + ')');
                });
            }

            filterList();
        }
    }
}]);
