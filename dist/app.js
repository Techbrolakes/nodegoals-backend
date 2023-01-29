"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/module-alias/index.js
var require_module_alias = __commonJS({
  "node_modules/module-alias/index.js"(exports2, module2) {
    "use strict";
    var BuiltinModule = require("module");
    var Module = module2.constructor.length > 1 ? module2.constructor : BuiltinModule;
    var nodePath = require("path");
    var modulePaths = [];
    var moduleAliases = {};
    var moduleAliasNames = [];
    var oldNodeModulePaths = Module._nodeModulePaths;
    Module._nodeModulePaths = function(from) {
      var paths = oldNodeModulePaths.call(this, from);
      if (from.indexOf("node_modules") === -1) {
        paths = modulePaths.concat(paths);
      }
      return paths;
    };
    var oldResolveFilename = Module._resolveFilename;
    Module._resolveFilename = function(request, parentModule, isMain, options) {
      for (var i = moduleAliasNames.length; i-- > 0; ) {
        var alias = moduleAliasNames[i];
        if (isPathMatchesAlias(request, alias)) {
          var aliasTarget = moduleAliases[alias];
          if (typeof moduleAliases[alias] === "function") {
            var fromPath = parentModule.filename;
            aliasTarget = moduleAliases[alias](fromPath, request, alias);
            if (!aliasTarget || typeof aliasTarget !== "string") {
              throw new Error("[module-alias] Expecting custom handler function to return path.");
            }
          }
          request = nodePath.join(aliasTarget, request.substr(alias.length));
          break;
        }
      }
      return oldResolveFilename.call(this, request, parentModule, isMain, options);
    };
    function isPathMatchesAlias(path, alias) {
      if (path.indexOf(alias) === 0) {
        if (path.length === alias.length)
          return true;
        if (path[alias.length] === "/")
          return true;
      }
      return false;
    }
    function addPathHelper(path, targetArray) {
      path = nodePath.normalize(path);
      if (targetArray && targetArray.indexOf(path) === -1) {
        targetArray.unshift(path);
      }
    }
    function removePathHelper(path, targetArray) {
      if (targetArray) {
        var index = targetArray.indexOf(path);
        if (index !== -1) {
          targetArray.splice(index, 1);
        }
      }
    }
    function addPath(path) {
      var parent;
      path = nodePath.normalize(path);
      if (modulePaths.indexOf(path) === -1) {
        modulePaths.push(path);
        var mainModule = getMainModule();
        if (mainModule) {
          addPathHelper(path, mainModule.paths);
        }
        parent = module2.parent;
        while (parent && parent !== mainModule) {
          addPathHelper(path, parent.paths);
          parent = parent.parent;
        }
      }
    }
    function addAliases(aliases) {
      for (var alias in aliases) {
        addAlias(alias, aliases[alias]);
      }
    }
    function addAlias(alias, target) {
      moduleAliases[alias] = target;
      moduleAliasNames = Object.keys(moduleAliases);
      moduleAliasNames.sort();
    }
    function reset() {
      var mainModule = getMainModule();
      modulePaths.forEach(function(path) {
        if (mainModule) {
          removePathHelper(path, mainModule.paths);
        }
        Object.getOwnPropertyNames(require.cache).forEach(function(name) {
          if (name.indexOf(path) !== -1) {
            delete require.cache[name];
          }
        });
        var parent = module2.parent;
        while (parent && parent !== mainModule) {
          removePathHelper(path, parent.paths);
          parent = parent.parent;
        }
      });
      modulePaths = [];
      moduleAliases = {};
      moduleAliasNames = [];
    }
    function init(options) {
      if (typeof options === "string") {
        options = { base: options };
      }
      options = options || {};
      var candidatePackagePaths;
      if (options.base) {
        candidatePackagePaths = [nodePath.resolve(options.base.replace(/\/package\.json$/, ""))];
      } else {
        candidatePackagePaths = [nodePath.join(__dirname, "../.."), process.cwd()];
      }
      var npmPackage;
      var base;
      for (var i in candidatePackagePaths) {
        try {
          base = candidatePackagePaths[i];
          npmPackage = require(nodePath.join(base, "package.json"));
          break;
        } catch (e) {
        }
      }
      if (typeof npmPackage !== "object") {
        var pathString = candidatePackagePaths.join(",\n");
        throw new Error("Unable to find package.json in any of:\n[" + pathString + "]");
      }
      var aliases = npmPackage._moduleAliases || {};
      for (var alias in aliases) {
        if (aliases[alias][0] !== "/") {
          aliases[alias] = nodePath.join(base, aliases[alias]);
        }
      }
      addAliases(aliases);
      if (npmPackage._moduleDirectories instanceof Array) {
        npmPackage._moduleDirectories.forEach(function(dir) {
          if (dir === "node_modules")
            return;
          var modulePath = nodePath.join(base, dir);
          addPath(modulePath);
        });
      }
    }
    function getMainModule() {
      return require.main._simulateRepl ? void 0 : require.main;
    }
    module2.exports = init;
    module2.exports.addPath = addPath;
    module2.exports.addAlias = addAlias;
    module2.exports.addAliases = addAliases;
    module2.exports.isPathMatchesAlias = isPathMatchesAlias;
    module2.exports.reset = reset;
  }
});

