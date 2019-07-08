/*
 CryptoJS v3.0.2
 code.google.com/p/crypto-js
 (c) 2009-2012 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
var CryptoJS = CryptoJS || function (i, j) {
  var f = {}, b = f.lib = {}, m = b.Base = function () { function a() { } return { extend: function (e) { a.prototype = this; var c = new a; e && c.mixIn(e); c.$super = this; return c }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.$super.extend(this) } } }(), l = b.WordArray = m.extend({
    init: function (a, e) {
      a =
      this.words = a || []; this.sigBytes = e != j ? e : 4 * a.length
    }, toString: function (a) { return (a || d).stringify(this) }, concat: function (a) { var e = this.words, c = a.words, o = this.sigBytes, a = a.sigBytes; this.clamp(); if (o % 4) for (var b = 0; b < a; b++)e[o + b >>> 2] |= (c[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((o + b) % 4); else if (65535 < c.length) for (b = 0; b < a; b += 4)e[o + b >>> 2] = c[b >>> 2]; else e.push.apply(e, c); this.sigBytes += a; return this }, clamp: function () { var a = this.words, e = this.sigBytes; a[e >>> 2] &= 4294967295 << 32 - 8 * (e % 4); a.length = i.ceil(e / 4) }, clone: function () {
      var a =
        m.clone.call(this); a.words = this.words.slice(0); return a
    }, random: function (a) { for (var e = [], c = 0; c < a; c += 4)e.push(4294967296 * i.random() | 0); return l.create(e, a) }
  }), n = f.enc = {}, d = n.Hex = { stringify: function (a) { for (var e = a.words, a = a.sigBytes, c = [], b = 0; b < a; b++) { var d = e[b >>> 2] >>> 24 - 8 * (b % 4) & 255; c.push((d >>> 4).toString(16)); c.push((d & 15).toString(16)) } return c.join("") }, parse: function (a) { for (var e = a.length, c = [], b = 0; b < e; b += 2)c[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8); return l.create(c, e / 2) } }, h = n.Latin1 = {
    stringify: function (a) {
      for (var e =
        a.words, a = a.sigBytes, b = [], d = 0; d < a; d++)b.push(String.fromCharCode(e[d >>> 2] >>> 24 - 8 * (d % 4) & 255)); return b.join("")
    }, parse: function (a) { for (var b = a.length, c = [], d = 0; d < b; d++)c[d >>> 2] |= (a.charCodeAt(d) & 255) << 24 - 8 * (d % 4); return l.create(c, b) }
  }, k = n.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(h.stringify(a))) } catch (b) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return h.parse(unescape(encodeURIComponent(a))) } }, g = b.BufferedBlockAlgorithm = m.extend({
    reset: function () {
    this._data = l.create();
      this._nDataBytes = 0
    }, _append: function (a) { "string" == typeof a && (a = k.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var b = this._data, c = b.words, d = b.sigBytes, f = this.blockSize, g = d / (4 * f), g = a ? i.ceil(g) : i.max((g | 0) - this._minBufferSize, 0), a = g * f, d = i.min(4 * a, d); if (a) { for (var h = 0; h < a; h += f)this._doProcessBlock(c, h); h = c.splice(0, a); b.sigBytes -= d } return l.create(h, d) }, clone: function () { var a = m.clone.call(this); a._data = this._data.clone(); return a }, _minBufferSize: 0
  }); b.Hasher = g.extend({
    init: function () { this.reset() },
    reset: function () { g.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); this._doFinalize(); return this._hash }, clone: function () { var a = g.clone.call(this); a._hash = this._hash.clone(); return a }, blockSize: 16, _createHelper: function (a) { return function (b, c) { return a.create(c).finalize(b) } }, _createHmacHelper: function (a) { return function (b, c) { return p.HMAC.create(a, c).finalize(b) } }
  }); var p = f.algo = {}; return f
}(Math);
(function () {
  var i = CryptoJS, j = i.lib, f = j.WordArray, j = j.Hasher, b = [], m = i.algo.SHA1 = j.extend({
    _doReset: function () { this._hash = f.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (f, i) {
      for (var d = this._hash.words, h = d[0], k = d[1], g = d[2], j = d[3], a = d[4], e = 0; 80 > e; e++) {
        if (16 > e) b[e] = f[i + e] | 0; else { var c = b[e - 3] ^ b[e - 8] ^ b[e - 14] ^ b[e - 16]; b[e] = c << 1 | c >>> 31 } c = (h << 5 | h >>> 27) + a + b[e]; c = 20 > e ? c + ((k & g | ~k & j) + 1518500249) : 40 > e ? c + ((k ^ g ^ j) + 1859775393) : 60 > e ? c + ((k & g | k & j | g & j) - 1894007588) : c + ((k ^ g ^ j) -
          899497514); a = j; j = g; g = k << 30 | k >>> 2; k = h; h = c
      } d[0] = d[0] + h | 0; d[1] = d[1] + k | 0; d[2] = d[2] + g | 0; d[3] = d[3] + j | 0; d[4] = d[4] + a | 0
    }, _doFinalize: function () { var b = this._data, f = b.words, d = 8 * this._nDataBytes, h = 8 * b.sigBytes; f[h >>> 5] |= 128 << 24 - h % 32; f[(h + 64 >>> 9 << 4) + 15] = d; b.sigBytes = 4 * f.length; this._process() }
  }); i.SHA1 = j._createHelper(m); i.HmacSHA1 = j._createHmacHelper(m)
})();
(function () {
  var i = CryptoJS, j = i.enc.Utf8; i.algo.HMAC = i.lib.Base.extend({
    init: function (f, b) { f = this._hasher = f.create(); "string" == typeof b && (b = j.parse(b)); var i = f.blockSize, l = 4 * i; b.sigBytes > l && (b = f.finalize(b)); for (var n = this._oKey = b.clone(), d = this._iKey = b.clone(), h = n.words, k = d.words, g = 0; g < i; g++)h[g] ^= 1549556828, k[g] ^= 909522486; n.sigBytes = d.sigBytes = l; this.reset() }, reset: function () { var f = this._hasher; f.reset(); f.update(this._iKey) }, update: function (f) { this._hasher.update(f); return this }, finalize: function (f) {
      var b =
        this._hasher, f = b.finalize(f); b.reset(); return b.finalize(this._oKey.clone().concat(f))
    }
  })
})();

// export default CryptoJS;
module.exports = CryptoJS;