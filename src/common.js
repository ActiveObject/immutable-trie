/**
 * Calculate Hamming weight for a given bitmap. Also known as 'population count'
 * operation.
 * @link http://stackoverflow.com/questions/109023/how-to-count-the-number-of-set-bits-in-a-32-bit-integer/109025#109025
 */
function popcount(i) {
  i = i - ((i >> 1) & 0x55555555);
  i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
  return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

/**
 * Convert number into bitmap where bit at position that correspods to number
 * equals one.
 * For example:
 *
 *    5 (dec) -> 1001 (bin) -> 100000 (bitmap)
 *    15 (dec) -> 1111 (bin) -> 1000000000000000 (bitmap)
 * @param {Number} n
 * @return {Number} bitmap
 */
function toBitmap(n) {
  return 1 << n;
}

/**
 * Insert item into position at given index.
 * Doesn't modify source array.
 * @param {Array} items
 * @param {*} item
 * @param {Number} index
 * @return {Array}
 */
function insertAt(items, item, index) {
  var copy = items.slice();
  copy.splice(index, 0, item);
  return copy;
}

/**
 * Replace array element at given index with new item.
 * Doesn't modify source array.
 * @param {Array} items
 * @param {*} item
 * @param {Number} index
 * @return {Array}
 */
function replaceAt(items, item, index) {
  var copy = items.slice();
  copy.splice(index, 1, item);
  return copy;
}

/**
 * Remove element from array at given index.
 * Doesn't modify source array.
 * @param {Array} items
 * @param {Number} index
 * @return {Array}
 */
function removeAt(items, index) {
  var copy = items.slice();
  copy.splice(index, 1);
  return copy;
}

/**
 * Find first element for which predicate is true
 * @param {Array} items
 * @param {Function} pred
 * @return {*}
 */
function find(items, pred) {
  var len = items.length,
      i = -1;

  while(++i < len) {
    if (pred(items[i], i)) {
      return items[i];
    }
  }

  return null;
}

exports.popcount  = popcount;
exports.toBitmap  = toBitmap;
exports.insertAt  = insertAt;
exports.replaceAt = replaceAt;
exports.removeAt  = removeAt;
exports.find      = find;