// node_modules/basic-auth/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/basic-auth/node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/basic-auth/index.js
var require_basic_auth = __commonJS({
  "node_modules/basic-auth/index.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    module2.exports = auth;
    module2.exports.parse = parse;
    var CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;
    var USER_PASS_REGEXP = /^([^:]*):(.*)$/;
    function auth(req) {
      if (!req) {
        throw new TypeError("argument req is required");
      }
      if (typeof req !== "object") {
        throw new TypeError("argument req is required to be an object");
      }
      var header = getAuthorization(req);
      return parse(header);
    }
    function decodeBase64(str) {
      return Buffer2.from(str, "base64").toString();
    }
    function getAuthorization(req) {
      if (!req.headers || typeof req.headers !== "object") {
        throw new TypeError("argument req is required to have headers property");
      }
      return req.headers.authorization;
    }
    function parse(string) {
      if (typeof string !== "string") {
        return void 0;
      }
      var match = CREDENTIALS_REGEXP.exec(string);
      if (!match) {
        return void 0;
      }
      var userPass = USER_PASS_REGEXP.exec(decodeBase64(match[1]));
      if (!userPass) {
        return void 0;
      }
      return new Credentials(userPass[1], userPass[2]);
    }
    function Credentials(name, pass) {
      this.name = name;
      this.pass = pass;
    }
  }
});

// node_modules/morgan/node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/morgan/node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + "d";
      }
      if (ms >= h) {
        return Math.round(ms / h) + "h";
      }
      if (ms >= m) {
        return Math.round(ms / m) + "m";
      }
      if (ms >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
    }
    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + " " + name;
      }
      return Math.ceil(ms / n) + " " + name + "s";
    }
  }
});

// node_modules/morgan/node_modules/debug/src/debug.js
var require_debug = __commonJS({
  "node_modules/morgan/node_modules/debug/src/debug.js"(exports2, module2) {
    exports2 = module2.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports2.coerce = coerce;
    exports2.disable = disable;
    exports2.enable = enable;
    exports2.enabled = enabled;
    exports2.humanize = require_ms();
    exports2.names = [];
    exports2.skips = [];
    exports2.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports2.colors[Math.abs(hash) % exports2.colors.length];
    }
    function createDebug(namespace) {
      function debug() {
        if (!debug.enabled)
          return;
        var self = debug;
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports2.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%")
            return match;
          index++;
          var formatter = exports2.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports2.formatArgs.call(self, args);
        var logFn = debug.log || exports2.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      debug.namespace = namespace;
      debug.enabled = exports2.enabled(namespace);
      debug.useColors = exports2.useColors();
      debug.color = selectColor(namespace);
      if ("function" === typeof exports2.init) {
        exports2.init(debug);
      }
      return debug;
    }
    function enable(namespaces) {
      exports2.save(namespaces);
      exports2.names = [];
      exports2.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i])
          continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports2.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports2.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports2.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports2.skips.length; i < len; i++) {
        if (exports2.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports2.names.length; i < len; i++) {
        if (exports2.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error)
        return val.stack || val.message;
      return val;
    }
  }
});

