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
      'center':{'lat':49,'lng':-9}
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
      clear: function()
      {
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