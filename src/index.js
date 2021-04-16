const chalk = require('chalk');
const { repeat, range, sleep, fetch, render, logError, clearScreen } = require('./utils');

const FRAME_COUNT = 4;
const FRAME_SPEED = 100;
const MAX_COLUMNS = 90;
const MIN_COLUMNS = 78;
const MIN_ROWS = 28;

/* --------------------- */
/*  THEME PROPERTIES     */
/* --------------------- */

const cc = chalk.bgHex('#333333').hex('#FFF').bold;
const bk = chalk.bgHex('#EFC500').hex('#000').bold;
const t1 = chalk.bgHex('#E74C3C').hex('#FFF').bold.italic.underline;
const t2 = chalk.bgHex('#C0392B').hex('#FFF').bold.italic.underline;
const h1 = chalk.bgHex('#E74C3C').hex('#FFF').bold;
const h2 = chalk.bgHex('#C0392B').hex('#FFF').bold;
const r1 = chalk.bgHex('#ECF0F1').hex('#000');
const r2 = chalk.bgHex('#BDC3C7').hex('#000');

/* --------------------- */
/*  MAIN CONTENT         */
/* --------------------- */

const MG = (n = 1) => bk(repeat(n, ' '));
const EMPTY_ROW = MG(42);
const RAINBOW_LINE =
  chalk.bgHex('#FF0000')('      ') +
  chalk.bgHex('#FF7F00')('      ') +
  chalk.bgHex('#FFFF00')('      ') +
  chalk.bgHex('#00FF00')('      ') +
  chalk.bgHex('#00FFFF')('      ') +
  chalk.bgHex('#0000FF')('      ') +
  chalk.bgHex('#8B00FF')('      ');
const PROFILE_ROWS = [
  EMPTY_ROW,
  RAINBOW_LINE,
  EMPTY_ROW,
  cc(' «             GENERAL INFO             » '),
  EMPTY_ROW,
  h1('     NAME ') + r1(' Vincent Wang                   '),
  h2('    BIRTH ') + r2(' 1994/10/31                     '),
  h1('  ADDRESS ') + r1(' Nanjing, Jiangsu China         '),
  h2('   CAREER ') + r2(' Front End Developer            '),
  EMPTY_ROW,
  cc(' «             SOCIAL LINKS             » '),
  EMPTY_ROW,
  h1('     BLOG ') + r1(' https://vincent0700.com        '),
  h2('   GITHUB ') + r2(' https://github.com/vincent0700 '),
  h1(' TELEGRAM ') + r1(' https://t.me/vincent0700       '),
  h2('     MAIL ') + r2(' wang.yuanqiu007@gmail.com      '),
  h1('   WECHAT ') + r1(' vincent0700                    '),
  EMPTY_ROW,
  cc(' «          PROFESSIONAL SKILLS         » '),
  EMPTY_ROW,
  t1(' Javascript  ') + MG() + t1('     Vue     ') + MG() + t1('   Sass/Less  '),
  t2('     Vue     ') + MG() + t2('   Python    ') + MG() + t2('     Docker   '),
  EMPTY_ROW,
  cc(' «          INTERESTS & HOBBIES         » '),
  EMPTY_ROW,
  t1('    Coding   ') + MG() + t1('   Arduino   ') + MG() + t1('   Pixel Art  '),
  t2('    Guitar   ') + MG() + t2('   Cooking   ') + MG() + t2('   Traveling  ')
];

/* --------------------- */
/*  MAIN FUNCTION        */
/* --------------------- */

(async () => {
  const data = await Promise.all(
    range(FRAME_COUNT)
      .map((i) => fetch(i))
      .map((buffer) => render(buffer))
  );

  const getFrames = (columns) => {
    const result = JSON.parse(JSON.stringify(data));
    const width = 78;
    const height = result[0].split('\n').length;
    const rows = JSON.parse(JSON.stringify(PROFILE_ROWS));

    rows.push(...Array(height - rows.length).fill(EMPTY_ROW));
    result.forEach(
      (frame, frameIndex) =>
        (result[frameIndex] = frame
          .split('\n')
          .map((row, rowIndex) => {
            const margin = (Math.min(columns, MAX_COLUMNS) - width) >> 1;
            const mgTxt = margin > 0 ? bk(repeat(margin, ' ')) : '';
            return row + mgTxt + rows[rowIndex] + mgTxt;
          })
          .join('\n'))
    );

    const frames = [
      ...range(FRAME_COUNT),
      ...range(FRAME_COUNT)
        .reverse()
        .slice(1)
    ].map((i) => result[i]);

    return frames;
  };

  let frames = getFrames(process.stdout.columns);
  let frameIndex = 0;

  const renderFrame = (index) => {
    process.stdout.cursorTo(0, 0, () => {
      if (process.stdout.columns < MIN_COLUMNS)
        logError(`Terminal's width must not be less than ${MIN_COLUMNS}.`);
      else if (process.stdout.rows < MIN_ROWS)
        logError(`Terminal's height must not be less than ${MIN_ROWS}.`);
      else process.stdout.write(frames[index]);
    });
  };

  process.stdout.on('resize', () => {
    frames = getFrames(process.stdout.columns);
    clearScreen();
    renderFrame(frameIndex);
  });

  clearScreen();

  // render loop
  while (true) {
    renderFrame(frameIndex);
    await sleep(FRAME_SPEED);
    if (frameIndex === frames.length - 1) {
      frameIndex = 0;
      await sleep(1000);
    } else frameIndex++;
  }
})();