// node_modules/morgan/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/morgan/node_modules/debug/src/browser.js"(exports2, module2) {
    exports2 = module2.exports = require_debug();
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports2.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports2.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports2.humanize(this.diff);
      if (!useColors2)
        return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match)
          return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports2.storage.removeItem("debug");
        } else {
          exports2.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports2.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports2.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  }
});

// node_modules/morgan/node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/morgan/node_modules/debug/src/node.js"(exports2, module2) {
    var tty = require("tty");
    var util = require("util");
    exports2 = module2.exports = require_debug();
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.colors = [6, 2, 3, 4, 5, 1];
    exports2.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val))
        val = true;
      else if (/^(no|off|false|disabled)$/i.test(val))
        val = false;
      else if (val === "null")
        val = null;
      else
        val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(fd);
    }
    exports2.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports2.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports2.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = new Date().toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs = require("fs");
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require("net");
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports2.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    exports2.enable(load());
  }
});

// node_modules/morgan/node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/morgan/node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process !== "undefined" && process.type === "renderer") {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/depd/index.js
var require_depd = __commonJS({
  "node_modules/depd/index.js"(exports2, module2) {
    var relative = require("path").relative;
    module2.exports = depd;
    var basePath = process.cwd();
    function containsNamespace(str, namespace) {
      var vals = str.split(/[ ,]+/);
      var ns = String(namespace).toLowerCase();
      for (var i = 0; i < vals.length; i++) {
        var val = vals[i];
        if (val && (val === "*" || val.toLowerCase() === ns)) {
          return true;
        }
      }
      return false;
    }
    function convertDataDescriptorToAccessor(obj, prop, message) {
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      var value = descriptor.value;
      descriptor.get = function getter() {
        return value;
      };
      if (descriptor.writable) {
        descriptor.set = function setter(val) {
          return value = val;
        };
      }
      delete descriptor.value;
      delete descriptor.writable;
      Object.defineProperty(obj, prop, descriptor);
      return descriptor;
    }
    function createArgumentsString(arity) {
      var str = "";
      for (var i = 0; i < arity; i++) {
        str += ", arg" + i;
      }
      return str.substr(2);
    }
    function createStackString(stack) {
      var str = this.name + ": " + this.namespace;
      if (this.message) {
        str += " deprecated " + this.message;
      }
      for (var i = 0; i < stack.length; i++) {
        str += "\n    at " + stack[i].toString();
      }
      return str;
    }
    function depd(namespace) {
      if (!namespace) {
        throw new TypeError("argument namespace is required");
      }
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      var file = site[0];
      function deprecate(message) {
        log.call(deprecate, message);
      }
      deprecate._file = file;
      deprecate._ignored = isignored(namespace);
      deprecate._namespace = namespace;
      deprecate._traced = istraced(namespace);
      deprecate._warned = /* @__PURE__ */ Object.create(null);
      deprecate.function = wrapfunction;
      deprecate.property = wrapproperty;
      return deprecate;
    }
    function eehaslisteners(emitter, type) {
      var count = typeof emitter.listenerCount !== "function" ? emitter.listeners(type).length : emitter.listenerCount(type);
      return count > 0;
    }
    function isignored(namespace) {
      if (process.noDeprecation) {
        return true;
      }
      var str = process.env.NO_DEPRECATION || "";
      return containsNamespace(str, namespace);
    }
    function istraced(namespace) {
      if (process.traceDeprecation) {
        return true;
      }
      var str = process.env.TRACE_DEPRECATION || "";
      return containsNamespace(str, namespace);
    }
    function log(message, site) {
      var haslisteners = eehaslisteners(process, "deprecation");
      if (!haslisteners && this._ignored) {
        return;
      }
      var caller;
      var callFile;
      var callSite;
      var depSite;
      var i = 0;
      var seen = false;
      var stack = getStack();
      var file = this._file;
      if (site) {
        depSite = site;
        callSite = callSiteLocation(stack[1]);
        callSite.name = depSite.name;
        file = callSite[0];
      } else {
        i = 2;
        depSite = callSiteLocation(stack[i]);
        callSite = depSite;
      }
      for (; i < stack.length; i++) {
        caller = callSiteLocation(stack[i]);
        callFile = caller[0];
        if (callFile === file) {
          seen = true;
        } else if (callFile === this._file) {
          file = this._file;
        } else if (seen) {
          break;
        }
      }
      var key = caller ? depSite.join(":") + "__" + caller.join(":") : void 0;
      if (key !== void 0 && key in this._warned) {
        return;
      }
      this._warned[key] = true;
      var msg = message;
      if (!msg) {
        msg = callSite === depSite || !callSite.name ? defaultMessage(depSite) : defaultMessage(callSite);
      }
      if (haslisteners) {
        var err = DeprecationError(this._namespace, msg, stack.slice(i));
        process.emit("deprecation", err);
        return;
      }
      var format = process.stderr.isTTY ? formatColor : formatPlain;
      var output = format.call(this, msg, caller, stack.slice(i));
      process.stderr.write(output + "\n", "utf8");
    }
    function callSiteLocation(callSite) {
      var file = callSite.getFileName() || "<anonymous>";
      var line = callSite.getLineNumber();
      var colm = callSite.getColumnNumber();
      if (callSite.isEval()) {
        file = callSite.getEvalOrigin() + ", " + file;
      }
      var site = [file, line, colm];
      site.callSite = callSite;
      site.name = callSite.getFunctionName();
      return site;
    }
    function defaultMessage(site) {
      var callSite = site.callSite;
      var funcName = site.name;
      if (!funcName) {
        funcName = "<anonymous@" + formatLocation(site) + ">";
      }
      var context = callSite.getThis();
      var typeName = context && callSite.getTypeName();
      if (typeName === "Object") {
        typeName = void 0;
      }
      if (typeName === "Function") {
        typeName = context.name || typeName;
      }
      return typeName && callSite.getMethodName() ? typeName + "." + funcName : funcName;
    }
    function formatPlain(msg, caller, stack) {
      var timestamp = new Date().toUTCString();
      var formatted = timestamp + " " + this._namespace + " deprecated " + msg;
      if (this._traced) {
        for (var i = 0; i < stack.length; i++) {
          formatted += "\n    at " + stack[i].toString();
        }
        return formatted;
      }
      if (caller) {
        formatted += " at " + formatLocation(caller);
      }
      return formatted;
    }
    function formatColor(msg, caller, stack) {
      var formatted = "\x1B[36;1m" + this._namespace + "\x1B[22;39m \x1B[33;1mdeprecated\x1B[22;39m \x1B[0m" + msg + "\x1B[39m";
      if (this._traced) {
        for (var i = 0; i < stack.length; i++) {
          formatted += "\n    \x1B[36mat " + stack[i].toString() + "\x1B[39m";
        }
        return formatted;
      }
      if (caller) {
        formatted += " \x1B[36m" + formatLocation(caller) + "\x1B[39m";
      }
      return formatted;
    }
    function formatLocation(callSite) {
      return relative(basePath, callSite[0]) + ":" + callSite[1] + ":" + callSite[2];
    }
    function getStack() {
      var limit = Error.stackTraceLimit;
      var obj = {};
      var prep = Error.prepareStackTrace;
      Error.prepareStackTrace = prepareObjectStackTrace;
      Error.stackTraceLimit = Math.max(10, limit);
      Error.captureStackTrace(obj);
      var stack = obj.stack.slice(1);
      Error.prepareStackTrace = prep;
      Error.stackTraceLimit = limit;
      return stack;
    }
    function prepareObjectStackTrace(obj, stack) {
      return stack;
    }
    function wrapfunction(fn, message) {
      if (typeof fn !== "function") {
        throw new TypeError("argument fn must be a function");
      }
      var args = createArgumentsString(fn.length);
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      site.name = fn.name;
      var deprecatedfn = new Function(
        "fn",
        "log",
        "deprecate",
        "message",
        "site",
        '"use strict"\nreturn function (' + args + ") {log.call(deprecate, message, site)\nreturn fn.apply(this, arguments)\n}"
      )(fn, log, this, message, site);
      return deprecatedfn;
    }
    function wrapproperty(obj, prop, message) {
      if (!obj || typeof obj !== "object" && typeof obj !== "function") {
        throw new TypeError("argument obj must be object");
      }
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!descriptor) {
        throw new TypeError("must call property on owner object");
      }
      if (!descriptor.configurable) {
        throw new TypeError("property must be configurable");
      }
      var deprecate = this;
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      site.name = prop;
      if ("value" in descriptor) {
        descriptor = convertDataDescriptorToAccessor(obj, prop, message);
      }
      var get = descriptor.get;
      var set = descriptor.set;
      if (typeof get === "function") {
        descriptor.get = function getter() {
          log.call(deprecate, message, site);
          return get.apply(this, arguments);
        };
      }
      if (typeof set === "function") {
        descriptor.set = function setter() {
          log.call(deprecate, message, site);
          return set.apply(this, arguments);
        };
      }
      Object.defineProperty(obj, prop, descriptor);
    }
    function DeprecationError(namespace, message, stack) {
      var error = new Error();
      var stackString;
      Object.defineProperty(error, "constructor", {
        value: DeprecationError
      });
      Object.defineProperty(error, "message", {
        configurable: true,
        enumerable: false,
        value: message,
        writable: true
      });
      Object.defineProperty(error, "name", {
        enumerable: false,
        configurable: true,
        value: "DeprecationError",
        writable: true
      });
      Object.defineProperty(error, "namespace", {
        configurable: true,
        enumerable: false,
        value: namespace,
        writable: true
      });
      Object.defineProperty(error, "stack", {
        configurable: true,
        enumerable: false,
        get: function() {
          if (stackString !== void 0) {
            return stackString;
          }
          return stackString = createStackString.call(this, stack);
        },
        set: function setter(val) {
          stackString = val;
        }
      });
      return error;
    }
  }
});

