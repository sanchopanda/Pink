let
	fileswatch = 'htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
	imageswatch = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
	online = true; // If «false» - Browsersync will work offline without internet connection

let paths = {

	scripts: {
		src: 'source/js/*',
		dest: './build/js',
	},

	styles: {
		src: 'source/sass/style.scss',
		dest: './build/css',
	},

	images: {
		src: 'source/img/**/*.{png,jpg,svg}',
		dest: './build/img',
	},

	jsOutputName: 'app.min.js',

}



const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const rsync = require('gulp-rsync');
const del = require('del');
const extReplace = require("gulp-ext-replace");
const posthtml = require('gulp-posthtml');
const include = require("posthtml-include");
const csso = require('gulp-csso');
const rename = require("gulp-rename");

function scripts() {
	return src(paths.scripts.src)
		.pipe(concat(paths.jsOutputName))
		.pipe(uglify())
		.pipe(dest(paths.scripts.dest))
		.pipe(browserSync.stream())
}


function copy_js() {
	return src([
		"source/js/**"
	])
		.pipe(dest("./build/js"));
}


function styles() {
	return src(paths.styles.src)
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(dest(paths.styles.dest))
		.pipe(csso())
		.pipe(rename("style.min.css"))
		.pipe(dest(paths.styles.dest))
}

function html() {
	return src("source/*.html")
		.pipe(posthtml([
			include()
		]))
		.pipe(dest("build"))
		.pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
		.pipe(imagemin(/*[
			imagemin.optipng({ optimizationLebel: 3 }),
			imagemin.svgo(),
		]*/
		))
		.pipe(dest(paths.images.dest))
}

function webp() {
	return src(paths.images.src)
		.pipe(
			imagemin([
				imageminWebp({ quality: 80 })
			]))
		.pipe(extReplace(".webp"))
		.pipe(dest(paths.images.dest))
}


function cleanimg() {
	return del(paths.images.dest, { force: true })
}

function browsersync() {
	browserSync.init({
		server: 'build/',
		notify: false,
		online: online
	})
}

function startwatch() {
	watch("source/scss/**/*.scss", styles);
	watch("source/img/**/*.{png,jpg,svg}", images);
	watch("source/*.html", html);
	watch('build/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	watch("source/js/*.js", copy_js);
}

exports.browsersync = browsersync;
exports.assets = series(styles, copy_js, images, html);
exports.styles = styles;
exports.scripts = scripts;
exports.copy_js = copy_js;
exports.images = images;
exports.webp = webp;
exports.html = html;
exports.cleanimg = cleanimg;
exports.default = parallel(images, styles, copy_js, html, browsersync, startwatch);




