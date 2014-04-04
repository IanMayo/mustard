angular.module('mustard.game.objectiveListDirective', [])

.directive('objectiveList', function () {
    return {
        restrict: 'EA',
        scope: {
            objectives: '='
        },
        templateUrl: 'js/game/directives/objectiveList/objectiveList.tpl.html',
        link: function (scope) {

            /** filter used to only show objectives that have a success/fail criteria
             *
             * @param objective
             * @returns {success}
             */
            scope.canSucceed = function (objective) {
                return objective.success || objective.failure;
            }
        }
    };
});