// node_modules/ee-first/index.js
var require_ee_first = __commonJS({
  "node_modules/ee-first/index.js"(exports2, module2) {
    "use strict";
    module2.exports = first;
    function first(stuff, done) {
      if (!Array.isArray(stuff))
        throw new TypeError("arg must be an array of [ee, events...] arrays");
      var cleanups = [];
      for (var i = 0; i < stuff.length; i++) {
        var arr = stuff[i];
        if (!Array.isArray(arr) || arr.length < 2)
          throw new TypeError("each array member must be [ee, events...]");
        var ee = arr[0];
        for (var j = 1; j < arr.length; j++) {
          var event = arr[j];
          var fn = listener(event, callback);
          ee.on(event, fn);
          cleanups.push({
            ee,
            event,
            fn
          });
        }
      }
      function callback() {
        cleanup();
        done.apply(null, arguments);
      }
      function cleanup() {
        var x;
        for (var i2 = 0; i2 < cleanups.length; i2++) {
          x = cleanups[i2];
          x.ee.removeListener(x.event, x.fn);
        }
      }
      function thunk(fn2) {
        done = fn2;
      }
      thunk.cancel = cleanup;
      return thunk;
    }
    function listener(event, done) {
      return function onevent(arg1) {
        var args = new Array(arguments.length);
        var ee = this;
        var err = event === "error" ? arg1 : null;
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        done(err, ee, event, args);
      };
    }
  }
});

