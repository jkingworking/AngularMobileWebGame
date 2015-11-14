var
    buildDir       = './build',
    tempDir        = './.tmp',
    commitMessage  = 'Automated Commit for ',
    packageJSON    = require('./package'),
    concat         = require('gulp-concat'),
    confirm        = require('gulp-confirm'),
    connect        = require('gulp-connect'),
    cssprefix      = require('gulp-autoprefixer'),
    del            = require('del'),
    flatten        = require('gulp-flatten'),
    fs             = require('fs'),
    git            = require('gulp-git'),
    gulp           = require('gulp'),
    gulpBump       = require('gulp-bump'),
    gulpOpen       = require('gulp-open'),
    inject         = require('gulp-inject'),
    jshint         = require('gulp-jshint'),
    mainBowerFiles = require('main-bower-files'),
    manifest       = require('gulp-manifest'),
    ngCache        = require('gulp-angular-templatecache'),
    notify         = require('gulp-notify'),
    plumber        = require('gulp-plumber'),
    rev            = require('gulp-rev'),
    runSequence    = require('run-sequence'),
    sass           = require('gulp-sass'),
    series         = require('stream-series'),
    stripDebug     = require('gulp-strip-debug'),
    uglify         = require('gulp-uglify'),
    usemin         = require('gulp-usemin'),
    userData       = require('./userData.json'),
    versionFile    = require('./src/version.json'),
    vinylPaths     = require('vinyl-paths'),
    watch          = require('gulp-watch');

var jshintConfig = packageJSON.jshintConfig;

var gulpDistSSH = require('gulp-ssh')({
    ignoreErrors: false,
    sshConfig: {
        host: userData.remoteHost,
        port: userData.remotePort,
        username: userData.sshUser,
        privateKey: fs.readFileSync(userData.privateKey),
        passphrase: userData.passphrase
    }
});

var gulpStagingSSH = require('gulp-ssh')({
    ignoreErrors: false,
    sshConfig: {
        host: userData.stagingHost,
        port: userData.stagingPort,
        username: userData.sshUser,
        privateKey: fs.readFileSync(userData.privateKey),
        passphrase: userData.passphrase
    }
});

function plumberErrOpts(reporter)
{
    reporter = reporter;
    return {
        errorHandler: notify.onError(reporter + " : <%= JSON.stringify(arguments[0]) %>")
    };
}

gulp.task('stopApache', function ()
{
    if (userData.stopApache)
    {
        return gulp
            .shell(['apachectl stop']);
    }
    else
    {
        return gulp;
    }
});

gulp.task('clean-temp', function ()
{
    return gulp
        .src(tempDir)
        .pipe(vinylPaths(del));
});

gulp.task('clean-build', function (cb)
{
    return gulp
        .src([
            buildDir + '**/*',
            buildDir + '!.htaccess'
        ])
        .pipe(vinylPaths(del));
});

gulp.task('buildAppTemplates', function ()
{
    return gulp
        .src(['src/app/**/*.html'])
        .pipe(plumber(plumberErrOpts('templates')))
        .pipe(ngCache('templates.js', {
            module: userData.templateModule,
            standalone: '[]'
        }))
        .pipe(gulp.dest(tempDir + '/app'));
});

gulp.task('buildCss', function ()
{
    return gulp
        .src([
            'src/scss/**/*.scss',
            'src/app/**/*.scss'
        ])
        .pipe(plumber(plumberErrOpts('sass')))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(cssprefix("last 2 version", "ie 9"))
        .pipe(concat("styles.css"))
        .pipe(gulp.dest(tempDir + '/css'));
});

gulp.task('bumpVersion', function ()
{
    gulp.src('./src/version.json')
        .pipe(gulpBump())
        .pipe(gulp.dest('./src/'));

    return gulp.src([
        './bower.json',
        './package.json'
    ])
        .pipe(gulpBump())
        .pipe(gulp.dest('./'));
});

gulp.task('moveAppJs', function ()
{
    return gulp
        // Add in our custom scripts
        .src('./src/app/**/*.js')
        .pipe(plumber(plumberErrOpts('JS HINT')))
        .pipe(jshint(jshintConfig))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(tempDir + '/app'));
});

gulp.task('moveBowerComponents', function ()
{
    return gulp
        .src(mainBowerFiles(), {base: './src/components'})
        .pipe(flatten())
        .pipe(gulp.dest(tempDir + '/components'));
});

gulp.task('moveSpecialCaseComponents', function ()
{
    // This tasks manually moves all the bower components that don't have a package.json or bower.json "main" files declared
    return gulp
        .src([
            './src/components/modernizr/modernizr.js',
            './node_modules/angular-retina/dist/angular-retina.js',
            './src/components/font-awesome/css/font-awesome.min.css'
        ], {base: './src/components'})
        .pipe(flatten())
        .pipe(gulp.dest(tempDir + '/components'));
});

