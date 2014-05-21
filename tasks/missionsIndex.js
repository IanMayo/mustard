'use strict';

/**
 * Missions index task
 *
 * @param grunt
 */

module.exports = function(grunt) {

    var _ = require('lodash');

    grunt.registerTask('missionsIndex', 'Create missions index', function () {

        /**
         * Path to the scenario files
         *
         * @type {String|Array}
         */
        var src = grunt.option('src') || this.options().src;

        /**
         * Path to the "mission-index" file
         *
         * @type {String}
         */
        var output = grunt.option('output') || this.options().output;

        /**
         * Path to the guidanceDir dir
         *
         * @type {String}
         */
        var guidanceDir = grunt.option('guidanceDir') || this.options().guidanceDir;

        /**
         * Array of scenario files
         * @type {Array}
         */
        var filesSrc = grunt.file.expand(src);

        /**
         * Check if current item is level
         *
         * @param item
         * @returns {Boolean}
         */
        var isLevel = function (item) {
            return /^\d+$/.test(item.id);
        };

        /**
         * Check if current item is mission
         *
         * @param item
         * @returns {Boolean}
         */
        var isMission = function (item) {
            return /^\d+\D+$/.test(item.id);
        };

        /**
         * It takes absolute path to the file and returns name of this file without extension
         *
         * @param url
         * @returns {String}
         */
        var getFileNameWithoutExtension = function (url) {
            var urlBits = url.split('/');
            var fileName = urlBits[urlBits.length - 1];

            return fileName.substr(0, fileName.lastIndexOf('.'));
        };

        /**
         * It reads scenario files and returns raw collection of levels/mission data
         *
         * @returns {Array}
         */
        var processScenarioFiles = function (files) {
            var rawList = [];

            files.forEach(function (absolutePath) {
                rawList.push(
                    _.extend({
                        _url_: absolutePath
                    }, grunt.file.readJSON(absolutePath))
                );
            });

            return rawList;
        };

        /**
         * It gets the levels from raw levels/mission collection then it returns array with them inside
         *
         * @param rawList
         * @returns {Array}
         */
        var processLevels = function (rawList) {
            var levelIndex = [];

            rawList.forEach(function (level) {
                if (!isLevel(level)) {
                    return;
                }

                levelIndex.push({
                    id: level.id,
                    name: level.name,
                    missions: []
                });
            });

            return levelIndex;
        };

        /**
         * It gets the missions from raw levels/mission collection then it adds them to the array with levels
         *
         * @param rawList
         * @param levelIndex
         * @returns {Array}
         */
        var processMissions = function (rawList, levelIndex) {
            var missionsIndex = levelIndex;

            rawList.forEach(function (mission) {
                if (!isMission(mission)) {
                    return;
                }

                var rootId = mission.id.match(/\d+/g)[0];
                var rootIndex = _.findIndex(missionsIndex, function (mission) {
                    return mission.id === rootId;
                });

                if (!~rootIndex) {
                    return;
                }

                var fileName = getFileNameWithoutExtension(mission._url_);

                missionsIndex[rootIndex].missions.push({
                    id: mission.id,
                    name: mission.name,
                    description: mission.description,
                    url: fileName,
                    guidanceUrl: guidanceDir + fileName + '.html'
                });
            });

            return missionsIndex;
        };

        /**
         * It calls the processScenarioFiles, processLevels, processMissions methods in the right order and
         * then it writes the "mission-index" to the JSON file
         */
        var createMissionsIndex = function () {
            var rawList = processScenarioFiles(filesSrc);
            var levelIndex = processLevels(rawList);
            var missionsIndex = processMissions(rawList, levelIndex);

            grunt.file.write(output, JSON.stringify(missionsIndex, null, 4));
        };

        createMissionsIndex();
    });
};