// node_modules/morgan/node_modules/on-finished/index.js
var require_on_finished = __commonJS({
  "node_modules/morgan/node_modules/on-finished/index.js"(exports2, module2) {
    "use strict";
    module2.exports = onFinished;
    module2.exports.isFinished = isFinished;
    var first = require_ee_first();
    var defer = typeof setImmediate === "function" ? setImmediate : function(fn) {
      process.nextTick(fn.bind.apply(fn, arguments));
    };
    function onFinished(msg, listener) {
      if (isFinished(msg) !== false) {
        defer(listener, null, msg);
        return msg;
      }
      attachListener(msg, listener);
      return msg;
    }
    function isFinished(msg) {
      var socket = msg.socket;
      if (typeof msg.finished === "boolean") {
        return Boolean(msg.finished || socket && !socket.writable);
      }
      if (typeof msg.complete === "boolean") {
        return Boolean(msg.upgrade || !socket || !socket.readable || msg.complete && !msg.readable);
      }
      return void 0;
    }
    function attachFinishedListener(msg, callback) {
      var eeMsg;
      var eeSocket;
      var finished = false;
      function onFinish(error) {
        eeMsg.cancel();
        eeSocket.cancel();
        finished = true;
        callback(error);
      }
      eeMsg = eeSocket = first([[msg, "end", "finish"]], onFinish);
      function onSocket(socket) {
        msg.removeListener("socket", onSocket);
        if (finished)
          return;
        if (eeMsg !== eeSocket)
          return;
        eeSocket = first([[socket, "error", "close"]], onFinish);
      }
      if (msg.socket) {
        onSocket(msg.socket);
        return;
      }
      msg.on("socket", onSocket);
      if (msg.socket === void 0) {
        patchAssignSocket(msg, onSocket);
      }
    }
    function attachListener(msg, listener) {
      var attached = msg.__onFinished;
      if (!attached || !attached.queue) {
        attached = msg.__onFinished = createListener(msg);
        attachFinishedListener(msg, attached);
      }
      attached.queue.push(listener);
    }
    function createListener(msg) {
      function listener(err) {
        if (msg.__onFinished === listener)
          msg.__onFinished = null;
        if (!listener.queue)
          return;
        var queue = listener.queue;
        listener.queue = null;
        for (var i = 0; i < queue.length; i++) {
          queue[i](err, msg);
        }
      }
      listener.queue = [];
      return listener;
    }
    function patchAssignSocket(res, callback) {
      var assignSocket = res.assignSocket;
      if (typeof assignSocket !== "function")
        return;
      res.assignSocket = function _assignSocket(socket) {
        assignSocket.call(this, socket);
        callback(socket);
      };
    }
  }
});