gulp.task('moveDebugMaps', function ()
{
    // This tasks manually moves all the bower components that don't have a package.json or bower.json "main" files declared
    return gulp
        .src([
            './src/components/bootstrap/dist/css/bootstrap.css.map'
        ], {base: './src/components'})
        .pipe(flatten())
        // For Dev
        .pipe(gulp.dest(tempDir + '/components'))
        // For Live
        .pipe(gulp.dest(buildDir + '/css'));
});

gulp.task('moveImages', function ()
{
    return gulp
        .src(['./src/assets/**/*'])
        .pipe(gulp.dest(buildDir + '/assets'));
});

gulp.task('moveFonts', ['moveMapFiles'], function ()
{
    return gulp
        .src([
            'src/scss/**/*.eot',
            'src/scss/**/*.svg',
            'src/scss/**/*.woff',
            'src/scss/**/*.woff2',
            'src/scss/**/*.ttf',

            'src/components/**/*.eot',
            'src/components/**/*.svg',
            'src/components/**/*.woff',
            'src/components/**/*.woff2',
            'src/components/**/*.ttf'
        ])
        .pipe(flatten())
        .pipe(gulp.dest(buildDir + '/fonts/'));
});

gulp.task('moveMapFiles', function ()
{
    return gulp
        .src('./src/**/*.css.map')
        .pipe(flatten())
        .pipe(gulp.dest(buildDir + '/css'));
});

gulp.task('moveRootFiles', function ()
{
    return gulp
        .src('./src/*.*')
        .pipe(gulp.dest(buildDir));
});

gulp.task('injectFiles', function ()
{
    return gulp
        // grab the index file
        .src('./src/index.html')
        // inject all our srouces
        .pipe(inject(series(
            // Force jQuery and Angular to load first
            gulp
                .src([
                    tempDir + '/**/jquery.js',
                    tempDir + '/**/angular.js',
                    tempDir + '/**/picker.js',
                    tempDir + '/**/moment.js',
                ]),
            gulp
                .src([
                    '!' + tempDir + '/**/jquery.js',
                    '!' + tempDir + '/**/angular.js',
                    '!' + tempDir + '/**/picker.js',
                    '!' + tempDir + '/**/moment.js',
                    tempDir + '/components/**/*.js',
                    tempDir + '/components/**/*.css'
                ])
        ), {ignorePath: '.' + tempDir, relative: true, starttag: '<!-- inject:vendor:{{ext}} -->'}))
        .pipe(inject(gulp
            .src([
                tempDir + '/app/**/*.js',
                tempDir + '/css/**/*.css',
            ]), {ignorePath: '.' + tempDir, relative: true, starttag: '<!-- inject:app:{{ext}} -->'}))
        // save the temp index file
        .pipe(gulp.dest(tempDir));
});
gulp.task('usemin', function ()
{
    return gulp.src(tempDir + '/*.html')
        .pipe(usemin({
            cssVendor: ['concat', rev()],
            cssApp: ['concat', rev()],
            jsVendor: [uglify({mangle: false}), rev()],
            //jsApp: [uglify({mangle: false}), rev()]
            jsApp: [stripDebug(), uglify({mangle: false}), rev()]
        }))
        .pipe(gulp.dest(buildDir));
});
gulp.task('serverSetup', function (cb)
{
    buildDir = tempDir;
    runSequence(
        [
            'buildAppTemplates',
            'buildCss',
            'moveAppJs',
            'moveBowerComponents',
            'moveSpecialCaseComponents',
            'moveDebugMaps',
            'moveImages',
            'moveRootFiles'
        ],
        [
            'moveFonts',
            'injectFiles'
        ],
        cb
    );
});
gulp.task('watchScss', function ()
{
    // watching CSS
    gulp.watch([
        'src/scss/.scss',
        'src/scss/**/*.scss',
        'src/app/**/*.scss'
    ], ['buildCss']);
});
gulp.task('watchTemplates', function ()
{
    // watching CSS
    gulp.watch('src/app/**/*.html', ['buildAppTemplates']);
});
gulp.task('watchJs', function ()
{
    // watching CSS
    gulp.watch('src/app/**/*.js', ['moveAppJs']);
});
gulp.task('liveReload', function ()
{
    var watchedFiles = [
        tempDir + '/css/*.css',
        tempDir + '/**/*.js'
    ];
    gulp.src(watchedFiles)
        .pipe(watch(watchedFiles))
        .pipe(connect.reload());
});
gulp.task('openBrowser', function ()
{
    gulp.src(tempDir + '/index.html')
        .pipe(gulpOpen('', {
            url: userData.devUrl + ':' + userData.devPort
        }));
});
gulp.task('moveMdIcons', function ()
{
    return gulp
        .src('./src/components/material-design-icons/**/production/*24px.svg')
        .pipe(flatten())
        .pipe(gulp.dest(buildDir + '/assets/icons'));

});

