module.exports = function(grunt) {

  'use strict';

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var path = require('path');
  var config = {

    /**
     * Pull in the package.json file so we can read its metadata.
     */
    pkg: grunt.file.readJSON('bower.json'),

    /**
     * Set some src and dist location variables.
     */
    loc: {
      src: 'src',
      dist: 'dist'
    },

    /**
     * Bower: https://github.com/yatskevich/grunt-bower-task
     *
     * Set up Bower packages and migrate static assets.
     */
    bower: {
      cf: {
        options: {
          targetDir: '<%= loc.src %>/vendor/',
          install: false,
          verbose: true,
          cleanTargetDir: false,
          layout: function(type, component) {
            if (type === 'img') {
              return path.join('../static/img');
            } else if (type === 'fonts') {
              return path.join('../static/fonts');
            } else {
              return path.join(component);
            }
          }
        }
      }
    },

    /**
     * Concat: https://github.com/gruntjs/grunt-contrib-concat
     *
     * Concatenate cf-* Less files prior to compiling them.
     */
    concat: {
      'cf-less': {
        src: [
          '<%= loc.src %>/vendor/cf-*/*.less',
          '!<%= loc.src %>/vendor/cf-core/*.less',
          '<%= loc.src %>/vendor/cf-core/cf-core.less'
        ],
        dest: '<%= loc.src %>/static/css/capital-framework.less',
      },
      js: {
        src: [
          '<%= loc.src %>/vendor/jquery/jquery.js',
          '<%= loc.src %>/vendor/jquery.easing/jquery.easing.js',
          '<%= loc.src %>/vendor/cf-*/*.js',
          '!<%= loc.src %>/vendor/cf-*/Gruntfile.js',
          '<%= loc.src %>/static/js/app.js'
        ],
        dest: '<%= loc.dist %>/static/js/main.js'
      }
    },

    /**
     * Less: https://github.com/gruntjs/grunt-contrib-less
     *
     * Compile Less files to CSS.
     */
    less: {
      main: {
        options: {
          // The src/vendor paths are needed to find the CF components' files.
          // Feel free to add additional paths to the array passed to `concat`.
          paths: grunt.file.expand('src/vendor/*').concat([])
        },
        files: {
          '<%= loc.dist %>/static/css/main.css': ['<%= loc.src %>/static/css/main.less']
        }
      }
    },

    /**
     * Autoprefixer: https://github.com/nDmitry/grunt-autoprefixer
     *
     * Parse CSS and add vendor-prefixed CSS properties using the Can I Use database.
     */
    autoprefixer: {
      options: {
        // Options we might want to enable in the future.
        diff: false,
        map: false
      },
      main: {
        // Prefix `static/css/main.css` and overwrite.
        expand: true,
        src: ['<%= loc.dist %>/static/css/main.css']
      },
    },

    /**
     * Uglify: https://github.com/gruntjs/grunt-contrib-uglify
     *
     * Minify JS files.
     * Make sure to add any other JS libraries/files you'll be using.
     * You can exclude files with the ! pattern.
     */
    uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: true
      },
      // headScripts: {
      //   src: 'vendor/html5shiv/html5shiv-printshiv.js',
      //   dest: 'static/js/html5shiv-printshiv.js'
      // },
      js: {
        src: ['<%= loc.dist %>/static/js/main.js'],
        dest: '<%= loc.dist %>/static/js/main.min.js'
      }
    },

    /**
     * Banner: https://github.com/mattstyles/grunt-banner
     *
     * Here's a banner with some template variables.
     * We'll be inserting it at the top of minified assets.
     */
    banner:
      '/*!\n' +
      ' *  <%= pkg.name %> - v<%= pkg.version %>\n' +
      ' *  <%= pkg.homepage %>\n' +
      ' *  Licensed <%= pkg.license %> by <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
      ' */',

    usebanner: {
      css: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },
        files: {
          src: ['<%= loc.dist %>/static/css/*.min.css']
        }
      },
      js: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },
        files: {
          src: ['<%= loc.dist %>/static/js/*.min.js']
        }
      }
    },

    /**
     * CSS Min: https://github.com/gruntjs/grunt-contrib-cssmin
     *
     * Compress CSS files.
     */
    cssmin: {
      main: {
        options: {
          processImport: false
        },
        files: {
          '<%= loc.dist %>/static/css/main.min.css': ['<%= loc.dist %>/static/css/main.css'],
        }
      },
      'ie-alternate': {
        options: {
          processImport: false
        },
        files: {
          '<%= loc.dist %>/static/css/main.ie.min.css': ['<%= loc.dist %>/static/css/main.ie.css'],
        }
      }
    },

    /**
     * Legacssy: https://github.com/robinpokorny/grunt-legacssy
     *
     * Fix your CSS for legacy browsers.
     */
    legacssy: {
      'ie-alternate': {
        options: {
          // Flatten all media queries with a min-width over 960 or lower.
          // All media queries over 960 will be excluded fromt he stylesheet.
          // EM calculation: 960 / 16 = 60
          legacyWidth: 60
        },
        files: {
          '<%= loc.dist %>/static/css/main.ie.css': '<%= loc.dist %>/static/css/main.css'
        }
      }
    },

    /**
     * Copy: https://github.com/gruntjs/grunt-contrib-copy
     *
     * Copy files and folders.
     */
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: '<%= loc.src %>/static',
            src: [
              // Images
              'img/*'
            ],
            dest: '<%= loc.dist %>/static'
          },
          {
            expand: true,
            cwd: '<%= loc.src %>/static',
            src: [
              // Fonts
              'fonts/*'
            ],
            dest: '<%= loc.dist %>/static'
          },
          {
            expand: true,
            cwd: '<%= loc.src %>',
            src: [
              // Vendor files
              'vendor/html5shiv/html5shiv-printshiv.min.js',
              'vendor/box-sizing-polyfill/boxsizing.htc'
            ],
            dest: '<%= loc.dist %>/static'
          }
        ]
      }
    },

    /**
     * JSHint: https://github.com/gruntjs/grunt-contrib-jshint
     *
     * Validate files with JSHint.
     * Below are options that conform to idiomatic.js standards.
     * Feel free to add/remove your favorites: http://www.jshint.com/docs/#options
     */
    jshint: {
      options: {
        camelcase: false,
        curly: true,
        forin: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: true,
        sub: true,
        boss: true,
        strict: true,
        evil: true,
        eqnull: true,
        browser: true,
        plusplus: false,
        globals: {
          jQuery: true,
          $: true,
          module: true,
          require: true,
          define: true,
          console: true,
          EventEmitter: true
        }
      },
      all: ['<%= loc.src %>/static/js/app.js']
    },

    /**
     * Watch: https://github.com/gruntjs/grunt-contrib-watch
     *
     * Run predefined tasks whenever watched file patterns are added, changed or deleted.
     * Add files to monitor below.
     */
    watch: {
      default: {
        files: [
          'Gruntfile.js',
          '<%= loc.src %>/static/css/**/*.less',
          '<%= loc.src %>/static/js/**/*.js',
          '<%= loc.src %>/**/*.html'
        ],
        tasks: ['default']
      }
    },

    // Minifies html file
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          removeEmptyAttributes: true,
          removeCommentsFromCDATA: true,
          removeRedundantAttributes: true,
          collapseBooleanAttributes: true
        },
        files: {
          // Destination : Source
          'dist/index.min.html': 'dist/index.html'
        }
      }
    },

    nodemailer: {
      options: {
        transport: {
          type: 'sendmail',
          options: {}
        },
        message: {
          subject: 'CFPB email template test',
          text: 'Plain text message',
          html: '<body><h3>Testing distribution list email</h3><p>Please disregard :)</p></body>',
        },
        recipients: [
          // {
          //   email: 'scott.cranfill@cfpb.gov',
          //   name: 'Scott Cranfill'
          // },
          // {
          //   email: 'scott.cranfill@gmail.com',
          //   name: 'Scott Cranfill'
          // },
          // {
          //   name: 'Abanishe, Adebimpe (CFPB)',
          //   email: 'Adebimpe.Abanishe@cfpb.gov'
          // },
          // {
          //   name: 'Bacon, Stephen (Contractor)(CFPB)',
          //   email: 'Stephen.Bacon@cfpb.gov'
          // },
          // {
          //   name: 'Barton, William (CFPB)',
          //   email: 'William.Barton@cfpb.gov'
          // },
          // {
          //   name: 'Bates, Mollie (CFPB)',
          //   email: 'Mollie.Bates@cfpb.gov'
          // },
          // {
          //   name: 'Bellamy, Steven (CFPB)',
          //   email: 'Steven.Bellamy@cfpb.gov'
          // },
          // {
          //   name: 'Bond, Elizabeth (Contractor)(CFPB)',
          //   email: 'Elizabeth.Bond@cfpb.gov'
          // },
          // {
          //   name: 'Bradford, Anselm (CFPB)',
          //   email: 'Anselm.Bradford@cfpb.gov'
          // },
          // {
          //   name: 'Brown, Michael (Contractor)(CFPB)',
          //   email: 'Michael.Brown@cfpb.gov'
          // },
          // {
          //   name: 'Burks, Larry (CFPB)',
          //   email: 'Larry.Burks@cfpb.gov'
          // },
          // {
          //   name: 'Bush, Alvin (CFPB)',
          //   email: 'Alvin.Bush@cfpb.gov'
          // },
          // {
          //   name: 'Carbe, Joe (Contractor) (CFPB)',
          //   email: 'Joe.Carbe@cfpb.gov'
          // },
          // {
          //   name: 'Cesal, Amy (CFPB)',
          //   email: 'Amy.Cesal@cfpb.gov'
          // },
          // {
          //   name: 'Chang, Miklane (CFPB)',
          //   email: 'Miklane.Chang@cfpb.gov'
          // },
          // {
          //   name: 'Chen, Audrey (CFPB)',
          //   email: 'Audrey.Chen@cfpb.gov'
          // },
          // {
          //   name: 'Contolini, Christopher (CFPB)',
          //   email: 'Christopher.Contolini@cfpb.gov'
          // },
          // {
          //   name: 'Coster, Joseph (Contractor)(CFPB)',
          //   email: 'Joseph.Coster@cfpb.gov'
          // },
          // {
          //   name: 'Cranfill, Scott (CFPB)',
          //   email: 'Scott.Cranfill@cfpb.gov'
          // },
          // {
          //   name: 'Czosek, Virginia (CFPB)',
          //   email: 'Virginia.Czosek@cfpb.gov'
          // },
          // {
          //   name: 'Doguin, John Paul (CFPB)',
          //   email: 'JohnPaul.Doguin@cfpb.gov'
          // },
          // {
          //   name: 'Esher, Marc (CFPB)',
          //   email: 'Marc.Esher@cfpb.gov'
          // },
          // {
          //   name: 'Farman, Catherine (CFPB)',
          //   email: 'Catherine.Farman@cfpb.gov'
          // },
          // {
          //   name: 'Fatty, Lamin (CFPB)',
          //   email: 'Lamin.Fatty@cfpb.gov'
          // },
          // {
          //   name: 'Fitzgerald, Natalia (CFPB)',
          //   email: 'Natalia.Fitzgerald@cfpb.gov'
          // },
          // {
          //   name: 'Ford, Daniel (Contractor)(CFPB)',
          //   email: 'Daniel.Ford@cfpb.gov'
          // },
          // {
          //   name: 'Franklin, Lukass (CFPB)',
          //   email: 'Lukass.Franklin@cfpb.gov'
          // },
          // {
          //   name: 'Garcia, Desiree (Contractor) (CFPB)',
          //   email: 'Desiree.Garcia@cfpb.gov'
          // },
          // {
          //   name: 'Greisen, David (CFPB)',
          //   email: 'David.Greisen@cfpb.gov'
          // },
          // {
          //   name: 'Guhin, Benjamin (CFPB)',
          //   email: 'Benjamin.Guhin@cfpb.gov'
          // },
          // {
          //   name: 'Hall, Kimberley (Contractor)(CFPB)',
          //   email: 'Kimberley.Hall@cfpb.gov'
          // },
          // {
          //   name: 'Heberer, Candice (CFPB)',
          //   email: 'Candice.Heberer@cfpb.gov'
          // },
          // {
          //   name: 'Hicks, Bradley (CFPB)',
          //   email: 'Bradley.Hicks@cfpb.gov'
          // },
          // {
          //   name: 'Higgins, William (CFPB)',
          //   email: 'William.Higgins@cfpb.gov'
          // },
          // {
          //   name: 'Hueting, Jennifer (CFPB)',
          //   email: 'Jennifer.Hueting@cfpb.gov'
          // },
          // {
          //   name: 'James, Justin (CFPB)',
          //   email: 'Justin.James@cfpb.gov'
          // },
          // {
          //   name: 'Johnson, Nicholas (CFPB)',
          //   email: 'Nicholas.Johnson@cfpb.gov'
          // },
          // {
          //   name: 'Karchner, Ross (CFPB)',
          //   email: 'Ross.Karchner@cfpb.gov'
          // },
          // {
          //   name: 'Keeler, Hans (CFPB)',
          //   email: 'Hans.Keeler@cfpb.gov'
          // },
          // {
          //   name: 'Keeler, Rachael (CFPB)',
          //   email: 'Rachael.Keeler@cfpb.gov'
          // },
          // {
          //   name: 'Kelly, Lorelei (CFPB)',
          //   email: 'Lorelei.Kelly@cfpb.gov'
          // },
          // {
          //   name: 'Kelly, Reed (CFPB)',
          //   email: 'Reed.Kelly@cfpb.gov'
          // },
          // {
          //   name: 'Kennedy, David (CFPB)',
          //   email: 'David.Kennedy@cfpb.gov'
          // },
          // {
          //   name: 'Kennedy, Stephen (CFPB)',
          //   email: 'Stephen.Kennedy@cfpb.gov'
          // },
          // {
          //   name: 'Kiany, Armin (CFPB)',
          //   email: 'Armin.Kiany@cfpb.gov'
          // },
          // {
          //   name: 'Kim, Sonna (CFPB)',
          //   email: 'Sonna.Kim@cfpb.gov'
          // },
          // {
          //   name: 'Kokkinidis, George (CFPB)',
          //   email: 'George.Kokkinidis@cfpb.gov'
          // },
          // {
          //   name: 'Kurz, Natalie (CFPB)',
          //   email: 'Natalie.Kurz@cfpb.gov'
          // },
          // {
          //   name: 'Lassiter, Jennifer (Contractor)(CFPB)',
          //   email: 'Jennifer.Lassiter@cfpb.gov'
          // },
          // {
          //   name: 'Lee, Jennifer (Contractor)(CFPB)',
          //   email: 'Jennifer.Lee@cfpb.gov'
          // },
          // {
          //   name: 'Locraft, Lauren (Contractor)(CFPB)',
          //   email: 'Lauren.Locraft@cfpb.gov'
          // },
          // {
          //   name: 'Mark, Meredith (Contractor) (CFPB)',
          //   email: 'Meredith.Mark@cfpb.gov'
          // },
          // {
          //   name: 'Mehta, Dev (Contractor)(CFPB)',
          //   email: 'Dev.Mehta@cfpb.gov'
          // },
          // {
          //   name: 'Miles, Jonelle (Contractor)(CFPB)',
          //   email: 'Jonelle.Miles@cfpb.gov'
          // },
          // {
          //   name: 'Mok, Amy (CFPB)',
          //   email: 'Amy.Mok@cfpb.gov'
          // },
          // {
          //   name: 'Morici, Michael (CFPB)',
          //   email: 'Michael.Morici@cfpb.gov'
          // },
          // {
          //   name: 'Muchnik, Irina (CFPB)',
          //   email: 'Irina.Muchnik@cfpb.gov'
          // },
          // {
          //   name: 'Munoz, Kimberly (CFPB)',
          //   email: 'Kimberly.Munoz@cfpb.gov'
          // },
          // {
          //   name: 'Murphy, Daniel (CFPB)',
          //   email: 'Daniel.Murphy@cfpb.gov'
          // },
          // {
          //   name: 'Murphy, Nancy (CFPB)',
          //   email: 'Nancy.Murphy@cfpb.gov'
          // },
          // {
          //   name: 'Osan, Stephanie (CFPB)',
          //   email: 'Stephanie.Osan@cfpb.gov'
          // },
          // {
          //   name: 'Pearsall, Wyatt (CFPB)',
          //   email: 'Wyatt.Pearsall@cfpb.gov'
          // },
          // {
          //   name: 'Pfaff, Lucas (Contractor)(CFPB)',
          //   email: 'Lucas.Pfaff@cfpb.gov'
          // },
          // {
          //   name: 'Pizarro, Daniel (CFPB)',
          //   email: 'Daniel.Pizarro@cfpb.gov'
          // },
          // {
          //   name: 'Reed, NaaMarteki (CFPB)',
          //   email: 'NaaMarteki.Reed@cfpb.gov'
          // },
          // {
          //   name: 'Sayre, Stephen (CFPB)',
          //   email: 'Stephen.Sayre@cfpb.gov'
          // },
          // {
          //   name: 'Schafer, Jessica (CFPB)',
          //   email: 'Jessica.Schafer@cfpb.gov'
          // },
          // {
          //   name: 'Scott, Adam (CFPB)',
          //   email: 'Adam.Scott@cfpb.gov'
          // },
          // {
          //   name: 'Shelton, William (CFPB)',
          //   email: 'William.Shelton@cfpb.gov'
          // },
          // {
          //   name: 'Sjoberg, Brian (Contractor)(CFPB)',
          //   email: 'Brian.Sjoberg@cfpb.gov'
          // },
          // {
          //   name: 'Soto-Pastor, Orlando (Contractor)(CFPB)',
          //   email: 'Orlando.Soto-Pastor@cfpb.gov'
          // },
          // {
          //   name: 'Stephan, Fadi (Contractor)(CFPB)',
          //   email: 'Fadi.Stephan@cfpb.gov'
          // },
          // {
          //   name: 'Van Mau, Emilie (Contractor)(CFPB)',
          //   email: 'Emilie.VanMau@cfpb.gov'
          // },
          // {
          //   name: 'Vinokurov, Yury (CFPB)',
          //   email: 'Yury.Vinokurov@cfpb.gov'
          // },
          // {
          //   name: 'Wall, Kurt (Contractor)(CFPB)',
          //   email: 'Kurt.Wall@cfpb.gov'
          // },
          // {
          //   name: 'Werner, Charles (CFPB)',
          //   email: 'Charles.Werner@cfpb.gov'
          // },
          // {
          //   name: 'Wilson, Gerald (CFPB)',
          //   email: 'Gerald.Wilson@cfpb.gov'
          // },
          {
            name: 'Litmus',
            email: 'ba992ec@emailtests.com'
          },
        ]
      },

      inline: { /* use above options*/ },

      external: {
        src: ['dist/index.html']
      },

      external_min: {
        src: ['dist/index.min.html']
      }
    },

    premailer: {
      simple: {
        options: {},
        files: {
          'dist/index.html': ['src/index.html']
        }
      }
    }

  };

  /**
   * Initialize a configuration object for the current project.
   */
  grunt.initConfig(config);

  /**
   * Create custom task aliases and combinations.
   */
  grunt.registerTask('compile-cf', ['bower:cf', 'concat:cf-less']);
  grunt.registerTask('css', ['less', 'autoprefixer', 'legacssy', 'cssmin', 'usebanner:css']);
  grunt.registerTask('js', ['concat:js', 'uglify', 'usebanner:js']);
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['test', 'css', 'js', 'premailer', 'htmlmin', 'copy']);
  grunt.registerTask('default', ['build']);

};