// node_modules/on-headers/index.js
var require_on_headers = __commonJS({
  "node_modules/on-headers/index.js"(exports2, module2) {
    "use strict";
    module2.exports = onHeaders;
    function createWriteHead(prevWriteHead, listener) {
      var fired = false;
      return function writeHead(statusCode) {
        var args = setWriteHeadHeaders.apply(this, arguments);
        if (!fired) {
          fired = true;
          listener.call(this);
          if (typeof args[0] === "number" && this.statusCode !== args[0]) {
            args[0] = this.statusCode;
            args.length = 1;
          }
        }
        return prevWriteHead.apply(this, args);
      };
    }
    function onHeaders(res, listener) {
      if (!res) {
        throw new TypeError("argument res is required");
      }
      if (typeof listener !== "function") {
        throw new TypeError("argument listener must be a function");
      }
      res.writeHead = createWriteHead(res.writeHead, listener);
    }
    function setHeadersFromArray(res, headers) {
      for (var i = 0; i < headers.length; i++) {
        res.setHeader(headers[i][0], headers[i][1]);
      }
    }
    function setHeadersFromObject(res, headers) {
      var keys = Object.keys(headers);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k)
          res.setHeader(k, headers[k]);
      }
    }
    function setWriteHeadHeaders(statusCode) {
      var length = arguments.length;
      var headerIndex = length > 1 && typeof arguments[1] === "string" ? 2 : 1;
      var headers = length >= headerIndex + 1 ? arguments[headerIndex] : void 0;
      this.statusCode = statusCode;
      if (Array.isArray(headers)) {
        setHeadersFromArray(this, headers);
      } else if (headers) {
        setHeadersFromObject(this, headers);
      }
      var args = new Array(Math.min(length, headerIndex));
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
  }
});

