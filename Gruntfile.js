module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadTasks('./tasks');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        missionsIndex: {
            options: {
                src: 'www/js/game/scenarios/*.json',
                guidanceDir: 'guidance/processed/',
                output: 'www/js/app/missionsIndex/missionsIndex.json'
            }
        },

        replace: {
            guidance: {
                src: ['www/guidance/*.html'],
                dest: 'www/guidance/processed/',
                replacements: [{
                    from: 'src="img/',
                    to: 'src="guidance/img/'
                }]
            }
        }
    });

    grunt.registerTask('build', ['missionsIndex', 'replace:guidance']);
};
