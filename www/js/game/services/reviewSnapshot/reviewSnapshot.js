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
      'vessels': {
        'ownShip': {"categories": {
          "force": "BLUE",
          "environment": "SURFACE",
          "type": "WARSHIP"
        }, "track": [
          {'time': 0, 'lat': 48.8, 'lng': -9, 'course': 120},
          {'time': 2000, 'lat': 48.8, 'lng': -9.6, 'course': 120},
          {'time': 4000, 'lat': 48.7, 'lng': -9.4, 'course': 130},
          {'time': 6000, 'lat': 48.4, 'lng': -9.6, 'course': 160},
          {'time': 8000, 'lat': 48.5, 'lng': -9.2, 'course': 180}
        ]
        },
        'Target': {"categories": {
          "force": "RED",
          "environment": "SUBSURFACE",
          "type": "SUBMARINE"
        }, "track": [
          {'time': 0, 'lat': 48.8, 'lng': -9, 'course': 234},
          {'time': 2000, 'lat': 48.3, 'lng': -9.1, 'course': 123},
          {'time': 4000, 'lat': 48.7, 'lng': -9.2, 'course': 114},
          {'time': 6000, 'lat': 48.2, 'lng': -9.2, 'course': 121},
          {'time': 8000, 'lat': 48.9, 'lng': -9.5, 'course': 155}
        ]}
      }
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