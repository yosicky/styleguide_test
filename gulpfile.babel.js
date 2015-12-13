import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import styleguide from 'sc5-styleguide'
import browserSync from 'browser-sync'

const $ = gulpLoadPlugins();
const bs1 = browserSync.create('sg_pc');
const bs2 = browserSync.create('sg_sp');

// compile scss
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];
  return gulp.src([
    'src/scss/app.default.scss',
    'src/scss/app.sp.scss'
  ])
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest('dist/css'));
});

// test
gulp.task('foo', () => {
    styleguideGenerate('default');
});

// sc5
const Configs = {
  pc: {
    source: ['./src/scss/**/*.common.scss', './src/scss/**/*.default.scss'],
    title: 'My Styleguide PC',
    root: './styleguide/pc',
    output: './styleguide/pc',
    port: 3001,
    styles: ['./src/scss/app.default.scss', './src/scss/base/styleguide.default.scss']
  },
  sp: {
    source: ['./src/scss/**/*.common.scss', './src/scss/**/*.sp.scss'],
    title: 'My Styleguide SP',
    root: './styleguide/sp',
    output: './styleguide/sp',
    port: 3002,
    styles: ['./src/scss/app.sp.scss', './src/scss/base/styleguide.sp.scss']
  }
};
let configSet = (type) => {
  if (type === 'default') {
    return Configs.pc;
  } else if (type === 'sp') {
    return Configs.sp;
  }
};
let styleguideGenerate = (type, server = true) => {
  let config = configSet(type);
  let flag = server;
  console.log(config);
  return gulp.src(config.source)
    .pipe(styleguide.generate({
        title: config.title,
        server: flag,
        port: config.port,
        rootPath: config.root,
        overviewPath: './styleguide/README.md'
      }))
    .pipe(gulp.dest(config.output));
};
let styleguideApplyStyles = (type) => {
  let config = configSet(type);
  console.log(config);
  return gulp.src(config.styles)
    .pipe($.sass({
      errLogToConsole: true
    }))
    .pipe($.concat(`${config.output}/styleguide.css`))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(config.output));
};
gulp.task('styleguide:serverPC', () => {
  return styleguideGenerate('default');
});
gulp.task('styleguide:serverPCSP', () => {
  return styleguideGenerate('sp');
});
gulp.task('styleguide:generatePC', () => {
  return styleguideGenerate('default', false);
});
gulp.task('styleguide:generateSP', () => {
  return styleguideGenerate('sp', false);
});
gulp.task('styleguide:applystylesPC', () => {
  return styleguideApplyStyles('default');
});
gulp.task('styleguide:applystylesSP', () => {
  return styleguideApplyStyles('sp');
});
gulp.task('sgPC', ['styleguidePC'], () => {
  gulp.watch(Configs.pc.source, ['styleguidePC']);
});
gulp.task('sgSP', ['styleguideSP'], () => {
  gulp.watch(Configs.sp.source, ['styleguideSP']);
});
gulp.task('styleguidePC', ['styleguide:serverPC', 'styleguide:applystylesPC']);
gulp.task('styleguideSP', ['styleguide:serverSP', 'styleguide:applystylesSP']);

gulp.task('sg', ['styleguide:generatePC', 'styleguide:applystylesPC','styleguide:generateSP', 'styleguide:applystylesSP'], () => {
  bs1.init({
    notify: false,
    server: {
      baseDir: './styleguide/pc'
    },
    port: 3301
  });
  bs2.init({
    notify: false,
    server: {
      baseDir: './styleguide/sp'
    },
    port: 3303
  });
});

