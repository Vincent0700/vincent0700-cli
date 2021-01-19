const chalk = require('chalk');

const FRAME_COUNT = 4;
const FRAME_SPEED = 100;

/**
 * Generate array from 0 to n - 1
 * @param {Number} n
 */
function range(n) {
  return Array(n)
    .fill(0)
    .map((_, i) => i);
}

/**
 * Repeats the given string n times
 * @param {Number} n
 * @param {String} str
 */
function repeat(n, str) {
  return Array(n)
    .fill(str)
    .join('');
}

/**
 * Sleep milliseconds
 * @param {Number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

/**
 * Get frame buffer
 * @param {Number} index
 */
function getData(index) {
  return Buffer.from(
    require(`./assets/frames/frame${index + 1}.dat`).replace(/^data:[^;]*;base64,/, ''),
    'base64'
  );
}

/**
 * Convert RGB color to HEX
 * @param {Arrray} rgb
 * @returns {String} hex color
 */
function rgbToHex([r, g, b]) {
  const toHex = (c) => c.toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Decode binary data
 * @param {Buffer} buffer
 * @returns {Object}
 */
async function parseData(buffer) {
  let offset = 0;
  const width = buffer.readUInt8(offset++);
  const height = buffer.readUInt8(offset++);
  const colorsCount = buffer.readUInt16BE(offset);
  offset += 2;
  const colors = range(colorsCount).map(() =>
    rgbToHex(range(3).map(() => buffer.readUInt8(offset++)))
  );
  const pixels = [];
  const bitCount = Math.ceil(Math.log2(colorsCount + 1));
  const bitArray = [];
  for (let y = 0; y < height; ++y) {
    let rowData = [];
    for (let x = 0; x < width; ++x) {
      while (bitArray.length < bitCount) {
        const bits = buffer
          .readUInt8(offset++)
          .toString(2)
          .padStart(8, '0')
          .split('')
          .map((t) => parseInt(t));
        bitArray.push(...bits);
      }
      const value = parseInt(bitArray.splice(0, bitCount).join(''), 2);
      rowData.push(value);
    }
    pixels.push(rowData);
  }

  return {
    width,
    height,
    palette: colors,
    data: pixels
  };
}

/**
 * Render pixel data
 * @param {Buffer} buffer binary data
 */
async function render(buffer) {
  const obj = await parseData(buffer);
  let str = '';
  for (let y = 0; y < obj.height; ++y) {
    const colors = obj.data[y].map((idx) => obj.palette[idx - 1]);
    const pre = { color: '', count: 0 };
    for (let x = 0; x < obj.width; ++x) {
      const color = colors[x];
      if (!color) str += '　';
      else if (pre.color === color) pre.count++;
      else {
        str += chalk.bgHex(pre.color)(repeat(pre.count, '　'));
        pre.color = color;
        pre.count = 1;
      }
    }
    if (pre.count) str += chalk.bgHex(pre.color)(repeat(pre.count, '　'));
    if (y !== obj.height - 1) str += '\n';
  }
  return str;
}

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
/*  MAIN FUNCTION        */
/* --------------------- */

(async () => {
  const data = await Promise.all(
    range(FRAME_COUNT)
      .map((i) => getData(i))
      .map((buffer) => render(buffer))
  );

  const getFrames = (columns) => {
    const EMPTY_ROW = bk('                                          ');
    const RAINBOW_LINE =
      chalk.bgHex('#FF0000')('      ') +
      chalk.bgHex('#FF7F00')('      ') +
      chalk.bgHex('#FFFF00')('      ') +
      chalk.bgHex('#00FF00')('      ') +
      chalk.bgHex('#00FFFF')('      ') +
      chalk.bgHex('#0000FF')('      ') +
      chalk.bgHex('#8B00FF')('      ');
    const MG = (n = 1) => bk(repeat(n, ' '));
    const rows = [
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
      h1('     BLOG ') + r1(' https://vincentstudio.info     '),
      h2('   GITHUB ') + r2(' https://github.com/vincent0700 '),
      h1(' TELEGRAM ') + r1(' https://t.me/vincent0700       '),
      h2('     MAIL ') + r2(' wang.yuanqiu007@gmail.com      '),
      h1('   WECHAT ') + r1(' vincent0700                    '),
      EMPTY_ROW,
      cc(' «          PROFESSIONAL SKILLS         » '),
      EMPTY_ROW,
      t1(' Javascript  ') + MG() + t1('     Vue     ') + MG() + t1('    NodeJs    '),
      t2('  Sass/Less  ') + MG() + t2('   Python    ') + MG() + t2('    Docker    '),
      EMPTY_ROW,
      cc(' «          INTERESTS & HOBBIES         » '),
      EMPTY_ROW,
      t1('    Coding   ') + MG() + t1('   Arduino   ') + MG() + t1('   Pixel Art  '),
      t2('    Guitar   ') + MG() + t2('   Cooking   ') + MG() + t2('   Traveling  ')
    ];

    const result = JSON.parse(JSON.stringify(data));
    const width = 78;
    const MAX_COLUMNS = 90;
    const height = result[0].split('\n').length;
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
      if (process.stdout.columns > 77) console.log(frames[index]);
      else console.log('error');
    });
  };

  process.stdout.on('resize', () => {
    frames = getFrames(process.stdout.columns);
    console.clear();
    renderFrame(frameIndex);
  });

  console.clear();

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
