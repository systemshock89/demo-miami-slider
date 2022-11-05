const gulp = require("gulp");
const webpack = require("webpack-stream");
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require("autoprefixer");
const cleanCSS = require("gulp-clean-css");
const postcss = require("gulp-postcss");
const browsersync = require("browser-sync");
const fileinclude   = require('gulp-file-include');
const imagemin   = require('gulp-imagemin');
const changed   = require('gulp-changed');

const dist = "./dist";

gulp.task("copy-html", () => {
    return gulp.src('./src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: './src/parts/',
            indent: true
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(browsersync.stream());

    // return gulp.src("./src/index.html")
    //             .pipe(gulp.dest(dist))
    //             .pipe(browsersync.stream());
});

gulp.task("build-js", () => {
    return gulp.src("./src/js/bundle.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'bundle.min.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(gulp.dest(dist + '/js'))
                .pipe(browsersync.stream());
});

gulp.task("build-sass", () => {
    return gulp.src("src/scss/*.*", "!src/scss/_*.*")
    // return gulp.src("./src/scss/**/*.scss")
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest(dist + '/css'))
                .pipe(browsersync.stream());
});

gulp.task("copy-assets", () => {
    return gulp.src("./src/fonts/**/*.*")
        .pipe(gulp.dest(dist + "/fonts"));

    // return gulp.src("./src/img/**/*.*")
    //             .pipe(gulp.dest(dist + "/img"))
    //             .pipe(browsersync.stream());
});

gulp.task("build-images", () => {

    // копируем все из img без сжатия
    gulp.src("./src/img/*.*")
        .pipe(changed('./src/img/dist'))
        .pipe(gulp.dest(dist + "/img"))
        .pipe(browsersync.stream());

    // копируем все из img.src и сжимаем
    return gulp.src('./src/img/src/**/*')
        .pipe(changed('./src/img/dist'))
        .pipe(imagemin())
        .pipe(gulp.dest(dist + "/img"))
        .pipe(browsersync.stream());
});

gulp.task("watch", () => {
    browsersync.init({
		server: "./dist/",
		port: 4000,
        notify: false
    });

    gulp.watch(["./src/*.html", "./src/parts/*.html"], gulp.parallel("copy-html"));
    gulp.watch("./src/fonts/**/*.*", gulp.parallel("copy-assets"));
    gulp.watch("./src/img/**/*.*", gulp.parallel("build-images"));
    gulp.watch("./src/scss/**/*.scss", gulp.parallel("build-sass"));
    gulp.watch("./src/js/**/*.js", gulp.parallel("build-js"));
});

gulp.task("build", gulp.parallel("copy-html", "copy-assets", "build-sass", "build-js", "build-images"));

gulp.task("prod-js", () => {
    return gulp.src("./src/js/bundle.js")
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'bundle.min.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: false,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist + '/js'));
});

gulp.task("prod-sass", () => {
    return gulp.src("src/scss/*.*", "!src/scss/_*.*")
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(gulp.dest(dist + '/css'));
});

gulp.task("prod", gulp.parallel("copy-html", "copy-assets", "prod-sass", "prod-js", "build-images"));

gulp.task("default", gulp.parallel("watch", "build"));