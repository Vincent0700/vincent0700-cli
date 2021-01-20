const chalk = require('chalk');

/**
 * Generate array from 0 to n - 1
 * @param {Number} n
 * @returns {Array}
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
 * @returns {String}
 */
function repeat(n, str) {
  return Array(n)
    .fill(str)
    .join('');
}

/**
 * Sleep milliseconds
 * @param {Number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

/**
 * Get frame buffer
 * @param {Number} index
 * @returns {Buffer}
 */
function fetch(index) {
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
 * @returns {Promise<String>}
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

/**
 * Display error message
 * @param {String} msg
 * @returns {void}
 */
function logError(msg) {
  console.log(chalk.bgRedBright.whiteBright(' ERROR '), chalk.redBright(msg));
}

module.exports = {
  range,
  repeat,
  sleep,
  fetch,
  render,
  logError
};