gulp.task('appManifest', [], function ()
{
    return gulp.src([
        'build/**/*',
        '!build/assets/icons/*'
    ])
        .pipe(manifest({
            hash: true,
            preferOnline: false,
            preferOnline: false,
            network: ['http://*', '*'],
            filename: 'app.manifest',
            exclude: 'app.manifest'
        }))
        .pipe(gulp.dest(buildDir));
});

gulp.task('gitCommit', ['commitMessage'], function ()
{
    return gulp
        .src([
            './bower.json',
            './.gitignore',
            './gulpfile.js',
            './package.json',
            './build/**/*',
            './build/app.manifest',
            './src/**/*',
            '!./src/components',
            '!./src/components/**/*'
        ])
        .pipe(git.add({args: ' -A'}))
        .pipe(git.commit(commitMessage + ' -v' + versionFile.version));
});
gulp.task('gitTag', function (cb)
{
    git.tag('v' + versionFile.version, 'Auto incremented version', function (err)
    {
        if (err)
        {
            throw err;
        }
        cb();
    });
});
gulp.task('gitPush', function (cb)
{
    git.push('origin', 'master', function (err)
    {
        if (err)
        {
            throw err;
        }
        cb();
    });
});

gulp.task('sshDeploy', function ()
{
    return gulpDistSSH.shell(['cd ' + userData.remotePath, 'git pull']);
});

gulp.task('sshStage', function ()
{
    return gulpStagingSSH.shell(['cd ' + userData.stagingPath, 'git pull']);
});

gulp.task('commitMessage', function ()
{
    return gulp.src('./src/index.html')
        .pipe(confirm({
            question: 'Enter a commit message (optional)',
            continue: function (a)
            {
                commitMessage = a;
                return true;
            }
        }));
});


/* Call these tasks from the Command Line
 ----------------------------------------------------------
 /* Go / Build <- Will build the project for distribution
 /* Dist <- Will build the project for distribution make the git commit, and ssh into the server and deploy the changes
 /* Serve <- Setup the server and enable live reload of app css, js and templates
 /* Major <- will bump the major version of the Project
 /* Minor <- will bump the minor version of the Project
 ----------------------------------------------------------*/
gulp.task('go', function (cb)
{
    runSequence(
        [
            'clean-build',
            'clean-temp',
            'bumpVersion'
        ],
        [
            'buildAppTemplates',
            'buildCss',
            'moveAppJs',
            'moveBowerComponents',
            'moveSpecialCaseComponents',
            'moveDebugMaps',
            'moveImages',
            'moveRootFiles'
        ],
        [
            'moveFonts',
            'injectFiles'
        ],
        'usemin',
        'appManifest',
        'clean-temp',
        cb
    );
});
gulp.task('dist', ['go'], function (cb)
{
    versionFile = require('./src/version.json');
    runSequence(
        'gitCommit',
        'gitTag',
        'gitPush',
        'sshDeploy',
        cb
    );
});

gulp.task('stage', ['go'], function (cb)
{
    versionFile = require('./src/version.json');
    runSequence(
        'gitCommit',
        'gitTag',
        'gitPush',
        'sshStage',
        cb
    );
});

gulp.task('deploy', function (cb)
{
    runSequence(
        'sshDeploy',
        cb
    )
});
gulp.task('major', function ()
{
    gulp.src([
        './bower.json',
        './package.json'
    ])
        .pipe(gulpBump({type: 'major'}))
        .pipe(gulp.dest('./'));

    return gulp.src('./src/version.json')
        .pipe(gulpBump({type: 'major'}))
        .pipe(gulp.dest('./src/'));
});
gulp.task('minor', function ()
{
    gulp.src([
        './bower.json',
        './package.json'
    ])
        .pipe(gulpBump({type: 'minor'}))
        .pipe(gulp.dest('./'));

    return gulp.src('./src/version.json')
        .pipe(gulpBump({type: 'minor'}))
        .pipe(gulp.dest('./src/'));
});
gulp.task('serve', ['serverSetup', 'watchScss', 'watchTemplates', 'watchJs', 'liveReload'], function ()
{
    connect.server({
        livereload: true,
        root: tempDir,
        port: userData.devPort,
        host: userData.devHost
    });

    runSequence('openBrowser');
});


/*/ Alias' /*/
gulp.task('build', ['go'], function ()
{
});