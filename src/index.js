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
/*  MAIN FUNCTION        */
/* --------------------- */

(async () => {
  const cc = chalk.bgHex('#EFC500').hex('#FFF').bold;
  const h1 = chalk.bgHex('#E74C3C').hex('#FFF').bold;
  const h2 = chalk.bgHex('#C0392B').hex('#FFF').bold;
  const r1 = chalk.bgHex('#ECF0F1').hex('#000');
  const r2 = chalk.bgHex('#BDC3C7').hex('#000');

  const rows = [
    cc(' «            GENERAL INFO            » '),
    '',
    h1('  NAME  ') + r1(' Vincent Wang                   '),
    h2('  BLOG  ') + r2(' https://vincentstudio.info     '),
    h1(' GITHUB ') + r1(' https://github.com/vincent0700 '),
    h2('  MAIL  ') + r2(' wang.yuanqiu007@gmail.com      '),
    '',
    cc(' «            GITHUB STATS            » ')
  ];

  const data = await Promise.all(
    range(FRAME_COUNT)
      .map((i) => getData(i))
      .map((buffer) => render(buffer))
  );

  data.forEach(
    (frame, frameIndex) =>
      (data[frameIndex] = frame
        .split('\n')
        .map((row, rowIndex) => row + (rows[rowIndex] ? '  ' + rows[rowIndex] : ''))
        .join('\n'))
  );

  const frames = [
    ...range(FRAME_COUNT),
    ...range(FRAME_COUNT)
      .reverse()
      .slice(1)
  ].map((i) => data[i]);

  const preRender = () => {
    console.clear();
    console.log();
  };

  // render loop
  while (true) {
    for (let frame of frames) {
      preRender();
      console.log(frame);
      await sleep(FRAME_SPEED);
    }
    await sleep(1000);
  }
})();
