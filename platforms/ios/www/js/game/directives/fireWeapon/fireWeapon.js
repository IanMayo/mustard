angular.module('subtrack90.game.fireWeaponDirective', [])

.directive('fireWeapon', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        scope: {
            ownship: '='
        },
        templateUrl: 'js/game/directives/fireWeapon/fireWeapon.tpl.html',
        link: function (scope) {

            // whether we have heading-oriented weapons
            scope.showStraight = false;

            // whether we have sonar-oriented weapons
            scope.showSonar = false;

            // how many sonar-oriented weapons we're have remaining
            scope.sonarCount = 0;

            // how many heading-oriented weapons we hvae remaining
            scope.straightCount = 0;

            // the id of the designated osnar track
            scope.detectionTrackId = null;

            // the heading-oriented weapon
            var straightWeapon;

            // the sonar-oriented weapon
            var sonarWeapon;

            var fireWeapon = function (state, course, template) {

                // check ownship has actions array
                if (!state.actions) {
                    state.actions = [];
                }

                // use a cloned weapon template
                var weaponTemplate = angular.copy(template);

                // register request to fire
                var name = _.uniqueId("W_");
                state.actions.push({"type": "FIRE_WEAPON", "name": name,
                    "course": course, "template": weaponTemplate});

                // hey, play that sound!
                document.getElementById("fireSound").play();

            };

            scope.doFireStraight = function () {

                // 'Safe' $apply
                $timeout(function () {
                    if (scope.straightCount > 0) {
                        scope.straightCount--;
                        fireWeapon(scope.ownship.state, scope.ownship.state.course, straightWeapon.template);
                    }
                });
            };
            scope.doFireSonar = function () {

                // 'Safe' $apply
                $timeout(function () {

                        // ok, find the last bearing on the relevant track
                        var dets = scope.ownship.newDetections;

                        // find the one for the releveant track
                        var thisD = _.find(dets, function (det) {
                            return det.trackId == scope.detectionTrackId
                        });

                        if (thisD) {
                            if (scope.sonarCount > 0) {
                                scope.sonarCount--;
                                fireWeapon(scope.ownship.state, thisD.bearing, sonarWeapon.template);
                            }
                        }
                        else {
                            scope.enableSonarFire = false;
                        }
                    }
                );
            };


            /**
             * Change sonar bearing lines for a selected track only
             */
            scope.$on('shareSelectedTrack', function (event, trackId) {
                scope.detectionTrackId = trackId;
            });

            // initialise - see if ownship has weapons
            if (scope.ownship.weapons) {
                var wList = scope.ownship.weapons;
                var straightWeapon = _.find(wList, function (weapon) {
                    return weapon.type == "OWNSHIP_HEADING"
                });
                scope.showStraight = straightWeapon;
                scope.straightCount = straightWeapon.count;

                var sonarWeapon = _.find(wList, function (weapon) {
                    return weapon.type == "SONAR_CONTACT"
                });
                scope.showSonar = sonarWeapon;
                scope.sonarCount = sonarWeapon.count;

            }
        }
    };
}]);
