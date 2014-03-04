angular.module('mustard.app.main', [])

/**
 * @module Main
 * @class MainCtrl (controller)
 */
  .controller('MainCtrl', function ($scope, $location) {

    $scope.levels =
      [
        {"name": "Tutorial", "missions": [
          {"name": "Learner Driver", "description": "Learn to drive, on the tracked range", "url": "1a_drive_vessel.json"},
          {"name": "Reading Bearings", "description": "Learn to trail a bearing", "url": "1b_read_bearings.json"},
          {"name": "Handling ambiguity", "description": "Intro to ambiguous bearings", "url": "1c_resolve_ambiguity.json"},
          {"name": "Advanced Ambiguity", "description": "More advanced ambiguous bearings", "url": "1d_resolve_ambiguity_2.json"}
        ]},
        {"name": "Self Noise", "missions": [
          {"name": "Elementary Self Noise", "description": "An introduction to self-noise", "url": "2a_intro_self_noise.json"},
          {"name": "Full Self Noise", "description": "Full self-noise characteristics", "url": "2b_full_self_noise.json"},
          {"name": "Advanced Self Noise", "description": "Advanced Self Noise", "url": "2c_adv_self_noise.json"},
          {"name": "Self Noise Extra", "description": "More challenging self noise", "url": "2d_more_self_noise.json"}
        ]},
        {"name": "Active Targets", "missions": [
          {"name": "Fleeing Target", "description": "Trailing a fleeing target", "url": "3a_fleeing_target.json"},
          {"name": "Attacking Target", "description": "Evading an attacking target", "url": "3b_attacking_target.json"}
        ]},
        {"name": "Complex Operating Areas", "missions": [
          {"name": "Merchant in area", "description": "Handling a cargo ship in the training area", "url": "6a_merchant.json"},
          {"name": "White Shipping", "description": "Handling multiple ships in the training area", "url": "6b_merchant_and_fisherman.json"}
        ]},
        {"name": "Complex Sonar", "missions": [
          {"name": "Unsteady Array", "description": "The effects of the array being unsteady", "url": "7a_array_unsteady.json"}
        ]}
      ];

    $scope.moveToMission = function (id) {
      $location.path('mission/' + id);
    };
  });