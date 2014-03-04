angular.module('mustard.app.main', [])

/**
 * @module Main
 * @class MainCtrl (controller)
 */
  .controller('MainCtrl', function ($scope, $location) {

    $scope.levels =
      [
        {"name": "Tutorial", "missions": [
          {"name": "Learner Driver", "description": "Learn to drive, on the tracked range", "url": "1a_drive_vessel"},
          {"name": "Reading Bearings", "description": "Learn to trail a bearing", "url": "1b_read_bearings"},
          {"name": "Handling ambiguity", "description": "Intro to ambiguous bearings", "url": "1c_resolve_ambiguity"},
          {"name": "Advanced Ambiguity", "description": "More advanced ambiguous bearings", "url": "1d_resolve_ambiguity_2"}
        ]},
        {"name": "Self Noise", "missions": [
          {"name": "Elementary Self Noise", "description": "An introduction to self-noise", "url": "2a_intro_self_noise"},
          {"name": "Full Self Noise", "description": "Full self-noise characteristics", "url": "2b_full_self_noise"},
          {"name": "Advanced Self Noise", "description": "Advanced Self Noise", "url": "2c_adv_self_noise"},
          {"name": "Self Noise Extra", "description": "More challenging self noise", "url": "2d_more_self_noise"}
        ]},
        {"name": "Active Targets", "missions": [
          {"name": "Fleeing Target", "description": "Trailing a fleeing target", "url": "3a_fleeing_target"},
          {"name": "Attacking Target", "description": "Evading an attacking target", "url": "3b_attacking_target"}
        ]},
        {"name": "Complex Operating Areas", "missions": [
          {"name": "Merchant in area", "description": "Handling a cargo ship in the training area", "url": "6a_merchant"},
          {"name": "White Shipping", "description": "Handling multiple ships in the training area", "url": "6b_merchant_and_fisherman"}
        ]},
        {"name": "Complex Sonar", "missions": [
          {"name": "Unsteady Array", "description": "The effects of the array being unsteady", "url": "7a_array_unsteady"}
        ]}
      ];

    $scope.moveToMission = function (id) {
      $location.path('mission/' + id);
    };
  });
