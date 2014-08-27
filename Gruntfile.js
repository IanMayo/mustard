module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-json-schema');
    grunt.loadTasks('./tasks');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /**
         * It creates missions index based on scenario files also it adds correct guidance path to each mission
         *
         * @example
         * $ grunt missionsIndex
         * or
         * $ grunt missionsIndex --src=[scenario files path] --output=[missions index output file path]
         * --guidanceDir=[path to the guidance dir]
         */
        missionsIndex: {
            options: {
                src: 'www/js/game/scenarios/*.json',
                guidanceDir: 'guidance/processed/',
                output: 'www/js/app/missionsIndex/missionsIndex.json'
            }
        },

        /**
         * It replaces src paths in the source guidance files and produce new files with replaced src
         *
         * @example
         * $ grunt replace:guidance
         */
        replace: {
            guidance: {
                src: ['www/guidance/*.html'],
                dest: 'www/guidance/processed/',
                replacements: [{
                    from: 'src="img/',
                    to: 'src="guidance/img/'
                }]
            }
        },

        /**
         * It validates all the scenario files against the schema.
         */
        json_schema: {
            test: {
                options: {
                    validateFormatsStrict: true
                },
                files: {
                    'www/js/game/scenarios/schemas/mission.json':
                        ['www/js/game/scenarios/*_*.json']
                }
            }
        }

    });

    grunt.registerTask('build', ['missionsIndex', 'replace:guidance']);
    grunt.registerTask('validate', ['json_schema:test']);
};