// node_modules/morgan/index.js
var require_morgan = __commonJS({
  "node_modules/morgan/index.js"(exports2, module2) {
    "use strict";
    module2.exports = morgan2;
    module2.exports.compile = compile;
    module2.exports.format = format;
    module2.exports.token = token;
    var auth = require_basic_auth();
    var debug = require_src()("morgan");
    var deprecate = require_depd()("morgan");
    var onFinished = require_on_finished();
    var onHeaders = require_on_headers();
    var CLF_MONTH = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    var DEFAULT_BUFFER_DURATION = 1e3;
    function morgan2(format2, options) {
      var fmt = format2;
      var opts = options || {};
      if (format2 && typeof format2 === "object") {
        opts = format2;
        fmt = opts.format || "default";
        deprecate("morgan(options): use morgan(" + (typeof fmt === "string" ? JSON.stringify(fmt) : "format") + ", options) instead");
      }
      if (fmt === void 0) {
        deprecate("undefined format: specify a format");
      }
      var immediate = opts.immediate;
      var skip = opts.skip || false;
      var formatLine = typeof fmt !== "function" ? getFormatFunction(fmt) : fmt;
      var buffer = opts.buffer;
      var stream = opts.stream || process.stdout;
      if (buffer) {
        deprecate("buffer option");
        var interval = typeof buffer !== "number" ? DEFAULT_BUFFER_DURATION : buffer;
        stream = createBufferStream(stream, interval);
      }
      return function logger(req, res, next) {
        req._startAt = void 0;
        req._startTime = void 0;
        req._remoteAddress = getip(req);
        res._startAt = void 0;
        res._startTime = void 0;
        recordStartTime.call(req);
        function logRequest() {
          if (skip !== false && skip(req, res)) {
            debug("skip request");
            return;
          }
          var line = formatLine(morgan2, req, res);
          if (line == null) {
            debug("skip line");
            return;
          }
          debug("log request");
          stream.write(line + "\n");
        }
        ;
        if (immediate) {
          logRequest();
        } else {
          onHeaders(res, recordStartTime);
          onFinished(res, logRequest);
        }
        next();
      };
    }
    morgan2.format("combined", ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
    morgan2.format("common", ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]');
    morgan2.format("default", ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
    deprecate.property(morgan2, "default", "default format: use combined format");
    morgan2.format("short", ":remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms");
    morgan2.format("tiny", ":method :url :status :res[content-length] - :response-time ms");
    morgan2.format("dev", function developmentFormatLine(tokens, req, res) {
      var status = headersSent(res) ? res.statusCode : void 0;
      var color = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
      var fn = developmentFormatLine[color];
      if (!fn) {
        fn = developmentFormatLine[color] = compile("\x1B[0m:method :url \x1B[" + color + "m:status\x1B[0m :response-time ms - :res[content-length]\x1B[0m");
      }
      return fn(tokens, req, res);
    });
    morgan2.token("url", function getUrlToken(req) {
      return req.originalUrl || req.url;
    });
    morgan2.token("method", function getMethodToken(req) {
      return req.method;
    });
    morgan2.token("response-time", function getResponseTimeToken(req, res, digits) {
      if (!req._startAt || !res._startAt) {
        return;
      }
      var ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
      return ms.toFixed(digits === void 0 ? 3 : digits);
    });
    morgan2.token("total-time", function getTotalTimeToken(req, res, digits) {
      if (!req._startAt || !res._startAt) {
        return;
      }
      var elapsed = process.hrtime(req._startAt);
      var ms = elapsed[0] * 1e3 + elapsed[1] * 1e-6;
      return ms.toFixed(digits === void 0 ? 3 : digits);
    });
    morgan2.token("date", function getDateToken(req, res, format2) {
      var date = new Date();
      switch (format2 || "web") {
        case "clf":
          return clfdate(date);
        case "iso":
          return date.toISOString();
        case "web":
          return date.toUTCString();
      }
    });
    morgan2.token("status", function getStatusToken(req, res) {
      return headersSent(res) ? String(res.statusCode) : void 0;
    });
    morgan2.token("referrer", function getReferrerToken(req) {
      return req.headers.referer || req.headers.referrer;
    });
    morgan2.token("remote-addr", getip);
    morgan2.token("remote-user", function getRemoteUserToken(req) {
      var credentials = auth(req);
      return credentials ? credentials.name : void 0;
    });
    morgan2.token("http-version", function getHttpVersionToken(req) {
      return req.httpVersionMajor + "." + req.httpVersionMinor;
    });
    morgan2.token("user-agent", function getUserAgentToken(req) {
      return req.headers["user-agent"];
    });
    morgan2.token("req", function getRequestToken(req, res, field) {
      var header = req.headers[field.toLowerCase()];
      return Array.isArray(header) ? header.join(", ") : header;
    });
    morgan2.token("res", function getResponseHeader(req, res, field) {
      if (!headersSent(res)) {
        return void 0;
      }
      var header = res.getHeader(field);
      return Array.isArray(header) ? header.join(", ") : header;
    });
    function clfdate(dateTime) {
      var date = dateTime.getUTCDate();
      var hour = dateTime.getUTCHours();
      var mins = dateTime.getUTCMinutes();
      var secs = dateTime.getUTCSeconds();
      var year = dateTime.getUTCFullYear();
      var month = CLF_MONTH[dateTime.getUTCMonth()];
      return pad2(date) + "/" + month + "/" + year + ":" + pad2(hour) + ":" + pad2(mins) + ":" + pad2(secs) + " +0000";
    }
    function compile(format2) {
      if (typeof format2 !== "string") {
        throw new TypeError("argument format must be a string");
      }
      var fmt = String(JSON.stringify(format2));
      var js = '  "use strict"\n  return ' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function(_, name, arg) {
        var tokenArguments = "req, res";
        var tokenFunction = "tokens[" + String(JSON.stringify(name)) + "]";
        if (arg !== void 0) {
          tokenArguments += ", " + String(JSON.stringify(arg));
        }
        return '" +\n    (' + tokenFunction + "(" + tokenArguments + ') || "-") + "';
      });
      return new Function("tokens, req, res", js);
    }
    function createBufferStream(stream, interval) {
      var buf = [];
      var timer = null;
      function flush() {
        timer = null;
        stream.write(buf.join(""));
        buf.length = 0;
      }
      function write(str) {
        if (timer === null) {
          timer = setTimeout(flush, interval);
        }
        buf.push(str);
      }
      return { write };
    }
    function format(name, fmt) {
      morgan2[name] = fmt;
      return this;
    }
    function getFormatFunction(name) {
      var fmt = morgan2[name] || name || morgan2.default;
      return typeof fmt !== "function" ? compile(fmt) : fmt;
    }
    function getip(req) {
      return req.ip || req._remoteAddress || req.connection && req.connection.remoteAddress || void 0;
    }
    function headersSent(res) {
      return typeof res.headersSent !== "boolean" ? Boolean(res._header) : res.headersSent;
    }
    function pad2(num) {
      var str = String(num);
      return (str.length === 1 ? "0" : "") + str;
    }
    function recordStartTime() {
      this._startAt = process.hrtime();
      this._startTime = new Date();
    }
    function token(name, fn) {
      morgan2[name] = fn;
      return this;
    }
  }
});

// src/app.ts
var import_express = __toESM(require("express"));
var import_dotenv2 = __toESM(require("dotenv"));

// node_modules/module-alias/register.js
require_module_alias()();

// src/config/conn.ts
var import_mongoose = __toESM(require("mongoose"));
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var connectDB = () => __async(void 0, null, function* () {
  import_mongoose.default.set("strictQuery", false);
  const conn = yield import_mongoose.default.connect(process.env.DB_HOST || "");
  return conn;
});
var conn_default = connectDB;

// src/app.ts
var import_morgan = __toESM(require_morgan());
var port = process.env.PORT || 5e3;
var app = (0, import_express.default)();
app.use(import_express.default.json());
app.use((0, import_morgan.default)("tiny"));
import_dotenv2.default.config();
app.all("*", (req, res, next) => __async(exports, null, function* () {
  return next(res.status(404).json({
    message: "Invalid Route Boss"
  }));
}));
app.use("*", (err, req, res) => __async(exports, null, function* () {
  res.status(400).json({
    message: err.message || "An Unknown Error occurred"
  });
}));
app.get("/", (req, res) => {
  res.send("Hello Node Js!");
});
conn_default().then(() => {
  try {
    app.listen(port, () => console.log(`Server listening & database connected on ${port}`));
  } catch (e) {
    console.log("Cannot connect to the server");
  }
}).catch((e) => {
  console.log("Invalid database connection...! ", +e);
});
/*!
 * basic-auth
 * Copyright(c) 2013 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * depd
 * Copyright(c) 2014-2018 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * ee-first
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */
/*!
 * morgan
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * on-finished
 * Copyright(c) 2013 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * on-headers
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */
