/**
 * @module Review Snapshot - store a package of data, for the review stage
 */

angular.module('mustard.game.reviewSnapshot', [])

/**
 * @module Decision
 * @class Service
 * @description Decision service
 */

  .service('reviewSnapshot', function () {

    var snapshot = {
      'center': {'lat': 49, 'lng': -9},
      "period": [0, 8000],
      "stepTime": 2000,
      'vessels': {
        'Ownship': {"categories": {
          "force": "BLUE",
          "environment": "SURFACE",
          "type": "WARSHIP"
        }, "track": [
          {'time': 0, 'lat': 48.8, 'lng': -9, 'course': 120, 'speed': 6},
          {'time': 2000, 'lat': 48.8, 'lng': -9.6, 'course': 120, 'speed': 5},
          {'time': 4000, 'lat': 48.7, 'lng': -9.4, 'course': 130, 'speed': 4},
          {'time': 6000, 'lat': 48.4, 'lng': -9.6, 'course': 160, 'speed': 3},
          {'time': 8000, 'lat': 48.5, 'lng': -9.2, 'course': 180, 'speed': 2}
        ]
        },
        'Target': {"categories": {
          "force": "RED",
          "environment": "SUBSURFACE",
          "type": "SUBMARINE"
        }, "track": [
          {'time': 0, 'lat': 48.8, 'lng': -9, 'course': 234, 'speed': 4},
          {'time': 2000, 'lat': 48.3, 'lng': -9.1, 'course': 123, 'speed': 6},
          {'time': 4000, 'lat': 48.7, 'lng': -9.2, 'course': 114, 'speed': 4},
          {'time': 6000, 'lat': 48.2, 'lng': -9.2, 'course': 121, 'speed': 2},
          {'time': 8000, 'lat': 48.9, 'lng': -9.5, 'course': 155, 'speed': 1}
        ]}
      },
      'narratives': [
        {"dateTime": 174000, "location": {"lat": 50, "lng": -8.150786874468986}, "message": "Gained contact with target"},
        {"dateTime": 374000, "location": {"lat": 50.01, "lng": -8.100786874468986}, "message": "Some other event"},
        {"dateTime": 1106000, "location": {"lat": 50.033531725296776, "lng": -8.131101827320393}, "message": "Lost contact with target"}
      ],
      'objectives': [
        {
          "name": "Driving Exam",
          "type": "SEQUENCE",
          "children": [
            {
              "name": "Newbie achievement",
              "type": "ELAPSED",
              "time": 30,
              "achievement": {
                "name": "Newbie",
                "message": "You've started your first mission, well done!"
              }
            },
            {
              "name": "Conduct Noise Checks",
              "description": "Travel to rendez-vous point A for noise checks",
              "type": "PROXIMITY",
              "location": {
                "lat": 50,
                "lng": -8.06
              },
              "range": 2000,
              "success": "Ok checks done. Sorry they took so long. Let's get that array fitted. We're running a bit late, so you need to within 1km of the barge (about 20 miles North of here) carrying your array within 30 mins. You must be doing approx North course at under 3 knots for the transfer to happen. There's quite a rush, you'll probably need to travel at about 20 knots. Hey, you there's a unit citation on offer if you can do it under 25 minutes"
            },
            {
              "name": "Get Towed Array Fitted",
              "description": "Travel to Sonar Fitting barge",
              "type": "PROXIMITY",
              "location": {
                "lat": 50.2,
                "lng": -8.20
              },
              "range": 1000,
              "elapsed": 1800,
              "course": 0,
              "courseError": 10,
              "bonusAchievementTime": 1500,
              "bonusAchievement": {
                "name": "Speed Demon",
                "message": "Hey, you beat 25 minutes, speed freak!"
              },
              "maxSpeed": 3,
              "success": "Well done, you made it. Let's get the array fitted and move on. Why not sail around for a few minutes to get the hang of the array.",
              "failure": "Sorry, you didn't make it in time. You'll have to restart this mission",
              "achievement": {
                "name": "Driver",
                "message": "You're now a qualified driver. Good luck"
              }
            },
            {
              "name": "Array Handling Experience",
              "type": "ELAPSED",
              "time": 240,
              "success": "Stop!\n\nIntruder in training ground!\n\nYou haven't got any weapons loaded, but we really need to capture him.  The best we can offer is that you'll have to ram him and bring him to the surface. Chase him down the bearing (as shown on the sonar display), and destroy the b*stard!  You may have to increase speed to catch him, but if you go too fast you won't be able to hear him.",
              "successAction": {
                "type": "ACTIVATE_SONAR",
                "subject": "Ownship",
                "sonar": "BASIC_TOWED",
                "disabled": false
              }
            },
            {
              "name": "Secret Quest",
              "description": "Get within 200 of Target vessel",
              "type": "PROXIMITY",
              "target": "Target",
              "range": 200,
              "success": "Ker-Splash. Well, I think we came off better than him!",
              "achievement": {
                "name": "Ram Raider",
                "message": "Well, it's not the most refined weapon, but you've mastered it."
              }
            }
          ]}
      ]
    };

    /**
     * Module API
     */
    return {
      /** retrieve the stored snapshot
       *
       * @returns {*}
       */
      get: function () {
        return snapshot;
      },

      /** clear the snapshot
       *
       */
      clear: function () {
        delete snapshot;
      },

      /** store a new snapshot
       *
       * @param newSnapshot
       */
      put: function (newSnapshot) {
        snapshot = newSnapshot;
      },

      /** if a snapshot is present
       *
       * @returns {*}
       */
      isPresent: function () {
        return (snapshot != null);
      }
    }
  }
);