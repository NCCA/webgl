// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  // TOTAL_MEMORY is the current size of the actual array, and DYNAMICTOP is the new top.

  while (TOTAL_MEMORY <= DYNAMICTOP) { // Simple heuristic.
    TOTAL_MEMORY = alignMemoryPage(2*TOTAL_MEMORY);
  }
  assert(TOTAL_MEMORY <= Math.pow(2, 30)); // 2^30==1GB is a practical maximum - 2^31 is already close to possible negative numbers etc.
  var oldHEAP8 = HEAP8;
  var buffer = new ArrayBuffer(TOTAL_MEMORY);
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
  HEAP8.set(oldHEAP8);
  _emscripten_replace_memory(HEAP8, HEAP16, HEAP32, HEAPU8, HEAPU16, HEAPU32, HEAPF32, HEAPF64);
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===
var __ZTVN10__cxxabiv117__class_type_infoE = 13248;
var __ZTVN10__cxxabiv120__si_class_type_infoE = 13288;




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(14115);
/* global initializers */ __ATINIT__.push({ func: function() { __GLOBAL__I_a() } }, { func: function() { __GLOBAL__I_a698() } });


/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,83,68,76,32,84,104,101,114,101,32,105,115,32,97,32,103,111,111,100,32,99,104,97,110,103,101,32,121,111,117,114,32,98,114,111,119,115,101,114,32,100,111,101,115,110,39,116,32,115,117,112,112,111,114,116,32,119,101,98,71,76,32,60,60,0,0,0,10,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,115,101,116,32,118,105,100,101,111,32,109,111,100,101,58,32], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([48,6,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,240,51,0,0,16,6,0,0,96,12,0,0,0,0,0,0,0,0,0,0,152,6,0,0,3,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,240,51,0,0,128,6,0,0,96,12,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,0,0,0,0,48,7,0,0,5,0,0,0,6,0,0,0,3,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,8,0,0,0,9,0,0,0,6,0,0,0,10,0,0,0,11,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,240,51,0,0,16,7,0,0,32,12,0,0,0,0,0,0,0,0,0,0,152,7,0,0,7,0,0,0,8,0,0,0,4,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,13,0,0,0,14,0,0,0,7,0,0,0,8,0,0,0,8,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,240,51,0,0,128,7,0,0,32,12,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,200,51,0,0,168,7,0,0,0,0,0,0,16,8,0,0,9,0,0,0,10,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,120,8,0,0,11,0,0,0,12,0,0,0,16,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,240,51,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,8,0,0,9,0,0,0,13,0,0,0,15,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,240,51,0,0,56,8,0,0,16,8,0,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,240,51,0,0,96,8,0,0,0,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,0,0,0,0,192,8,0,0,14,0,0,0,15,0,0,0,16,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,240,51,0,0,168,8,0,0,120,8,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,200,51,0,0,208,8,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,240,51,0,0,248,8,0,0,240,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,0,0,0,0,32,12,0,0,16,0,0,0,17,0,0,0,5,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,10,0,0,0,11,0,0,0,5,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,96,12,0,0,18,0,0,0,19,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,152,12,0,0,20,0,0,0,21,0,0,0,248,255,255,255,248,255,255,255,152,12,0,0,22,0,0,0,23,0,0,0,8,0,0,0,0,0,0,0,224,12,0,0,24,0,0,0,25,0,0,0,248,255,255,255,248,255,255,255,224,12,0,0,26,0,0,0,27,0,0,0,4,0,0,0,0,0,0,0,40,13,0,0,28,0,0,0,29,0,0,0,252,255,255,255,252,255,255,255,40,13,0,0,30,0,0,0,31,0,0,0,4,0,0,0,0,0,0,0,112,13,0,0,32,0,0,0,33,0,0,0,252,255,255,255,252,255,255,255,112,13,0,0,34,0,0,0,35,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,11,0,0,36,0,0,0,37,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,96,11,0,0,38,0,0,0,39,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,240,51,0,0,24,11,0,0,192,8,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,200,51,0,0,72,11,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,240,51,0,0,104,11,0,0,96,11,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,240,51,0,0,168,11,0,0,96,11,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,200,51,0,0,232,11,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,200,51,0,0,40,12,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,80,52,0,0,104,12,0,0,0,0,0,0,1,0,0,0,152,11,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,80,52,0,0,176,12,0,0,0,0,0,0,1,0,0,0,216,11,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,80,52,0,0,248,12,0,0,0,0,0,0,1,0,0,0,152,11,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,80,52,0,0,64,13,0,0,0,0,0,0,1,0,0,0,216,11,0,0,3,244,255,255,0,0,0,0,208,13,0,0,40,0,0,0,41,0,0,0,17,0,0,0,1,0,0,0,9,0,0,0,10,0,0,0,2,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,240,51,0,0,176,13,0,0,16,9,0,0,0,0,0,0,0,0,0,0,248,27,0,0,42,0,0,0,43,0,0,0,44,0,0,0,1,0,0,0,3,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,28,0,0,45,0,0,0,46,0,0,0,44,0,0,0,2,0,0,0,4,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,32,0,0,47,0,0,0,48,0,0,0,44,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,104,33,0,0,49,0,0,0,50,0,0,0,44,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,34,0,0,51,0,0,0,52,0,0,0,44,0,0,0,3,0,0,0,4,0,0,0,23,0,0,0,5,0,0,0,24,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,34,0,0,53,0,0,0,54,0,0,0,44,0,0,0,7,0,0,0,8,0,0,0,25,0,0,0,9,0,0,0,26,0,0,0,3,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,232,29,0,0,55,0,0,0,56,0,0,0,44,0,0,0,18,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,1,0,0,0,248,255,255,255,232,29,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,37,109,47,37,100,47,37,121,37,89,45,37,109,45,37,100,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,72,58,37,77,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,136,30,0,0,57,0,0,0,58,0,0,0,44,0,0,0,26,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,2,0,0,0,248,255,255,255,136,30,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,24,31,0,0,59,0,0,0,60,0,0,0,44,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,31,0,0,61,0,0,0,62,0,0,0,44,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,28,0,0,63,0,0,0,64,0,0,0,44,0,0,0,34,0,0,0,35,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,36,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,28,0,0,65,0,0,0,66,0,0,0,44,0,0,0,37,0,0,0,38,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,39,0,0,0,17,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,28,0,0,67,0,0,0,68,0,0,0,44,0,0,0,40,0,0,0,41,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,42,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,29,0,0,69,0,0,0,70,0,0,0,44,0,0,0,43,0,0,0,44,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,45,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,35,0,0,71,0,0,0,72,0,0,0,44,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,76,102,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,0,0,0,0,224,35,0,0,73,0,0,0,74,0,0,0,44,0,0,0,5,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,0,0,0,0,112,36,0,0,75,0,0,0,76,0,0,0,44,0,0,0,1,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,46,48,76,102,0,0,0,0,0,0,0,0,37,0,0,77,0,0,0,78,0,0,0,44,0,0,0,2,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,31,0,0,79,0,0,0,80,0,0,0,44,0,0,0,13,0,0,0,11,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,32,0,0,81,0,0,0,82,0,0,0,44,0,0,0,14,0,0,0,12,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,208,27,0,0,83,0,0,0,84,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,24,0,0,85,0,0,0,86,0,0,0,44,0,0,0,9,0,0,0,15,0,0,0,10,0,0,0,16,0,0,0,11,0,0,0,1,0,0,0,17,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,25,0,0,87,0,0,0,88,0,0,0,44,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,46,0,0,0,47,0,0,0,5,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,27,0,0,89,0,0,0,90,0,0,0,44,0,0,0,49,0,0,0,50,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,0,0,0,0,168,27,0,0,91,0,0,0,92,0,0,0,44,0,0,0,51,0,0,0,52,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,116,114,117,101,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,0,224,23,0,0,93,0,0,0,94,0,0,0,44,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,240,51,0,0,200,23,0,0,200,7,0,0,0,0,0,0,0,0,0,0,112,24,0,0,93,0,0,0,95,0,0,0,44,0,0,0,18,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,12,0,0,0,19,0,0,0,13,0,0,0,20,0,0,0,14,0,0,0,5,0,0,0,21,0,0,0,6,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,200,51,0,0,80,24,0,0,80,52,0,0,56,24,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,24,0,0,2,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,80,52,0,0,144,24,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,24,0,0,2,0,0,0,0,0,0,0,64,25,0,0,93,0,0,0,96,0,0,0,44,0,0,0,3,0,0,0,4,0,0,0,7,0,0,0,53,0,0,0,54,0,0,0,8,0,0,0,55,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,200,51,0,0,32,25,0,0,80,52,0,0,248,24,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,56,25,0,0,2,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,80,52,0,0,96,25,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,56,25,0,0,2,0,0,0,0,0,0,0,0,26,0,0,93,0,0,0,97,0,0,0,44,0,0,0,5,0,0,0,6,0,0,0,9,0,0,0,56,0,0,0,57,0,0,0,10,0,0,0,58,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,80,52,0,0,216,25,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,56,25,0,0,2,0,0,0,0,0,0,0,120,26,0,0,93,0,0,0,98,0,0,0,44,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,59,0,0,0,60,0,0,0,12,0,0,0,61,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,80,52,0,0,80,26,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,56,25,0,0,2,0,0,0,0,0,0,0,240,26,0,0,93,0,0,0,99,0,0,0,44,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,59,0,0,0,60,0,0,0,12,0,0,0,61,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,240,51,0,0,200,26,0,0,120,26,0,0,0,0,0,0,0,0,0,0,88,27,0,0,93,0,0,0,100,0,0,0,44,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,59,0,0,0,60,0,0,0,12,0,0,0,61,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,240,51,0,0,48,27,0,0,120,26,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,240,51,0,0,104,27,0,0,224,23,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,240,51,0,0,144,27,0,0,224,23,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,240,51,0,0,184,27,0,0,224,23,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,240,51,0,0,224,27,0,0,224,23,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,240,51,0,0,8,28,0,0,224,23,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,200,51,0,0,80,28,0,0,80,52,0,0,48,28,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,28,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,80,52,0,0,144,28,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,28,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,80,52,0,0,208,28,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,28,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,80,52,0,0,16,29,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,28,0,0,2,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,200,51,0,0,152,29,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,200,51,0,0,184,29,0,0,80,52,0,0,80,29,0,0,0,0,0,0,3,0,0,0,224,23,0,0,2,0,0,0,176,29,0,0,2,0,0,0,224,29,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,200,51,0,0,88,30,0,0,80,52,0,0,16,30,0,0,0,0,0,0,3,0,0,0,224,23,0,0,2,0,0,0,176,29,0,0,2,0,0,0,128,30,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,200,51,0,0,248,30,0,0,80,52,0,0,176,30,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,16,31,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,80,52,0,0,56,31,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,16,31,0,0,0,8,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,200,51,0,0,184,31,0,0,80,52,0,0,160,31,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,208,31,0,0,2,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,80,52,0,0,248,31,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,208,31,0,0,2,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,200,51,0,0,144,32,0,0,80,52,0,0,120,32,0,0,0,0,0,0,1,0,0,0,176,32,0,0,0,0,0,0,80,52,0,0,48,32,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,184,32,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,80,52,0,0,56,33,0,0,0,0,0,0,1,0,0,0,176,32,0,0,0,0,0,0,80,52,0,0,240,32,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,80,33,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,200,51,0,0,232,33,0,0,80,52,0,0,208,33,0,0,0,0,0,0,1,0,0,0,8,34,0,0,0,0,0,0,80,52,0,0,136,33,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,16,34,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,80,52,0,0,144,34,0,0,0,0,0,0,1,0,0,0,8,34,0,0,0,0,0,0,80,52,0,0,72,34,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,168,34,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,200,51,0,0,40,35,0,0,80,52,0,0,224,34,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,72,35,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,200,51,0,0,184,35,0,0,80,52,0,0,112,35,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,216,35,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,200,51,0,0,72,36,0,0,80,52,0,0,0,36,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,104,36,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,200,51,0,0,216,36,0,0,80,52,0,0,144,36,0,0,0,0,0,0,2,0,0,0,224,23,0,0,2,0,0,0,248,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+1484);
/* memory initializer */ allocate([74,97,110,117,97,114,121,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,77,97,114,99,104,0,0,0,65,112,114,105,108,0,0,0,77,97,121,0,0,0,0,0,74,117,110,101,0,0,0,0,74,117,108,121,0,0,0,0,65,117,103,117,115,116,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,74,97,110,0,0,0,0,0,70,101,98,0,0,0,0,0,77,97,114,0,0,0,0,0,65,112,114,0,0,0,0,0,74,117,110,0,0,0,0,0,74,117,108,0,0,0,0,0,65,117,103,0,0,0,0,0,83,101,112,0,0,0,0,0,79,99,116,0,0,0,0,0,78,111,118,0,0,0,0,0,68,101,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,117,110,100,97,121,0,0,77,111,110,100,97,121,0,0,84,117,101,115,100,97,121,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,77,111,110,0,0,0,0,0,84,117,101,0,0,0,0,0,87,101,100,0,0,0,0,0,84,104,117,0,0,0,0,0,70,114,105,0,0,0,0,0,83,97,116,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,51,0,0,101,0,0,0,102,0,0,0,62,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,200,51,0,0,24,51,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,240,51,0,0,48,51,0,0,0,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,240,51,0,0,80,51,0,0,40,51,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,240,51,0,0,136,51,0,0,120,51,0,0,0,0,0,0,0,0,0,0,176,51,0,0,103,0,0,0,104,0,0,0,105,0,0,0,106,0,0,0,22,0,0,0,13,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,56,52,0,0,103,0,0,0,107,0,0,0,105,0,0,0,106,0,0,0,22,0,0,0,14,0,0,0,2,0,0,0,6,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,240,51,0,0,16,52,0,0,176,51,0,0,0,0,0,0,0,0,0,0,152,52,0,0,103,0,0,0,108,0,0,0,105,0,0,0,106,0,0,0,22,0,0,0,15,0,0,0,3,0,0,0,7,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,240,51,0,0,112,52,0,0,176,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,54,0,0,109,0,0,0,110,0,0,0,63,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,240,51,0,0,200,54,0,0,0,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,110,97,110,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+11744);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _llvm_lifetime_end() {}

  
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

   
  Module["_i64Subtract"] = _i64Subtract;

  
  var GL={counter:1,lastError:0,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],clientBuffers:[],currArrayBuffer:0,currElementArrayBuffer:0,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},packAlignment:4,unpackAlignment:4,init:function () {
        GL.createLog2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
        Browser.moduleContextCreatedCallbacks.push(GL.initExtensions);
      },recordError:function recordError(errorCode) {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },getNewId:function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },MINI_TEMP_BUFFER_SIZE:16,miniTempBuffer:null,miniTempBufferViews:[0],MAX_TEMP_BUFFER_SIZE:2097152,tempVertexBuffers1:[],tempVertexBufferCounters1:[],tempVertexBuffers2:[],tempVertexBufferCounters2:[],numTempVertexBuffersPerSize:64,tempIndexBuffers:[],tempQuadIndexBuffer:null,log2ceilLookup:null,createLog2ceilLookup:function (maxValue) {
        GL.log2ceilLookup = new Uint8Array(maxValue+1);
        var log2 = 0;
        var pow2 = 1;
        GL.log2ceilLookup[0] = 0;
        for(var i = 1; i <= maxValue; ++i) {
          if (i > pow2) {
            pow2 <<= 1;
            ++log2;
          }
          GL.log2ceilLookup[i] = log2;
        }
      },generateTempBuffers:function (quads) {
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        GL.tempVertexBufferCounters1.length = GL.tempVertexBufferCounters2.length = largestIndex+1;
        GL.tempVertexBuffers1.length = GL.tempVertexBuffers2.length = largestIndex+1;
        GL.tempIndexBuffers.length = largestIndex+1;
        for(var i = 0; i <= largestIndex; ++i) {
          GL.tempIndexBuffers[i] = null; // Created on-demand
          GL.tempVertexBufferCounters1[i] = GL.tempVertexBufferCounters2[i] = 0;
          var ringbufferLength = GL.numTempVertexBuffersPerSize;
          GL.tempVertexBuffers1[i] = [];
          GL.tempVertexBuffers2[i] = [];
          var ringbuffer1 = GL.tempVertexBuffers1[i];
          var ringbuffer2 = GL.tempVertexBuffers2[i];
          ringbuffer1.length = ringbuffer2.length = ringbufferLength;
          for(var j = 0; j < ringbufferLength; ++j) {
            ringbuffer1[j] = ringbuffer2[j] = null; // Created on-demand
          }
        }
  
        if (quads) {
          // GL_QUAD indexes can be precalculated
          GL.tempQuadIndexBuffer = GLctx.createBuffer();
          GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.tempQuadIndexBuffer);
          var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
          var quadIndexes = new Uint16Array(numIndexes);
          var i = 0, v = 0;
          while (1) {
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+1;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+3;
            if (i >= numIndexes) break;
            v += 4;
          }
          GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, quadIndexes, GLctx.STATIC_DRAW);
          GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, null);
        }
      },getTempVertexBuffer:function getTempVertexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ringbuffer = GL.tempVertexBuffers1[idx];
        var nextFreeBufferIndex = GL.tempVertexBufferCounters1[idx];
        GL.tempVertexBufferCounters1[idx] = (GL.tempVertexBufferCounters1[idx]+1) & (GL.numTempVertexBuffersPerSize-1);
        var vbo = ringbuffer[nextFreeBufferIndex];
        if (vbo) {
          return vbo;
        }
        var prevVBO = GLctx.getParameter(GLctx.ARRAY_BUFFER_BINDING);
        ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, ringbuffer[nextFreeBufferIndex]);
        GLctx.bufferData(GLctx.ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, prevVBO);
        return ringbuffer[nextFreeBufferIndex];
      },getTempIndexBuffer:function getTempIndexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ibo = GL.tempIndexBuffers[idx];
        if (ibo) {
          return ibo;
        }
        var prevIBO = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
        GL.tempIndexBuffers[idx] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.tempIndexBuffers[idx]);
        GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, prevIBO);
        return GL.tempIndexBuffers[idx];
      },newRenderingFrameStarted:function newRenderingFrameStarted() {
        var vb = GL.tempVertexBuffers1;
        GL.tempVertexBuffers1 = GL.tempVertexBuffers2;
        GL.tempVertexBuffers2 = vb;
        vb = GL.tempVertexBufferCounters1;
        GL.tempVertexBufferCounters1 = GL.tempVertexBufferCounters2;
        GL.tempVertexBufferCounters2 = vb;
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        for(var i = 0; i <= largestIndex; ++i) {
          GL.tempVertexBufferCounters1[i] = 0;
        }
      },getSource:function (shader, count, string, length) {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var frag;
          if (length) {
            var len = HEAP32[(((length)+(i*4))>>2)];
            if (len < 0) {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
            } else {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)], len);
            }
          } else {
            frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
          }
          source += frag;
        }
        return source;
      },computeImageSize:function (width, height, sizePerPixel, alignment) {
        function roundedToNextMultipleOf(x, y) {
          return Math.floor((x + y - 1) / y) * y
        }
        var plainRowSize = width * sizePerPixel;
        var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
        return (height <= 0) ? 0 :
                 ((height - 1) * alignedRowSize + plainRowSize);
      },get:function (name_, p, type) {
        // Guard against user passing a null pointer.
        // Note that GLES2 spec does not say anything about how passing a null pointer should be treated.
        // Testing on desktop core GL 3, the application crashes on glGetIntegerv to a null pointer, but
        // better to report an error instead of doing anything random.
        if (!p) {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
          return;
        }
        var ret = undefined;
        switch(name_) { // Handle a few trivial GLES values
          case 0x8DFA: // GL_SHADER_COMPILER
            ret = 1;
            break;
          case 0x8DF8: // GL_SHADER_BINARY_FORMATS
            if (type !== 'Integer') {
              GL.recordError(0x0500); // GL_INVALID_ENUM
            }
            return; // Do not write anything to the out pointer, since no binary formats are supported.
          case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
            ret = 0;
            break;
          case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
            // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be queried for length),
            // so implement it ourselves to allow C++ GLES2 code get the length.
            var formats = GLctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
            ret = formats.length;
            break;
          case 0x8B9A: // GL_IMPLEMENTATION_COLOR_READ_TYPE
            ret = 0x1401; // GL_UNSIGNED_BYTE
            break;
          case 0x8B9B: // GL_IMPLEMENTATION_COLOR_READ_FORMAT
            ret = 0x1908; // GL_RGBA
            break;
        }
  
        if (ret === undefined) {
          var result = GLctx.getParameter(name_);
          switch (typeof(result)) {
            case "number":
              ret = result;
              break;
            case "boolean":
              ret = result ? 1 : 0;
              break;
            case "string":
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
            case "object":
              if (result === null) {
                // null is a valid result for some (e.g., which buffer is bound - perhaps nothing is bound), but otherwise
                // can mean an invalid name_, which we need to report as an error
                switch(name_) {
                  case 0x8894: // ARRAY_BUFFER_BINDING
                  case 0x8B8D: // CURRENT_PROGRAM
                  case 0x8895: // ELEMENT_ARRAY_BUFFER_BINDING
                  case 0x8CA6: // FRAMEBUFFER_BINDING
                  case 0x8CA7: // RENDERBUFFER_BINDING
                  case 0x8069: // TEXTURE_BINDING_2D
                  case 0x8514: { // TEXTURE_BINDING_CUBE_MAP
                    ret = 0;
                    break;
                  }
                  default: {
                    GL.recordError(0x0500); // GL_INVALID_ENUM
                    return;
                  }
                }
              } else if (result instanceof Float32Array ||
                         result instanceof Uint32Array ||
                         result instanceof Int32Array ||
                         result instanceof Array) {
                for (var i = 0; i < result.length; ++i) {
                  switch (type) {
                    case 'Integer': HEAP32[(((p)+(i*4))>>2)]=result[i];   break;
                    case 'Float':   HEAPF32[(((p)+(i*4))>>2)]=result[i]; break;
                    case 'Boolean': HEAP8[(((p)+(i))|0)]=result[i] ? 1 : 0;    break;
                    default: throw 'internal glGet error, bad type: ' + type;
                  }
                }
                return;
              } else if (result instanceof WebGLBuffer ||
                         result instanceof WebGLProgram ||
                         result instanceof WebGLFramebuffer ||
                         result instanceof WebGLRenderbuffer ||
                         result instanceof WebGLTexture) {
                ret = result.name | 0;
              } else {
                GL.recordError(0x0500); // GL_INVALID_ENUM
                return;
              }
              break;
            default:
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
          }
        }
  
        switch (type) {
          case 'Integer': HEAP32[((p)>>2)]=ret;    break;
          case 'Float':   HEAPF32[((p)>>2)]=ret;  break;
          case 'Boolean': HEAP8[(p)]=ret ? 1 : 0; break;
          default: throw 'internal glGet error, bad type: ' + type;
        }
      },getTexPixelData:function (type, format, width, height, pixels, internalFormat) {
        var sizePerPixel;
        switch (type) {
          case 0x1401 /* GL_UNSIGNED_BYTE */:
            switch (format) {
              case 0x1906 /* GL_ALPHA */:
              case 0x1909 /* GL_LUMINANCE */:
                sizePerPixel = 1;
                break;
              case 0x1907 /* GL_RGB */:
                sizePerPixel = 3;
                break;
              case 0x1908 /* GL_RGBA */:
                sizePerPixel = 4;
                break;
              case 0x190A /* GL_LUMINANCE_ALPHA */:
                sizePerPixel = 2;
                break;
              default:
                throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x1403 /* GL_UNSIGNED_SHORT */:
            if (format == 0x1902 /* GL_DEPTH_COMPONENT */) {
              sizePerPixel = 2;
            } else {
              throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x1405 /* GL_UNSIGNED_INT */:
            if (format == 0x1902 /* GL_DEPTH_COMPONENT */) {
              sizePerPixel = 4;
            } else {
              throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x84FA /* UNSIGNED_INT_24_8_WEBGL */:
            sizePerPixel = 4;
            break;
          case 0x8363 /* GL_UNSIGNED_SHORT_5_6_5 */:
          case 0x8033 /* GL_UNSIGNED_SHORT_4_4_4_4 */:
          case 0x8034 /* GL_UNSIGNED_SHORT_5_5_5_1 */:
            sizePerPixel = 2;
            break;
          case 0x1406 /* GL_FLOAT */:
            switch (format) {
              case 0x1907 /* GL_RGB */:
                sizePerPixel = 3*4;
                break;
              case 0x1908 /* GL_RGBA */:
                sizePerPixel = 4*4;
                break;
              default:
                throw 'Invalid format (' + format + ')';
            }
            internalFormat = GLctx.RGBA;
            break;
          default:
            throw 'Invalid type (' + type + ')';
        }
        var bytes = GL.computeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
        if (type == 0x1401 /* GL_UNSIGNED_BYTE */) {
          pixels = HEAPU8.subarray((pixels),(pixels+bytes));
        } else if (type == 0x1406 /* GL_FLOAT */) {
          pixels = HEAPF32.subarray((pixels)>>2,(pixels+bytes)>>2);
        } else if (type == 0x1405 /* GL_UNSIGNED_INT */ || type == 0x84FA /* UNSIGNED_INT_24_8_WEBGL */) {
          pixels = HEAPU32.subarray((pixels)>>2,(pixels+bytes)>>2);
        } else {
          pixels = HEAPU16.subarray((pixels)>>1,(pixels+bytes)>>1);
        }
        return {
          pixels: pixels,
          internalFormat: internalFormat
        }
      },calcBufLength:function calcBufLength(size, type, stride, count) {
        if (stride > 0) {
          return count * stride;  // XXXvlad this is not exactly correct I don't think
        }
        var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
        return size * typeSize * count;
      },usedTempBuffers:[],preDrawHandleClientVertexAttribBindings:function preDrawHandleClientVertexAttribBindings(count) {
        GL.resetBufferBinding = false;
  
        // TODO: initial pass to detect ranges we need to upload, might not need an upload per attrib
        for (var i = 0; i < GL.maxVertexAttribs; ++i) {
          var cb = GL.clientBuffers[i];
          if (!cb.clientside || !cb.enabled) continue;
  
          GL.resetBufferBinding = true;
  
          var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
          var buf = GL.getTempVertexBuffer(size);
          GLctx.bindBuffer(GLctx.ARRAY_BUFFER, buf);
          GLctx.bufferSubData(GLctx.ARRAY_BUFFER,
                                   0,
                                   HEAPU8.subarray(cb.ptr, cb.ptr + size));
          GLctx.vertexAttribPointer(i, cb.size, cb.type, cb.normalized, cb.stride, 0);
        }
      },postDrawHandleClientVertexAttribBindings:function postDrawHandleClientVertexAttribBindings() {
        if (GL.resetBufferBinding) {
          GLctx.bindBuffer(GLctx.ARRAY_BUFFER, GL.buffers[GL.currArrayBuffer]);
        }
      },initExtensions:function () {
        if (GL.initExtensions.done) return;
        GL.initExtensions.done = true;
  
        if (!Module.useWebGL) return; // an app might link both gl and 2d backends
  
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
          GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i+1);
        }
  
        GL.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
        for (var i = 0; i < GL.maxVertexAttribs; i++) {
          GL.clientBuffers[i] = { enabled: false, clientside: false, size: 0, type: 0, normalized: 0, stride: 0, ptr: 0 };
        }
  
        GL.generateTempBuffers();
  
        // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist. 
        GL.compressionExt = GLctx.getExtension('WEBGL_compressed_texture_s3tc') ||
                            GLctx.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                            GLctx.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
  
        GL.anisotropicExt = GLctx.getExtension('EXT_texture_filter_anisotropic') ||
                            GLctx.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                            GLctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  
        GL.floatExt = GLctx.getExtension('OES_texture_float');
        
        // Extension available from Firefox 26 and Google Chrome 30
        GL.instancedArraysExt = GLctx.getExtension('ANGLE_instanced_arrays');
        
        // Extension available from Firefox 25 and WebKit
        GL.vaoExt = Module.ctx.getExtension('OES_vertex_array_object');
  
        // These are the 'safe' feature-enabling extensions that don't add any performance impact related to e.g. debugging, and
        // should be enabled by default so that client GLES2/GL code will not need to go through extra hoops to get its stuff working.
        // As new extensions are ratified at http://www.khronos.org/registry/webgl/extensions/ , feel free to add your new extensions
        // here, as long as they don't produce a performance impact for users that might not be using those extensions.
        // E.g. debugging-related extensions should probably be off by default.
        var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives",
                                               "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture",
                                               "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays",
                                               "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc",
                                               "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float",
                                               "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources" ];
  
        function shouldEnableAutomatically(extension) {
          for(var i in automaticallyEnabledExtensions) {
            var include = automaticallyEnabledExtensions[i];
            if (ext.indexOf(include) != -1) {
              return true;
            }
          }
          return false;
        }
  
        var extensions = GLctx.getSupportedExtensions();
        for(var e in extensions) {
          var ext = extensions[e].replace('MOZ_', '').replace('WEBKIT_', '');
          if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
            GLctx.getExtension(ext); // Calling .getExtension enables that extension permanently, no need to store the return value to be enabled.
          }
        }
      },populateUniformTable:function (program) {
        var p = GL.programs[program];
        GL.programInfos[program] = {
          uniforms: {},
          maxUniformLength: 0, // This is eagerly computed below, since we already enumerate all uniforms anyway.
          maxAttributeLength: -1 // This is lazily computed and cached, computed when/if first asked, "-1" meaning not computed yet.
        };
  
        var ptable = GL.programInfos[program];
        var utable = ptable.uniforms;
        // A program's uniform table maps the string name of an uniform to an integer location of that uniform.
        // The global GL.uniforms map maps integer locations to WebGLUniformLocations.
        var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; ++i) {
          var u = GLctx.getActiveUniform(p, i);
  
          var name = u.name;
          ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length+1);
  
          // Strip off any trailing array specifier we might have got, e.g. "[0]".
          if (name.indexOf(']', name.length-1) !== -1) {
            var ls = name.lastIndexOf('[');
            name = name.slice(0, ls);
          }
  
          // Optimize memory usage slightly: If we have an array of uniforms, e.g. 'vec3 colors[3];', then 
          // only store the string 'colors' in utable, and 'colors[0]', 'colors[1]' and 'colors[2]' will be parsed as 'colors'+i.
          // Note that for the GL.uniforms table, we still need to fetch the all WebGLUniformLocations for all the indices.
          var loc = GLctx.getUniformLocation(p, name);
          var id = GL.getNewId(GL.uniforms);
          utable[name] = [u.size, id];
          GL.uniforms[id] = loc;
  
          for (var j = 1; j < u.size; ++j) {
            var n = name + '['+j+']';
            loc = GLctx.getUniformLocation(p, n);
            id = GL.getNewId(GL.uniforms);
  
            GL.uniforms[id] = loc;
          }
        }
      }};function _glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

   
  Module["_i64Add"] = _i64Add;

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function _pthread_mutex_lock() {}

  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }

  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
  
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
  
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
  
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }function _strtoull_l(str, endptr, base) {
      return _strtoull(str, endptr, base); // no locale support yet
    }

  
  
  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};var SDL={defaults:{width:320,height:200,copyOnLock:true},version:null,surfaces:{},canvasPool:[],events:[],fonts:[null],audios:[null],rwops:[null],music:{audio:null,volume:1},mixerFrequency:22050,mixerFormat:32784,mixerNumChannels:2,mixerChunkSize:1024,channelMinimumNumber:0,GL:false,glAttributes:{0:3,1:3,2:2,3:0,4:0,5:1,6:16,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:1,16:0,17:0,18:0},keyboardState:null,keyboardMap:{},canRequestFullscreen:false,isRequestingFullscreen:false,textInput:false,startTime:null,initFlags:0,buttonState:0,modState:0,DOMButtons:[0,0,0],DOMEventToSDLEvent:{},keyCodes:{16:1249,17:1248,18:1250,33:1099,34:1102,37:1104,38:1106,39:1103,40:1105,46:127,96:1112,97:1113,98:1114,99:1115,100:1116,101:1117,102:1118,103:1119,104:1120,105:1121,112:1082,113:1083,114:1084,115:1085,116:1086,117:1087,118:1088,119:1089,120:1090,121:1091,122:1092,123:1093,173:45,188:44,190:46,191:47,192:96},scanCodes:{8:42,9:43,13:40,27:41,32:44,44:54,46:55,47:56,48:39,49:30,50:31,51:32,52:33,53:34,54:35,55:36,56:37,57:38,59:51,61:46,91:47,92:49,93:48,96:52,97:4,98:5,99:6,100:7,101:8,102:9,103:10,104:11,105:12,106:13,107:14,108:15,109:16,110:17,111:18,112:19,113:20,114:21,115:22,116:23,117:24,118:25,119:26,120:27,121:28,122:29,305:224,308:226},loadRect:function (rect) {
        return {
          x: HEAP32[((rect + 0)>>2)],
          y: HEAP32[((rect + 4)>>2)],
          w: HEAP32[((rect + 8)>>2)],
          h: HEAP32[((rect + 12)>>2)]
        };
      },loadColorToCSSRGB:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgb(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ')';
      },loadColorToCSSRGBA:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgba(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ',' + (((rgba >> 24)&255)/255) + ')';
      },translateColorToCSSRGBA:function (rgba) {
        return 'rgba(' + (rgba&0xff) + ',' + (rgba>>8 & 0xff) + ',' + (rgba>>16 & 0xff) + ',' + (rgba>>>24)/0xff + ')';
      },translateRGBAToCSSRGBA:function (r, g, b, a) {
        return 'rgba(' + (r&0xff) + ',' + (g&0xff) + ',' + (b&0xff) + ',' + (a&0xff)/255 + ')';
      },translateRGBAToColor:function (r, g, b, a) {
        return r | g << 8 | b << 16 | a << 24;
      },makeSurface:function (width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var is_SDL_HWSURFACE = flags & 0x00000001;
        var is_SDL_HWPALETTE = flags & 0x00200000;
        var is_SDL_OPENGL = flags & 0x04000000;
  
        var surf = _malloc(60);
        var pixelFormat = _malloc(44);
        //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        var buffer = 0;
  
        // preemptively initialize this for software surfaces,
        // otherwise it will be lazily initialized inside of SDL_LockSurface
        if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
          buffer = _malloc(width * height * 4);
        }
  
        HEAP32[((surf)>>2)]=flags;
        HEAP32[(((surf)+(4))>>2)]=pixelFormat;
        HEAP32[(((surf)+(8))>>2)]=width;
        HEAP32[(((surf)+(12))>>2)]=height;
        HEAP32[(((surf)+(16))>>2)]=width * bpp;  // assuming RGBA or indexed for now,
                                                                                          // since that is what ImageData gives us in browsers
        HEAP32[(((surf)+(20))>>2)]=buffer;
        HEAP32[(((surf)+(36))>>2)]=0;
        HEAP32[(((surf)+(56))>>2)]=1;
  
        HEAP32[((pixelFormat)>>2)]=0 /* XXX missing C define SDL_PIXELFORMAT_RGBA8888 */;
        HEAP32[(((pixelFormat)+(4))>>2)]=0;// TODO
        HEAP8[(((pixelFormat)+(8))|0)]=bpp * 8;
        HEAP8[(((pixelFormat)+(9))|0)]=bpp;
  
        HEAP32[(((pixelFormat)+(12))>>2)]=rmask || 0x000000ff;
        HEAP32[(((pixelFormat)+(16))>>2)]=gmask || 0x0000ff00;
        HEAP32[(((pixelFormat)+(20))>>2)]=bmask || 0x00ff0000;
        HEAP32[(((pixelFormat)+(24))>>2)]=amask || 0xff000000;
  
        // Decide if we want to use WebGL or not
        SDL.GL = SDL.GL || is_SDL_OPENGL;
        var canvas;
        if (!usePageCanvas) {
          if (SDL.canvasPool.length > 0) {
            canvas = SDL.canvasPool.pop();
          } else {
            canvas = document.createElement('canvas');
          }
          canvas.width = width;
          canvas.height = height;
        } else {
          canvas = Module['canvas'];
        }
  
        var webGLContextAttributes = {
          antialias: ((SDL.glAttributes[13 /*SDL_GL_MULTISAMPLEBUFFERS*/] != 0) && (SDL.glAttributes[14 /*SDL_GL_MULTISAMPLESAMPLES*/] > 1)),
          depth: (SDL.glAttributes[6 /*SDL_GL_DEPTH_SIZE*/] > 0),
          stencil: (SDL.glAttributes[7 /*SDL_GL_STENCIL_SIZE*/] > 0)
        };
        
        var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
              
        SDL.surfaces[surf] = {
          width: width,
          height: height,
          canvas: canvas,
          ctx: ctx,
          surf: surf,
          buffer: buffer,
          pixelFormat: pixelFormat,
          alpha: 255,
          flags: flags,
          locked: 0,
          usePageCanvas: usePageCanvas,
          source: source,
  
          isFlagSet: function(flag) {
            return flags & flag;
          }
        };
  
        return surf;
      },copyIndexedColorData:function (surfData, rX, rY, rW, rH) {
        // HWPALETTE works with palette
        // setted by SDL_SetColors
        if (!surfData.colors) {
          return;
        }
        
        var fullWidth  = Module['canvas'].width;
        var fullHeight = Module['canvas'].height;
  
        var startX  = rX || 0;
        var startY  = rY || 0;
        var endX    = (rW || (fullWidth - startX)) + startX;
        var endY    = (rH || (fullHeight - startY)) + startY;
        
        var buffer  = surfData.buffer;
        var data    = surfData.image.data;
        var colors  = surfData.colors;
  
        for (var y = startY; y < endY; ++y) {
          var indexBase = y * fullWidth;
          var colorBase = indexBase * 4;
          for (var x = startX; x < endX; ++x) {
            // HWPALETTE have only 256 colors (not rgba)
            var index = HEAPU8[((buffer + indexBase + x)|0)] * 3;
            var colorOffset = colorBase + x * 4;
  
            data[colorOffset   ] = colors[index   ];
            data[colorOffset +1] = colors[index +1];
            data[colorOffset +2] = colors[index +2];
            //unused: data[colorOffset +3] = color[index +3];
          }
        }
      },freeSurface:function (surf) {
        var refcountPointer = surf + 56;
        var refcount = HEAP32[((refcountPointer)>>2)];
        if (refcount > 1) {
          HEAP32[((refcountPointer)>>2)]=refcount - 1;
          return;
        }
  
        var info = SDL.surfaces[surf];
        if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
        if (info.buffer) _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
      },touchX:0,touchY:0,savedKeydown:null,receiveEvent:function (event) {
        switch(event.type) {
          case 'touchstart':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            var event = {
              type: 'mousedown',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 1;
            SDL.events.push(event);
            break;
          case 'touchmove':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            event = {
              type: 'mousemove',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.events.push(event);
            break;
          case 'touchend':
            event.preventDefault();
            event = {
              type: 'mouseup',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 0;
            SDL.events.push(event);
            break;
          case 'mousemove':
            if (Browser.pointerLock) {
              // workaround for firefox bug 750111
              if ('mozMovementX' in event) {
                event['movementX'] = event['mozMovementX'];
                event['movementY'] = event['mozMovementY'];
              }
              // workaround for Firefox bug 782777
              if (event['movementX'] == 0 && event['movementY'] == 0) {
                // ignore a mousemove event if it doesn't contain any movement info
                // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
                event.preventDefault();
                return;
              }
            }
            // fall through
          case 'keydown': case 'keyup': case 'keypress': case 'mousedown': case 'mouseup': case 'DOMMouseScroll': case 'mousewheel':
            // If we preventDefault on keydown events, the subsequent keypress events
            // won't fire. However, it's fine (and in some cases necessary) to
            // preventDefault for keys that don't generate a character. Otherwise,
            // preventDefault is the right thing to do in general.
            if (event.type !== 'keydown' || (!SDL.unicode && !SDL.textInput) || (event.keyCode === 8 /* backspace */ || event.keyCode === 9 /* tab */)) {
              event.preventDefault();
            }
  
            if (event.type == 'DOMMouseScroll' || event.type == 'mousewheel') {
              var button = Browser.getMouseWheelDelta(event) > 0 ? 4 : 3;
              var event2 = {
                type: 'mousedown',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
              SDL.events.push(event2);
              event = {
                type: 'mouseup',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
            } else if (event.type == 'mousedown') {
              SDL.DOMButtons[event.button] = 1;
            } else if (event.type == 'mouseup') {
              // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
              // since we add a mouseup in that case
              if (!SDL.DOMButtons[event.button]) {
                return;
              }
  
              SDL.DOMButtons[event.button] = 0;
            }
  
            // We can only request fullscreen as the result of user input.
            // Due to this limitation, we toggle a boolean on keydown which
            // SDL_WM_ToggleFullScreen will check and subsequently set another
            // flag indicating for us to request fullscreen on the following
            // keyup. This isn't perfect, but it enables SDL_WM_ToggleFullScreen
            // to work as the result of a keypress (which is an extremely
            // common use case).
            if (event.type === 'keydown') {
              SDL.canRequestFullscreen = true;
            } else if (event.type === 'keyup') {
              if (SDL.isRequestingFullscreen) {
                Module['requestFullScreen'](true, true);
                SDL.isRequestingFullscreen = false;
              }
              SDL.canRequestFullscreen = false;
            }
  
            // SDL expects a unicode character to be passed to its keydown events.
            // Unfortunately, the browser APIs only provide a charCode property on
            // keypress events, so we must backfill in keydown events with their
            // subsequent keypress event's charCode.
            if (event.type === 'keypress' && SDL.savedKeydown) {
              // charCode is read-only
              SDL.savedKeydown.keypressCharCode = event.charCode;
              SDL.savedKeydown = null;
            } else if (event.type === 'keydown') {
              SDL.savedKeydown = event;
            }
  
            // Don't push keypress events unless SDL_StartTextInput has been called.
            if (event.type !== 'keypress' || SDL.textInput) {
              SDL.events.push(event);
            }
            break;
          case 'mouseout':
            // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
            for (var i = 0; i < 3; i++) {
              if (SDL.DOMButtons[i]) {
                SDL.events.push({
                  type: 'mouseup',
                  button: i,
                  pageX: event.pageX,
                  pageY: event.pageY
                });
                SDL.DOMButtons[i] = 0;
              }
            }
            event.preventDefault();
            break;
          case 'blur':
          case 'visibilitychange': {
            // Un-press all pressed keys: TODO
            for (var code in SDL.keyboardMap) {
              SDL.events.push({
                type: 'keyup',
                keyCode: SDL.keyboardMap[code]
              });
            }
            event.preventDefault();
            break;
          }
          case 'unload':
            if (Browser.mainLoop.runner) {
              SDL.events.push(event);
              // Force-run a main event loop, since otherwise this event will never be caught!
              Browser.mainLoop.runner();
            }
            return;
          case 'resize':
            SDL.events.push(event);
            // manually triggered resize event doesn't have a preventDefault member
            if (event.preventDefault) {
              event.preventDefault();
            }
            break;
        }
        if (SDL.events.length >= 10000) {
          Module.printErr('SDL event queue full, dropping events');
          SDL.events = SDL.events.slice(0, 10000);
        }
        return;
      },handleEvent:function (event) {
        if (event.handled) return;
        event.handled = true;
  
        switch (event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            var code = event.keyCode;
            if (code >= 65 && code <= 90) {
              code += 32; // make lowercase for SDL
            } else {
              code = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
  
            HEAP8[(((SDL.keyboardState)+(code))|0)]=down;
            // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
            SDL.modState = (HEAP8[(((SDL.keyboardState)+(1248))|0)] ? 0x0040 | 0x0080 : 0) | // KMOD_LCTRL & KMOD_RCTRL
              (HEAP8[(((SDL.keyboardState)+(1249))|0)] ? 0x0001 | 0x0002 : 0) | // KMOD_LSHIFT & KMOD_RSHIFT
              (HEAP8[(((SDL.keyboardState)+(1250))|0)] ? 0x0100 | 0x0200 : 0); // KMOD_LALT & KMOD_RALT
  
            if (down) {
              SDL.keyboardMap[code] = event.keyCode; // save the DOM input, which we can use to unpress it during blur
            } else {
              delete SDL.keyboardMap[code];
            }
  
            break;
          }
          case 'mousedown': case 'mouseup':
            if (event.type == 'mousedown') {
              // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
              // and DOM buttons are 0-2, so this means that the below formula is
              // correct.
              SDL.buttonState |= 1 << event.button;
            } else if (event.type == 'mouseup') {
              SDL.buttonState &= ~(1 << event.button);
            }
            // fall through
          case 'mousemove': {
            Browser.calculateMouseEvent(event);
            break;
          }
        }
      },makeCEvent:function (event, ptr) {
        if (typeof event === 'number') {
          // This is a pointer to a native C event that was SDL_PushEvent'ed
          _memcpy(ptr, event, 28); // XXX
          return;
        }
  
        SDL.handleEvent(event);
  
        switch (event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            //Module.print('Received key event: ' + event.keyCode);
            var key = event.keyCode;
            if (key >= 65 && key <= 90) {
              key += 32; // make lowercase for SDL
            } else {
              key = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
            var scan;
            if (key >= 1024) {
              scan = key - 1024;
            } else {
              scan = SDL.scanCodes[key] || key;
            }
  
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP8[(((ptr)+(8))|0)]=down ? 1 : 0;
            HEAP8[(((ptr)+(9))|0)]=0; // TODO
            HEAP32[(((ptr)+(12))>>2)]=scan;
            HEAP32[(((ptr)+(16))>>2)]=key;
            HEAP16[(((ptr)+(20))>>1)]=SDL.modState;
            // some non-character keys (e.g. backspace and tab) won't have keypressCharCode set, fill in with the keyCode.
            HEAP32[(((ptr)+(24))>>2)]=event.keypressCharCode || key;
  
            break;
          }
          case 'keypress': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            // Not filling in windowID for now
            var cStr = intArrayFromString(String.fromCharCode(event.charCode));
            for (var i = 0; i < cStr.length; ++i) {
              HEAP8[(((ptr)+(8 + i))|0)]=cStr[i];
            }
            break;
          }
          case 'mousedown': case 'mouseup': case 'mousemove': {
            if (event.type != 'mousemove') {
              var down = event.type === 'mousedown';
              HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(8))|0)]=event.button+1; // DOM buttons are 0-2, SDL 1-3
              HEAP8[(((ptr)+(9))|0)]=down ? 1 : 0;
              HEAP32[(((ptr)+(12))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(16))>>2)]=Browser.mouseY;
            } else {
              HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(8))|0)]=SDL.buttonState;
              HEAP32[(((ptr)+(12))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(16))>>2)]=Browser.mouseY;
              HEAP32[(((ptr)+(20))>>2)]=Browser.mouseMovementX;
              HEAP32[(((ptr)+(24))>>2)]=Browser.mouseMovementY;
            }
            break;
          }
          case 'unload': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            break;
          }
          case 'resize': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP32[(((ptr)+(4))>>2)]=event.w;
            HEAP32[(((ptr)+(8))>>2)]=event.h;
            break;
          }
          case 'joystick_button_up': case 'joystick_button_down': {
            var state = event.type === 'joystick_button_up' ? 0 : 1;
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP8[(((ptr)+(4))|0)]=event.index;
            HEAP8[(((ptr)+(5))|0)]=event.button;
            HEAP8[(((ptr)+(6))|0)]=state;
            break;
          }
          case 'joystick_axis_motion': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP8[(((ptr)+(4))|0)]=event.index;
            HEAP8[(((ptr)+(5))|0)]=event.axis;
            HEAP32[(((ptr)+(8))>>2)]=SDL.joystickAxisValueConversion(event.value);
            break;
          }
          default: throw 'Unhandled SDL event: ' + event.type;
        }
      },estimateTextWidth:function (fontData, text) {
        var h = fontData.size;
        var fontString = h + 'px ' + fontData.name;
        var tempCtx = SDL.ttfContext;
        tempCtx.save();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        tempCtx.restore();
        return ret;
      },allocateChannels:function (num) { // called from Mix_AllocateChannels and init
        if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
          SDL.channels[i] = {
            audio: null,
            volume: 1.0
          };
        }
      },setGetVolume:function (info, volume) {
        if (!info) return 0;
        var ret = info.volume * 128; // MIX_MAX_VOLUME
        if (volume != -1) {
          info.volume = volume / 128;
          if (info.audio) info.audio.volume = info.volume;
        }
        return ret;
      },fillWebAudioBufferFromHeap:function (heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
        // The input audio data is interleaved across the channels, i.e. [L, R, L, R, L, R, ...] and is either 8-bit or 16-bit as
        // supported by the SDL API. The output audio wave data for Web Audio API must be in planar buffers of [-1,1]-normalized Float32 data,
        // so perform a buffer conversion for the data.
        var numChannels = SDL.audio.channels;
        for(var c = 0; c < numChannels; ++c) {
          var channelData = dstAudioBuffer['getChannelData'](c);
          if (channelData.length != sizeSamplesPerChannel) {
            throw 'Web Audio output buffer length mismatch! Destination size: ' + channelData.length + ' samples vs expected ' + sizeSamplesPerChannel + ' samples!';
          }
          if (SDL.audio.format == 0x8010 /*AUDIO_S16LSB*/) {
            for(var j = 0; j < sizeSamplesPerChannel; ++j) {
              channelData[j] = (HEAP16[(((heapPtr)+((j*numChannels + c)*2))>>1)]) / 0x8000;
            }
          } else if (SDL.audio.format == 0x0008 /*AUDIO_U8*/) {
            for(var j = 0; j < sizeSamplesPerChannel; ++j) {
              var v = (HEAP8[(((heapPtr)+(j*numChannels + c))|0)]);
              channelData[j] = ((v >= 0) ? v-128 : v+128) /128;
            }
          }
        }
      },debugSurface:function (surfData) {
        console.log('dumping surface ' + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
          console.log('   diagonal ' + i + ':' + [data[i*surfData.width*4 + i*4 + 0], data[i*surfData.width*4 + i*4 + 1], data[i*surfData.width*4 + i*4 + 2], data[i*surfData.width*4 + i*4 + 3]]);
        }
      },joystickEventState:1,lastJoystickState:{},joystickNamePool:{},recordJoystickState:function (joystick, state) {
        // Standardize button state.
        var buttons = new Array(state.buttons.length);
        for (var i = 0; i < state.buttons.length; i++) {
          buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
        }
  
        SDL.lastJoystickState[joystick] = {
          buttons: buttons,
          axes: state.axes.slice(0),
          timestamp: state.timestamp,
          index: state.index,
          id: state.id
        };
      },getJoystickButtonState:function (button) {
        if (typeof button === 'object') {
          // Current gamepad API editor's draft (Firefox Nightly)
          // https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#idl-def-GamepadButton
          return button.pressed;
        } else {
          // Current gamepad API working draft (Firefox / Chrome Stable)
          // http://www.w3.org/TR/2012/WD-gamepad-20120529/#gamepad-interface
          return button > 0;
        }
      },queryJoysticks:function () {
        for (var joystick in SDL.lastJoystickState) {
          var state = SDL.getGamepad(joystick - 1);
          var prevState = SDL.lastJoystickState[joystick];
          // Check only if the timestamp has differed.
          // NOTE: Timestamp is not available in Firefox.
          if (typeof state.timestamp !== 'number' || state.timestamp !== prevState.timestamp) {
            var i;
            for (i = 0; i < state.buttons.length; i++) {
              var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
              // NOTE: The previous state already has a boolean representation of
              //       its button, so no need to standardize its button state here.
              if (buttonState !== prevState.buttons[i]) {
                // Insert button-press event.
                SDL.events.push({
                  type: buttonState ? 'joystick_button_down' : 'joystick_button_up',
                  joystick: joystick,
                  index: joystick - 1,
                  button: i
                });
              }
            }
            for (i = 0; i < state.axes.length; i++) {
              if (state.axes[i] !== prevState.axes[i]) {
                // Insert axes-change event.
                SDL.events.push({
                  type: 'joystick_axis_motion',
                  joystick: joystick,
                  index: joystick - 1,
                  axis: i,
                  value: state.axes[i]
                });
              }
            }
  
            SDL.recordJoystickState(joystick, state);
          }
        }
      },joystickAxisValueConversion:function (value) {
        // Ensures that 0 is 0, 1 is 32767, and -1 is 32768.
        return Math.ceil(((value+1) * 32767.5) - 32768);
      },getGamepads:function () {
        var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
        if (fcn !== undefined) {
          // The function must be applied on the navigator object.
          return fcn.apply(navigator);
        } else {
          return [];
        }
      },getGamepad:function (deviceIndex) {
        var gamepads = SDL.getGamepads();
        if (gamepads.length > deviceIndex && deviceIndex >= 0) {
          return gamepads[deviceIndex];
        }
        return null;
      }};function _SDL_GL_SetAttribute(attr, value) {
      if (!(attr in SDL.glAttributes)) {
        abort('Unknown SDL GL attribute (' + attr + '). Please check if your SDL version is supported.');
      }
  
      SDL.glAttributes[attr] = value;
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _SDL_PollEvent(ptr) {
      if (SDL.initFlags & 0x200 && SDL.joystickEventState) {
        // If SDL_INIT_JOYSTICK was supplied AND the joystick system is configured
        // to automatically query for events, query for joystick events.
        SDL.queryJoysticks();
      }
      if (SDL.events.length === 0) return 0;
      if (ptr) {
        SDL.makeCEvent(SDL.events.shift(), ptr);
      }
      return 1;
    }

  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }

  
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }function _strtoll_l(str, endptr, base) {
      return _strtoll(str, endptr, base); // no locale support yet
    }

  function _glClear(x0) { GLctx.clear(x0) }

  function _SDL_GetError() {
      if (!SDL.errorMessage) {
        SDL.errorMessage = allocate(intArrayFromString("unknown SDL-emscripten error"), 'i8', ALLOC_NORMAL);
      }
      return SDL.errorMessage;
    }


  function _glColorMask(x0, x1, x2, x3) { GLctx.colorMask(x0, x1, x2, x3) }


  function _pthread_cond_broadcast() {
      return 0;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function _pthread_mutex_unlock() {}

  
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }function _isxdigit_l(chr) {
      return _isxdigit(chr); // no locale support yet
    }

  function _SDL_PumpEvents(){
      SDL.events.forEach(function(event) {
        SDL.handleEvent(event);
      });
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }


  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _newlocale(mask, locale, base) {
      return _malloc(4);
    }

   
  Module["_memmove"] = _memmove;

  function ___errno_location() {
      return ___errno_state;
    }

  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  function _catclose(catd) {
      // int catclose (nl_catd catd)
      return 0;
    }

  
  
  
  function _free() {
  }
  Module["_free"] = _free;function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr - ___cxa_exception_header_size);
      } catch(e) { // XXX FIXME
      }
    }
  
  var ___cxa_caught_exceptions=[];function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Call destructor if one is registered then clear it.
      var ptr = ___cxa_caught_exceptions.pop();
      if (ptr) {
        header = ptr - ___cxa_exception_header_size;
        var destructor = HEAP32[(((header)+(4))>>2)];
        if (destructor) {
          Runtime.dynCall('vi', destructor, [ptr]);
          HEAP32[(((header)+(4))>>2)]=0;
        }
        ___cxa_free_exception(ptr);
        ___cxa_last_thrown_exception = 0;
      }
    }function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      var ptr = ___cxa_caught_exceptions.pop();
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _fmod(x, y) {
      return x % y;
    }

  function ___cxa_guard_release() {}

  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }

  function _uselocale(locale) {
      return 0;
    }

  
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }

  
  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
                if (next === 0) return i > 0 ? fields : fields-1; // we failed to read the full length of this field
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }



  
  
  
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }

  var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  var _BItoD=true;

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  function _abort() {
      Module['abort']();
    }

  function _SDL_GetKeyboardState(numKeys) {
      if (numKeys) {
        HEAP32[((numKeys)>>2)]=65536;
      }
      return SDL.keyboardState;
    }

  var _tan=Math_tan;


  function _SDL_SetVideoMode(width, height, depth, flags) {
      ['mousedown', 'mouseup', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mouseout'].forEach(function(event) {
        Module['canvas'].addEventListener(event, SDL.receiveEvent, true);
      });
  
      // (0,0) means 'use fullscreen' in native; in Emscripten, use the current canvas size.
      if (width == 0 && height == 0) {
        var canvas = Module['canvas'];
        width = canvas.width;
        height = canvas.height;
      }
  
      Browser.setCanvasSize(width, height, true);
      // Free the old surface first.
      if (SDL.screen) {
        SDL.freeSurface(SDL.screen);
        SDL.screen = null;
      }
      SDL.screen = SDL.makeSurface(width, height, flags, true, 'screen');
      if (!SDL.addedResizeListener) {
        SDL.addedResizeListener = true;
        Browser.resizeListeners.push(function(w, h) {
          SDL.receiveEvent({
            type: 'resize',
            w: w,
            h: h
          });
        });
      }
      return SDL.screen;
    }

  function _pthread_cond_wait() {
      return 0;
    }

  
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }function _isdigit_l(chr) {
      return _isdigit(chr); // no locale support yet
    }

  function _glEnable(x0) { GLctx.enable(x0) }

  var _fabs=Math_abs;

  function _llvm_lifetime_start() {}

  var _getc=_fgetc;

  function _SDL_Quit() {
      for (var i = 0; i < SDL.numChannels; ++i) {
        if (SDL.channels[i].audio) {
          SDL.channels[i].audio.pause();
        }
      }
      if (SDL.music.audio) {
        SDL.music.audio.pause();
      }
      Module.print('SDL_Quit called (and ignored)');
    }


  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i];
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function _freelocale(locale) {
      _free(locale);
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  var _fmodl=_fmod;

  function _llvm_invariant_start() {}

  function _catgets(catd, set_id, msg_id, s) {
      // char *catgets (nl_catd catd, int set_id, int msg_id, const char *s)
      return s;
    }

  
  
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  function _glViewport(x0, x1, x2, x3) { GLctx.viewport(x0, x1, x2, x3) }

  function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg) {
      Module['noExitRuntime'] = true;
  
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
        if (Browser.mainLoop.shouldPause) {
          // catch pauses from non-main loop sources
          Browser.mainLoop.paused = true;
          Browser.mainLoop.shouldPause = false;
          return;
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
        GL.newRenderingFrameStarted();
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          Module.printErr('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = ''; // just warn once per call to set main loop
        }
  
        if (Module['preMainLoop']) {
          Module['preMainLoop']();
        }
  
        try {
          if (typeof arg !== 'undefined') {
            Runtime.dynCall('vi', func, [arg]);
          } else {
            Runtime.dynCall('v', func);
          }
        } catch (e) {
          if (e instanceof ExitStatus) {
            return;
          } else {
            if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
            throw e;
          }
        }
  
        if (Module['postMainLoop']) {
          Module['postMainLoop']();
        }
  
        if (Browser.mainLoop.shouldPause) {
          // catch pauses from the main loop itself
          Browser.mainLoop.paused = true;
          Browser.mainLoop.shouldPause = false;
          return;
        }
        Browser.mainLoop.scheduler();
      }
      if (fps && fps > 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler() {
          setTimeout(Browser.mainLoop.runner, 1000/fps); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      }
      Browser.mainLoop.scheduler();
  
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }

  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;


  function _SDL_GL_SwapBuffers() {}

  function __ZNSt9exceptionD2Ev() {}

  function _SDL_Init(initFlags) {
      SDL.startTime = Date.now();
      SDL.initFlags = initFlags;
  
      // capture all key events. we just keep down and up, but also capture press to prevent default actions
      if (!Module['doNotCaptureKeyboard']) {
        document.addEventListener("keydown", SDL.receiveEvent);
        document.addEventListener("keyup", SDL.receiveEvent);
        document.addEventListener("keypress", SDL.receiveEvent);
        window.addEventListener("blur", SDL.receiveEvent);
        document.addEventListener("visibilitychange", SDL.receiveEvent);
      }
  
      if (initFlags & 0x200) {
        // SDL_INIT_JOYSTICK
        // Firefox will not give us Joystick data unless we register this NOP
        // callback.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=936104
        addEventListener("gamepadconnected", function() {});
      }
  
      window.addEventListener("unload", SDL.receiveEvent);
      SDL.keyboardState = _malloc(0x10000); // Our SDL needs 512, but 64K is safe for older SDLs
      _memset(SDL.keyboardState, 0, 0x10000);
      // Initialize this structure carefully for closure
      SDL.DOMEventToSDLEvent['keydown'] = 0x300 /* SDL_KEYDOWN */;
      SDL.DOMEventToSDLEvent['keyup'] = 0x301 /* SDL_KEYUP */;
      SDL.DOMEventToSDLEvent['keypress'] = 0x303 /* SDL_TEXTINPUT */;
      SDL.DOMEventToSDLEvent['mousedown'] = 0x401 /* SDL_MOUSEBUTTONDOWN */;
      SDL.DOMEventToSDLEvent['mouseup'] = 0x402 /* SDL_MOUSEBUTTONUP */;
      SDL.DOMEventToSDLEvent['mousemove'] = 0x400 /* SDL_MOUSEMOTION */;
      SDL.DOMEventToSDLEvent['unload'] = 0x100 /* SDL_QUIT */;
      SDL.DOMEventToSDLEvent['resize'] = 0x7001 /* SDL_VIDEORESIZE/SDL_EVENT_COMPAT2 */;
      // These are not technically DOM events; the HTML gamepad API is poll-based.
      // However, we define them here, as the rest of the SDL code assumes that
      // all SDL events originate as DOM events.
      SDL.DOMEventToSDLEvent['joystick_axis_motion'] = 0x600 /* SDL_JOYAXISMOTION */;
      SDL.DOMEventToSDLEvent['joystick_button_down'] = 0x603 /* SDL_JOYBUTTONDOWN */;
      SDL.DOMEventToSDLEvent['joystick_button_up'] = 0x604 /* SDL_JOYBUTTONUP */;
      return 0; // success
    }

  function _catopen(name, oflag) {
      // nl_catd catopen (const char *name, int oflag)
      return -1;
    }

  var _copysignl=_copysign;

  var __ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);

  var ___dso_handle=allocate(1, "i32*", ALLOC_STATIC);




   
  Module["_emscripten_replace_memory"] = _emscripten_replace_memory;
var GLctx; GL.init()
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"almost asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.__ZTISt9exception|0;var p=env.___dso_handle|0;var q=env._stderr|0;var r=env._stdin|0;var s=env._stdout|0;var t=0;var u=0;var v=0;var w=0;var x=+env.NaN,y=+env.Infinity;var z=0,A=0,B=0,C=0,D=0.0,E=0,F=0,G=0,H=0.0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=global.Math.floor;var T=global.Math.abs;var U=global.Math.sqrt;var V=global.Math.pow;var W=global.Math.cos;var X=global.Math.sin;var Y=global.Math.tan;var Z=global.Math.acos;var _=global.Math.asin;var $=global.Math.atan;var aa=global.Math.atan2;var ba=global.Math.exp;var ca=global.Math.log;var da=global.Math.ceil;var ea=global.Math.imul;var fa=env.abort;var ga=env.assert;var ha=env.asmPrintInt;var ia=env.asmPrintFloat;var ja=env.min;var ka=env.invoke_iiii;var la=env.invoke_viiiiiii;var ma=env.invoke_viiiii;var na=env.invoke_vi;var oa=env.invoke_vii;var pa=env.invoke_viiiiiiiii;var qa=env.invoke_ii;var ra=env.invoke_viiiiiid;var sa=env.invoke_viii;var ta=env.invoke_viiiiid;var ua=env.invoke_v;var va=env.invoke_iiiiiiiii;var wa=env.invoke_iiiii;var xa=env.invoke_viiiiiiii;var ya=env.invoke_viiiiii;var za=env.invoke_iii;var Aa=env.invoke_iiiiii;var Ba=env.invoke_viiii;var Ca=env._fabs;var Da=env._vsscanf;var Ea=env.__ZSt9terminatev;var Fa=env.___cxa_guard_acquire;var Ga=env._sscanf;var Ha=env.__ZSt18uncaught_exceptionv;var Ia=env.___ctype_toupper_loc;var Ja=env.__addDays;var Ka=env._SDL_GetError;var La=env._sbrk;var Ma=env.___cxa_begin_catch;var Na=env._emscripten_memcpy_big;var Oa=env._sysconf;var Pa=env._fileno;var Qa=env._fread;var Ra=env._write;var Sa=env.__isLeapYear;var Ta=env.__ZNSt9exceptionD2Ev;var Ua=env.___cxa_does_inherit;var Va=env.__exit;var Wa=env.___cxa_rethrow;var Xa=env._catclose;var Ya=env._llvm_lifetime_end;var Za=env._send;var _a=env._SDL_GL_SetAttribute;var $a=env.___cxa_is_number_type;var ab=env._SDL_GetKeyboardState;var bb=env.___cxa_free_exception;var cb=env.___cxa_find_matching_catch;var db=env._isxdigit_l;var eb=env.___cxa_guard_release;var fb=env._strerror_r;var gb=env._glViewport;var hb=env.___setErrNo;var ib=env._newlocale;var jb=env._isdigit_l;var kb=env.___resumeException;var lb=env._freelocale;var mb=env._glEnable;var nb=env._sprintf;var ob=env._vasprintf;var pb=env._vsnprintf;var qb=env._strtoull_l;var rb=env._read;var sb=env._SDL_SetVideoMode;var tb=env._fwrite;var ub=env._time;var vb=env._pthread_mutex_lock;var wb=env._catopen;var xb=env._exit;var yb=env.___ctype_b_loc;var zb=env._fmod;var Ab=env._llvm_invariant_start;var Bb=env.___cxa_allocate_exception;var Cb=env._strtoll;var Db=env._pwrite;var Eb=env._glClearColor;var Fb=env._uselocale;var Gb=env._SDL_Init;var Hb=env._snprintf;var Ib=env.__scanString;var Jb=env.___cxa_end_catch;var Kb=env._SDL_Quit;var Lb=env._strtoull;var Mb=env._strftime;var Nb=env._isxdigit;var Ob=env._pthread_cond_broadcast;var Pb=env._recv;var Qb=env._tan;var Rb=env._fgetc;var Sb=env.__parseInt64;var Tb=env.__getFloat;var Ub=env._abort;var Vb=env._isspace;var Wb=env._pthread_cond_wait;var Xb=env._llvm_lifetime_start;var Yb=env._ungetc;var Zb=env._fflush;var _b=env._strftime_l;var $b=env.__reallyNegative;var ac=env._SDL_PollEvent;var bc=env._catgets;var cc=env._glClear;var dc=env._asprintf;var ec=env._SDL_PumpEvents;var fc=env._strtoll_l;var gc=env.__arraySum;var hc=env.___ctype_tolower_loc;var ic=env._pthread_mutex_unlock;var jc=env._pread;var kc=env._mkport;var lc=env._emscripten_set_main_loop;var mc=env.___errno_location;var nc=env._copysign;var oc=env.___cxa_throw;var pc=env._glColorMask;var qc=env._SDL_GL_SwapBuffers;var rc=env._isdigit;var sc=env._strerror;var tc=env.__formatString;var uc=env._atexit;var vc=0.0;
// EMSCRIPTEN_START_FUNCS
function vh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+24|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+64|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){if((q&1|0)==0){a[D]=97;E=0;break}else{a[D]=65;E=0;break}}else{a[D]=46;B=D+2|0;a[D+1|0]=42;if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=qh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=qh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5056]|0)==0;if(E){do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=wh(s,r,z,n)|0}else{do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);o=c[1262]|0;c[m>>2]=c[f+8>>2];r=m+4|0;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=wh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}$m()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else if((s|0)==32){K=F}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Pm(J<<1)|0;if((L|0)!=0){M=H;N=L;O=L;break}$m()}}while(0);We(w,f);xh(M,K,F,O,u,v,w);ce(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];ed(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Qm(N)}if((I|0)==0){i=d;return}Qm(I);i=d;return}function wh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Fb(b|0)|0;b=ob(a|0,d|0,g|0)|0;if((e|0)==0){i=f;return b|0}Fb(e|0)|0;i=f;return b|0}function xh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1290]|0)==-1)){c[m>>2]=5160;c[m+4>>2]=112;c[m+8>>2]=0;we(5160,m,113)}m=(c[5164>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}q=j;r=c[o>>2]|0;if(!((c[1326]|0)==-1)){c[l>>2]=5304;c[l+4>>2]=112;c[l+8>>2]=0;we(5304,l,113)}l=(c[5308>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}s=r;Ac[c[(c[r>>2]|0)+20>>2]&63](n,s);c[h>>2]=f;t=a[b]|0;if(t<<24>>24==43|t<<24>>24==45){l=Lc[c[(c[j>>2]|0)+28>>2]&15](q,t)|0;t=c[h>>2]|0;c[h>>2]=t+1;a[t]=l;u=b+1|0}else{u=b}l=e;a:do{if((l-u|0)>1){if((a[u]|0)!=48){v=14;break}t=u+1|0;o=a[t]|0;if(!(o<<24>>24==88|o<<24>>24==120)){v=14;break}o=j;m=Lc[c[(c[o>>2]|0)+28>>2]&15](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=m;m=u+2|0;p=Lc[c[(c[o>>2]|0)+28>>2]&15](q,a[t]|0)|0;t=c[h>>2]|0;c[h>>2]=t+1;a[t]=p;if(m>>>0<e>>>0){w=m}else{x=m;y=m;break}while(1){p=a[w]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}t=ib(2147483647,5064,0)|0;c[1262]=t;eb(5056)}}while(0);t=w+1|0;if((db(p<<24>>24|0,c[1262]|0)|0)==0){x=m;y=w;break a}if(t>>>0<e>>>0){w=t}else{x=m;y=t;break}}}else{v=14}}while(0);b:do{if((v|0)==14){if(u>>>0<e>>>0){z=u}else{x=u;y=u;break}while(1){w=a[z]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}m=ib(2147483647,5064,0)|0;c[1262]=m;eb(5056)}}while(0);p=z+1|0;if((jb(w<<24>>24|0,c[1262]|0)|0)==0){x=u;y=z;break b}if(p>>>0<e>>>0){z=p}else{x=u;y=p;break}}}}while(0);u=n;z=a[u]|0;if((z&1)==0){A=(z&255)>>>1}else{A=c[n+4>>2]|0}do{if((A|0)==0){Ic[c[(c[j>>2]|0)+32>>2]&7](q,x,y,c[h>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+(y-x)}else{do{if((x|0)!=(y|0)){z=y+ -1|0;if(z>>>0>x>>>0){B=x;C=z}else{break}do{z=a[B]|0;a[B]=a[C]|0;a[C]=z;B=B+1|0;C=C+ -1|0;}while(B>>>0<C>>>0)}}while(0);w=Cc[c[(c[r>>2]|0)+16>>2]&63](s)|0;if(x>>>0<y>>>0){z=n+1|0;v=n+4|0;p=n+8|0;m=j;t=0;o=0;D=x;while(1){E=(a[u]&1)==0;do{if((a[(E?z:c[p>>2]|0)+o|0]|0)>0){if((t|0)!=(a[(E?z:c[p>>2]|0)+o|0]|0)){F=t;G=o;break}H=c[h>>2]|0;c[h>>2]=H+1;a[H]=w;H=a[u]|0;if((H&1)==0){I=(H&255)>>>1}else{I=c[v>>2]|0}F=0;G=(o>>>0<(I+ -1|0)>>>0)+o|0}else{F=t;G=o}}while(0);E=Lc[c[(c[m>>2]|0)+28>>2]&15](q,a[D]|0)|0;H=c[h>>2]|0;c[h>>2]=H+1;a[H]=E;E=D+1|0;if(E>>>0<y>>>0){t=F+1|0;o=G;D=E}else{break}}}D=f+(x-b)|0;o=c[h>>2]|0;if((D|0)==(o|0)){break}t=o+ -1|0;if(t>>>0>D>>>0){J=D;K=t}else{break}do{t=a[J]|0;a[J]=a[K]|0;a[K]=t;J=J+1|0;K=K+ -1|0;}while(J>>>0<K>>>0)}}while(0);c:do{if(y>>>0<e>>>0){K=j;J=y;while(1){x=a[J]|0;if(x<<24>>24==46){break}G=Lc[c[(c[K>>2]|0)+28>>2]&15](q,x)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x]=G;G=J+1|0;if(G>>>0<e>>>0){J=G}else{L=G;break c}}K=Cc[c[(c[r>>2]|0)+12>>2]&63](s)|0;G=c[h>>2]|0;c[h>>2]=G+1;a[G]=K;L=J+1|0}else{L=y}}while(0);Ic[c[(c[j>>2]|0)+32>>2]&7](q,L,e,c[h>>2]|0)|0;q=(c[h>>2]|0)+(l-L)|0;c[h>>2]=q;if((d|0)==(e|0)){M=q;c[g>>2]=M;Be(n);i=k;return}M=f+(d-b)|0;c[g>>2]=M;Be(n);i=k;return}function yh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+64|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){a[D]=76;B=D+1|0;if((q&1|0)==0){a[B]=97;E=0;break}else{a[B]=65;E=0;break}}else{a[D]=46;a[D+1|0]=42;a[D+2|0]=76;B=D+3|0;if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=qh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=qh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5056]|0)==0;if(E){do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=wh(s,r,z,n)|0}else{do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);o=c[1262]|0;r=m;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=wh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}$m()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==32){K=F}else if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Pm(J<<1)|0;if((L|0)!=0){M=H;N=L;O=L;break}$m()}}while(0);We(w,f);xh(M,K,F,O,u,v,w);ce(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];ed(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Qm(N)}if((I|0)==0){i=d;return}Qm(I);i=d;return}function zh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+16|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+40|0;p=i;i=i+8|0;q=i;i=i+8|0;r=m;a[r+0|0]=a[3960|0]|0;a[r+1|0]=a[3961|0]|0;a[r+2|0]=a[3962|0]|0;a[r+3|0]=a[3963|0]|0;a[r+4|0]=a[3964|0]|0;a[r+5|0]=a[3965|0]|0;m=n;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}s=ib(2147483647,5064,0)|0;c[1262]=s;eb(5056)}}while(0);s=c[1262]|0;c[k>>2]=h;h=qh(m,20,s,r,k)|0;k=n+h|0;r=c[f+4>>2]&176;do{if((r|0)==16){s=a[m]|0;if(s<<24>>24==43|s<<24>>24==45){t=n+1|0;break}if(!((h|0)>1&s<<24>>24==48)){u=10;break}s=a[n+1|0]|0;if(!(s<<24>>24==88|s<<24>>24==120)){u=10;break}t=n+2|0}else if((r|0)==32){t=k}else{u=10}}while(0);if((u|0)==10){t=m}u=o;We(p,f);r=p;p=c[r>>2]|0;if(!((c[1290]|0)==-1)){c[l>>2]=5160;c[l+4>>2]=112;c[l+8>>2]=0;we(5160,l,113)}l=(c[5164>>2]|0)+ -1|0;s=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-s>>2>>>0>l>>>0)){v=Bb(4)|0;w=v;um(w);oc(v|0,13120,101)}p=c[s+(l<<2)>>2]|0;if((p|0)==0){v=Bb(4)|0;w=v;um(w);oc(v|0,13120,101)}ce(c[r>>2]|0)|0;Ic[c[(c[p>>2]|0)+32>>2]&7](p,m,k,u)|0;m=o+h|0;if((t|0)==(k|0)){x=m;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];ed(b,j,u,x,m,f,g);E=j;i=d;return}x=o+(t-n)|0;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];ed(b,j,u,x,m,f,g);E=j;i=d;return}function Ah(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Bh(a){a=a|0;i=i;return}function Ch(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;j=i;i=i+56|0;k=j;l=j+8|0;m=j+24|0;n=j+32|0;o=j+40|0;if((c[f+4>>2]&1|0)==0){p=c[(c[d>>2]|0)+24>>2]|0;c[m>>2]=c[e>>2];q=h&1;r=k;s=m;c[r+0>>2]=c[s+0>>2];Kc[p&15](b,d,k,f,g,q);i=j;return}We(n,f);f=n;n=c[f>>2]|0;if(!((c[1328]|0)==-1)){c[l>>2]=5312;c[l+4>>2]=112;c[l+8>>2]=0;we(5312,l,113)}l=(c[5316>>2]|0)+ -1|0;q=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-q>>2>>>0>l>>>0)){t=Bb(4)|0;u=t;um(u);oc(t|0,13120,101)}n=c[q+(l<<2)>>2]|0;if((n|0)==0){t=Bb(4)|0;u=t;um(u);oc(t|0,13120,101)}t=n;ce(c[f>>2]|0)|0;f=c[n>>2]|0;if(h){Ac[c[f+24>>2]&63](o,t)}else{Ac[c[f+28>>2]&63](o,t)}t=o;f=a[t]|0;if((f&1)==0){h=o+4|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=c[h>>2]|0;w=h;x=o+4|0}h=e;e=f;f=v;while(1){if((e&1)==0){y=x;z=(e&255)>>>1}else{y=c[w>>2]|0;z=c[x>>2]|0}if((f|0)==(y+(z<<2)|0)){break}v=c[f>>2]|0;n=c[h>>2]|0;do{if((n|0)!=0){u=n+24|0;l=c[u>>2]|0;if((l|0)==(c[n+28>>2]|0)){A=Lc[c[(c[n>>2]|0)+52>>2]&15](n,v)|0}else{c[u>>2]=l+4;c[l>>2]=v;A=v}if(!((A|0)==-1)){break}c[h>>2]=0}}while(0);e=a[t]|0;f=f+4|0}c[b>>2]=c[h>>2];Ne(o);i=j;return}function Dh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+88|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3952|0]|0;a[s+1|0]=a[3953|0]|0;a[s+2|0]=a[3954|0]|0;a[s+3|0]=a[3955|0]|0;a[s+4|0]=a[3956|0]|0;a[s+5|0]=a[3957|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=100}}while(0);w=m;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}x=ib(2147483647,5064,0)|0;c[1262]=x;eb(5056)}}while(0);x=c[1262]|0;c[k>>2]=h;h=qh(w,12,x,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else if((s|0)==32){y=k}else{z=20}}while(0);if((z|0)==20){y=w}z=n;We(q,f);Eh(w,y,k,z,o,p,q);ce(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];Fh(b,j,z,e,o,f,g);i=d;return}function Eh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1288]|0)==-1)){c[m>>2]=5152;c[m+4>>2]=112;c[m+8>>2]=0;we(5152,m,113)}m=(c[5156>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}q=j;r=c[o>>2]|0;if(!((c[1328]|0)==-1)){c[l>>2]=5312;c[l+4>>2]=112;c[l+8>>2]=0;we(5312,l,113)}l=(c[5316>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}s=r;Ac[c[(c[r>>2]|0)+20>>2]&63](n,s);t=n;l=a[t]|0;if((l&1)==0){u=(l&255)>>>1}else{u=c[n+4>>2]|0}do{if((u|0)==0){Ic[c[(c[j>>2]|0)+48>>2]&7](q,b,e,f)|0;l=f+(e-b<<2)|0;c[h>>2]=l;v=l}else{c[h>>2]=f;l=a[b]|0;if(l<<24>>24==43|l<<24>>24==45){o=Lc[c[(c[j>>2]|0)+44>>2]&15](q,l)|0;l=c[h>>2]|0;c[h>>2]=l+4;c[l>>2]=o;w=b+1|0}else{w=b}do{if((e-w|0)>1){if((a[w]|0)!=48){x=w;break}o=w+1|0;l=a[o]|0;if(!(l<<24>>24==88|l<<24>>24==120)){x=w;break}l=j;m=Lc[c[(c[l>>2]|0)+44>>2]&15](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+4;c[p>>2]=m;m=Lc[c[(c[l>>2]|0)+44>>2]&15](q,a[o]|0)|0;o=c[h>>2]|0;c[h>>2]=o+4;c[o>>2]=m;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(e|0)){m=e+ -1|0;if(m>>>0>x>>>0){y=x;z=m}else{break}do{m=a[y]|0;a[y]=a[z]|0;a[z]=m;y=y+1|0;z=z+ -1|0;}while(y>>>0<z>>>0)}}while(0);m=Cc[c[(c[r>>2]|0)+16>>2]&63](s)|0;if(x>>>0<e>>>0){o=n+1|0;l=j;p=n+4|0;A=n+8|0;B=0;C=0;D=x;while(1){E=(a[t]&1)==0;do{if((a[(E?o:c[A>>2]|0)+C|0]|0)==0){F=B;G=C}else{if((B|0)!=(a[(E?o:c[A>>2]|0)+C|0]|0)){F=B;G=C;break}H=c[h>>2]|0;c[h>>2]=H+4;c[H>>2]=m;H=a[t]|0;if((H&1)==0){I=(H&255)>>>1}else{I=c[p>>2]|0}F=0;G=(C>>>0<(I+ -1|0)>>>0)+C|0}}while(0);E=Lc[c[(c[l>>2]|0)+44>>2]&15](q,a[D]|0)|0;H=c[h>>2]|0;J=H+4|0;c[h>>2]=J;c[H>>2]=E;E=D+1|0;if(E>>>0<e>>>0){B=F+1|0;C=G;D=E}else{K=J;break}}}else{K=c[h>>2]|0}D=f+(x-b<<2)|0;if((D|0)==(K|0)){v=K;break}C=K+ -4|0;if(C>>>0>D>>>0){L=D;M=C}else{v=K;break}while(1){C=c[L>>2]|0;c[L>>2]=c[M>>2];c[M>>2]=C;C=L+4|0;D=M+ -4|0;if(C>>>0<D>>>0){M=D;L=C}else{v=K;break}}}}while(0);if((d|0)==(e|0)){N=v;c[g>>2]=N;Be(n);i=k;return}N=f+(d-b<<2)|0;c[g>>2]=N;Be(n);i=k;return}function Fh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=k;m=d;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((wc[c[(c[d>>2]|0)+48>>2]&31](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){Me(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((wc[c[(c[d>>2]|0)+48>>2]&31](d,r,q)|0)==(q|0)){Ne(l);break}c[m>>2]=0;c[b>>2]=0;Ne(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((wc[c[(c[d>>2]|0)+48>>2]&31](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function Gh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+168|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==64){a[w]=111}else if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else{a[w]=100}}while(0);w=n;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}v=ib(2147483647,5064,0)|0;c[1262]=v;eb(5056)}}while(0);v=c[1262]|0;x=l;c[x>>2]=h;c[x+4>>2]=j;j=qh(w,22,v,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else if((t|0)==32){y=l}else{z=20}}while(0);if((z|0)==20){y=w}z=o;We(r,f);Eh(w,y,l,z,p,q,r);ce(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];Fh(b,k,z,e,p,f,g);i=d;return}function Hh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+88|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3952|0]|0;a[s+1|0]=a[3953|0]|0;a[s+2|0]=a[3954|0]|0;a[s+3|0]=a[3955|0]|0;a[s+4|0]=a[3956|0]|0;a[s+5|0]=a[3957|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=117}}while(0);w=m;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}x=ib(2147483647,5064,0)|0;c[1262]=x;eb(5056)}}while(0);x=c[1262]|0;c[k>>2]=h;h=qh(w,12,x,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else if((s|0)==32){y=k}else{z=20}}while(0);if((z|0)==20){y=w}z=n;We(q,f);Eh(w,y,k,z,o,p,q);ce(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];Fh(b,j,z,e,o,f,g);i=d;return}function Ih(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+176|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==64){a[w]=111}else if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else{a[w]=117}}while(0);w=n;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}v=ib(2147483647,5064,0)|0;c[1262]=v;eb(5056)}}while(0);v=c[1262]|0;x=l;c[x>>2]=h;c[x+4>>2]=j;j=qh(w,23,v,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else if((t|0)==32){y=l}else{z=20}}while(0);if((z|0)==20){y=w}z=o;We(r,f);Eh(w,y,l,z,p,q,r);ce(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];Fh(b,k,z,e,p,f,g);i=d;return}function Jh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+24|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+232|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){if((q&1|0)==0){a[D]=97;E=0;break}else{a[D]=65;E=0;break}}else{a[D]=46;B=D+2|0;a[D+1|0]=42;if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=qh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=qh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5056]|0)==0;if(E){do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=wh(s,r,z,n)|0}else{do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);o=c[1262]|0;c[m>>2]=c[f+8>>2];r=m+4|0;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=wh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}$m()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else if((s|0)==32){K=F}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Pm(J<<3)|0;s=L;if((L|0)!=0){M=H;N=s;O=s;break}$m()}}while(0);We(w,f);Kh(M,K,F,O,u,v,w);ce(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];Fh(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Qm(N)}if((I|0)==0){i=d;return}Qm(I);i=d;return}function Kh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1288]|0)==-1)){c[m>>2]=5152;c[m+4>>2]=112;c[m+8>>2]=0;we(5152,m,113)}m=(c[5156>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}q=j;r=c[o>>2]|0;if(!((c[1328]|0)==-1)){c[l>>2]=5312;c[l+4>>2]=112;c[l+8>>2]=0;we(5312,l,113)}l=(c[5316>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}s=r;Ac[c[(c[r>>2]|0)+20>>2]&63](n,s);c[h>>2]=f;t=a[b]|0;if(t<<24>>24==43|t<<24>>24==45){l=Lc[c[(c[j>>2]|0)+44>>2]&15](q,t)|0;t=c[h>>2]|0;c[h>>2]=t+4;c[t>>2]=l;u=b+1|0}else{u=b}l=e;a:do{if((l-u|0)>1){if((a[u]|0)!=48){v=14;break}t=u+1|0;o=a[t]|0;if(!(o<<24>>24==88|o<<24>>24==120)){v=14;break}o=j;m=Lc[c[(c[o>>2]|0)+44>>2]&15](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+4;c[p>>2]=m;m=u+2|0;p=Lc[c[(c[o>>2]|0)+44>>2]&15](q,a[t]|0)|0;t=c[h>>2]|0;c[h>>2]=t+4;c[t>>2]=p;if(m>>>0<e>>>0){w=m}else{x=m;y=m;break}while(1){p=a[w]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}t=ib(2147483647,5064,0)|0;c[1262]=t;eb(5056)}}while(0);t=w+1|0;if((db(p<<24>>24|0,c[1262]|0)|0)==0){x=m;y=w;break a}if(t>>>0<e>>>0){w=t}else{x=m;y=t;break}}}else{v=14}}while(0);b:do{if((v|0)==14){if(u>>>0<e>>>0){z=u}else{x=u;y=u;break}while(1){w=a[z]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}m=ib(2147483647,5064,0)|0;c[1262]=m;eb(5056)}}while(0);p=z+1|0;if((jb(w<<24>>24|0,c[1262]|0)|0)==0){x=u;y=z;break b}if(p>>>0<e>>>0){z=p}else{x=u;y=p;break}}}}while(0);u=n;z=a[u]|0;if((z&1)==0){A=(z&255)>>>1}else{A=c[n+4>>2]|0}do{if((A|0)==0){Ic[c[(c[j>>2]|0)+48>>2]&7](q,x,y,c[h>>2]|0)|0;z=(c[h>>2]|0)+(y-x<<2)|0;c[h>>2]=z;B=z}else{do{if((x|0)!=(y|0)){z=y+ -1|0;if(z>>>0>x>>>0){C=x;D=z}else{break}do{z=a[C]|0;a[C]=a[D]|0;a[D]=z;C=C+1|0;D=D+ -1|0;}while(C>>>0<D>>>0)}}while(0);w=Cc[c[(c[r>>2]|0)+16>>2]&63](s)|0;if(x>>>0<y>>>0){z=n+1|0;v=n+4|0;p=n+8|0;m=j;t=0;o=0;E=x;while(1){F=(a[u]&1)==0;do{if((a[(F?z:c[p>>2]|0)+o|0]|0)>0){if((t|0)!=(a[(F?z:c[p>>2]|0)+o|0]|0)){G=t;H=o;break}I=c[h>>2]|0;c[h>>2]=I+4;c[I>>2]=w;I=a[u]|0;if((I&1)==0){J=(I&255)>>>1}else{J=c[v>>2]|0}G=0;H=(o>>>0<(J+ -1|0)>>>0)+o|0}else{G=t;H=o}}while(0);F=Lc[c[(c[m>>2]|0)+44>>2]&15](q,a[E]|0)|0;I=c[h>>2]|0;K=I+4|0;c[h>>2]=K;c[I>>2]=F;F=E+1|0;if(F>>>0<y>>>0){t=G+1|0;o=H;E=F}else{L=K;break}}}else{L=c[h>>2]|0}E=f+(x-b<<2)|0;if((E|0)==(L|0)){B=L;break}o=L+ -4|0;if(o>>>0>E>>>0){M=E;N=o}else{B=L;break}while(1){o=c[M>>2]|0;c[M>>2]=c[N>>2];c[N>>2]=o;o=M+4|0;E=N+ -4|0;if(o>>>0<E>>>0){N=E;M=o}else{B=L;break}}}}while(0);c:do{if(y>>>0<e>>>0){L=j;M=y;while(1){N=a[M]|0;if(N<<24>>24==46){break}x=Lc[c[(c[L>>2]|0)+44>>2]&15](q,N)|0;N=c[h>>2]|0;H=N+4|0;c[h>>2]=H;c[N>>2]=x;x=M+1|0;if(x>>>0<e>>>0){M=x}else{O=H;P=x;break c}}L=Cc[c[(c[r>>2]|0)+12>>2]&63](s)|0;x=c[h>>2]|0;H=x+4|0;c[h>>2]=H;c[x>>2]=L;O=H;P=M+1|0}else{O=B;P=y}}while(0);Ic[c[(c[j>>2]|0)+48>>2]&7](q,P,e,O)|0;O=(c[h>>2]|0)+(l-P<<2)|0;c[h>>2]=O;if((d|0)==(e|0)){Q=O;c[g>>2]=Q;Be(n);i=k;return}Q=f+(d-b<<2)|0;c[g>>2]=Q;Be(n);i=k;return}function Lh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+232|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){a[D]=76;B=D+1|0;if((q&1|0)==0){a[B]=97;E=0;break}else{a[B]=65;E=0;break}}else{a[D]=46;a[D+1|0]=42;a[D+2|0]=76;B=D+3|0;if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=qh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=qh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5056]|0)==0;if(E){do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);r=c[1262]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=wh(s,r,z,n)|0}else{do{if(o){if((Fa(5056)|0)==0){break}r=ib(2147483647,5064,0)|0;c[1262]=r;eb(5056)}}while(0);o=c[1262]|0;r=m;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=wh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}$m()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else if((s|0)==32){K=F}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Pm(J<<3)|0;s=L;if((L|0)!=0){M=H;N=s;O=s;break}$m()}}while(0);We(w,f);Kh(M,K,F,O,u,v,w);ce(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];Fh(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Qm(N)}if((I|0)==0){i=d;return}Qm(I);i=d;return}function Mh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+16|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+152|0;p=i;i=i+8|0;q=i;i=i+8|0;r=m;a[r+0|0]=a[3960|0]|0;a[r+1|0]=a[3961|0]|0;a[r+2|0]=a[3962|0]|0;a[r+3|0]=a[3963|0]|0;a[r+4|0]=a[3964|0]|0;a[r+5|0]=a[3965|0]|0;m=n;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}s=ib(2147483647,5064,0)|0;c[1262]=s;eb(5056)}}while(0);s=c[1262]|0;c[k>>2]=h;h=qh(m,20,s,r,k)|0;k=n+h|0;r=c[f+4>>2]&176;do{if((r|0)==32){t=k}else if((r|0)==16){s=a[m]|0;if(s<<24>>24==43|s<<24>>24==45){t=n+1|0;break}if(!((h|0)>1&s<<24>>24==48)){u=10;break}s=a[n+1|0]|0;if(!(s<<24>>24==88|s<<24>>24==120)){u=10;break}t=n+2|0}else{u=10}}while(0);if((u|0)==10){t=m}We(p,f);u=p;p=c[u>>2]|0;if(!((c[1288]|0)==-1)){c[l>>2]=5152;c[l+4>>2]=112;c[l+8>>2]=0;we(5152,l,113)}l=(c[5156>>2]|0)+ -1|0;r=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-r>>2>>>0>l>>>0)){v=Bb(4)|0;w=v;um(w);oc(v|0,13120,101)}p=c[r+(l<<2)>>2]|0;if((p|0)==0){v=Bb(4)|0;w=v;um(w);oc(v|0,13120,101)}ce(c[u>>2]|0)|0;u=o;Ic[c[(c[p>>2]|0)+48>>2]&7](p,m,k,u)|0;m=o+(h<<2)|0;if((t|0)==(k|0)){x=m;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];Fh(b,j,u,x,m,f,g);E=j;i=d;return}x=o+(t-n<<2)|0;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];Fh(b,j,u,x,m,f,g);E=j;i=d;return}function Nh(e,f,g,h,j,k,l,m,n){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0;o=i;i=i+64|0;p=o;q=o+8|0;r=o+16|0;s=o+32|0;t=o+40|0;u=o+48|0;v=o+56|0;We(s,j);w=s;s=c[w>>2]|0;if(!((c[1290]|0)==-1)){c[r>>2]=5160;c[r+4>>2]=112;c[r+8>>2]=0;we(5160,r,113)}r=(c[5164>>2]|0)+ -1|0;x=c[s+8>>2]|0;if(!((c[s+12>>2]|0)-x>>2>>>0>r>>>0)){y=Bb(4)|0;z=y;um(z);oc(y|0,13120,101)}s=c[x+(r<<2)>>2]|0;if((s|0)==0){y=Bb(4)|0;z=y;um(z);oc(y|0,13120,101)}y=s;ce(c[w>>2]|0)|0;c[k>>2]=0;w=g;a:do{if((m|0)==(n|0)){A=65}else{z=h;r=s;x=s+8|0;B=s;C=f;D=u;E=v;F=t;G=m;H=0;b:while(1){I=H;while(1){if((I|0)!=0){A=65;break a}J=c[w>>2]|0;do{if((J|0)==0){K=0}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){K=J;break}if(!((Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0)==-1)){K=J;break}c[w>>2]=0;K=0}}while(0);J=(K|0)==0;L=c[z>>2]|0;c:do{if((L|0)==0){A=19}else{do{if((c[L+12>>2]|0)==(c[L+16>>2]|0)){if(!((Cc[c[(c[L>>2]|0)+36>>2]&63](L)|0)==-1)){break}c[z>>2]=0;A=19;break c}}while(0);if(J){M=L}else{A=20;break b}}}while(0);if((A|0)==19){A=0;if(J){A=20;break b}else{M=0}}if((wc[c[(c[r>>2]|0)+36>>2]&31](y,a[G]|0,0)|0)<<24>>24==37){A=22;break}L=a[G]|0;if(L<<24>>24>-1){N=c[x>>2]|0;if(!((b[N+(L<<24>>24<<1)>>1]&8192)==0)){O=G;A=33;break}}P=K+12|0;L=c[P>>2]|0;Q=K+16|0;if((L|0)==(c[Q>>2]|0)){R=Cc[c[(c[K>>2]|0)+36>>2]&63](K)|0}else{R=d[L]|0}L=Lc[c[(c[B>>2]|0)+12>>2]&15](y,R&255)|0;if(L<<24>>24==(Lc[c[(c[B>>2]|0)+12>>2]&15](y,a[G]|0)|0)<<24>>24){A=60;break}c[k>>2]=4;I=4}d:do{if((A|0)==22){A=0;I=G+1|0;if((I|0)==(n|0)){A=23;break b}L=wc[c[(c[r>>2]|0)+36>>2]&31](y,a[I]|0,0)|0;if(L<<24>>24==48|L<<24>>24==69){S=G+2|0;if((S|0)==(n|0)){A=26;break b}T=S;U=wc[c[(c[r>>2]|0)+36>>2]&31](y,a[S]|0,0)|0;V=L}else{T=I;U=L;V=0}L=c[(c[C>>2]|0)+36>>2]|0;c[D>>2]=K;c[E>>2]=M;I=q;S=u;c[I+0>>2]=c[S+0>>2];S=p;I=v;c[S+0>>2]=c[I+0>>2];Bc[L&3](t,f,q,p,j,k,l,U,V);c[w>>2]=c[F>>2];W=T+1|0}else if((A|0)==33){while(1){A=0;L=O+1|0;if((L|0)==(n|0)){X=n;break}I=a[L]|0;if(!(I<<24>>24>-1)){X=L;break}if((b[N+(I<<24>>24<<1)>>1]&8192)==0){X=L;break}else{O=L;A=33}}J=K;L=M;I=M;while(1){do{if((J|0)==0){Y=0}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){Y=J;break}if(!((Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0)==-1)){Y=J;break}c[w>>2]=0;Y=0}}while(0);S=(Y|0)==0;do{if((I|0)==0){Z=L;A=46}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(S){_=L;$=I;break}else{W=X;break d}}if((Cc[c[(c[I>>2]|0)+36>>2]&63](I)|0)==-1){c[z>>2]=0;Z=0;A=46;break}else{if(S^(L|0)==0){_=L;$=L;break}else{W=X;break d}}}}while(0);if((A|0)==46){A=0;if(S){W=X;break d}else{_=Z;$=0}}aa=Y+12|0;ba=c[aa>>2]|0;ca=Y+16|0;if((ba|0)==(c[ca>>2]|0)){da=Cc[c[(c[Y>>2]|0)+36>>2]&63](Y)|0}else{da=d[ba]|0}if(!((da&255)<<24>>24>-1)){W=X;break d}if((b[(c[x>>2]|0)+(da<<24>>24<<1)>>1]&8192)==0){W=X;break d}ba=c[aa>>2]|0;if((ba|0)==(c[ca>>2]|0)){Cc[c[(c[Y>>2]|0)+40>>2]&63](Y)|0;J=Y;L=_;I=$;continue}else{c[aa>>2]=ba+1;J=Y;L=_;I=$;continue}}}else if((A|0)==60){A=0;I=c[P>>2]|0;if((I|0)==(c[Q>>2]|0)){Cc[c[(c[K>>2]|0)+40>>2]&63](K)|0}else{c[P>>2]=I+1}W=G+1|0}}while(0);if((W|0)==(n|0)){A=65;break a}G=W;H=c[k>>2]|0}if((A|0)==20){c[k>>2]=4;ea=K;break}else if((A|0)==23){c[k>>2]=4;ea=K;break}else if((A|0)==26){c[k>>2]=4;ea=K;break}}}while(0);if((A|0)==65){ea=c[w>>2]|0}w=g;do{if((ea|0)==0){fa=0}else{if((c[ea+12>>2]|0)!=(c[ea+16>>2]|0)){fa=ea;break}if(!((Cc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0)==-1)){fa=ea;break}c[w>>2]=0;fa=0}}while(0);w=(fa|0)==0;ea=h;h=c[ea>>2]|0;e:do{if((h|0)==0){A=75}else{do{if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if(!((Cc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1)){break}c[ea>>2]=0;A=75;break e}}while(0);if(!w){break}ga=e;c[ga>>2]=fa;i=o;return}}while(0);do{if((A|0)==75){if(w){break}ga=e;c[ga>>2]=fa;i=o;return}}while(0);c[k>>2]=c[k>>2]|2;ga=e;c[ga>>2]=fa;i=o;return}function Oh(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Ph(a){a=a|0;i=i;return}function Qh(a){a=a|0;i=i;return 2}function Rh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=j;l=j+8|0;m=j+16|0;n=j+24|0;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];e=l;d=m;c[e+0>>2]=c[d+0>>2];d=k;e=n;c[d+0>>2]=c[e+0>>2];Nh(a,b,l,k,f,g,h,4064,4072|0);i=j;return}function Sh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;k=i;i=i+32|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=d+8|0;q=Cc[c[(c[p>>2]|0)+20>>2]&63](p)|0;c[n>>2]=c[e>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=q+1|0;s=q+1|0;t=(f&255)>>>1}else{f=c[q+8>>2]|0;r=f;s=f;t=c[q+4>>2]|0}q=r+t|0;t=m;r=n;c[t+0>>2]=c[r+0>>2];r=l;t=o;c[r+0>>2]=c[t+0>>2];Nh(b,d,m,l,g,h,j,s,q);i=k;return}function Th(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;We(n,f);f=n;n=c[f>>2]|0;if(!((c[1290]|0)==-1)){c[m>>2]=5160;c[m+4>>2]=112;c[m+8>>2]=0;we(5160,m,113)}m=(c[5164>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}p=n;ce(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=Cc[c[c[e>>2]>>2]&63](e)|0;c[l>>2]=f;f=b+168|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=og(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=168){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+24>>2]=((g|0)/12|0|0)%7|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function Uh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;We(n,f);f=n;n=c[f>>2]|0;if(!((c[1290]|0)==-1)){c[m>>2]=5160;c[m+4>>2]=112;c[m+8>>2]=0;we(5160,m,113)}m=(c[5164>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}p=n;ce(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=Cc[c[(c[e>>2]|0)+4>>2]&63](e)|0;c[l>>2]=f;f=b+288|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=og(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=288){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+16>>2]=((g|0)/12|0|0)%12|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function Vh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=i;i=i+40|0;j=b;k=b+8|0;l=b+16|0;m=b+32|0;We(m,f);f=m;m=c[f>>2]|0;if(!((c[1290]|0)==-1)){c[l>>2]=5160;c[l+4>>2]=112;c[l+8>>2]=0;we(5160,l,113)}l=(c[5164>>2]|0)+ -1|0;n=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-n>>2>>>0>l>>>0)){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}m=c[n+(l<<2)>>2]|0;if((m|0)==0){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}o=m;ce(c[f>>2]|0)|0;f=h+20|0;c[k>>2]=c[e>>2];e=j;h=k;c[e+0>>2]=c[h+0>>2];h=Zh(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}if((h|0)<69){t=h+2e3|0}else{t=(h+ -69|0)>>>0<31?h+1900|0:h}c[f>>2]=t+ -1900;q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}function Wh(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0;l=i;i=i+576|0;m=l;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+104|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;M=l+208|0;N=l+216|0;O=l+224|0;P=l+232|0;Q=l+240|0;R=l+248|0;S=l+256|0;T=l+264|0;U=l+272|0;V=l+280|0;W=l+288|0;X=l+296|0;Y=l+304|0;Z=l+312|0;_=l+320|0;$=l+328|0;aa=l+336|0;ba=l+344|0;ca=l+352|0;da=l+368|0;ea=l+376|0;fa=l+384|0;ga=l+392|0;ha=l+400|0;ia=l+408|0;ja=l+416|0;ka=l+424|0;la=l+432|0;ma=l+440|0;na=l+448|0;oa=l+456|0;pa=l+464|0;qa=l+472|0;ra=l+480|0;sa=l+488|0;ta=l+496|0;ua=l+504|0;va=l+512|0;wa=l+520|0;xa=l+528|0;ya=l+536|0;za=l+544|0;Aa=l+552|0;Ba=l+560|0;Ca=l+568|0;c[h>>2]=0;We(da,g);Da=da;da=c[Da>>2]|0;if(!((c[1290]|0)==-1)){c[ca>>2]=5160;c[ca+4>>2]=112;c[ca+8>>2]=0;we(5160,ca,113)}ca=(c[5164>>2]|0)+ -1|0;Ea=c[da+8>>2]|0;if(!((c[da+12>>2]|0)-Ea>>2>>>0>ca>>>0)){Fa=Bb(4)|0;Ga=Fa;um(Ga);oc(Fa|0,13120,101)}da=c[Ea+(ca<<2)>>2]|0;if((da|0)==0){Fa=Bb(4)|0;Ga=Fa;um(Ga);oc(Fa|0,13120,101)}Fa=da;ce(c[Da>>2]|0)|0;a:do{switch(k<<24>>24|0){case 65:case 97:{Da=c[f>>2]|0;da=d+8|0;Ga=Cc[c[c[da>>2]>>2]&63](da)|0;c[ba>>2]=Da;c[Q+0>>2]=c[ba+0>>2];Da=(og(e,Q,Ga,Ga+168|0,Fa,h,0)|0)-Ga|0;if((Da|0)>=168){break a}c[j+24>>2]=((Da|0)/12|0|0)%7|0;break};case 104:case 66:case 98:{Da=c[f>>2]|0;Ga=d+8|0;da=Cc[c[(c[Ga>>2]|0)+4>>2]&63](Ga)|0;c[aa>>2]=Da;c[P+0>>2]=c[aa+0>>2];Da=(og(e,P,da,da+288|0,Fa,h,0)|0)-da|0;if((Da|0)>=288){break a}c[j+16>>2]=((Da|0)/12|0|0)%12|0;break};case 101:case 100:{Da=j+12|0;c[$>>2]=c[f>>2];c[M+0>>2]=c[$+0>>2];da=Zh(e,M,h,Fa,2)|0;Ga=c[h>>2]|0;do{if((Ga&4|0)==0){if(!((da+ -1|0)>>>0<31)){break}c[Da>>2]=da;break a}}while(0);c[h>>2]=Ga|4;break};case 106:{c[Y>>2]=c[f>>2];c[F+0>>2]=c[Y+0>>2];da=Zh(e,F,h,Fa,3)|0;Da=c[h>>2]|0;if((Da&4|0)==0&(da|0)<366){c[j+28>>2]=da;break a}else{c[h>>2]=Da|4;break a}break};case 70:{Da=e;c[la>>2]=c[Da>>2];c[ma>>2]=c[f>>2];c[J+0>>2]=c[la+0>>2];c[I+0>>2]=c[ma+0>>2];Nh(ka,d,J,I,g,h,j,4080,4088|0);c[Da>>2]=c[ka>>2];break};case 68:{Da=e;c[ia>>2]=c[Da>>2];c[ja>>2]=c[f>>2];c[L+0>>2]=c[ia+0>>2];c[K+0>>2]=c[ja+0>>2];Nh(ha,d,L,K,g,h,j,4072,4080|0);c[Da>>2]=c[ha>>2];break};case 72:{c[_>>2]=c[f>>2];c[H+0>>2]=c[_+0>>2];Da=Zh(e,H,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(Da|0)<24){c[j+8>>2]=Da;break a}else{c[h>>2]=da|4;break a}break};case 73:{da=j+8|0;c[Z>>2]=c[f>>2];c[G+0>>2]=c[Z+0>>2];Da=Zh(e,G,h,Fa,2)|0;ca=c[h>>2]|0;do{if((ca&4|0)==0){if(!((Da+ -1|0)>>>0<12)){break}c[da>>2]=Da;break a}}while(0);c[h>>2]=ca|4;break};case 99:{Da=d+8|0;da=Cc[c[(c[Da>>2]|0)+12>>2]&63](Da)|0;Da=e;c[fa>>2]=c[Da>>2];c[ga>>2]=c[f>>2];Ga=a[da]|0;if((Ga&1)==0){Ha=da+1|0;Ia=da+1|0;Ja=(Ga&255)>>>1}else{Ga=c[da+8>>2]|0;Ha=Ga;Ia=Ga;Ja=c[da+4>>2]|0}c[O+0>>2]=c[fa+0>>2];c[N+0>>2]=c[ga+0>>2];Nh(ea,d,O,N,g,h,j,Ia,Ha+Ja|0);c[Da>>2]=c[ea>>2];break};case 109:{c[X>>2]=c[f>>2];c[E+0>>2]=c[X+0>>2];Da=Zh(e,E,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(Da|0)<13){c[j+16>>2]=Da+ -1;break a}else{c[h>>2]=da|4;break a}break};case 77:{c[W>>2]=c[f>>2];c[D+0>>2]=c[W+0>>2];da=Zh(e,D,h,Fa,2)|0;Da=c[h>>2]|0;if((Da&4|0)==0&(da|0)<60){c[j+4>>2]=da;break a}else{c[h>>2]=Da|4;break a}break};case 116:case 110:{c[na>>2]=c[f>>2];c[C+0>>2]=c[na+0>>2];Xh(0,e,C,h,Fa);break};case 112:{Da=j+8|0;da=c[f>>2]|0;Ga=d+8|0;Ea=Cc[c[(c[Ga>>2]|0)+8>>2]&63](Ga)|0;Ga=a[Ea]|0;if((Ga&1)==0){Ka=(Ga&255)>>>1}else{Ka=c[Ea+4>>2]|0}Ga=a[Ea+12|0]|0;if((Ga&1)==0){La=(Ga&255)>>>1}else{La=c[Ea+16>>2]|0}if((Ka|0)==(0-La|0)){c[h>>2]=c[h>>2]|4;break a}c[V>>2]=da;c[B+0>>2]=c[V+0>>2];da=og(e,B,Ea,Ea+24|0,Fa,h,0)|0;Ga=da-Ea|0;do{if((da|0)==(Ea|0)){if((c[Da>>2]|0)!=12){break}c[Da>>2]=0;break a}}while(0);if((Ga|0)!=12){break a}Ea=c[Da>>2]|0;if((Ea|0)>=12){break a}c[Da>>2]=Ea+12;break};case 114:{Ea=e;c[pa>>2]=c[Ea>>2];c[qa>>2]=c[f>>2];c[A+0>>2]=c[pa+0>>2];c[z+0>>2]=c[qa+0>>2];Nh(oa,d,A,z,g,h,j,4088,4099|0);c[Ea>>2]=c[oa>>2];break};case 82:{Ea=e;c[sa>>2]=c[Ea>>2];c[ta>>2]=c[f>>2];c[y+0>>2]=c[sa+0>>2];c[x+0>>2]=c[ta+0>>2];Nh(ra,d,y,x,g,h,j,4104,4109|0);c[Ea>>2]=c[ra>>2];break};case 83:{c[U>>2]=c[f>>2];c[w+0>>2]=c[U+0>>2];Ea=Zh(e,w,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(Ea|0)<61){c[j>>2]=Ea;break a}else{c[h>>2]=da|4;break a}break};case 84:{da=e;c[va>>2]=c[da>>2];c[wa>>2]=c[f>>2];c[v+0>>2]=c[va+0>>2];c[u+0>>2]=c[wa+0>>2];Nh(ua,d,v,u,g,h,j,4112,4120|0);c[da>>2]=c[ua>>2];break};case 119:{c[T>>2]=c[f>>2];c[t+0>>2]=c[T+0>>2];da=Zh(e,t,h,Fa,1)|0;Ea=c[h>>2]|0;if((Ea&4|0)==0&(da|0)<7){c[j+24>>2]=da;break a}else{c[h>>2]=Ea|4;break a}break};case 120:{Ea=c[(c[d>>2]|0)+20>>2]|0;c[xa>>2]=c[e>>2];c[ya>>2]=c[f>>2];c[s+0>>2]=c[xa+0>>2];c[r+0>>2]=c[ya+0>>2];xc[Ea&63](b,d,s,r,g,h,j);i=l;return};case 88:{Ea=d+8|0;da=Cc[c[(c[Ea>>2]|0)+24>>2]&63](Ea)|0;Ea=e;c[Aa>>2]=c[Ea>>2];c[Ba>>2]=c[f>>2];ca=a[da]|0;if((ca&1)==0){Ma=da+1|0;Na=da+1|0;Oa=(ca&255)>>>1}else{ca=c[da+8>>2]|0;Ma=ca;Na=ca;Oa=c[da+4>>2]|0}c[q+0>>2]=c[Aa+0>>2];c[p+0>>2]=c[Ba+0>>2];Nh(za,d,q,p,g,h,j,Na,Ma+Oa|0);c[Ea>>2]=c[za>>2];break};case 121:{c[S>>2]=c[f>>2];c[o+0>>2]=c[S+0>>2];Ea=Zh(e,o,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}if((Ea|0)<69){Pa=Ea+2e3|0}else{Pa=(Ea+ -69|0)>>>0<31?Ea+1900|0:Ea}c[j+20>>2]=Pa+ -1900;break};case 89:{c[R>>2]=c[f>>2];c[n+0>>2]=c[R+0>>2];Ea=Zh(e,n,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}c[j+20>>2]=Ea+ -1900;break};case 37:{c[Ca>>2]=c[f>>2];c[m+0>>2]=c[Ca+0>>2];Yh(0,e,m,h,Fa);break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}function Xh(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;j=e;e=f;f=h+8|0;a:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((Cc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;do{if((l|0)==0){m=12}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(h){n=l;break}else{o=l;break a}}if((Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1){c[e>>2]=0;m=12;break}else{if(h){n=l;break}else{o=l;break a}}}}while(0);if((m|0)==12){m=0;if(h){o=0;break}else{n=0}}l=c[j>>2]|0;p=c[l+12>>2]|0;if((p|0)==(c[l+16>>2]|0)){q=Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{q=d[p]|0}if(!((q&255)<<24>>24>-1)){o=n;break}if((b[(c[f>>2]|0)+(q<<24>>24<<1)>>1]&8192)==0){o=n;break}p=c[j>>2]|0;l=p+12|0;r=c[l>>2]|0;if((r|0)==(c[p+16>>2]|0)){Cc[c[(c[p>>2]|0)+40>>2]&63](p)|0;continue}else{c[l>>2]=r+1;continue}}n=c[j>>2]|0;do{if((n|0)==0){s=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){s=n;break}if((Cc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1){c[j>>2]=0;s=0;break}else{s=c[j>>2]|0;break}}}while(0);j=(s|0)==0;b:do{if((o|0)==0){m=32}else{do{if((c[o+12>>2]|0)==(c[o+16>>2]|0)){if(!((Cc[c[(c[o>>2]|0)+36>>2]&63](o)|0)==-1)){break}c[e>>2]=0;m=32;break b}}while(0);if(!j){break}i=a;return}}while(0);do{if((m|0)==32){if(j){break}i=a;return}}while(0);c[g>>2]=c[g>>2]|2;i=a;return}function Yh(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;a=i;h=b;b=c[h>>2]|0;do{if((b|0)==0){j=0}else{if((c[b+12>>2]|0)!=(c[b+16>>2]|0)){j=b;break}if((Cc[c[(c[b>>2]|0)+36>>2]&63](b)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);b=(j|0)==0;j=e;e=c[j>>2]|0;a:do{if((e|0)==0){k=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if(!((Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1)){break}c[j>>2]=0;k=11;break a}}while(0);if(b){l=e}else{k=12}}}while(0);if((k|0)==11){if(b){k=12}else{l=0}}if((k|0)==12){c[f>>2]=c[f>>2]|6;i=a;return}b=c[h>>2]|0;e=c[b+12>>2]|0;if((e|0)==(c[b+16>>2]|0)){m=Cc[c[(c[b>>2]|0)+36>>2]&63](b)|0}else{m=d[e]|0}if(!((wc[c[(c[g>>2]|0)+36>>2]&31](g,m&255,0)|0)<<24>>24==37)){c[f>>2]=c[f>>2]|4;i=a;return}m=c[h>>2]|0;g=m+12|0;e=c[g>>2]|0;if((e|0)==(c[m+16>>2]|0)){Cc[c[(c[m>>2]|0)+40>>2]&63](m)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){n=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){n=e;break}if((Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1){c[h>>2]=0;n=0;break}else{n=c[h>>2]|0;break}}}while(0);h=(n|0)==0;b:do{if((l|0)==0){k=31}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if(!((Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1)){break}c[j>>2]=0;k=31;break b}}while(0);if(!h){break}i=a;return}}while(0);do{if((k|0)==31){if(h){break}i=a;return}}while(0);c[f>>2]=c[f>>2]|2;i=a;return}function Zh(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;j=i;k=a;a=c[k>>2]|0;do{if((a|0)==0){l=0}else{if((c[a+12>>2]|0)!=(c[a+16>>2]|0)){l=a;break}if((Cc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);a=(l|0)==0;l=e;e=c[l>>2]|0;a:do{if((e|0)==0){m=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if(!((Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1)){break}c[l>>2]=0;m=11;break a}}while(0);if(a){n=e}else{m=12}}}while(0);if((m|0)==11){if(a){m=12}else{n=0}}if((m|0)==12){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}a=c[k>>2]|0;e=c[a+12>>2]|0;if((e|0)==(c[a+16>>2]|0)){p=Cc[c[(c[a>>2]|0)+36>>2]&63](a)|0}else{p=d[e]|0}e=p&255;do{if(e<<24>>24>-1){a=g+8|0;if((b[(c[a>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}q=g;r=(wc[c[(c[q>>2]|0)+36>>2]&31](g,e,0)|0)<<24>>24;s=c[k>>2]|0;t=s+12|0;u=c[t>>2]|0;if((u|0)==(c[s+16>>2]|0)){Cc[c[(c[s>>2]|0)+40>>2]&63](s)|0;v=h;w=n;x=n;y=r}else{c[t>>2]=u+1;v=h;w=n;x=n;y=r}while(1){z=y+ -48|0;r=v+ -1|0;u=c[k>>2]|0;do{if((u|0)==0){A=0}else{if((c[u+12>>2]|0)!=(c[u+16>>2]|0)){A=u;break}if((Cc[c[(c[u>>2]|0)+36>>2]&63](u)|0)==-1){c[k>>2]=0;A=0;break}else{A=c[k>>2]|0;break}}}while(0);u=(A|0)==0;do{if((x|0)==0){B=w;C=0}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){B=w;C=x;break}if(!((Cc[c[(c[x>>2]|0)+36>>2]&63](x)|0)==-1)){B=w;C=w;break}c[l>>2]=0;B=0;C=0}}while(0);D=c[k>>2]|0;if(!((u^(C|0)==0)&(r|0)>0)){m=40;break}t=c[D+12>>2]|0;if((t|0)==(c[D+16>>2]|0)){E=Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{E=d[t]|0}t=E&255;if(!(t<<24>>24>-1)){o=z;m=52;break}if((b[(c[a>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=z;m=52;break}s=((wc[c[(c[q>>2]|0)+36>>2]&31](g,t,0)|0)<<24>>24)+(z*10|0)|0;t=c[k>>2]|0;F=t+12|0;G=c[F>>2]|0;if((G|0)==(c[t+16>>2]|0)){Cc[c[(c[t>>2]|0)+40>>2]&63](t)|0;H=r;w=B;x=C;y=s;v=H;continue}else{c[F>>2]=G+1;H=r;w=B;x=C;y=s;v=H;continue}}if((m|0)==40){do{if((D|0)==0){I=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){I=D;break}if((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[k>>2]=0;I=0;break}else{I=c[k>>2]|0;break}}}while(0);q=(I|0)==0;b:do{if((B|0)==0){m=50}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if(!((Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){break}c[l>>2]=0;m=50;break b}}while(0);if(q){o=z}else{break}i=j;return o|0}}while(0);do{if((m|0)==50){if(q){break}else{o=z}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=z;i=j;return o|0}else if((m|0)==52){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function _h(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;l=i;i=i+64|0;m=l;n=l+8|0;o=l+16|0;p=l+32|0;q=l+40|0;r=l+48|0;s=l+56|0;We(p,f);t=p;p=c[t>>2]|0;if(!((c[1288]|0)==-1)){c[o>>2]=5152;c[o+4>>2]=112;c[o+8>>2]=0;we(5152,o,113)}o=(c[5156>>2]|0)+ -1|0;u=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-u>>2>>>0>o>>>0)){v=Bb(4)|0;w=v;um(w);oc(v|0,13120,101)}p=c[u+(o<<2)>>2]|0;if((p|0)==0){v=Bb(4)|0;w=v;um(w);oc(v|0,13120,101)}v=p;ce(c[t>>2]|0)|0;c[g>>2]=0;t=d;a:do{if((j|0)==(k|0)){x=69}else{w=e;o=p;u=p;y=p;z=b;A=r;B=s;C=q;D=j;E=0;b:while(1){F=E;while(1){if((F|0)!=0){x=69;break a}G=c[t>>2]|0;do{if((G|0)==0){H=0;I=1}else{J=c[G+12>>2]|0;if((J|0)==(c[G+16>>2]|0)){K=Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0}else{K=c[J>>2]|0}if(!((K|0)==-1)){H=G;I=0;break}c[t>>2]=0;H=0;I=1}}while(0);G=c[w>>2]|0;do{if((G|0)==0){x=22}else{J=c[G+12>>2]|0;if((J|0)==(c[G+16>>2]|0)){L=Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0}else{L=c[J>>2]|0}if((L|0)==-1){c[w>>2]=0;x=22;break}else{if(I){M=G;break}else{x=24;break b}}}}while(0);if((x|0)==22){x=0;if(I){x=24;break b}else{M=0}}if((wc[c[(c[o>>2]|0)+52>>2]&31](v,c[D>>2]|0,0)|0)<<24>>24==37){x=26;break}if(wc[c[(c[u>>2]|0)+12>>2]&31](v,8192,c[D>>2]|0)|0){N=D;x=36;break}O=H+12|0;G=c[O>>2]|0;P=H+16|0;if((G|0)==(c[P>>2]|0)){Q=Cc[c[(c[H>>2]|0)+36>>2]&63](H)|0}else{Q=c[G>>2]|0}G=Lc[c[(c[y>>2]|0)+28>>2]&15](v,Q)|0;if((G|0)==(Lc[c[(c[y>>2]|0)+28>>2]&15](v,c[D>>2]|0)|0)){x=64;break}c[g>>2]=4;F=4}c:do{if((x|0)==26){x=0;F=D+4|0;if((F|0)==(k|0)){x=27;break b}G=wc[c[(c[o>>2]|0)+52>>2]&31](v,c[F>>2]|0,0)|0;if(G<<24>>24==48|G<<24>>24==69){J=D+8|0;if((J|0)==(k|0)){x=30;break b}R=J;S=wc[c[(c[o>>2]|0)+52>>2]&31](v,c[J>>2]|0,0)|0;T=G}else{R=F;S=G;T=0}G=c[(c[z>>2]|0)+36>>2]|0;c[A>>2]=H;c[B>>2]=M;F=n;J=r;c[F+0>>2]=c[J+0>>2];J=m;F=s;c[J+0>>2]=c[F+0>>2];Bc[G&3](q,b,n,m,f,g,h,S,T);c[t>>2]=c[C>>2];U=R+4|0}else if((x|0)==36){while(1){x=0;G=N+4|0;if((G|0)==(k|0)){V=k;break}if(wc[c[(c[u>>2]|0)+12>>2]&31](v,8192,c[G>>2]|0)|0){N=G;x=36}else{V=G;break}}G=H;F=M;J=M;while(1){do{if((G|0)==0){W=0;X=1}else{Y=c[G+12>>2]|0;if((Y|0)==(c[G+16>>2]|0)){Z=Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0}else{Z=c[Y>>2]|0}if(!((Z|0)==-1)){W=G;X=0;break}c[t>>2]=0;W=0;X=1}}while(0);do{if((J|0)==0){_=F;x=51}else{Y=c[J+12>>2]|0;if((Y|0)==(c[J+16>>2]|0)){$=Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0}else{$=c[Y>>2]|0}if(($|0)==-1){c[w>>2]=0;_=0;x=51;break}else{if(X^(F|0)==0){aa=F;ba=F;break}else{U=V;break c}}}}while(0);if((x|0)==51){x=0;if(X){U=V;break c}else{aa=_;ba=0}}Y=W+12|0;ca=c[Y>>2]|0;da=W+16|0;if((ca|0)==(c[da>>2]|0)){ea=Cc[c[(c[W>>2]|0)+36>>2]&63](W)|0}else{ea=c[ca>>2]|0}if(!(wc[c[(c[u>>2]|0)+12>>2]&31](v,8192,ea)|0)){U=V;break c}ca=c[Y>>2]|0;if((ca|0)==(c[da>>2]|0)){Cc[c[(c[W>>2]|0)+40>>2]&63](W)|0;G=W;F=aa;J=ba;continue}else{c[Y>>2]=ca+4;G=W;F=aa;J=ba;continue}}}else if((x|0)==64){x=0;J=c[O>>2]|0;if((J|0)==(c[P>>2]|0)){Cc[c[(c[H>>2]|0)+40>>2]&63](H)|0}else{c[O>>2]=J+4}U=D+4|0}}while(0);if((U|0)==(k|0)){x=69;break a}D=U;E=c[g>>2]|0}if((x|0)==24){c[g>>2]=4;fa=H;break}else if((x|0)==27){c[g>>2]=4;fa=H;break}else if((x|0)==30){c[g>>2]=4;fa=H;break}}}while(0);if((x|0)==69){fa=c[t>>2]|0}t=d;do{if((fa|0)==0){ga=0;ha=1}else{d=c[fa+12>>2]|0;if((d|0)==(c[fa+16>>2]|0)){ia=Cc[c[(c[fa>>2]|0)+36>>2]&63](fa)|0}else{ia=c[d>>2]|0}if(!((ia|0)==-1)){ga=fa;ha=0;break}c[t>>2]=0;ga=0;ha=1}}while(0);t=e;e=c[t>>2]|0;do{if((e|0)==0){x=82}else{fa=c[e+12>>2]|0;if((fa|0)==(c[e+16>>2]|0)){ja=Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{ja=c[fa>>2]|0}if((ja|0)==-1){c[t>>2]=0;x=82;break}if(!ha){break}ka=a;c[ka>>2]=ga;i=l;return}}while(0);do{if((x|0)==82){if(ha){break}ka=a;c[ka>>2]=ga;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ka=a;c[ka>>2]=ga;i=l;return}function $h(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function ai(a){a=a|0;i=i;return}function bi(a){a=a|0;i=i;return 2}function ci(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=j;l=j+8|0;m=j+16|0;n=j+24|0;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];e=l;d=m;c[e+0>>2]=c[d+0>>2];d=k;e=n;c[d+0>>2]=c[e+0>>2];_h(a,b,l,k,f,g,h,4216,4248|0);i=j;return}function di(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;k=i;i=i+32|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=d+8|0;q=Cc[c[(c[p>>2]|0)+20>>2]&63](p)|0;c[n>>2]=c[e>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=q+4|0;s=q+4|0;t=(f&255)>>>1}else{f=c[q+8>>2]|0;r=f;s=f;t=c[q+4>>2]|0}q=r+(t<<2)|0;t=m;r=n;c[t+0>>2]=c[r+0>>2];r=l;t=o;c[r+0>>2]=c[t+0>>2];_h(b,d,m,l,g,h,j,s,q);i=k;return}function ei(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;We(n,f);f=n;n=c[f>>2]|0;if(!((c[1288]|0)==-1)){c[m>>2]=5152;c[m+4>>2]=112;c[m+8>>2]=0;we(5152,m,113)}m=(c[5156>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}p=n;ce(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=Cc[c[c[e>>2]>>2]&63](e)|0;c[l>>2]=f;f=b+168|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=Ng(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=168){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+24>>2]=((g|0)/12|0|0)%7|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function fi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;We(n,f);f=n;n=c[f>>2]|0;if(!((c[1288]|0)==-1)){c[m>>2]=5152;c[m+4>>2]=112;c[m+8>>2]=0;we(5152,m,113)}m=(c[5156>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}p=n;ce(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=Cc[c[(c[e>>2]|0)+4>>2]&63](e)|0;c[l>>2]=f;f=b+288|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=Ng(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=288){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+16>>2]=((g|0)/12|0|0)%12|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function gi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=i;i=i+40|0;j=b;k=b+8|0;l=b+16|0;m=b+32|0;We(m,f);f=m;m=c[f>>2]|0;if(!((c[1288]|0)==-1)){c[l>>2]=5152;c[l+4>>2]=112;c[l+8>>2]=0;we(5152,l,113)}l=(c[5156>>2]|0)+ -1|0;n=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-n>>2>>>0>l>>>0)){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}m=c[n+(l<<2)>>2]|0;if((m|0)==0){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}o=m;ce(c[f>>2]|0)|0;f=h+20|0;c[k>>2]=c[e>>2];e=j;h=k;c[e+0>>2]=c[h+0>>2];h=ki(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}if((h|0)<69){t=h+2e3|0}else{t=(h+ -69|0)>>>0<31?h+1900|0:h}c[f>>2]=t+ -1900;q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}function hi(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0;l=i;i=i+576|0;m=l;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+104|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;M=l+208|0;N=l+216|0;O=l+224|0;P=l+232|0;Q=l+240|0;R=l+248|0;S=l+256|0;T=l+264|0;U=l+272|0;V=l+280|0;W=l+288|0;X=l+296|0;Y=l+304|0;Z=l+312|0;_=l+320|0;$=l+328|0;aa=l+336|0;ba=l+344|0;ca=l+352|0;da=l+368|0;ea=l+376|0;fa=l+384|0;ga=l+392|0;ha=l+400|0;ia=l+408|0;ja=l+416|0;ka=l+424|0;la=l+432|0;ma=l+440|0;na=l+448|0;oa=l+456|0;pa=l+464|0;qa=l+472|0;ra=l+480|0;sa=l+488|0;ta=l+496|0;ua=l+504|0;va=l+512|0;wa=l+520|0;xa=l+528|0;ya=l+536|0;za=l+544|0;Aa=l+552|0;Ba=l+560|0;Ca=l+568|0;c[h>>2]=0;We(da,g);Da=da;da=c[Da>>2]|0;if(!((c[1288]|0)==-1)){c[ca>>2]=5152;c[ca+4>>2]=112;c[ca+8>>2]=0;we(5152,ca,113)}ca=(c[5156>>2]|0)+ -1|0;Ea=c[da+8>>2]|0;if(!((c[da+12>>2]|0)-Ea>>2>>>0>ca>>>0)){Fa=Bb(4)|0;Ga=Fa;um(Ga);oc(Fa|0,13120,101)}da=c[Ea+(ca<<2)>>2]|0;if((da|0)==0){Fa=Bb(4)|0;Ga=Fa;um(Ga);oc(Fa|0,13120,101)}Fa=da;ce(c[Da>>2]|0)|0;a:do{switch(k<<24>>24|0){case 37:{c[Ca>>2]=c[f>>2];c[m+0>>2]=c[Ca+0>>2];ji(0,e,m,h,Fa);break};case 77:{c[W>>2]=c[f>>2];c[D+0>>2]=c[W+0>>2];Da=ki(e,D,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(Da|0)<60){c[j+4>>2]=Da;break a}else{c[h>>2]=da|4;break a}break};case 89:{c[R>>2]=c[f>>2];c[n+0>>2]=c[R+0>>2];da=ki(e,n,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}c[j+20>>2]=da+ -1900;break};case 99:{da=d+8|0;Da=Cc[c[(c[da>>2]|0)+12>>2]&63](da)|0;da=e;c[fa>>2]=c[da>>2];c[ga>>2]=c[f>>2];Ga=a[Da]|0;if((Ga&1)==0){Ha=Da+4|0;Ia=Da+4|0;Ja=(Ga&255)>>>1}else{Ga=c[Da+8>>2]|0;Ha=Ga;Ia=Ga;Ja=c[Da+4>>2]|0}c[O+0>>2]=c[fa+0>>2];c[N+0>>2]=c[ga+0>>2];_h(ea,d,O,N,g,h,j,Ia,Ha+(Ja<<2)|0);c[da>>2]=c[ea>>2];break};case 84:{da=e;c[va>>2]=c[da>>2];c[wa>>2]=c[f>>2];c[v+0>>2]=c[va+0>>2];c[u+0>>2]=c[wa+0>>2];_h(ua,d,v,u,g,h,j,4384,4416|0);c[da>>2]=c[ua>>2];break};case 88:{da=d+8|0;Da=Cc[c[(c[da>>2]|0)+24>>2]&63](da)|0;da=e;c[Aa>>2]=c[da>>2];c[Ba>>2]=c[f>>2];Ga=a[Da]|0;if((Ga&1)==0){Ka=Da+4|0;La=Da+4|0;Ma=(Ga&255)>>>1}else{Ga=c[Da+8>>2]|0;Ka=Ga;La=Ga;Ma=c[Da+4>>2]|0}c[q+0>>2]=c[Aa+0>>2];c[p+0>>2]=c[Ba+0>>2];_h(za,d,q,p,g,h,j,La,Ka+(Ma<<2)|0);c[da>>2]=c[za>>2];break};case 119:{c[T>>2]=c[f>>2];c[t+0>>2]=c[T+0>>2];da=ki(e,t,h,Fa,1)|0;Da=c[h>>2]|0;if((Da&4|0)==0&(da|0)<7){c[j+24>>2]=da;break a}else{c[h>>2]=Da|4;break a}break};case 120:{Da=c[(c[d>>2]|0)+20>>2]|0;c[xa>>2]=c[e>>2];c[ya>>2]=c[f>>2];c[s+0>>2]=c[xa+0>>2];c[r+0>>2]=c[ya+0>>2];xc[Da&63](b,d,s,r,g,h,j);i=l;return};case 116:case 110:{c[na>>2]=c[f>>2];c[C+0>>2]=c[na+0>>2];ii(0,e,C,h,Fa);break};case 112:{Da=j+8|0;da=c[f>>2]|0;Ga=d+8|0;ca=Cc[c[(c[Ga>>2]|0)+8>>2]&63](Ga)|0;Ga=a[ca]|0;if((Ga&1)==0){Na=(Ga&255)>>>1}else{Na=c[ca+4>>2]|0}Ga=a[ca+12|0]|0;if((Ga&1)==0){Oa=(Ga&255)>>>1}else{Oa=c[ca+16>>2]|0}if((Na|0)==(0-Oa|0)){c[h>>2]=c[h>>2]|4;break a}c[V>>2]=da;c[B+0>>2]=c[V+0>>2];da=Ng(e,B,ca,ca+24|0,Fa,h,0)|0;Ga=da-ca|0;do{if((da|0)==(ca|0)){if((c[Da>>2]|0)!=12){break}c[Da>>2]=0;break a}}while(0);if((Ga|0)!=12){break a}ca=c[Da>>2]|0;if((ca|0)>=12){break a}c[Da>>2]=ca+12;break};case 101:case 100:{ca=j+12|0;c[$>>2]=c[f>>2];c[M+0>>2]=c[$+0>>2];da=ki(e,M,h,Fa,2)|0;Ea=c[h>>2]|0;do{if((Ea&4|0)==0){if(!((da+ -1|0)>>>0<31)){break}c[ca>>2]=da;break a}}while(0);c[h>>2]=Ea|4;break};case 68:{da=e;c[ia>>2]=c[da>>2];c[ja>>2]=c[f>>2];c[L+0>>2]=c[ia+0>>2];c[K+0>>2]=c[ja+0>>2];_h(ha,d,L,K,g,h,j,4248,4280|0);c[da>>2]=c[ha>>2];break};case 70:{da=e;c[la>>2]=c[da>>2];c[ma>>2]=c[f>>2];c[J+0>>2]=c[la+0>>2];c[I+0>>2]=c[ma+0>>2];_h(ka,d,J,I,g,h,j,4280,4312|0);c[da>>2]=c[ka>>2];break};case 72:{c[_>>2]=c[f>>2];c[H+0>>2]=c[_+0>>2];da=ki(e,H,h,Fa,2)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(da|0)<24){c[j+8>>2]=da;break a}else{c[h>>2]=ca|4;break a}break};case 73:{ca=j+8|0;c[Z>>2]=c[f>>2];c[G+0>>2]=c[Z+0>>2];da=ki(e,G,h,Fa,2)|0;Da=c[h>>2]|0;do{if((Da&4|0)==0){if(!((da+ -1|0)>>>0<12)){break}c[ca>>2]=da;break a}}while(0);c[h>>2]=Da|4;break};case 106:{c[Y>>2]=c[f>>2];c[F+0>>2]=c[Y+0>>2];da=ki(e,F,h,Fa,3)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(da|0)<366){c[j+28>>2]=da;break a}else{c[h>>2]=ca|4;break a}break};case 109:{c[X>>2]=c[f>>2];c[E+0>>2]=c[X+0>>2];ca=ki(e,E,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(ca|0)<13){c[j+16>>2]=ca+ -1;break a}else{c[h>>2]=da|4;break a}break};case 65:case 97:{da=c[f>>2]|0;ca=d+8|0;Ea=Cc[c[c[ca>>2]>>2]&63](ca)|0;c[ba>>2]=da;c[Q+0>>2]=c[ba+0>>2];da=(Ng(e,Q,Ea,Ea+168|0,Fa,h,0)|0)-Ea|0;if((da|0)>=168){break a}c[j+24>>2]=((da|0)/12|0|0)%7|0;break};case 104:case 66:case 98:{da=c[f>>2]|0;Ea=d+8|0;ca=Cc[c[(c[Ea>>2]|0)+4>>2]&63](Ea)|0;c[aa>>2]=da;c[P+0>>2]=c[aa+0>>2];da=(Ng(e,P,ca,ca+288|0,Fa,h,0)|0)-ca|0;if((da|0)>=288){break a}c[j+16>>2]=((da|0)/12|0|0)%12|0;break};case 114:{da=e;c[pa>>2]=c[da>>2];c[qa>>2]=c[f>>2];c[A+0>>2]=c[pa+0>>2];c[z+0>>2]=c[qa+0>>2];_h(oa,d,A,z,g,h,j,4312,4356|0);c[da>>2]=c[oa>>2];break};case 82:{da=e;c[sa>>2]=c[da>>2];c[ta>>2]=c[f>>2];c[y+0>>2]=c[sa+0>>2];c[x+0>>2]=c[ta+0>>2];_h(ra,d,y,x,g,h,j,4360,4380|0);c[da>>2]=c[ra>>2];break};case 83:{c[U>>2]=c[f>>2];c[w+0>>2]=c[U+0>>2];da=ki(e,w,h,Fa,2)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(da|0)<61){c[j>>2]=da;break a}else{c[h>>2]=ca|4;break a}break};case 121:{c[S>>2]=c[f>>2];c[o+0>>2]=c[S+0>>2];ca=ki(e,o,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}if((ca|0)<69){Pa=ca+2e3|0}else{Pa=(ca+ -69|0)>>>0<31?ca+1900|0:ca}c[j+20>>2]=Pa+ -1900;break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}function ii(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;a=i;g=b;b=d;d=f;a:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=Cc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=15}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=Cc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=15;break}else{if(j){o=h;break}else{p=h;break a}}}}while(0);if((m|0)==15){m=0;if(j){p=0;break}else{o=0}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){q=Cc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{q=c[k>>2]|0}if(!(wc[c[(c[d>>2]|0)+12>>2]&31](f,8192,q)|0)){p=o;break}k=c[g>>2]|0;h=k+12|0;r=c[h>>2]|0;if((r|0)==(c[k+16>>2]|0)){Cc[c[(c[k>>2]|0)+40>>2]&63](k)|0;continue}else{c[h>>2]=r+4;continue}}o=c[g>>2]|0;do{if((o|0)==0){s=1}else{q=c[o+12>>2]|0;if((q|0)==(c[o+16>>2]|0)){t=Cc[c[(c[o>>2]|0)+36>>2]&63](o)|0}else{t=c[q>>2]|0}if((t|0)==-1){c[g>>2]=0;s=1;break}else{s=(c[g>>2]|0)==0;break}}}while(0);do{if((p|0)==0){m=37}else{g=c[p+12>>2]|0;if((g|0)==(c[p+16>>2]|0)){u=Cc[c[(c[p>>2]|0)+36>>2]&63](p)|0}else{u=c[g>>2]|0}if((u|0)==-1){c[b>>2]=0;m=37;break}if(!s){break}i=a;return}}while(0);do{if((m|0)==37){if(s){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function ji(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;g=b;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=Cc[c[(c[b>>2]|0)+36>>2]&63](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d;d=c[k>>2]|0;do{if((d|0)==0){l=14}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=Cc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=14;break}else{if(h){n=d;break}else{l=16;break}}}}while(0);if((l|0)==14){if(h){l=16}else{n=0}}if((l|0)==16){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){o=Cc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{o=c[d>>2]|0}if(!((wc[c[(c[f>>2]|0)+52>>2]&31](f,o,0)|0)<<24>>24==37)){c[e>>2]=c[e>>2]|4;i=a;return}o=c[g>>2]|0;f=o+12|0;d=c[f>>2]|0;if((d|0)==(c[o+16>>2]|0)){Cc[c[(c[o>>2]|0)+40>>2]&63](o)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){p=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){q=Cc[c[(c[d>>2]|0)+36>>2]&63](d)|0}else{q=c[f>>2]|0}if((q|0)==-1){c[g>>2]=0;p=1;break}else{p=(c[g>>2]|0)==0;break}}}while(0);do{if((n|0)==0){l=38}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){r=Cc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{r=c[g>>2]|0}if((r|0)==-1){c[k>>2]=0;l=38;break}if(!p){break}i=a;return}}while(0);do{if((l|0)==38){if(p){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function ki(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;g=i;h=a;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=Cc[c[(c[a>>2]|0)+36>>2]&63](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b;b=c[l>>2]|0;do{if((b|0)==0){m=14}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=Cc[c[(c[b>>2]|0)+36>>2]&63](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=14;break}else{if(j){o=b;break}else{m=16;break}}}}while(0);if((m|0)==14){if(j){m=16}else{o=0}}if((m|0)==16){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=Cc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{q=c[b>>2]|0}b=e;if(!(wc[c[(c[b>>2]|0)+12>>2]&31](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(wc[c[(c[j>>2]|0)+52>>2]&31](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){Cc[c[(c[q>>2]|0)+40>>2]&63](q)|0;r=f;s=o;t=o;u=n}else{c[a>>2]=k+4;r=f;s=o;t=o;u=n}while(1){v=u+ -48|0;n=r+ -1|0;o=c[h>>2]|0;do{if((o|0)==0){w=1}else{f=c[o+12>>2]|0;if((f|0)==(c[o+16>>2]|0)){x=Cc[c[(c[o>>2]|0)+36>>2]&63](o)|0}else{x=c[f>>2]|0}if((x|0)==-1){c[h>>2]=0;w=1;break}else{w=(c[h>>2]|0)==0;break}}}while(0);do{if((t|0)==0){y=s;z=0;A=1}else{o=c[t+12>>2]|0;if((o|0)==(c[t+16>>2]|0)){B=Cc[c[(c[t>>2]|0)+36>>2]&63](t)|0}else{B=c[o>>2]|0}if((B|0)==-1){c[l>>2]=0;y=0;z=0;A=1;break}else{y=s;z=s;A=(s|0)==0;break}}}while(0);C=c[h>>2]|0;if(!((w^A)&(n|0)>0)){break}o=c[C+12>>2]|0;if((o|0)==(c[C+16>>2]|0)){D=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{D=c[o>>2]|0}if(!(wc[c[(c[b>>2]|0)+12>>2]&31](e,2048,D)|0)){p=v;m=63;break}o=((wc[c[(c[j>>2]|0)+52>>2]&31](e,D,0)|0)<<24>>24)+(v*10|0)|0;f=c[h>>2]|0;k=f+12|0;a=c[k>>2]|0;if((a|0)==(c[f+16>>2]|0)){Cc[c[(c[f>>2]|0)+40>>2]&63](f)|0;E=n;s=y;t=z;u=o;r=E;continue}else{c[k>>2]=a+4;E=n;s=y;t=z;u=o;r=E;continue}}if((m|0)==63){i=g;return p|0}do{if((C|0)==0){F=1}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){G=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{G=c[E>>2]|0}if((G|0)==-1){c[h>>2]=0;F=1;break}else{F=(c[h>>2]|0)==0;break}}}while(0);do{if((y|0)==0){m=60}else{h=c[y+12>>2]|0;if((h|0)==(c[y+16>>2]|0)){H=Cc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{H=c[h>>2]|0}if((H|0)==-1){c[l>>2]=0;m=60;break}if(F){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==60){if(F){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function li(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=b+8|0;f=c[e>>2]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}g=ib(2147483647,5064,0)|0;c[1262]=g;eb(5056)}}while(0);if((f|0)==(c[1262]|0)){h=b;Wm(h);i=d;return}lb(c[e>>2]|0);h=b;Wm(h);i=d;return}function mi(b){b=b|0;var d=0,e=0,f=0;d=i;e=b+8|0;b=c[e>>2]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}f=ib(2147483647,5064,0)|0;c[1262]=f;eb(5056)}}while(0);if((b|0)==(c[1262]|0)){i=d;return}lb(c[e>>2]|0);i=d;return}function ni(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+112|0;f=g;l=g+8|0;m=l;n=f;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(!(k<<24>>24==0)){a[o]=k;a[p]=j}j=_b(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b;c[r>>2]=q;i=g;return}else{s=m;t=l;u=l}while(1){l=a[s]|0;do{if((u|0)==0){v=t;w=0}else{m=u+24|0;j=c[m>>2]|0;if((j|0)==(c[u+28>>2]|0)){e=(Lc[c[(c[u>>2]|0)+52>>2]&15](u,l&255)|0)==-1;v=e?0:t;w=e?0:u;break}else{c[m>>2]=j+1;a[j]=l;v=t;w=u;break}}}while(0);l=s+1|0;if((l|0)==(d|0)){q=v;break}else{s=l;t=v;u=w}}r=b;c[r>>2]=q;i=g;return}function oi(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=b+8|0;f=c[e>>2]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}g=ib(2147483647,5064,0)|0;c[1262]=g;eb(5056)}}while(0);if((f|0)==(c[1262]|0)){h=b;Wm(h);i=d;return}lb(c[e>>2]|0);h=b;Wm(h);i=d;return}function pi(b){b=b|0;var d=0,e=0,f=0;d=i;e=b+8|0;b=c[e>>2]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}f=ib(2147483647,5064,0)|0;c[1262]=f;eb(5056)}}while(0);if((b|0)==(c[1262]|0)){i=d;return}lb(c[e>>2]|0);i=d;return}function qi(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+408|0;e=f;k=f+400|0;l=e;c[k>>2]=e+400;ri(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a;c[n>>2]=m;i=f;return}else{o=l;p=k;q=k}while(1){k=c[o>>2]|0;if((p|0)==0){r=q;s=0}else{l=p+24|0;d=c[l>>2]|0;if((d|0)==(c[p+28>>2]|0)){t=Lc[c[(c[p>>2]|0)+52>>2]&15](p,k)|0}else{c[l>>2]=d+4;c[d>>2]=k;t=k}k=(t|0)==-1;r=k?0:q;s=k?0:p}k=o+4|0;if((k|0)==(j|0)){m=r;break}else{o=k;p=s;q=r}}n=a;c[n>>2]=m;i=f;return}function ri(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j;l=j+112|0;m=i;i=i+8|0;n=j+8|0;o=k;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(!(h<<24>>24==0)){a[p]=h;a[q]=g}g=b;_b(n|0,100,o|0,f|0,c[g>>2]|0)|0;f=l;c[f>>2]=0;c[f+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=Fb(c[g>>2]|0)|0;g=km(d,m,n,l)|0;if((f|0)!=0){Fb(f|0)|0}if((g|0)==-1){nj(6040)}else{c[e>>2]=d+(g<<2);i=j;return}}function si(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function ti(a){a=a|0;i=i;return}function ui(a){a=a|0;i=i;return 127}function vi(a){a=a|0;i=i;return 127}function wi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function xi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function yi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function zi(a,b){a=a|0;b=b|0;b=i;Ae(a,1,45);i=b;return}function Ai(a){a=a|0;i=i;return 0}function Bi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Ci(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Di(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Ei(a){a=a|0;i=i;return}function Fi(a){a=a|0;i=i;return 127}function Gi(a){a=a|0;i=i;return 127}function Hi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Ii(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Ji(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Ki(a,b){a=a|0;b=b|0;b=i;Ae(a,1,45);i=b;return}function Li(a){a=a|0;i=i;return 0}function Mi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Ni(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Oi(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Pi(a){a=a|0;i=i;return}function Qi(a){a=a|0;i=i;return 2147483647}function Ri(a){a=a|0;i=i;return 2147483647}function Si(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Ti(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Ui(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Vi(a,b){a=a|0;b=b|0;b=i;Me(a,1,45);i=b;return}function Wi(a){a=a|0;i=i;return 0}function Xi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Yi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Zi(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function _i(a){a=a|0;i=i;return}function $i(a){a=a|0;i=i;return 2147483647}function aj(a){a=a|0;i=i;return 2147483647}function bj(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function cj(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function dj(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function ej(a,b){a=a|0;b=b|0;b=i;Me(a,1,45);i=b;return}function fj(a){a=a|0;i=i;return 0}function gj(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function hj(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function ij(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function jj(a){a=a|0;i=i;return}function kj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+104|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=i;i=i+8|0;u=i;i=i+16|0;v=i;i=i+104|0;w=p;c[w>>2]=o;x=p+4|0;c[x>>2]=114;y=o+100|0;We(r,h);o=r;z=c[o>>2]|0;if(!((c[1290]|0)==-1)){c[n>>2]=5160;c[n+4>>2]=112;c[n+8>>2]=0;we(5160,n,113)}n=(c[5164>>2]|0)+ -1|0;A=c[z+8>>2]|0;if(!((c[z+12>>2]|0)-A>>2>>>0>n>>>0)){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}z=c[A+(n<<2)>>2]|0;if((z|0)==0){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}B=z;a[s]=0;C=f;c[t>>2]=c[C>>2];f=c[h+4>>2]|0;h=l;n=t;c[h+0>>2]=c[n+0>>2];n=mj(e,l,g,r,f,j,s,B,p,q,y)|0;do{if(n){y=u;Ic[c[(c[z>>2]|0)+32>>2]&7](B,4776,4786|0,y)|0;p=v;f=c[q>>2]|0;r=c[w>>2]|0;g=f-r|0;do{if((g|0)>98){l=Pm(g+2|0)|0;if((l|0)!=0){D=l;E=l;break}$m()}else{D=0;E=p}}while(0);if((a[s]|0)==0){F=E}else{a[E]=45;F=E+1|0}if(r>>>0<f>>>0){g=u+10|0;l=u;h=F;t=r;while(1){A=a[t]|0;G=y;while(1){H=G+1|0;if((a[G]|0)==A<<24>>24){I=G;break}if((H|0)==(g|0)){I=g;break}else{G=H}}a[h]=a[4776+(I-l)|0]|0;G=t+1|0;A=h+1|0;if(G>>>0<(c[q>>2]|0)>>>0){h=A;t=G}else{J=A;break}}}else{J=F}a[J]=0;c[m>>2]=k;if((Ga(p|0,4792,m|0)|0)!=1){t=Bb(8)|0;ie(t,4800);oc(t|0,2168,11)}if((D|0)==0){break}Qm(D)}}while(0);D=e;e=c[D>>2]|0;do{if((e|0)==0){K=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){K=e;break}if(!((Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1)){K=e;break}c[D>>2]=0;K=0}}while(0);D=(K|0)==0;e=c[C>>2]|0;do{if((e|0)==0){L=31}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){if(D){break}else{L=33;break}}if((Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1){c[C>>2]=0;L=31;break}else{if(D){break}else{L=33;break}}}}while(0);if((L|0)==31){if(D){L=33}}if((L|0)==33){c[j>>2]=c[j>>2]|2}c[b>>2]=K;ce(c[o>>2]|0)|0;o=c[w>>2]|0;c[w>>2]=0;if((o|0)==0){i=d;return}zc[c[x>>2]&127](o);i=d;return}function lj(a){a=a|0;i=i;return}function mj(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0;q=i;i=i+408|0;r=q;s=q+400|0;t=s;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+16|0;B=i;i=i+8|0;C=i;i=i+8|0;D=r;c[s>>2]=0;E=w;c[E+0>>2]=0;c[E+4>>2]=0;c[E+8>>2]=0;F=x;c[F+0>>2]=0;c[F+4>>2]=0;c[F+8>>2]=0;G=y;c[G+0>>2]=0;c[G+4>>2]=0;c[G+8>>2]=0;H=z;c[H+0>>2]=0;c[H+4>>2]=0;c[H+8>>2]=0;I=A;c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;qj(g,h,t,u,v,w,x,y,z,B);t=n;c[o>>2]=c[t>>2];h=e;e=f;f=s;s=m+8|0;m=z+1|0;g=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+8|0;P=x+4|0;Q=A;R=Q+1|0;S=A+8|0;T=A+4|0;U=f+3|0;V=n+4|0;n=w+4|0;W=r+400|0;r=D;X=D;D=p;p=0;Y=0;Z=114;a:while(1){_=c[h>>2]|0;do{if((_|0)==0){$=0}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){$=_;break}if((Cc[c[(c[_>>2]|0)+36>>2]&63](_)|0)==-1){c[h>>2]=0;$=0;break}else{$=c[h>>2]|0;break}}}while(0);_=($|0)==0;aa=c[e>>2]|0;do{if((aa|0)==0){ba=12}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){if(_){ca=aa;break}else{da=X;ea=r;fa=Y;ga=Z;ba=269;break a}}if((Cc[c[(c[aa>>2]|0)+36>>2]&63](aa)|0)==-1){c[e>>2]=0;ba=12;break}else{if(_){ca=aa;break}else{da=X;ea=r;fa=Y;ga=Z;ba=269;break a}}}}while(0);if((ba|0)==12){ba=0;if(_){da=X;ea=r;fa=Y;ga=Z;ba=269;break}else{ca=0}}b:do{switch(a[f+p|0]|0){case 1:{if((p|0)==3){da=X;ea=r;fa=Y;ga=Z;ba=269;break a}aa=c[h>>2]|0;ha=c[aa+12>>2]|0;if((ha|0)==(c[aa+16>>2]|0)){ia=Cc[c[(c[aa>>2]|0)+36>>2]&63](aa)|0}else{ia=d[ha]|0}if(!((ia&255)<<24>>24>-1)){ba=25;break a}if((b[(c[s>>2]|0)+(ia<<24>>24<<1)>>1]&8192)==0){ba=25;break a}ha=c[h>>2]|0;aa=ha+12|0;ja=c[aa>>2]|0;if((ja|0)==(c[ha+16>>2]|0)){ka=Cc[c[(c[ha>>2]|0)+40>>2]&63](ha)|0}else{c[aa>>2]=ja+1;ka=d[ja]|0}He(A,ka&255);ba=26;break};case 0:{ba=26;break};case 3:{ja=a[G]|0;aa=(ja&1)==0;if(aa){la=(ja&255)>>>1}else{la=c[L>>2]|0}ha=a[H]|0;ma=(ha&1)==0;if(ma){na=(ha&255)>>>1}else{na=c[g>>2]|0}if((la|0)==(0-na|0)){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}if(aa){ua=(ja&255)>>>1}else{ua=c[L>>2]|0}do{if((ua|0)!=0){if(ma){va=(ha&255)>>>1}else{va=c[g>>2]|0}if((va|0)==0){break}wa=c[h>>2]|0;xa=c[wa+12>>2]|0;ya=c[wa+16>>2]|0;if((xa|0)==(ya|0)){za=Cc[c[(c[wa>>2]|0)+36>>2]&63](wa)|0;Aa=c[h>>2]|0;Ba=za;Ca=c[Aa+16>>2]|0;Da=c[Aa+12>>2]|0;Ea=Aa;Fa=a[G]|0}else{Ba=d[xa]|0;Ca=ya;Da=xa;Ea=wa;Fa=ja}wa=Ea+12|0;xa=(Da|0)==(Ca|0);if((Ba&255)<<24>>24==(a[(Fa&1)==0?K:c[M>>2]|0]|0)){if(xa){Cc[c[(c[Ea>>2]|0)+40>>2]&63](Ea)|0}else{c[wa>>2]=Da+1}wa=a[G]|0;if((wa&1)==0){Ga=(wa&255)>>>1}else{Ga=c[L>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Ga>>>0>1?y:Y;ta=Z;break b}if(xa){Ha=Cc[c[(c[Ea>>2]|0)+36>>2]&63](Ea)|0}else{Ha=d[Da]|0}if(!((Ha&255)<<24>>24==(a[(a[H]&1)==0?m:c[J>>2]|0]|0))){ba=112;break a}xa=c[h>>2]|0;wa=xa+12|0;ya=c[wa>>2]|0;if((ya|0)==(c[xa+16>>2]|0)){Cc[c[(c[xa>>2]|0)+40>>2]&63](xa)|0}else{c[wa>>2]=ya+1}a[l]=1;ya=a[H]|0;if((ya&1)==0){Ia=(ya&255)>>>1}else{Ia=c[g>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Ia>>>0>1?z:Y;ta=Z;break b}}while(0);if(aa){Ja=(ja&255)>>>1}else{Ja=c[L>>2]|0}ma=c[h>>2]|0;ya=c[ma+12>>2]|0;wa=(ya|0)==(c[ma+16>>2]|0);if((Ja|0)==0){if(wa){xa=Cc[c[(c[ma>>2]|0)+36>>2]&63](ma)|0;Ka=xa;La=a[H]|0}else{Ka=d[ya]|0;La=ha}if(!((Ka&255)<<24>>24==(a[(La&1)==0?m:c[J>>2]|0]|0))){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}xa=c[h>>2]|0;Aa=xa+12|0;za=c[Aa>>2]|0;if((za|0)==(c[xa+16>>2]|0)){Cc[c[(c[xa>>2]|0)+40>>2]&63](xa)|0}else{c[Aa>>2]=za+1}a[l]=1;za=a[H]|0;if((za&1)==0){Ma=(za&255)>>>1}else{Ma=c[g>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Ma>>>0>1?z:Y;ta=Z;break b}if(wa){wa=Cc[c[(c[ma>>2]|0)+36>>2]&63](ma)|0;Na=wa;Oa=a[G]|0}else{Na=d[ya]|0;Oa=ja}if(!((Na&255)<<24>>24==(a[(Oa&1)==0?K:c[M>>2]|0]|0))){a[l]=1;oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}ya=c[h>>2]|0;wa=ya+12|0;ma=c[wa>>2]|0;if((ma|0)==(c[ya+16>>2]|0)){Cc[c[(c[ya>>2]|0)+40>>2]&63](ya)|0}else{c[wa>>2]=ma+1}ma=a[G]|0;if((ma&1)==0){Pa=(ma&255)>>>1}else{Pa=c[L>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Pa>>>0>1?y:Y;ta=Z;break};case 2:{if(!((Y|0)!=0|p>>>0<2)){if((p|0)==2){Qa=(a[U]|0)!=0}else{Qa=0}if(!(N|Qa)){oa=D;pa=X;qa=r;ra=W;sa=0;ta=Z;break b}}ma=a[F]|0;wa=(ma&1)==0;ya=wa?j:c[O>>2]|0;c:do{if((p|0)==0){Ra=ca;Sa=ca;Ta=ma;Ua=ya}else{if((d[f+(p+ -1)|0]|0)>=2){Ra=ca;Sa=ca;Ta=ma;Ua=ya;break}za=ya+(wa?(ma&255)>>>1:c[P>>2]|0)|0;Aa=ya;while(1){if((Aa|0)==(za|0)){Va=za;break}xa=a[Aa]|0;if(!(xa<<24>>24>-1)){Va=Aa;break}if((b[(c[s>>2]|0)+(xa<<24>>24<<1)>>1]&8192)==0){Va=Aa;break}else{Aa=Aa+1|0}}Aa=Va-ya|0;za=a[I]|0;xa=(za&1)==0;if(xa){Wa=(za&255)>>>1}else{Wa=c[T>>2]|0}if(Aa>>>0>Wa>>>0){Ra=ca;Sa=ca;Ta=ma;Ua=ya;break}if(xa){xa=(za&255)>>>1;Xa=Q+(xa-Aa)+1|0;Ya=R;Za=xa}else{xa=c[S>>2]|0;za=c[T>>2]|0;Xa=xa+(za-Aa)|0;Ya=xa;Za=za}za=Ya+Za|0;if((Xa|0)==(za|0)){Ra=ca;Sa=ca;Ta=ma;Ua=Va;break}else{_a=ya;$a=Xa}while(1){if((a[$a]|0)!=(a[_a]|0)){Ra=ca;Sa=ca;Ta=ma;Ua=ya;break c}xa=$a+1|0;if((xa|0)==(za|0)){Ra=ca;Sa=ca;Ta=ma;Ua=Va;break}else{_a=_a+1|0;$a=xa}}}}while(0);d:while(1){if((Ta&1)==0){ab=j;bb=(Ta&255)>>>1}else{ab=c[O>>2]|0;bb=c[P>>2]|0}if((Ua|0)==(ab+bb|0)){break}ma=c[h>>2]|0;do{if((ma|0)==0){cb=0}else{if((c[ma+12>>2]|0)!=(c[ma+16>>2]|0)){cb=ma;break}if((Cc[c[(c[ma>>2]|0)+36>>2]&63](ma)|0)==-1){c[h>>2]=0;cb=0;break}else{cb=c[h>>2]|0;break}}}while(0);ma=(cb|0)==0;do{if((Sa|0)==0){db=Ra;ba=147}else{if((c[Sa+12>>2]|0)!=(c[Sa+16>>2]|0)){if(ma){eb=Ra;fb=Sa;break}else{break d}}if((Cc[c[(c[Sa>>2]|0)+36>>2]&63](Sa)|0)==-1){c[e>>2]=0;db=0;ba=147;break}else{if(ma^(Ra|0)==0){eb=Ra;fb=Ra;break}else{break d}}}}while(0);if((ba|0)==147){ba=0;if(ma){break}else{eb=db;fb=0}}ya=c[h>>2]|0;wa=c[ya+12>>2]|0;if((wa|0)==(c[ya+16>>2]|0)){gb=Cc[c[(c[ya>>2]|0)+36>>2]&63](ya)|0}else{gb=d[wa]|0}if(!((gb&255)<<24>>24==(a[Ua]|0))){break}wa=c[h>>2]|0;ya=wa+12|0;ja=c[ya>>2]|0;if((ja|0)==(c[wa+16>>2]|0)){Cc[c[(c[wa>>2]|0)+40>>2]&63](wa)|0}else{c[ya>>2]=ja+1}Ra=eb;Sa=fb;Ta=a[F]|0;Ua=Ua+1|0}if(!N){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}ja=a[F]|0;if((ja&1)==0){hb=j;ib=(ja&255)>>>1}else{hb=c[O>>2]|0;ib=c[P>>2]|0}if((Ua|0)==(hb+ib|0)){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z}else{ba=162;break a}break};case 4:{ja=D;ya=X;wa=r;ha=W;aa=0;za=Z;e:while(1){xa=c[h>>2]|0;do{if((xa|0)==0){jb=0}else{if((c[xa+12>>2]|0)!=(c[xa+16>>2]|0)){jb=xa;break}if((Cc[c[(c[xa>>2]|0)+36>>2]&63](xa)|0)==-1){c[h>>2]=0;jb=0;break}else{jb=c[h>>2]|0;break}}}while(0);xa=(jb|0)==0;ma=c[e>>2]|0;do{if((ma|0)==0){ba=173}else{if((c[ma+12>>2]|0)!=(c[ma+16>>2]|0)){if(xa){break}else{break e}}if((Cc[c[(c[ma>>2]|0)+36>>2]&63](ma)|0)==-1){c[e>>2]=0;ba=173;break}else{if(xa){break}else{break e}}}}while(0);if((ba|0)==173){ba=0;if(xa){break}}ma=c[h>>2]|0;Aa=c[ma+12>>2]|0;if((Aa|0)==(c[ma+16>>2]|0)){kb=Cc[c[(c[ma>>2]|0)+36>>2]&63](ma)|0}else{kb=d[Aa]|0}Aa=kb&255;do{if(Aa<<24>>24>-1){if((b[(c[s>>2]|0)+(kb<<24>>24<<1)>>1]&2048)==0){ba=189;break}ma=c[o>>2]|0;if((ma|0)==(ja|0)){lb=(c[V>>2]|0)!=114;mb=c[t>>2]|0;nb=ja-mb|0;ob=nb>>>0<2147483647?nb<<1:-1;pb=Rm(lb?mb:0,ob)|0;if((pb|0)==0){ba=182;break a}do{if(lb){c[t>>2]=pb;qb=pb}else{mb=c[t>>2]|0;c[t>>2]=pb;if((mb|0)==0){qb=pb;break}zc[c[V>>2]&127](mb);qb=c[t>>2]|0}}while(0);c[V>>2]=115;pb=qb+nb|0;c[o>>2]=pb;rb=pb;sb=(c[t>>2]|0)+ob|0}else{rb=ma;sb=ja}c[o>>2]=rb+1;a[rb]=Aa;tb=sb;ub=ya;vb=wa;wb=ha;xb=aa+1|0;yb=za}else{ba=189}}while(0);if((ba|0)==189){ba=0;xa=a[E]|0;if((xa&1)==0){zb=(xa&255)>>>1}else{zb=c[n>>2]|0}if((zb|0)==0|(aa|0)==0){break}if(!(Aa<<24>>24==(a[v]|0))){break}if((wa|0)==(ha|0)){xa=wa-ya|0;pb=xa>>>0<2147483647?xa<<1:-1;if((za|0)==114){Ab=0}else{Ab=ya}lb=Rm(Ab,pb)|0;mb=lb;if((lb|0)==0){ba=198;break a}Bb=mb;Cb=mb+(xa>>2<<2)|0;Db=mb+(pb>>>2<<2)|0;Eb=115}else{Bb=ya;Cb=wa;Db=ha;Eb=za}c[Cb>>2]=aa;tb=ja;ub=Bb;vb=Cb+4|0;wb=Db;xb=0;yb=Eb}pb=c[h>>2]|0;mb=pb+12|0;xa=c[mb>>2]|0;if((xa|0)==(c[pb+16>>2]|0)){Cc[c[(c[pb>>2]|0)+40>>2]&63](pb)|0;ja=tb;ya=ub;wa=vb;ha=wb;aa=xb;za=yb;continue}else{c[mb>>2]=xa+1;ja=tb;ya=ub;wa=vb;ha=wb;aa=xb;za=yb;continue}}if((ya|0)==(wa|0)|(aa|0)==0){Fb=ya;Gb=wa;Hb=ha;Ib=za}else{if((wa|0)==(ha|0)){xa=wa-ya|0;mb=xa>>>0<2147483647?xa<<1:-1;if((za|0)==114){Jb=0}else{Jb=ya}pb=Rm(Jb,mb)|0;lb=pb;if((pb|0)==0){ba=209;break a}Kb=lb;Lb=lb+(xa>>2<<2)|0;Mb=lb+(mb>>>2<<2)|0;Nb=115}else{Kb=ya;Lb=wa;Mb=ha;Nb=za}c[Lb>>2]=aa;Fb=Kb;Gb=Lb+4|0;Hb=Mb;Ib=Nb}mb=c[B>>2]|0;if((mb|0)>0){lb=c[h>>2]|0;do{if((lb|0)==0){Ob=0}else{if((c[lb+12>>2]|0)!=(c[lb+16>>2]|0)){Ob=lb;break}if((Cc[c[(c[lb>>2]|0)+36>>2]&63](lb)|0)==-1){c[h>>2]=0;Ob=0;break}else{Ob=c[h>>2]|0;break}}}while(0);lb=(Ob|0)==0;aa=c[e>>2]|0;do{if((aa|0)==0){ba=223}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){if(lb){Pb=aa;break}else{ba=229;break a}}if((Cc[c[(c[aa>>2]|0)+36>>2]&63](aa)|0)==-1){c[e>>2]=0;ba=223;break}else{if(lb){Pb=aa;break}else{ba=229;break a}}}}while(0);if((ba|0)==223){ba=0;if(lb){ba=229;break a}else{Pb=0}}aa=c[h>>2]|0;za=c[aa+12>>2]|0;if((za|0)==(c[aa+16>>2]|0)){Qb=Cc[c[(c[aa>>2]|0)+36>>2]&63](aa)|0}else{Qb=d[za]|0}if(!((Qb&255)<<24>>24==(a[u]|0))){ba=229;break a}za=c[h>>2]|0;aa=za+12|0;ha=c[aa>>2]|0;if((ha|0)==(c[za+16>>2]|0)){Cc[c[(c[za>>2]|0)+40>>2]&63](za)|0;Rb=Pb;Sb=mb;Tb=Pb;Ub=ja}else{c[aa>>2]=ha+1;Rb=Pb;Sb=mb;Tb=Pb;Ub=ja}while(1){ha=c[h>>2]|0;do{if((ha|0)==0){Vb=0}else{if((c[ha+12>>2]|0)!=(c[ha+16>>2]|0)){Vb=ha;break}if((Cc[c[(c[ha>>2]|0)+36>>2]&63](ha)|0)==-1){c[h>>2]=0;Vb=0;break}else{Vb=c[h>>2]|0;break}}}while(0);ha=(Vb|0)==0;do{if((Tb|0)==0){Wb=Rb;ba=243}else{if((c[Tb+12>>2]|0)!=(c[Tb+16>>2]|0)){if(ha){Xb=Rb;Yb=Tb;break}else{ba=250;break a}}if((Cc[c[(c[Tb>>2]|0)+36>>2]&63](Tb)|0)==-1){c[e>>2]=0;Wb=0;ba=243;break}else{if(ha^(Rb|0)==0){Xb=Rb;Yb=Rb;break}else{ba=250;break a}}}}while(0);if((ba|0)==243){ba=0;if(ha){ba=250;break a}else{Xb=Wb;Yb=0}}Aa=c[h>>2]|0;aa=c[Aa+12>>2]|0;if((aa|0)==(c[Aa+16>>2]|0)){Zb=Cc[c[(c[Aa>>2]|0)+36>>2]&63](Aa)|0}else{Zb=d[aa]|0}if(!((Zb&255)<<24>>24>-1)){ba=250;break a}if((b[(c[s>>2]|0)+(Zb<<24>>24<<1)>>1]&2048)==0){ba=250;break a}aa=c[o>>2]|0;if((aa|0)==(Ub|0)){Aa=(c[V>>2]|0)!=114;za=c[t>>2]|0;wa=Ub-za|0;ya=wa>>>0<2147483647?wa<<1:-1;xa=Rm(Aa?za:0,ya)|0;if((xa|0)==0){ba=253;break a}do{if(Aa){c[t>>2]=xa;_b=xa}else{za=c[t>>2]|0;c[t>>2]=xa;if((za|0)==0){_b=xa;break}zc[c[V>>2]&127](za);_b=c[t>>2]|0}}while(0);c[V>>2]=115;xa=_b+wa|0;c[o>>2]=xa;$b=xa;ac=(c[t>>2]|0)+ya|0}else{$b=aa;ac=Ub}xa=c[h>>2]|0;Aa=c[xa+12>>2]|0;if((Aa|0)==(c[xa+16>>2]|0)){ha=Cc[c[(c[xa>>2]|0)+36>>2]&63](xa)|0;bc=ha;cc=c[o>>2]|0}else{bc=d[Aa]|0;cc=$b}c[o>>2]=cc+1;a[cc]=bc;Aa=Sb+ -1|0;c[B>>2]=Aa;ha=c[h>>2]|0;xa=ha+12|0;za=c[xa>>2]|0;if((za|0)==(c[ha+16>>2]|0)){Cc[c[(c[ha>>2]|0)+40>>2]&63](ha)|0}else{c[xa>>2]=za+1}if((Aa|0)>0){Rb=Xb;Sb=Aa;Tb=Yb;Ub=ac}else{dc=ac;break}}}else{dc=ja}if((c[o>>2]|0)==(c[t>>2]|0)){ba=267;break a}else{oa=dc;pa=Fb;qa=Gb;ra=Hb;sa=Y;ta=Ib}break};default:{oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z}}}while(0);f:do{if((ba|0)==26){ba=0;if((p|0)==3){da=X;ea=r;fa=Y;ga=Z;ba=269;break a}else{ec=ca;fc=ca}while(1){_=c[h>>2]|0;do{if((_|0)==0){gc=0}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){gc=_;break}if((Cc[c[(c[_>>2]|0)+36>>2]&63](_)|0)==-1){c[h>>2]=0;gc=0;break}else{gc=c[h>>2]|0;break}}}while(0);_=(gc|0)==0;do{if((fc|0)==0){hc=ec;ba=37}else{if((c[fc+12>>2]|0)!=(c[fc+16>>2]|0)){if(_){ic=ec;jc=fc;break}else{oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}}if((Cc[c[(c[fc>>2]|0)+36>>2]&63](fc)|0)==-1){c[e>>2]=0;hc=0;ba=37;break}else{if(_^(ec|0)==0){ic=ec;jc=ec;break}else{oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}}}}while(0);if((ba|0)==37){ba=0;if(_){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}else{ic=hc;jc=0}}aa=c[h>>2]|0;ya=c[aa+12>>2]|0;if((ya|0)==(c[aa+16>>2]|0)){kc=Cc[c[(c[aa>>2]|0)+36>>2]&63](aa)|0}else{kc=d[ya]|0}if(!((kc&255)<<24>>24>-1)){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}if((b[(c[s>>2]|0)+(kc<<24>>24<<1)>>1]&8192)==0){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}ya=c[h>>2]|0;aa=ya+12|0;wa=c[aa>>2]|0;if((wa|0)==(c[ya+16>>2]|0)){lc=Cc[c[(c[ya>>2]|0)+40>>2]&63](ya)|0}else{c[aa>>2]=wa+1;lc=d[wa]|0}He(A,lc&255);ec=ic;fc=jc}}}while(0);ja=p+1|0;if(ja>>>0<4){W=ra;r=qa;X=pa;D=oa;p=ja;Y=sa;Z=ta}else{da=pa;ea=qa;fa=sa;ga=ta;ba=269;break}}g:do{if((ba|0)==25){c[k>>2]=c[k>>2]|4;mc=0;nc=X;oc=Z}else if((ba|0)==112){c[k>>2]=c[k>>2]|4;mc=0;nc=X;oc=Z}else if((ba|0)==162){c[k>>2]=c[k>>2]|4;mc=0;nc=X;oc=Z}else if((ba|0)==182){$m()}else if((ba|0)==198){$m()}else if((ba|0)==209){$m()}else if((ba|0)==229){c[k>>2]=c[k>>2]|4;mc=0;nc=Fb;oc=Ib}else if((ba|0)==250){c[k>>2]=c[k>>2]|4;mc=0;nc=Fb;oc=Ib}else if((ba|0)==253){$m()}else if((ba|0)==267){c[k>>2]=c[k>>2]|4;mc=0;nc=Fb;oc=Ib}else if((ba|0)==269){h:do{if((fa|0)!=0){ta=fa;sa=fa+1|0;qa=fa+8|0;pa=fa+4|0;Y=1;i:while(1){p=a[ta]|0;if((p&1)==0){pc=(p&255)>>>1}else{pc=c[pa>>2]|0}if(!(Y>>>0<pc>>>0)){break h}p=c[h>>2]|0;do{if((p|0)==0){qc=0}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){qc=p;break}if((Cc[c[(c[p>>2]|0)+36>>2]&63](p)|0)==-1){c[h>>2]=0;qc=0;break}else{qc=c[h>>2]|0;break}}}while(0);p=(qc|0)==0;_=c[e>>2]|0;do{if((_|0)==0){ba=285}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){if(p){break}else{break i}}if((Cc[c[(c[_>>2]|0)+36>>2]&63](_)|0)==-1){c[e>>2]=0;ba=285;break}else{if(p){break}else{break i}}}}while(0);if((ba|0)==285){ba=0;if(p){break}}_=c[h>>2]|0;oa=c[_+12>>2]|0;if((oa|0)==(c[_+16>>2]|0)){rc=Cc[c[(c[_>>2]|0)+36>>2]&63](_)|0}else{rc=d[oa]|0}if((a[ta]&1)==0){sc=sa}else{sc=c[qa>>2]|0}if(!((rc&255)<<24>>24==(a[sc+Y|0]|0))){break}oa=Y+1|0;_=c[h>>2]|0;D=_+12|0;r=c[D>>2]|0;if((r|0)==(c[_+16>>2]|0)){Cc[c[(c[_>>2]|0)+40>>2]&63](_)|0;Y=oa;continue}else{c[D>>2]=r+1;Y=oa;continue}}c[k>>2]=c[k>>2]|4;mc=0;nc=da;oc=ga;break g}}while(0);if((da|0)==(ea|0)){mc=1;nc=ea;oc=ga;break}c[C>>2]=0;rj(w,da,ea,C);if((c[C>>2]|0)==0){mc=1;nc=da;oc=ga;break}c[k>>2]=c[k>>2]|4;mc=0;nc=da;oc=ga}}while(0);Be(A);Be(z);Be(y);Be(x);Be(w);if((nc|0)==0){i=q;return mc|0}zc[oc&127](nc);i=q;return mc|0}function nj(a){a=a|0;var b=0;b=Bb(8)|0;ie(b,a);oc(b|0,2168,11)}function oj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+168|0;l=d;m=d+8|0;n=d+24|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=o;c[t>>2]=n;u=o+4|0;c[u>>2]=114;v=n+100|0;We(q,h);n=q;w=c[n>>2]|0;if(!((c[1290]|0)==-1)){c[m>>2]=5160;c[m+4>>2]=112;c[m+8>>2]=0;we(5160,m,113)}m=(c[5164>>2]|0)+ -1|0;x=c[w+8>>2]|0;if(!((c[w+12>>2]|0)-x>>2>>>0>m>>>0)){y=Bb(4)|0;z=y;um(z);oc(y|0,13120,101)}w=c[x+(m<<2)>>2]|0;if((w|0)==0){y=Bb(4)|0;z=y;um(z);oc(y|0,13120,101)}y=w;a[r]=0;z=f;f=c[z>>2]|0;c[s>>2]=f;m=c[h+4>>2]|0;h=l;x=s;c[h+0>>2]=c[x+0>>2];x=mj(e,l,g,q,m,j,r,y,o,p,v)|0;if(x){x=k;if((a[x]&1)==0){a[k+1|0]=0;a[x]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}x=w;if((a[r]|0)!=0){He(k,Lc[c[(c[x>>2]|0)+28>>2]&15](y,45)|0)}r=Lc[c[(c[x>>2]|0)+28>>2]&15](y,48)|0;y=c[t>>2]|0;x=c[p>>2]|0;p=x+ -1|0;a:do{if(y>>>0<p>>>0){w=y;while(1){v=w+1|0;if(!((a[w]|0)==r<<24>>24)){A=w;break a}if(v>>>0<p>>>0){w=v}else{A=v;break}}}else{A=y}}while(0);pj(k,A,x)|0}x=e;e=c[x>>2]|0;do{if((e|0)==0){B=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){B=e;break}if(!((Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1)){B=e;break}c[x>>2]=0;B=0}}while(0);x=(B|0)==0;do{if((f|0)==0){C=25}else{if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(x){break}else{C=27;break}}if((Cc[c[(c[f>>2]|0)+36>>2]&63](f)|0)==-1){c[z>>2]=0;C=25;break}else{if(x^(f|0)==0){break}else{C=27;break}}}}while(0);if((C|0)==25){if(x){C=27}}if((C|0)==27){c[j>>2]=c[j>>2]|2}c[b>>2]=B;ce(c[n>>2]|0)|0;n=c[t>>2]|0;c[t>>2]=0;if((n|0)==0){i=d;return}zc[c[u>>2]&127](n);i=d;return}function pj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b;h=d;j=a[g]|0;if((j&1)==0){k=(j&255)>>>1;l=j;m=10}else{j=c[b>>2]|0;k=c[b+4>>2]|0;l=j&255;m=(j&-2)+ -1|0}j=e-h|0;if((e|0)==(d|0)){i=f;return b|0}if((m-k|0)>>>0<j>>>0){Ke(b,m,k+j-m|0,k,k,0,0);n=a[g]|0}else{n=l}if((n&1)==0){o=b+1|0}else{o=c[b+8>>2]|0}n=e+(k-h)|0;h=d;d=o+k|0;while(1){a[d]=a[h]|0;l=h+1|0;if((l|0)==(e|0)){break}else{d=d+1|0;h=l}}a[o+n|0]=0;n=k+j|0;if((a[g]&1)==0){a[g]=n<<1;i=f;return b|0}else{c[b+4>>2]=n;i=f;return b|0}return 0}function qj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;n=i;i=i+176|0;o=n;p=n+16|0;q=n+32|0;r=n+40|0;s=n+56|0;t=n+72|0;u=n+88|0;v=n+104|0;w=n+112|0;x=n+128|0;y=n+144|0;z=n+160|0;if(b){b=c[d>>2]|0;if(!((c[1150]|0)==-1)){c[p>>2]=4600;c[p+4>>2]=112;c[p+8>>2]=0;we(4600,p,113)}p=(c[4604>>2]|0)+ -1|0;A=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-A>>2>>>0>p>>>0)){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}b=c[A+(p<<2)>>2]|0;if((b|0)==0){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}B=b;Ac[c[(c[b>>2]|0)+44>>2]&63](q,B);C=e;p=c[q>>2]|0;a[C]=p;a[C+1|0]=p>>8;a[C+2|0]=p>>16;a[C+3|0]=p>>24;p=b;Ac[c[(c[p>>2]|0)+32>>2]&63](r,B);C=l;if((a[C]&1)==0){a[l+1|0]=0;a[C]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ge(l,0);q=r;c[C+0>>2]=c[q+0>>2];c[C+4>>2]=c[q+4>>2];c[C+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Be(r);Ac[c[(c[p>>2]|0)+28>>2]&63](s,B);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ge(k,0);q=s;c[r+0>>2]=c[q+0>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Be(s);s=b;q=Cc[c[(c[s>>2]|0)+12>>2]&63](B)|0;a[f]=q;q=Cc[c[(c[s>>2]|0)+16>>2]&63](B)|0;a[g]=q;Ac[c[(c[p>>2]|0)+20>>2]&63](t,B);q=h;if((a[q]&1)==0){a[h+1|0]=0;a[q]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ge(h,0);s=t;c[q+0>>2]=c[s+0>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;Be(t);Ac[c[(c[p>>2]|0)+24>>2]&63](u,B);p=j;if((a[p]&1)==0){a[j+1|0]=0;a[p]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ge(j,0);t=u;c[p+0>>2]=c[t+0>>2];c[p+4>>2]=c[t+4>>2];c[p+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;Be(u);D=Cc[c[(c[b>>2]|0)+36>>2]&63](B)|0;c[m>>2]=D;i=n;return}else{B=c[d>>2]|0;if(!((c[1134]|0)==-1)){c[o>>2]=4536;c[o+4>>2]=112;c[o+8>>2]=0;we(4536,o,113)}o=(c[4540>>2]|0)+ -1|0;d=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-d>>2>>>0>o>>>0)){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}B=c[d+(o<<2)>>2]|0;if((B|0)==0){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}E=B;Ac[c[(c[B>>2]|0)+44>>2]&63](v,E);F=e;e=c[v>>2]|0;a[F]=e;a[F+1|0]=e>>8;a[F+2|0]=e>>16;a[F+3|0]=e>>24;e=B;Ac[c[(c[e>>2]|0)+32>>2]&63](w,E);F=l;if((a[F]&1)==0){a[l+1|0]=0;a[F]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ge(l,0);l=w;c[F+0>>2]=c[l+0>>2];c[F+4>>2]=c[l+4>>2];c[F+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;Be(w);Ac[c[(c[e>>2]|0)+28>>2]&63](x,E);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ge(k,0);k=x;c[w+0>>2]=c[k+0>>2];c[w+4>>2]=c[k+4>>2];c[w+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;Be(x);x=B;k=Cc[c[(c[x>>2]|0)+12>>2]&63](E)|0;a[f]=k;k=Cc[c[(c[x>>2]|0)+16>>2]&63](E)|0;a[g]=k;Ac[c[(c[e>>2]|0)+20>>2]&63](y,E);k=h;if((a[k]&1)==0){a[h+1|0]=0;a[k]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ge(h,0);h=y;c[k+0>>2]=c[h+0>>2];c[k+4>>2]=c[h+4>>2];c[k+8>>2]=c[h+8>>2];c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Be(y);Ac[c[(c[e>>2]|0)+24>>2]&63](z,E);e=j;if((a[e]&1)==0){a[j+1|0]=0;a[e]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ge(j,0);j=z;c[e+0>>2]=c[j+0>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Be(z);D=Cc[c[(c[B>>2]|0)+36>>2]&63](E)|0;c[m>>2]=D;i=n;return}}function rj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;h=b;j=a[h]|0;if((j&1)==0){k=(j&255)>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){i=g;return}do{if((d|0)==(e|0)){l=j}else{k=e+ -4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=j;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n+ -4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=b+1|0;p=(l&255)>>>1}else{o=c[b+8>>2]|0;p=c[b+4>>2]|0}b=e+ -4|0;e=a[o]|0;l=e<<24>>24<1|e<<24>>24==127;a:do{if(b>>>0>d>>>0){h=o+p|0;n=e;m=o;j=d;k=l;while(1){if(!k){if((n<<24>>24|0)!=(c[j>>2]|0)){break}}q=(h-m|0)>1?m+1|0:m;r=j+4|0;s=a[q]|0;t=s<<24>>24<1|s<<24>>24==127;if(r>>>0<b>>>0){n=s;m=q;j=r;k=t}else{u=s;v=t;break a}}c[f>>2]=4;i=g;return}else{u=e;v=l}}while(0);if(v){i=g;return}v=c[b>>2]|0;if(!(u<<24>>24>>>0<v>>>0|(v|0)==0)){i=g;return}c[f>>2]=4;i=g;return}function sj(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function tj(a){a=a|0;i=i;return}function uj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+400|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=i;i=i+8|0;u=i;i=i+40|0;v=i;i=i+104|0;w=p;c[w>>2]=o;x=p+4|0;c[x>>2]=114;y=o+400|0;We(r,h);o=r;z=c[o>>2]|0;if(!((c[1288]|0)==-1)){c[n>>2]=5152;c[n+4>>2]=112;c[n+8>>2]=0;we(5152,n,113)}n=(c[5156>>2]|0)+ -1|0;A=c[z+8>>2]|0;if(!((c[z+12>>2]|0)-A>>2>>>0>n>>>0)){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}z=c[A+(n<<2)>>2]|0;if((z|0)==0){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}B=z;a[s]=0;C=f;c[t>>2]=c[C>>2];f=c[h+4>>2]|0;h=l;n=t;c[h+0>>2]=c[n+0>>2];n=vj(e,l,g,r,f,j,s,B,p,q,y)|0;do{if(n){y=u;Ic[c[(c[z>>2]|0)+48>>2]&7](B,4856,4866|0,y)|0;p=v;f=c[q>>2]|0;r=c[w>>2]|0;g=f-r|0;do{if((g|0)>392){l=Pm((g>>2)+2|0)|0;if((l|0)!=0){D=l;E=l;break}$m()}else{D=0;E=p}}while(0);if((a[s]|0)==0){F=E}else{a[E]=45;F=E+1|0}if(r>>>0<f>>>0){g=u+40|0;l=u;h=F;t=r;while(1){A=c[t>>2]|0;G=y;while(1){H=G+4|0;if((c[G>>2]|0)==(A|0)){I=G;break}if((H|0)==(g|0)){I=g;break}else{G=H}}a[h]=a[4856+(I-l>>2)|0]|0;G=t+4|0;A=h+1|0;if(G>>>0<(c[q>>2]|0)>>>0){h=A;t=G}else{J=A;break}}}else{J=F}a[J]=0;c[m>>2]=k;if((Ga(p|0,4792,m|0)|0)!=1){t=Bb(8)|0;ie(t,4800);oc(t|0,2168,11)}if((D|0)==0){break}Qm(D)}}while(0);D=e;e=c[D>>2]|0;do{if((e|0)==0){K=1}else{m=c[e+12>>2]|0;if((m|0)==(c[e+16>>2]|0)){L=Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{L=c[m>>2]|0}if((L|0)==-1){c[D>>2]=0;K=1;break}else{K=(c[D>>2]|0)==0;break}}}while(0);L=c[C>>2]|0;do{if((L|0)==0){M=35}else{e=c[L+12>>2]|0;if((e|0)==(c[L+16>>2]|0)){N=Cc[c[(c[L>>2]|0)+36>>2]&63](L)|0}else{N=c[e>>2]|0}if((N|0)==-1){c[C>>2]=0;M=35;break}else{if(K){break}else{M=37;break}}}}while(0);if((M|0)==35){if(K){M=37}}if((M|0)==37){c[j>>2]=c[j>>2]|2}c[b>>2]=c[D>>2];ce(c[o>>2]|0)|0;o=c[w>>2]|0;c[w>>2]=0;if((o|0)==0){i=d;return}zc[c[x>>2]&127](o);i=d;return}function vj(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,xc=0,yc=0,Ac=0,Bc=0,Dc=0,Ec=0,Fc=0;p=i;i=i+408|0;q=p;r=p+400|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;v=i;i=i+16|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+8|0;B=i;i=i+8|0;C=q;c[r>>2]=0;D=v;c[D+0>>2]=0;c[D+4>>2]=0;c[D+8>>2]=0;E=w;c[E+0>>2]=0;c[E+4>>2]=0;c[E+8>>2]=0;F=x;c[F+0>>2]=0;c[F+4>>2]=0;c[F+8>>2]=0;G=y;c[G+0>>2]=0;c[G+4>>2]=0;c[G+8>>2]=0;H=z;c[H+0>>2]=0;c[H+4>>2]=0;c[H+8>>2]=0;yj(f,g,s,t,u,v,w,x,y,A);s=m;c[n>>2]=c[s>>2];g=b;b=e;e=r;r=l;f=y+4|0;I=y+8|0;J=x+4|0;K=x+8|0;L=(h&512|0)!=0;h=w+4|0;M=w+8|0;N=z+4|0;O=z+8|0;P=e+3|0;Q=m+4|0;m=v+4|0;R=q+400|0;q=C;S=C;C=o;o=0;T=0;U=114;a:while(1){V=c[g>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=Cc[c[(c[V>>2]|0)+36>>2]&63](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[g>>2]=0;W=1;break}else{W=(c[g>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=15}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=Cc[c[(c[V>>2]|0)+36>>2]&63](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=15;break}else{if(W){$=V;break}else{aa=S;ba=q;ca=T;da=U;Z=292;break a}}}}while(0);if((Z|0)==15){Z=0;if(W){aa=S;ba=q;ca=T;da=U;Z=292;break}else{$=0}}b:do{switch(a[e+o|0]|0){case 4:{V=C;X=S;ea=q;fa=R;ga=0;ha=U;c:while(1){ia=c[g>>2]|0;do{if((ia|0)==0){ja=1}else{ka=c[ia+12>>2]|0;if((ka|0)==(c[ia+16>>2]|0)){la=Cc[c[(c[ia>>2]|0)+36>>2]&63](ia)|0}else{la=c[ka>>2]|0}if((la|0)==-1){c[g>>2]=0;ja=1;break}else{ja=(c[g>>2]|0)==0;break}}}while(0);ia=c[b>>2]|0;do{if((ia|0)==0){Z=188}else{ka=c[ia+12>>2]|0;if((ka|0)==(c[ia+16>>2]|0)){ma=Cc[c[(c[ia>>2]|0)+36>>2]&63](ia)|0}else{ma=c[ka>>2]|0}if((ma|0)==-1){c[b>>2]=0;Z=188;break}else{if(ja){break}else{break c}}}}while(0);if((Z|0)==188){Z=0;if(ja){break}}ia=c[g>>2]|0;ka=c[ia+12>>2]|0;if((ka|0)==(c[ia+16>>2]|0)){na=Cc[c[(c[ia>>2]|0)+36>>2]&63](ia)|0}else{na=c[ka>>2]|0}if(wc[c[(c[r>>2]|0)+12>>2]&31](l,2048,na)|0){ka=c[n>>2]|0;if((ka|0)==(V|0)){ia=(c[Q>>2]|0)!=114;oa=c[s>>2]|0;pa=V-oa|0;qa=pa>>>0<2147483647?pa<<1:-1;ra=pa>>2;if(ia){sa=oa}else{sa=0}oa=Rm(sa,qa)|0;pa=oa;if((oa|0)==0){Z=198;break a}do{if(ia){c[s>>2]=pa;ta=pa}else{oa=c[s>>2]|0;c[s>>2]=pa;if((oa|0)==0){ta=pa;break}zc[c[Q>>2]&127](oa);ta=c[s>>2]|0}}while(0);c[Q>>2]=115;pa=ta+(ra<<2)|0;c[n>>2]=pa;ua=pa;va=(c[s>>2]|0)+(qa>>>2<<2)|0}else{ua=ka;va=V}c[n>>2]=ua+4;c[ua>>2]=na;wa=va;xa=X;ya=ea;za=fa;Aa=ga+1|0;Ba=ha}else{pa=a[D]|0;if((pa&1)==0){Ca=(pa&255)>>>1}else{Ca=c[m>>2]|0}if((Ca|0)==0|(ga|0)==0){break}if((na|0)!=(c[u>>2]|0)){break}if((ea|0)==(fa|0)){pa=ea-X|0;ia=pa>>>0<2147483647?pa<<1:-1;if((ha|0)!=114){Da=X}else{Da=0}oa=Rm(Da,ia)|0;Ea=oa;if((oa|0)==0){Z=214;break a}Fa=Ea;Ga=Ea+(pa>>2<<2)|0;Ha=Ea+(ia>>>2<<2)|0;Ia=115}else{Fa=X;Ga=ea;Ha=fa;Ia=ha}c[Ga>>2]=ga;wa=V;xa=Fa;ya=Ga+4|0;za=Ha;Aa=0;Ba=Ia}ia=c[g>>2]|0;Ea=ia+12|0;pa=c[Ea>>2]|0;if((pa|0)==(c[ia+16>>2]|0)){Cc[c[(c[ia>>2]|0)+40>>2]&63](ia)|0;V=wa;X=xa;ea=ya;fa=za;ga=Aa;ha=Ba;continue}else{c[Ea>>2]=pa+4;V=wa;X=xa;ea=ya;fa=za;ga=Aa;ha=Ba;continue}}if((X|0)==(ea|0)|(ga|0)==0){Ja=X;Ka=ea;La=fa;Ma=ha}else{if((ea|0)==(fa|0)){pa=ea-X|0;Ea=pa>>>0<2147483647?pa<<1:-1;if((ha|0)!=114){Na=X}else{Na=0}ia=Rm(Na,Ea)|0;oa=ia;if((ia|0)==0){Z=225;break a}Oa=oa;Pa=oa+(pa>>2<<2)|0;Qa=oa+(Ea>>>2<<2)|0;Ra=115}else{Oa=X;Pa=ea;Qa=fa;Ra=ha}c[Pa>>2]=ga;Ja=Oa;Ka=Pa+4|0;La=Qa;Ma=Ra}Ea=c[A>>2]|0;if((Ea|0)>0){oa=c[g>>2]|0;do{if((oa|0)==0){Sa=1}else{pa=c[oa+12>>2]|0;if((pa|0)==(c[oa+16>>2]|0)){Ta=Cc[c[(c[oa>>2]|0)+36>>2]&63](oa)|0}else{Ta=c[pa>>2]|0}if((Ta|0)==-1){c[g>>2]=0;Sa=1;break}else{Sa=(c[g>>2]|0)==0;break}}}while(0);oa=c[b>>2]|0;do{if((oa|0)==0){Z=242}else{ga=c[oa+12>>2]|0;if((ga|0)==(c[oa+16>>2]|0)){Ua=Cc[c[(c[oa>>2]|0)+36>>2]&63](oa)|0}else{Ua=c[ga>>2]|0}if((Ua|0)==-1){c[b>>2]=0;Z=242;break}else{if(Sa){Va=oa;break}else{Z=248;break a}}}}while(0);if((Z|0)==242){Z=0;if(Sa){Z=248;break a}else{Va=0}}oa=c[g>>2]|0;ga=c[oa+12>>2]|0;if((ga|0)==(c[oa+16>>2]|0)){Wa=Cc[c[(c[oa>>2]|0)+36>>2]&63](oa)|0}else{Wa=c[ga>>2]|0}if((Wa|0)!=(c[t>>2]|0)){Z=248;break a}ga=c[g>>2]|0;oa=ga+12|0;ha=c[oa>>2]|0;if((ha|0)==(c[ga+16>>2]|0)){Cc[c[(c[ga>>2]|0)+40>>2]&63](ga)|0;Xa=Va;Ya=Ea;Za=Va;_a=V}else{c[oa>>2]=ha+4;Xa=Va;Ya=Ea;Za=Va;_a=V}while(1){ha=c[g>>2]|0;do{if((ha|0)==0){$a=1}else{oa=c[ha+12>>2]|0;if((oa|0)==(c[ha+16>>2]|0)){ab=Cc[c[(c[ha>>2]|0)+36>>2]&63](ha)|0}else{ab=c[oa>>2]|0}if((ab|0)==-1){c[g>>2]=0;$a=1;break}else{$a=(c[g>>2]|0)==0;break}}}while(0);do{if((Za|0)==0){bb=Xa;Z=265}else{ha=c[Za+12>>2]|0;if((ha|0)==(c[Za+16>>2]|0)){cb=Cc[c[(c[Za>>2]|0)+36>>2]&63](Za)|0}else{cb=c[ha>>2]|0}if((cb|0)==-1){c[b>>2]=0;bb=0;Z=265;break}else{if($a^(Xa|0)==0){db=Xa;eb=Xa;break}else{Z=271;break a}}}}while(0);if((Z|0)==265){Z=0;if($a){Z=271;break a}else{db=bb;eb=0}}ha=c[g>>2]|0;ka=c[ha+12>>2]|0;if((ka|0)==(c[ha+16>>2]|0)){fb=Cc[c[(c[ha>>2]|0)+36>>2]&63](ha)|0}else{fb=c[ka>>2]|0}if(!(wc[c[(c[r>>2]|0)+12>>2]&31](l,2048,fb)|0)){Z=271;break a}ka=c[n>>2]|0;if((ka|0)==(_a|0)){ha=(c[Q>>2]|0)!=114;qa=c[s>>2]|0;ra=_a-qa|0;oa=ra>>>0<2147483647?ra<<1:-1;ga=ra>>2;if(ha){gb=qa}else{gb=0}qa=Rm(gb,oa)|0;ra=qa;if((qa|0)==0){Z=276;break a}do{if(ha){c[s>>2]=ra;hb=ra}else{qa=c[s>>2]|0;c[s>>2]=ra;if((qa|0)==0){hb=ra;break}zc[c[Q>>2]&127](qa);hb=c[s>>2]|0}}while(0);c[Q>>2]=115;ra=hb+(ga<<2)|0;c[n>>2]=ra;ib=ra;jb=(c[s>>2]|0)+(oa>>>2<<2)|0}else{ib=ka;jb=_a}ra=c[g>>2]|0;ha=c[ra+12>>2]|0;if((ha|0)==(c[ra+16>>2]|0)){qa=Cc[c[(c[ra>>2]|0)+36>>2]&63](ra)|0;kb=qa;lb=c[n>>2]|0}else{kb=c[ha>>2]|0;lb=ib}c[n>>2]=lb+4;c[lb>>2]=kb;ha=Ya+ -1|0;c[A>>2]=ha;qa=c[g>>2]|0;ra=qa+12|0;fa=c[ra>>2]|0;if((fa|0)==(c[qa+16>>2]|0)){Cc[c[(c[qa>>2]|0)+40>>2]&63](qa)|0}else{c[ra>>2]=fa+4}if((ha|0)>0){Xa=db;Ya=ha;Za=eb;_a=jb}else{mb=jb;break}}}else{mb=V}if((c[n>>2]|0)==(c[s>>2]|0)){Z=290;break a}else{nb=mb;ob=Ja;pb=Ka;qb=La;rb=T;sb=Ma}break};case 2:{if(!((T|0)!=0|o>>>0<2)){if((o|0)==2){tb=(a[P]|0)!=0}else{tb=0}if(!(L|tb)){nb=C;ob=S;pb=q;qb=R;rb=0;sb=U;break b}}Ea=a[E]|0;ha=(Ea&1)==0?h:c[M>>2]|0;d:do{if((o|0)==0){ub=$;vb=$;wb=Ea;xb=ha}else{if((d[e+(o+ -1)|0]|0)<2){yb=Ea;zb=ha}else{ub=$;vb=$;wb=Ea;xb=ha;break}while(1){if((yb&1)==0){Ab=h;Bb=(yb&255)>>>1}else{Ab=c[M>>2]|0;Bb=c[h>>2]|0}if((zb|0)==(Ab+(Bb<<2)|0)){Cb=yb;break}if(!(wc[c[(c[r>>2]|0)+12>>2]&31](l,8192,c[zb>>2]|0)|0)){Z=129;break}yb=a[E]|0;zb=zb+4|0}if((Z|0)==129){Z=0;Cb=a[E]|0}ka=(Cb&1)==0;oa=zb-(ka?h:c[M>>2]|0)>>2;ga=a[H]|0;fa=(ga&1)==0;if(fa){Db=(ga&255)>>>1}else{Db=c[N>>2]|0}e:do{if(!(oa>>>0>Db>>>0)){if(fa){Eb=N+(((ga&255)>>>1)-oa<<2)|0;Fb=N;Gb=(ga&255)>>>1}else{ra=c[O>>2]|0;qa=c[N>>2]|0;Eb=ra+(qa-oa<<2)|0;Fb=ra;Gb=qa}qa=Fb+(Gb<<2)|0;if((Eb|0)==(qa|0)){ub=$;vb=$;wb=Cb;xb=zb;break d}else{Hb=ka?h:c[M>>2]|0;Ib=Eb}while(1){if((c[Ib>>2]|0)!=(c[Hb>>2]|0)){break e}ra=Ib+4|0;if((ra|0)==(qa|0)){ub=$;vb=$;wb=Cb;xb=zb;break d}Hb=Hb+4|0;Ib=ra}}}while(0);ub=$;vb=$;wb=Cb;xb=ka?h:c[M>>2]|0}}while(0);f:while(1){if((wb&1)==0){Jb=h;Kb=(wb&255)>>>1}else{Jb=c[M>>2]|0;Kb=c[h>>2]|0}if((xb|0)==(Jb+(Kb<<2)|0)){break}ha=c[g>>2]|0;do{if((ha|0)==0){Lb=1}else{Ea=c[ha+12>>2]|0;if((Ea|0)==(c[ha+16>>2]|0)){Mb=Cc[c[(c[ha>>2]|0)+36>>2]&63](ha)|0}else{Mb=c[Ea>>2]|0}if((Mb|0)==-1){c[g>>2]=0;Lb=1;break}else{Lb=(c[g>>2]|0)==0;break}}}while(0);do{if((vb|0)==0){Nb=ub;Z=159}else{ha=c[vb+12>>2]|0;if((ha|0)==(c[vb+16>>2]|0)){Ob=Cc[c[(c[vb>>2]|0)+36>>2]&63](vb)|0}else{Ob=c[ha>>2]|0}if((Ob|0)==-1){c[b>>2]=0;Nb=0;Z=159;break}else{if(Lb^(ub|0)==0){Pb=ub;Qb=ub;break}else{break f}}}}while(0);if((Z|0)==159){Z=0;if(Lb){break}else{Pb=Nb;Qb=0}}ha=c[g>>2]|0;ka=c[ha+12>>2]|0;if((ka|0)==(c[ha+16>>2]|0)){Rb=Cc[c[(c[ha>>2]|0)+36>>2]&63](ha)|0}else{Rb=c[ka>>2]|0}if((Rb|0)!=(c[xb>>2]|0)){break}ka=c[g>>2]|0;ha=ka+12|0;Ea=c[ha>>2]|0;if((Ea|0)==(c[ka+16>>2]|0)){Cc[c[(c[ka>>2]|0)+40>>2]&63](ka)|0}else{c[ha>>2]=Ea+4}ub=Pb;vb=Qb;wb=a[E]|0;xb=xb+4|0}if(!L){nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break b}Ea=a[E]|0;if((Ea&1)==0){Sb=h;Tb=(Ea&255)>>>1}else{Sb=c[M>>2]|0;Tb=c[h>>2]|0}if((xb|0)==(Sb+(Tb<<2)|0)){nb=C;ob=S;pb=q;qb=R;rb=T;sb=U}else{Z=174;break a}break};case 3:{Ea=a[F]|0;ha=(Ea&1)==0;if(ha){Ub=(Ea&255)>>>1}else{Ub=c[J>>2]|0}ka=a[G]|0;V=(ka&1)==0;if(V){Vb=(ka&255)>>>1}else{Vb=c[f>>2]|0}if((Ub|0)==(0-Vb|0)){nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break b}if(ha){Wb=(Ea&255)>>>1}else{Wb=c[J>>2]|0}do{if((Wb|0)!=0){if(V){Xb=(ka&255)>>>1}else{Xb=c[f>>2]|0}if((Xb|0)==0){break}oa=c[g>>2]|0;ga=c[oa+12>>2]|0;if((ga|0)==(c[oa+16>>2]|0)){fa=Cc[c[(c[oa>>2]|0)+36>>2]&63](oa)|0;Yb=fa;Zb=a[F]|0}else{Yb=c[ga>>2]|0;Zb=Ea}ga=c[g>>2]|0;fa=ga+12|0;oa=c[fa>>2]|0;qa=(oa|0)==(c[ga+16>>2]|0);if((Yb|0)==(c[((Zb&1)==0?J:c[K>>2]|0)>>2]|0)){if(qa){Cc[c[(c[ga>>2]|0)+40>>2]&63](ga)|0}else{c[fa>>2]=oa+4}fa=a[F]|0;if((fa&1)==0){_b=(fa&255)>>>1}else{_b=c[J>>2]|0}nb=C;ob=S;pb=q;qb=R;rb=_b>>>0>1?x:T;sb=U;break b}if(qa){$b=Cc[c[(c[ga>>2]|0)+36>>2]&63](ga)|0}else{$b=c[oa>>2]|0}if(($b|0)!=(c[((a[G]&1)==0?f:c[I>>2]|0)>>2]|0)){Z=116;break a}oa=c[g>>2]|0;ga=oa+12|0;qa=c[ga>>2]|0;if((qa|0)==(c[oa+16>>2]|0)){Cc[c[(c[oa>>2]|0)+40>>2]&63](oa)|0}else{c[ga>>2]=qa+4}a[k]=1;qa=a[G]|0;if((qa&1)==0){ac=(qa&255)>>>1}else{ac=c[f>>2]|0}nb=C;ob=S;pb=q;qb=R;rb=ac>>>0>1?y:T;sb=U;break b}}while(0);if(ha){bc=(Ea&255)>>>1}else{bc=c[J>>2]|0}V=c[g>>2]|0;qa=c[V+12>>2]|0;ga=(qa|0)==(c[V+16>>2]|0);if((bc|0)==0){if(ga){oa=Cc[c[(c[V>>2]|0)+36>>2]&63](V)|0;cc=oa;dc=a[G]|0}else{cc=c[qa>>2]|0;dc=ka}if((cc|0)!=(c[((dc&1)==0?f:c[I>>2]|0)>>2]|0)){nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break b}oa=c[g>>2]|0;fa=oa+12|0;ra=c[fa>>2]|0;if((ra|0)==(c[oa+16>>2]|0)){Cc[c[(c[oa>>2]|0)+40>>2]&63](oa)|0}else{c[fa>>2]=ra+4}a[k]=1;ra=a[G]|0;if((ra&1)==0){ec=(ra&255)>>>1}else{ec=c[f>>2]|0}nb=C;ob=S;pb=q;qb=R;rb=ec>>>0>1?y:T;sb=U;break b}if(ga){ga=Cc[c[(c[V>>2]|0)+36>>2]&63](V)|0;fc=ga;gc=a[F]|0}else{fc=c[qa>>2]|0;gc=Ea}if((fc|0)!=(c[((gc&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break b}qa=c[g>>2]|0;ga=qa+12|0;V=c[ga>>2]|0;if((V|0)==(c[qa+16>>2]|0)){Cc[c[(c[qa>>2]|0)+40>>2]&63](qa)|0}else{c[ga>>2]=V+4}V=a[F]|0;if((V&1)==0){hc=(V&255)>>>1}else{hc=c[J>>2]|0}nb=C;ob=S;pb=q;qb=R;rb=hc>>>0>1?x:T;sb=U;break};case 1:{if((o|0)==3){aa=S;ba=q;ca=T;da=U;Z=292;break a}V=c[g>>2]|0;ga=c[V+12>>2]|0;if((ga|0)==(c[V+16>>2]|0)){ic=Cc[c[(c[V>>2]|0)+36>>2]&63](V)|0}else{ic=c[ga>>2]|0}if(!(wc[c[(c[r>>2]|0)+12>>2]&31](l,8192,ic)|0)){Z=27;break a}ga=c[g>>2]|0;V=ga+12|0;qa=c[V>>2]|0;if((qa|0)==(c[ga+16>>2]|0)){jc=Cc[c[(c[ga>>2]|0)+40>>2]&63](ga)|0}else{c[V>>2]=qa+4;jc=c[qa>>2]|0}Re(z,jc);Z=28;break};case 0:{Z=28;break};default:{nb=C;ob=S;pb=q;qb=R;rb=T;sb=U}}}while(0);g:do{if((Z|0)==28){Z=0;if((o|0)==3){aa=S;ba=q;ca=T;da=U;Z=292;break a}else{kc=$;lc=$}while(1){qa=c[g>>2]|0;do{if((qa|0)==0){mc=1}else{V=c[qa+12>>2]|0;if((V|0)==(c[qa+16>>2]|0)){nc=Cc[c[(c[qa>>2]|0)+36>>2]&63](qa)|0}else{nc=c[V>>2]|0}if((nc|0)==-1){c[g>>2]=0;mc=1;break}else{mc=(c[g>>2]|0)==0;break}}}while(0);do{if((lc|0)==0){oc=kc;Z=42}else{qa=c[lc+12>>2]|0;if((qa|0)==(c[lc+16>>2]|0)){pc=Cc[c[(c[lc>>2]|0)+36>>2]&63](lc)|0}else{pc=c[qa>>2]|0}if((pc|0)==-1){c[b>>2]=0;oc=0;Z=42;break}else{if(mc^(kc|0)==0){qc=kc;rc=kc;break}else{nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break g}}}}while(0);if((Z|0)==42){Z=0;if(mc){nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break g}else{qc=oc;rc=0}}qa=c[g>>2]|0;V=c[qa+12>>2]|0;if((V|0)==(c[qa+16>>2]|0)){sc=Cc[c[(c[qa>>2]|0)+36>>2]&63](qa)|0}else{sc=c[V>>2]|0}if(!(wc[c[(c[r>>2]|0)+12>>2]&31](l,8192,sc)|0)){nb=C;ob=S;pb=q;qb=R;rb=T;sb=U;break g}V=c[g>>2]|0;qa=V+12|0;ga=c[qa>>2]|0;if((ga|0)==(c[V+16>>2]|0)){tc=Cc[c[(c[V>>2]|0)+40>>2]&63](V)|0}else{c[qa>>2]=ga+4;tc=c[ga>>2]|0}Re(z,tc);kc=qc;lc=rc}}}while(0);Ea=o+1|0;if(Ea>>>0<4){R=qb;q=pb;S=ob;C=nb;o=Ea;T=rb;U=sb}else{aa=ob;ba=pb;ca=rb;da=sb;Z=292;break}}h:do{if((Z|0)==27){c[j>>2]=c[j>>2]|4;uc=0;vc=S;xc=U}else if((Z|0)==116){c[j>>2]=c[j>>2]|4;uc=0;vc=S;xc=U}else if((Z|0)==174){c[j>>2]=c[j>>2]|4;uc=0;vc=S;xc=U}else if((Z|0)==198){$m()}else if((Z|0)==214){$m()}else if((Z|0)==225){$m()}else if((Z|0)==248){c[j>>2]=c[j>>2]|4;uc=0;vc=Ja;xc=Ma}else if((Z|0)==271){c[j>>2]=c[j>>2]|4;uc=0;vc=Ja;xc=Ma}else if((Z|0)==276){$m()}else if((Z|0)==290){c[j>>2]=c[j>>2]|4;uc=0;vc=Ja;xc=Ma}else if((Z|0)==292){i:do{if((ca|0)!=0){sb=ca;rb=ca+4|0;pb=ca+8|0;ob=1;j:while(1){T=a[sb]|0;if((T&1)==0){yc=(T&255)>>>1}else{yc=c[rb>>2]|0}if(!(ob>>>0<yc>>>0)){break i}T=c[g>>2]|0;do{if((T|0)==0){Ac=1}else{o=c[T+12>>2]|0;if((o|0)==(c[T+16>>2]|0)){Bc=Cc[c[(c[T>>2]|0)+36>>2]&63](T)|0}else{Bc=c[o>>2]|0}if((Bc|0)==-1){c[g>>2]=0;Ac=1;break}else{Ac=(c[g>>2]|0)==0;break}}}while(0);T=c[b>>2]|0;do{if((T|0)==0){Z=311}else{o=c[T+12>>2]|0;if((o|0)==(c[T+16>>2]|0)){Dc=Cc[c[(c[T>>2]|0)+36>>2]&63](T)|0}else{Dc=c[o>>2]|0}if((Dc|0)==-1){c[b>>2]=0;Z=311;break}else{if(Ac){break}else{break j}}}}while(0);if((Z|0)==311){Z=0;if(Ac){break}}T=c[g>>2]|0;o=c[T+12>>2]|0;if((o|0)==(c[T+16>>2]|0)){Ec=Cc[c[(c[T>>2]|0)+36>>2]&63](T)|0}else{Ec=c[o>>2]|0}if((a[sb]&1)==0){Fc=rb}else{Fc=c[pb>>2]|0}if((Ec|0)!=(c[Fc+(ob<<2)>>2]|0)){break}o=ob+1|0;T=c[g>>2]|0;nb=T+12|0;C=c[nb>>2]|0;if((C|0)==(c[T+16>>2]|0)){Cc[c[(c[T>>2]|0)+40>>2]&63](T)|0;ob=o;continue}else{c[nb>>2]=C+4;ob=o;continue}}c[j>>2]=c[j>>2]|4;uc=0;vc=aa;xc=da;break h}}while(0);if((aa|0)==(ba|0)){uc=1;vc=ba;xc=da;break}c[B>>2]=0;rj(v,aa,ba,B);if((c[B>>2]|0)==0){uc=1;vc=aa;xc=da;break}c[j>>2]=c[j>>2]|4;uc=0;vc=aa;xc=da}}while(0);Ne(z);Ne(y);Ne(x);Ne(w);Be(v);if((vc|0)==0){i=p;return uc|0}zc[xc&127](vc);i=p;return uc|0}function wj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+464|0;l=d;m=d+8|0;n=d+24|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=o;c[t>>2]=n;u=o+4|0;c[u>>2]=114;v=n+400|0;We(q,h);n=q;w=c[n>>2]|0;if(!((c[1288]|0)==-1)){c[m>>2]=5152;c[m+4>>2]=112;c[m+8>>2]=0;we(5152,m,113)}m=(c[5156>>2]|0)+ -1|0;x=c[w+8>>2]|0;if(!((c[w+12>>2]|0)-x>>2>>>0>m>>>0)){y=Bb(4)|0;z=y;um(z);oc(y|0,13120,101)}w=c[x+(m<<2)>>2]|0;if((w|0)==0){y=Bb(4)|0;z=y;um(z);oc(y|0,13120,101)}y=w;a[r]=0;z=f;f=c[z>>2]|0;c[s>>2]=f;m=c[h+4>>2]|0;h=l;x=s;c[h+0>>2]=c[x+0>>2];x=vj(e,l,g,q,m,j,r,y,o,p,v)|0;if(x){x=k;if((a[x]&1)==0){c[k+4>>2]=0;a[x]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}x=w;if((a[r]|0)!=0){Re(k,Lc[c[(c[x>>2]|0)+44>>2]&15](y,45)|0)}r=Lc[c[(c[x>>2]|0)+44>>2]&15](y,48)|0;y=c[t>>2]|0;x=c[p>>2]|0;p=x+ -4|0;a:do{if(y>>>0<p>>>0){w=y;while(1){v=w+4|0;if((c[w>>2]|0)!=(r|0)){A=w;break a}if(v>>>0<p>>>0){w=v}else{A=v;break}}}else{A=y}}while(0);xj(k,A,x)|0}x=e;e=c[x>>2]|0;do{if((e|0)==0){B=1}else{A=c[e+12>>2]|0;if((A|0)==(c[e+16>>2]|0)){C=Cc[c[(c[e>>2]|0)+36>>2]&63](e)|0}else{C=c[A>>2]|0}if((C|0)==-1){c[x>>2]=0;B=1;break}else{B=(c[x>>2]|0)==0;break}}}while(0);do{if((f|0)==0){D=29}else{C=c[f+12>>2]|0;if((C|0)==(c[f+16>>2]|0)){E=Cc[c[(c[f>>2]|0)+36>>2]&63](f)|0}else{E=c[C>>2]|0}if((E|0)==-1){c[z>>2]=0;D=29;break}else{if(B){break}else{D=31;break}}}}while(0);if((D|0)==29){if(B){D=31}}if((D|0)==31){c[j>>2]=c[j>>2]|2}c[b>>2]=c[x>>2];ce(c[n>>2]|0)|0;n=c[t>>2]|0;c[t>>2]=0;if((n|0)==0){i=d;return}zc[c[u>>2]&127](n);i=d;return}function xj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;g=b;h=d;j=a[g]|0;if((j&1)==0){k=(j&255)>>>1;l=j;m=1}else{j=c[b>>2]|0;k=c[b+4>>2]|0;l=j&255;m=(j&-2)+ -1|0}j=e-h>>2;if((j|0)==0){i=f;return b|0}if((m-k|0)>>>0<j>>>0){Te(b,m,k+j-m|0,k,k,0,0);n=a[g]|0}else{n=l}if((n&1)==0){o=b+4|0}else{o=c[b+8>>2]|0}n=o+(k<<2)|0;if((d|0)==(e|0)){p=n}else{l=k+((e+ -4+(0-h)|0)>>>2)+1|0;h=d;d=n;while(1){c[d>>2]=c[h>>2];n=h+4|0;if((n|0)==(e|0)){break}else{d=d+4|0;h=n}}p=o+(l<<2)|0}c[p>>2]=0;p=k+j|0;if((a[g]&1)==0){a[g]=p<<1;i=f;return b|0}else{c[b+4>>2]=p;i=f;return b|0}return 0}function yj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;n=i;i=i+176|0;o=n;p=n+16|0;q=n+32|0;r=n+40|0;s=n+56|0;t=n+72|0;u=n+88|0;v=n+104|0;w=n+112|0;x=n+128|0;y=n+144|0;z=n+160|0;if(b){b=c[d>>2]|0;if(!((c[1182]|0)==-1)){c[p>>2]=4728;c[p+4>>2]=112;c[p+8>>2]=0;we(4728,p,113)}p=(c[4732>>2]|0)+ -1|0;A=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-A>>2>>>0>p>>>0)){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}b=c[A+(p<<2)>>2]|0;if((b|0)==0){B=Bb(4)|0;C=B;um(C);oc(B|0,13120,101)}B=b;Ac[c[(c[b>>2]|0)+44>>2]&63](q,B);C=e;p=c[q>>2]|0;a[C]=p;a[C+1|0]=p>>8;a[C+2|0]=p>>16;a[C+3|0]=p>>24;p=b;Ac[c[(c[p>>2]|0)+32>>2]&63](r,B);C=l;if((a[C]&1)==0){c[l+4>>2]=0;a[C]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Qe(l,0);q=r;c[C+0>>2]=c[q+0>>2];c[C+4>>2]=c[q+4>>2];c[C+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Ne(r);Ac[c[(c[p>>2]|0)+28>>2]&63](s,B);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Qe(k,0);q=s;c[r+0>>2]=c[q+0>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Ne(s);s=b;q=Cc[c[(c[s>>2]|0)+12>>2]&63](B)|0;c[f>>2]=q;q=Cc[c[(c[s>>2]|0)+16>>2]&63](B)|0;c[g>>2]=q;Ac[c[(c[b>>2]|0)+20>>2]&63](t,B);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ge(h,0);q=t;c[b+0>>2]=c[q+0>>2];c[b+4>>2]=c[q+4>>2];c[b+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Be(t);Ac[c[(c[p>>2]|0)+24>>2]&63](u,B);p=j;if((a[p]&1)==0){c[j+4>>2]=0;a[p]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}Qe(j,0);t=u;c[p+0>>2]=c[t+0>>2];c[p+4>>2]=c[t+4>>2];c[p+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;Ne(u);D=Cc[c[(c[s>>2]|0)+36>>2]&63](B)|0;c[m>>2]=D;i=n;return}else{B=c[d>>2]|0;if(!((c[1166]|0)==-1)){c[o>>2]=4664;c[o+4>>2]=112;c[o+8>>2]=0;we(4664,o,113)}o=(c[4668>>2]|0)+ -1|0;d=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-d>>2>>>0>o>>>0)){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}B=c[d+(o<<2)>>2]|0;if((B|0)==0){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}E=B;Ac[c[(c[B>>2]|0)+44>>2]&63](v,E);F=e;e=c[v>>2]|0;a[F]=e;a[F+1|0]=e>>8;a[F+2|0]=e>>16;a[F+3|0]=e>>24;e=B;Ac[c[(c[e>>2]|0)+32>>2]&63](w,E);F=l;if((a[F]&1)==0){c[l+4>>2]=0;a[F]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Qe(l,0);l=w;c[F+0>>2]=c[l+0>>2];c[F+4>>2]=c[l+4>>2];c[F+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;Ne(w);Ac[c[(c[e>>2]|0)+28>>2]&63](x,E);w=k;if((a[w]&1)==0){c[k+4>>2]=0;a[w]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Qe(k,0);k=x;c[w+0>>2]=c[k+0>>2];c[w+4>>2]=c[k+4>>2];c[w+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;Ne(x);x=B;k=Cc[c[(c[x>>2]|0)+12>>2]&63](E)|0;c[f>>2]=k;k=Cc[c[(c[x>>2]|0)+16>>2]&63](E)|0;c[g>>2]=k;Ac[c[(c[B>>2]|0)+20>>2]&63](y,E);B=h;if((a[B]&1)==0){a[h+1|0]=0;a[B]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ge(h,0);h=y;c[B+0>>2]=c[h+0>>2];c[B+4>>2]=c[h+4>>2];c[B+8>>2]=c[h+8>>2];c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Be(y);Ac[c[(c[e>>2]|0)+24>>2]&63](z,E);e=j;if((a[e]&1)==0){c[j+4>>2]=0;a[e]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}Qe(j,0);j=z;c[e+0>>2]=c[j+0>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Ne(z);D=Cc[c[(c[x>>2]|0)+36>>2]&63](E)|0;c[m>>2]=D;i=n;return}}function zj(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Aj(a){a=a|0;i=i;return}function Bj(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+16|0;m=d;n=d+8|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+104|0;r=i;i=i+8|0;s=i;i=i+104|0;t=i;i=i+8|0;u=i;i=i+8|0;v=u;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+16|0;B=i;i=i+8|0;C=i;i=i+104|0;D=i;i=i+8|0;E=i;i=i+8|0;F=i;i=i+8|0;G=q;c[r>>2]=G;q=s;s=o;h[k>>3]=l;c[s>>2]=c[k>>2];c[s+4>>2]=c[k+4>>2];s=Hb(G|0,100,4912,o|0)|0;do{if(s>>>0>99){do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}o=ib(2147483647,5064,0)|0;c[1262]=o;eb(5056)}}while(0);o=c[1262]|0;G=n;h[k>>3]=l;c[G>>2]=c[k>>2];c[G+4>>2]=c[k+4>>2];G=wh(r,o,4912,n)|0;o=c[r>>2]|0;if((o|0)==0){$m()}H=Pm(G)|0;if((H|0)!=0){I=o;J=H;K=H;L=G;break}$m()}else{I=0;J=0;K=q;L=s}}while(0);We(t,g);s=t;q=c[s>>2]|0;if(!((c[1290]|0)==-1)){c[p>>2]=5160;c[p+4>>2]=112;c[p+8>>2]=0;we(5160,p,113)}p=(c[5164>>2]|0)+ -1|0;n=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-n>>2>>>0>p>>>0)){M=Bb(4)|0;N=M;um(N);oc(M|0,13120,101)}q=c[n+(p<<2)>>2]|0;if((q|0)==0){M=Bb(4)|0;N=M;um(N);oc(M|0,13120,101)}M=q;N=c[r>>2]|0;Ic[c[(c[q>>2]|0)+32>>2]&7](M,N,N+L|0,K)|0;if((L|0)==0){O=0}else{O=(a[c[r>>2]|0]|0)==45}c[u>>2]=0;u=y;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;u=z;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;r=A;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Cj(f,O,t,v,w,x,y,z,A,B);t=C;C=c[B>>2]|0;if((L|0)>(C|0)){B=a[r]|0;if((B&1)==0){P=(B&255)>>>1}else{P=c[A+4>>2]|0}B=a[u]|0;if((B&1)==0){Q=(B&255)>>>1}else{Q=c[z+4>>2]|0}R=P+(L-C<<1|1)+Q|0}else{Q=a[r]|0;if((Q&1)==0){S=(Q&255)>>>1}else{S=c[A+4>>2]|0}Q=a[u]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[z+4>>2]|0}R=S+2+T|0}T=R+C|0;do{if(T>>>0>100){R=Pm(T)|0;if((R|0)!=0){U=R;V=R;break}$m()}else{U=0;V=t}}while(0);Dj(V,D,E,c[g+4>>2]|0,K,K+L|0,M,O,v,a[w]|0,a[x]|0,y,z,A,C);c[F>>2]=c[e>>2];e=c[D>>2]|0;D=c[E>>2]|0;E=m;C=F;c[E+0>>2]=c[C+0>>2];ed(b,m,V,e,D,g,j);if((U|0)!=0){Qm(U)}Be(A);Be(z);Be(y);ce(c[s>>2]|0)|0;if((J|0)!=0){Qm(J)}if((I|0)==0){i=d;return}Qm(I);i=d;return}function Cj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;n=i;i=i+40|0;o=n;p=n+16|0;q=n+32|0;r=q;s=i;i=i+16|0;t=i;i=i+8|0;u=t;v=i;i=i+16|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+8|0;z=y;A=i;i=i+16|0;B=i;i=i+8|0;C=B;D=i;i=i+16|0;E=i;i=i+16|0;F=i;i=i+16|0;G=c[e>>2]|0;if(b){if(!((c[1150]|0)==-1)){c[p>>2]=4600;c[p+4>>2]=112;c[p+8>>2]=0;we(4600,p,113)}p=(c[4604>>2]|0)+ -1|0;b=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-b>>2>>>0>p>>>0)){H=Bb(4)|0;I=H;um(I);oc(H|0,13120,101)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){H=Bb(4)|0;I=H;um(I);oc(H|0,13120,101)}H=e;I=c[e>>2]|0;if(d){Ac[c[I+44>>2]&63](r,H);r=f;p=c[q>>2]|0;a[r]=p;a[r+1|0]=p>>8;a[r+2|0]=p>>16;a[r+3|0]=p>>24;Ac[c[(c[e>>2]|0)+32>>2]&63](s,H);p=l;if((a[p]&1)==0){a[l+1|0]=0;a[p]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ge(l,0);r=s;c[p+0>>2]=c[r+0>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Be(s)}else{Ac[c[I+40>>2]&63](u,H);u=f;I=c[t>>2]|0;a[u]=I;a[u+1|0]=I>>8;a[u+2|0]=I>>16;a[u+3|0]=I>>24;Ac[c[(c[e>>2]|0)+28>>2]&63](v,H);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ge(l,0);u=v;c[I+0>>2]=c[u+0>>2];c[I+4>>2]=c[u+4>>2];c[I+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;Be(v)}v=e;u=Cc[c[(c[v>>2]|0)+12>>2]&63](H)|0;a[g]=u;u=Cc[c[(c[v>>2]|0)+16>>2]&63](H)|0;a[h]=u;u=e;Ac[c[(c[u>>2]|0)+20>>2]&63](w,H);v=j;if((a[v]&1)==0){a[j+1|0]=0;a[v]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ge(j,0);I=w;c[v+0>>2]=c[I+0>>2];c[v+4>>2]=c[I+4>>2];c[v+8>>2]=c[I+8>>2];c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;Be(w);Ac[c[(c[u>>2]|0)+24>>2]&63](x,H);u=k;if((a[u]&1)==0){a[k+1|0]=0;a[u]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ge(k,0);w=x;c[u+0>>2]=c[w+0>>2];c[u+4>>2]=c[w+4>>2];c[u+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;Be(x);J=Cc[c[(c[e>>2]|0)+36>>2]&63](H)|0;c[m>>2]=J;i=n;return}else{if(!((c[1134]|0)==-1)){c[o>>2]=4536;c[o+4>>2]=112;c[o+8>>2]=0;we(4536,o,113)}o=(c[4540>>2]|0)+ -1|0;H=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-H>>2>>>0>o>>>0)){K=Bb(4)|0;L=K;um(L);oc(K|0,13120,101)}G=c[H+(o<<2)>>2]|0;if((G|0)==0){K=Bb(4)|0;L=K;um(L);oc(K|0,13120,101)}K=G;L=c[G>>2]|0;if(d){Ac[c[L+44>>2]&63](z,K);z=f;d=c[y>>2]|0;a[z]=d;a[z+1|0]=d>>8;a[z+2|0]=d>>16;a[z+3|0]=d>>24;Ac[c[(c[G>>2]|0)+32>>2]&63](A,K);d=l;if((a[d]&1)==0){a[l+1|0]=0;a[d]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ge(l,0);z=A;c[d+0>>2]=c[z+0>>2];c[d+4>>2]=c[z+4>>2];c[d+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;Be(A)}else{Ac[c[L+40>>2]&63](C,K);C=f;f=c[B>>2]|0;a[C]=f;a[C+1|0]=f>>8;a[C+2|0]=f>>16;a[C+3|0]=f>>24;Ac[c[(c[G>>2]|0)+28>>2]&63](D,K);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ge(l,0);l=D;c[f+0>>2]=c[l+0>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;Be(D)}D=G;l=Cc[c[(c[D>>2]|0)+12>>2]&63](K)|0;a[g]=l;l=Cc[c[(c[D>>2]|0)+16>>2]&63](K)|0;a[h]=l;l=G;Ac[c[(c[l>>2]|0)+20>>2]&63](E,K);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ge(j,0);j=E;c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Be(E);Ac[c[(c[l>>2]|0)+24>>2]&63](F,K);l=k;if((a[l]&1)==0){a[k+1|0]=0;a[l]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ge(k,0);k=F;c[l+0>>2]=c[k+0>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;Be(F);J=Cc[c[(c[G>>2]|0)+36>>2]&63](K)|0;c[m>>2]=J;i=n;return}}function Dj(d,e,f,g,h,j,k,l,m,n,o,p,q,r,s){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;var t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0;t=i;c[f>>2]=d;u=k;v=r;w=r+1|0;x=r+8|0;y=r+4|0;r=q;z=(g&512|0)==0;A=q+1|0;B=q+8|0;C=q+4|0;q=(s|0)>0;D=p;E=p+1|0;F=p+8|0;G=p+4|0;p=k+8|0;H=0-s|0;I=h;h=0;while(1){a:do{switch(a[m+h|0]|0){case 0:{c[e>>2]=c[f>>2];J=I;break};case 1:{c[e>>2]=c[f>>2];K=Lc[c[(c[u>>2]|0)+28>>2]&15](k,32)|0;L=c[f>>2]|0;c[f>>2]=L+1;a[L]=K;J=I;break};case 3:{K=a[v]|0;L=(K&1)==0;if(L){M=(K&255)>>>1}else{M=c[y>>2]|0}if((M|0)==0){J=I;break a}if(L){N=w}else{N=c[x>>2]|0}L=a[N]|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=L;J=I;break};case 4:{L=c[f>>2]|0;K=l?I+1|0:I;b:do{if(K>>>0<j>>>0){O=K;while(1){P=a[O]|0;if(!(P<<24>>24>-1)){Q=O;break b}R=O+1|0;if((b[(c[p>>2]|0)+(P<<24>>24<<1)>>1]&2048)==0){Q=O;break b}if(R>>>0<j>>>0){O=R}else{Q=R;break}}}else{Q=K}}while(0);O=Q;if(q){if(Q>>>0>K>>>0){R=K+(0-O)|0;O=R>>>0<H>>>0?H:R;R=O+s|0;P=L;S=Q;T=s;while(1){U=S+ -1|0;V=a[U]|0;c[f>>2]=P+1;a[P]=V;V=T+ -1|0;W=(V|0)>0;if(!(U>>>0>K>>>0&W)){break}P=c[f>>2]|0;T=V;S=U}S=Q+O|0;if(W){X=S;Y=R;Z=32}else{_=0;$=S;aa=R}}else{X=Q;Y=s;Z=32}if((Z|0)==32){Z=0;_=Lc[c[(c[u>>2]|0)+28>>2]&15](k,48)|0;$=X;aa=Y}S=c[f>>2]|0;c[f>>2]=S+1;if((aa|0)>0){T=S;P=aa;while(1){a[T]=_;U=P+ -1|0;V=c[f>>2]|0;c[f>>2]=V+1;if((U|0)>0){P=U;T=V}else{ba=V;break}}}else{ba=S}a[ba]=n;ca=$}else{ca=Q}if((ca|0)==(K|0)){T=Lc[c[(c[u>>2]|0)+28>>2]&15](k,48)|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=T}else{T=a[D]|0;P=(T&1)==0;if(P){da=(T&255)>>>1}else{da=c[G>>2]|0}if((da|0)==0){ea=ca;fa=-1;ga=0;ha=0}else{if(P){ia=E}else{ia=c[F>>2]|0}ea=ca;fa=a[ia]|0;ga=0;ha=0}while(1){do{if((ha|0)==(fa|0)){P=c[f>>2]|0;c[f>>2]=P+1;a[P]=o;P=ga+1|0;T=a[D]|0;R=(T&1)==0;if(R){ja=(T&255)>>>1}else{ja=c[G>>2]|0}if(!(P>>>0<ja>>>0)){ka=fa;la=P;ma=0;break}if(R){na=E}else{na=c[F>>2]|0}if((a[na+P|0]|0)==127){ka=-1;la=P;ma=0;break}if(R){oa=E}else{oa=c[F>>2]|0}ka=a[oa+P|0]|0;la=P;ma=0}else{ka=fa;la=ga;ma=ha}}while(0);P=ea+ -1|0;R=a[P]|0;T=c[f>>2]|0;c[f>>2]=T+1;a[T]=R;if((P|0)==(K|0)){break}else{ea=P;fa=ka;ga=la;ha=ma+1|0}}}S=c[f>>2]|0;if((L|0)==(S|0)){J=K;break a}P=S+ -1|0;if(P>>>0>L>>>0){pa=L;qa=P}else{J=K;break a}while(1){P=a[pa]|0;a[pa]=a[qa]|0;a[qa]=P;P=pa+1|0;S=qa+ -1|0;if(P>>>0<S>>>0){qa=S;pa=P}else{J=K;break}}break};case 2:{K=a[r]|0;L=(K&1)==0;if(L){ra=(K&255)>>>1}else{ra=c[C>>2]|0}if((ra|0)==0|z){J=I;break a}if(L){sa=A;ta=(K&255)>>>1}else{sa=c[B>>2]|0;ta=c[C>>2]|0}K=sa+ta|0;L=c[f>>2]|0;if((sa|0)==(K|0)){ua=L}else{P=L;L=sa;while(1){a[P]=a[L]|0;S=L+1|0;R=P+1|0;if((S|0)==(K|0)){ua=R;break}else{L=S;P=R}}}c[f>>2]=ua;J=I;break};default:{J=I}}}while(0);P=h+1|0;if((P|0)==4){break}else{I=J;h=P}}h=a[v]|0;v=(h&1)==0;if(v){va=(h&255)>>>1}else{va=c[y>>2]|0}if(va>>>0>1){if(v){wa=w;xa=(h&255)>>>1}else{wa=c[x>>2]|0;xa=c[y>>2]|0}y=wa+1|0;x=wa+xa|0;xa=c[f>>2]|0;if((y|0)==(x|0)){ya=xa}else{wa=xa;xa=y;while(1){a[wa]=a[xa]|0;y=xa+1|0;h=wa+1|0;if((y|0)==(x|0)){ya=h;break}else{xa=y;wa=h}}}c[f>>2]=ya}ya=g&176;if((ya|0)==32){c[e>>2]=c[f>>2];i=t;return}else if((ya|0)==16){i=t;return}else{c[e>>2]=d;i=t;return}}



function Oc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Pc(){return i|0}function Qc(a){a=a|0;i=a}function Rc(a,b){a=a|0;b=b|0;if((t|0)==0){t=a;u=b}}function Sc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Tc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Uc(a){a=a|0;I=a}function Vc(a){a=a|0;J=a}function Wc(a){a=a|0;K=a}function Xc(a){a=a|0;L=a}function Yc(a){a=a|0;M=a}function Zc(a){a=a|0;N=a}function _c(a){a=a|0;O=a}function $c(a){a=a|0;P=a}function ad(a){a=a|0;Q=a}function bd(a){a=a|0;R=a}function cd(a){a=a|0;Ma(a|0)|0;Ea()}function dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+40|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;Of(h,b);if((a[h]|0)==0){Pf(h);i=e;return b|0}l=qn(d|0)|0;m=b;n=c[(c[m>>2]|0)+ -12>>2]|0;o=b;c[j>>2]=c[o+(n+24)>>2];if((c[o+(n+4)>>2]&176|0)==32){p=d+l|0}else{p=d}q=o+n|0;r=o+(n+76)|0;n=c[r>>2]|0;if((n|0)==-1){s=q;We(g,s);t=dk(g,5160)|0;u=Lc[c[(c[t>>2]|0)+28>>2]&15](t,32)|0;ck(g);g=u<<24>>24;c[r>>2]=g;v=s;w=g}else{v=q;w=n}n=w&255;w=d+l|0;l=f;q=j;c[l+0>>2]=c[q+0>>2];ed(k,f,d,p,w,v,n);if((c[k>>2]|0)!=0){Pf(h);i=e;return b|0}k=c[(c[m>>2]|0)+ -12>>2]|0;Ue(o+k|0,c[o+(k+16)>>2]|5);Pf(h);i=e;return b|0}function ed(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=k;m=d;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((wc[c[(c[d>>2]|0)+48>>2]&31](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){Ae(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((wc[c[(c[d>>2]|0)+48>>2]&31](d,r,q)|0)==(q|0)){Ce(l);break}c[m>>2]=0;c[b>>2]=0;Ce(l);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((wc[c[(c[d>>2]|0)+48>>2]&31](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function fd(a,b,c,d,e){a=a|0;b=+b;c=+c;d=+d;e=+e;var f=0;f=i;g[a+116>>2]=b>180.0?180.0:b;g[a+104>>2]=c;g[a+108>>2]=d<9999999747378752.0e-21?9999999747378752.0e-21:d;g[a+112>>2]=e;hd(a);i=f;return}function gd(a){a=a|0;var b=0,c=0.0,d=0,e=0.0,f=0.0;b=i;c=1.0/+Y(+(+md(+g[a+116>>2])*.5));d=a+448|0;kd(d)|0;g[d>>2]=c/+g[a+104>>2];g[a+468>>2]=c;c=+g[a+112>>2];e=+g[a+108>>2];f=e-c;g[a+488>>2]=(c+e)/f;g[a+504>>2]=c*2.0*e/f;g[a+492>>2]=-1.0;g[a+508>>2]=1.0;i=b;return}function hd(a){a=a|0;var b=0;b=i;jd(a+448|0)|0;gd(a);i=b;return}function id(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+0|0;e=d+60|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(e|0));g[a>>2]=1.0;g[a+20>>2]=1.0;g[a+40>>2]=1.0;g[a+60>>2]=1.0;i=b;return}function jd(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+0|0;e=d+64|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(e|0));i=b;return a|0}function kd(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+0|0;e=d+60|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(e|0));g[a>>2]=1.0;g[a+20>>2]=1.0;g[a+40>>2]=1.0;g[a+60>>2]=1.0;i=b;return a|0}function ld(){a[233|0]=44;i=i;return}function md(a){a=+a;i=i;return+(a/180.0*3.141592653589793)}function nd(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,j=0;a=i;i=i+48|0;b=a;do{if((ac(b|0)|0)!=0){d=b;e=b;f=b;g=0;a:while(1){while(1){h=c[d>>2]|0;if((h|0)==1024){td(c[72]|0,e)}else if((h|0)==1025){ud(c[72]|0,f)}else if((h|0)==1026){vd(c[72]|0,f)}else if((h|0)==768){break}if((ac(b|0)|0)==0){j=10;break a}}if((ac(b|0)|0)==0){break}else{g=1}}if((j|0)==10){if(!g){break}}ab(0)|0;ec()}}while(0);rd(c[72]|0);qc();i=a;return}function od(a,b){a=a|0;b=b|0;var d=0;b=i;if((Gb(32)|0)!=0){a=dd(600,296)|0;dd(dd(a,Ka()|0)|0,384)|0;d=1;i=b;return d|0}_a(5,1)|0;if((sb(720,576,16,67108864)|0)==0){a=dd(600,392)|0;dd(dd(a,Ka()|0)|0,384)|0;d=1;i=b;return d|0}else{mb(2929);a=Um(108)|0;pd(a);c[72]=a;qd(a,720,576);lc(1,0,1);Kb();d=0;i=b;return d|0}return 0}function pd(b){b=b|0;var d=0,e=0;d=i;id(b+28|0);e=b+96|0;g[k>>2]=0.0;a[e]=a[k];a[e+1|0]=a[k+1|0];a[e+2|0]=a[k+2|0];a[e+3|0]=a[k+3|0];e=b+100|0;g[k>>2]=0.0;a[e]=a[k];a[e+1|0]=a[k+1|0];a[e+2|0]=a[k+2|0];a[e+3|0]=a[k+3|0];e=b+104|0;g[k>>2]=0.0;a[e]=a[k];a[e+1|0]=a[k+1|0];a[e+2|0]=a[k+2|0];a[e+3|0]=a[k+3|0];a[b+8|0]=0;c[b>>2]=0;c[b+4>>2]=0;pc(1,1,1,0);cc(16640);mb(2929);Eb(.4000000059604645,.4000000059604645,.4000000059604645,1.0);i=d;return}function qd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;gb(0,0,b|0,d|0);fd(c[a+92>>2]|0,45.0,+(b|0)/+(d|0),.05000000074505806,350.0);i=e;return}function rd(a){a=a|0;a=i;cc(16640);i=a;return}function sd(a){a=a|0;i=i;return}function td(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0;e=i;do{if((a[b+8|0]|0)!=0){if((a[d+8|0]&1)==0){break}f=d+12|0;h=b+12|0;j=(c[f>>2]|0)-(c[h>>2]|0)|0;l=d+16|0;m=b+16|0;n=b;c[n>>2]=~~(+(c[n>>2]|0)+ +((c[l>>2]|0)-(c[m>>2]|0)|0)*.5);n=b+4|0;c[n>>2]=~~(+(j|0)*.5+ +(c[n>>2]|0));c[h>>2]=c[f>>2];c[m>>2]=c[l>>2];cc(16640);i=e;return}}while(0);if((a[b+9|0]|0)==0){i=e;return}if((a[d+8|0]&4)==0){i=e;return}l=c[d+12>>2]|0;m=b+20|0;f=l-(c[m>>2]|0)|0;h=d+16|0;d=b+24|0;n=(c[h>>2]|0)-(c[d>>2]|0)|0;c[m>>2]=l;c[d>>2]=c[h>>2];h=b+96|0;a[k]=a[h];a[k+1|0]=a[h+1|0];a[k+2|0]=a[h+2|0];a[k+3|0]=a[h+3|0];g[k>>2]=+(f|0)*.009999999776482582+ +g[k>>2];a[h]=a[k];a[h+1|0]=a[k+1|0];a[h+2|0]=a[k+2|0];a[h+3|0]=a[k+3|0];h=b+100|0;a[k]=a[h];a[k+1|0]=a[h+1|0];a[k+2|0]=a[h+2|0];a[k+3|0]=a[h+3|0];g[k>>2]=+g[k>>2]- +(n|0)*.009999999776482582;a[h]=a[k];a[h+1|0]=a[k+1|0];a[h+2|0]=a[k+2|0];a[h+3|0]=a[k+3|0];cc(16640);i=e;return}function ud(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=a[d+8|0]|0;if(f<<24>>24==1){c[b+12>>2]=c[d+12>>2];c[b+16>>2]=c[d+16>>2];a[b+8|0]=1;i=e;return}else if(f<<24>>24==3){c[b+20>>2]=c[d+12>>2];c[b+24>>2]=c[d+16>>2];a[b+9|0]=1;i=e;return}else{i=e;return}}function vd(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=i;e=c+8|0;c=a[e]|0;if(c<<24>>24==1){a[b+8|0]=0;f=a[e]|0}else{f=c}if(!(f<<24>>24==3)){i=d;return}a[b+9|0]=0;i=d;return}function wd(a,b){a=a|0;b=b|0;i=i;return}function xd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b;e=b+8|0;f=b+16|0;g=b+24|0;h=c[r>>2]|0;Td(1136,h,1192);c[106]=2564;c[432>>2]=2584;c[428>>2]=0;Xe(432|0,1136);c[504>>2]=0;c[508>>2]=-1;j=c[s>>2]|0;c[310]=2432;ak(1244|0);c[1248>>2]=0;c[1252>>2]=0;c[1256>>2]=0;c[1260>>2]=0;c[1264>>2]=0;c[1268>>2]=0;c[310]=1752;c[1272>>2]=j;bk(g,1244|0);k=dk(g,5224)|0;l=k;ck(g);c[1276>>2]=l;c[1280>>2]=1200;g=(Cc[c[(c[k>>2]|0)+28>>2]&63](l)|0)&1;a[1284|0]=g;c[128]=2644;c[516>>2]=2664;Xe(516|0,1240);c[588>>2]=0;c[592>>2]=-1;g=c[q>>2]|0;c[322]=2432;ak(1292|0);c[1296>>2]=0;c[1300>>2]=0;c[1304>>2]=0;c[1308>>2]=0;c[1312>>2]=0;c[1316>>2]=0;c[322]=1752;c[1320>>2]=g;bk(f,1292|0);l=dk(f,5224)|0;k=l;ck(f);c[1324>>2]=k;c[1328>>2]=1208;f=(Cc[c[(c[l>>2]|0)+28>>2]&63](k)|0)&1;a[1332|0]=f;c[150]=2644;c[604>>2]=2664;Xe(604|0,1288);c[676>>2]=0;c[680>>2]=-1;f=c[(c[(c[150]|0)+ -12>>2]|0)+624>>2]|0;c[172]=2644;c[692>>2]=2664;Xe(692|0,f);c[764>>2]=0;c[768>>2]=-1;c[(c[(c[106]|0)+ -12>>2]|0)+496>>2]=512;f=(c[(c[150]|0)+ -12>>2]|0)+604|0;c[f>>2]=c[f>>2]|8192;c[(c[(c[150]|0)+ -12>>2]|0)+672>>2]=512;Fd(1336,h,1216|0);c[194]=2604;c[784>>2]=2624;c[780>>2]=0;Xe(784|0,1336);c[856>>2]=0;c[860>>2]=-1;c[348]=2496;ak(1396|0);c[1400>>2]=0;c[1404>>2]=0;c[1408>>2]=0;c[1412>>2]=0;c[1416>>2]=0;c[1420>>2]=0;c[348]=1496;c[1424>>2]=j;bk(e,1396|0);j=dk(e,5232)|0;h=j;ck(e);c[1428>>2]=h;c[1432>>2]=1224;e=(Cc[c[(c[j>>2]|0)+28>>2]&63](h)|0)&1;a[1436|0]=e;c[216]=2684;c[868>>2]=2704;Xe(868|0,1392);c[940>>2]=0;c[944>>2]=-1;c[360]=2496;ak(1444|0);c[1448>>2]=0;c[1452>>2]=0;c[1456>>2]=0;c[1460>>2]=0;c[1464>>2]=0;c[1468>>2]=0;c[360]=1496;c[1472>>2]=g;bk(d,1444|0);g=dk(d,5232)|0;e=g;ck(d);c[1476>>2]=e;c[1480>>2]=1232;d=(Cc[c[(c[g>>2]|0)+28>>2]&63](e)|0)&1;a[1484|0]=d;c[238]=2684;c[956>>2]=2704;Xe(956|0,1440);c[1028>>2]=0;c[1032>>2]=-1;d=c[(c[(c[238]|0)+ -12>>2]|0)+976>>2]|0;c[260]=2684;c[1044>>2]=2704;Xe(1044|0,d);c[1116>>2]=0;c[1120>>2]=-1;c[(c[(c[194]|0)+ -12>>2]|0)+848>>2]=864;d=(c[(c[238]|0)+ -12>>2]|0)+956|0;c[d>>2]=c[d>>2]|8192;c[(c[(c[238]|0)+ -12>>2]|0)+1024>>2]=864;i=b;return}function yd(a){a=a|0;a=i;Df(512)|0;Df(688)|0;Jf(864)|0;Jf(1040)|0;i=a;return}function zd(a){a=a|0;var b=0;b=i;c[a>>2]=2496;ck(a+4|0);i=b;return}function Ad(a){a=a|0;var b=0;b=i;c[a>>2]=2496;ck(a+4|0);Wm(a);i=b;return}function Bd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;Cc[c[(c[b>>2]|0)+24>>2]&63](b)|0;f=dk(d,5232)|0;d=f;c[b+36>>2]=d;g=(Cc[c[(c[f>>2]|0)+28>>2]&63](d)|0)&1;a[b+44|0]=g;i=e;return}function Cd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b;e=b+8|0;f=a+36|0;g=a+40|0;h=d;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=Mc[c[(c[a>>2]|0)+20>>2]&15](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((tb(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=5;break}if((l|0)==2){m=-1;n=5;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((Zb(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==5){i=b;return m|0}return 0}function Dd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;if((a[b+44|0]|0)!=0){g=tb(d|0,4,e|0,c[b+32>>2]|0)|0;i=f;return g|0}h=b;if((e|0)>0){j=d;k=0}else{g=0;i=f;return g|0}while(1){if((Lc[c[(c[h>>2]|0)+52>>2]&15](b,c[j>>2]|0)|0)==-1){g=k;l=6;break}d=k+1|0;if((d|0)<(e|0)){j=j+4|0;k=d}else{g=d;l=6;break}}if((l|0)==6){i=f;return g|0}return 0}function Ed(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;a:do{if(!k){c[g>>2]=d;if((a[b+44|0]|0)!=0){if((tb(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f;c[h>>2]=m;n=g+4|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=Hc[c[(c[u>>2]|0)+12>>2]&15](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=12;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(!(v>>>0<2)){l=-1;w=12;break}v=(c[h>>2]|0)-r|0;if((tb(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=12;break}if(u){t=u?c[j>>2]|0:t}else{break a}}if((w|0)==7){if((tb(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==12){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function Fd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+8|0;g=f;h=b;c[h>>2]=2496;j=b+4|0;ak(j);k=b+8|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;c[h>>2]=1608;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;bk(g,j);j=dk(g,5232)|0;e=j;d=b+36|0;c[d>>2]=e;h=Cc[c[(c[j>>2]|0)+24>>2]&63](e)|0;e=b+44|0;c[e>>2]=h;h=c[d>>2]|0;d=(Cc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;a[b+53|0]=d;if((c[e>>2]|0)>8){nj(1704)}else{ck(g);i=f;return}}function Gd(a){a=a|0;var b=0;b=i;c[a>>2]=2496;ck(a+4|0);i=b;return}function Hd(a){a=a|0;var b=0;b=i;c[a>>2]=2496;ck(a+4|0);Wm(a);i=b;return}function Id(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=dk(d,5232)|0;d=f;g=b+36|0;c[g>>2]=d;h=Cc[c[(c[f>>2]|0)+24>>2]&63](d)|0;d=b+44|0;c[d>>2]=h;h=c[g>>2]|0;g=(Cc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;a[b+53|0]=g;if((c[d>>2]|0)>8){nj(1704)}else{i=e;return}}function Jd(a){a=a|0;var b=0,c=0;b=i;c=Md(a,0)|0;i=b;return c|0}function Kd(a){a=a|0;var b=0,c=0;b=i;c=Md(a,1)|0;i=b;return c|0}function Ld(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]|0)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;a:do{if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;p=f;q=Hc[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+4|0,j,p,f+8|0,g)|0;if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}else if((q|0)==1|(q|0)==2){m=-1;i=e;return m|0}q=b+32|0;while(1){o=c[g>>2]|0;if(!(o>>>0>p>>>0)){break a}r=o+ -1|0;c[g>>2]=r;if((Yb(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function Md(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;if((a[k]|0)!=0){l=b+48|0;m=c[l>>2]|0;if(!d){n=m;i=e;return n|0}c[l>>2]=-1;a[k]=0;n=m;i=e;return n|0}m=c[b+44>>2]|0;k=(m|0)>1?m:1;a:do{if((k|0)>0){m=b+32|0;l=0;while(1){o=Rb(c[m>>2]|0)|0;if((o|0)==-1){n=-1;break}a[f+l|0]=o;l=l+1|0;if((l|0)>=(k|0)){break a}}i=e;return n|0}}while(0);b:do{if((a[b+53|0]|0)==0){l=b+40|0;m=b+36|0;o=f;p=g+4|0;q=b+32|0;r=k;while(1){s=c[l>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[m>>2]|0;w=f+r|0;x=Hc[c[(c[t>>2]|0)+16>>2]&15](t,s,o,w,h,g,p,j)|0;if((x|0)==3){y=14;break}else if((x|0)==2){n=-1;y=22;break}else if((x|0)!=1){z=r;break b}x=c[l>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){n=-1;y=22;break}v=Rb(c[q>>2]|0)|0;if((v|0)==-1){n=-1;y=22;break}a[w]=v;r=r+1|0}if((y|0)==14){c[g>>2]=a[o]|0;z=r;break}else if((y|0)==22){i=e;return n|0}}else{c[g>>2]=a[f]|0;z=k}}while(0);if(d){d=c[g>>2]|0;c[b+48>>2]=d;n=d;i=e;return n|0}d=b+32|0;b=z;while(1){if((b|0)<=0){break}z=b+ -1|0;if((Yb(a[f+z|0]|0,c[d>>2]|0)|0)==-1){n=-1;y=22;break}else{b=z}}if((y|0)==22){i=e;return n|0}n=c[g>>2]|0;i=e;return n|0}function Nd(a){a=a|0;var b=0;b=i;c[a>>2]=2432;ck(a+4|0);i=b;return}function Od(a){a=a|0;var b=0;b=i;c[a>>2]=2432;ck(a+4|0);Wm(a);i=b;return}function Pd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;Cc[c[(c[b>>2]|0)+24>>2]&63](b)|0;f=dk(d,5224)|0;d=f;c[b+36>>2]=d;g=(Cc[c[(c[f>>2]|0)+28>>2]&63](d)|0)&1;a[b+44|0]=g;i=e;return}function Qd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b;e=b+8|0;f=a+36|0;g=a+40|0;h=d;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=Mc[c[(c[a>>2]|0)+20>>2]&15](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((tb(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=5;break}if((l|0)==2){m=-1;n=5;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((Zb(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==5){i=b;return m|0}return 0}function Rd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if((a[b+44|0]|0)!=0){h=tb(e|0,1,f|0,c[b+32>>2]|0)|0;i=g;return h|0}j=b;if((f|0)>0){k=e;l=0}else{h=0;i=g;return h|0}while(1){if((Lc[c[(c[j>>2]|0)+52>>2]&15](b,d[k]|0)|0)==-1){h=l;m=6;break}e=l+1|0;if((e|0)<(f|0)){k=k+1|0;l=e}else{h=e;m=6;break}}if((m|0)==6){i=g;return h|0}return 0}function Sd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;a:do{if(!k){a[g]=d;if((a[b+44|0]|0)!=0){if((tb(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f;c[h>>2]=m;n=g+1|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=Hc[c[(c[u>>2]|0)+12>>2]&15](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=12;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(!(v>>>0<2)){l=-1;w=12;break}v=(c[h>>2]|0)-r|0;if((tb(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=12;break}if(u){t=u?c[j>>2]|0:t}else{break a}}if((w|0)==7){if((tb(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==12){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function Td(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+8|0;g=f;h=b;c[h>>2]=2432;j=b+4|0;ak(j);k=b+8|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;c[h>>2]=1864;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;bk(g,j);j=dk(g,5224)|0;e=j;d=b+36|0;c[d>>2]=e;h=Cc[c[(c[j>>2]|0)+24>>2]&63](e)|0;e=b+44|0;c[e>>2]=h;h=c[d>>2]|0;d=(Cc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;a[b+53|0]=d;if((c[e>>2]|0)>8){nj(1704)}else{ck(g);i=f;return}}function Ud(a){a=a|0;var b=0;b=i;c[a>>2]=2432;ck(a+4|0);i=b;return}function Vd(a){a=a|0;var b=0;b=i;c[a>>2]=2432;ck(a+4|0);Wm(a);i=b;return}function Wd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=dk(d,5224)|0;d=f;g=b+36|0;c[g>>2]=d;h=Cc[c[(c[f>>2]|0)+24>>2]&63](d)|0;d=b+44|0;c[d>>2]=h;h=c[g>>2]|0;g=(Cc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;a[b+53|0]=g;if((c[d>>2]|0)>8){nj(1704)}else{i=e;return}}function Xd(a){a=a|0;var b=0,c=0;b=i;c=_d(a,0)|0;i=b;return c|0}function Yd(a){a=a|0;var b=0,c=0;b=i;c=_d(a,1)|0;i=b;return c|0}function Zd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]|0)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;a:do{if(l){a[h]=c[n>>2];o=c[b+36>>2]|0;p=f;q=Hc[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+1|0,j,p,f+8|0,g)|0;if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}else if((q|0)==1|(q|0)==2){m=-1;i=e;return m|0}q=b+32|0;while(1){o=c[g>>2]|0;if(!(o>>>0>p>>>0)){break a}r=o+ -1|0;c[g>>2]=r;if((Yb(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function _d(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+32|0;g=f;h=f+8|0;j=f+16|0;k=f+24|0;l=b+52|0;if((a[l]|0)!=0){m=b+48|0;n=c[m>>2]|0;if(!e){o=n;i=f;return o|0}c[m>>2]=-1;a[l]=0;o=n;i=f;return o|0}n=c[b+44>>2]|0;l=(n|0)>1?n:1;a:do{if((l|0)>0){n=b+32|0;m=0;while(1){p=Rb(c[n>>2]|0)|0;if((p|0)==-1){o=-1;break}a[g+m|0]=p;m=m+1|0;if((m|0)>=(l|0)){break a}}i=f;return o|0}}while(0);b:do{if((a[b+53|0]|0)==0){m=b+40|0;n=b+36|0;p=g;q=h+1|0;r=b+32|0;s=l;while(1){t=c[m>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[n>>2]|0;x=g+s|0;y=Hc[c[(c[u>>2]|0)+16>>2]&15](u,t,p,x,j,h,q,k)|0;if((y|0)==3){z=14;break}else if((y|0)==2){o=-1;z=23;break}else if((y|0)!=1){A=s;break b}y=c[m>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){o=-1;z=23;break}w=Rb(c[r>>2]|0)|0;if((w|0)==-1){o=-1;z=23;break}a[x]=w;s=s+1|0}if((z|0)==14){a[h]=a[p]|0;A=s;break}else if((z|0)==23){i=f;return o|0}}else{a[h]=a[g]|0;A=l}}while(0);do{if(e){l=a[h]|0;c[b+48>>2]=l&255;B=l}else{l=b+32|0;k=A;while(1){if((k|0)<=0){z=21;break}j=k+ -1|0;if((Yb(d[g+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;z=23;break}else{k=j}}if((z|0)==21){B=a[h]|0;break}else if((z|0)==23){i=f;return o|0}}}while(0);o=B&255;i=f;return o|0}function $d(){var a=0;a=i;xd(0);uc(111,1128,p|0)|0;i=a;return}function ae(a){a=a|0;i=i;return}function be(a){a=a|0;var b=0;b=a+4|0;c[b>>2]=(c[b>>2]|0)+1;i=i;return}function ce(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;e=c[d>>2]|0;c[d>>2]=e+ -1;if((e|0)!=0){f=0;i=b;return f|0}zc[c[(c[a>>2]|0)+8>>2]&127](a);f=1;i=b;return f|0}function de(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a>>2]=2008;e=qn(b|0)|0;f=Vm(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[a+4>>2]=g;c[f+8>>2]=0;on(g|0,b|0,e+1|0)|0;i=d;return}function ee(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2008;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Xm((c[d>>2]|0)+ -12|0)}Ta(a|0);Wm(a);i=b;return}function fe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=2008;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)>=0){g=a;Ta(g|0);i=b;return}Xm((c[d>>2]|0)+ -12|0);g=a;Ta(g|0);i=b;return}function ge(a){a=a|0;i=i;return c[a+4>>2]|0}function he(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;c[b>>2]=2032;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=qn(f|0)|0;g=Vm(d+13|0)|0;c[g+4>>2]=d;c[g>>2]=d;h=g+12|0;c[b+4>>2]=h;c[g+8>>2]=0;on(h|0,f|0,d+1|0)|0;i=e;return}function ie(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a>>2]=2032;e=qn(b|0)|0;f=Vm(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[a+4>>2]=g;c[f+8>>2]=0;on(g|0,b|0,e+1|0)|0;i=d;return}function je(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2032;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Xm((c[d>>2]|0)+ -12|0)}Ta(a|0);Wm(a);i=b;return}function ke(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=2032;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)>=0){g=a;Ta(g|0);i=b;return}Xm((c[d>>2]|0)+ -12|0);g=a;Ta(g|0);i=b;return}function le(a){a=a|0;i=i;return c[a+4>>2]|0}function me(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2008;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Xm((c[d>>2]|0)+ -12|0)}Ta(a|0);Wm(a);i=b;return}function ne(a){a=a|0;i=i;return}function oe(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;i=i;return}function pe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e;Ec[c[(c[a>>2]|0)+12>>2]&3](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function qe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;if((c[b+4>>2]|0)!=(a|0)){f=0;i=e;return f|0}f=(c[b>>2]|0)==(d|0);i=e;return f|0}function re(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;d=i;f=sc(e|0)|0;e=qn(f|0)|0;if(e>>>0>4294967279){xe(0)}if(e>>>0<11){a[b]=e<<1;g=b+1|0;on(g|0,f|0,e|0)|0;h=g+e|0;a[h]=0;i=d;return}else{j=e+16&-16;k=Um(j)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=e;g=k;on(g|0,f|0,e|0)|0;h=g+e|0;a[h]=0;i=d;return}}function se(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+16|0;g=f;h=d;j=c[h>>2]|0;k=e;do{if((j|0)!=0){l=a[k]|0;if((l&1)==0){m=(l&255)>>>1}else{m=c[e+4>>2]|0}if((m|0)==0){n=j}else{Ie(e,2184,2)|0;n=c[h>>2]|0}l=c[d+4>>2]|0;Ec[c[(c[l>>2]|0)+24>>2]&3](g,l,n);l=g;o=a[l]|0;if((o&1)==0){p=g+1|0;q=(o&255)>>>1}else{p=c[g+8>>2]|0;q=c[g+4>>2]|0}Ie(e,p,q)|0;if((a[l]&1)==0){break}Wm(c[g+8>>2]|0)}}while(0);g=b;c[g+0>>2]=c[k+0>>2];c[g+4>>2]=c[k+4>>2];c[g+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;i=f;return}function te(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+32|0;g=f;h=f+16|0;j=qn(e|0)|0;if(j>>>0>4294967279){xe(0)}if(j>>>0<11){a[h]=j<<1;k=h+1|0}else{l=j+16&-16;m=Um(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}on(k|0,e|0,j|0)|0;a[k+j|0]=0;se(g,d,h);he(b,g);if(!((a[g]&1)==0)){Wm(c[g+8>>2]|0)}if(!((a[h]&1)==0)){Wm(c[h+8>>2]|0)}c[b>>2]=2200;h=d;d=c[h+4>>2]|0;g=b+8|0;c[g>>2]=c[h>>2];c[g+4>>2]=d;i=f;return}function ue(a){a=a|0;var b=0;b=i;ke(a);Wm(a);i=b;return}function ve(a){a=a|0;var b=0;b=i;ke(a);i=b;return}function we(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;vb(2336)|0;if((c[a>>2]|0)==1){do{Wb(2360,2336)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)==0){c[a>>2]=1;ic(2336)|0;zc[d&127](b);vb(2336)|0;c[a>>2]=-1;ic(2336)|0;Ob(2360)|0;i=e;return}else{ic(2336)|0;i=e;return}}function xe(a){a=a|0;a=Bb(8)|0;de(a,2408);c[a>>2]=2088;oc(a|0,2128,9)}function ye(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=d;if((a[f]&1)==0){g=b;c[g+0>>2]=c[f+0>>2];c[g+4>>2]=c[f+4>>2];c[g+8>>2]=c[f+8>>2];i=e;return}f=c[d+8>>2]|0;g=c[d+4>>2]|0;if(g>>>0>4294967279){xe(0)}if(g>>>0<11){a[b]=g<<1;h=b+1|0}else{d=g+16&-16;j=Um(d)|0;c[b+8>>2]=j;c[b>>2]=d|1;c[b+4>>2]=g;h=j}on(h|0,f|0,g|0)|0;a[h+g|0]=0;i=e;return}function ze(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(e>>>0>4294967279){xe(0)}if(e>>>0<11){a[b]=e<<1;g=b+1|0}else{h=e+16&-16;j=Um(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=e;g=j}on(g|0,d|0,e|0)|0;a[g+e|0]=0;i=f;return}function Ae(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(d>>>0>4294967279){xe(0)}if(d>>>0<11){a[b]=d<<1;g=b+1|0}else{h=d+16&-16;j=Um(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=d;g=j}ln(g|0,e|0,d|0)|0;a[g+d|0]=0;i=f;return}function Be(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Wm(c[b+8>>2]|0);i=d;return}function Ce(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Wm(c[b+8>>2]|0);i=d;return}function De(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;f=qn(d|0)|0;g=b;h=a[g]|0;if((h&1)==0){j=h;k=10}else{h=c[b>>2]|0;j=h&255;k=(h&-2)+ -1|0}h=(j&1)==0;if(k>>>0<f>>>0){if(h){l=(j&255)>>>1}else{l=c[b+4>>2]|0}Je(b,k,f-k|0,l,0,l,f,d);i=e;return b|0}if(h){m=b+1|0}else{m=c[b+8>>2]|0}pn(m|0,d|0,f|0)|0;a[m+f|0]=0;if((a[g]&1)==0){a[g]=f<<1;i=e;return b|0}else{c[b+4>>2]=f;i=e;return b|0}return 0}function Ee(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=b;h=a[g]|0;j=(h&1)==0;if(j){k=(h&255)>>>1}else{k=c[b+4>>2]|0}if(k>>>0<d>>>0){Fe(b,d-k|0,e)|0;i=f;return}if(j){a[b+d+1|0]=0;a[g]=d<<1;i=f;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;i=f;return}}function Fe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;if((d|0)==0){i=f;return b|0}g=b;h=a[g]|0;if((h&1)==0){j=h;k=10}else{h=c[b>>2]|0;j=h&255;k=(h&-2)+ -1|0}if((j&1)==0){l=(j&255)>>>1}else{l=c[b+4>>2]|0}if((k-l|0)>>>0<d>>>0){Ke(b,k,d-k+l|0,l,l,0,0);m=a[g]|0}else{m=j}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}ln(n+l|0,e|0,d|0)|0;e=l+d|0;if((a[g]&1)==0){a[g]=e<<1}else{c[b+4>>2]=e}a[n+e|0]=0;i=f;return b|0}function Ge(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;if(d>>>0>4294967279){xe(0)}f=b;g=a[f]|0;if((g&1)==0){h=g;j=10}else{g=c[b>>2]|0;h=g&255;j=(g&-2)+ -1|0}if((h&1)==0){k=(h&255)>>>1}else{k=c[b+4>>2]|0}g=k>>>0>d>>>0?k:d;if(g>>>0<11){l=10}else{l=(g+16&-16)+ -1|0}if((l|0)==(j|0)){i=e;return}do{if((l|0)==10){m=b+1|0;n=0;o=c[b+8>>2]|0;p=1}else{g=l+1|0;if(l>>>0>j>>>0){q=Um(g)|0}else{q=Um(g)|0}if((h&1)==0){m=q;n=1;o=b+1|0;p=0;break}else{m=q;n=1;o=c[b+8>>2]|0;p=1;break}}}while(0);if((h&1)==0){r=(h&255)>>>1}else{r=c[b+4>>2]|0}on(m|0,o|0,r+1|0)|0;if(p){Wm(o)}if(n){c[b>>2]=l+1|1;c[b+4>>2]=k;c[b+8>>2]=m;i=e;return}else{a[f]=k<<1;i=e;return}}function He(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;f=b;g=a[f]|0;h=(g&1)!=0;if(h){j=(c[b>>2]&-2)+ -1|0;k=c[b+4>>2]|0}else{j=10;k=(g&255)>>>1}if((k|0)==(j|0)){Ke(b,j,1,j,j,0,0);if((a[f]&1)==0){l=7}else{l=8}}else{if(h){l=8}else{l=7}}if((l|0)==7){a[f]=(k<<1)+2;m=b+1|0;n=k+1|0;o=m+k|0;a[o]=d;p=m+n|0;a[p]=0;i=e;return}else if((l|0)==8){l=c[b+8>>2]|0;f=k+1|0;c[b+4>>2]=f;m=l;n=f;o=m+k|0;a[o]=d;p=m+n|0;a[p]=0;i=e;return}}function Ie(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=b;h=a[g]|0;if((h&1)==0){j=10;k=h}else{h=c[b>>2]|0;j=(h&-2)+ -1|0;k=h&255}if((k&1)==0){l=(k&255)>>>1}else{l=c[b+4>>2]|0}if((j-l|0)>>>0<e>>>0){Je(b,j,e-j+l|0,l,l,0,e,d);i=f;return b|0}if((e|0)==0){i=f;return b|0}if((k&1)==0){m=b+1|0}else{m=c[b+8>>2]|0}on(m+l|0,d|0,e|0)|0;d=l+e|0;if((a[g]&1)==0){a[g]=d<<1}else{c[b+4>>2]=d}a[m+d|0]=0;i=f;return b|0}function Je(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;l=i;if((-18-d|0)>>>0<e>>>0){xe(0)}if((a[b]&1)==0){m=b+1|0}else{m=c[b+8>>2]|0}do{if(d>>>0<2147483623){n=e+d|0;o=d<<1;p=n>>>0<o>>>0?o:n;if(p>>>0<11){q=11;break}q=p+16&-16}else{q=-17}}while(0);e=Um(q)|0;if((g|0)!=0){on(e|0,m|0,g|0)|0}if((j|0)!=0){on(e+g|0,k|0,j|0)|0}k=f-h|0;if((k|0)!=(g|0)){on(e+(j+g)|0,m+(h+g)|0,k-g|0)|0}if((d|0)==10){r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+u|0;a[w]=0;i=l;return}Wm(m);r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+u|0;a[w]=0;i=l;return}function Ke(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;k=i;if((-17-d|0)>>>0<e>>>0){xe(0)}if((a[b]&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}do{if(d>>>0<2147483623){m=e+d|0;n=d<<1;o=m>>>0<n>>>0?n:m;if(o>>>0<11){p=11;break}p=o+16&-16}else{p=-17}}while(0);e=Um(p)|0;if((g|0)!=0){on(e|0,l|0,g|0)|0}o=f-h|0;if((o|0)!=(g|0)){on(e+(j+g)|0,l+(h+g)|0,o-g|0)|0}if((d|0)==10){q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}Wm(l);q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}function Le(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;if(e>>>0>1073741807){xe(0)}if(e>>>0<2){a[b]=e<<1;g=b+4|0;qm(g,d,e)|0;h=g+(e<<2)|0;c[h>>2]=0;i=f;return}else{j=e+4&-4;k=Um(j<<2)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=e;g=k;qm(g,d,e)|0;h=g+(e<<2)|0;c[h>>2]=0;i=f;return}}function Me(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;if(d>>>0>1073741807){xe(0)}if(d>>>0<2){a[b]=d<<1;g=b+4|0;sm(g,e,d)|0;h=g+(d<<2)|0;c[h>>2]=0;i=f;return}else{j=d+4&-4;k=Um(j<<2)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;g=k;sm(g,e,d)|0;h=g+(d<<2)|0;c[h>>2]=0;i=f;return}}function Ne(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Wm(c[b+8>>2]|0);i=d;return}function Oe(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;d=Pe(a,b,pm(b)|0)|0;i=c;return d|0}function Pe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=b;h=a[g]|0;if((h&1)==0){j=1;k=h}else{h=c[b>>2]|0;j=(h&-2)+ -1|0;k=h&255}h=(k&1)==0;if(j>>>0<e>>>0){if(h){l=(k&255)>>>1}else{l=c[b+4>>2]|0}Se(b,j,e-j|0,l,0,l,e,d);i=f;return b|0}if(h){m=b+4|0}else{m=c[b+8>>2]|0}rm(m,d,e)|0;c[m+(e<<2)>>2]=0;if((a[g]&1)==0){a[g]=e<<1;i=f;return b|0}else{c[b+4>>2]=e;i=f;return b|0}return 0}function Qe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;if(d>>>0>1073741807){xe(0)}f=b;g=a[f]|0;if((g&1)==0){h=g;j=1}else{g=c[b>>2]|0;h=g&255;j=(g&-2)+ -1|0}if((h&1)==0){k=(h&255)>>>1}else{k=c[b+4>>2]|0}g=k>>>0>d>>>0?k:d;if(g>>>0<2){l=1}else{l=(g+4&-4)+ -1|0}if((l|0)==(j|0)){i=e;return}do{if((l|0)==1){m=b+4|0;n=0;o=c[b+8>>2]|0;p=1}else{g=(l<<2)+4|0;if(l>>>0>j>>>0){q=Um(g)|0}else{q=Um(g)|0}g=q;if((h&1)==0){m=g;n=1;o=b+4|0;p=0;break}else{m=g;n=1;o=c[b+8>>2]|0;p=1;break}}}while(0);if((h&1)==0){r=(h&255)>>>1}else{r=c[b+4>>2]|0}qm(m,o,r+1|0)|0;if(p){Wm(o)}if(n){c[b>>2]=l+1|1;c[b+4>>2]=k;c[b+8>>2]=m;i=e;return}else{a[f]=k<<1;i=e;return}}function Re(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;f=b;g=a[f]|0;h=(g&1)!=0;if(h){j=(c[b>>2]&-2)+ -1|0;k=c[b+4>>2]|0}else{j=1;k=(g&255)>>>1}if((k|0)==(j|0)){Te(b,j,1,j,j,0,0);if((a[f]&1)==0){l=7}else{l=8}}else{if(h){l=8}else{l=7}}if((l|0)==7){a[f]=(k<<1)+2;m=b+4|0;n=k+1|0;o=m+(k<<2)|0;c[o>>2]=d;p=m+(n<<2)|0;c[p>>2]=0;i=e;return}else if((l|0)==8){l=c[b+8>>2]|0;f=k+1|0;c[b+4>>2]=f;m=l;n=f;o=m+(k<<2)|0;c[o>>2]=d;p=m+(n<<2)|0;c[p>>2]=0;i=e;return}}function Se(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;l=i;if((1073741806-d|0)>>>0<e>>>0){xe(0)}if((a[b]&1)==0){m=b+4|0}else{m=c[b+8>>2]|0}do{if(d>>>0<536870887){n=e+d|0;o=d<<1;p=n>>>0<o>>>0?o:n;if(p>>>0<2){q=2;break}q=p+4&-4}else{q=1073741807}}while(0);e=Um(q<<2)|0;if((g|0)!=0){qm(e,m,g)|0}if((j|0)!=0){qm(e+(g<<2)|0,k,j)|0}k=f-h|0;if((k|0)!=(g|0)){qm(e+(j+g<<2)|0,m+(h+g<<2)|0,k-g|0)|0}if((d|0)==1){r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+(u<<2)|0;c[w>>2]=0;i=l;return}Wm(m);r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+(u<<2)|0;c[w>>2]=0;i=l;return}function Te(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;k=i;if((1073741807-d|0)>>>0<e>>>0){xe(0)}if((a[b]&1)==0){l=b+4|0}else{l=c[b+8>>2]|0}do{if(d>>>0<536870887){m=e+d|0;n=d<<1;o=m>>>0<n>>>0?n:m;if(o>>>0<2){p=2;break}p=o+4&-4}else{p=1073741807}}while(0);e=Um(p<<2)|0;if((g|0)!=0){qm(e,l,g)|0}o=f-h|0;if((o|0)!=(g|0)){qm(e+(j+g<<2)|0,l+(h+g<<2)|0,o-g|0)|0}if((d|0)==1){q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}Wm(l);q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}function Ue(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e;g=e+8|0;h=(c[b+24>>2]|0)==0;if(h){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((h&1|d)&c[b+20>>2]|0)==0){i=e;return}e=Bb(16)|0;do{if((a[2776]|0)==0){if((Fa(2776)|0)==0){break}c[692]=3472;uc(40,2768,p|0)|0;eb(2776)}}while(0);b=e;d=g;c[d>>2]=1;c[d+4>>2]=2768;d=f;h=g;c[d+0>>2]=c[h+0>>2];c[d+4>>2]=c[h+4>>2];te(b,f,2824);c[e>>2]=2792;oc(e|0,2872,36)}function Ve(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=2816;d=c[a+40>>2]|0;e=a+32|0;f=a+36|0;if((d|0)!=0){g=d;do{g=g+ -1|0;Ec[c[(c[e>>2]|0)+(g<<2)>>2]&3](0,a,c[(c[f>>2]|0)+(g<<2)>>2]|0);}while((g|0)!=0)}ck(a+28|0);Qm(c[e>>2]|0);Qm(c[f>>2]|0);Qm(c[a+48>>2]|0);Qm(c[a+60>>2]|0);i=b;return}function We(a,b){a=a|0;b=b|0;var c=0;c=i;bk(a,b+28|0);i=c;return}function Xe(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;e=a+32|0;a=e+40|0;do{c[e>>2]=0;e=e+4|0}while((e|0)<(a|0));ak(b);i=d;return}function Ye(a){a=a|0;var b=0;b=i;c[a>>2]=2432;ck(a+4|0);Wm(a);i=b;return}function Ze(a){a=a|0;var b=0;b=i;c[a>>2]=2432;ck(a+4|0);i=b;return}function _e(a,b){a=a|0;b=b|0;i=i;return}function $e(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return a|0}function af(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;i=i;return}function bf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;i=i;return}function cf(a){a=a|0;i=i;return 0}function df(a){a=a|0;i=i;return 0}function ef(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b;if((e|0)<=0){h=0;i=f;return h|0}j=b+12|0;k=b+16|0;l=d;d=0;while(1){m=c[j>>2]|0;if(m>>>0<(c[k>>2]|0)>>>0){c[j>>2]=m+1;n=a[m]|0}else{m=Cc[c[(c[g>>2]|0)+40>>2]&63](b)|0;if((m|0)==-1){h=d;o=8;break}n=m&255}a[l]=n;m=d+1|0;if((m|0)<(e|0)){l=l+1|0;d=m}else{h=m;o=8;break}}if((o|0)==8){i=f;return h|0}return 0}function ff(a){a=a|0;i=i;return-1}function gf(a){a=a|0;var b=0,e=0,f=0;b=i;if((Cc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){e=-1;i=b;return e|0}f=a+12|0;a=c[f>>2]|0;c[f>>2]=a+1;e=d[a]|0;i=b;return e|0}function hf(a,b){a=a|0;b=b|0;i=i;return-1}function jf(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;h=b;if((f|0)<=0){j=0;i=g;return j|0}k=b+24|0;l=b+28|0;m=e;e=0;while(1){n=c[k>>2]|0;if(n>>>0<(c[l>>2]|0)>>>0){o=a[m]|0;c[k>>2]=n+1;a[n]=o}else{if((Lc[c[(c[h>>2]|0)+52>>2]&15](b,d[m]|0)|0)==-1){j=e;p=7;break}}o=e+1|0;if((o|0)<(f|0)){m=m+1|0;e=o}else{j=o;p=7;break}}if((p|0)==7){i=g;return j|0}return 0}function kf(a,b){a=a|0;b=b|0;i=i;return-1}function lf(a){a=a|0;var b=0;b=i;c[a>>2]=2496;ck(a+4|0);Wm(a);i=b;return}function mf(a){a=a|0;var b=0;b=i;c[a>>2]=2496;ck(a+4|0);i=b;return}function nf(a,b){a=a|0;b=b|0;i=i;return}function of(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return a|0}function pf(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;i=i;return}function qf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;i=i;return}function rf(a){a=a|0;i=i;return 0}function sf(a){a=a|0;i=i;return 0}function tf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=a;if((d|0)<=0){g=0;i=e;return g|0}h=a+12|0;j=a+16|0;k=b;b=0;while(1){l=c[h>>2]|0;if(l>>>0<(c[j>>2]|0)>>>0){c[h>>2]=l+4;m=c[l>>2]|0}else{l=Cc[c[(c[f>>2]|0)+40>>2]&63](a)|0;if((l|0)==-1){g=b;n=8;break}else{m=l}}c[k>>2]=m;l=b+1|0;if((l|0)>=(d|0)){g=l;n=8;break}k=k+4|0;b=l}if((n|0)==8){i=e;return g|0}return 0}function uf(a){a=a|0;i=i;return-1}function vf(a){a=a|0;var b=0,d=0,e=0;b=i;if((Cc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){d=-1;i=b;return d|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+4;d=c[a>>2]|0;i=b;return d|0}function wf(a,b){a=a|0;b=b|0;i=i;return-1}function xf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=a;if((d|0)<=0){g=0;i=e;return g|0}h=a+24|0;j=a+28|0;k=b;b=0;while(1){l=c[h>>2]|0;if(l>>>0<(c[j>>2]|0)>>>0){m=c[k>>2]|0;c[h>>2]=l+4;c[l>>2]=m}else{if((Lc[c[(c[f>>2]|0)+52>>2]&15](a,c[k>>2]|0)|0)==-1){g=b;n=8;break}}m=b+1|0;if((m|0)>=(d|0)){g=m;n=8;break}k=k+4|0;b=m}if((n|0)==8){i=e;return g|0}return 0}function yf(a,b){a=a|0;b=b|0;i=i;return-1}function zf(a){a=a|0;var b=0;b=i;Ve(a+8|0);Wm(a);i=b;return}function Af(a){a=a|0;var b=0;b=i;Ve(a+8|0);i=b;return}function Bf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Ve(d+(e+8)|0);Wm(d+e|0);i=b;return}function Cf(a){a=a|0;var b=0;b=i;Ve(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function Df(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d;f=b;g=c[(c[f>>2]|0)+ -12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)==0){l=g}else{Df(k)|0;l=c[(c[f>>2]|0)+ -12>>2]|0}a[j]=1;k=c[h+(l+24)>>2]|0;if(!((Cc[c[(c[k>>2]|0)+24>>2]&63](k)|0)==-1)){break}k=c[(c[f>>2]|0)+ -12>>2]|0;Ue(h+k|0,c[h+(k+16)>>2]|1)}}while(0);Pf(e);i=d;return b|0}function Ef(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){i=i;return}else{Wa()}}function Ff(a){a=a|0;var b=0;b=i;Ve(a+8|0);Wm(a);i=b;return}function Gf(a){a=a|0;var b=0;b=i;Ve(a+8|0);i=b;return}function Hf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Ve(d+(e+8)|0);Wm(d+e|0);i=b;return}function If(a){a=a|0;var b=0;b=i;Ve(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function Jf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d;f=b;g=c[(c[f>>2]|0)+ -12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)==0){l=g}else{Jf(k)|0;l=c[(c[f>>2]|0)+ -12>>2]|0}a[j]=1;k=c[h+(l+24)>>2]|0;if(!((Cc[c[(c[k>>2]|0)+24>>2]&63](k)|0)==-1)){break}k=c[(c[f>>2]|0)+ -12>>2]|0;Ue(h+k|0,c[h+(k+16)>>2]|1)}}while(0);Uf(e);i=d;return b|0}function Kf(a){a=a|0;var b=0;b=i;Ve(a+4|0);Wm(a);i=b;return}function Lf(a){a=a|0;var b=0;b=i;Ve(a+4|0);i=b;return}function Mf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Ve(d+(e+4)|0);Wm(d+e|0);i=b;return}function Nf(a){a=a|0;var b=0;b=i;Ve(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function Of(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=b;a[f]=0;c[b+4>>2]=d;b=c[(c[d>>2]|0)+ -12>>2]|0;g=d;if((c[g+(b+16)>>2]|0)!=0){i=e;return}d=c[g+(b+72)>>2]|0;if((d|0)!=0){Df(d)|0}a[f]=1;i=e;return}function Pf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;a=c[d>>2]|0;e=c[(c[a>>2]|0)+ -12>>2]|0;f=a;if((c[f+(e+24)>>2]|0)==0){i=b;return}if((c[f+(e+16)>>2]|0)!=0){i=b;return}if((c[f+(e+4)>>2]&8192|0)==0){i=b;return}if(Ha()|0){i=b;return}e=c[d>>2]|0;f=c[e+((c[(c[e>>2]|0)+ -12>>2]|0)+24)>>2]|0;if(!((Cc[c[(c[f>>2]|0)+24>>2]&63](f)|0)==-1)){i=b;return}f=c[d>>2]|0;d=c[(c[f>>2]|0)+ -12>>2]|0;e=f;Ue(e+d|0,c[e+(d+16)>>2]|1);i=b;return}function Qf(a){a=a|0;var b=0;b=i;Ve(a+4|0);Wm(a);i=b;return}function Rf(a){a=a|0;var b=0;b=i;Ve(a+4|0);i=b;return}function Sf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Ve(d+(e+4)|0);Wm(d+e|0);i=b;return}function Tf(a){a=a|0;var b=0;b=i;Ve(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function Uf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;a=c[d>>2]|0;e=c[(c[a>>2]|0)+ -12>>2]|0;f=a;if((c[f+(e+24)>>2]|0)==0){i=b;return}if((c[f+(e+16)>>2]|0)!=0){i=b;return}if((c[f+(e+4)>>2]&8192|0)==0){i=b;return}if(Ha()|0){i=b;return}e=c[d>>2]|0;f=c[e+((c[(c[e>>2]|0)+ -12>>2]|0)+24)>>2]|0;if(!((Cc[c[(c[f>>2]|0)+24>>2]&63](f)|0)==-1)){i=b;return}f=c[d>>2]|0;d=c[(c[f>>2]|0)+ -12>>2]|0;e=f;Ue(e+d|0,c[e+(d+16)>>2]|1);i=b;return}function Vf(a){a=a|0;i=i;return 2712}function Wf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;if((c|0)==1){ze(a,2728,35);i=d;return}else{re(a,b,c);i=d;return}}function Xf(a){a=a|0;i=i;return}function Yf(a){a=a|0;var b=0;b=i;ve(a);Wm(a);i=b;return}function Zf(a){a=a|0;var b=0;b=i;ve(a);i=b;return}function _f(a){a=a|0;var b=0;b=i;Ve(a);Wm(a);i=b;return}function $f(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function ag(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function bg(a){a=a|0;i=i;return}function cg(a){a=a|0;i=i;return}function dg(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;a:do{if((e|0)==(f|0)){g=c;h=6}else{j=e;k=c;while(1){if((k|0)==(d|0)){l=-1;break a}m=a[k]|0;n=a[j]|0;if(m<<24>>24<n<<24>>24){l=-1;break a}if(n<<24>>24<m<<24>>24){l=1;break a}m=k+1|0;n=j+1|0;if((n|0)==(f|0)){g=m;h=6;break}else{j=n;k=m}}}}while(0);if((h|0)==6){l=(g|0)!=(d|0)|0}i=b;return l|0}function eg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;g=e;h=f-g|0;if(h>>>0>4294967279){xe(b)}if(h>>>0<11){a[b]=h<<1;j=b+1|0}else{k=h+16&-16;l=Um(k)|0;c[b+8>>2]=l;c[b>>2]=k|1;c[b+4>>2]=h;j=l}if((e|0)==(f|0)){m=j;a[m]=0;i=d;return}else{n=e;o=j}while(1){a[o]=a[n]|0;e=n+1|0;if((e|0)==(f|0)){break}else{o=o+1|0;n=e}}m=j+(f+(0-g))|0;a[m]=0;i=d;return}function fg(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;b=i;if((c|0)==(d|0)){e=0;i=b;return e|0}else{f=0;g=c}while(1){c=(a[g]|0)+(f<<4)|0;h=c&-268435456;j=(h>>>24|h)^c;c=g+1|0;if((c|0)==(d|0)){e=j;break}else{g=c;f=j}}i=b;return e|0}function gg(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function hg(a){a=a|0;i=i;return}function ig(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;a=i;a:do{if((e|0)==(f|0)){g=b;h=6}else{j=e;k=b;while(1){if((k|0)==(d|0)){l=-1;break a}m=c[k>>2]|0;n=c[j>>2]|0;if((m|0)<(n|0)){l=-1;break a}if((n|0)<(m|0)){l=1;break a}m=k+4|0;n=j+4|0;if((n|0)==(f|0)){g=m;h=6;break}else{j=n;k=m}}}}while(0);if((h|0)==6){l=(g|0)!=(d|0)|0}i=a;return l|0}function jg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;d=i;g=e;h=f-g|0;j=h>>2;if(j>>>0>1073741807){xe(b)}if(j>>>0<2){a[b]=h>>>1;k=b+4|0}else{h=j+4&-4;l=Um(h<<2)|0;c[b+8>>2]=l;c[b>>2]=h|1;c[b+4>>2]=j;k=l}if((e|0)==(f|0)){m=k;c[m>>2]=0;i=d;return}l=f+ -4+(0-g)|0;g=e;e=k;while(1){c[e>>2]=c[g>>2];j=g+4|0;if((j|0)==(f|0)){break}else{e=e+4|0;g=j}}m=k+((l>>>2)+1<<2)|0;c[m>>2]=0;i=d;return}function kg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;a=i;if((b|0)==(d|0)){e=0;i=a;return e|0}else{f=0;g=b}while(1){b=(c[g>>2]|0)+(f<<4)|0;h=b&-268435456;j=(h>>>24|h)^b;b=g+4|0;if((b|0)==(d|0)){e=j;break}else{g=b;f=j}}i=a;return e|0}function lg(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function mg(a){a=a|0;i=i;return}function ng(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;k=i;i=i+136|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=k+40|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+88|0;v=k+96|0;w=k+104|0;x=k+128|0;if((c[g+4>>2]&1|0)==0){c[q>>2]=-1;y=c[(c[d>>2]|0)+16>>2]|0;z=e;c[s>>2]=c[z>>2];c[t>>2]=c[f>>2];A=n;B=s;c[A+0>>2]=c[B+0>>2];B=m;A=t;c[B+0>>2]=c[A+0>>2];xc[y&63](r,d,n,m,g,h,q);m=c[r>>2]|0;c[z>>2]=m;z=c[q>>2]|0;if((z|0)==0){a[j]=0}else if((z|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=m;i=k;return}We(u,g);m=u;u=c[m>>2]|0;if(!((c[1290]|0)==-1)){c[p>>2]=5160;c[p+4>>2]=112;c[p+8>>2]=0;we(5160,p,113)}p=(c[5164>>2]|0)+ -1|0;z=c[u+8>>2]|0;if(!((c[u+12>>2]|0)-z>>2>>>0>p>>>0)){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}u=c[z+(p<<2)>>2]|0;if((u|0)==0){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}C=u;ce(c[m>>2]|0)|0;We(v,g);g=v;v=c[g>>2]|0;if(!((c[1326]|0)==-1)){c[o>>2]=5304;c[o+4>>2]=112;c[o+8>>2]=0;we(5304,o,113)}o=(c[5308>>2]|0)+ -1|0;m=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-m>>2>>>0>o>>>0)){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}v=c[m+(o<<2)>>2]|0;if((v|0)==0){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}E=v;ce(c[g>>2]|0)|0;g=w;F=v;Ac[c[(c[F>>2]|0)+24>>2]&63](g,E);Ac[c[(c[F>>2]|0)+28>>2]&63](w+12|0,E);c[x>>2]=c[f>>2];f=w+24|0;E=l;F=x;c[E+0>>2]=c[F+0>>2];F=og(e,l,g,f,C,h,1)|0;a[j]=(F|0)==(g|0)|0;c[b>>2]=c[e>>2];Be(w+12|0);Be(w);i=k;return}function og(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;l=i;i=i+104|0;m=(g-f|0)/12|0;n=l;do{if(m>>>0>100){o=Pm(m)|0;if((o|0)!=0){p=o;q=o;break}$m()}else{p=0;q=n}}while(0);n=(f|0)==(g|0);if(n){r=0;s=m}else{o=f;t=0;u=m;m=q;while(1){v=a[o]|0;if((v&1)==0){w=(v&255)>>>1}else{w=c[o+4>>2]|0}if((w|0)==0){a[m]=2;x=t+1|0;y=u+ -1|0}else{a[m]=1;x=t;y=u}v=o+12|0;if((v|0)==(g|0)){r=x;s=y;break}else{o=v;t=x;u=y;m=m+1|0}}}m=b;b=e;e=h;y=0;u=r;r=s;a:while(1){s=c[m>>2]|0;do{if((s|0)==0){z=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){z=s;break}if((Cc[c[(c[s>>2]|0)+36>>2]&63](s)|0)==-1){c[m>>2]=0;z=0;break}else{z=c[m>>2]|0;break}}}while(0);s=(z|0)==0;x=c[b>>2]|0;do{if((x|0)==0){A=0}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){A=x;break}if(!((Cc[c[(c[x>>2]|0)+36>>2]&63](x)|0)==-1)){A=x;break}c[b>>2]=0;A=0}}while(0);B=(A|0)==0;C=c[m>>2]|0;if(!((s^B)&(r|0)!=0)){break}x=c[C+12>>2]|0;if((x|0)==(c[C+16>>2]|0)){D=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{D=d[x]|0}x=D&255;if(k){E=x}else{E=Lc[c[(c[e>>2]|0)+12>>2]&15](h,x)|0}x=y+1|0;if(n){y=x;r=r;u=u;continue}b:do{if(k){t=0;o=f;w=u;v=r;F=q;while(1){do{if((a[F]|0)==1){G=a[o]|0;H=(G&1)==0;if(H){I=o+1|0}else{I=c[o+8>>2]|0}if(!(E<<24>>24==(a[I+y|0]|0))){a[F]=0;J=t;K=w;L=v+ -1|0;break}if(H){M=(G&255)>>>1}else{M=c[o+4>>2]|0}if((M|0)!=(x|0)){J=1;K=w;L=v;break}a[F]=2;J=1;K=w+1|0;L=v+ -1|0}else{J=t;K=w;L=v}}while(0);G=o+12|0;if((G|0)==(g|0)){N=J;O=K;P=L;break b}t=J;o=G;w=K;v=L;F=F+1|0}}else{F=0;v=f;w=u;o=r;t=q;while(1){do{if((a[t]|0)==1){G=v;if((a[G]&1)==0){Q=v+1|0}else{Q=c[v+8>>2]|0}if(!(E<<24>>24==(Lc[c[(c[e>>2]|0)+12>>2]&15](h,a[Q+y|0]|0)|0)<<24>>24)){a[t]=0;R=F;S=w;T=o+ -1|0;break}H=a[G]|0;if((H&1)==0){U=(H&255)>>>1}else{U=c[v+4>>2]|0}if((U|0)!=(x|0)){R=1;S=w;T=o;break}a[t]=2;R=1;S=w+1|0;T=o+ -1|0}else{R=F;S=w;T=o}}while(0);H=v+12|0;if((H|0)==(g|0)){N=R;O=S;P=T;break b}F=R;v=H;w=S;o=T;t=t+1|0}}}while(0);if(!N){y=x;u=O;r=P;continue}s=c[m>>2]|0;t=s+12|0;o=c[t>>2]|0;if((o|0)==(c[s+16>>2]|0)){Cc[c[(c[s>>2]|0)+40>>2]&63](s)|0}else{c[t>>2]=o+1}if((P+O|0)>>>0<2){y=x;u=O;r=P;continue}else{V=f;W=O;X=q}while(1){do{if((a[X]|0)==2){o=a[V]|0;if((o&1)==0){Y=(o&255)>>>1}else{Y=c[V+4>>2]|0}if((Y|0)==(x|0)){Z=W;break}a[X]=0;Z=W+ -1|0}else{Z=W}}while(0);o=V+12|0;if((o|0)==(g|0)){y=x;u=Z;r=P;continue a}else{V=o;W=Z;X=X+1|0}}}do{if((C|0)==0){_=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){_=C;break}if((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[m>>2]=0;_=0;break}else{_=c[m>>2]|0;break}}}while(0);m=(_|0)==0;do{if(B){$=78}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(m){break}else{$=80;break}}if((Cc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1){c[b>>2]=0;$=78;break}else{if(m){break}else{$=80;break}}}}while(0);if(($|0)==78){if(m){$=80}}if(($|0)==80){c[j>>2]=c[j>>2]|2}c:do{if(n){$=85}else{if((a[q]|0)==2){aa=f;break}else{ba=f;ca=q}while(1){m=ba+12|0;b=ca+1|0;if((m|0)==(g|0)){$=85;break c}if((a[b]|0)==2){aa=m;break}else{ca=b;ba=m}}}}while(0);if(($|0)==85){c[j>>2]=c[j>>2]|4;aa=g}if((p|0)==0){i=l;return aa|0}Qm(p);i=l;return aa|0}function pg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];qg(a,0,k,j,f,g,h);i=b;return}function qg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l;gh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[z>>2]|0;K=D;L=D}Ee(o,L<<1,0);if((a[h]&1)==0){M=10}else{M=(c[g>>2]&-2)+ -1|0}Ee(o,M,0);if((a[h]&1)==0){N=v}else{N=c[w>>2]|0}c[p>>2]=N+K;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{Q=d[I]|0}if((Ig(Q&255,u,O,p,s,A,n,l,r,t)|0)!=0){G=F;H=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){Cc[c[(c[C>>2]|0)+40>>2]&63](C)|0;m=C;B=O;continue}else{c[D>>2]=I+1;m=C;B=O;continue}}O=a[n]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[n+4>>2]|0}do{if((R|0)!=0){O=c[r>>2]|0;if((O-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=B}}while(0);s=_l(H,c[p>>2]|0,j,u)|0;c[k>>2]=s;rj(n,l,c[r>>2]|0,j);do{if((C|0)==0){S=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){S=C;break}if(!((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1)){S=C;break}c[y>>2]=0;S=0}}while(0);y=(S|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}function rg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];sg(a,0,k,j,f,g,h);i=b;return}function sg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l;gh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;J=(D&1)==0;if(J){K=(D&255)>>>1}else{K=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(K|0)){if(J){L=(D&255)>>>1;M=(D&255)>>>1}else{D=c[z>>2]|0;L=D;M=D}Ee(o,M<<1,0);if((a[h]&1)==0){N=10}else{N=(c[g>>2]&-2)+ -1|0}Ee(o,N,0);if((a[h]&1)==0){O=v}else{O=c[w>>2]|0}c[p>>2]=O+L;P=O}else{P=B}D=C+12|0;J=c[D>>2]|0;Q=C+16|0;if((J|0)==(c[Q>>2]|0)){R=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{R=d[J]|0}if((Ig(R&255,u,P,p,s,A,n,l,r,t)|0)!=0){G=F;H=P;break}J=c[D>>2]|0;if((J|0)==(c[Q>>2]|0)){Cc[c[(c[C>>2]|0)+40>>2]&63](C)|0;m=C;B=P;continue}else{c[D>>2]=J+1;m=C;B=P;continue}}P=a[n]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){P=c[r>>2]|0;if((P-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=P+4;c[P>>2]=B}}while(0);s=Zl(H,c[p>>2]|0,j,u)|0;u=k;c[u>>2]=s;c[u+4>>2]=I;rj(n,l,c[r>>2]|0,j);do{if((C|0)==0){T=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){T=C;break}if(!((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1)){T=C;break}c[y>>2]=0;T=0}}while(0);y=(T|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}function tg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];ug(a,0,k,j,f,g,h);i=b;return}function ug(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;f=i;i=i+256|0;m=f;n=f+32|0;o=f+40|0;p=f+56|0;q=f+72|0;r=f+80|0;s=f+240|0;t=f+248|0;u=c[j+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=m;gh(o,j,u,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Ee(p,10,0);if((a[j]&1)==0){m=p+1|0;w=m;x=p+8|0;y=m}else{m=p+8|0;w=p+1|0;x=m;y=c[m>>2]|0}c[q>>2]=y;m=r;c[s>>2]=m;c[t>>2]=0;z=g;g=h;h=p;A=p+4|0;B=a[n]|0;n=c[z>>2]|0;C=y;a:while(1){do{if((n|0)==0){D=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){D=n;break}if(!((Cc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1)){D=n;break}c[z>>2]=0;D=0}}while(0);y=(D|0)==0;E=c[g>>2]|0;do{if((E|0)==0){F=18}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(y){G=E;break}else{H=E;I=C;break a}}if((Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0)==-1){c[g>>2]=0;F=18;break}else{if(y){G=E;break}else{H=E;I=C;break a}}}}while(0);if((F|0)==18){F=0;if(y){H=0;I=C;break}else{G=0}}E=a[j]|0;J=(E&1)==0;if(J){K=(E&255)>>>1}else{K=c[A>>2]|0}if(((c[q>>2]|0)-C|0)==(K|0)){if(J){L=(E&255)>>>1;M=(E&255)>>>1}else{E=c[A>>2]|0;L=E;M=E}Ee(p,M<<1,0);if((a[j]&1)==0){N=10}else{N=(c[h>>2]&-2)+ -1|0}Ee(p,N,0);if((a[j]&1)==0){O=w}else{O=c[x>>2]|0}c[q>>2]=O+L;P=O}else{P=C}E=D+12|0;J=c[E>>2]|0;Q=D+16|0;if((J|0)==(c[Q>>2]|0)){R=Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{R=d[J]|0}if((Ig(R&255,v,P,q,t,B,o,m,s,u)|0)!=0){H=G;I=P;break}J=c[E>>2]|0;if((J|0)==(c[Q>>2]|0)){Cc[c[(c[D>>2]|0)+40>>2]&63](D)|0;n=D;C=P;continue}else{c[E>>2]=J+1;n=D;C=P;continue}}P=a[o]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[o+4>>2]|0}do{if((S|0)!=0){P=c[s>>2]|0;if((P-r|0)>=160){break}C=c[t>>2]|0;c[s>>2]=P+4;c[P>>2]=C}}while(0);t=Yl(I,c[q>>2]|0,k,v)|0;b[l>>1]=t;rj(o,m,c[s>>2]|0,k);do{if((D|0)==0){T=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){T=D;break}if(!((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1)){T=D;break}c[z>>2]=0;T=0}}while(0);z=(T|0)==0;do{if((H|0)==0){F=54}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){if(!z){break}U=e;c[U>>2]=T;Be(p);Be(o);i=f;return}if((Cc[c[(c[H>>2]|0)+36>>2]&63](H)|0)==-1){c[g>>2]=0;F=54;break}if(!(z^(H|0)==0)){break}U=e;c[U>>2]=T;Be(p);Be(o);i=f;return}}while(0);do{if((F|0)==54){if(z){break}U=e;c[U>>2]=T;Be(p);Be(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;U=e;c[U>>2]=T;Be(p);Be(o);i=f;return}function vg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];wg(a,0,k,j,f,g,h);i=b;return}function wg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==8){u=16}else if((t|0)==0){u=0}else{u=10}t=l;gh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[z>>2]|0;K=D;L=D}Ee(o,L<<1,0);if((a[h]&1)==0){M=10}else{M=(c[g>>2]&-2)+ -1|0}Ee(o,M,0);if((a[h]&1)==0){N=v}else{N=c[w>>2]|0}c[p>>2]=N+K;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{Q=d[I]|0}if((Ig(Q&255,u,O,p,s,A,n,l,r,t)|0)!=0){G=F;H=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){Cc[c[(c[C>>2]|0)+40>>2]&63](C)|0;m=C;B=O;continue}else{c[D>>2]=I+1;m=C;B=O;continue}}O=a[n]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[n+4>>2]|0}do{if((R|0)!=0){O=c[r>>2]|0;if((O-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=B}}while(0);s=Xl(H,c[p>>2]|0,j,u)|0;c[k>>2]=s;rj(n,l,c[r>>2]|0,j);do{if((C|0)==0){S=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){S=C;break}if(!((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1)){S=C;break}c[y>>2]=0;S=0}}while(0);y=(S|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}function xg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];yg(a,0,k,j,f,g,h);i=b;return}function yg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==8){u=16}else if((t|0)==0){u=0}else{u=10}t=l;gh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[z>>2]|0;K=D;L=D}Ee(o,L<<1,0);if((a[h]&1)==0){M=10}else{M=(c[g>>2]&-2)+ -1|0}Ee(o,M,0);if((a[h]&1)==0){N=v}else{N=c[w>>2]|0}c[p>>2]=N+K;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{Q=d[I]|0}if((Ig(Q&255,u,O,p,s,A,n,l,r,t)|0)!=0){G=F;H=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){Cc[c[(c[C>>2]|0)+40>>2]&63](C)|0;m=C;B=O;continue}else{c[D>>2]=I+1;m=C;B=O;continue}}O=a[n]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[n+4>>2]|0}do{if((R|0)!=0){O=c[r>>2]|0;if((O-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=B}}while(0);s=Wl(H,c[p>>2]|0,j,u)|0;c[k>>2]=s;rj(n,l,c[r>>2]|0,j);do{if((C|0)==0){S=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){S=C;break}if(!((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1)){S=C;break}c[y>>2]=0;S=0}}while(0);y=(S|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;T=b;c[T>>2]=S;Be(o);Be(n);i=e;return}function zg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Ag(a,0,k,j,f,g,h);i=b;return}function Ag(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l;gh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;J=(D&1)==0;if(J){K=(D&255)>>>1}else{K=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(K|0)){if(J){L=(D&255)>>>1;M=(D&255)>>>1}else{D=c[z>>2]|0;L=D;M=D}Ee(o,M<<1,0);if((a[h]&1)==0){N=10}else{N=(c[g>>2]&-2)+ -1|0}Ee(o,N,0);if((a[h]&1)==0){O=v}else{O=c[w>>2]|0}c[p>>2]=O+L;P=O}else{P=B}D=C+12|0;J=c[D>>2]|0;Q=C+16|0;if((J|0)==(c[Q>>2]|0)){R=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{R=d[J]|0}if((Ig(R&255,u,P,p,s,A,n,l,r,t)|0)!=0){G=F;H=P;break}J=c[D>>2]|0;if((J|0)==(c[Q>>2]|0)){Cc[c[(c[C>>2]|0)+40>>2]&63](C)|0;m=C;B=P;continue}else{c[D>>2]=J+1;m=C;B=P;continue}}P=a[n]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){P=c[r>>2]|0;if((P-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=P+4;c[P>>2]=B}}while(0);s=Vl(H,c[p>>2]|0,j,u)|0;u=k;c[u>>2]=s;c[u+4>>2]=I;rj(n,l,c[r>>2]|0,j);do{if((C|0)==0){T=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){T=C;break}if(!((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1)){T=C;break}c[y>>2]=0;T=0}}while(0);y=(T|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b;c[U>>2]=T;Be(o);Be(n);i=e;return}function Bg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Cg(a,0,k,j,f,g,h);i=b;return}function Cg(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0,X=0;e=i;i=i+280|0;m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=e+80|0;r=e+88|0;s=e+248|0;t=e+256|0;u=e+264|0;v=e+272|0;w=e;hh(o,j,w,m,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Ee(p,10,0);if((a[j]&1)==0){x=p+1|0;y=x;z=p+8|0;A=x}else{x=p+8|0;y=p+1|0;z=x;A=c[x>>2]|0}c[q>>2]=A;x=r;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;B=f;f=h;h=p;C=p+4|0;D=a[m]|0;m=a[n]|0;n=c[B>>2]|0;E=A;a:while(1){do{if((n|0)==0){F=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){F=n;break}if(!((Cc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1)){F=n;break}c[B>>2]=0;F=0}}while(0);A=(F|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=14}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(A){I=G;break}else{J=G;K=E;break a}}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;H=14;break}else{if(A){I=G;break}else{J=G;K=E;break a}}}}while(0);if((H|0)==14){H=0;if(A){J=0;K=E;break}else{I=0}}G=a[j]|0;L=(G&1)==0;if(L){M=(G&255)>>>1}else{M=c[C>>2]|0}if(((c[q>>2]|0)-E|0)==(M|0)){if(L){N=(G&255)>>>1;O=(G&255)>>>1}else{G=c[C>>2]|0;N=G;O=G}Ee(p,O<<1,0);if((a[j]&1)==0){P=10}else{P=(c[h>>2]&-2)+ -1|0}Ee(p,P,0);if((a[j]&1)==0){Q=y}else{Q=c[z>>2]|0}c[q>>2]=Q+N;R=Q}else{R=E}G=F+12|0;L=c[G>>2]|0;S=F+16|0;if((L|0)==(c[S>>2]|0)){T=Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0}else{T=d[L]|0}if((ih(T&255,u,v,R,q,D,m,o,x,s,t,w)|0)!=0){J=I;K=R;break}L=c[G>>2]|0;if((L|0)==(c[S>>2]|0)){Cc[c[(c[F>>2]|0)+40>>2]&63](F)|0;n=F;E=R;continue}else{c[G>>2]=L+1;n=F;E=R;continue}}R=a[o]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[o+4>>2]|0}do{if((U|0)!=0){if((a[u]|0)==0){break}R=c[s>>2]|0;if((R-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=R+4;c[R>>2]=E}}while(0);V=+Ul(K,c[q>>2]|0,k);g[l>>2]=V;rj(o,x,c[s>>2]|0,k);do{if((F|0)==0){W=0}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){W=F;break}if(!((Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0)==-1)){W=F;break}c[B>>2]=0;W=0}}while(0);B=(W|0)==0;do{if((J|0)==0){H=51}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(!B){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}if((Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0)==-1){c[f>>2]=0;H=51;break}if(!(B^(J|0)==0)){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}}while(0);do{if((H|0)==51){if(B){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}function Dg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Eg(a,0,k,j,f,g,h);i=b;return}function Eg(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0,X=0;e=i;i=i+280|0;m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=e+80|0;r=e+88|0;s=e+248|0;t=e+256|0;u=e+264|0;v=e+272|0;w=e;hh(o,j,w,m,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Ee(p,10,0);if((a[j]&1)==0){x=p+1|0;y=x;z=p+8|0;A=x}else{x=p+8|0;y=p+1|0;z=x;A=c[x>>2]|0}c[q>>2]=A;x=r;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;B=f;f=g;g=p;C=p+4|0;D=a[m]|0;m=a[n]|0;n=c[B>>2]|0;E=A;a:while(1){do{if((n|0)==0){F=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){F=n;break}if(!((Cc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1)){F=n;break}c[B>>2]=0;F=0}}while(0);A=(F|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=14}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(A){I=G;break}else{J=G;K=E;break a}}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;H=14;break}else{if(A){I=G;break}else{J=G;K=E;break a}}}}while(0);if((H|0)==14){H=0;if(A){J=0;K=E;break}else{I=0}}G=a[j]|0;L=(G&1)==0;if(L){M=(G&255)>>>1}else{M=c[C>>2]|0}if(((c[q>>2]|0)-E|0)==(M|0)){if(L){N=(G&255)>>>1;O=(G&255)>>>1}else{G=c[C>>2]|0;N=G;O=G}Ee(p,O<<1,0);if((a[j]&1)==0){P=10}else{P=(c[g>>2]&-2)+ -1|0}Ee(p,P,0);if((a[j]&1)==0){Q=y}else{Q=c[z>>2]|0}c[q>>2]=Q+N;R=Q}else{R=E}G=F+12|0;L=c[G>>2]|0;S=F+16|0;if((L|0)==(c[S>>2]|0)){T=Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0}else{T=d[L]|0}if((ih(T&255,u,v,R,q,D,m,o,x,s,t,w)|0)!=0){J=I;K=R;break}L=c[G>>2]|0;if((L|0)==(c[S>>2]|0)){Cc[c[(c[F>>2]|0)+40>>2]&63](F)|0;n=F;E=R;continue}else{c[G>>2]=L+1;n=F;E=R;continue}}R=a[o]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[o+4>>2]|0}do{if((U|0)!=0){if((a[u]|0)==0){break}R=c[s>>2]|0;if((R-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=R+4;c[R>>2]=E}}while(0);V=+Tl(K,c[q>>2]|0,k);h[l>>3]=V;rj(o,x,c[s>>2]|0,k);do{if((F|0)==0){W=0}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){W=F;break}if(!((Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0)==-1)){W=F;break}c[B>>2]=0;W=0}}while(0);B=(W|0)==0;do{if((J|0)==0){H=51}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(!B){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}if((Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0)==-1){c[f>>2]=0;H=51;break}if(!(B^(J|0)==0)){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}}while(0);do{if((H|0)==51){if(B){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}function Fg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Gg(a,0,k,j,f,g,h);i=b;return}function Gg(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0,X=0;e=i;i=i+280|0;m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=e+80|0;r=e+88|0;s=e+248|0;t=e+256|0;u=e+264|0;v=e+272|0;w=e;hh(o,j,w,m,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Ee(p,10,0);if((a[j]&1)==0){x=p+1|0;y=x;z=p+8|0;A=x}else{x=p+8|0;y=p+1|0;z=x;A=c[x>>2]|0}c[q>>2]=A;x=r;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;B=f;f=g;g=p;C=p+4|0;D=a[m]|0;m=a[n]|0;n=c[B>>2]|0;E=A;a:while(1){do{if((n|0)==0){F=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){F=n;break}if(!((Cc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1)){F=n;break}c[B>>2]=0;F=0}}while(0);A=(F|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=14}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(A){I=G;break}else{J=G;K=E;break a}}if((Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0)==-1){c[f>>2]=0;H=14;break}else{if(A){I=G;break}else{J=G;K=E;break a}}}}while(0);if((H|0)==14){H=0;if(A){J=0;K=E;break}else{I=0}}G=a[j]|0;L=(G&1)==0;if(L){M=(G&255)>>>1}else{M=c[C>>2]|0}if(((c[q>>2]|0)-E|0)==(M|0)){if(L){N=(G&255)>>>1;O=(G&255)>>>1}else{G=c[C>>2]|0;N=G;O=G}Ee(p,O<<1,0);if((a[j]&1)==0){P=10}else{P=(c[g>>2]&-2)+ -1|0}Ee(p,P,0);if((a[j]&1)==0){Q=y}else{Q=c[z>>2]|0}c[q>>2]=Q+N;R=Q}else{R=E}G=F+12|0;L=c[G>>2]|0;S=F+16|0;if((L|0)==(c[S>>2]|0)){T=Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0}else{T=d[L]|0}if((ih(T&255,u,v,R,q,D,m,o,x,s,t,w)|0)!=0){J=I;K=R;break}L=c[G>>2]|0;if((L|0)==(c[S>>2]|0)){Cc[c[(c[F>>2]|0)+40>>2]&63](F)|0;n=F;E=R;continue}else{c[G>>2]=L+1;n=F;E=R;continue}}R=a[o]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[o+4>>2]|0}do{if((U|0)!=0){if((a[u]|0)==0){break}R=c[s>>2]|0;if((R-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=R+4;c[R>>2]=E}}while(0);V=+Sl(K,c[q>>2]|0,k);h[l>>3]=V;rj(o,x,c[s>>2]|0,k);do{if((F|0)==0){W=0}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){W=F;break}if(!((Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0)==-1)){W=F;break}c[B>>2]=0;W=0}}while(0);B=(W|0)==0;do{if((J|0)==0){H=51}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(!B){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}if((Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0)==-1){c[f>>2]=0;H=51;break}if(!(B^(J|0)==0)){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}}while(0);do{if((H|0)==51){if(B){break}X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;X=b;c[X>>2]=W;Be(p);Be(o);i=e;return}function Hg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+8|0;l=e;m=i;i=i+16|0;n=i;i=i+32|0;o=i;i=i+16|0;p=i;i=i+8|0;q=i;i=i+16|0;r=i;i=i+160|0;s=o;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;We(p,h);h=p;p=c[h>>2]|0;if(!((c[1290]|0)==-1)){c[m>>2]=5160;c[m+4>>2]=112;c[m+8>>2]=0;we(5160,m,113)}m=(c[5164>>2]|0)+ -1|0;t=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-t>>2>>>0>m>>>0)){u=Bb(4)|0;v=u;um(v);oc(u|0,13120,101)}p=c[t+(m<<2)>>2]|0;if((p|0)==0){u=Bb(4)|0;v=u;um(v);oc(u|0,13120,101)}u=n;Ic[c[(c[p>>2]|0)+32>>2]&7](p,3704,3730|0,u)|0;ce(c[h>>2]|0)|0;h=q;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(q,10,0);if((a[h]&1)==0){p=q+1|0;w=p;x=q+8|0;y=p}else{p=q+8|0;w=q+1|0;x=p;y=c[p>>2]|0}p=f;f=g;g=q;v=q+4|0;m=n+24|0;t=n+25|0;z=r;A=n+26|0;B=n;n=o+4|0;C=c[p>>2]|0;D=y;E=r;r=0;F=y;a:while(1){do{if((C|0)==0){G=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){G=C;break}if(!((Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1)){G=C;break}c[p>>2]=0;G=0}}while(0);y=(G|0)==0;H=c[f>>2]|0;do{if((H|0)==0){I=19}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){if(y){break}else{J=F;break a}}if((Cc[c[(c[H>>2]|0)+36>>2]&63](H)|0)==-1){c[f>>2]=0;I=19;break}else{if(y){break}else{J=F;break a}}}}while(0);if((I|0)==19){I=0;if(y){J=F;break}}H=a[h]|0;K=(H&1)==0;if(K){L=(H&255)>>>1}else{L=c[v>>2]|0}if((D-F|0)==(L|0)){if(K){M=(H&255)>>>1;N=(H&255)>>>1}else{H=c[v>>2]|0;M=H;N=H}Ee(q,N<<1,0);if((a[h]&1)==0){O=10}else{O=(c[g>>2]&-2)+ -1|0}Ee(q,O,0);if((a[h]&1)==0){P=w}else{P=c[x>>2]|0}Q=P+M|0;R=P}else{Q=D;R=F}H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){S=Cc[c[(c[G>>2]|0)+36>>2]&63](G)|0}else{S=d[H]|0}H=S&255;K=(Q|0)==(R|0);do{if(K){T=(a[m]|0)==H<<24>>24;if(!T){if(!((a[t]|0)==H<<24>>24)){I=40;break}}a[Q]=T?43:45;U=Q+1|0;V=E;W=0}else{I=40}}while(0);do{if((I|0)==40){I=0;y=a[s]|0;if((y&1)==0){X=(y&255)>>>1}else{X=c[n>>2]|0}if((X|0)!=0&H<<24>>24==0){if((E-z|0)>=160){U=Q;V=E;W=r;break}c[E>>2]=r;U=Q;V=E+4|0;W=0;break}else{Y=u}while(1){y=Y+1|0;if((a[Y]|0)==H<<24>>24){Z=Y;break}if((y|0)==(A|0)){Z=A;break}else{Y=y}}y=Z-B|0;if((y|0)>23){J=R;break a}if((y|0)<22){a[Q]=a[3704+y|0]|0;U=Q+1|0;V=E;W=r+1|0;break}if(K){J=Q;break a}if((Q-R|0)>=3){J=R;break a}if((a[Q+ -1|0]|0)!=48){J=R;break a}a[Q]=a[3704+y|0]|0;U=Q+1|0;V=E;W=0}}while(0);K=c[p>>2]|0;H=K+12|0;y=c[H>>2]|0;if((y|0)==(c[K+16>>2]|0)){Cc[c[(c[K>>2]|0)+40>>2]&63](K)|0;C=K;D=U;E=V;r=W;F=R;continue}else{c[H>>2]=y+1;C=K;D=U;E=V;r=W;F=R;continue}}a[J+3|0]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}R=ib(2147483647,5064,0)|0;c[1262]=R;eb(5056)}}while(0);R=c[1262]|0;c[l>>2]=k;if((Jg(J,R,3744,l)|0)!=1){c[j>>2]=4}l=c[p>>2]|0;do{if((l|0)==0){_=0}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){_=l;break}if(!((Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1)){_=l;break}c[p>>2]=0;_=0}}while(0);p=(_|0)==0;l=c[f>>2]|0;do{if((l|0)==0){I=72}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!p){break}$=b;c[$>>2]=_;Be(q);Be(o);i=e;return}if((Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1){c[f>>2]=0;I=72;break}if(!(p^(l|0)==0)){break}$=b;c[$>>2]=_;Be(q);Be(o);i=e;return}}while(0);do{if((I|0)==72){if(p){break}$=b;c[$>>2]=_;Be(q);Be(o);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;$=b;c[$>>2]=_;Be(q);Be(o);i=e;return}function Ig(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(a[m+24|0]|0)==b<<24>>24;if(!q){if(!((a[m+25|0]|0)==b<<24>>24)){break}}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;r=0;i=n;return r|0}}while(0);q=a[j]|0;if((q&1)==0){s=(q&255)>>>1}else{s=c[j+4>>2]|0}if((s|0)!=0&b<<24>>24==h<<24>>24){h=c[l>>2]|0;if((h-k|0)>=160){r=0;i=n;return r|0}k=c[g>>2]|0;c[l>>2]=h+4;c[h>>2]=k;c[g>>2]=0;r=0;i=n;return r|0}k=m+26|0;h=m;while(1){l=h+1|0;if((a[h]|0)==b<<24>>24){t=h;break}if((l|0)==(k|0)){t=k;break}else{h=l}}h=t-m|0;if((h|0)>23){r=-1;i=n;return r|0}do{if((d|0)==16){if((h|0)<22){break}if(p){r=-1;i=n;return r|0}if((o-e|0)>=3){r=-1;i=n;return r|0}if((a[o+ -1|0]|0)!=48){r=-1;i=n;return r|0}c[g>>2]=0;m=a[3704+h|0]|0;c[f>>2]=o+1;a[o]=m;r=0;i=n;return r|0}else if((d|0)==10|(d|0)==8){if((h|0)<(d|0)){break}else{r=-1}i=n;return r|0}}while(0);d=a[3704+h|0]|0;c[f>>2]=o+1;a[o]=d;c[g>>2]=(c[g>>2]|0)+1;r=0;i=n;return r|0}function Jg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Fb(b|0)|0;b=Da(a|0,d|0,g|0)|0;if((e|0)==0){i=f;return b|0}Fb(e|0)|0;i=f;return b|0}function Kg(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Lg(a){a=a|0;i=i;return}function Mg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;k=i;i=i+136|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=k+40|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+88|0;v=k+96|0;w=k+104|0;x=k+128|0;if((c[g+4>>2]&1|0)==0){c[q>>2]=-1;y=c[(c[d>>2]|0)+16>>2]|0;z=e;c[s>>2]=c[z>>2];c[t>>2]=c[f>>2];A=n;B=s;c[A+0>>2]=c[B+0>>2];B=m;A=t;c[B+0>>2]=c[A+0>>2];xc[y&63](r,d,n,m,g,h,q);m=c[r>>2]|0;c[z>>2]=m;z=c[q>>2]|0;if((z|0)==0){a[j]=0}else if((z|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=m;i=k;return}We(u,g);m=u;u=c[m>>2]|0;if(!((c[1288]|0)==-1)){c[p>>2]=5152;c[p+4>>2]=112;c[p+8>>2]=0;we(5152,p,113)}p=(c[5156>>2]|0)+ -1|0;z=c[u+8>>2]|0;if(!((c[u+12>>2]|0)-z>>2>>>0>p>>>0)){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}u=c[z+(p<<2)>>2]|0;if((u|0)==0){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}C=u;ce(c[m>>2]|0)|0;We(v,g);g=v;v=c[g>>2]|0;if(!((c[1328]|0)==-1)){c[o>>2]=5312;c[o+4>>2]=112;c[o+8>>2]=0;we(5312,o,113)}o=(c[5316>>2]|0)+ -1|0;m=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-m>>2>>>0>o>>>0)){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}v=c[m+(o<<2)>>2]|0;if((v|0)==0){E=Bb(4)|0;F=E;um(F);oc(E|0,13120,101)}E=v;ce(c[g>>2]|0)|0;g=w;F=v;Ac[c[(c[F>>2]|0)+24>>2]&63](g,E);Ac[c[(c[F>>2]|0)+28>>2]&63](w+12|0,E);c[x>>2]=c[f>>2];f=w+24|0;E=l;F=x;c[E+0>>2]=c[F+0>>2];F=Ng(e,l,g,f,C,h,1)|0;a[j]=(F|0)==(g|0)|0;c[b>>2]=c[e>>2];Ne(w+12|0);Ne(w);i=k;return}function Ng(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0;k=i;i=i+104|0;l=(f-e|0)/12|0;m=k;do{if(l>>>0>100){n=Pm(l)|0;if((n|0)!=0){o=n;p=n;break}$m()}else{o=0;p=m}}while(0);m=(e|0)==(f|0);if(m){q=0;r=l}else{n=e;s=0;t=l;l=p;while(1){u=a[n]|0;if((u&1)==0){v=(u&255)>>>1}else{v=c[n+4>>2]|0}if((v|0)==0){a[l]=2;w=s+1|0;x=t+ -1|0}else{a[l]=1;w=s;x=t}u=n+12|0;if((u|0)==(f|0)){q=w;r=x;break}else{n=u;s=w;t=x;l=l+1|0}}}l=b;b=d;d=g;x=0;t=q;q=r;a:while(1){r=c[l>>2]|0;do{if((r|0)==0){y=1}else{w=c[r+12>>2]|0;if((w|0)==(c[r+16>>2]|0)){z=Cc[c[(c[r>>2]|0)+36>>2]&63](r)|0}else{z=c[w>>2]|0}if((z|0)==-1){c[l>>2]=0;y=1;break}else{y=(c[l>>2]|0)==0;break}}}while(0);r=c[b>>2]|0;do{if((r|0)==0){A=0;B=1}else{w=c[r+12>>2]|0;if((w|0)==(c[r+16>>2]|0)){C=Cc[c[(c[r>>2]|0)+36>>2]&63](r)|0}else{C=c[w>>2]|0}if(!((C|0)==-1)){A=r;B=0;break}c[b>>2]=0;A=0;B=1}}while(0);D=c[l>>2]|0;if(!((y^B)&(q|0)!=0)){break}r=c[D+12>>2]|0;if((r|0)==(c[D+16>>2]|0)){E=Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{E=c[r>>2]|0}if(j){F=E}else{F=Lc[c[(c[d>>2]|0)+28>>2]&15](g,E)|0}r=x+1|0;if(m){x=r;q=q;t=t;continue}b:do{if(j){w=0;s=e;n=t;v=q;u=p;while(1){do{if((a[u]|0)==1){G=a[s]|0;H=(G&1)==0;if(H){I=s+4|0}else{I=c[s+8>>2]|0}if((F|0)!=(c[I+(x<<2)>>2]|0)){a[u]=0;J=w;K=n;L=v+ -1|0;break}if(H){M=(G&255)>>>1}else{M=c[s+4>>2]|0}if((M|0)!=(r|0)){J=1;K=n;L=v;break}a[u]=2;J=1;K=n+1|0;L=v+ -1|0}else{J=w;K=n;L=v}}while(0);G=s+12|0;if((G|0)==(f|0)){N=J;O=K;P=L;break b}w=J;s=G;n=K;v=L;u=u+1|0}}else{u=0;v=e;n=t;s=q;w=p;while(1){do{if((a[w]|0)==1){G=v;if((a[G]&1)==0){Q=v+4|0}else{Q=c[v+8>>2]|0}if((F|0)!=(Lc[c[(c[d>>2]|0)+28>>2]&15](g,c[Q+(x<<2)>>2]|0)|0)){a[w]=0;R=u;S=n;T=s+ -1|0;break}H=a[G]|0;if((H&1)==0){U=(H&255)>>>1}else{U=c[v+4>>2]|0}if((U|0)!=(r|0)){R=1;S=n;T=s;break}a[w]=2;R=1;S=n+1|0;T=s+ -1|0}else{R=u;S=n;T=s}}while(0);H=v+12|0;if((H|0)==(f|0)){N=R;O=S;P=T;break b}u=R;v=H;n=S;s=T;w=w+1|0}}}while(0);if(!N){x=r;t=O;q=P;continue}w=c[l>>2]|0;s=w+12|0;n=c[s>>2]|0;if((n|0)==(c[w+16>>2]|0)){Cc[c[(c[w>>2]|0)+40>>2]&63](w)|0}else{c[s>>2]=n+4}if((P+O|0)>>>0<2){x=r;t=O;q=P;continue}else{V=e;W=O;X=p}while(1){do{if((a[X]|0)==2){n=a[V]|0;if((n&1)==0){Y=(n&255)>>>1}else{Y=c[V+4>>2]|0}if((Y|0)==(r|0)){Z=W;break}a[X]=0;Z=W+ -1|0}else{Z=W}}while(0);n=V+12|0;if((n|0)==(f|0)){x=r;t=Z;q=P;continue a}else{V=n;W=Z;X=X+1|0}}}do{if((D|0)==0){_=1}else{X=c[D+12>>2]|0;if((X|0)==(c[D+16>>2]|0)){$=Cc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{$=c[X>>2]|0}if(($|0)==-1){c[l>>2]=0;_=1;break}else{_=(c[l>>2]|0)==0;break}}}while(0);do{if((A|0)==0){aa=85}else{l=c[A+12>>2]|0;if((l|0)==(c[A+16>>2]|0)){ba=Cc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{ba=c[l>>2]|0}if((ba|0)==-1){c[b>>2]=0;aa=85;break}else{if(_){break}else{aa=87;break}}}}while(0);if((aa|0)==85){if(_){aa=87}}if((aa|0)==87){c[h>>2]=c[h>>2]|2}c:do{if(m){aa=92}else{if((a[p]|0)==2){ca=e;break}else{da=e;ea=p}while(1){_=da+12|0;b=ea+1|0;if((_|0)==(f|0)){aa=92;break c}if((a[b]|0)==2){ca=_;break}else{ea=b;da=_}}}}while(0);if((aa|0)==92){c[h>>2]=c[h>>2]|4;ca=f}if((o|0)==0){i=k;return ca|0}Qm(o);i=k;return ca|0}function Og(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Pg(a,0,k,j,f,g,h);i=b;return}function Pg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;jh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=Cc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;J=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;J=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){K=(w&255)>>>1}else{K=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(K|0)){if(F){L=(w&255)>>>1;M=(w&255)>>>1}else{w=c[y>>2]|0;L=w;M=w}Ee(n,M<<1,0);if((a[g]&1)==0){N=10}else{N=(c[f>>2]&-2)+ -1|0}Ee(n,N,0);if((a[g]&1)==0){O=u}else{O=c[v>>2]|0}c[o>>2]=O+L;P=O}else{P=A}w=B+12|0;F=c[w>>2]|0;Q=B+16|0;if((F|0)==(c[Q>>2]|0)){R=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{R=c[F>>2]|0}if((fh(R,t,P,o,r,z,m,k,q,s)|0)!=0){I=H;J=P;break}F=c[w>>2]|0;if((F|0)==(c[Q>>2]|0)){Cc[c[(c[B>>2]|0)+40>>2]&63](B)|0;l=B;A=P;continue}else{c[w>>2]=F+4;l=B;A=P;continue}}P=a[m]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[m+4>>2]|0}do{if((S|0)!=0){P=c[q>>2]|0;if((P-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=A}}while(0);r=_l(J,c[o>>2]|0,h,t)|0;c[j>>2]=r;rj(m,k,c[q>>2]|0,h);do{if((B|0)==0){T=0;U=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){V=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{V=c[q>>2]|0}if(!((V|0)==-1)){T=B;U=0;break}c[x>>2]=0;T=0;U=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){W=Cc[c[(c[I>>2]|0)+36>>2]&63](I)|0}else{W=c[x>>2]|0}if((W|0)==-1){c[e>>2]=0;E=60;break}if(!U){break}X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}}while(0);do{if((E|0)==60){if(U){break}X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}function Qg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Rg(a,0,k,j,f,g,h);i=b;return}function Rg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}s=k;jh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=Cc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{J=w;K=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){J=0;K=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){L=(w&255)>>>1}else{L=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(L|0)){if(F){M=(w&255)>>>1;N=(w&255)>>>1}else{w=c[y>>2]|0;M=w;N=w}Ee(n,N<<1,0);if((a[g]&1)==0){O=10}else{O=(c[f>>2]&-2)+ -1|0}Ee(n,O,0);if((a[g]&1)==0){P=u}else{P=c[v>>2]|0}c[o>>2]=P+M;Q=P}else{Q=A}w=B+12|0;F=c[w>>2]|0;R=B+16|0;if((F|0)==(c[R>>2]|0)){S=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{S=c[F>>2]|0}if((fh(S,t,Q,o,r,z,m,k,q,s)|0)!=0){J=H;K=Q;break}F=c[w>>2]|0;if((F|0)==(c[R>>2]|0)){Cc[c[(c[B>>2]|0)+40>>2]&63](B)|0;l=B;A=Q;continue}else{c[w>>2]=F+4;l=B;A=Q;continue}}Q=a[m]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[m+4>>2]|0}do{if((T|0)!=0){Q=c[q>>2]|0;if((Q-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=Q+4;c[Q>>2]=A}}while(0);r=Zl(K,c[o>>2]|0,h,t)|0;t=j;c[t>>2]=r;c[t+4>>2]=I;rj(m,k,c[q>>2]|0,h);do{if((B|0)==0){U=0;V=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){W=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{W=c[q>>2]|0}if(!((W|0)==-1)){U=B;V=0;break}c[x>>2]=0;U=0;V=1}}while(0);do{if((J|0)==0){E=60}else{x=c[J+12>>2]|0;if((x|0)==(c[J+16>>2]|0)){X=Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0}else{X=c[x>>2]|0}if((X|0)==-1){c[e>>2]=0;E=60;break}if(!V){break}Y=b;c[Y>>2]=U;Be(n);Be(m);i=d;return}}while(0);do{if((E|0)==60){if(V){break}Y=b;c[Y>>2]=U;Be(n);Be(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;Y=b;c[Y>>2]=U;Be(n);Be(m);i=d;return}function Sg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Tg(a,0,k,j,f,g,h);i=b;return}function Tg(d,e,f,g,h,j,k){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+328|0;l=e;m=e+104|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+152|0;r=e+312|0;s=e+320|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==64){u=8}else if((t|0)==0){u=0}else{u=10}t=l;jh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=c[m>>2]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0;D=1}else{x=c[m+12>>2]|0;if((x|0)==(c[m+16>>2]|0)){E=Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{E=c[x>>2]|0}if(!((E|0)==-1)){C=m;D=0;break}c[y>>2]=0;C=0;D=1}}while(0);x=c[f>>2]|0;do{if((x|0)==0){F=21}else{G=c[x+12>>2]|0;if((G|0)==(c[x+16>>2]|0)){H=Cc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=21;break}else{if(D){I=x;break}else{J=x;K=B;break a}}}}while(0);if((F|0)==21){F=0;if(D){J=0;K=B;break}else{I=0}}x=a[h]|0;G=(x&1)==0;if(G){L=(x&255)>>>1}else{L=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(L|0)){if(G){M=(x&255)>>>1;N=(x&255)>>>1}else{x=c[z>>2]|0;M=x;N=x}Ee(o,N<<1,0);if((a[h]&1)==0){O=10}else{O=(c[g>>2]&-2)+ -1|0}Ee(o,O,0);if((a[h]&1)==0){P=v}else{P=c[w>>2]|0}c[p>>2]=P+M;Q=P}else{Q=B}x=C+12|0;G=c[x>>2]|0;R=C+16|0;if((G|0)==(c[R>>2]|0)){S=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{S=c[G>>2]|0}if((fh(S,u,Q,p,s,A,n,l,r,t)|0)!=0){J=I;K=Q;break}G=c[x>>2]|0;if((G|0)==(c[R>>2]|0)){Cc[c[(c[C>>2]|0)+40>>2]&63](C)|0;m=C;B=Q;continue}else{c[x>>2]=G+4;m=C;B=Q;continue}}Q=a[n]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[n+4>>2]|0}do{if((T|0)!=0){Q=c[r>>2]|0;if((Q-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=Q+4;c[Q>>2]=B}}while(0);s=Yl(K,c[p>>2]|0,j,u)|0;b[k>>1]=s;rj(n,l,c[r>>2]|0,j);do{if((C|0)==0){U=0;V=1}else{r=c[C+12>>2]|0;if((r|0)==(c[C+16>>2]|0)){W=Cc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{W=c[r>>2]|0}if(!((W|0)==-1)){U=C;V=0;break}c[y>>2]=0;U=0;V=1}}while(0);do{if((J|0)==0){F=60}else{y=c[J+12>>2]|0;if((y|0)==(c[J+16>>2]|0)){X=Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0}else{X=c[y>>2]|0}if((X|0)==-1){c[f>>2]=0;F=60;break}if(!V){break}Y=d;c[Y>>2]=U;Be(o);Be(n);i=e;return}}while(0);do{if((F|0)==60){if(V){break}Y=d;c[Y>>2]=U;Be(o);Be(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Y=d;c[Y>>2]=U;Be(o);Be(n);i=e;return}function Ug(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Vg(a,0,k,j,f,g,h);i=b;return}function Vg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;jh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=Cc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;J=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;J=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){K=(w&255)>>>1}else{K=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(K|0)){if(F){L=(w&255)>>>1;M=(w&255)>>>1}else{w=c[y>>2]|0;L=w;M=w}Ee(n,M<<1,0);if((a[g]&1)==0){N=10}else{N=(c[f>>2]&-2)+ -1|0}Ee(n,N,0);if((a[g]&1)==0){O=u}else{O=c[v>>2]|0}c[o>>2]=O+L;P=O}else{P=A}w=B+12|0;F=c[w>>2]|0;Q=B+16|0;if((F|0)==(c[Q>>2]|0)){R=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{R=c[F>>2]|0}if((fh(R,t,P,o,r,z,m,k,q,s)|0)!=0){I=H;J=P;break}F=c[w>>2]|0;if((F|0)==(c[Q>>2]|0)){Cc[c[(c[B>>2]|0)+40>>2]&63](B)|0;l=B;A=P;continue}else{c[w>>2]=F+4;l=B;A=P;continue}}P=a[m]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[m+4>>2]|0}do{if((S|0)!=0){P=c[q>>2]|0;if((P-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=A}}while(0);r=Xl(J,c[o>>2]|0,h,t)|0;c[j>>2]=r;rj(m,k,c[q>>2]|0,h);do{if((B|0)==0){T=0;U=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){V=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{V=c[q>>2]|0}if(!((V|0)==-1)){T=B;U=0;break}c[x>>2]=0;T=0;U=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){W=Cc[c[(c[I>>2]|0)+36>>2]&63](I)|0}else{W=c[x>>2]|0}if((W|0)==-1){c[e>>2]=0;E=60;break}if(!U){break}X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}}while(0);do{if((E|0)==60){if(U){break}X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}function Wg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Xg(a,0,k,j,f,g,h);i=b;return}function Xg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;jh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=Cc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;J=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;J=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){K=(w&255)>>>1}else{K=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(K|0)){if(F){L=(w&255)>>>1;M=(w&255)>>>1}else{w=c[y>>2]|0;L=w;M=w}Ee(n,M<<1,0);if((a[g]&1)==0){N=10}else{N=(c[f>>2]&-2)+ -1|0}Ee(n,N,0);if((a[g]&1)==0){O=u}else{O=c[v>>2]|0}c[o>>2]=O+L;P=O}else{P=A}w=B+12|0;F=c[w>>2]|0;Q=B+16|0;if((F|0)==(c[Q>>2]|0)){R=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{R=c[F>>2]|0}if((fh(R,t,P,o,r,z,m,k,q,s)|0)!=0){I=H;J=P;break}F=c[w>>2]|0;if((F|0)==(c[Q>>2]|0)){Cc[c[(c[B>>2]|0)+40>>2]&63](B)|0;l=B;A=P;continue}else{c[w>>2]=F+4;l=B;A=P;continue}}P=a[m]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[m+4>>2]|0}do{if((S|0)!=0){P=c[q>>2]|0;if((P-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=A}}while(0);r=Wl(J,c[o>>2]|0,h,t)|0;c[j>>2]=r;rj(m,k,c[q>>2]|0,h);do{if((B|0)==0){T=0;U=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){V=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{V=c[q>>2]|0}if(!((V|0)==-1)){T=B;U=0;break}c[x>>2]=0;T=0;U=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){W=Cc[c[(c[I>>2]|0)+36>>2]&63](I)|0}else{W=c[x>>2]|0}if((W|0)==-1){c[e>>2]=0;E=60;break}if(!U){break}X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}}while(0);do{if((E|0)==60){if(U){break}X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;X=b;c[X>>2]=T;Be(n);Be(m);i=d;return}function Yg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Zg(a,0,k,j,f,g,h);i=b;return}function Zg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;jh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=Cc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=Cc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{J=w;K=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){J=0;K=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){L=(w&255)>>>1}else{L=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(L|0)){if(F){M=(w&255)>>>1;N=(w&255)>>>1}else{w=c[y>>2]|0;M=w;N=w}Ee(n,N<<1,0);if((a[g]&1)==0){O=10}else{O=(c[f>>2]&-2)+ -1|0}Ee(n,O,0);if((a[g]&1)==0){P=u}else{P=c[v>>2]|0}c[o>>2]=P+M;Q=P}else{Q=A}w=B+12|0;F=c[w>>2]|0;R=B+16|0;if((F|0)==(c[R>>2]|0)){S=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{S=c[F>>2]|0}if((fh(S,t,Q,o,r,z,m,k,q,s)|0)!=0){J=H;K=Q;break}F=c[w>>2]|0;if((F|0)==(c[R>>2]|0)){Cc[c[(c[B>>2]|0)+40>>2]&63](B)|0;l=B;A=Q;continue}else{c[w>>2]=F+4;l=B;A=Q;continue}}Q=a[m]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[m+4>>2]|0}do{if((T|0)!=0){Q=c[q>>2]|0;if((Q-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=Q+4;c[Q>>2]=A}}while(0);r=Vl(K,c[o>>2]|0,h,t)|0;t=j;c[t>>2]=r;c[t+4>>2]=I;rj(m,k,c[q>>2]|0,h);do{if((B|0)==0){U=0;V=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){W=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{W=c[q>>2]|0}if(!((W|0)==-1)){U=B;V=0;break}c[x>>2]=0;U=0;V=1}}while(0);do{if((J|0)==0){E=60}else{x=c[J+12>>2]|0;if((x|0)==(c[J+16>>2]|0)){X=Cc[c[(c[J>>2]|0)+36>>2]&63](J)|0}else{X=c[x>>2]|0}if((X|0)==-1){c[e>>2]=0;E=60;break}if(!V){break}Y=b;c[Y>>2]=U;Be(n);Be(m);i=d;return}}while(0);do{if((E|0)==60){if(V){break}Y=b;c[Y>>2]=U;Be(n);Be(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;Y=b;c[Y>>2]=U;Be(n);Be(m);i=d;return}function _g(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];$g(a,0,k,j,f,g,h);i=b;return}function $g(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0.0,X=0,Y=0,Z=0,_=0,$=0;d=i;i=i+376|0;l=d+128|0;m=d+136|0;n=d+144|0;o=d+160|0;p=d+176|0;q=d+184|0;r=d+344|0;s=d+352|0;t=d+360|0;u=d+368|0;v=d;kh(n,h,v,l,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;Ee(o,10,0);if((a[h]&1)==0){w=o+1|0;x=w;y=o+8|0;z=w}else{w=o+8|0;x=o+1|0;y=w;z=c[w>>2]|0}c[p>>2]=z;w=q;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;A=e;e=f;f=o;B=o+4|0;C=c[l>>2]|0;l=c[m>>2]|0;m=c[A>>2]|0;D=z;a:while(1){do{if((m|0)==0){E=0;F=1}else{z=c[m+12>>2]|0;if((z|0)==(c[m+16>>2]|0)){G=Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){E=m;F=0;break}c[A>>2]=0;E=0;F=1}}while(0);z=c[e>>2]|0;do{if((z|0)==0){H=17}else{I=c[z+12>>2]|0;if((I|0)==(c[z+16>>2]|0)){J=Cc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{J=c[I>>2]|0}if((J|0)==-1){c[e>>2]=0;H=17;break}else{if(F){K=z;break}else{L=z;M=D;break a}}}}while(0);if((H|0)==17){H=0;if(F){L=0;M=D;break}else{K=0}}z=a[h]|0;I=(z&1)==0;if(I){N=(z&255)>>>1}else{N=c[B>>2]|0}if(((c[p>>2]|0)-D|0)==(N|0)){if(I){O=(z&255)>>>1;P=(z&255)>>>1}else{z=c[B>>2]|0;O=z;P=z}Ee(o,P<<1,0);if((a[h]&1)==0){Q=10}else{Q=(c[f>>2]&-2)+ -1|0}Ee(o,Q,0);if((a[h]&1)==0){R=x}else{R=c[y>>2]|0}c[p>>2]=R+O;S=R}else{S=D}z=E+12|0;I=c[z>>2]|0;T=E+16|0;if((I|0)==(c[T>>2]|0)){U=Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{U=c[I>>2]|0}if((lh(U,t,u,S,p,C,l,n,w,r,s,v)|0)!=0){L=K;M=S;break}I=c[z>>2]|0;if((I|0)==(c[T>>2]|0)){Cc[c[(c[E>>2]|0)+40>>2]&63](E)|0;m=E;D=S;continue}else{c[z>>2]=I+4;m=E;D=S;continue}}S=a[n]|0;if((S&1)==0){V=(S&255)>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){if((a[t]|0)==0){break}S=c[r>>2]|0;if((S-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=S+4;c[S>>2]=D}}while(0);W=+Ul(M,c[p>>2]|0,j);g[k>>2]=W;rj(n,w,c[r>>2]|0,j);do{if((E|0)==0){X=0;Y=1}else{r=c[E+12>>2]|0;if((r|0)==(c[E+16>>2]|0)){Z=Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{Z=c[r>>2]|0}if(!((Z|0)==-1)){X=E;Y=0;break}c[A>>2]=0;X=0;Y=1}}while(0);do{if((L|0)==0){H=57}else{A=c[L+12>>2]|0;if((A|0)==(c[L+16>>2]|0)){_=Cc[c[(c[L>>2]|0)+36>>2]&63](L)|0}else{_=c[A>>2]|0}if((_|0)==-1){c[e>>2]=0;H=57;break}if(!Y){break}$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}}while(0);do{if((H|0)==57){if(Y){break}$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}}while(0);c[j>>2]=c[j>>2]|2;$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}function ah(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];bh(a,0,k,j,f,g,h);i=b;return}function bh(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0.0,X=0,Y=0,Z=0,_=0,$=0;d=i;i=i+376|0;l=d+128|0;m=d+136|0;n=d+144|0;o=d+160|0;p=d+176|0;q=d+184|0;r=d+344|0;s=d+352|0;t=d+360|0;u=d+368|0;v=d;kh(n,g,v,l,m);g=o;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(o,10,0);if((a[g]&1)==0){w=o+1|0;x=w;y=o+8|0;z=w}else{w=o+8|0;x=o+1|0;y=w;z=c[w>>2]|0}c[p>>2]=z;w=q;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;A=e;e=f;f=o;B=o+4|0;C=c[l>>2]|0;l=c[m>>2]|0;m=c[A>>2]|0;D=z;a:while(1){do{if((m|0)==0){E=0;F=1}else{z=c[m+12>>2]|0;if((z|0)==(c[m+16>>2]|0)){G=Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){E=m;F=0;break}c[A>>2]=0;E=0;F=1}}while(0);z=c[e>>2]|0;do{if((z|0)==0){H=17}else{I=c[z+12>>2]|0;if((I|0)==(c[z+16>>2]|0)){J=Cc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{J=c[I>>2]|0}if((J|0)==-1){c[e>>2]=0;H=17;break}else{if(F){K=z;break}else{L=z;M=D;break a}}}}while(0);if((H|0)==17){H=0;if(F){L=0;M=D;break}else{K=0}}z=a[g]|0;I=(z&1)==0;if(I){N=(z&255)>>>1}else{N=c[B>>2]|0}if(((c[p>>2]|0)-D|0)==(N|0)){if(I){O=(z&255)>>>1;P=(z&255)>>>1}else{z=c[B>>2]|0;O=z;P=z}Ee(o,P<<1,0);if((a[g]&1)==0){Q=10}else{Q=(c[f>>2]&-2)+ -1|0}Ee(o,Q,0);if((a[g]&1)==0){R=x}else{R=c[y>>2]|0}c[p>>2]=R+O;S=R}else{S=D}z=E+12|0;I=c[z>>2]|0;T=E+16|0;if((I|0)==(c[T>>2]|0)){U=Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{U=c[I>>2]|0}if((lh(U,t,u,S,p,C,l,n,w,r,s,v)|0)!=0){L=K;M=S;break}I=c[z>>2]|0;if((I|0)==(c[T>>2]|0)){Cc[c[(c[E>>2]|0)+40>>2]&63](E)|0;m=E;D=S;continue}else{c[z>>2]=I+4;m=E;D=S;continue}}S=a[n]|0;if((S&1)==0){V=(S&255)>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){if((a[t]|0)==0){break}S=c[r>>2]|0;if((S-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=S+4;c[S>>2]=D}}while(0);W=+Tl(M,c[p>>2]|0,j);h[k>>3]=W;rj(n,w,c[r>>2]|0,j);do{if((E|0)==0){X=0;Y=1}else{r=c[E+12>>2]|0;if((r|0)==(c[E+16>>2]|0)){Z=Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{Z=c[r>>2]|0}if(!((Z|0)==-1)){X=E;Y=0;break}c[A>>2]=0;X=0;Y=1}}while(0);do{if((L|0)==0){H=57}else{A=c[L+12>>2]|0;if((A|0)==(c[L+16>>2]|0)){_=Cc[c[(c[L>>2]|0)+36>>2]&63](L)|0}else{_=c[A>>2]|0}if((_|0)==-1){c[e>>2]=0;H=57;break}if(!Y){break}$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}}while(0);do{if((H|0)==57){if(Y){break}$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}}while(0);c[j>>2]=c[j>>2]|2;$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}function ch(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];dh(a,0,k,j,f,g,h);i=b;return}function dh(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0.0,X=0,Y=0,Z=0,_=0,$=0;d=i;i=i+376|0;l=d+128|0;m=d+136|0;n=d+144|0;o=d+160|0;p=d+176|0;q=d+184|0;r=d+344|0;s=d+352|0;t=d+360|0;u=d+368|0;v=d;kh(n,g,v,l,m);g=o;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(o,10,0);if((a[g]&1)==0){w=o+1|0;x=w;y=o+8|0;z=w}else{w=o+8|0;x=o+1|0;y=w;z=c[w>>2]|0}c[p>>2]=z;w=q;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;A=e;e=f;f=o;B=o+4|0;C=c[l>>2]|0;l=c[m>>2]|0;m=c[A>>2]|0;D=z;a:while(1){do{if((m|0)==0){E=0;F=1}else{z=c[m+12>>2]|0;if((z|0)==(c[m+16>>2]|0)){G=Cc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){E=m;F=0;break}c[A>>2]=0;E=0;F=1}}while(0);z=c[e>>2]|0;do{if((z|0)==0){H=17}else{I=c[z+12>>2]|0;if((I|0)==(c[z+16>>2]|0)){J=Cc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{J=c[I>>2]|0}if((J|0)==-1){c[e>>2]=0;H=17;break}else{if(F){K=z;break}else{L=z;M=D;break a}}}}while(0);if((H|0)==17){H=0;if(F){L=0;M=D;break}else{K=0}}z=a[g]|0;I=(z&1)==0;if(I){N=(z&255)>>>1}else{N=c[B>>2]|0}if(((c[p>>2]|0)-D|0)==(N|0)){if(I){O=(z&255)>>>1;P=(z&255)>>>1}else{z=c[B>>2]|0;O=z;P=z}Ee(o,P<<1,0);if((a[g]&1)==0){Q=10}else{Q=(c[f>>2]&-2)+ -1|0}Ee(o,Q,0);if((a[g]&1)==0){R=x}else{R=c[y>>2]|0}c[p>>2]=R+O;S=R}else{S=D}z=E+12|0;I=c[z>>2]|0;T=E+16|0;if((I|0)==(c[T>>2]|0)){U=Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{U=c[I>>2]|0}if((lh(U,t,u,S,p,C,l,n,w,r,s,v)|0)!=0){L=K;M=S;break}I=c[z>>2]|0;if((I|0)==(c[T>>2]|0)){Cc[c[(c[E>>2]|0)+40>>2]&63](E)|0;m=E;D=S;continue}else{c[z>>2]=I+4;m=E;D=S;continue}}S=a[n]|0;if((S&1)==0){V=(S&255)>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){if((a[t]|0)==0){break}S=c[r>>2]|0;if((S-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=S+4;c[S>>2]=D}}while(0);W=+Sl(M,c[p>>2]|0,j);h[k>>3]=W;rj(n,w,c[r>>2]|0,j);do{if((E|0)==0){X=0;Y=1}else{r=c[E+12>>2]|0;if((r|0)==(c[E+16>>2]|0)){Z=Cc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{Z=c[r>>2]|0}if(!((Z|0)==-1)){X=E;Y=0;break}c[A>>2]=0;X=0;Y=1}}while(0);do{if((L|0)==0){H=57}else{A=c[L+12>>2]|0;if((A|0)==(c[L+16>>2]|0)){_=Cc[c[(c[L>>2]|0)+36>>2]&63](L)|0}else{_=c[A>>2]|0}if((_|0)==-1){c[e>>2]=0;H=57;break}if(!Y){break}$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}}while(0);do{if((H|0)==57){if(Y){break}$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}}while(0);c[j>>2]=c[j>>2]|2;$=b;c[$>>2]=X;Be(o);Be(n);i=d;return}function eh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0;d=i;i=i+8|0;k=d;l=i;i=i+16|0;m=i;i=i+104|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+160|0;r=n;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;We(o,g);g=o;o=c[g>>2]|0;if(!((c[1288]|0)==-1)){c[l>>2]=5152;c[l+4>>2]=112;c[l+8>>2]=0;we(5152,l,113)}l=(c[5156>>2]|0)+ -1|0;s=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-s>>2>>>0>l>>>0)){t=Bb(4)|0;u=t;um(u);oc(t|0,13120,101)}o=c[s+(l<<2)>>2]|0;if((o|0)==0){t=Bb(4)|0;u=t;um(u);oc(t|0,13120,101)}t=m;Ic[c[(c[o>>2]|0)+48>>2]&7](o,3704,3730|0,t)|0;ce(c[g>>2]|0)|0;g=p;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;Ee(p,10,0);if((a[g]&1)==0){o=p+1|0;v=o;w=p+8|0;x=o}else{o=p+8|0;v=p+1|0;w=o;x=c[o>>2]|0}o=e;e=f;f=p;u=p+4|0;l=m+96|0;s=m+100|0;y=q;z=m+104|0;A=m;m=n+4|0;B=c[o>>2]|0;C=x;D=q;q=0;E=x;a:while(1){do{if((B|0)==0){F=0;G=1}else{x=c[B+12>>2]|0;if((x|0)==(c[B+16>>2]|0)){H=Cc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{H=c[x>>2]|0}if(!((H|0)==-1)){F=B;G=0;break}c[o>>2]=0;F=0;G=1}}while(0);x=c[e>>2]|0;do{if((x|0)==0){I=22}else{J=c[x+12>>2]|0;if((J|0)==(c[x+16>>2]|0)){K=Cc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{K=c[J>>2]|0}if((K|0)==-1){c[e>>2]=0;I=22;break}else{if(G){break}else{L=E;break a}}}}while(0);if((I|0)==22){I=0;if(G){L=E;break}}x=a[g]|0;J=(x&1)==0;if(J){M=(x&255)>>>1}else{M=c[u>>2]|0}if((C-E|0)==(M|0)){if(J){N=(x&255)>>>1;O=(x&255)>>>1}else{x=c[u>>2]|0;N=x;O=x}Ee(p,O<<1,0);if((a[g]&1)==0){P=10}else{P=(c[f>>2]&-2)+ -1|0}Ee(p,P,0);if((a[g]&1)==0){Q=v}else{Q=c[w>>2]|0}R=Q+N|0;S=Q}else{R=C;S=E}x=c[F+12>>2]|0;if((x|0)==(c[F+16>>2]|0)){T=Cc[c[(c[F>>2]|0)+36>>2]&63](F)|0}else{T=c[x>>2]|0}x=(R|0)==(S|0);do{if(x){J=(c[l>>2]|0)==(T|0);if(!J){if((c[s>>2]|0)!=(T|0)){I=43;break}}a[R]=J?43:45;U=R+1|0;V=D;W=0}else{I=43}}while(0);do{if((I|0)==43){I=0;J=a[r]|0;if((J&1)==0){X=(J&255)>>>1}else{X=c[m>>2]|0}if((X|0)!=0&(T|0)==0){if((D-y|0)>=160){U=R;V=D;W=q;break}c[D>>2]=q;U=R;V=D+4|0;W=0;break}else{Y=t}while(1){J=Y+4|0;if((c[Y>>2]|0)==(T|0)){Z=Y;break}if((J|0)==(z|0)){Z=z;break}else{Y=J}}J=Z-A|0;_=J>>2;if((J|0)>92){L=S;break a}if((J|0)<88){a[R]=a[3704+_|0]|0;U=R+1|0;V=D;W=q+1|0;break}if(x){L=R;break a}if((R-S|0)>=3){L=S;break a}if((a[R+ -1|0]|0)!=48){L=S;break a}a[R]=a[3704+_|0]|0;U=R+1|0;V=D;W=0}}while(0);x=c[o>>2]|0;_=x+12|0;J=c[_>>2]|0;if((J|0)==(c[x+16>>2]|0)){Cc[c[(c[x>>2]|0)+40>>2]&63](x)|0;B=x;C=U;D=V;q=W;E=S;continue}else{c[_>>2]=J+4;B=x;C=U;D=V;q=W;E=S;continue}}a[L+3|0]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}S=ib(2147483647,5064,0)|0;c[1262]=S;eb(5056)}}while(0);S=c[1262]|0;c[k>>2]=j;if((Jg(L,S,3744,k)|0)!=1){c[h>>2]=4}k=c[o>>2]|0;do{if((k|0)==0){$=0;aa=1}else{S=c[k+12>>2]|0;if((S|0)==(c[k+16>>2]|0)){ba=Cc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{ba=c[S>>2]|0}if(!((ba|0)==-1)){$=k;aa=0;break}c[o>>2]=0;$=0;aa=1}}while(0);o=c[e>>2]|0;do{if((o|0)==0){I=78}else{k=c[o+12>>2]|0;if((k|0)==(c[o+16>>2]|0)){ca=Cc[c[(c[o>>2]|0)+36>>2]&63](o)|0}else{ca=c[k>>2]|0}if((ca|0)==-1){c[e>>2]=0;I=78;break}if(!aa){break}da=b;c[da>>2]=$;Be(p);Be(n);i=d;return}}while(0);do{if((I|0)==78){if(aa){break}da=b;c[da>>2]=$;Be(p);Be(n);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;da=b;c[da>>2]=$;Be(p);Be(n);i=d;return}function fh(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(c[m+96>>2]|0)==(b|0);if(!q){if((c[m+100>>2]|0)!=(b|0)){break}}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;r=0;i=n;return r|0}}while(0);q=a[j]|0;if((q&1)==0){s=(q&255)>>>1}else{s=c[j+4>>2]|0}if((s|0)!=0&(b|0)==(h|0)){h=c[l>>2]|0;if((h-k|0)>=160){r=0;i=n;return r|0}k=c[g>>2]|0;c[l>>2]=h+4;c[h>>2]=k;c[g>>2]=0;r=0;i=n;return r|0}k=m+104|0;h=m;while(1){l=h+4|0;if((c[h>>2]|0)==(b|0)){t=h;break}if((l|0)==(k|0)){t=k;break}else{h=l}}h=t-m|0;m=h>>2;if((h|0)>92){r=-1;i=n;return r|0}do{if((d|0)==10|(d|0)==8){if((m|0)<(d|0)){break}else{r=-1}i=n;return r|0}else if((d|0)==16){if((h|0)<88){break}if(p){r=-1;i=n;return r|0}if((o-e|0)>=3){r=-1;i=n;return r|0}if((a[o+ -1|0]|0)!=48){r=-1;i=n;return r|0}c[g>>2]=0;t=a[3704+m|0]|0;c[f>>2]=o+1;a[o]=t;r=0;i=n;return r|0}}while(0);e=a[3704+m|0]|0;c[f>>2]=o+1;a[o]=e;c[g>>2]=(c[g>>2]|0)+1;r=0;i=n;return r|0}function gh(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+40|0;h=g;j=g+16|0;k=g+32|0;We(k,d);d=k;k=c[d>>2]|0;if(!((c[1290]|0)==-1)){c[j>>2]=5160;c[j+4>>2]=112;c[j+8>>2]=0;we(5160,j,113)}j=(c[5164>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>j>>>0)){m=Bb(4)|0;n=m;um(n);oc(m|0,13120,101)}k=c[l+(j<<2)>>2]|0;if((k|0)==0){m=Bb(4)|0;n=m;um(n);oc(m|0,13120,101)}Ic[c[(c[k>>2]|0)+32>>2]&7](k,3704,3730|0,e)|0;e=c[d>>2]|0;if(!((c[1326]|0)==-1)){c[h>>2]=5304;c[h+4>>2]=112;c[h+8>>2]=0;we(5304,h,113)}h=(c[5308>>2]|0)+ -1|0;k=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-k>>2>>>0>h>>>0)){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}e=c[k+(h<<2)>>2]|0;if((e|0)==0){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}else{o=e;p=Cc[c[(c[e>>2]|0)+16>>2]&63](o)|0;a[f]=p;Ac[c[(c[e>>2]|0)+20>>2]&63](b,o);ce(c[d>>2]|0)|0;i=g;return}}function hh(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;i=i+40|0;j=h;k=h+16|0;l=h+32|0;We(l,d);d=l;l=c[d>>2]|0;if(!((c[1290]|0)==-1)){c[k>>2]=5160;c[k+4>>2]=112;c[k+8>>2]=0;we(5160,k,113)}k=(c[5164>>2]|0)+ -1|0;m=c[l+8>>2]|0;if(!((c[l+12>>2]|0)-m>>2>>>0>k>>>0)){n=Bb(4)|0;o=n;um(o);oc(n|0,13120,101)}l=c[m+(k<<2)>>2]|0;if((l|0)==0){n=Bb(4)|0;o=n;um(o);oc(n|0,13120,101)}Ic[c[(c[l>>2]|0)+32>>2]&7](l,3704,3736|0,e)|0;e=c[d>>2]|0;if(!((c[1326]|0)==-1)){c[j>>2]=5304;c[j+4>>2]=112;c[j+8>>2]=0;we(5304,j,113)}j=(c[5308>>2]|0)+ -1|0;l=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-l>>2>>>0>j>>>0)){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}e=c[l+(j<<2)>>2]|0;if((e|0)==0){p=Bb(4)|0;q=p;um(q);oc(p|0,13120,101)}else{p=e;q=e;j=Cc[c[(c[q>>2]|0)+12>>2]&63](p)|0;a[f]=j;j=Cc[c[(c[q>>2]|0)+16>>2]&63](p)|0;a[g]=j;Ac[c[(c[e>>2]|0)+20>>2]&63](b,p);ce(c[d>>2]|0)|0;i=h;return}}function ih(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;p=i;if(b<<24>>24==h<<24>>24){if((a[d]|0)==0){q=-1;i=p;return q|0}a[d]=0;h=c[g>>2]|0;c[g>>2]=h+1;a[h]=46;h=a[k]|0;if((h&1)==0){r=(h&255)>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){q=0;i=p;return q|0}r=c[m>>2]|0;if((r-l|0)>=160){q=0;i=p;return q|0}h=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=h;q=0;i=p;return q|0}do{if(b<<24>>24==j<<24>>24){h=a[k]|0;if((h&1)==0){s=(h&255)>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){break}if((a[d]|0)==0){q=-1;i=p;return q|0}h=c[m>>2]|0;if((h-l|0)>=160){q=0;i=p;return q|0}r=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=r;c[n>>2]=0;q=0;i=p;return q|0}}while(0);s=o+32|0;j=o;while(1){r=j+1|0;if((a[j]|0)==b<<24>>24){t=j;break}if((r|0)==(s|0)){t=s;break}else{j=r}}j=t-o|0;if((j|0)>31){q=-1;i=p;return q|0}o=a[3704+j|0]|0;if((j|0)==23|(j|0)==22){a[e]=80;t=c[g>>2]|0;c[g>>2]=t+1;a[t]=o;q=0;i=p;return q|0}else if((j|0)==24|(j|0)==25){t=c[g>>2]|0;do{if((t|0)!=(f|0)){if((a[t+ -1|0]&95|0)==(a[e]&127|0)){break}else{q=-1}i=p;return q|0}}while(0);c[g>>2]=t+1;a[t]=o;q=0;i=p;return q|0}else{t=o&95;do{if((t|0)==(a[e]|0)){a[e]=t|128;if((a[d]|0)==0){break}a[d]=0;f=a[k]|0;if((f&1)==0){u=(f&255)>>>1}else{u=c[k+4>>2]|0}if((u|0)==0){break}f=c[m>>2]|0;if((f-l|0)>=160){break}s=c[n>>2]|0;c[m>>2]=f+4;c[f>>2]=s}}while(0);m=c[g>>2]|0;c[g>>2]=m+1;a[m]=o;if((j|0)>21){q=0;i=p;return q|0}c[n>>2]=(c[n>>2]|0)+1;q=0;i=p;return q|0}return 0}function jh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+40|0;g=f;h=f+16|0;j=f+32|0;We(j,b);b=j;j=c[b>>2]|0;if(!((c[1288]|0)==-1)){c[h>>2]=5152;c[h+4>>2]=112;c[h+8>>2]=0;we(5152,h,113)}h=(c[5156>>2]|0)+ -1|0;k=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-k>>2>>>0>h>>>0)){l=Bb(4)|0;m=l;um(m);oc(l|0,13120,101)}j=c[k+(h<<2)>>2]|0;if((j|0)==0){l=Bb(4)|0;m=l;um(m);oc(l|0,13120,101)}Ic[c[(c[j>>2]|0)+48>>2]&7](j,3704,3730|0,d)|0;d=c[b>>2]|0;if(!((c[1328]|0)==-1)){c[g>>2]=5312;c[g+4>>2]=112;c[g+8>>2]=0;we(5312,g,113)}g=(c[5316>>2]|0)+ -1|0;j=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-j>>2>>>0>g>>>0)){n=Bb(4)|0;o=n;um(o);oc(n|0,13120,101)}d=c[j+(g<<2)>>2]|0;if((d|0)==0){n=Bb(4)|0;o=n;um(o);oc(n|0,13120,101)}else{n=d;o=Cc[c[(c[d>>2]|0)+16>>2]&63](n)|0;c[e>>2]=o;Ac[c[(c[d>>2]|0)+20>>2]&63](a,n);ce(c[b>>2]|0)|0;i=f;return}}function kh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+40|0;h=g;j=g+16|0;k=g+32|0;We(k,b);b=k;k=c[b>>2]|0;if(!((c[1288]|0)==-1)){c[j>>2]=5152;c[j+4>>2]=112;c[j+8>>2]=0;we(5152,j,113)}j=(c[5156>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>j>>>0)){m=Bb(4)|0;n=m;um(n);oc(m|0,13120,101)}k=c[l+(j<<2)>>2]|0;if((k|0)==0){m=Bb(4)|0;n=m;um(n);oc(m|0,13120,101)}Ic[c[(c[k>>2]|0)+48>>2]&7](k,3704,3736|0,d)|0;d=c[b>>2]|0;if(!((c[1328]|0)==-1)){c[h>>2]=5312;c[h+4>>2]=112;c[h+8>>2]=0;we(5312,h,113)}h=(c[5316>>2]|0)+ -1|0;k=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-k>>2>>>0>h>>>0)){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}d=c[k+(h<<2)>>2]|0;if((d|0)==0){o=Bb(4)|0;p=o;um(p);oc(o|0,13120,101)}else{o=d;p=d;h=Cc[c[(c[p>>2]|0)+12>>2]&63](o)|0;c[e>>2]=h;h=Cc[c[(c[p>>2]|0)+16>>2]&63](o)|0;c[f>>2]=h;Ac[c[(c[d>>2]|0)+20>>2]&63](a,o);ce(c[b>>2]|0)|0;i=g;return}}function lh(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;p=i;if((b|0)==(h|0)){if((a[d]|0)==0){q=-1;i=p;return q|0}a[d]=0;h=c[g>>2]|0;c[g>>2]=h+1;a[h]=46;h=a[k]|0;if((h&1)==0){r=(h&255)>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){q=0;i=p;return q|0}r=c[m>>2]|0;if((r-l|0)>=160){q=0;i=p;return q|0}h=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=h;q=0;i=p;return q|0}do{if((b|0)==(j|0)){h=a[k]|0;if((h&1)==0){s=(h&255)>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){break}if((a[d]|0)==0){q=-1;i=p;return q|0}h=c[m>>2]|0;if((h-l|0)>=160){q=0;i=p;return q|0}r=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=r;c[n>>2]=0;q=0;i=p;return q|0}}while(0);s=o+128|0;j=o;while(1){r=j+4|0;if((c[j>>2]|0)==(b|0)){t=j;break}if((r|0)==(s|0)){t=s;break}else{j=r}}j=t-o|0;o=j>>2;if((j|0)>124){q=-1;i=p;return q|0}t=a[3704+o|0]|0;do{if((o|0)==24|(o|0)==25){s=c[g>>2]|0;do{if((s|0)!=(f|0)){if((a[s+ -1|0]&95|0)==(a[e]&127|0)){break}else{q=-1}i=p;return q|0}}while(0);c[g>>2]=s+1;a[s]=t;q=0;i=p;return q|0}else if((o|0)==23|(o|0)==22){a[e]=80}else{b=t&95;if((b|0)!=(a[e]|0)){break}a[e]=b|128;if((a[d]|0)==0){break}a[d]=0;b=a[k]|0;if((b&1)==0){u=(b&255)>>>1}else{u=c[k+4>>2]|0}if((u|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}r=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=r}}while(0);m=c[g>>2]|0;c[g>>2]=m+1;a[m]=t;if((j|0)>84){q=0;i=p;return q|0}c[n>>2]=(c[n>>2]|0)+1;q=0;i=p;return q|0}function mh(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function nh(a){a=a|0;i=i;return}function oh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+56|0;k=j;l=j+8|0;m=j+24|0;n=j+32|0;o=j+40|0;if((c[f+4>>2]&1|0)==0){p=c[(c[d>>2]|0)+24>>2]|0;c[m>>2]=c[e>>2];q=h&1;r=k;s=m;c[r+0>>2]=c[s+0>>2];Kc[p&15](b,d,k,f,g,q);i=j;return}We(n,f);f=n;n=c[f>>2]|0;if(!((c[1326]|0)==-1)){c[l>>2]=5304;c[l+4>>2]=112;c[l+8>>2]=0;we(5304,l,113)}l=(c[5308>>2]|0)+ -1|0;q=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-q>>2>>>0>l>>>0)){t=Bb(4)|0;u=t;um(u);oc(t|0,13120,101)}n=c[q+(l<<2)>>2]|0;if((n|0)==0){t=Bb(4)|0;u=t;um(u);oc(t|0,13120,101)}t=n;ce(c[f>>2]|0)|0;f=c[n>>2]|0;if(h){Ac[c[f+24>>2]&63](o,t)}else{Ac[c[f+28>>2]&63](o,t)}t=o;f=a[t]|0;if((f&1)==0){h=o+1|0;v=h;w=h;x=o+8|0}else{h=o+8|0;v=c[h>>2]|0;w=o+1|0;x=h}h=e;e=o+4|0;n=f;f=v;while(1){if((n&1)==0){y=w;z=(n&255)>>>1}else{y=c[x>>2]|0;z=c[e>>2]|0}if((f|0)==(y+z|0)){break}v=a[f]|0;u=c[h>>2]|0;do{if((u|0)!=0){l=u+24|0;q=c[l>>2]|0;if((q|0)!=(c[u+28>>2]|0)){c[l>>2]=q+1;a[q]=v;break}if(!((Lc[c[(c[u>>2]|0)+52>>2]&15](u,v&255)|0)==-1)){break}c[h>>2]=0}}while(0);n=a[t]|0;f=f+1|0}c[b>>2]=c[h>>2];Be(o);i=j;return}function ph(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+24|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3952|0]|0;a[s+1|0]=a[3953|0]|0;a[s+2|0]=a[3954|0]|0;a[s+3|0]=a[3955|0]|0;a[s+4|0]=a[3956|0]|0;a[s+5|0]=a[3957|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=100}}while(0);w=m;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}x=ib(2147483647,5064,0)|0;c[1262]=x;eb(5056)}}while(0);x=c[1262]|0;c[k>>2]=h;h=qh(w,12,x,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else if((s|0)==32){y=k}else{z=20}}while(0);if((z|0)==20){y=w}z=n;We(q,f);rh(w,y,k,z,o,p,q);ce(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];ed(b,j,z,e,o,f,g);i=d;return}function qh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;i=i+16|0;h=g;c[h>>2]=f;f=Fb(d|0)|0;d=pb(a|0,b|0,e|0,h|0)|0;if((f|0)==0){i=g;return d|0}Fb(f|0)|0;i=g;return d|0}function rh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1290]|0)==-1)){c[m>>2]=5160;c[m+4>>2]=112;c[m+8>>2]=0;we(5160,m,113)}m=(c[5164>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=Bb(4)|0;r=q;um(r);oc(q|0,13120,101)}q=j;r=c[o>>2]|0;if(!((c[1326]|0)==-1)){c[l>>2]=5304;c[l+4>>2]=112;c[l+8>>2]=0;we(5304,l,113)}l=(c[5308>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=Bb(4)|0;t=s;um(t);oc(s|0,13120,101)}s=r;Ac[c[(c[r>>2]|0)+20>>2]&63](n,s);t=n;l=a[t]|0;if((l&1)==0){u=(l&255)>>>1}else{u=c[n+4>>2]|0}do{if((u|0)==0){Ic[c[(c[j>>2]|0)+32>>2]&7](q,b,e,f)|0;c[h>>2]=f+(e-b)}else{c[h>>2]=f;l=a[b]|0;if(l<<24>>24==43|l<<24>>24==45){o=Lc[c[(c[j>>2]|0)+28>>2]&15](q,l)|0;l=c[h>>2]|0;c[h>>2]=l+1;a[l]=o;v=b+1|0}else{v=b}do{if((e-v|0)>1){if((a[v]|0)!=48){w=v;break}o=v+1|0;l=a[o]|0;if(!(l<<24>>24==88|l<<24>>24==120)){w=v;break}l=j;m=Lc[c[(c[l>>2]|0)+28>>2]&15](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=m;m=Lc[c[(c[l>>2]|0)+28>>2]&15](q,a[o]|0)|0;o=c[h>>2]|0;c[h>>2]=o+1;a[o]=m;w=v+2|0}else{w=v}}while(0);do{if((w|0)!=(e|0)){m=e+ -1|0;if(m>>>0>w>>>0){x=w;y=m}else{break}do{m=a[x]|0;a[x]=a[y]|0;a[y]=m;x=x+1|0;y=y+ -1|0;}while(x>>>0<y>>>0)}}while(0);m=Cc[c[(c[r>>2]|0)+16>>2]&63](s)|0;if(w>>>0<e>>>0){o=n+1|0;l=j;p=n+4|0;z=n+8|0;A=0;B=0;C=w;while(1){D=(a[t]&1)==0;do{if((a[(D?o:c[z>>2]|0)+B|0]|0)==0){E=A;F=B}else{if((A|0)!=(a[(D?o:c[z>>2]|0)+B|0]|0)){E=A;F=B;break}G=c[h>>2]|0;c[h>>2]=G+1;a[G]=m;G=a[t]|0;if((G&1)==0){H=(G&255)>>>1}else{H=c[p>>2]|0}E=0;F=(B>>>0<(H+ -1|0)>>>0)+B|0}}while(0);D=Lc[c[(c[l>>2]|0)+28>>2]&15](q,a[C]|0)|0;G=c[h>>2]|0;c[h>>2]=G+1;a[G]=D;D=C+1|0;if(D>>>0<e>>>0){A=E+1|0;B=F;C=D}else{break}}}C=f+(w-b)|0;B=c[h>>2]|0;if((C|0)==(B|0)){break}A=B+ -1|0;if(A>>>0>C>>>0){I=C;J=A}else{break}do{A=a[I]|0;a[I]=a[J]|0;a[J]=A;I=I+1|0;J=J+ -1|0;}while(I>>>0<J>>>0)}}while(0);if((d|0)==(e|0)){K=c[h>>2]|0;c[g>>2]=K;Be(n);i=k;return}else{K=f+(d-b)|0;c[g>>2]=K;Be(n);i=k;return}}function sh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+48|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=100}}while(0);w=n;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}x=ib(2147483647,5064,0)|0;c[1262]=x;eb(5056)}}while(0);x=c[1262]|0;v=l;c[v>>2]=h;c[v+4>>2]=j;j=qh(w,22,x,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==32){y=l}else if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=o;We(r,f);rh(w,y,l,z,p,q,r);ce(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];ed(b,k,z,e,p,f,g);i=d;return}function th(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+24|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3952|0]|0;a[s+1|0]=a[3953|0]|0;a[s+2|0]=a[3954|0]|0;a[s+3|0]=a[3955|0]|0;a[s+4|0]=a[3956|0]|0;a[s+5|0]=a[3957|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=117}}while(0);w=m;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}x=ib(2147483647,5064,0)|0;c[1262]=x;eb(5056)}}while(0);x=c[1262]|0;c[k>>2]=h;h=qh(w,12,x,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else if((s|0)==32){y=k}else{z=20}}while(0);if((z|0)==20){y=w}z=n;We(q,f);rh(w,y,k,z,o,p,q);ce(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];ed(b,j,z,e,o,f,g);i=d;return}function uh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+48|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=117}}while(0);w=n;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}x=ib(2147483647,5064,0)|0;c[1262]=x;eb(5056)}}while(0);x=c[1262]|0;v=l;c[v>>2]=h;c[v+4>>2]=j;j=qh(w,23,x,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else if((t|0)==32){y=l}else{z=20}}while(0);if((z|0)==20){y=w}z=o;We(r,f);rh(w,y,l,z,p,q,r);ce(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];ed(b,k,z,e,p,f,g);i=d;return}



function Ej(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+40|0;k=d;l=d+8|0;m=d+24|0;n=d+32|0;o=n;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+16|0;s=i;i=i+16|0;t=i;i=i+16|0;u=i;i=i+8|0;v=i;i=i+104|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;We(m,g);z=m;A=c[z>>2]|0;if(!((c[1290]|0)==-1)){c[l>>2]=5160;c[l+4>>2]=112;c[l+8>>2]=0;we(5160,l,113)}l=(c[5164>>2]|0)+ -1|0;B=c[A+8>>2]|0;if(!((c[A+12>>2]|0)-B>>2>>>0>l>>>0)){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}A=c[B+(l<<2)>>2]|0;if((A|0)==0){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}C=A;D=j;l=a[D]|0;B=(l&1)==0;if(B){E=(l&255)>>>1}else{E=c[j+4>>2]|0}if((E|0)==0){F=0}else{if(B){G=j+1|0}else{G=c[j+8>>2]|0}B=a[G]|0;F=B<<24>>24==(Lc[c[(c[A>>2]|0)+28>>2]&15](C,45)|0)<<24>>24}c[n>>2]=0;n=r;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;n=s;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;A=t;c[A+0>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;Cj(f,F,m,o,p,q,r,s,t,u);m=v;v=a[D]|0;D=(v&1)==0;if(D){H=(v&255)>>>1}else{H=c[j+4>>2]|0}f=c[u>>2]|0;if((H|0)>(f|0)){if(D){I=(v&255)>>>1}else{I=c[j+4>>2]|0}D=a[A]|0;if((D&1)==0){J=(D&255)>>>1}else{J=c[t+4>>2]|0}D=a[n]|0;if((D&1)==0){K=(D&255)>>>1}else{K=c[s+4>>2]|0}L=J+(I-f<<1|1)+K|0}else{K=a[A]|0;if((K&1)==0){M=(K&255)>>>1}else{M=c[t+4>>2]|0}K=a[n]|0;if((K&1)==0){N=(K&255)>>>1}else{N=c[s+4>>2]|0}L=M+2+N|0}N=L+f|0;do{if(N>>>0>100){L=Pm(N)|0;if((L|0)!=0){O=L;P=L;break}$m()}else{O=0;P=m}}while(0);if((v&1)==0){Q=j+1|0;R=(v&255)>>>1}else{Q=c[j+8>>2]|0;R=c[j+4>>2]|0}Dj(P,w,x,c[g+4>>2]|0,Q,Q+R|0,C,F,o,a[p]|0,a[q]|0,r,s,t,f);c[y>>2]=c[e>>2];e=c[w>>2]|0;w=c[x>>2]|0;x=k;f=y;c[x+0>>2]=c[f+0>>2];ed(b,k,P,e,w,g,h);if((O|0)==0){Be(t);Be(s);Be(r);S=c[z>>2]|0;T=S;ce(T)|0;i=d;return}Qm(O);Be(t);Be(s);Be(r);S=c[z>>2]|0;T=S;ce(T)|0;i=d;return}function Fj(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Gj(a){a=a|0;i=i;return}function Hj(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;d=i;i=i+16|0;m=d;n=d+8|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+104|0;r=i;i=i+8|0;s=i;i=i+400|0;t=i;i=i+8|0;u=i;i=i+8|0;v=u;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+16|0;B=i;i=i+8|0;C=i;i=i+400|0;D=i;i=i+8|0;E=i;i=i+8|0;F=i;i=i+8|0;G=q;c[r>>2]=G;q=s;s=o;h[k>>3]=l;c[s>>2]=c[k>>2];c[s+4>>2]=c[k+4>>2];s=Hb(G|0,100,4912,o|0)|0;do{if(s>>>0>99){do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}o=ib(2147483647,5064,0)|0;c[1262]=o;eb(5056)}}while(0);o=c[1262]|0;G=n;h[k>>3]=l;c[G>>2]=c[k>>2];c[G+4>>2]=c[k+4>>2];G=wh(r,o,4912,n)|0;o=c[r>>2]|0;if((o|0)==0){$m()}H=Pm(G<<2)|0;I=H;if((H|0)!=0){J=o;K=I;L=I;M=G;break}$m()}else{J=0;K=0;L=q;M=s}}while(0);We(t,g);s=t;q=c[s>>2]|0;if(!((c[1288]|0)==-1)){c[p>>2]=5152;c[p+4>>2]=112;c[p+8>>2]=0;we(5152,p,113)}p=(c[5156>>2]|0)+ -1|0;n=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-n>>2>>>0>p>>>0)){N=Bb(4)|0;O=N;um(O);oc(N|0,13120,101)}q=c[n+(p<<2)>>2]|0;if((q|0)==0){N=Bb(4)|0;O=N;um(O);oc(N|0,13120,101)}N=q;O=c[r>>2]|0;Ic[c[(c[q>>2]|0)+48>>2]&7](N,O,O+M|0,L)|0;if((M|0)==0){P=0}else{P=(a[c[r>>2]|0]|0)==45}c[u>>2]=0;u=y;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;u=z;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;r=A;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Ij(f,P,t,v,w,x,y,z,A,B);t=C;C=c[B>>2]|0;if((M|0)>(C|0)){B=a[r]|0;if((B&1)==0){Q=(B&255)>>>1}else{Q=c[A+4>>2]|0}B=a[u]|0;if((B&1)==0){R=(B&255)>>>1}else{R=c[z+4>>2]|0}S=Q+(M-C<<1|1)+R|0}else{R=a[r]|0;if((R&1)==0){T=(R&255)>>>1}else{T=c[A+4>>2]|0}R=a[u]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[z+4>>2]|0}S=T+2+U|0}U=S+C|0;do{if(U>>>0>100){S=Pm(U<<2)|0;T=S;if((S|0)!=0){V=T;W=T;break}$m()}else{V=0;W=t}}while(0);Jj(W,D,E,c[g+4>>2]|0,L,L+(M<<2)|0,N,P,v,c[w>>2]|0,c[x>>2]|0,y,z,A,C);c[F>>2]=c[e>>2];e=c[D>>2]|0;D=c[E>>2]|0;E=m;C=F;c[E+0>>2]=c[C+0>>2];Fh(b,m,W,e,D,g,j);if((V|0)!=0){Qm(V)}Ne(A);Ne(z);Be(y);ce(c[s>>2]|0)|0;if((K|0)!=0){Qm(K)}if((J|0)==0){i=d;return}Qm(J);i=d;return}function Ij(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;n=i;i=i+40|0;o=n;p=n+16|0;q=n+32|0;r=q;s=i;i=i+16|0;t=i;i=i+8|0;u=t;v=i;i=i+16|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+8|0;z=y;A=i;i=i+16|0;B=i;i=i+8|0;C=B;D=i;i=i+16|0;E=i;i=i+16|0;F=i;i=i+16|0;G=c[e>>2]|0;if(b){if(!((c[1182]|0)==-1)){c[p>>2]=4728;c[p+4>>2]=112;c[p+8>>2]=0;we(4728,p,113)}p=(c[4732>>2]|0)+ -1|0;b=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-b>>2>>>0>p>>>0)){H=Bb(4)|0;I=H;um(I);oc(H|0,13120,101)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){H=Bb(4)|0;I=H;um(I);oc(H|0,13120,101)}H=e;I=c[e>>2]|0;if(d){Ac[c[I+44>>2]&63](r,H);r=f;p=c[q>>2]|0;a[r]=p;a[r+1|0]=p>>8;a[r+2|0]=p>>16;a[r+3|0]=p>>24;Ac[c[(c[e>>2]|0)+32>>2]&63](s,H);p=l;if((a[p]&1)==0){c[l+4>>2]=0;a[p]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Qe(l,0);r=s;c[p+0>>2]=c[r+0>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Ne(s)}else{Ac[c[I+40>>2]&63](u,H);u=f;I=c[t>>2]|0;a[u]=I;a[u+1|0]=I>>8;a[u+2|0]=I>>16;a[u+3|0]=I>>24;Ac[c[(c[e>>2]|0)+28>>2]&63](v,H);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Qe(l,0);u=v;c[I+0>>2]=c[u+0>>2];c[I+4>>2]=c[u+4>>2];c[I+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;Ne(v)}v=e;u=Cc[c[(c[v>>2]|0)+12>>2]&63](H)|0;c[g>>2]=u;u=Cc[c[(c[v>>2]|0)+16>>2]&63](H)|0;c[h>>2]=u;Ac[c[(c[e>>2]|0)+20>>2]&63](w,H);u=j;if((a[u]&1)==0){a[j+1|0]=0;a[u]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ge(j,0);I=w;c[u+0>>2]=c[I+0>>2];c[u+4>>2]=c[I+4>>2];c[u+8>>2]=c[I+8>>2];c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;Be(w);Ac[c[(c[e>>2]|0)+24>>2]&63](x,H);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Qe(k,0);w=x;c[e+0>>2]=c[w+0>>2];c[e+4>>2]=c[w+4>>2];c[e+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;Ne(x);J=Cc[c[(c[v>>2]|0)+36>>2]&63](H)|0;c[m>>2]=J;i=n;return}else{if(!((c[1166]|0)==-1)){c[o>>2]=4664;c[o+4>>2]=112;c[o+8>>2]=0;we(4664,o,113)}o=(c[4668>>2]|0)+ -1|0;H=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-H>>2>>>0>o>>>0)){K=Bb(4)|0;L=K;um(L);oc(K|0,13120,101)}G=c[H+(o<<2)>>2]|0;if((G|0)==0){K=Bb(4)|0;L=K;um(L);oc(K|0,13120,101)}K=G;L=c[G>>2]|0;if(d){Ac[c[L+44>>2]&63](z,K);z=f;d=c[y>>2]|0;a[z]=d;a[z+1|0]=d>>8;a[z+2|0]=d>>16;a[z+3|0]=d>>24;Ac[c[(c[G>>2]|0)+32>>2]&63](A,K);d=l;if((a[d]&1)==0){c[l+4>>2]=0;a[d]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Qe(l,0);z=A;c[d+0>>2]=c[z+0>>2];c[d+4>>2]=c[z+4>>2];c[d+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;Ne(A)}else{Ac[c[L+40>>2]&63](C,K);C=f;f=c[B>>2]|0;a[C]=f;a[C+1|0]=f>>8;a[C+2|0]=f>>16;a[C+3|0]=f>>24;Ac[c[(c[G>>2]|0)+28>>2]&63](D,K);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Qe(l,0);l=D;c[f+0>>2]=c[l+0>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;Ne(D)}D=G;l=Cc[c[(c[D>>2]|0)+12>>2]&63](K)|0;c[g>>2]=l;l=Cc[c[(c[D>>2]|0)+16>>2]&63](K)|0;c[h>>2]=l;Ac[c[(c[G>>2]|0)+20>>2]&63](E,K);l=j;if((a[l]&1)==0){a[j+1|0]=0;a[l]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ge(j,0);j=E;c[l+0>>2]=c[j+0>>2];c[l+4>>2]=c[j+4>>2];c[l+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;Be(E);Ac[c[(c[G>>2]|0)+24>>2]&63](F,K);G=k;if((a[G]&1)==0){c[k+4>>2]=0;a[G]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Qe(k,0);k=F;c[G+0>>2]=c[k+0>>2];c[G+4>>2]=c[k+4>>2];c[G+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;Ne(F);J=Cc[c[(c[D>>2]|0)+36>>2]&63](K)|0;c[m>>2]=J;i=n;return}}function Jj(b,d,e,f,g,h,j,k,l,m,n,o,p,q,r){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0;s=i;c[e>>2]=b;t=j;u=q;v=q+4|0;w=q+8|0;q=p;x=(f&512|0)==0;y=p+4|0;z=p+8|0;p=(r|0)>0;A=o;B=o+1|0;C=o+8|0;D=o+4|0;o=j;E=g;g=0;while(1){a:do{switch(a[l+g|0]|0){case 3:{F=a[u]|0;G=(F&1)==0;if(G){H=(F&255)>>>1}else{H=c[v>>2]|0}if((H|0)==0){I=E;break a}if(G){J=v}else{J=c[w>>2]|0}G=c[J>>2]|0;F=c[e>>2]|0;c[e>>2]=F+4;c[F>>2]=G;I=E;break};case 0:{c[d>>2]=c[e>>2];I=E;break};case 1:{c[d>>2]=c[e>>2];G=Lc[c[(c[t>>2]|0)+44>>2]&15](j,32)|0;F=c[e>>2]|0;c[e>>2]=F+4;c[F>>2]=G;I=E;break};case 2:{G=a[q]|0;F=(G&1)==0;if(F){K=(G&255)>>>1}else{K=c[y>>2]|0}if((K|0)==0|x){I=E;break a}if(F){L=y;M=(G&255)>>>1}else{L=c[z>>2]|0;M=c[y>>2]|0}G=L+(M<<2)|0;F=c[e>>2]|0;if((L|0)==(G|0)){N=F}else{O=(L+(M+ -1<<2)+(0-L)|0)>>>2;P=F;Q=L;while(1){c[P>>2]=c[Q>>2];R=Q+4|0;if((R|0)==(G|0)){break}P=P+4|0;Q=R}N=F+(O+1<<2)|0}c[e>>2]=N;I=E;break};case 4:{Q=c[e>>2]|0;P=k?E+4|0:E;b:do{if(P>>>0<h>>>0){G=P;while(1){R=G+4|0;if(!(wc[c[(c[o>>2]|0)+12>>2]&31](j,2048,c[G>>2]|0)|0)){S=G;break b}if(R>>>0<h>>>0){G=R}else{S=R;break}}}else{S=P}}while(0);if(p){do{if(S>>>0>P>>>0){O=c[e>>2]|0;F=S;G=r;while(1){T=F+ -4|0;U=O+4|0;c[O>>2]=c[T>>2];V=G+ -1|0;W=(V|0)>0;if(T>>>0>P>>>0&W){G=V;F=T;O=U}else{break}}c[e>>2]=U;if(W){X=T;Y=V;Z=34;break}O=c[e>>2]|0;c[e>>2]=O+4;_=O;$=T}else{X=S;Y=r;Z=34}}while(0);do{if((Z|0)==34){Z=0;O=Lc[c[(c[t>>2]|0)+44>>2]&15](j,48)|0;F=c[e>>2]|0;G=F+4|0;c[e>>2]=G;if((Y|0)>0){aa=G;ba=F;ca=Y}else{_=F;$=X;break}while(1){c[ba>>2]=O;G=ca+ -1|0;if((G|0)>0){ca=G;ba=aa;aa=aa+4|0}else{break}}c[e>>2]=F+(Y+1<<2);_=F+(Y<<2)|0;$=X}}while(0);c[_>>2]=m;da=$}else{da=S}if((da|0)==(P|0)){O=Lc[c[(c[t>>2]|0)+44>>2]&15](j,48)|0;G=c[e>>2]|0;R=G+4|0;c[e>>2]=R;c[G>>2]=O;ea=R}else{R=a[A]|0;O=(R&1)==0;if(O){fa=(R&255)>>>1}else{fa=c[D>>2]|0}if((fa|0)==0){ga=da;ha=-1;ia=0;ja=0}else{if(O){ka=B}else{ka=c[C>>2]|0}ga=da;ha=a[ka]|0;ia=0;ja=0}while(1){O=c[e>>2]|0;do{if((ja|0)==(ha|0)){R=O+4|0;c[e>>2]=R;c[O>>2]=n;G=ia+1|0;la=a[A]|0;ma=(la&1)==0;if(ma){na=(la&255)>>>1}else{na=c[D>>2]|0}if(!(G>>>0<na>>>0)){oa=R;pa=ha;qa=G;ra=0;break}if(ma){sa=B}else{sa=c[C>>2]|0}if((a[sa+G|0]|0)==127){oa=R;pa=-1;qa=G;ra=0;break}if(ma){ta=B}else{ta=c[C>>2]|0}oa=R;pa=a[ta+G|0]|0;qa=G;ra=0}else{oa=O;pa=ha;qa=ia;ra=ja}}while(0);O=ga+ -4|0;F=c[O>>2]|0;G=oa+4|0;c[e>>2]=G;c[oa>>2]=F;if((O|0)==(P|0)){ea=G;break}else{ga=O;ha=pa;ia=qa;ja=ra+1|0}}}if((Q|0)==(ea|0)){I=P;break a}O=ea+ -4|0;if(O>>>0>Q>>>0){ua=Q;va=O}else{I=P;break a}while(1){O=c[ua>>2]|0;c[ua>>2]=c[va>>2];c[va>>2]=O;O=ua+4|0;G=va+ -4|0;if(O>>>0<G>>>0){va=G;ua=O}else{I=P;break}}break};default:{I=E}}}while(0);P=g+1|0;if((P|0)==4){break}else{E=I;g=P}}g=a[u]|0;u=(g&1)==0;if(u){wa=(g&255)>>>1}else{wa=c[v>>2]|0}if(wa>>>0>1){if(u){xa=v;ya=(g&255)>>>1}else{xa=c[w>>2]|0;ya=c[v>>2]|0}v=xa+4|0;w=xa+(ya<<2)|0;g=c[e>>2]|0;if((v|0)==(w|0)){za=g}else{u=(xa+(ya+ -1<<2)+(0-v)|0)>>>2;ya=g;xa=v;while(1){c[ya>>2]=c[xa>>2];v=xa+4|0;if((v|0)==(w|0)){break}else{xa=v;ya=ya+4|0}}za=g+(u+1<<2)|0}c[e>>2]=za}za=f&176;if((za|0)==32){c[d>>2]=c[e>>2];i=s;return}else if((za|0)==16){i=s;return}else{c[d>>2]=b;i=s;return}}function Kj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+40|0;k=d;l=d+8|0;m=d+24|0;n=d+32|0;o=n;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+16|0;s=i;i=i+16|0;t=i;i=i+16|0;u=i;i=i+8|0;v=i;i=i+400|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;We(m,g);z=m;A=c[z>>2]|0;if(!((c[1288]|0)==-1)){c[l>>2]=5152;c[l+4>>2]=112;c[l+8>>2]=0;we(5152,l,113)}l=(c[5156>>2]|0)+ -1|0;B=c[A+8>>2]|0;if(!((c[A+12>>2]|0)-B>>2>>>0>l>>>0)){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}A=c[B+(l<<2)>>2]|0;if((A|0)==0){C=Bb(4)|0;D=C;um(D);oc(C|0,13120,101)}C=A;D=j;l=a[D]|0;B=(l&1)==0;if(B){E=(l&255)>>>1}else{E=c[j+4>>2]|0}if((E|0)==0){F=0}else{if(B){G=j+4|0}else{G=c[j+8>>2]|0}B=c[G>>2]|0;F=(B|0)==(Lc[c[(c[A>>2]|0)+44>>2]&15](C,45)|0)}c[n>>2]=0;n=r;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;n=s;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;A=t;c[A+0>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;Ij(f,F,m,o,p,q,r,s,t,u);m=v;v=a[D]|0;D=(v&1)==0;if(D){H=(v&255)>>>1}else{H=c[j+4>>2]|0}f=c[u>>2]|0;if((H|0)>(f|0)){if(D){I=(v&255)>>>1}else{I=c[j+4>>2]|0}D=a[A]|0;if((D&1)==0){J=(D&255)>>>1}else{J=c[t+4>>2]|0}D=a[n]|0;if((D&1)==0){K=(D&255)>>>1}else{K=c[s+4>>2]|0}L=J+(I-f<<1|1)+K|0}else{K=a[A]|0;if((K&1)==0){M=(K&255)>>>1}else{M=c[t+4>>2]|0}K=a[n]|0;if((K&1)==0){N=(K&255)>>>1}else{N=c[s+4>>2]|0}L=M+2+N|0}N=L+f|0;do{if(N>>>0>100){L=Pm(N<<2)|0;M=L;if((L|0)!=0){O=M;P=M;break}$m()}else{O=0;P=m}}while(0);if((v&1)==0){Q=j+4|0;R=(v&255)>>>1}else{Q=c[j+8>>2]|0;R=c[j+4>>2]|0}Jj(P,w,x,c[g+4>>2]|0,Q,Q+(R<<2)|0,C,F,o,c[p>>2]|0,c[q>>2]|0,r,s,t,f);c[y>>2]=c[e>>2];e=c[w>>2]|0;w=c[x>>2]|0;x=k;f=y;c[x+0>>2]=c[f+0>>2];Fh(b,k,P,e,w,g,h);if((O|0)==0){Ne(t);Ne(s);Be(r);S=c[z>>2]|0;T=S;ce(T)|0;i=d;return}Qm(O);Ne(t);Ne(s);Be(r);S=c[z>>2]|0;T=S;ce(T)|0;i=d;return}function Lj(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Mj(a){a=a|0;i=i;return}function Nj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=wb(f|0,1)|0;i=e;return d>>>((d|0)!=(-1|0)|0)|0}function Oj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;i=i+16|0;j=d;k=j;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;l=a[h]|0;if((l&1)==0){m=h+1|0;n=h+1|0;o=(l&255)>>>1}else{l=c[h+8>>2]|0;m=l;n=l;o=c[h+4>>2]|0}h=m+o|0;do{if(n>>>0<h>>>0){o=n;do{He(j,a[o]|0);o=o+1|0;}while((o|0)!=(h|0));o=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){p=o;q=9;break}r=o;s=c[j+8>>2]|0}else{p=(e|0)==-1?-1:e<<1;q=9}}while(0);if((q|0)==9){r=p;s=j+1|0}p=bc(r|0,f|0,g|0,s|0)|0;s=b;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;s=qn(p|0)|0;g=p+s|0;if((s|0)>0){t=p}else{Be(j);i=d;return}do{He(b,a[t]|0);t=t+1|0;}while((t|0)!=(g|0));Be(j);i=d;return}function Pj(a,b){a=a|0;b=b|0;a=i;Xa(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Qj(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Rj(a){a=a|0;i=i;return}function Sj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=wb(f|0,1)|0;i=e;return d>>>((d|0)!=(-1|0)|0)|0}function Tj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+240|0;j=d;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=d+224|0;t=d+232|0;u=r;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[s+4>>2]=0;c[s>>2]=6816;v=a[h]|0;if((v&1)==0){w=h+4|0;x=h+4|0;y=(v&255)>>>1}else{v=c[h+8>>2]|0;w=v;x=v;y=c[h+4>>2]|0}h=w+(y<<2)|0;y=k;w=j;v=j;c[v>>2]=0;c[v+4>>2]=0;a:do{if(x>>>0<h>>>0){v=s;j=s;z=k+32|0;A=x;B=6816|0;while(1){c[m>>2]=A;C=(Hc[c[B+12>>2]&15](v,w,A,h,m,y,z,l)|0)==2;D=c[m>>2]|0;if(C|(D|0)==(A|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){C=y;do{He(r,a[C]|0);C=C+1|0;}while(C>>>0<(c[l>>2]|0)>>>0);E=c[m>>2]|0}else{E=D}if(!(E>>>0<h>>>0)){break a}A=E;B=c[j>>2]|0}nj(6040)}}while(0);if((a[u]&1)==0){F=r+1|0}else{F=c[r+8>>2]|0}u=bc(((e|0)==-1?-1:e<<1)|0,f|0,g|0,F|0)|0;F=b;c[F+0>>2]=0;c[F+4>>2]=0;c[F+8>>2]=0;c[t+4>>2]=0;c[t>>2]=6920;F=qn(u|0)|0;g=u+F|0;f=n;e=n;c[e>>2]=0;c[e+4>>2]=0;if((F|0)<=0){Be(r);i=d;return}F=t;e=t;t=g;n=o;E=o+128|0;o=u;u=6920|0;while(1){c[q>>2]=o;h=(Hc[c[u+16>>2]&15](F,f,o,(t-o|0)>32?o+32|0:g,q,n,E,p)|0)==2;m=c[q>>2]|0;if(h|(m|0)==(o|0)){G=20;break}if(n>>>0<(c[p>>2]|0)>>>0){h=n;do{Re(b,c[h>>2]|0);h=h+4|0;}while(h>>>0<(c[p>>2]|0)>>>0);H=c[q>>2]|0}else{H=m}if(!(H>>>0<g>>>0)){G=25;break}o=H;u=c[e>>2]|0}if((G|0)==20){nj(6040)}else if((G|0)==25){Be(r);i=d;return}}function Uj(a,b){a=a|0;b=b|0;a=i;Xa(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Vj(b){b=b|0;var d=0,e=0,f=0;d=i;c[b>>2]=5248;e=b+8|0;b=c[e>>2]|0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}f=ib(2147483647,5064,0)|0;c[1262]=f;eb(5056)}}while(0);if((b|0)==(c[1262]|0)){i=d;return}lb(c[e>>2]|0);i=d;return}function Wj(a){a=a|0;a=Bb(8)|0;de(a,5040);c[a>>2]=2088;oc(a|0,2128,9)}function Xj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=i;i=i+448|0;f=e;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d+ -1;c[b>>2]=5080;d=b+8|0;I=b+12|0;J=b+136|0;a[J]=1;K=b+24|0;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J+ -1|0;}while((J|0)!=0);ze(b+144|0,5064,1);J=c[d>>2]|0;d=c[I>>2]|0;if((d|0)!=(J|0)){c[I>>2]=d+(~((d+ -4+(0-J)|0)>>>2)<<2)}c[9972>>2]=0;c[2492]=3560;if(!((c[896]|0)==-1)){c[G>>2]=3584;c[G+4>>2]=112;c[G+8>>2]=0;we(3584,G,113)}Yj(b,9968,(c[3588>>2]|0)+ -1|0);c[9964>>2]=0;c[2490]=3600;if(!((c[906]|0)==-1)){c[F>>2]=3624;c[F+4>>2]=112;c[F+8>>2]=0;we(3624,F,113)}Yj(b,9960,(c[3628>>2]|0)+ -1|0);c[9948>>2]=0;c[2486]=5176;c[9952>>2]=0;a[9956|0]=0;F=yb()|0;c[9952>>2]=c[F>>2];if(!((c[1290]|0)==-1)){c[E>>2]=5160;c[E+4>>2]=112;c[E+8>>2]=0;we(5160,E,113)}Yj(b,9944,(c[5164>>2]|0)+ -1|0);c[9940>>2]=0;c[2484]=6136;if(!((c[1288]|0)==-1)){c[D>>2]=5152;c[D+4>>2]=112;c[D+8>>2]=0;we(5152,D,113)}Yj(b,9936,(c[5156>>2]|0)+ -1|0);c[9932>>2]=0;c[2482]=6352;if(!((c[1306]|0)==-1)){c[C>>2]=5224;c[C+4>>2]=112;c[C+8>>2]=0;we(5224,C,113)}Yj(b,9928,(c[5228>>2]|0)+ -1|0);c[9916>>2]=0;c[2478]=5248;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}C=ib(2147483647,5064,0)|0;c[1262]=C;eb(5056)}}while(0);c[9920>>2]=c[1262];if(!((c[1308]|0)==-1)){c[B>>2]=5232;c[B+4>>2]=112;c[B+8>>2]=0;we(5232,B,113)}Yj(b,9912,(c[5236>>2]|0)+ -1|0);c[9908>>2]=0;c[2476]=6576;if(!((c[1322]|0)==-1)){c[A>>2]=5288;c[A+4>>2]=112;c[A+8>>2]=0;we(5288,A,113)}Yj(b,9904,(c[5292>>2]|0)+ -1|0);c[9900>>2]=0;c[2474]=6696;if(!((c[1324]|0)==-1)){c[z>>2]=5296;c[z+4>>2]=112;c[z+8>>2]=0;we(5296,z,113)}Yj(b,9896,(c[5300>>2]|0)+ -1|0);c[9876>>2]=0;c[2468]=5328;a[9880|0]=46;a[9881|0]=44;c[9884>>2]=0;c[9888>>2]=0;c[9892>>2]=0;if(!((c[1326]|0)==-1)){c[y>>2]=5304;c[y+4>>2]=112;c[y+8>>2]=0;we(5304,y,113)}Yj(b,9872,(c[5308>>2]|0)+ -1|0);c[9844>>2]=0;c[2460]=5368;c[9848>>2]=46;c[9852>>2]=44;c[9856>>2]=0;c[9860>>2]=0;c[9864>>2]=0;if(!((c[1328]|0)==-1)){c[x>>2]=5312;c[x+4>>2]=112;c[x+8>>2]=0;we(5312,x,113)}Yj(b,9840,(c[5316>>2]|0)+ -1|0);c[9836>>2]=0;c[2458]=3640;if(!((c[924]|0)==-1)){c[w>>2]=3696;c[w+4>>2]=112;c[w+8>>2]=0;we(3696,w,113)}Yj(b,9832,(c[3700>>2]|0)+ -1|0);c[9828>>2]=0;c[2456]=3760;if(!((c[954]|0)==-1)){c[v>>2]=3816;c[v+4>>2]=112;c[v+8>>2]=0;we(3816,v,113)}Yj(b,9824,(c[3820>>2]|0)+ -1|0);c[9820>>2]=0;c[2454]=3832;if(!((c[970]|0)==-1)){c[u>>2]=3880;c[u+4>>2]=112;c[u+8>>2]=0;we(3880,u,113)}Yj(b,9816,(c[3884>>2]|0)+ -1|0);c[9812>>2]=0;c[2452]=3896;if(!((c[986]|0)==-1)){c[t>>2]=3944;c[t+4>>2]=112;c[t+8>>2]=0;we(3944,t,113)}Yj(b,9808,(c[3948>>2]|0)+ -1|0);c[9804>>2]=0;c[2450]=4488;if(!((c[1134]|0)==-1)){c[s>>2]=4536;c[s+4>>2]=112;c[s+8>>2]=0;we(4536,s,113)}Yj(b,9800,(c[4540>>2]|0)+ -1|0);c[9796>>2]=0;c[2448]=4552;if(!((c[1150]|0)==-1)){c[r>>2]=4600;c[r+4>>2]=112;c[r+8>>2]=0;we(4600,r,113)}Yj(b,9792,(c[4604>>2]|0)+ -1|0);c[9788>>2]=0;c[2446]=4616;if(!((c[1166]|0)==-1)){c[q>>2]=4664;c[q+4>>2]=112;c[q+8>>2]=0;we(4664,q,113)}Yj(b,9784,(c[4668>>2]|0)+ -1|0);c[9780>>2]=0;c[2444]=4680;if(!((c[1182]|0)==-1)){c[p>>2]=4728;c[p+4>>2]=112;c[p+8>>2]=0;we(4728,p,113)}Yj(b,9776,(c[4732>>2]|0)+ -1|0);c[9772>>2]=0;c[2442]=4744;if(!((c[1192]|0)==-1)){c[o>>2]=4768;c[o+4>>2]=112;c[o+8>>2]=0;we(4768,o,113)}Yj(b,9768,(c[4772>>2]|0)+ -1|0);c[9764>>2]=0;c[2440]=4824;if(!((c[1212]|0)==-1)){c[n>>2]=4848;c[n+4>>2]=112;c[n+8>>2]=0;we(4848,n,113)}Yj(b,9760,(c[4852>>2]|0)+ -1|0);c[9756>>2]=0;c[2438]=4880;if(!((c[1226]|0)==-1)){c[m>>2]=4904;c[m+4>>2]=112;c[m+8>>2]=0;we(4904,m,113)}Yj(b,9752,(c[4908>>2]|0)+ -1|0);c[9748>>2]=0;c[2436]=4928;if(!((c[1238]|0)==-1)){c[l>>2]=4952;c[l+4>>2]=112;c[l+8>>2]=0;we(4952,l,113)}Yj(b,9744,(c[4956>>2]|0)+ -1|0);c[9732>>2]=0;c[2432]=3976;c[9736>>2]=4024;if(!((c[1014]|0)==-1)){c[k>>2]=4056;c[k+4>>2]=112;c[k+8>>2]=0;we(4056,k,113)}Yj(b,9728,(c[4060>>2]|0)+ -1|0);c[9716>>2]=0;c[2428]=4128;c[9720>>2]=4176;if(!((c[1052]|0)==-1)){c[j>>2]=4208;c[j+4>>2]=112;c[j+8>>2]=0;we(4208,j,113)}Yj(b,9712,(c[4212>>2]|0)+ -1|0);c[9700>>2]=0;c[2424]=6072;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}j=ib(2147483647,5064,0)|0;c[1262]=j;eb(5056)}}while(0);c[9704>>2]=c[1262];c[2424]=4424;if(!((c[1110]|0)==-1)){c[h>>2]=4440;c[h+4>>2]=112;c[h+8>>2]=0;we(4440,h,113)}Yj(b,9696,(c[4444>>2]|0)+ -1|0);c[9684>>2]=0;c[2420]=6072;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}h=ib(2147483647,5064,0)|0;c[1262]=h;eb(5056)}}while(0);c[9688>>2]=c[1262];c[2420]=4456;if(!((c[1118]|0)==-1)){c[g>>2]=4472;c[g+4>>2]=112;c[g+8>>2]=0;we(4472,g,113)}Yj(b,9680,(c[4476>>2]|0)+ -1|0);c[9676>>2]=0;c[2418]=4968;if(!((c[1248]|0)==-1)){c[f>>2]=4992;c[f+4>>2]=112;c[f+8>>2]=0;we(4992,f,113)}Yj(b,9672,(c[4996>>2]|0)+ -1|0);c[9668>>2]=0;c[2416]=5008;if((c[1258]|0)==-1){N=c[5036>>2]|0;O=N+ -1|0;Yj(b,9664,O);i=e;return}c[H>>2]=5032;c[H+4>>2]=112;c[H+8>>2]=0;we(5032,H,113);N=c[5036>>2]|0;O=N+ -1|0;Yj(b,9664,O);i=e;return}function Yj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;be(b);f=a+8|0;g=a+12|0;a=c[g>>2]|0;h=f;j=c[h>>2]|0;k=a-j>>2;do{if(k>>>0>d>>>0){l=j}else{m=d+1|0;if(k>>>0<m>>>0){am(f,m-k|0);l=c[h>>2]|0;break}if(!(k>>>0>m>>>0)){l=j;break}n=j+(m<<2)|0;if((a|0)==(n|0)){l=j;break}c[g>>2]=a+(~((a+ -4+(0-n)|0)>>>2)<<2);l=j}}while(0);j=c[l+(d<<2)>>2]|0;if((j|0)==0){o=l;p=o+(d<<2)|0;c[p>>2]=b;i=e;return}ce(j)|0;o=c[h>>2]|0;p=o+(d<<2)|0;c[p>>2]=b;i=e;return}function Zj(a){a=a|0;var b=0;b=i;_j(a);Wm(a);i=b;return}function _j(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;c[b>>2]=5080;e=b+12|0;f=c[e>>2]|0;g=b+8|0;h=c[g>>2]|0;if((f|0)!=(h|0)){j=f;f=h;h=0;while(1){k=c[f+(h<<2)>>2]|0;if((k|0)==0){l=f;m=j}else{ce(k)|0;l=c[g>>2]|0;m=c[e>>2]|0}k=h+1|0;if(k>>>0<m-l>>2>>>0){j=m;f=l;h=k}else{break}}}Be(b+144|0);h=c[g>>2]|0;if((h|0)==0){i=d;return}g=c[e>>2]|0;if((g|0)!=(h|0)){c[e>>2]=g+(~((g+ -4+(0-h)|0)>>>2)<<2)}if((b+24|0)==(h|0)){a[b+136|0]=0;i=d;return}else{Wm(h);i=d;return}}function $j(){var b=0,d=0,e=0;b=i;if((a[5136]|0)!=0){d=c[1282]|0;i=b;return d|0}if((Fa(5136)|0)==0){d=c[1282]|0;i=b;return d|0}do{if((a[5112]|0)==0){if((Fa(5112)|0)==0){break}Xj(9504,1);c[1274]=9504;c[1276]=5096;eb(5112)}}while(0);e=c[c[1276]>>2]|0;c[1280]=e;be(e);c[1282]=5120;eb(5136);d=c[1282]|0;i=b;return d|0}function ak(a){a=a|0;var b=0,d=0,e=0;b=i;d=$j()|0;e=c[d>>2]|0;c[a>>2]=e;be(e);i=b;return}function bk(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=c[b>>2]|0;c[a>>2]=e;be(e);i=d;return}function ck(a){a=a|0;var b=0;b=i;ce(c[a>>2]|0)|0;i=b;return}function dk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=c[a>>2]|0;a=b;if(!((c[a>>2]|0)==-1)){c[e>>2]=b;c[e+4>>2]=112;c[e+8>>2]=0;we(a,e,113)}e=(c[b+4>>2]|0)+ -1|0;b=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-b>>2>>>0>e>>>0)){g=Bb(4)|0;h=g;um(h);oc(g|0,13120,101)}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=Bb(4)|0;h=g;um(h);oc(g|0,13120,101)}else{i=d;return f|0}return 0}function ek(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function fk(a){a=a|0;var b=0;b=i;if((a|0)==0){i=b;return}zc[c[(c[a>>2]|0)+4>>2]&127](a);i=b;return}function gk(a){a=a|0;var b=0;b=c[1286]|0;c[1286]=b+1;c[a+4>>2]=b+1;i=i;return}function hk(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function ik(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0;a=i;if(!(e>>>0<128)){f=0;i=a;return f|0}g=yb()|0;f=(b[(c[g>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;i=a;return f|0}function jk(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;if((d|0)==(e|0)){g=d;i=a;return g|0}else{h=d;j=f}while(1){f=c[h>>2]|0;if(f>>>0<128){d=yb()|0;k=b[(c[d>>2]|0)+(f<<1)>>1]|0}else{k=0}b[j>>1]=k;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;j=j+2|0}}i=a;return g|0}function kk(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;a:do{if((e|0)==(f|0)){g=e}else{h=e;while(1){j=c[h>>2]|0;if(j>>>0<128){k=yb()|0;if(!((b[(c[k>>2]|0)+(j<<1)>>1]&d)<<16>>16==0)){g=h;break a}}j=h+4|0;if((j|0)==(f|0)){g=f;break}else{h=j}}}}while(0);i=a;return g|0}function lk(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;a=i;a:do{if((e|0)==(f|0)){g=e}else{h=e;while(1){j=c[h>>2]|0;if(!(j>>>0<128)){g=h;break a}k=yb()|0;l=h+4|0;if((b[(c[k>>2]|0)+(j<<1)>>1]&d)<<16>>16==0){g=h;break a}if((l|0)==(f|0)){g=f;break}else{h=l}}}}while(0);i=a;return g|0}function mk(a,b){a=a|0;b=b|0;var d=0,e=0;a=i;if(!(b>>>0<128)){d=b;i=a;return d|0}e=Ia()|0;d=c[(c[e>>2]|0)+(b<<2)>>2]|0;i=a;return d|0}function nk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=Ia()|0;h=c[(c[g>>2]|0)+(b<<2)>>2]|0}else{h=b}c[f>>2]=h;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}i=a;return e|0}function ok(a,b){a=a|0;b=b|0;var d=0,e=0;a=i;if(!(b>>>0<128)){d=b;i=a;return d|0}e=hc()|0;d=c[(c[e>>2]|0)+(b<<2)>>2]|0;i=a;return d|0}function pk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=hc()|0;h=c[(c[g>>2]|0)+(b<<2)>>2]|0}else{h=b}c[f>>2]=h;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}i=a;return e|0}function qk(a,b){a=a|0;b=b|0;i=i;return b<<24>>24|0}function rk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;if((d|0)==(e|0)){g=d;i=b;return g|0}else{h=d;j=f}while(1){c[j>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{j=j+4|0;h=f}}i=b;return g|0}function sk(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return(b>>>0<128?b&255:c)|0}function tk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;b=i;if((d|0)==(e|0)){h=d;i=b;return h|0}j=((e+ -4+(0-d)|0)>>>2)+1|0;k=d;l=g;while(1){g=c[k>>2]|0;a[l]=g>>>0<128?g&255:f;g=k+4|0;if((g|0)==(e|0)){break}else{l=l+1|0;k=g}}h=d+(j<<2)|0;i=b;return h|0}function uk(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=5176;e=c[b+8>>2]|0;do{if((e|0)!=0){if((a[b+12|0]|0)==0){break}Xm(e)}}while(0);Wm(b);i=d;return}function vk(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=5176;e=c[b+8>>2]|0;if((e|0)==0){i=d;return}if((a[b+12|0]|0)==0){i=d;return}Xm(e);i=d;return}function wk(a,b){a=a|0;b=b|0;var d=0,e=0;a=i;if(!(b<<24>>24>-1)){d=b;i=a;return d|0}e=Ia()|0;d=c[(c[e>>2]|0)+((b&255)<<2)>>2]&255;i=a;return d|0}function xk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=Ia()|0;j=c[(c[h>>2]|0)+(d<<24>>24<<2)>>2]&255}else{j=d}a[g]=j;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}i=b;return f|0}function yk(a,b){a=a|0;b=b|0;var d=0,e=0;a=i;if(!(b<<24>>24>-1)){d=b;i=a;return d|0}e=hc()|0;d=c[(c[e>>2]|0)+(b<<24>>24<<2)>>2]&255;i=a;return d|0}function zk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=hc()|0;j=c[(c[h>>2]|0)+(d<<24>>24<<2)>>2]&255}else{j=d}a[g]=j;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}i=b;return f|0}function Ak(a,b){a=a|0;b=b|0;i=i;return b|0}function Bk(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;b=i;if((c|0)==(d|0)){f=c}else{g=c;c=e;while(1){a[c]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{c=c+1|0;g=e}}}i=b;return f|0}function Ck(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return(b<<24>>24>-1?b:c)|0}function Dk(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;if((c|0)==(d|0)){g=c;i=b;return g|0}else{h=c;j=f}while(1){f=a[h]|0;a[j]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{j=j+1|0;h=f}}i=b;return g|0}function Ek(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Fk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;c[f>>2]=d;c[j>>2]=g;i=i;return 3}function Gk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;c[f>>2]=d;c[j>>2]=g;i=i;return 3}function Hk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;i=i;return 3}function Ik(a){a=a|0;i=i;return 1}function Jk(a){a=a|0;i=i;return 1}function Kk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;i=i;return(b>>>0<e>>>0?b:e)|0}function Lk(a){a=a|0;i=i;return 1}function Mk(a){a=a|0;var b=0;b=i;Vj(a);Wm(a);i=b;return}function Nk(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+8|0;m=l;n=m;o=i;i=i+8|0;p=(e|0)==(f|0);a:do{if(p){c[k>>2]=h;c[g>>2]=e;q=e}else{r=e;while(1){s=r+4|0;if((c[r>>2]|0)==0){t=r;break}if((s|0)==(f|0)){t=f;break}else{r=s}}c[k>>2]=h;c[g>>2]=e;if(p|(h|0)==(j|0)){q=e;break}r=d;s=j;u=b+8|0;v=o;w=e;x=h;y=t;while(1){z=r;A=c[z+4>>2]|0;B=m;c[B>>2]=c[z>>2];c[B+4>>2]=A;A=Fb(c[u>>2]|0)|0;B=nm(x,g,y-w>>2,s-x|0,d)|0;if((A|0)!=0){Fb(A|0)|0}if((B|0)==-1){C=10;break}else if((B|0)==0){D=1;C=33;break}A=(c[k>>2]|0)+B|0;c[k>>2]=A;if((A|0)==(j|0)){C=31;break}if((y|0)==(f|0)){E=c[g>>2]|0;F=A;G=f}else{A=Fb(c[u>>2]|0)|0;B=mm(v,0,d)|0;if((A|0)!=0){Fb(A|0)|0}if((B|0)==-1){D=2;C=33;break}A=c[k>>2]|0;if(B>>>0>(s-A|0)>>>0){D=1;C=33;break}b:do{if((B|0)!=0){z=A;H=B;I=v;while(1){J=a[I]|0;c[k>>2]=z+1;a[z]=J;J=H+ -1|0;if((J|0)==0){break b}z=c[k>>2]|0;I=I+1|0;H=J}}}while(0);B=(c[g>>2]|0)+4|0;c[g>>2]=B;c:do{if((B|0)==(f|0)){K=f}else{A=B;while(1){H=A+4|0;if((c[A>>2]|0)==0){K=A;break c}if((H|0)==(f|0)){K=f;break}else{A=H}}}}while(0);E=B;F=c[k>>2]|0;G=K}if((E|0)==(f|0)|(F|0)==(j|0)){q=E;break a}else{w=E;x=F;y=G}}if((C|0)==10){c[k>>2]=x;d:do{if((w|0)==(c[g>>2]|0)){L=w}else{y=w;v=x;while(1){s=c[y>>2]|0;r=Fb(c[u>>2]|0)|0;A=mm(v,s,n)|0;if((r|0)!=0){Fb(r|0)|0}if((A|0)==-1){L=y;break d}r=(c[k>>2]|0)+A|0;c[k>>2]=r;A=y+4|0;if((A|0)==(c[g>>2]|0)){L=A;break}else{y=A;v=r}}}}while(0);c[g>>2]=L;D=2;i=l;return D|0}else if((C|0)==31){q=c[g>>2]|0;break}else if((C|0)==33){i=l;return D|0}}}while(0);D=(q|0)!=(f|0)|0;i=l;return D|0}function Ok(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;l=i;i=i+8|0;m=l;n=m;o=(e|0)==(f|0);a:do{if(o){c[k>>2]=h;c[g>>2]=e;p=e}else{q=e;while(1){r=q+1|0;if((a[q]|0)==0){s=q;break}if((r|0)==(f|0)){s=f;break}else{q=r}}c[k>>2]=h;c[g>>2]=e;if(o|(h|0)==(j|0)){p=e;break}q=d;r=j;t=b+8|0;u=e;v=h;w=s;while(1){x=q;y=c[x+4>>2]|0;z=m;c[z>>2]=c[x>>2];c[z+4>>2]=y;A=w;y=Fb(c[t>>2]|0)|0;z=jm(v,g,A-u|0,r-v>>2,d)|0;if((y|0)!=0){Fb(y|0)|0}if((z|0)==-1){B=10;break}else if((z|0)==0){C=2;B=32;break}y=(c[k>>2]|0)+(z<<2)|0;c[k>>2]=y;if((y|0)==(j|0)){B=30;break}z=c[g>>2]|0;if((w|0)==(f|0)){D=z;E=y;F=f}else{x=Fb(c[t>>2]|0)|0;G=im(y,z,1,d)|0;if((x|0)!=0){Fb(x|0)|0}if((G|0)!=0){C=2;B=32;break}c[k>>2]=(c[k>>2]|0)+4;G=(c[g>>2]|0)+1|0;c[g>>2]=G;b:do{if((G|0)==(f|0)){H=f}else{x=G;while(1){z=x+1|0;if((a[x]|0)==0){H=x;break b}if((z|0)==(f|0)){H=f;break}else{x=z}}}}while(0);D=G;E=c[k>>2]|0;F=H}if((D|0)==(f|0)|(E|0)==(j|0)){p=D;break a}else{u=D;v=E;w=F}}if((B|0)==10){c[k>>2]=v;c:do{if((u|0)==(c[g>>2]|0)){I=u}else{w=u;r=v;while(1){q=Fb(c[t>>2]|0)|0;x=im(r,w,A-w|0,n)|0;if((q|0)!=0){Fb(q|0)|0}if((x|0)==-2){B=16;break}else if((x|0)==0){J=w+1|0}else if((x|0)==-1){B=15;break}else{J=w+x|0}x=(c[k>>2]|0)+4|0;c[k>>2]=x;if((J|0)==(c[g>>2]|0)){I=J;break c}else{w=J;r=x}}if((B|0)==15){c[g>>2]=w;C=2;i=l;return C|0}else if((B|0)==16){c[g>>2]=w;C=1;i=l;return C|0}}}while(0);c[g>>2]=I;C=(I|0)!=(f|0)|0;i=l;return C|0}else if((B|0)==30){p=c[g>>2]|0;break}else if((B|0)==32){i=l;return C|0}}}while(0);C=(p|0)!=(f|0)|0;i=l;return C|0}function Pk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h;j=Fb(c[b+8>>2]|0)|0;b=mm(e,0,d)|0;if((j|0)!=0){Fb(j|0)|0}if((b|0)==0|(b|0)==-1){k=2;i=h;return k|0}j=b+ -1|0;b=c[g>>2]|0;if(j>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((j|0)==0){k=0;i=h;return k|0}else{l=b;m=j;n=e}while(1){e=a[n]|0;c[g>>2]=l+1;a[l]=e;e=m+ -1|0;if((e|0)==0){k=0;break}l=c[g>>2]|0;n=n+1|0;m=e}i=h;return k|0}function Qk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;d=a+8|0;a=Fb(c[d>>2]|0)|0;e=lm(0,0,4)|0;if((a|0)!=0){Fb(a|0)|0}do{if((e|0)==0){a=c[d>>2]|0;if((a|0)==0){f=1;break}g=Fb(a|0)|0;if((g|0)==0){f=0;break}Fb(g|0)|0;f=0}else{f=-1}}while(0);i=b;return f|0}function Rk(a){a=a|0;i=i;return 0}function Sk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;if((f|0)==0|(d|0)==(e|0)){h=0;i=g;return h|0}j=e;k=a+8|0;a=d;d=0;l=0;while(1){m=Fb(c[k>>2]|0)|0;n=hm(a,j-a|0,b)|0;if((m|0)!=0){Fb(m|0)|0}if((n|0)==0){o=a+1|0;p=1}else if((n|0)==-2|(n|0)==-1){h=d;q=9;break}else{o=a+n|0;p=n}n=p+d|0;m=l+1|0;if(m>>>0>=f>>>0|(o|0)==(e|0)){h=n;q=9;break}else{a=o;d=n;l=m}}if((q|0)==9){i=g;return h|0}return 0}function Tk(a){a=a|0;var b=0,d=0,e=0;b=i;d=c[a+8>>2]|0;do{if((d|0)==0){e=1}else{a=Fb(d|0)|0;if((a|0)==0){e=4;break}Fb(a|0)|0;e=4}}while(0);i=b;return e|0}function Uk(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Vk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=Wk(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function Wk(d,f,g,h,j,k,l,m){d=d|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;c[g>>2]=d;c[k>>2]=h;do{if((m&2|0)!=0){if((j-h|0)<3){o=1;i=n;return o|0}else{c[k>>2]=h+1;a[h]=-17;d=c[k>>2]|0;c[k>>2]=d+1;a[d]=-69;d=c[k>>2]|0;c[k>>2]=d+1;a[d]=-65;break}}}while(0);h=f;m=c[g>>2]|0;if(!(m>>>0<f>>>0)){o=0;i=n;return o|0}d=j;j=m;a:while(1){m=b[j>>1]|0;p=m&65535;if(p>>>0>l>>>0){o=2;q=26;break}do{if((m&65535)<128){r=c[k>>2]|0;if((d-r|0)<1){o=1;q=26;break a}c[k>>2]=r+1;a[r]=m}else{if((m&65535)<2048){r=c[k>>2]|0;if((d-r|0)<2){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>6|192;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if((m&65535)<55296){r=c[k>>2]|0;if((d-r|0)<3){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>12|224;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p>>>6&63|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if(!((m&65535)<56320)){if((m&65535)<57344){o=2;q=26;break a}r=c[k>>2]|0;if((d-r|0)<3){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>12|224;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p>>>6&63|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if((h-j|0)<4){o=1;q=26;break a}r=j+2|0;s=e[r>>1]|0;if((s&64512|0)!=56320){o=2;q=26;break a}if((d-(c[k>>2]|0)|0)<4){o=1;q=26;break a}t=p&960;if(((t<<10)+65536|p<<10&64512|s&1023)>>>0>l>>>0){o=2;q=26;break a}c[g>>2]=r;r=(t>>>6)+1|0;t=c[k>>2]|0;c[k>>2]=t+1;a[t]=r>>>2|240;t=c[k>>2]|0;c[k>>2]=t+1;a[t]=p>>>2&15|r<<4&48|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p<<4&48|s>>>6&15|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=s&63|128}}while(0);p=(c[g>>2]|0)+2|0;c[g>>2]=p;if(p>>>0<f>>>0){j=p}else{o=0;q=26;break}}if((q|0)==26){i=n;return o|0}return 0}function Xk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=Yk(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function Yk(e,f,g,h,j,k,l,m){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;n=i;c[g>>2]=e;c[k>>2]=h;h=c[g>>2]|0;do{if((m&4|0)==0){o=h}else{if((f-h|0)<=2){o=h;break}if(!((a[h]|0)==-17)){o=h;break}if(!((a[h+1|0]|0)==-69)){o=h;break}if(!((a[h+2|0]|0)==-65)){o=h;break}e=h+3|0;c[g>>2]=e;o=e}}while(0);a:do{if(o>>>0<f>>>0){h=f;m=j;e=o;p=c[k>>2]|0;b:while(1){if(!(p>>>0<j>>>0)){q=e;break a}r=a[e]|0;s=r&255;if(s>>>0>l>>>0){t=2;u=41;break}do{if(r<<24>>24>-1){b[p>>1]=r&255;c[g>>2]=e+1}else{if((r&255)<194){t=2;u=41;break b}if((r&255)<224){if((h-e|0)<2){t=1;u=41;break b}v=d[e+1|0]|0;if((v&192|0)!=128){t=2;u=41;break b}w=v&63|s<<6&1984;if(w>>>0>l>>>0){t=2;u=41;break b}b[p>>1]=w;c[g>>2]=e+2;break}if((r&255)<240){if((h-e|0)<3){t=1;u=41;break b}w=a[e+1|0]|0;v=a[e+2|0]|0;if((s|0)==224){if(!((w&-32)<<24>>24==-96)){t=2;u=41;break b}}else if((s|0)==237){if(!((w&-32)<<24>>24==-128)){t=2;u=41;break b}}else{if(!((w&-64)<<24>>24==-128)){t=2;u=41;break b}}x=v&255;if((x&192|0)!=128){t=2;u=41;break b}v=(w&255)<<6&4032|s<<12|x&63;if((v&65535)>>>0>l>>>0){t=2;u=41;break b}b[p>>1]=v;c[g>>2]=e+3;break}if(!((r&255)<245)){t=2;u=41;break b}if((h-e|0)<4){t=1;u=41;break b}v=a[e+1|0]|0;x=a[e+2|0]|0;w=a[e+3|0]|0;if((s|0)==244){if(!((v&-16)<<24>>24==-128)){t=2;u=41;break b}}else if((s|0)==240){if(!((v+112<<24>>24&255)<48)){t=2;u=41;break b}}else{if(!((v&-64)<<24>>24==-128)){t=2;u=41;break b}}y=x&255;if((y&192|0)!=128){t=2;u=41;break b}x=w&255;if((x&192|0)!=128){t=2;u=41;break b}if((m-p|0)<4){t=1;u=41;break b}w=s&7;z=v&255;v=y<<6;A=x&63;if((z<<12&258048|w<<18|v&4032|A)>>>0>l>>>0){t=2;u=41;break b}b[p>>1]=z<<2&60|y>>>4&3|((z>>>4&3|w<<2)<<6)+16320|55296;w=p+2|0;c[k>>2]=w;b[w>>1]=A|v&960|56320;c[g>>2]=(c[g>>2]|0)+4}}while(0);s=(c[k>>2]|0)+2|0;c[k>>2]=s;r=c[g>>2]|0;if(r>>>0<f>>>0){e=r;p=s}else{q=r;break a}}if((u|0)==41){i=n;return t|0}}else{q=o}}while(0);t=q>>>0<f>>>0|0;i=n;return t|0}function Zk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;i=i;return 3}function _k(a){a=a|0;i=i;return 0}function $k(a){a=a|0;i=i;return 0}function al(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=i;a=bl(c,d,e,1114111,0)|0;i=b;return a|0}function bl(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=i;do{if((g&4|0)==0){j=b}else{if((c-b|0)<=2){j=b;break}if(!((a[b]|0)==-17)){j=b;break}if(!((a[b+1|0]|0)==-69)){j=b;break}j=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);a:do{if(j>>>0<c>>>0&(e|0)!=0){g=c;k=j;l=0;b:while(1){m=a[k]|0;n=m&255;if(n>>>0>f>>>0){o=k;break a}do{if(m<<24>>24>-1){p=k+1|0;q=l}else{if((m&255)<194){o=k;break a}if((m&255)<224){if((g-k|0)<2){o=k;break a}r=d[k+1|0]|0;if((r&192|0)!=128){o=k;break a}if((r&63|n<<6&1984)>>>0>f>>>0){o=k;break a}p=k+2|0;q=l;break}if((m&255)<240){s=k;if((g-s|0)<3){o=k;break a}r=a[k+1|0]|0;t=a[k+2|0]|0;if((n|0)==237){if(!((r&-32)<<24>>24==-128)){u=23;break b}}else if((n|0)==224){if(!((r&-32)<<24>>24==-96)){u=21;break b}}else{if(!((r&-64)<<24>>24==-128)){u=25;break b}}v=t&255;if((v&192|0)!=128){o=k;break a}if(((r&255)<<6&4032|n<<12&61440|v&63)>>>0>f>>>0){o=k;break a}p=k+3|0;q=l;break}if(!((m&255)<245)){o=k;break a}w=k;if((g-w|0)<4){o=k;break a}if((e-l|0)>>>0<2){o=k;break a}v=a[k+1|0]|0;r=a[k+2|0]|0;t=a[k+3|0]|0;if((n|0)==240){if(!((v+112<<24>>24&255)<48)){u=34;break b}}else if((n|0)==244){if(!((v&-16)<<24>>24==-128)){u=36;break b}}else{if(!((v&-64)<<24>>24==-128)){u=38;break b}}x=r&255;if((x&192|0)!=128){o=k;break a}r=t&255;if((r&192|0)!=128){o=k;break a}if(((v&255)<<12&258048|n<<18&1835008|x<<6&4032|r&63)>>>0>f>>>0){o=k;break a}p=k+4|0;q=l+1|0}}while(0);n=q+1|0;if(p>>>0<c>>>0&n>>>0<e>>>0){k=p;l=n}else{o=p;break a}}if((u|0)==21){y=s-b|0;i=h;return y|0}else if((u|0)==23){y=s-b|0;i=h;return y|0}else if((u|0)==25){y=s-b|0;i=h;return y|0}else if((u|0)==34){y=w-b|0;i=h;return y|0}else if((u|0)==36){y=w-b|0;i=h;return y|0}else if((u|0)==38){y=w-b|0;i=h;return y|0}}else{o=j}}while(0);y=o-b|0;i=h;return y|0}function cl(a){a=a|0;i=i;return 4}function dl(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function el(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=fl(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function fl(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0;l=i;c[e>>2]=b;c[h>>2]=f;do{if((k&2|0)!=0){if((g-f|0)<3){m=1;i=l;return m|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(!(f>>>0<d>>>0)){m=0;i=l;return m|0}k=g;g=f;a:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>j>>>0){m=2;n=19;break}do{if(f>>>0<128){b=c[h>>2]|0;if((k-b|0)<1){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f}else{if(f>>>0<2048){b=c[h>>2]|0;if((k-b|0)<2){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>6|192;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f&63|128;break}b=c[h>>2]|0;o=k-b|0;if(f>>>0<65536){if((o|0)<3){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>12|224;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=f>>>6&63|128;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=f&63|128;break}else{if((o|0)<4){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>18|240;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f>>>12&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f&63|128;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{m=0;n=19;break}}if((n|0)==19){i=l;return m|0}return 0}function gl(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=hl(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function hl(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;m=i;c[f>>2]=b;c[j>>2]=g;g=c[f>>2]|0;do{if((l&4|0)==0){n=g}else{if((e-g|0)<=2){n=g;break}if(!((a[g]|0)==-17)){n=g;break}if(!((a[g+1|0]|0)==-69)){n=g;break}if(!((a[g+2|0]|0)==-65)){n=g;break}b=g+3|0;c[f>>2]=b;n=b}}while(0);a:do{if(n>>>0<e>>>0){g=e;l=n;b=c[j>>2]|0;while(1){if(!(b>>>0<h>>>0)){o=l;p=39;break a}q=a[l]|0;r=q&255;do{if(q<<24>>24>-1){if(r>>>0>k>>>0){s=2;break a}c[b>>2]=r;c[f>>2]=l+1}else{if((q&255)<194){s=2;break a}if((q&255)<224){if((g-l|0)<2){s=1;break a}t=d[l+1|0]|0;if((t&192|0)!=128){s=2;break a}u=t&63|r<<6&1984;if(u>>>0>k>>>0){s=2;break a}c[b>>2]=u;c[f>>2]=l+2;break}if((q&255)<240){if((g-l|0)<3){s=1;break a}u=a[l+1|0]|0;t=a[l+2|0]|0;if((r|0)==224){if(!((u&-32)<<24>>24==-96)){s=2;break a}}else if((r|0)==237){if(!((u&-32)<<24>>24==-128)){s=2;break a}}else{if(!((u&-64)<<24>>24==-128)){s=2;break a}}v=t&255;if((v&192|0)!=128){s=2;break a}t=(u&255)<<6&4032|r<<12&61440|v&63;if(t>>>0>k>>>0){s=2;break a}c[b>>2]=t;c[f>>2]=l+3;break}if(!((q&255)<245)){s=2;break a}if((g-l|0)<4){s=1;break a}t=a[l+1|0]|0;v=a[l+2|0]|0;u=a[l+3|0]|0;if((r|0)==244){if(!((t&-16)<<24>>24==-128)){s=2;break a}}else if((r|0)==240){if(!((t+112<<24>>24&255)<48)){s=2;break a}}else{if(!((t&-64)<<24>>24==-128)){s=2;break a}}w=v&255;if((w&192|0)!=128){s=2;break a}v=u&255;if((v&192|0)!=128){s=2;break a}u=(t&255)<<12&258048|r<<18&1835008|w<<6&4032|v&63;if(u>>>0>k>>>0){s=2;break a}c[b>>2]=u;c[f>>2]=l+4}}while(0);r=(c[j>>2]|0)+4|0;c[j>>2]=r;q=c[f>>2]|0;if(q>>>0<e>>>0){l=q;b=r}else{o=q;p=39;break}}}else{o=n;p=39}}while(0);if((p|0)==39){s=o>>>0<e>>>0|0}i=m;return s|0}function il(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;i=i;return 3}function jl(a){a=a|0;i=i;return 0}function kl(a){a=a|0;i=i;return 0}function ll(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=i;a=ml(c,d,e,1114111,0)|0;i=b;return a|0}function ml(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;do{if((g&4|0)==0){j=b}else{if((c-b|0)<=2){j=b;break}if(!((a[b]|0)==-17)){j=b;break}if(!((a[b+1|0]|0)==-69)){j=b;break}j=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);a:do{if(j>>>0<c>>>0&(e|0)!=0){g=c;k=j;l=1;b:while(1){m=a[k]|0;n=m&255;do{if(m<<24>>24>-1){if(n>>>0>f>>>0){o=k;break a}p=k+1|0}else{if((m&255)<194){o=k;break a}if((m&255)<224){if((g-k|0)<2){o=k;break a}q=d[k+1|0]|0;if((q&192|0)!=128){o=k;break a}if((q&63|n<<6&1984)>>>0>f>>>0){o=k;break a}p=k+2|0;break}if((m&255)<240){r=k;if((g-r|0)<3){o=k;break a}q=a[k+1|0]|0;s=a[k+2|0]|0;if((n|0)==237){if(!((q&-32)<<24>>24==-128)){t=23;break b}}else if((n|0)==224){if(!((q&-32)<<24>>24==-96)){t=21;break b}}else{if(!((q&-64)<<24>>24==-128)){t=25;break b}}u=s&255;if((u&192|0)!=128){o=k;break a}if(((q&255)<<6&4032|n<<12&61440|u&63)>>>0>f>>>0){o=k;break a}p=k+3|0;break}if(!((m&255)<245)){o=k;break a}v=k;if((g-v|0)<4){o=k;break a}u=a[k+1|0]|0;q=a[k+2|0]|0;s=a[k+3|0]|0;if((n|0)==240){if(!((u+112<<24>>24&255)<48)){t=33;break b}}else if((n|0)==244){if(!((u&-16)<<24>>24==-128)){t=35;break b}}else{if(!((u&-64)<<24>>24==-128)){t=37;break b}}w=q&255;if((w&192|0)!=128){o=k;break a}q=s&255;if((q&192|0)!=128){o=k;break a}if(((u&255)<<12&258048|n<<18&1835008|w<<6&4032|q&63)>>>0>f>>>0){o=k;break a}p=k+4|0}}while(0);if(!(p>>>0<c>>>0&l>>>0<e>>>0)){o=p;break a}k=p;l=l+1|0}if((t|0)==21){x=r-b|0;i=h;return x|0}else if((t|0)==23){x=r-b|0;i=h;return x|0}else if((t|0)==25){x=r-b|0;i=h;return x|0}else if((t|0)==33){x=v-b|0;i=h;return x|0}else if((t|0)==35){x=v-b|0;i=h;return x|0}else if((t|0)==37){x=v-b|0;i=h;return x|0}}else{o=j}}while(0);x=o-b|0;i=h;return x|0}function nl(a){a=a|0;i=i;return 4}function ol(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function pl(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function ql(a){a=a|0;var b=0;b=i;c[a>>2]=5328;Be(a+12|0);Wm(a);i=b;return}function rl(a){a=a|0;var b=0;b=i;c[a>>2]=5328;Be(a+12|0);i=b;return}function sl(a){a=a|0;var b=0;b=i;c[a>>2]=5368;Be(a+16|0);Wm(a);i=b;return}function tl(a){a=a|0;var b=0;b=i;c[a>>2]=5368;Be(a+16|0);i=b;return}function ul(b){b=b|0;i=i;return a[b+8|0]|0}function vl(a){a=a|0;i=i;return c[a+8>>2]|0}function wl(b){b=b|0;i=i;return a[b+9|0]|0}function xl(a){a=a|0;i=i;return c[a+12>>2]|0}function yl(a,b){a=a|0;b=b|0;var c=0;c=i;ye(a,b+12|0);i=c;return}function zl(a,b){a=a|0;b=b|0;var c=0;c=i;ye(a,b+16|0);i=c;return}function Al(a,b){a=a|0;b=b|0;b=i;ze(a,5400,4);i=b;return}function Bl(a,b){a=a|0;b=b|0;b=i;Le(a,5408,pm(5408)|0);i=b;return}function Cl(a,b){a=a|0;b=b|0;b=i;ze(a,5432,5);i=b;return}function Dl(a,b){a=a|0;b=b|0;b=i;Le(a,5440,pm(5440)|0);i=b;return}function El(b){b=b|0;var d=0;b=i;if((a[5472]|0)!=0){d=c[1366]|0;i=b;return d|0}if((Fa(5472)|0)==0){d=c[1366]|0;i=b;return d|0}do{if((a[12672]|0)==0){if((Fa(12672)|0)==0){break}ln(12504,0,168)|0;uc(116,0,p|0)|0;eb(12672)}}while(0);De(12504,12680)|0;De(12516|0,12688)|0;De(12528|0,12696)|0;De(12540|0,12704)|0;De(12552|0,12720)|0;De(12564|0,12736)|0;De(12576|0,12744)|0;De(12588|0,12760)|0;De(12600|0,12768)|0;De(12612|0,12776)|0;De(12624|0,12784)|0;De(12636|0,12792)|0;De(12648|0,12800)|0;De(12660|0,12808)|0;c[1366]=12504;eb(5472);d=c[1366]|0;i=b;return d|0}function Fl(b){b=b|0;var d=0;b=i;if((a[5488]|0)!=0){d=c[1370]|0;i=b;return d|0}if((Fa(5488)|0)==0){d=c[1370]|0;i=b;return d|0}do{if((a[12136]|0)==0){if((Fa(12136)|0)==0){break}ln(11968,0,168)|0;uc(117,0,p|0)|0;eb(12136)}}while(0);Oe(11968,12144)|0;Oe(11980|0,12176)|0;Oe(11992|0,12208)|0;Oe(12004|0,12240)|0;Oe(12016|0,12280)|0;Oe(12028|0,12320)|0;Oe(12040|0,12352)|0;Oe(12052|0,12392)|0;Oe(12064|0,12408)|0;Oe(12076|0,12424)|0;Oe(12088|0,12440)|0;Oe(12100|0,12456)|0;Oe(12112|0,12472)|0;Oe(12124|0,12488)|0;c[1370]=11968;eb(5488);d=c[1370]|0;i=b;return d|0}function Gl(b){b=b|0;var d=0;b=i;if((a[5504]|0)!=0){d=c[1374]|0;i=b;return d|0}if((Fa(5504)|0)==0){d=c[1374]|0;i=b;return d|0}do{if((a[11744]|0)==0){if((Fa(11744)|0)==0){break}ln(11456,0,288)|0;uc(118,0,p|0)|0;eb(11744)}}while(0);De(11456,11752)|0;De(11468|0,11760)|0;De(11480|0,11776)|0;De(11492|0,11784)|0;De(11504|0,11792)|0;De(11516|0,11800)|0;De(11528|0,11808)|0;De(11540|0,11816)|0;De(11552|0,11824)|0;De(11564|0,11840)|0;De(11576|0,11848)|0;De(11588|0,11864)|0;De(11600|0,11880)|0;De(11612|0,11888)|0;De(11624|0,11896)|0;De(11636|0,11904)|0;De(11648|0,11792)|0;De(11660|0,11912)|0;De(11672|0,11920)|0;De(11684|0,11928)|0;De(11696|0,11936)|0;De(11708|0,11944)|0;De(11720|0,11952)|0;De(11732|0,11960)|0;c[1374]=11456;eb(5504);d=c[1374]|0;i=b;return d|0}function Hl(b){b=b|0;var d=0;b=i;if((a[5520]|0)!=0){d=c[1378]|0;i=b;return d|0}if((Fa(5520)|0)==0){d=c[1378]|0;i=b;return d|0}do{if((a[10904]|0)==0){if((Fa(10904)|0)==0){break}ln(10616,0,288)|0;uc(119,0,p|0)|0;eb(10904)}}while(0);Oe(10616,10912)|0;Oe(10628|0,10944)|0;Oe(10640|0,10984)|0;Oe(10652|0,11008)|0;Oe(10664|0,11328)|0;Oe(10676|0,11032)|0;Oe(10688|0,11056)|0;Oe(10700|0,11080)|0;Oe(10712|0,11112)|0;Oe(10724|0,11152)|0;Oe(10736|0,11184)|0;Oe(10748|0,11224)|0;Oe(10760|0,11264)|0;Oe(10772|0,11280)|0;Oe(10784|0,11296)|0;Oe(10796|0,11312)|0;Oe(10808|0,11328)|0;Oe(10820|0,11344)|0;Oe(10832|0,11360)|0;Oe(10844|0,11376)|0;Oe(10856|0,11392)|0;Oe(10868|0,11408)|0;Oe(10880|0,11424)|0;Oe(10892|0,11440)|0;c[1378]=10616;eb(5520);d=c[1378]|0;i=b;return d|0}function Il(b){b=b|0;var d=0;b=i;if((a[5536]|0)!=0){d=c[1382]|0;i=b;return d|0}if((Fa(5536)|0)==0){d=c[1382]|0;i=b;return d|0}do{if((a[10592]|0)==0){if((Fa(10592)|0)==0){break}ln(10304,0,288)|0;uc(120,0,p|0)|0;eb(10592)}}while(0);De(10304,10600)|0;De(10316|0,10608)|0;c[1382]=10304;eb(5536);d=c[1382]|0;i=b;return d|0}function Jl(b){b=b|0;var d=0;b=i;if((a[5552]|0)!=0){d=c[1386]|0;i=b;return d|0}if((Fa(5552)|0)==0){d=c[1386]|0;i=b;return d|0}do{if((a[10264]|0)==0){if((Fa(10264)|0)==0){break}ln(9976,0,288)|0;uc(121,0,p|0)|0;eb(10264)}}while(0);Oe(9976,10272)|0;Oe(9988|0,10288)|0;c[1386]=9976;eb(5552);d=c[1386]|0;i=b;return d|0}function Kl(b){b=b|0;b=i;do{if((a[5576]|0)==0){if((Fa(5576)|0)==0){break}ze(5560,5584,8);uc(122,5560,p|0)|0;eb(5576)}}while(0);i=b;return 5560}function Ll(b){b=b|0;b=i;if((a[5616]|0)!=0){i=b;return 5600}if((Fa(5616)|0)==0){i=b;return 5600}Le(5600,5624,pm(5624)|0);uc(123,5600,p|0)|0;eb(5616);i=b;return 5600}function Ml(b){b=b|0;b=i;do{if((a[5680]|0)==0){if((Fa(5680)|0)==0){break}ze(5664,5688,8);uc(122,5664,p|0)|0;eb(5680)}}while(0);i=b;return 5664}function Nl(b){b=b|0;b=i;if((a[5720]|0)!=0){i=b;return 5704}if((Fa(5720)|0)==0){i=b;return 5704}Le(5704,5728,pm(5728)|0);uc(123,5704,p|0)|0;eb(5720);i=b;return 5704}function Ol(b){b=b|0;b=i;do{if((a[5784]|0)==0){if((Fa(5784)|0)==0){break}ze(5768,5792,20);uc(122,5768,p|0)|0;eb(5784)}}while(0);i=b;return 5768}function Pl(b){b=b|0;b=i;if((a[5832]|0)!=0){i=b;return 5816}if((Fa(5832)|0)==0){i=b;return 5816}Le(5816,5840,pm(5840)|0);uc(123,5816,p|0)|0;eb(5832);i=b;return 5816}function Ql(b){b=b|0;b=i;do{if((a[5944]|0)==0){if((Fa(5944)|0)==0){break}ze(5928,5952,11);uc(122,5928,p|0)|0;eb(5944)}}while(0);i=b;return 5928}function Rl(b){b=b|0;b=i;if((a[5984]|0)!=0){i=b;return 5968}if((Fa(5984)|0)==0){i=b;return 5968}Le(5968,5992,pm(5992)|0);uc(123,5968,p|0)|0;eb(5984);i=b;return 5968}function Sl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0,m=0.0;f=i;i=i+8|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=mc()|0;k=c[j>>2]|0;c[j>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}l=ib(2147483647,5064,0)|0;c[1262]=l;eb(5056)}}while(0);m=+jn(b,g,c[1262]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=m;i=f;return+h}c[e>>2]=4;h=m;i=f;return+h}function Tl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0,m=0.0;f=i;i=i+8|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=mc()|0;k=c[j>>2]|0;c[j>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}l=ib(2147483647,5064,0)|0;c[1262]=l;eb(5056)}}while(0);m=+jn(b,g,c[1262]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=m;i=f;return+h}c[e>>2]=4;h=m;i=f;return+h}function Ul(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0,m=0.0;f=i;i=i+8|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=mc()|0;k=c[j>>2]|0;c[j>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}l=ib(2147483647,5064,0)|0;c[1262]=l;eb(5056)}}while(0);m=+jn(b,g,c[1262]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)==34){c[e>>2]=4}h=m;i=f;return+h}function Vl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=mc()|0;m=c[l>>2]|0;c[l>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}n=ib(2147483647,5064,0)|0;c[1262]=n;eb(5056)}}while(0);n=qb(b|0,h|0,f|0,c[1262]|0)|0;o=c[l>>2]|0;if((o|0)==0){c[l>>2]=m}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)!=34){j=n;k=I;break}c[e>>2]=4;j=-1;k=-1}}while(0);I=k;i=g;return j|0}function Wl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=mc()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}m=ib(2147483647,5064,0)|0;c[1262]=m;eb(5056)}}while(0);m=qb(b|0,h|0,f|0,c[1262]|0)|0;f=I;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>4294967295)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function Xl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=mc()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}m=ib(2147483647,5064,0)|0;c[1262]=m;eb(5056)}}while(0);m=qb(b|0,h|0,f|0,c[1262]|0)|0;f=I;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>4294967295)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function Yl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=mc()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}m=ib(2147483647,5064,0)|0;c[1262]=m;eb(5056)}}while(0);m=qb(b|0,h|0,f|0,c[1262]|0)|0;f=I;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>65535)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m&65535;i=g;return j|0}return 0}function Zl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;I=k;i=g;return j|0}l=mc()|0;m=c[l>>2]|0;c[l>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}n=ib(2147483647,5064,0)|0;c[1262]=n;eb(5056)}}while(0);n=fc(b|0,h|0,f|0,c[1262]|0)|0;f=I;b=c[l>>2]|0;if((b|0)==0){c[l>>2]=m}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;I=k;i=g;return j|0}if((b|0)==34){c[e>>2]=4;e=(f|0)>0|(f|0)==0&n>>>0>0;I=e?2147483647:-2147483648;i=g;return(e?-1:0)|0}else{j=n;k=f;I=k;i=g;return j|0}return 0}function _l(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=mc()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5056]|0)==0){if((Fa(5056)|0)==0){break}m=ib(2147483647,5064,0)|0;c[1262]=m;eb(5056)}}while(0);m=fc(b|0,h|0,f|0,c[1262]|0)|0;f=I;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}do{if((b|0)==34){c[e>>2]=4;if((f|0)>0|(f|0)==0&m>>>0>0){j=2147483647}else{break}i=g;return j|0}else{if((f|0)<-1|(f|0)==-1&m>>>0<2147483648){c[e>>2]=4;break}if((f|0)>0|(f|0)==0&m>>>0>2147483647){c[e>>2]=4;j=2147483647;i=g;return j|0}else{j=m;i=g;return j|0}}}while(0);j=-2147483648;i=g;return j|0}function $l(a){a=a|0;var b=0,e=0,f=0,g=0,h=0;b=i;e=a+4|0;f=e;g=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24;f=e+4|0;e=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24;f=(c[a>>2]|0)+(e>>1)|0;a=f;if((e&1|0)==0){h=g;zc[h&127](a);i=b;return}else{h=c[(c[f>>2]|0)+g>>2]|0;zc[h&127](a);i=b;return}}function am(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;f=b+8|0;g=b+4|0;h=c[g>>2]|0;j=c[f>>2]|0;k=h;if(!(j-k>>2>>>0<d>>>0)){l=d;m=h;do{if((m|0)==0){n=0}else{c[m>>2]=0;n=c[g>>2]|0}m=n+4|0;c[g>>2]=m;l=l+ -1|0;}while((l|0)!=0);i=e;return}l=b+16|0;m=b;n=c[m>>2]|0;h=k-n>>2;k=h+d|0;if(k>>>0>1073741823){Wj(0)}o=j-n|0;do{if(o>>2>>>0<536870911){n=o>>1;j=n>>>0<k>>>0?k:n;if((j|0)==0){p=0;q=0;break}n=b+128|0;if(!((a[n]|0)==0&j>>>0<29)){r=j;s=11;break}a[n]=1;p=j;q=l}else{r=1073741823;s=11}}while(0);if((s|0)==11){p=r;q=Um(r<<2)|0}r=d;d=q+(h<<2)|0;do{if((d|0)==0){t=0}else{c[d>>2]=0;t=d}d=t+4|0;r=r+ -1|0;}while((r|0)!=0);r=c[m>>2]|0;t=(c[g>>2]|0)-r|0;s=q+(h-(t>>2)<<2)|0;h=r;on(s|0,h|0,t|0)|0;c[m>>2]=s;c[g>>2]=d;c[f>>2]=q+(p<<2);if((r|0)==0){i=e;return}if((l|0)==(r|0)){a[b+128|0]=0;i=e;return}else{Wm(h);i=e;return}}function bm(a){a=a|0;a=i;Ne(10252|0);Ne(10240|0);Ne(10228|0);Ne(10216|0);Ne(10204|0);Ne(10192|0);Ne(10180|0);Ne(10168|0);Ne(10156|0);Ne(10144|0);Ne(10132|0);Ne(10120|0);Ne(10108|0);Ne(10096|0);Ne(10084|0);Ne(10072|0);Ne(10060|0);Ne(10048|0);Ne(10036|0);Ne(10024|0);Ne(10012|0);Ne(1e4|0);Ne(9988|0);Ne(9976);i=a;return}function cm(a){a=a|0;a=i;Be(10580|0);Be(10568|0);Be(10556|0);Be(10544|0);Be(10532|0);Be(10520|0);Be(10508|0);Be(10496|0);Be(10484|0);Be(10472|0);Be(10460|0);Be(10448|0);Be(10436|0);Be(10424|0);Be(10412|0);Be(10400|0);Be(10388|0);Be(10376|0);Be(10364|0);Be(10352|0);Be(10340|0);Be(10328|0);Be(10316|0);Be(10304);i=a;return}function dm(a){a=a|0;a=i;Ne(10892|0);Ne(10880|0);Ne(10868|0);Ne(10856|0);Ne(10844|0);Ne(10832|0);Ne(10820|0);Ne(10808|0);Ne(10796|0);Ne(10784|0);Ne(10772|0);Ne(10760|0);Ne(10748|0);Ne(10736|0);Ne(10724|0);Ne(10712|0);Ne(10700|0);Ne(10688|0);Ne(10676|0);Ne(10664|0);Ne(10652|0);Ne(10640|0);Ne(10628|0);Ne(10616);i=a;return}function em(a){a=a|0;a=i;Be(11732|0);Be(11720|0);Be(11708|0);Be(11696|0);Be(11684|0);Be(11672|0);Be(11660|0);Be(11648|0);Be(11636|0);Be(11624|0);Be(11612|0);Be(11600|0);Be(11588|0);Be(11576|0);Be(11564|0);Be(11552|0);Be(11540|0);Be(11528|0);Be(11516|0);Be(11504|0);Be(11492|0);Be(11480|0);Be(11468|0);Be(11456);i=a;return}function fm(a){a=a|0;a=i;Ne(12124|0);Ne(12112|0);Ne(12100|0);Ne(12088|0);Ne(12076|0);Ne(12064|0);Ne(12052|0);Ne(12040|0);Ne(12028|0);Ne(12016|0);Ne(12004|0);Ne(11992|0);Ne(11980|0);Ne(11968);i=a;return}function gm(a){a=a|0;a=i;Be(12660|0);Be(12648|0);Be(12636|0);Be(12624|0);Be(12612|0);Be(12600|0);Be(12588|0);Be(12576|0);Be(12564|0);Be(12552|0);Be(12540|0);Be(12528|0);Be(12516|0);Be(12504);i=a;return}function hm(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;e=im(0,a,b,(c|0)!=0?c:13024)|0;i=d;return e|0}function im(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+8|0;h=g;c[h>>2]=b;j=(f|0)==0?13032:f;f=c[j>>2]|0;a:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0|0;i=g;return k|0}else{l=n+ -194|0;if(l>>>0>50){break a}o=e+ -1|0;p=c[12816+(l<<2)>>2]|0;q=d+1|0;break}}else{o=e;p=f;q=d}}while(0);b:do{if((o|0)==0){r=p}else{l=a[q]|0;n=(l&255)>>>3;if((n+ -16|n+(p>>26))>>>0>7){break a}else{s=o;t=l;u=p;v=q}while(1){v=v+1|0;u=(t&255)+ -128|u<<6;s=s+ -1|0;if((u|0)>=0){break}if((s|0)==0){r=u;break b}t=a[v]|0;if(((t&255)+ -128|0)>>>0>63){break a}}c[j>>2]=0;c[m>>2]=u;k=e-s|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;j=mc()|0;c[j>>2]=84;k=-1;i=g;return k|0}function jm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;g=i;i=i+1032|0;h=g+1024|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=g;m=k?e:256;e=k?a:l;a:do{if((j|0)==0|(m|0)==0){n=d;o=m;p=j;q=0;r=e}else{a=d;s=m;t=j;u=0;v=e;while(1){w=a>>>2;x=w>>>0>=s>>>0;if(!(x|a>>>0>131)){n=a;o=s;p=t;q=u;r=v;break a}y=x?s:w;z=a-y|0;w=km(v,h,y,f)|0;if((w|0)==-1){break}if((v|0)==(l|0)){A=s;B=l}else{A=s-w|0;B=v+(w<<2)|0}y=w+u|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){n=z;o=A;p=w;q=y;r=B;break a}else{a=z;s=A;t=w;u=y;v=B}}n=z;o=0;p=c[h>>2]|0;q=-1;r=v}}while(0);b:do{if((p|0)==0){C=q}else{if((o|0)==0|(n|0)==0){C=q;break}else{D=n;E=o;F=p;G=q;H=r}while(1){I=im(H,F,D,f)|0;if((I+2|0)>>>0<3){break}z=(c[h>>2]|0)+I|0;c[h>>2]=z;B=E+ -1|0;A=G+1|0;if((B|0)==0|(D|0)==(I|0)){C=A;break b}else{D=D-I|0;E=B;F=z;G=A;H=H+4|0}}if((I|0)==-1){C=-1;break}else if((I|0)==0){c[h>>2]=0;C=G;break}else{c[f>>2]=0;C=G;break}}}while(0);if(!k){i=g;return C|0}c[b>>2]=c[h>>2];i=g;return C|0}function km(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0;h=i;j=c[e>>2]|0;do{if((g|0)==0){k=5}else{l=g;m=c[l>>2]|0;if((m|0)==0){k=5;break}if((b|0)==0){n=f;o=m;p=j;k=16;break}c[l>>2]=0;q=b;r=f;s=m;t=j;k=36}}while(0);if((k|0)==5){if((b|0)==0){u=f;v=j;k=7}else{w=b;x=f;y=j;k=6}}a:while(1){if((k|0)==6){k=0;if((x|0)==0){z=f;k=53;break}else{A=w;B=x;C=y}while(1){j=a[C]|0;do{if(((j&255)+ -1|0)>>>0<127){if((C&3|0)==0&B>>>0>3){D=A;E=B;F=C}else{G=A;H=B;I=j;J=C;break}while(1){K=c[F>>2]|0;if(((K+ -16843009|K)&-2139062144|0)!=0){k=30;break}c[D>>2]=K&255;c[D+4>>2]=d[F+1|0]|0;c[D+8>>2]=d[F+2|0]|0;L=F+4|0;M=D+16|0;c[D+12>>2]=d[F+3|0]|0;N=E+ -4|0;if(N>>>0>3){D=M;E=N;F=L}else{k=31;break}}if((k|0)==30){k=0;G=D;H=E;I=K&255;J=F;break}else if((k|0)==31){k=0;G=M;H=N;I=a[L]|0;J=L;break}}else{G=A;H=B;I=j;J=C}}while(0);O=I&255;if(!((O+ -1|0)>>>0<127)){break}c[G>>2]=O;j=H+ -1|0;if((j|0)==0){z=f;k=53;break a}else{A=G+4|0;B=j;C=J+1|0}}j=O+ -194|0;if(j>>>0>50){P=G;Q=H;R=J;k=47;break}q=G;r=H;s=c[12816+(j<<2)>>2]|0;t=J+1|0;k=36;continue}else if((k|0)==7){k=0;j=a[v]|0;do{if(((j&255)+ -1|0)>>>0<127){if((v&3|0)!=0){S=u;T=j;U=v;break}g=c[v>>2]|0;if(((g+ -16843009|g)&-2139062144|0)==0){m=u;l=v;while(1){V=l+4|0;W=m+ -4|0;X=c[V>>2]|0;if(((X+ -16843009|X)&-2139062144|0)==0){l=V;m=W}else{Y=W;Z=X;_=V;break}}}else{Y=u;Z=g;_=v}S=Y;T=Z&255;U=_}else{S=u;T=j;U=v}}while(0);j=T&255;if((j+ -1|0)>>>0<127){u=S+ -1|0;v=U+1|0;k=7;continue}m=j+ -194|0;if(m>>>0>50){P=b;Q=S;R=U;k=47;break}n=S;o=c[12816+(m<<2)>>2]|0;p=U+1|0;k=16;continue}else if((k|0)==16){k=0;m=(d[p]|0)>>>3;if((m+ -16|m+(o>>26))>>>0>7){k=17;break}m=p+1|0;do{if((o&33554432|0)==0){$=m}else{if(((d[m]|0)+ -128|0)>>>0>63){k=20;break a}j=p+2|0;if((o&524288|0)==0){$=j;break}if(((d[j]|0)+ -128|0)>>>0>63){k=23;break a}$=p+3|0}}while(0);u=n+ -1|0;v=$;k=7;continue}else if((k|0)==36){k=0;m=d[t]|0;j=m>>>3;if((j+ -16|j+(s>>26))>>>0>7){k=37;break}j=t+1|0;aa=m+ -128|s<<6;do{if((aa|0)<0){m=(d[j]|0)+ -128|0;if(m>>>0>63){k=40;break a}l=t+2|0;ba=m|aa<<6;if((ba|0)>=0){ca=ba;da=l;break}m=(d[l]|0)+ -128|0;if(m>>>0>63){k=43;break a}ca=m|ba<<6;da=t+3|0}else{ca=aa;da=j}}while(0);c[q>>2]=ca;w=q+4|0;x=r+ -1|0;y=da;k=6;continue}}if((k|0)==17){ea=b;fa=n;ga=o;ha=p+ -1|0;k=46}else if((k|0)==20){ea=b;fa=n;ga=o;ha=p+ -1|0;k=46}else if((k|0)==23){ea=b;fa=n;ga=o;ha=p+ -1|0;k=46}else if((k|0)==37){ea=q;fa=r;ga=s;ha=t+ -1|0;k=46}else if((k|0)==40){ea=q;fa=r;ga=aa;ha=t+ -1|0;k=46}else if((k|0)==43){ea=q;fa=r;ga=ba;ha=t+ -1|0;k=46}else if((k|0)==53){i=h;return z|0}if((k|0)==46){if((ga|0)==0){P=ea;Q=fa;R=ha;k=47}else{ia=ea;ja=ha}}do{if((k|0)==47){if((a[R]|0)!=0){ia=P;ja=R;break}if((P|0)!=0){c[P>>2]=0;c[e>>2]=0}z=f-Q|0;i=h;return z|0}}while(0);Q=mc()|0;c[Q>>2]=84;if((ia|0)==0){z=-1;i=h;return z|0}c[e>>2]=ja;z=-1;i=h;return z|0}function lm(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m+ -194|0;if(k>>>0>50){break}m=e+1|0;n=c[12816+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>((f*6|0)+ -6|0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m+ -16|m+(n>>26))>>>0>7){break}m=k+ -128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)+ -128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)+ -128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);l=mc()|0;c[l>>2]=84;j=-1;i=g;return j|0}function mm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((b|0)==0){f=1;i=e;return f|0}if(d>>>0<128){a[b]=d;f=1;i=e;return f|0}if(d>>>0<2048){a[b]=d>>>6|192;a[b+1|0]=d&63|128;f=2;i=e;return f|0}if(d>>>0<55296|(d+ -57344|0)>>>0<8192){a[b]=d>>>12|224;a[b+1|0]=d>>>6&63|128;a[b+2|0]=d&63|128;f=3;i=e;return f|0}if((d+ -65536|0)>>>0<1048576){a[b]=d>>>18|240;a[b+1|0]=d>>>12&63|128;a[b+2|0]=d>>>6&63|128;a[b+3|0]=d&63|128;f=4;i=e;return f|0}else{d=mc()|0;c[d>>2]=84;f=-1;i=e;return f|0}return 0}function nm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+264|0;g=f+256|0;h=f;j=c[b>>2]|0;c[g>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:h;a:do{if((j|0)==0|(l|0)==0){m=d;n=l;o=j;p=0;q=e}else{a=d;r=l;s=j;t=0;u=e;while(1){v=a>>>0>=r>>>0;if(!(v|a>>>0>32)){m=a;n=r;o=s;p=t;q=u;break a}w=v?r:a;x=a-w|0;v=om(u,g,w,0)|0;if((v|0)==-1){break}if((u|0)==(h|0)){y=r;z=h}else{y=r-v|0;z=u+v|0}w=v+t|0;v=c[g>>2]|0;if((v|0)==0|(y|0)==0){m=x;n=y;o=v;p=w;q=z;break a}else{a=x;r=y;s=v;t=w;u=z}}m=x;n=0;o=c[g>>2]|0;p=-1;q=u}}while(0);b:do{if((o|0)==0){A=p}else{if((n|0)==0|(m|0)==0){A=p;break}else{B=m;C=n;D=o;E=p;F=q}while(1){G=mm(F,c[D>>2]|0,0)|0;if((G+1|0)>>>0<2){break}x=(c[g>>2]|0)+4|0;c[g>>2]=x;z=B+ -1|0;y=E+1|0;if((C|0)==(G|0)|(z|0)==0){A=y;break b}else{B=z;C=C-G|0;D=x;E=y;F=F+G|0}}if((G|0)!=0){A=-1;break}c[g>>2]=0;A=E}}while(0);if(!k){i=f;return A|0}c[b>>2]=c[g>>2];i=f;return A|0}function om(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f;if((b|0)==0){h=c[d>>2]|0;j=g;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=k;o=h}while(1){if(n>>>0>127){h=mm(j,n,0)|0;if((h|0)==-1){l=-1;p=26;break}else{q=h}}else{q=1}h=q+m|0;k=o+4|0;r=c[k>>2]|0;if((r|0)==0){l=h;p=26;break}else{m=h;n=r;o=k}}if((p|0)==26){i=f;return l|0}}a:do{if(e>>>0>3){o=b;n=e;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break a}if(q>>>0>127){j=mm(o,q,0)|0;if((j|0)==-1){l=-1;break}u=o+j|0;v=n-j|0;w=m}else{a[o]=q;u=o+1|0;v=n+ -1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=u;n=v;m=q}else{s=u;t=v;break a}}i=f;return l|0}else{s=b;t=e}}while(0);b:do{if((t|0)==0){x=0}else{b=g;v=s;u=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=24;break}if(m>>>0>127){n=mm(b,m,0)|0;if((n|0)==-1){l=-1;p=26;break}if(n>>>0>u>>>0){p=20;break}mm(v,c[w>>2]|0,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m;y=v+1|0;z=u+ -1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break b}else{v=y;u=z;w=m}}if((p|0)==20){l=e-u|0;i=f;return l|0}else if((p|0)==24){a[v]=0;x=u;break}else if((p|0)==26){i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function pm(a){a=a|0;var b=0,d=0;b=i;d=a;while(1){if((c[d>>2]|0)==0){break}else{d=d+4|0}}i=b;return d-a>>2|0}function qm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;if((d|0)==0){i=e;return a|0}else{f=d;g=b;h=a}while(1){b=f+ -1|0;c[h>>2]=c[g>>2];if((b|0)==0){break}else{h=h+4|0;g=g+4|0;f=b}}i=e;return a|0}function rm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;f=(d|0)==0;do{if(a-b>>2>>>0<d>>>0){if(f){break}else{g=d}do{g=g+ -1|0;c[a+(g<<2)>>2]=c[b+(g<<2)>>2];}while((g|0)!=0)}else{if(f){break}else{h=b;j=a;k=d}while(1){l=k+ -1|0;c[j>>2]=c[h>>2];if((l|0)==0){break}else{k=l;j=j+4|0;h=h+4|0}}}}while(0);i=e;return a|0}function sm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;if((d|0)!=0){f=d;d=a;while(1){g=f+ -1|0;c[d>>2]=b;if((g|0)==0){break}else{d=d+4|0;f=g}}}i=e;return a|0}function tm(a){a=a|0;i=i;return}function um(a){a=a|0;c[a>>2]=13048;i=i;return}function vm(a){a=a|0;var b=0;b=i;Ta(a|0);Wm(a);i=b;return}function wm(a){a=a|0;var b=0;b=i;Ta(a|0);i=b;return}function xm(a){a=a|0;i=i;return 13064}function ym(a){a=a|0;i=i;return}function zm(a){a=a|0;i=i;return}function Am(a){a=a|0;i=i;return}function Bm(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Cm(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Dm(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Em(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+56|0;f=e;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=Im(b,13176,13232,0)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}j=f+0|0;k=j+56|0;do{c[j>>2]=0;j=j+4|0}while((j|0)<(k|0));c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;Nc[c[(c[h>>2]|0)+28>>2]&7](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function Fm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((c[d+8>>2]|0)!=(b|0)){i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function Gm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((b|0)!=(c[d+8>>2]|0)){h=c[b+8>>2]|0;Nc[c[(c[h>>2]|0)+28>>2]&7](h,d,e,f);i=g;return}h=d+16|0;b=c[h>>2]|0;if((b|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function Hm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;if((b|0)==(c[d+8>>2]|0)){h=d+16|0;j=c[h>>2]|0;if((j|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((j|0)!=(e|0)){j=d+36|0;c[j>>2]=(c[j>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}j=d+24|0;if((c[j>>2]|0)!=2){i=g;return}c[j>>2]=f;i=g;return}j=c[b+12>>2]|0;h=b+(j<<3)+16|0;k=c[b+20>>2]|0;l=k>>8;if((k&1|0)==0){m=l}else{m=c[(c[e>>2]|0)+l>>2]|0}l=c[b+16>>2]|0;Nc[c[(c[l>>2]|0)+28>>2]&7](l,d,e+m|0,(k&2|0)!=0?f:2);if((j|0)<=1){i=g;return}j=d+54|0;k=e;m=b+24|0;while(1){b=c[m+4>>2]|0;l=b>>8;if((b&1|0)==0){n=l}else{n=c[(c[k>>2]|0)+l>>2]|0}l=c[m>>2]|0;Nc[c[(c[l>>2]|0)+28>>2]&7](l,d,e+n|0,(b&2|0)!=0?f:2);if((a[j]|0)!=0){o=16;break}b=m+8|0;if(b>>>0<h>>>0){m=b}else{o=16;break}}if((o|0)==16){i=g;return}}function Im(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;i=i+56|0;j=h;k=c[d>>2]|0;l=d+(c[k+ -8>>2]|0)|0;m=c[k+ -4>>2]|0;k=m;c[j>>2]=f;c[j+4>>2]=d;c[j+8>>2]=e;c[j+12>>2]=g;g=j+16|0;e=j+20|0;d=j+24|0;n=j+28|0;o=j+32|0;p=j+40|0;q=(m|0)==(f|0);f=g;r=f+0|0;s=r+36|0;do{c[r>>2]=0;r=r+4|0}while((r|0)<(s|0));b[f+36>>1]=0;a[f+38|0]=0;if(q){c[j+48>>2]=1;Kc[c[(c[m>>2]|0)+20>>2]&15](k,j,l,l,1,0);t=(c[d>>2]|0)==1?l:0;i=h;return t|0}yc[c[(c[m>>2]|0)+24>>2]&3](k,j,l,1,0);l=c[j+36>>2]|0;if((l|0)==0){if((c[p>>2]|0)!=1){t=0;i=h;return t|0}if((c[n>>2]|0)!=1){t=0;i=h;return t|0}t=(c[o>>2]|0)==1?c[e>>2]|0:0;i=h;return t|0}else if((l|0)==1){do{if((c[d>>2]|0)!=1){if((c[p>>2]|0)!=0){t=0;i=h;return t|0}if((c[n>>2]|0)!=1){t=0;i=h;return t|0}if((c[o>>2]|0)==1){break}else{t=0}i=h;return t|0}}while(0);t=c[g>>2]|0;i=h;return t|0}else{t=0;i=h;return t|0}return 0}function Jm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;h=i;j=b;if((j|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}k=d+28|0;if((c[k>>2]|0)==1){i=h;return}c[k>>2]=f;i=h;return}if((j|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){j=d+20|0;if((c[j>>2]|0)==(e|0)){break}c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}l=c[b+12>>2]|0;m=b+(l<<3)+16|0;a:do{if((l|0)>0){n=d+52|0;o=d+53|0;p=d+54|0;q=b+8|0;r=d+24|0;s=e;t=0;u=0;v=b+16|0;b:while(1){a[n]=0;a[o]=0;w=c[v+4>>2]|0;x=w>>8;if((w&1|0)==0){y=x}else{y=c[(c[s>>2]|0)+x>>2]|0}x=c[v>>2]|0;Kc[c[(c[x>>2]|0)+20>>2]&15](x,d,e,e+y|0,2-(w>>>1&1)|0,g);if((a[p]|0)!=0){z=t;A=u;break}do{if((a[o]|0)==0){B=t;C=u}else{if((a[n]|0)==0){if((c[q>>2]&1|0)==0){z=t;A=1;break b}else{B=t;C=1;break}}if((c[r>>2]|0)==1){D=27;break a}if((c[q>>2]&2|0)==0){D=27;break a}else{B=1;C=1}}}while(0);w=v+8|0;if(w>>>0<m>>>0){t=B;u=C;v=w}else{z=B;A=C;break}}if(z){E=A;D=26}else{F=A;D=23}}else{F=0;D=23}}while(0);do{if((D|0)==23){c[j>>2]=e;m=d+40|0;c[m>>2]=(c[m>>2]|0)+1;if((c[d+36>>2]|0)!=1){E=F;D=26;break}if((c[d+24>>2]|0)!=2){E=F;D=26;break}a[d+54|0]=1;if(F){D=27}else{D=28}}}while(0);if((D|0)==26){if(E){D=27}else{D=28}}if((D|0)==27){c[k>>2]=3;i=h;return}else if((D|0)==28){c[k>>2]=4;i=h;return}}}while(0);if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}E=c[b+12>>2]|0;F=b+(E<<3)+16|0;A=c[b+20>>2]|0;z=A>>8;if((A&1|0)==0){G=z}else{G=c[(c[e>>2]|0)+z>>2]|0}z=c[b+16>>2]|0;yc[c[(c[z>>2]|0)+24>>2]&3](z,d,e+G|0,(A&2|0)!=0?f:2,g);A=b+24|0;if((E|0)<=1){i=h;return}E=c[b+8>>2]|0;do{if((E&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((E&1|0)==0){G=d+54|0;z=e;C=A;while(1){if((a[G]|0)!=0){D=53;break}if((c[b>>2]|0)==1){D=53;break}B=c[C+4>>2]|0;y=B>>8;if((B&1|0)==0){H=y}else{H=c[(c[z>>2]|0)+y>>2]|0}y=c[C>>2]|0;yc[c[(c[y>>2]|0)+24>>2]&3](y,d,e+H|0,(B&2|0)!=0?f:2,g);B=C+8|0;if(B>>>0<F>>>0){C=B}else{D=53;break}}if((D|0)==53){i=h;return}}C=d+24|0;z=d+54|0;G=e;k=A;while(1){if((a[z]|0)!=0){D=53;break}if((c[b>>2]|0)==1){if((c[C>>2]|0)==1){D=53;break}}B=c[k+4>>2]|0;y=B>>8;if((B&1|0)==0){I=y}else{I=c[(c[G>>2]|0)+y>>2]|0}y=c[k>>2]|0;yc[c[(c[y>>2]|0)+24>>2]&3](y,d,e+I|0,(B&2|0)!=0?f:2,g);B=k+8|0;if(B>>>0<F>>>0){k=B}else{D=53;break}}if((D|0)==53){i=h;return}}}while(0);I=d+54|0;H=e;E=A;while(1){if((a[I]|0)!=0){D=53;break}A=c[E+4>>2]|0;k=A>>8;if((A&1|0)==0){J=k}else{J=c[(c[H>>2]|0)+k>>2]|0}k=c[E>>2]|0;yc[c[(c[k>>2]|0)+24>>2]&3](k,d,e+J|0,(A&2|0)!=0?f:2,g);A=E+8|0;if(A>>>0<F>>>0){E=A}else{D=53;break}}if((D|0)==53){i=h;return}}function Km(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;j=b;if((j|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}k=d+28|0;if((c[k>>2]|0)==1){i=h;return}c[k>>2]=f;i=h;return}if((j|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;yc[c[(c[j>>2]|0)+24>>2]&3](j,d,e,f,g);i=h;return}do{if((c[d+16>>2]|0)!=(e|0)){j=d+20|0;if((c[j>>2]|0)==(e|0)){break}c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}l=d+52|0;a[l]=0;m=d+53|0;a[m]=0;n=c[b+8>>2]|0;Kc[c[(c[n>>2]|0)+20>>2]&15](n,d,e,e,1,g);if((a[m]|0)==0){o=0;p=13}else{if((a[l]|0)==0){o=1;p=13}}a:do{if((p|0)==13){c[j>>2]=e;l=d+40|0;c[l>>2]=(c[l>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){p=16;break}a[d+54|0]=1;if(o){break a}}else{p=16}}while(0);if((p|0)==16){if(o){break}}c[k>>2]=4;i=h;return}}while(0);c[k>>2]=3;i=h;return}}while(0);if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}function Lm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;g=i;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){i=g;return}h=d+28|0;if((c[h>>2]|0)==1){i=g;return}c[h>>2]=f;i=g;return}if((c[d>>2]|0)!=(b|0)){i=g;return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;i=g;return}}while(0);if((f|0)!=1){i=g;return}c[d+32>>2]=1;i=g;return}function Mm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;if((b|0)!=(c[d+8>>2]|0)){k=d+52|0;l=a[k]|0;m=d+53|0;n=a[m]|0;o=c[b+12>>2]|0;p=b+(o<<3)+16|0;a[k]=0;a[m]=0;q=c[b+20>>2]|0;r=q>>8;if((q&1|0)==0){s=r}else{s=c[(c[f>>2]|0)+r>>2]|0}r=c[b+16>>2]|0;Kc[c[(c[r>>2]|0)+20>>2]&15](r,d,e,f+s|0,(q&2|0)!=0?g:2,h);a:do{if((o|0)>1){q=d+24|0;s=b+8|0;r=d+54|0;t=f;u=b+24|0;do{if((a[r]|0)!=0){break a}do{if((a[k]|0)==0){if((a[m]|0)==0){break}if((c[s>>2]&1|0)==0){break a}}else{if((c[q>>2]|0)==1){break a}if((c[s>>2]&2|0)==0){break a}}}while(0);a[k]=0;a[m]=0;v=c[u+4>>2]|0;w=v>>8;if((v&1|0)==0){x=w}else{x=c[(c[t>>2]|0)+w>>2]|0}w=c[u>>2]|0;Kc[c[(c[w>>2]|0)+20>>2]&15](w,d,e,f+x|0,(v&2|0)!=0?g:2,h);u=u+8|0;}while(u>>>0<p>>>0)}}while(0);a[k]=l;a[m]=n;i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;f=d+16|0;n=c[f>>2]|0;if((n|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((n|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;n=c[e>>2]|0;if((n|0)==2){c[e>>2]=g;y=g}else{y=n}if(!((c[d+48>>2]|0)==1&(y|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function Nm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;if((b|0)!=(c[d+8>>2]|0)){k=c[b+8>>2]|0;Kc[c[(c[k>>2]|0)+20>>2]&15](k,d,e,f,g,h);i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;l=g}else{l=h}if(!((c[d+48>>2]|0)==1&(l|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function Om(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;h=i;if((c[d+8>>2]|0)!=(b|0)){i=h;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=h;return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=h;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;j=g}else{j=b}if(!((c[d+48>>2]|0)==1&(j|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}function Pm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,Ma=0,Na=0,Pa=0;b=i;do{if(a>>>0<245){if(a>>>0<11){d=16}else{d=a+11&-8}e=d>>>3;f=c[3370]|0;g=f>>>e;if((g&3|0)!=0){h=(g&1^1)+e|0;j=h<<1;k=13520+(j<<2)|0;l=13520+(j+2<<2)|0;j=c[l>>2]|0;m=j+8|0;n=c[m>>2]|0;do{if((k|0)==(n|0)){c[3370]=f&~(1<<h)}else{if(n>>>0<(c[13496>>2]|0)>>>0){Ub()}o=n+12|0;if((c[o>>2]|0)==(j|0)){c[o>>2]=k;c[l>>2]=n;break}else{Ub()}}}while(0);n=h<<3;c[j+4>>2]=n|3;l=j+(n|4)|0;c[l>>2]=c[l>>2]|1;p=m;i=b;return p|0}if(!(d>>>0>(c[13488>>2]|0)>>>0)){q=d;break}if((g|0)!=0){l=2<<e;n=g<<e&(l|0-l);l=(n&0-n)+ -1|0;n=l>>>12&16;k=l>>>n;l=k>>>5&8;o=k>>>l;k=o>>>2&4;r=o>>>k;o=r>>>1&2;s=r>>>o;r=s>>>1&1;t=(l|n|k|o|r)+(s>>>r)|0;r=t<<1;s=13520+(r<<2)|0;o=13520+(r+2<<2)|0;r=c[o>>2]|0;k=r+8|0;n=c[k>>2]|0;do{if((s|0)==(n|0)){c[3370]=f&~(1<<t)}else{if(n>>>0<(c[13496>>2]|0)>>>0){Ub()}l=n+12|0;if((c[l>>2]|0)==(r|0)){c[l>>2]=s;c[o>>2]=n;break}else{Ub()}}}while(0);n=t<<3;o=n-d|0;c[r+4>>2]=d|3;s=r;f=s+d|0;c[s+(d|4)>>2]=o|1;c[s+n>>2]=o;n=c[13488>>2]|0;if((n|0)!=0){s=c[13500>>2]|0;e=n>>>3;n=e<<1;g=13520+(n<<2)|0;m=c[3370]|0;j=1<<e;do{if((m&j|0)==0){c[3370]=m|j;u=13520+(n+2<<2)|0;v=g}else{e=13520+(n+2<<2)|0;h=c[e>>2]|0;if(!(h>>>0<(c[13496>>2]|0)>>>0)){u=e;v=h;break}Ub()}}while(0);c[u>>2]=s;c[v+12>>2]=s;c[s+8>>2]=v;c[s+12>>2]=g}c[13488>>2]=o;c[13500>>2]=f;p=k;i=b;return p|0}n=c[13484>>2]|0;if((n|0)==0){q=d;break}j=(n&0-n)+ -1|0;n=j>>>12&16;m=j>>>n;j=m>>>5&8;r=m>>>j;m=r>>>2&4;t=r>>>m;r=t>>>1&2;h=t>>>r;t=h>>>1&1;e=c[13784+((j|n|m|r|t)+(h>>>t)<<2)>>2]|0;t=(c[e+4>>2]&-8)-d|0;h=e;r=e;while(1){e=c[h+16>>2]|0;if((e|0)==0){m=c[h+20>>2]|0;if((m|0)==0){break}else{w=m}}else{w=e}e=(c[w+4>>2]&-8)-d|0;m=e>>>0<t>>>0;t=m?e:t;h=w;r=m?w:r}h=r;k=c[13496>>2]|0;if(h>>>0<k>>>0){Ub()}f=h+d|0;o=f;if(!(h>>>0<f>>>0)){Ub()}f=c[r+24>>2]|0;g=c[r+12>>2]|0;do{if((g|0)==(r|0)){s=r+20|0;m=c[s>>2]|0;if((m|0)==0){e=r+16|0;n=c[e>>2]|0;if((n|0)==0){x=0;break}else{y=n;z=e}}else{y=m;z=s}while(1){s=y+20|0;m=c[s>>2]|0;if((m|0)!=0){z=s;y=m;continue}m=y+16|0;s=c[m>>2]|0;if((s|0)==0){break}else{y=s;z=m}}if(z>>>0<k>>>0){Ub()}else{c[z>>2]=0;x=y;break}}else{m=c[r+8>>2]|0;if(m>>>0<k>>>0){Ub()}s=m+12|0;if((c[s>>2]|0)!=(r|0)){Ub()}e=g+8|0;if((c[e>>2]|0)==(r|0)){c[s>>2]=g;c[e>>2]=m;x=g;break}else{Ub()}}}while(0);a:do{if((f|0)!=0){g=c[r+28>>2]|0;k=13784+(g<<2)|0;do{if((r|0)==(c[k>>2]|0)){c[k>>2]=x;if((x|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<g);break a}else{if(f>>>0<(c[13496>>2]|0)>>>0){Ub()}m=f+16|0;if((c[m>>2]|0)==(r|0)){c[m>>2]=x}else{c[f+20>>2]=x}if((x|0)==0){break a}}}while(0);if(x>>>0<(c[13496>>2]|0)>>>0){Ub()}c[x+24>>2]=f;g=c[r+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[x+16>>2]=g;c[g+24>>2]=x;break}}}while(0);g=c[r+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[x+20>>2]=g;c[g+24>>2]=x;break}}}while(0);if(t>>>0<16){f=t+d|0;c[r+4>>2]=f|3;g=h+(f+4)|0;c[g>>2]=c[g>>2]|1}else{c[r+4>>2]=d|3;c[h+(d|4)>>2]=t|1;c[h+(t+d)>>2]=t;g=c[13488>>2]|0;if((g|0)!=0){f=c[13500>>2]|0;k=g>>>3;g=k<<1;m=13520+(g<<2)|0;e=c[3370]|0;s=1<<k;do{if((e&s|0)==0){c[3370]=e|s;A=13520+(g+2<<2)|0;B=m}else{k=13520+(g+2<<2)|0;n=c[k>>2]|0;if(!(n>>>0<(c[13496>>2]|0)>>>0)){A=k;B=n;break}Ub()}}while(0);c[A>>2]=f;c[B+12>>2]=f;c[f+8>>2]=B;c[f+12>>2]=m}c[13488>>2]=t;c[13500>>2]=o}p=r+8|0;i=b;return p|0}else{if(a>>>0>4294967231){q=-1;break}g=a+11|0;s=g&-8;e=c[13484>>2]|0;if((e|0)==0){q=s;break}h=0-s|0;n=g>>>8;do{if((n|0)==0){C=0}else{if(s>>>0>16777215){C=31;break}g=(n+1048320|0)>>>16&8;k=n<<g;j=(k+520192|0)>>>16&4;l=k<<j;k=(l+245760|0)>>>16&2;D=14-(j|g|k)+(l<<k>>>15)|0;C=s>>>(D+7|0)&1|D<<1}}while(0);n=c[13784+(C<<2)>>2]|0;b:do{if((n|0)==0){E=h;F=0;G=0}else{if((C|0)==31){H=0}else{H=25-(C>>>1)|0}r=h;o=0;t=s<<H;m=n;f=0;while(1){D=c[m+4>>2]&-8;k=D-s|0;if(k>>>0<r>>>0){if((D|0)==(s|0)){E=k;F=m;G=m;break b}else{I=k;J=m}}else{I=r;J=f}k=c[m+20>>2]|0;D=c[m+(t>>>31<<2)+16>>2]|0;l=(k|0)==0|(k|0)==(D|0)?o:k;if((D|0)==0){E=I;F=l;G=J;break}else{r=I;o=l;t=t<<1;m=D;f=J}}}}while(0);if((F|0)==0&(G|0)==0){n=2<<C;h=e&(n|0-n);if((h|0)==0){q=s;break}n=(h&0-h)+ -1|0;h=n>>>12&16;f=n>>>h;n=f>>>5&8;m=f>>>n;f=m>>>2&4;t=m>>>f;m=t>>>1&2;o=t>>>m;t=o>>>1&1;K=c[13784+((n|h|f|m|t)+(o>>>t)<<2)>>2]|0}else{K=F}if((K|0)==0){L=E;M=G}else{t=E;o=K;m=G;while(1){f=(c[o+4>>2]&-8)-s|0;h=f>>>0<t>>>0;n=h?f:t;f=h?o:m;h=c[o+16>>2]|0;if((h|0)!=0){N=f;O=n;m=N;o=h;t=O;continue}h=c[o+20>>2]|0;if((h|0)==0){L=n;M=f;break}else{N=f;O=n;o=h;m=N;t=O}}}if((M|0)==0){q=s;break}if(!(L>>>0<((c[13488>>2]|0)-s|0)>>>0)){q=s;break}t=M;m=c[13496>>2]|0;if(t>>>0<m>>>0){Ub()}o=t+s|0;e=o;if(!(t>>>0<o>>>0)){Ub()}h=c[M+24>>2]|0;n=c[M+12>>2]|0;do{if((n|0)==(M|0)){f=M+20|0;r=c[f>>2]|0;if((r|0)==0){D=M+16|0;l=c[D>>2]|0;if((l|0)==0){P=0;break}else{Q=l;R=D}}else{Q=r;R=f}while(1){f=Q+20|0;r=c[f>>2]|0;if((r|0)!=0){R=f;Q=r;continue}r=Q+16|0;f=c[r>>2]|0;if((f|0)==0){break}else{Q=f;R=r}}if(R>>>0<m>>>0){Ub()}else{c[R>>2]=0;P=Q;break}}else{r=c[M+8>>2]|0;if(r>>>0<m>>>0){Ub()}f=r+12|0;if((c[f>>2]|0)!=(M|0)){Ub()}D=n+8|0;if((c[D>>2]|0)==(M|0)){c[f>>2]=n;c[D>>2]=r;P=n;break}else{Ub()}}}while(0);c:do{if((h|0)!=0){n=c[M+28>>2]|0;m=13784+(n<<2)|0;do{if((M|0)==(c[m>>2]|0)){c[m>>2]=P;if((P|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<n);break c}else{if(h>>>0<(c[13496>>2]|0)>>>0){Ub()}r=h+16|0;if((c[r>>2]|0)==(M|0)){c[r>>2]=P}else{c[h+20>>2]=P}if((P|0)==0){break c}}}while(0);if(P>>>0<(c[13496>>2]|0)>>>0){Ub()}c[P+24>>2]=h;n=c[M+16>>2]|0;do{if((n|0)!=0){if(n>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[P+16>>2]=n;c[n+24>>2]=P;break}}}while(0);n=c[M+20>>2]|0;if((n|0)==0){break}if(n>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[P+20>>2]=n;c[n+24>>2]=P;break}}}while(0);d:do{if(L>>>0<16){h=L+s|0;c[M+4>>2]=h|3;n=t+(h+4)|0;c[n>>2]=c[n>>2]|1}else{c[M+4>>2]=s|3;c[t+(s|4)>>2]=L|1;c[t+(L+s)>>2]=L;n=L>>>3;if(L>>>0<256){h=n<<1;m=13520+(h<<2)|0;r=c[3370]|0;D=1<<n;do{if((r&D|0)==0){c[3370]=r|D;S=13520+(h+2<<2)|0;T=m}else{n=13520+(h+2<<2)|0;f=c[n>>2]|0;if(!(f>>>0<(c[13496>>2]|0)>>>0)){S=n;T=f;break}Ub()}}while(0);c[S>>2]=e;c[T+12>>2]=e;c[t+(s+8)>>2]=T;c[t+(s+12)>>2]=m;break}h=o;D=L>>>8;do{if((D|0)==0){U=0}else{if(L>>>0>16777215){U=31;break}r=(D+1048320|0)>>>16&8;f=D<<r;n=(f+520192|0)>>>16&4;l=f<<n;f=(l+245760|0)>>>16&2;k=14-(n|r|f)+(l<<f>>>15)|0;U=L>>>(k+7|0)&1|k<<1}}while(0);D=13784+(U<<2)|0;c[t+(s+28)>>2]=U;c[t+(s+20)>>2]=0;c[t+(s+16)>>2]=0;m=c[13484>>2]|0;k=1<<U;if((m&k|0)==0){c[13484>>2]=m|k;c[D>>2]=h;c[t+(s+24)>>2]=D;c[t+(s+12)>>2]=h;c[t+(s+8)>>2]=h;break}k=c[D>>2]|0;if((U|0)==31){V=0}else{V=25-(U>>>1)|0}e:do{if((c[k+4>>2]&-8|0)==(L|0)){W=k}else{D=L<<V;m=k;while(1){X=m+(D>>>31<<2)+16|0;f=c[X>>2]|0;if((f|0)==0){break}if((c[f+4>>2]&-8|0)==(L|0)){W=f;break e}else{D=D<<1;m=f}}if(X>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[X>>2]=h;c[t+(s+24)>>2]=m;c[t+(s+12)>>2]=h;c[t+(s+8)>>2]=h;break d}}}while(0);k=W+8|0;D=c[k>>2]|0;f=c[13496>>2]|0;if(W>>>0<f>>>0){Ub()}if(D>>>0<f>>>0){Ub()}else{c[D+12>>2]=h;c[k>>2]=h;c[t+(s+8)>>2]=D;c[t+(s+12)>>2]=W;c[t+(s+24)>>2]=0;break}}}while(0);p=M+8|0;i=b;return p|0}}while(0);M=c[13488>>2]|0;if(!(q>>>0>M>>>0)){W=M-q|0;X=c[13500>>2]|0;if(W>>>0>15){L=X;c[13500>>2]=L+q;c[13488>>2]=W;c[L+(q+4)>>2]=W|1;c[L+M>>2]=W;c[X+4>>2]=q|3}else{c[13488>>2]=0;c[13500>>2]=0;c[X+4>>2]=M|3;W=X+(M+4)|0;c[W>>2]=c[W>>2]|1}p=X+8|0;i=b;return p|0}X=c[13492>>2]|0;if(q>>>0<X>>>0){W=X-q|0;c[13492>>2]=W;X=c[13504>>2]|0;M=X;c[13504>>2]=M+q;c[M+(q+4)>>2]=W|1;c[X+4>>2]=q|3;p=X+8|0;i=b;return p|0}do{if((c[3488]|0)==0){X=Oa(30)|0;if((X+ -1&X|0)==0){c[13960>>2]=X;c[13956>>2]=X;c[13964>>2]=-1;c[13968>>2]=-1;c[13972>>2]=0;c[13924>>2]=0;X=(ub(0)|0)&-16^1431655768;c[3488]=X;break}else{Ub()}}}while(0);X=q+48|0;W=c[13960>>2]|0;M=q+47|0;L=W+M|0;V=0-W|0;W=L&V;if(!(W>>>0>q>>>0)){p=0;i=b;return p|0}U=c[13920>>2]|0;do{if((U|0)!=0){T=c[13912>>2]|0;S=T+W|0;if(S>>>0<=T>>>0|S>>>0>U>>>0){p=0}else{break}i=b;return p|0}}while(0);f:do{if((c[13924>>2]&4|0)==0){U=c[13504>>2]|0;g:do{if((U|0)==0){Y=182}else{S=U;T=13928|0;while(1){Z=T;P=c[Z>>2]|0;if(!(P>>>0>S>>>0)){_=T+4|0;if((P+(c[_>>2]|0)|0)>>>0>S>>>0){break}}P=c[T+8>>2]|0;if((P|0)==0){Y=182;break g}else{T=P}}if((T|0)==0){Y=182;break}S=L-(c[13492>>2]|0)&V;if(!(S>>>0<2147483647)){$=0;break}h=La(S|0)|0;P=(h|0)==((c[Z>>2]|0)+(c[_>>2]|0)|0);aa=h;ba=S;ca=P?h:-1;da=P?S:0;Y=191}}while(0);do{if((Y|0)==182){U=La(0)|0;if((U|0)==(-1|0)){$=0;break}S=U;P=c[13956>>2]|0;h=P+ -1|0;if((h&S|0)==0){ea=W}else{ea=W-S+(h+S&0-P)|0}P=c[13912>>2]|0;S=P+ea|0;if(!(ea>>>0>q>>>0&ea>>>0<2147483647)){$=0;break}h=c[13920>>2]|0;if((h|0)!=0){if(S>>>0<=P>>>0|S>>>0>h>>>0){$=0;break}}h=La(ea|0)|0;S=(h|0)==(U|0);aa=h;ba=ea;ca=S?U:-1;da=S?ea:0;Y=191}}while(0);h:do{if((Y|0)==191){S=0-ba|0;if((ca|0)!=(-1|0)){fa=ca;ga=da;Y=202;break f}do{if((aa|0)!=(-1|0)&ba>>>0<2147483647&ba>>>0<X>>>0){U=c[13960>>2]|0;h=M-ba+U&0-U;if(!(h>>>0<2147483647)){ha=ba;break}if((La(h|0)|0)==(-1|0)){La(S|0)|0;$=da;break h}else{ha=h+ba|0;break}}else{ha=ba}}while(0);if((aa|0)==(-1|0)){$=da}else{fa=aa;ga=ha;Y=202;break f}}}while(0);c[13924>>2]=c[13924>>2]|4;ia=$;Y=199}else{ia=0;Y=199}}while(0);do{if((Y|0)==199){if(!(W>>>0<2147483647)){break}$=La(W|0)|0;ha=La(0)|0;if(!((ha|0)!=(-1|0)&($|0)!=(-1|0)&$>>>0<ha>>>0)){break}aa=ha-$|0;ha=aa>>>0>(q+40|0)>>>0;if(ha){fa=$;ga=ha?aa:ia;Y=202}}}while(0);do{if((Y|0)==202){ia=(c[13912>>2]|0)+ga|0;c[13912>>2]=ia;if(ia>>>0>(c[13916>>2]|0)>>>0){c[13916>>2]=ia}ia=c[13504>>2]|0;i:do{if((ia|0)==0){W=c[13496>>2]|0;if((W|0)==0|fa>>>0<W>>>0){c[13496>>2]=fa}c[13928>>2]=fa;c[13932>>2]=ga;c[13940>>2]=0;c[13516>>2]=c[3488];c[13512>>2]=-1;W=0;do{aa=W<<1;ha=13520+(aa<<2)|0;c[13520+(aa+3<<2)>>2]=ha;c[13520+(aa+2<<2)>>2]=ha;W=W+1|0;}while((W|0)!=32);W=fa+8|0;if((W&7|0)==0){ja=0}else{ja=0-W&7}W=ga+ -40-ja|0;c[13504>>2]=fa+ja;c[13492>>2]=W;c[fa+(ja+4)>>2]=W|1;c[fa+(ga+ -36)>>2]=40;c[13508>>2]=c[13968>>2]}else{W=13928|0;while(1){ka=c[W>>2]|0;la=W+4|0;ma=c[la>>2]|0;if((fa|0)==(ka+ma|0)){Y=214;break}ha=c[W+8>>2]|0;if((ha|0)==0){break}else{W=ha}}do{if((Y|0)==214){if((c[W+12>>2]&8|0)!=0){break}ha=ia;if(!(ha>>>0>=ka>>>0&ha>>>0<fa>>>0)){break}c[la>>2]=ma+ga;aa=(c[13492>>2]|0)+ga|0;$=ia+8|0;if(($&7|0)==0){na=0}else{na=0-$&7}$=aa-na|0;c[13504>>2]=ha+na;c[13492>>2]=$;c[ha+(na+4)>>2]=$|1;c[ha+(aa+4)>>2]=40;c[13508>>2]=c[13968>>2];break i}}while(0);if(fa>>>0<(c[13496>>2]|0)>>>0){c[13496>>2]=fa}W=fa+ga|0;aa=13928|0;while(1){oa=aa;if((c[oa>>2]|0)==(W|0)){Y=224;break}ha=c[aa+8>>2]|0;if((ha|0)==0){break}else{aa=ha}}do{if((Y|0)==224){if((c[aa+12>>2]&8|0)!=0){break}c[oa>>2]=fa;W=aa+4|0;c[W>>2]=(c[W>>2]|0)+ga;W=fa+8|0;if((W&7|0)==0){pa=0}else{pa=0-W&7}W=fa+(ga+8)|0;if((W&7|0)==0){qa=0}else{qa=0-W&7}W=fa+(qa+ga)|0;ha=W;$=pa+q|0;da=fa+$|0;ba=da;M=W-(fa+pa)-q|0;c[fa+(pa+4)>>2]=q|3;j:do{if((ha|0)==(c[13504>>2]|0)){X=(c[13492>>2]|0)+M|0;c[13492>>2]=X;c[13504>>2]=ba;c[fa+($+4)>>2]=X|1}else{if((ha|0)==(c[13500>>2]|0)){X=(c[13488>>2]|0)+M|0;c[13488>>2]=X;c[13500>>2]=ba;c[fa+($+4)>>2]=X|1;c[fa+(X+$)>>2]=X;break}X=ga+4|0;ca=c[fa+(X+qa)>>2]|0;if((ca&3|0)==1){ea=ca&-8;_=ca>>>3;k:do{if(ca>>>0<256){Z=c[fa+((qa|8)+ga)>>2]|0;V=c[fa+(ga+12+qa)>>2]|0;L=13520+(_<<1<<2)|0;do{if((Z|0)!=(L|0)){if(Z>>>0<(c[13496>>2]|0)>>>0){Ub()}if((c[Z+12>>2]|0)==(ha|0)){break}Ub()}}while(0);if((V|0)==(Z|0)){c[3370]=c[3370]&~(1<<_);break}do{if((V|0)==(L|0)){ra=V+8|0}else{if(V>>>0<(c[13496>>2]|0)>>>0){Ub()}S=V+8|0;if((c[S>>2]|0)==(ha|0)){ra=S;break}Ub()}}while(0);c[Z+12>>2]=V;c[ra>>2]=Z}else{L=W;S=c[fa+((qa|24)+ga)>>2]|0;T=c[fa+(ga+12+qa)>>2]|0;do{if((T|0)==(L|0)){h=qa|16;U=fa+(X+h)|0;P=c[U>>2]|0;if((P|0)==0){Q=fa+(h+ga)|0;h=c[Q>>2]|0;if((h|0)==0){sa=0;break}else{ta=h;ua=Q}}else{ta=P;ua=U}while(1){U=ta+20|0;P=c[U>>2]|0;if((P|0)!=0){ua=U;ta=P;continue}P=ta+16|0;U=c[P>>2]|0;if((U|0)==0){break}else{ta=U;ua=P}}if(ua>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[ua>>2]=0;sa=ta;break}}else{P=c[fa+((qa|8)+ga)>>2]|0;if(P>>>0<(c[13496>>2]|0)>>>0){Ub()}U=P+12|0;if((c[U>>2]|0)!=(L|0)){Ub()}Q=T+8|0;if((c[Q>>2]|0)==(L|0)){c[U>>2]=T;c[Q>>2]=P;sa=T;break}else{Ub()}}}while(0);if((S|0)==0){break}T=c[fa+(ga+28+qa)>>2]|0;Z=13784+(T<<2)|0;do{if((L|0)==(c[Z>>2]|0)){c[Z>>2]=sa;if((sa|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<T);break k}else{if(S>>>0<(c[13496>>2]|0)>>>0){Ub()}V=S+16|0;if((c[V>>2]|0)==(L|0)){c[V>>2]=sa}else{c[S+20>>2]=sa}if((sa|0)==0){break k}}}while(0);if(sa>>>0<(c[13496>>2]|0)>>>0){Ub()}c[sa+24>>2]=S;L=qa|16;T=c[fa+(L+ga)>>2]|0;do{if((T|0)!=0){if(T>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[sa+16>>2]=T;c[T+24>>2]=sa;break}}}while(0);T=c[fa+(X+L)>>2]|0;if((T|0)==0){break}if(T>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[sa+20>>2]=T;c[T+24>>2]=sa;break}}}while(0);va=fa+((ea|qa)+ga)|0;wa=ea+M|0}else{va=ha;wa=M}X=va+4|0;c[X>>2]=c[X>>2]&-2;c[fa+($+4)>>2]=wa|1;c[fa+(wa+$)>>2]=wa;X=wa>>>3;if(wa>>>0<256){_=X<<1;ca=13520+(_<<2)|0;T=c[3370]|0;S=1<<X;do{if((T&S|0)==0){c[3370]=T|S;xa=13520+(_+2<<2)|0;ya=ca}else{X=13520+(_+2<<2)|0;Z=c[X>>2]|0;if(!(Z>>>0<(c[13496>>2]|0)>>>0)){xa=X;ya=Z;break}Ub()}}while(0);c[xa>>2]=ba;c[ya+12>>2]=ba;c[fa+($+8)>>2]=ya;c[fa+($+12)>>2]=ca;break}_=da;S=wa>>>8;do{if((S|0)==0){za=0}else{if(wa>>>0>16777215){za=31;break}T=(S+1048320|0)>>>16&8;ea=S<<T;Z=(ea+520192|0)>>>16&4;X=ea<<Z;ea=(X+245760|0)>>>16&2;V=14-(Z|T|ea)+(X<<ea>>>15)|0;za=wa>>>(V+7|0)&1|V<<1}}while(0);S=13784+(za<<2)|0;c[fa+($+28)>>2]=za;c[fa+($+20)>>2]=0;c[fa+($+16)>>2]=0;ca=c[13484>>2]|0;V=1<<za;if((ca&V|0)==0){c[13484>>2]=ca|V;c[S>>2]=_;c[fa+($+24)>>2]=S;c[fa+($+12)>>2]=_;c[fa+($+8)>>2]=_;break}V=c[S>>2]|0;if((za|0)==31){Aa=0}else{Aa=25-(za>>>1)|0}l:do{if((c[V+4>>2]&-8|0)==(wa|0)){Ba=V}else{S=wa<<Aa;ca=V;while(1){Ca=ca+(S>>>31<<2)+16|0;ea=c[Ca>>2]|0;if((ea|0)==0){break}if((c[ea+4>>2]&-8|0)==(wa|0)){Ba=ea;break l}else{S=S<<1;ca=ea}}if(Ca>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[Ca>>2]=_;c[fa+($+24)>>2]=ca;c[fa+($+12)>>2]=_;c[fa+($+8)>>2]=_;break j}}}while(0);V=Ba+8|0;S=c[V>>2]|0;L=c[13496>>2]|0;if(Ba>>>0<L>>>0){Ub()}if(S>>>0<L>>>0){Ub()}else{c[S+12>>2]=_;c[V>>2]=_;c[fa+($+8)>>2]=S;c[fa+($+12)>>2]=Ba;c[fa+($+24)>>2]=0;break}}}while(0);p=fa+(pa|8)|0;i=b;return p|0}}while(0);aa=ia;$=13928|0;while(1){Da=c[$>>2]|0;if(!(Da>>>0>aa>>>0)){Ea=c[$+4>>2]|0;Fa=Da+Ea|0;if(Fa>>>0>aa>>>0){break}}$=c[$+8>>2]|0}$=Da+(Ea+ -39)|0;if(($&7|0)==0){Ga=0}else{Ga=0-$&7}$=Da+(Ea+ -47+Ga)|0;da=$>>>0<(ia+16|0)>>>0?aa:$;$=da+8|0;ba=$;M=fa+8|0;if((M&7|0)==0){Ha=0}else{Ha=0-M&7}M=ga+ -40-Ha|0;c[13504>>2]=fa+Ha;c[13492>>2]=M;c[fa+(Ha+4)>>2]=M|1;c[fa+(ga+ -36)>>2]=40;c[13508>>2]=c[13968>>2];c[da+4>>2]=27;c[$+0>>2]=c[13928>>2];c[$+4>>2]=c[13932>>2];c[$+8>>2]=c[13936>>2];c[$+12>>2]=c[13940>>2];c[13928>>2]=fa;c[13932>>2]=ga;c[13940>>2]=0;c[13936>>2]=ba;ba=da+28|0;c[ba>>2]=7;if((da+32|0)>>>0<Fa>>>0){$=ba;while(1){ba=$+4|0;c[ba>>2]=7;if(($+8|0)>>>0<Fa>>>0){$=ba}else{break}}}if((da|0)==(aa|0)){break}$=da-ia|0;ba=aa+($+4)|0;c[ba>>2]=c[ba>>2]&-2;c[ia+4>>2]=$|1;c[aa+$>>2]=$;ba=$>>>3;if($>>>0<256){M=ba<<1;ha=13520+(M<<2)|0;W=c[3370]|0;m=1<<ba;do{if((W&m|0)==0){c[3370]=W|m;Ia=13520+(M+2<<2)|0;Ja=ha}else{ba=13520+(M+2<<2)|0;S=c[ba>>2]|0;if(!(S>>>0<(c[13496>>2]|0)>>>0)){Ia=ba;Ja=S;break}Ub()}}while(0);c[Ia>>2]=ia;c[Ja+12>>2]=ia;c[ia+8>>2]=Ja;c[ia+12>>2]=ha;break}M=ia;m=$>>>8;do{if((m|0)==0){Ka=0}else{if($>>>0>16777215){Ka=31;break}W=(m+1048320|0)>>>16&8;aa=m<<W;da=(aa+520192|0)>>>16&4;S=aa<<da;aa=(S+245760|0)>>>16&2;ba=14-(da|W|aa)+(S<<aa>>>15)|0;Ka=$>>>(ba+7|0)&1|ba<<1}}while(0);m=13784+(Ka<<2)|0;c[ia+28>>2]=Ka;c[ia+20>>2]=0;c[ia+16>>2]=0;ha=c[13484>>2]|0;ba=1<<Ka;if((ha&ba|0)==0){c[13484>>2]=ha|ba;c[m>>2]=M;c[ia+24>>2]=m;c[ia+12>>2]=ia;c[ia+8>>2]=ia;break}ba=c[m>>2]|0;if((Ka|0)==31){Ma=0}else{Ma=25-(Ka>>>1)|0}m:do{if((c[ba+4>>2]&-8|0)==($|0)){Na=ba}else{m=$<<Ma;ha=ba;while(1){Pa=ha+(m>>>31<<2)+16|0;aa=c[Pa>>2]|0;if((aa|0)==0){break}if((c[aa+4>>2]&-8|0)==($|0)){Na=aa;break m}else{m=m<<1;ha=aa}}if(Pa>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[Pa>>2]=M;c[ia+24>>2]=ha;c[ia+12>>2]=ia;c[ia+8>>2]=ia;break i}}}while(0);$=Na+8|0;ba=c[$>>2]|0;m=c[13496>>2]|0;if(Na>>>0<m>>>0){Ub()}if(ba>>>0<m>>>0){Ub()}else{c[ba+12>>2]=M;c[$>>2]=M;c[ia+8>>2]=ba;c[ia+12>>2]=Na;c[ia+24>>2]=0;break}}}while(0);ia=c[13492>>2]|0;if(!(ia>>>0>q>>>0)){break}ba=ia-q|0;c[13492>>2]=ba;ia=c[13504>>2]|0;$=ia;c[13504>>2]=$+q;c[$+(q+4)>>2]=ba|1;c[ia+4>>2]=q|3;p=ia+8|0;i=b;return p|0}}while(0);q=mc()|0;c[q>>2]=12;p=0;i=b;return p|0}function Qm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=i;if((a|0)==0){i=b;return}d=a+ -8|0;e=d;f=c[13496>>2]|0;if(d>>>0<f>>>0){Ub()}g=c[a+ -4>>2]|0;h=g&3;if((h|0)==1){Ub()}j=g&-8;k=a+(j+ -8)|0;l=k;a:do{if((g&1|0)==0){m=c[d>>2]|0;if((h|0)==0){i=b;return}n=-8-m|0;o=a+n|0;p=o;q=m+j|0;if(o>>>0<f>>>0){Ub()}if((p|0)==(c[13500>>2]|0)){r=a+(j+ -4)|0;if((c[r>>2]&3|0)!=3){s=p;t=q;break}c[13488>>2]=q;c[r>>2]=c[r>>2]&-2;c[a+(n+4)>>2]=q|1;c[k>>2]=q;i=b;return}r=m>>>3;if(m>>>0<256){m=c[a+(n+8)>>2]|0;u=c[a+(n+12)>>2]|0;v=13520+(r<<1<<2)|0;do{if((m|0)!=(v|0)){if(m>>>0<f>>>0){Ub()}if((c[m+12>>2]|0)==(p|0)){break}Ub()}}while(0);if((u|0)==(m|0)){c[3370]=c[3370]&~(1<<r);s=p;t=q;break}do{if((u|0)==(v|0)){w=u+8|0}else{if(u>>>0<f>>>0){Ub()}x=u+8|0;if((c[x>>2]|0)==(p|0)){w=x;break}Ub()}}while(0);c[m+12>>2]=u;c[w>>2]=m;s=p;t=q;break}v=o;r=c[a+(n+24)>>2]|0;x=c[a+(n+12)>>2]|0;do{if((x|0)==(v|0)){y=a+(n+20)|0;z=c[y>>2]|0;if((z|0)==0){A=a+(n+16)|0;B=c[A>>2]|0;if((B|0)==0){C=0;break}else{D=B;E=A}}else{D=z;E=y}while(1){y=D+20|0;z=c[y>>2]|0;if((z|0)!=0){E=y;D=z;continue}z=D+16|0;y=c[z>>2]|0;if((y|0)==0){break}else{D=y;E=z}}if(E>>>0<f>>>0){Ub()}else{c[E>>2]=0;C=D;break}}else{z=c[a+(n+8)>>2]|0;if(z>>>0<f>>>0){Ub()}y=z+12|0;if((c[y>>2]|0)!=(v|0)){Ub()}A=x+8|0;if((c[A>>2]|0)==(v|0)){c[y>>2]=x;c[A>>2]=z;C=x;break}else{Ub()}}}while(0);if((r|0)==0){s=p;t=q;break}x=c[a+(n+28)>>2]|0;o=13784+(x<<2)|0;do{if((v|0)==(c[o>>2]|0)){c[o>>2]=C;if((C|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<x);s=p;t=q;break a}else{if(r>>>0<(c[13496>>2]|0)>>>0){Ub()}m=r+16|0;if((c[m>>2]|0)==(v|0)){c[m>>2]=C}else{c[r+20>>2]=C}if((C|0)==0){s=p;t=q;break a}}}while(0);if(C>>>0<(c[13496>>2]|0)>>>0){Ub()}c[C+24>>2]=r;v=c[a+(n+16)>>2]|0;do{if((v|0)!=0){if(v>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[C+16>>2]=v;c[v+24>>2]=C;break}}}while(0);v=c[a+(n+20)>>2]|0;if((v|0)==0){s=p;t=q;break}if(v>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[C+20>>2]=v;c[v+24>>2]=C;s=p;t=q;break}}else{s=e;t=j}}while(0);e=s;if(!(e>>>0<k>>>0)){Ub()}C=a+(j+ -4)|0;f=c[C>>2]|0;if((f&1|0)==0){Ub()}do{if((f&2|0)==0){if((l|0)==(c[13504>>2]|0)){D=(c[13492>>2]|0)+t|0;c[13492>>2]=D;c[13504>>2]=s;c[s+4>>2]=D|1;if((s|0)!=(c[13500>>2]|0)){i=b;return}c[13500>>2]=0;c[13488>>2]=0;i=b;return}if((l|0)==(c[13500>>2]|0)){D=(c[13488>>2]|0)+t|0;c[13488>>2]=D;c[13500>>2]=s;c[s+4>>2]=D|1;c[e+D>>2]=D;i=b;return}D=(f&-8)+t|0;E=f>>>3;b:do{if(f>>>0<256){w=c[a+j>>2]|0;h=c[a+(j|4)>>2]|0;d=13520+(E<<1<<2)|0;do{if((w|0)!=(d|0)){if(w>>>0<(c[13496>>2]|0)>>>0){Ub()}if((c[w+12>>2]|0)==(l|0)){break}Ub()}}while(0);if((h|0)==(w|0)){c[3370]=c[3370]&~(1<<E);break}do{if((h|0)==(d|0)){F=h+8|0}else{if(h>>>0<(c[13496>>2]|0)>>>0){Ub()}g=h+8|0;if((c[g>>2]|0)==(l|0)){F=g;break}Ub()}}while(0);c[w+12>>2]=h;c[F>>2]=w}else{d=k;g=c[a+(j+16)>>2]|0;v=c[a+(j|4)>>2]|0;do{if((v|0)==(d|0)){r=a+(j+12)|0;x=c[r>>2]|0;if((x|0)==0){o=a+(j+8)|0;m=c[o>>2]|0;if((m|0)==0){G=0;break}else{H=m;I=o}}else{H=x;I=r}while(1){r=H+20|0;x=c[r>>2]|0;if((x|0)!=0){I=r;H=x;continue}x=H+16|0;r=c[x>>2]|0;if((r|0)==0){break}else{H=r;I=x}}if(I>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[I>>2]=0;G=H;break}}else{x=c[a+j>>2]|0;if(x>>>0<(c[13496>>2]|0)>>>0){Ub()}r=x+12|0;if((c[r>>2]|0)!=(d|0)){Ub()}o=v+8|0;if((c[o>>2]|0)==(d|0)){c[r>>2]=v;c[o>>2]=x;G=v;break}else{Ub()}}}while(0);if((g|0)==0){break}v=c[a+(j+20)>>2]|0;w=13784+(v<<2)|0;do{if((d|0)==(c[w>>2]|0)){c[w>>2]=G;if((G|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<v);break b}else{if(g>>>0<(c[13496>>2]|0)>>>0){Ub()}h=g+16|0;if((c[h>>2]|0)==(d|0)){c[h>>2]=G}else{c[g+20>>2]=G}if((G|0)==0){break b}}}while(0);if(G>>>0<(c[13496>>2]|0)>>>0){Ub()}c[G+24>>2]=g;d=c[a+(j+8)>>2]|0;do{if((d|0)!=0){if(d>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[G+16>>2]=d;c[d+24>>2]=G;break}}}while(0);d=c[a+(j+12)>>2]|0;if((d|0)==0){break}if(d>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[G+20>>2]=d;c[d+24>>2]=G;break}}}while(0);c[s+4>>2]=D|1;c[e+D>>2]=D;if((s|0)!=(c[13500>>2]|0)){J=D;break}c[13488>>2]=D;i=b;return}else{c[C>>2]=f&-2;c[s+4>>2]=t|1;c[e+t>>2]=t;J=t}}while(0);t=J>>>3;if(J>>>0<256){e=t<<1;f=13520+(e<<2)|0;C=c[3370]|0;G=1<<t;do{if((C&G|0)==0){c[3370]=C|G;K=13520+(e+2<<2)|0;L=f}else{t=13520+(e+2<<2)|0;j=c[t>>2]|0;if(!(j>>>0<(c[13496>>2]|0)>>>0)){K=t;L=j;break}Ub()}}while(0);c[K>>2]=s;c[L+12>>2]=s;c[s+8>>2]=L;c[s+12>>2]=f;i=b;return}f=s;L=J>>>8;do{if((L|0)==0){M=0}else{if(J>>>0>16777215){M=31;break}K=(L+1048320|0)>>>16&8;e=L<<K;G=(e+520192|0)>>>16&4;C=e<<G;e=(C+245760|0)>>>16&2;j=14-(G|K|e)+(C<<e>>>15)|0;M=J>>>(j+7|0)&1|j<<1}}while(0);L=13784+(M<<2)|0;c[s+28>>2]=M;c[s+20>>2]=0;c[s+16>>2]=0;j=c[13484>>2]|0;e=1<<M;c:do{if((j&e|0)==0){c[13484>>2]=j|e;c[L>>2]=f;c[s+24>>2]=L;c[s+12>>2]=s;c[s+8>>2]=s}else{C=c[L>>2]|0;if((M|0)==31){N=0}else{N=25-(M>>>1)|0}d:do{if((c[C+4>>2]&-8|0)==(J|0)){O=C}else{K=J<<N;G=C;while(1){P=G+(K>>>31<<2)+16|0;t=c[P>>2]|0;if((t|0)==0){break}if((c[t+4>>2]&-8|0)==(J|0)){O=t;break d}else{K=K<<1;G=t}}if(P>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[P>>2]=f;c[s+24>>2]=G;c[s+12>>2]=s;c[s+8>>2]=s;break c}}}while(0);C=O+8|0;D=c[C>>2]|0;K=c[13496>>2]|0;if(O>>>0<K>>>0){Ub()}if(D>>>0<K>>>0){Ub()}else{c[D+12>>2]=f;c[C>>2]=f;c[s+8>>2]=D;c[s+12>>2]=O;c[s+24>>2]=0;break}}}while(0);s=(c[13512>>2]|0)+ -1|0;c[13512>>2]=s;if((s|0)==0){Q=13936|0}else{i=b;return}while(1){s=c[Q>>2]|0;if((s|0)==0){break}else{Q=s+8|0}}c[13512>>2]=-1;i=b;return}function Rm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;if((a|0)==0){e=Pm(b)|0;i=d;return e|0}if(b>>>0>4294967231){f=mc()|0;c[f>>2]=12;e=0;i=d;return e|0}if(b>>>0<11){g=16}else{g=b+11&-8}f=Sm(a+ -8|0,g)|0;if((f|0)!=0){e=f+8|0;i=d;return e|0}f=Pm(b)|0;if((f|0)==0){e=0;i=d;return e|0}g=c[a+ -4>>2]|0;h=(g&-8)-((g&3|0)==0?8:4)|0;on(f|0,a|0,(h>>>0<b>>>0?h:b)|0)|0;Qm(a);e=f;i=d;return e|0}function Sm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;e=a+4|0;f=c[e>>2]|0;g=f&-8;h=a;j=h+g|0;k=j;l=c[13496>>2]|0;if(h>>>0<l>>>0){Ub()}m=f&3;if(!((m|0)!=1&h>>>0<j>>>0)){Ub()}n=h+(g|4)|0;o=c[n>>2]|0;if((o&1|0)==0){Ub()}if((m|0)==0){if(b>>>0<256){p=0;i=d;return p|0}do{if(!(g>>>0<(b+4|0)>>>0)){if((g-b|0)>>>0>c[13960>>2]<<1>>>0){break}else{p=a}i=d;return p|0}}while(0);p=0;i=d;return p|0}if(!(g>>>0<b>>>0)){m=g-b|0;if(!(m>>>0>15)){p=a;i=d;return p|0}c[e>>2]=f&1|b|2;c[h+(b+4)>>2]=m|3;c[n>>2]=c[n>>2]|1;Tm(h+b|0,m);p=a;i=d;return p|0}if((k|0)==(c[13504>>2]|0)){m=(c[13492>>2]|0)+g|0;if(!(m>>>0>b>>>0)){p=0;i=d;return p|0}n=m-b|0;c[e>>2]=f&1|b|2;c[h+(b+4)>>2]=n|1;c[13504>>2]=h+b;c[13492>>2]=n;p=a;i=d;return p|0}if((k|0)==(c[13500>>2]|0)){n=(c[13488>>2]|0)+g|0;if(n>>>0<b>>>0){p=0;i=d;return p|0}m=n-b|0;if(m>>>0>15){c[e>>2]=f&1|b|2;c[h+(b+4)>>2]=m|1;c[h+n>>2]=m;q=h+(n+4)|0;c[q>>2]=c[q>>2]&-2;r=h+b|0;s=m}else{c[e>>2]=f&1|n|2;f=h+(n+4)|0;c[f>>2]=c[f>>2]|1;r=0;s=0}c[13488>>2]=s;c[13500>>2]=r;p=a;i=d;return p|0}if((o&2|0)!=0){p=0;i=d;return p|0}r=(o&-8)+g|0;if(r>>>0<b>>>0){p=0;i=d;return p|0}s=r-b|0;f=o>>>3;a:do{if(o>>>0<256){n=c[h+(g+8)>>2]|0;m=c[h+(g+12)>>2]|0;q=13520+(f<<1<<2)|0;do{if((n|0)!=(q|0)){if(n>>>0<l>>>0){Ub()}if((c[n+12>>2]|0)==(k|0)){break}Ub()}}while(0);if((m|0)==(n|0)){c[3370]=c[3370]&~(1<<f);break}do{if((m|0)==(q|0)){t=m+8|0}else{if(m>>>0<l>>>0){Ub()}u=m+8|0;if((c[u>>2]|0)==(k|0)){t=u;break}Ub()}}while(0);c[n+12>>2]=m;c[t>>2]=n}else{q=j;u=c[h+(g+24)>>2]|0;v=c[h+(g+12)>>2]|0;do{if((v|0)==(q|0)){w=h+(g+20)|0;x=c[w>>2]|0;if((x|0)==0){y=h+(g+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){C=w;B=x;continue}x=B+16|0;w=c[x>>2]|0;if((w|0)==0){break}else{B=w;C=x}}if(C>>>0<l>>>0){Ub()}else{c[C>>2]=0;A=B;break}}else{x=c[h+(g+8)>>2]|0;if(x>>>0<l>>>0){Ub()}w=x+12|0;if((c[w>>2]|0)!=(q|0)){Ub()}y=v+8|0;if((c[y>>2]|0)==(q|0)){c[w>>2]=v;c[y>>2]=x;A=v;break}else{Ub()}}}while(0);if((u|0)==0){break}v=c[h+(g+28)>>2]|0;n=13784+(v<<2)|0;do{if((q|0)==(c[n>>2]|0)){c[n>>2]=A;if((A|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<v);break a}else{if(u>>>0<(c[13496>>2]|0)>>>0){Ub()}m=u+16|0;if((c[m>>2]|0)==(q|0)){c[m>>2]=A}else{c[u+20>>2]=A}if((A|0)==0){break a}}}while(0);if(A>>>0<(c[13496>>2]|0)>>>0){Ub()}c[A+24>>2]=u;q=c[h+(g+16)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[A+16>>2]=q;c[q+24>>2]=A;break}}}while(0);q=c[h+(g+20)>>2]|0;if((q|0)==0){break}if(q>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[A+20>>2]=q;c[q+24>>2]=A;break}}}while(0);if(s>>>0<16){c[e>>2]=r|c[e>>2]&1|2;A=h+(r|4)|0;c[A>>2]=c[A>>2]|1;p=a;i=d;return p|0}else{c[e>>2]=c[e>>2]&1|b|2;c[h+(b+4)>>2]=s|3;e=h+(r|4)|0;c[e>>2]=c[e>>2]|1;Tm(h+b|0,s);p=a;i=d;return p|0}return 0}function Tm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;e=a;f=e+b|0;g=f;h=c[a+4>>2]|0;a:do{if((h&1|0)==0){j=c[a>>2]|0;if((h&3|0)==0){i=d;return}k=e+(0-j)|0;l=k;m=j+b|0;n=c[13496>>2]|0;if(k>>>0<n>>>0){Ub()}if((l|0)==(c[13500>>2]|0)){o=e+(b+4)|0;if((c[o>>2]&3|0)!=3){p=l;q=m;break}c[13488>>2]=m;c[o>>2]=c[o>>2]&-2;c[e+(4-j)>>2]=m|1;c[f>>2]=m;i=d;return}o=j>>>3;if(j>>>0<256){r=c[e+(8-j)>>2]|0;s=c[e+(12-j)>>2]|0;t=13520+(o<<1<<2)|0;do{if((r|0)!=(t|0)){if(r>>>0<n>>>0){Ub()}if((c[r+12>>2]|0)==(l|0)){break}Ub()}}while(0);if((s|0)==(r|0)){c[3370]=c[3370]&~(1<<o);p=l;q=m;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<n>>>0){Ub()}v=s+8|0;if((c[v>>2]|0)==(l|0)){u=v;break}Ub()}}while(0);c[r+12>>2]=s;c[u>>2]=r;p=l;q=m;break}t=k;o=c[e+(24-j)>>2]|0;v=c[e+(12-j)>>2]|0;do{if((v|0)==(t|0)){w=16-j|0;x=e+(w+4)|0;y=c[x>>2]|0;if((y|0)==0){z=e+w|0;w=c[z>>2]|0;if((w|0)==0){A=0;break}else{B=w;C=z}}else{B=y;C=x}while(1){x=B+20|0;y=c[x>>2]|0;if((y|0)!=0){C=x;B=y;continue}y=B+16|0;x=c[y>>2]|0;if((x|0)==0){break}else{B=x;C=y}}if(C>>>0<n>>>0){Ub()}else{c[C>>2]=0;A=B;break}}else{y=c[e+(8-j)>>2]|0;if(y>>>0<n>>>0){Ub()}x=y+12|0;if((c[x>>2]|0)!=(t|0)){Ub()}z=v+8|0;if((c[z>>2]|0)==(t|0)){c[x>>2]=v;c[z>>2]=y;A=v;break}else{Ub()}}}while(0);if((o|0)==0){p=l;q=m;break}v=c[e+(28-j)>>2]|0;n=13784+(v<<2)|0;do{if((t|0)==(c[n>>2]|0)){c[n>>2]=A;if((A|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<v);p=l;q=m;break a}else{if(o>>>0<(c[13496>>2]|0)>>>0){Ub()}k=o+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[o+20>>2]=A}if((A|0)==0){p=l;q=m;break a}}}while(0);if(A>>>0<(c[13496>>2]|0)>>>0){Ub()}c[A+24>>2]=o;t=16-j|0;v=c[e+t>>2]|0;do{if((v|0)!=0){if(v>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[A+16>>2]=v;c[v+24>>2]=A;break}}}while(0);v=c[e+(t+4)>>2]|0;if((v|0)==0){p=l;q=m;break}if(v>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[A+20>>2]=v;c[v+24>>2]=A;p=l;q=m;break}}else{p=a;q=b}}while(0);a=c[13496>>2]|0;if(f>>>0<a>>>0){Ub()}A=e+(b+4)|0;B=c[A>>2]|0;do{if((B&2|0)==0){if((g|0)==(c[13504>>2]|0)){C=(c[13492>>2]|0)+q|0;c[13492>>2]=C;c[13504>>2]=p;c[p+4>>2]=C|1;if((p|0)!=(c[13500>>2]|0)){i=d;return}c[13500>>2]=0;c[13488>>2]=0;i=d;return}if((g|0)==(c[13500>>2]|0)){C=(c[13488>>2]|0)+q|0;c[13488>>2]=C;c[13500>>2]=p;c[p+4>>2]=C|1;c[p+C>>2]=C;i=d;return}C=(B&-8)+q|0;u=B>>>3;b:do{if(B>>>0<256){h=c[e+(b+8)>>2]|0;v=c[e+(b+12)>>2]|0;j=13520+(u<<1<<2)|0;do{if((h|0)!=(j|0)){if(h>>>0<a>>>0){Ub()}if((c[h+12>>2]|0)==(g|0)){break}Ub()}}while(0);if((v|0)==(h|0)){c[3370]=c[3370]&~(1<<u);break}do{if((v|0)==(j|0)){D=v+8|0}else{if(v>>>0<a>>>0){Ub()}o=v+8|0;if((c[o>>2]|0)==(g|0)){D=o;break}Ub()}}while(0);c[h+12>>2]=v;c[D>>2]=h}else{j=f;o=c[e+(b+24)>>2]|0;n=c[e+(b+12)>>2]|0;do{if((n|0)==(j|0)){k=e+(b+20)|0;r=c[k>>2]|0;if((r|0)==0){s=e+(b+16)|0;y=c[s>>2]|0;if((y|0)==0){E=0;break}else{F=y;G=s}}else{F=r;G=k}while(1){k=F+20|0;r=c[k>>2]|0;if((r|0)!=0){G=k;F=r;continue}r=F+16|0;k=c[r>>2]|0;if((k|0)==0){break}else{F=k;G=r}}if(G>>>0<a>>>0){Ub()}else{c[G>>2]=0;E=F;break}}else{r=c[e+(b+8)>>2]|0;if(r>>>0<a>>>0){Ub()}k=r+12|0;if((c[k>>2]|0)!=(j|0)){Ub()}s=n+8|0;if((c[s>>2]|0)==(j|0)){c[k>>2]=n;c[s>>2]=r;E=n;break}else{Ub()}}}while(0);if((o|0)==0){break}n=c[e+(b+28)>>2]|0;h=13784+(n<<2)|0;do{if((j|0)==(c[h>>2]|0)){c[h>>2]=E;if((E|0)!=0){break}c[13484>>2]=c[13484>>2]&~(1<<n);break b}else{if(o>>>0<(c[13496>>2]|0)>>>0){Ub()}v=o+16|0;if((c[v>>2]|0)==(j|0)){c[v>>2]=E}else{c[o+20>>2]=E}if((E|0)==0){break b}}}while(0);if(E>>>0<(c[13496>>2]|0)>>>0){Ub()}c[E+24>>2]=o;j=c[e+(b+16)>>2]|0;do{if((j|0)!=0){if(j>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[E+16>>2]=j;c[j+24>>2]=E;break}}}while(0);j=c[e+(b+20)>>2]|0;if((j|0)==0){break}if(j>>>0<(c[13496>>2]|0)>>>0){Ub()}else{c[E+20>>2]=j;c[j+24>>2]=E;break}}}while(0);c[p+4>>2]=C|1;c[p+C>>2]=C;if((p|0)!=(c[13500>>2]|0)){H=C;break}c[13488>>2]=C;i=d;return}else{c[A>>2]=B&-2;c[p+4>>2]=q|1;c[p+q>>2]=q;H=q}}while(0);q=H>>>3;if(H>>>0<256){B=q<<1;A=13520+(B<<2)|0;E=c[3370]|0;b=1<<q;do{if((E&b|0)==0){c[3370]=E|b;I=13520+(B+2<<2)|0;J=A}else{q=13520+(B+2<<2)|0;e=c[q>>2]|0;if(!(e>>>0<(c[13496>>2]|0)>>>0)){I=q;J=e;break}Ub()}}while(0);c[I>>2]=p;c[J+12>>2]=p;c[p+8>>2]=J;c[p+12>>2]=A;i=d;return}A=p;J=H>>>8;do{if((J|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}I=(J+1048320|0)>>>16&8;B=J<<I;b=(B+520192|0)>>>16&4;E=B<<b;B=(E+245760|0)>>>16&2;e=14-(b|I|B)+(E<<B>>>15)|0;K=H>>>(e+7|0)&1|e<<1}}while(0);J=13784+(K<<2)|0;c[p+28>>2]=K;c[p+20>>2]=0;c[p+16>>2]=0;e=c[13484>>2]|0;B=1<<K;if((e&B|0)==0){c[13484>>2]=e|B;c[J>>2]=A;c[p+24>>2]=J;c[p+12>>2]=p;c[p+8>>2]=p;i=d;return}B=c[J>>2]|0;if((K|0)==31){L=0}else{L=25-(K>>>1)|0}c:do{if((c[B+4>>2]&-8|0)==(H|0)){M=B}else{K=H<<L;J=B;while(1){N=J+(K>>>31<<2)+16|0;e=c[N>>2]|0;if((e|0)==0){break}if((c[e+4>>2]&-8|0)==(H|0)){M=e;break c}else{K=K<<1;J=e}}if(N>>>0<(c[13496>>2]|0)>>>0){Ub()}c[N>>2]=A;c[p+24>>2]=J;c[p+12>>2]=p;c[p+8>>2]=p;i=d;return}}while(0);N=M+8|0;H=c[N>>2]|0;B=c[13496>>2]|0;if(M>>>0<B>>>0){Ub()}if(H>>>0<B>>>0){Ub()}c[H+12>>2]=A;c[N>>2]=A;c[p+8>>2]=H;c[p+12>>2]=M;c[p+24>>2]=0;i=d;return}function Um(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=(a|0)==0?1:a;while(1){e=Pm(d)|0;if((e|0)!=0){f=6;break}a=c[3494]|0;c[3494]=a+0;if((a|0)==0){f=5;break}Gc[a&1]()}if((f|0)==5){d=Bb(4)|0;c[d>>2]=13992;oc(d|0,14040,109)}else if((f|0)==6){i=b;return e|0}return 0}function Vm(a){a=a|0;var b=0,c=0;b=i;c=Um(a)|0;i=b;return c|0}function Wm(a){a=a|0;var b=0;b=i;if((a|0)!=0){Qm(a)}i=b;return}function Xm(a){a=a|0;var b=0;b=i;Wm(a);i=b;return}function Ym(a){a=a|0;var b=0;b=i;Ta(a|0);Wm(a);i=b;return}function Zm(a){a=a|0;var b=0;b=i;Ta(a|0);i=b;return}function _m(a){a=a|0;i=i;return 14008}function $m(){var a=0;a=Bb(4)|0;c[a>>2]=13992;oc(a|0,14040,109)}



function an(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0.0,U=0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,fa=0,ga=0,ha=0,ia=0.0,ja=0,ka=0.0,la=0,ma=0.0,na=0,oa=0.0,pa=0.0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0.0,ya=0,za=0.0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0.0,Fa=0,Ga=0.0,Ha=0.0,Ia=0,Ja=0.0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0.0,Bc=0,Cc=0,Dc=0.0,Ec=0.0,Fc=0.0,Gc=0.0,Hc=0.0,Ic=0.0,Jc=0,Kc=0,Lc=0.0,Mc=0,Nc=0.0,Oc=0;g=i;i=i+512|0;h=g;if((e|0)==0){j=24;k=-149}else if((e|0)==1){j=53;k=-1074}else if((e|0)==2){j=53;k=-1074}else{l=0.0;i=g;return+l}e=b+4|0;m=b+100|0;do{n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;o=d[n]|0}else{o=dn(b)|0}}while((Vb(o|0)|0)!=0);do{if((o|0)==43|(o|0)==45){n=1-(((o|0)==45)<<1)|0;p=c[e>>2]|0;if(p>>>0<(c[m>>2]|0)>>>0){c[e>>2]=p+1;q=d[p]|0;r=n;break}else{q=dn(b)|0;r=n;break}}else{q=o;r=1}}while(0);o=q;q=0;while(1){if((o|32|0)!=(a[14056+q|0]|0)){s=o;t=q;break}do{if(q>>>0<7){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;u=d[n]|0;break}else{u=dn(b)|0;break}}else{u=o}}while(0);n=q+1|0;if(n>>>0<8){o=u;q=n}else{s=u;t=n;break}}do{if((t|0)==3){v=23}else if((t|0)!=8){u=(f|0)==0;if(!(t>>>0<4|u)){if((t|0)==8){break}else{v=23;break}}a:do{if((t|0)==0){q=s;o=0;while(1){if((q|32|0)!=(a[14072+o|0]|0)){w=q;z=o;break a}do{if(o>>>0<2){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;A=d[n]|0;break}else{A=dn(b)|0;break}}else{A=q}}while(0);n=o+1|0;if(n>>>0<3){q=A;o=n}else{w=A;z=n;break}}}else{w=s;z=t}}while(0);if((z|0)==3){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;B=d[o]|0}else{B=dn(b)|0}if((B|0)==40){C=1}else{if((c[m>>2]|0)==0){l=x;i=g;return+l}c[e>>2]=(c[e>>2]|0)+ -1;l=x;i=g;return+l}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;D=d[o]|0}else{D=dn(b)|0}if(!((D+ -48|0)>>>0<10|(D+ -65|0)>>>0<26)){if(!((D+ -97|0)>>>0<26|(D|0)==95)){break}}C=C+1|0}if((D|0)==41){l=x;i=g;return+l}o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}if(u){q=mc()|0;c[q>>2]=22;cn(b,0);l=0.0;i=g;return+l}if((C|0)==0|o){l=x;i=g;return+l}else{E=C}while(1){o=E+ -1|0;c[e>>2]=(c[e>>2]|0)+ -1;if((o|0)==0){l=x;break}else{E=o}}i=g;return+l}else if((z|0)==0){do{if((w|0)==48){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;F=d[o]|0}else{F=dn(b)|0}if((F|32|0)!=120){if((c[m>>2]|0)==0){G=48;break}c[e>>2]=(c[e>>2]|0)+ -1;G=48;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;H=d[o]|0;J=0}else{H=dn(b)|0;J=0}while(1){if((H|0)==46){v=70;break}else if((H|0)!=48){K=0;L=0;M=0;N=0;O=H;P=J;Q=0;R=0;S=1.0;U=0;V=0.0;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;H=d[o]|0;J=1;continue}else{H=dn(b)|0;J=1;continue}}b:do{if((v|0)==70){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;W=d[o]|0}else{W=dn(b)|0}if((W|0)==48){X=-1;Y=-1}else{K=0;L=0;M=0;N=0;O=W;P=J;Q=1;R=0;S=1.0;U=0;V=0.0;break}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;Z=d[o]|0}else{Z=dn(b)|0}if((Z|0)!=48){K=X;L=Y;M=0;N=0;O=Z;P=1;Q=1;R=0;S=1.0;U=0;V=0.0;break b}o=nn(X|0,Y|0,-1,-1)|0;X=o;Y=I}}}while(0);c:while(1){o=O+ -48|0;do{if(o>>>0<10){_=o;v=84}else{q=O|32;n=(O|0)==46;if(!((q+ -97|0)>>>0<6|n)){$=O;break c}if(n){if((Q|0)==0){aa=M;ba=N;ca=M;da=N;fa=P;ga=1;ha=R;ia=S;ja=U;ka=V;break}else{$=46;break c}}else{_=(O|0)>57?q+ -87|0:o;v=84;break}}}while(0);if((v|0)==84){v=0;do{if((N|0)<0|(N|0)==0&M>>>0<8){la=R;ma=S;na=_+(U<<4)|0;oa=V}else{if((N|0)<0|(N|0)==0&M>>>0<14){pa=S*.0625;la=R;ma=pa;na=U;oa=V+pa*+(_|0);break}if(!((_|0)!=0&(R|0)==0)){la=R;ma=S;na=U;oa=V;break}la=1;ma=S;na=U;oa=V+S*.5}}while(0);o=nn(M|0,N|0,1,0)|0;aa=K;ba=L;ca=o;da=I;fa=1;ga=Q;ha=la;ia=ma;ja=na;ka=oa}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;K=aa;L=ba;M=ca;N=da;O=d[o]|0;P=fa;Q=ga;R=ha;S=ia;U=ja;V=ka;continue}else{K=aa;L=ba;M=ca;N=da;O=dn(b)|0;P=fa;Q=ga;R=ha;S=ia;U=ja;V=ka;continue}}if((P|0)==0){o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}do{if(u){cn(b,0)}else{if(o){break}q=c[e>>2]|0;c[e>>2]=q+ -1;if((Q|0)==0){break}c[e>>2]=q+ -2}}while(0);l=+(r|0)*0.0;i=g;return+l}o=(Q|0)==0;q=o?M:K;n=o?N:L;if((N|0)<0|(N|0)==0&M>>>0<8){o=M;p=N;qa=U;while(1){ra=qa<<4;sa=nn(o|0,p|0,1,0)|0;ta=I;if((ta|0)<0|(ta|0)==0&sa>>>0<8){qa=ra;p=ta;o=sa}else{ua=ra;break}}}else{ua=U}do{if(($|32|0)==112){o=bn(b,f)|0;p=I;if(!((o|0)==0&(p|0)==-2147483648)){va=o;wa=p;break}if(u){cn(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)+ -1;va=0;wa=0;break}}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)+ -1;va=0;wa=0}}while(0);p=rn(q|0,n|0,2)|0;o=nn(p|0,I|0,-32,-1)|0;p=nn(o|0,I|0,va|0,wa|0)|0;o=I;if((ua|0)==0){l=+(r|0)*0.0;i=g;return+l}if((o|0)>0|(o|0)==0&p>>>0>(0-k|0)>>>0){qa=mc()|0;c[qa>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}qa=k+ -106|0;ra=((qa|0)<0)<<31>>31;if((o|0)<(ra|0)|(o|0)==(ra|0)&p>>>0<qa>>>0){qa=mc()|0;c[qa>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((ua|0)>-1){qa=p;ra=o;sa=ua;pa=V;while(1){ta=sa<<1;if(!(pa>=.5)){xa=pa;ya=ta}else{xa=pa+-1.0;ya=ta|1}za=pa+xa;ta=nn(qa|0,ra|0,-1,-1)|0;Aa=I;if((ya|0)>-1){qa=ta;ra=Aa;sa=ya;pa=za}else{Ba=ta;Ca=Aa;Da=ya;Ea=za;break}}}else{Ba=p;Ca=o;Da=ua;Ea=V}sa=mn(32,0,k|0,((k|0)<0)<<31>>31|0)|0;ra=nn(Ba|0,Ca|0,sa|0,I|0)|0;sa=I;if(0>(sa|0)|0==(sa|0)&j>>>0>ra>>>0){Fa=(ra|0)<0?0:ra}else{Fa=j}do{if((Fa|0)<53){pa=+(r|0);za=+nc(+(+en(1.0,84-Fa|0)),+pa);if(!((Fa|0)<32&Ea!=0.0)){Ga=pa;Ha=za;Ia=Da;Ja=Ea;break}ra=Da&1;Ga=pa;Ha=za;Ia=(ra^1)+Da|0;Ja=(ra|0)==0?0.0:Ea}else{Ga=+(r|0);Ha=0.0;Ia=Da;Ja=Ea}}while(0);za=Ga*Ja+(Ha+Ga*+(Ia>>>0))-Ha;if(!(za!=0.0)){o=mc()|0;c[o>>2]=34}l=+fn(za,Ba);i=g;return+l}else{G=w}}while(0);o=k+j|0;p=0-o|0;ra=G;sa=0;while(1){if((ra|0)==46){v=139;break}else if((ra|0)!=48){Ka=ra;La=0;Ma=0;Na=sa;Oa=0;break}qa=c[e>>2]|0;if(qa>>>0<(c[m>>2]|0)>>>0){c[e>>2]=qa+1;ra=d[qa]|0;sa=1;continue}else{ra=dn(b)|0;sa=1;continue}}d:do{if((v|0)==139){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Pa=d[ra]|0}else{Pa=dn(b)|0}if((Pa|0)==48){Qa=-1;Ra=-1}else{Ka=Pa;La=0;Ma=0;Na=sa;Oa=1;break}while(1){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Sa=d[ra]|0}else{Sa=dn(b)|0}if((Sa|0)!=48){Ka=Sa;La=Qa;Ma=Ra;Na=1;Oa=1;break d}ra=nn(Qa|0,Ra|0,-1,-1)|0;Qa=ra;Ra=I}}}while(0);sa=h;c[sa>>2]=0;ra=Ka+ -48|0;qa=(Ka|0)==46;e:do{if(ra>>>0<10|qa){n=h+496|0;q=Ka;Aa=qa;ta=ra;Ta=0;Ua=0;Va=La;Wa=Ma;Xa=Na;Ya=Oa;Za=0;_a=0;$a=0;while(1){do{if(Aa){if((Ya|0)==0){ab=Ta;bb=Ua;cb=Ta;db=Ua;eb=Xa;fb=1;gb=Za;hb=_a;ib=$a}else{jb=q;kb=Ta;lb=Ua;mb=Va;nb=Wa;ob=Xa;pb=Za;qb=_a;rb=$a;break e}}else{sb=nn(Ta|0,Ua|0,1,0)|0;tb=I;ub=(q|0)!=48;if((_a|0)>=125){if(!ub){ab=Va;bb=Wa;cb=sb;db=tb;eb=Xa;fb=Ya;gb=Za;hb=_a;ib=$a;break}c[n>>2]=c[n>>2]|1;ab=Va;bb=Wa;cb=sb;db=tb;eb=Xa;fb=Ya;gb=Za;hb=_a;ib=$a;break}vb=h+(_a<<2)|0;if((Za|0)==0){wb=ta}else{wb=q+ -48+((c[vb>>2]|0)*10|0)|0}c[vb>>2]=wb;vb=Za+1|0;xb=(vb|0)==9;ab=Va;bb=Wa;cb=sb;db=tb;eb=1;fb=Ya;gb=xb?0:vb;hb=(xb&1)+_a|0;ib=ub?sb:$a}}while(0);sb=c[e>>2]|0;if(sb>>>0<(c[m>>2]|0)>>>0){c[e>>2]=sb+1;yb=d[sb]|0}else{yb=dn(b)|0}sb=yb+ -48|0;ub=(yb|0)==46;if(sb>>>0<10|ub){q=yb;Aa=ub;ta=sb;Ta=cb;Ua=db;Va=ab;Wa=bb;Xa=eb;Ya=fb;Za=gb;_a=hb;$a=ib}else{Ab=yb;Bb=cb;Cb=db;Db=ab;Eb=bb;Fb=eb;Gb=fb;Hb=gb;Ib=hb;Jb=ib;v=162;break}}}else{Ab=Ka;Bb=0;Cb=0;Db=La;Eb=Ma;Fb=Na;Gb=Oa;Hb=0;Ib=0;Jb=0;v=162}}while(0);if((v|0)==162){ra=(Gb|0)==0;jb=Ab;kb=Bb;lb=Cb;mb=ra?Bb:Db;nb=ra?Cb:Eb;ob=Fb;pb=Hb;qb=Ib;rb=Jb}ra=(ob|0)!=0;do{if(ra){if((jb|32|0)!=101){v=171;break}qa=bn(b,f)|0;$a=I;do{if((qa|0)==0&($a|0)==-2147483648){if(u){cn(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){Kb=0;Lb=0;break}c[e>>2]=(c[e>>2]|0)+ -1;Kb=0;Lb=0;break}}else{Kb=qa;Lb=$a}}while(0);$a=nn(Kb|0,Lb|0,mb|0,nb|0)|0;Mb=$a;Nb=I}else{v=171}}while(0);do{if((v|0)==171){if(!((jb|0)>-1)){Mb=mb;Nb=nb;break}if((c[m>>2]|0)==0){Mb=mb;Nb=nb;break}c[e>>2]=(c[e>>2]|0)+ -1;Mb=mb;Nb=nb}}while(0);if(!ra){u=mc()|0;c[u>>2]=22;cn(b,0);l=0.0;i=g;return+l}u=c[sa>>2]|0;if((u|0)==0){l=+(r|0)*0.0;i=g;return+l}do{if((Mb|0)==(kb|0)&(Nb|0)==(lb|0)&((lb|0)<0|(lb|0)==0&kb>>>0<10)){if(!(j>>>0>30)){if((u>>>j|0)!=0){break}}l=+(r|0)*+(u>>>0);i=g;return+l}}while(0);u=(k|0)/-2|0;ra=((u|0)<0)<<31>>31;if((Nb|0)>(ra|0)|(Nb|0)==(ra|0)&Mb>>>0>u>>>0){u=mc()|0;c[u>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}u=k+ -106|0;ra=((u|0)<0)<<31>>31;if((Nb|0)<(ra|0)|(Nb|0)==(ra|0)&Mb>>>0<u>>>0){u=mc()|0;c[u>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((pb|0)==0){Ob=qb}else{if((pb|0)<9){u=h+(qb<<2)|0;ra=c[u>>2]|0;$a=pb;do{ra=ra*10|0;$a=$a+1|0;}while(($a|0)!=9);c[u>>2]=ra}Ob=qb+1|0}do{if((rb|0)<9){if(!((rb|0)<=(Mb|0)&(Mb|0)<18)){break}if((Mb|0)==9){l=+(r|0)*+((c[sa>>2]|0)>>>0);i=g;return+l}if((Mb|0)<9){l=+(r|0)*+((c[sa>>2]|0)>>>0)/+(c[14088+(8-Mb<<2)>>2]|0);i=g;return+l}$a=j+27+(ea(Mb,-3)|0)|0;qa=c[sa>>2]|0;if(($a|0)<=30){if((qa>>>$a|0)!=0){break}}l=+(r|0)*+(qa>>>0)*+(c[14088+(Mb+ -10<<2)>>2]|0);i=g;return+l}}while(0);sa=(Mb|0)%9|0;if((sa|0)==0){Pb=0;Qb=0;Rb=Mb;Sb=Ob}else{ra=(Mb|0)>-1?sa:sa+9|0;sa=c[14088+(8-ra<<2)>>2]|0;do{if((Ob|0)==0){Tb=0;Ub=Mb;Wb=0}else{u=1e9/(sa|0)|0;qa=0;$a=0;_a=0;Za=Mb;while(1){Ya=h+(_a<<2)|0;Xa=c[Ya>>2]|0;Wa=((Xa>>>0)/(sa>>>0)|0)+$a|0;c[Ya>>2]=Wa;Xb=ea((Xa>>>0)%(sa>>>0)|0,u)|0;Xa=_a+1|0;if((_a|0)==(qa|0)&(Wa|0)==0){Yb=Xa&127;Zb=Za+ -9|0}else{Yb=qa;Zb=Za}if((Xa|0)==(Ob|0)){break}else{qa=Yb;Za=Zb;_a=Xa;$a=Xb}}if((Xb|0)==0){Tb=Yb;Ub=Zb;Wb=Ob;break}c[h+(Ob<<2)>>2]=Xb;Tb=Yb;Ub=Zb;Wb=Ob+1|0}}while(0);Pb=Tb;Qb=0;Rb=9-ra+Ub|0;Sb=Wb}f:while(1){sa=h+(Pb<<2)|0;if((Rb|0)<18){$a=Qb;_a=Sb;while(1){Za=0;qa=_a+127|0;u=_a;while(1){Xa=qa&127;Wa=h+(Xa<<2)|0;Ya=rn(c[Wa>>2]|0,0,29)|0;Va=nn(Ya|0,I|0,Za|0,0)|0;Ya=I;if(Ya>>>0>0|(Ya|0)==0&Va>>>0>1e9){Ua=Bn(Va|0,Ya|0,1e9,0)|0;Ta=Cn(Va|0,Ya|0,1e9,0)|0;_b=Ta;$b=Ua}else{_b=Va;$b=0}c[Wa>>2]=_b;Wa=(Xa|0)==(Pb|0);if((Xa|0)!=(u+127&127|0)|Wa){ac=u}else{ac=(_b|0)==0?Xa:u}if(Wa){break}else{Za=$b;qa=Xa+ -1|0;u=ac}}u=$a+ -29|0;if(($b|0)==0){$a=u;_a=ac}else{bc=u;cc=$b;dc=ac;break}}}else{if((Rb|0)==18){ec=Qb;fc=Sb}else{gc=Pb;hc=Qb;ic=Rb;jc=Sb;break}while(1){if(!((c[sa>>2]|0)>>>0<9007199)){gc=Pb;hc=ec;ic=18;jc=fc;break f}_a=0;$a=fc+127|0;u=fc;while(1){qa=$a&127;Za=h+(qa<<2)|0;Xa=rn(c[Za>>2]|0,0,29)|0;Wa=nn(Xa|0,I|0,_a|0,0)|0;Xa=I;if(Xa>>>0>0|(Xa|0)==0&Wa>>>0>1e9){Va=Bn(Wa|0,Xa|0,1e9,0)|0;Ua=Cn(Wa|0,Xa|0,1e9,0)|0;kc=Ua;lc=Va}else{kc=Wa;lc=0}c[Za>>2]=kc;Za=(qa|0)==(Pb|0);if((qa|0)!=(u+127&127|0)|Za){oc=u}else{oc=(kc|0)==0?qa:u}if(Za){break}else{_a=lc;$a=qa+ -1|0;u=oc}}u=ec+ -29|0;if((lc|0)==0){ec=u;fc=oc}else{bc=u;cc=lc;dc=oc;break}}}sa=Pb+127&127;if((sa|0)==(dc|0)){u=dc+127&127;$a=h+((dc+126&127)<<2)|0;c[$a>>2]=c[$a>>2]|c[h+(u<<2)>>2];pc=u}else{pc=dc}c[h+(sa<<2)>>2]=cc;Pb=sa;Qb=bc;Rb=Rb+9|0;Sb=pc}g:while(1){qc=jc+1&127;ra=h+((jc+127&127)<<2)|0;sa=gc;u=hc;$a=ic;while(1){_a=($a|0)==18;qa=($a|0)>27?9:1;rc=sa;sc=u;while(1){Za=0;while(1){Wa=Za+rc&127;if((Wa|0)==(jc|0)){tc=2;break}Va=c[h+(Wa<<2)>>2]|0;Wa=c[14080+(Za<<2)>>2]|0;if(Va>>>0<Wa>>>0){tc=2;break}Ua=Za+1|0;if(Va>>>0>Wa>>>0){tc=Za;break}if((Ua|0)<2){Za=Ua}else{tc=Ua;break}}if((tc|0)==2&_a){break g}uc=qa+sc|0;if((rc|0)==(jc|0)){rc=jc;sc=uc}else{break}}_a=(1<<qa)+ -1|0;Za=1e9>>>qa;vc=rc;wc=0;Ua=rc;xc=$a;do{Wa=h+(Ua<<2)|0;Va=c[Wa>>2]|0;Xa=(Va>>>qa)+wc|0;c[Wa>>2]=Xa;wc=ea(Va&_a,Za)|0;Va=(Ua|0)==(vc|0)&(Xa|0)==0;Ua=Ua+1&127;xc=Va?xc+ -9|0:xc;vc=Va?Ua:vc;}while((Ua|0)!=(jc|0));if((wc|0)==0){sa=vc;u=uc;$a=xc;continue}if((qc|0)!=(vc|0)){break}c[ra>>2]=c[ra>>2]|1;sa=vc;u=uc;$a=xc}c[h+(jc<<2)>>2]=wc;gc=vc;hc=uc;ic=xc;jc=qc}$a=rc&127;if(($a|0)==(jc|0)){c[h+(qc+ -1<<2)>>2]=0;yc=qc}else{yc=jc}za=+((c[h+($a<<2)>>2]|0)>>>0);$a=rc+1&127;if(($a|0)==(yc|0)){u=yc+1&127;c[h+(u+ -1<<2)>>2]=0;zc=u}else{zc=yc}pa=+(r|0);Ac=pa*(za*1.0e9+ +((c[h+($a<<2)>>2]|0)>>>0));$a=sc+53|0;u=$a-k|0;if((u|0)<(j|0)){Bc=(u|0)<0?0:u;Cc=1}else{Bc=j;Cc=0}if((Bc|0)<53){za=+nc(+(+en(1.0,105-Bc|0)),+Ac);Dc=+zb(+Ac,+(+en(1.0,53-Bc|0)));Ec=za;Fc=Dc;Gc=za+(Ac-Dc)}else{Ec=0.0;Fc=0.0;Gc=Ac}sa=rc+2&127;do{if((sa|0)==(zc|0)){Hc=Fc}else{ra=c[h+(sa<<2)>>2]|0;do{if(ra>>>0<5e8){if((ra|0)==0){if((rc+3&127|0)==(zc|0)){Ic=Fc;break}}Ic=pa*.25+Fc}else{if(ra>>>0>5e8){Ic=pa*.75+Fc;break}if((rc+3&127|0)==(zc|0)){Ic=pa*.5+Fc;break}else{Ic=pa*.75+Fc;break}}}while(0);if((53-Bc|0)<=1){Hc=Ic;break}if(+zb(+Ic,1.0)!=0.0){Hc=Ic;break}Hc=Ic+1.0}}while(0);pa=Gc+Hc-Ec;do{if(($a&2147483647|0)>(-2-o|0)){if(!(+T(+pa)>=9007199254740992.0)){Jc=Cc;Kc=sc;Lc=pa}else{Jc=(Cc|0)!=0&(Bc|0)==(u|0)?0:Cc;Kc=sc+1|0;Lc=pa*.5}if((Kc+50|0)<=(p|0)){if(!((Jc|0)!=0&Hc!=0.0)){Mc=Kc;Nc=Lc;break}}sa=mc()|0;c[sa>>2]=34;Mc=Kc;Nc=Lc}else{Mc=sc;Nc=pa}}while(0);l=+fn(Nc,Mc);i=g;return+l}else{if((c[m>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)+ -1}p=mc()|0;c[p>>2]=22;cn(b,0);l=0.0;i=g;return+l}}}while(0);do{if((v|0)==23){b=(c[m>>2]|0)==0;if(!b){c[e>>2]=(c[e>>2]|0)+ -1}if(t>>>0<4|(f|0)==0|b){break}else{Oc=t}do{c[e>>2]=(c[e>>2]|0)+ -1;Oc=Oc+ -1|0;}while(Oc>>>0>3)}}while(0);l=+(r|0)*y;i=g;return+l}function bn(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=i;f=a+4|0;g=c[f>>2]|0;h=a+100|0;if(g>>>0<(c[h>>2]|0)>>>0){c[f>>2]=g+1;j=d[g]|0}else{j=dn(a)|0}do{if((j|0)==43|(j|0)==45){g=(j|0)==45|0;k=c[f>>2]|0;if(k>>>0<(c[h>>2]|0)>>>0){c[f>>2]=k+1;l=d[k]|0}else{l=dn(a)|0}if((l+ -48|0)>>>0<10|(b|0)==0){m=l;n=g;break}if((c[h>>2]|0)==0){m=l;n=g;break}c[f>>2]=(c[f>>2]|0)+ -1;m=l;n=g}else{m=j;n=0}}while(0);if((m+ -48|0)>>>0>9){if((c[h>>2]|0)==0){o=0;p=-2147483648;I=p;i=e;return o|0}c[f>>2]=(c[f>>2]|0)+ -1;o=0;p=-2147483648;I=p;i=e;return o|0}else{q=m;r=0}while(1){s=q+ -48+r|0;m=c[f>>2]|0;if(m>>>0<(c[h>>2]|0)>>>0){c[f>>2]=m+1;t=d[m]|0}else{t=dn(a)|0}if(!((t+ -48|0)>>>0<10&(s|0)<214748364)){break}q=t;r=s*10|0}r=((s|0)<0)<<31>>31;if((t+ -48|0)>>>0<10){q=s;m=r;j=t;while(1){l=An(q|0,m|0,10,0)|0;b=I;g=nn(j|0,((j|0)<0)<<31>>31|0,-48,-1)|0;k=nn(g|0,I|0,l|0,b|0)|0;b=I;l=c[f>>2]|0;if(l>>>0<(c[h>>2]|0)>>>0){c[f>>2]=l+1;u=d[l]|0}else{u=dn(a)|0}if((u+ -48|0)>>>0<10&((b|0)<21474836|(b|0)==21474836&k>>>0<2061584302)){j=u;m=b;q=k}else{v=k;w=b;x=u;break}}}else{v=s;w=r;x=t}if((x+ -48|0)>>>0<10){do{x=c[f>>2]|0;if(x>>>0<(c[h>>2]|0)>>>0){c[f>>2]=x+1;y=d[x]|0}else{y=dn(a)|0}}while((y+ -48|0)>>>0<10)}if((c[h>>2]|0)!=0){c[f>>2]=(c[f>>2]|0)+ -1}f=(n|0)!=0;n=mn(0,0,v|0,w|0)|0;o=f?n:v;p=f?I:w;I=p;i=e;return o|0}function cn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a+104>>2]=b;e=c[a+8>>2]|0;f=c[a+4>>2]|0;g=e-f|0;c[a+108>>2]=g;if((b|0)!=0&(g|0)>(b|0)){c[a+100>>2]=f+b;i=d;return}else{c[a+100>>2]=e;i=d;return}}function dn(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=b+104|0;g=c[f>>2]|0;if((g|0)==0){h=3}else{if((c[b+108>>2]|0)<(g|0)){h=3}}do{if((h|0)==3){g=hn(b)|0;if((g|0)<0){break}j=c[f>>2]|0;k=c[b+8>>2]|0;do{if((j|0)==0){h=8}else{l=c[b+4>>2]|0;m=j-(c[b+108>>2]|0)+ -1|0;if((k-l|0)<=(m|0)){h=8;break}c[b+100>>2]=l+m}}while(0);if((h|0)==8){c[b+100>>2]=k}j=c[b+4>>2]|0;if((k|0)!=0){m=b+108|0;c[m>>2]=k+1-j+(c[m>>2]|0)}m=j+ -1|0;if((d[m]|0|0)==(g|0)){n=g;i=e;return n|0}a[m]=g;n=g;i=e;return n|0}}while(0);c[b+100>>2]=0;n=-1;i=e;return n|0}function en(a,b){a=+a;b=b|0;var d=0,e=0.0,f=0,g=0,j=0.0;d=i;do{if((b|0)>1023){e=a*8.98846567431158e+307;f=b+ -1023|0;if((f|0)<=1023){g=f;j=e;break}f=b+ -2046|0;g=(f|0)>1023?1023:f;j=e*8.98846567431158e+307}else{if(!((b|0)<-1022)){g=b;j=a;break}e=a*2.2250738585072014e-308;f=b+1022|0;if(!((f|0)<-1022)){g=f;j=e;break}f=b+2044|0;g=(f|0)<-1022?-1022:f;j=e*2.2250738585072014e-308}}while(0);b=rn(g+1023|0,0,52)|0;g=I;c[k>>2]=b;c[k+4>>2]=g;a=j*+h[k>>3];i=d;return+a}function fn(a,b){a=+a;b=b|0;var c=0,d=0.0;c=i;d=+en(a,b);i=c;return+d}function gn(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;e=b+74|0;f=a[e]|0;a[e]=f+255|f;f=b+20|0;e=b+44|0;if((c[f>>2]|0)>>>0>(c[e>>2]|0)>>>0){wc[c[b+36>>2]&31](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[f>>2]=0;f=b;g=c[f>>2]|0;if((g&20|0)==0){h=c[e>>2]|0;c[b+8>>2]=h;c[b+4>>2]=h;j=0;i=d;return j|0}if((g&4|0)==0){j=-1;i=d;return j|0}c[f>>2]=g|32;j=-1;i=d;return j|0}function hn(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+8|0;e=b;if((c[a+8>>2]|0)==0){if((gn(a)|0)==0){f=3}else{g=-1}}else{f=3}do{if((f|0)==3){if((wc[c[a+32>>2]&31](a,e,1)|0)!=1){g=-1;break}g=d[e]|0}}while(0);i=b;return g|0}function jn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0.0,j=0,k=0;d=i;i=i+112|0;e=d;f=e+0|0;g=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;cn(e,0);h=+an(e,2,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if((b|0)==0){i=d;return+h}if((j|0)==0){k=a}else{k=a+j|0}c[b>>2]=k;i=d;return+h}function kn(){c[518]=o;c[544]=o;c[3282]=o;c[3512]=o}function ln(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function mn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(I=e,a-c>>>0|0)|0}function nn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(I=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function on(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Na(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function pn(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{on(b,c,d)|0}return b|0}function qn(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function rn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){I=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}I=a<<c-32;return 0}function sn(i,j,k,l,m,n,o,p){i=i;j=j;k=k;l=l;m=m;n=n;o=o;p=p;a=i;b=j;c=k;d=l;e=m;f=n;g=o;h=p}function tn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){I=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}I=0;return b>>>c-32|0}function un(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){I=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}I=(b|0)<0?-1:0;return b>>c-32|0}function vn(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function wn(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function xn(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ea(d,c)|0;f=a>>>16;a=(e>>>16)+(ea(d,f)|0)|0;d=b>>>16;b=ea(d,c)|0;return(I=(a>>>16)+(ea(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function yn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=mn(e^a,f^b,e,f)|0;b=I;a=g^e;e=h^f;f=mn((Dn(i,b,mn(g^c,h^d,g,h)|0,I,0)|0)^a,I^e,a,e)|0;return(I=I,f)|0}function zn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=mn(h^a,j^b,h,j)|0;b=I;Dn(m,b,mn(k^d,l^e,k,l)|0,I,g)|0;l=mn(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=I;i=f;return(I=j,l)|0}function An(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=xn(e,a)|0;f=I;return(I=(ea(b,a)|0)+(ea(d,e)|0)+f|f&0,c|0|0)|0}function Bn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=Dn(a,b,c,d,0)|0;return(I=I,e)|0}function Cn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;Dn(a,b,d,e,g)|0;i=f;return(I=c[g+4>>2]|0,c[g>>2]|0)|0}function Dn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(I=n,o)|0}else{if(!m){n=0;o=0;return(I=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(I=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(I=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(I=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((wn(l|0)|0)>>>0);return(I=n,o)|0}p=(vn(l|0)|0)-(vn(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(I=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(I=n,o)|0}else{if(!m){r=(vn(l|0)|0)-(vn(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(I=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(I=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(vn(j|0)|0)+33-(vn(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(I=n,o)|0}else{p=wn(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(I=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=nn(g,d,-1,-1)|0;k=I;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;J=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;mn(e,k,j,a)|0;b=I;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=mn(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=I;b=t-1|0;if((b|0)==0){break}else{i=H;w=J;v=M;u=L;t=b;s=K}}B=H;C=J;D=M;E=L;F=0;G=K}K=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|F;o=(K<<1|0>>>31)&-2|G;return(I=n,o)|0}function En(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return wc[a&31](b|0,c|0,d|0)|0}function Fn(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;xc[a&63](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Gn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;yc[a&3](b|0,c|0,d|0,e|0,f|0)}function Hn(a,b){a=a|0;b=b|0;zc[a&127](b|0)}function In(a,b,c){a=a|0;b=b|0;c=c|0;Ac[a&63](b|0,c|0)}function Jn(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;Bc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function Kn(a,b){a=a|0;b=b|0;return Cc[a&63](b|0)|0}function Ln(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;Dc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function Mn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Ec[a&3](b|0,c|0,d|0)}function Nn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;Fc[a&7](b|0,c|0,d|0,e|0,f|0,+g)}function On(a){a=a|0;Gc[a&1]()}function Pn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return Hc[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function Qn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Ic[a&7](b|0,c|0,d|0,e|0)|0}function Rn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;Jc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Sn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Kc[a&15](b|0,c|0,d|0,e|0,f|0,g|0)}function Tn(a,b,c){a=a|0;b=b|0;c=c|0;return Lc[a&15](b|0,c|0)|0}function Un(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Mc[a&15](b|0,c|0,d|0,e|0,f|0)|0}function Vn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Nc[a&7](b|0,c|0,d|0,e|0)}function Wn(a,b,c){a=a|0;b=b|0;c=c|0;fa(0);return 0}function Xn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;fa(1)}function Yn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;fa(2)}function Zn(a){a=a|0;fa(3)}function _n(a,b){a=a|0;b=b|0;fa(4)}function $n(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;fa(5)}function ao(a){a=a|0;fa(6);return 0}function bo(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;fa(7)}function co(a,b,c){a=a|0;b=b|0;c=c|0;fa(8)}function eo(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;fa(9)}function fo(){fa(10)}function go(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;fa(11);return 0}function ho(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;fa(12);return 0}function io(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;fa(13)}function jo(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;fa(14)}function ko(a,b){a=a|0;b=b|0;fa(15);return 0}function lo(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;fa(16);return 0}function mo(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;fa(17)}




// EMSCRIPTEN_END_FUNCS
var wc=[Wn,of,tf,Dd,xf,$e,ef,Rd,jf,pe,qe,fg,kg,Nj,Sj,xk,zk,Ck,ik,nk,pk,sk,Em,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn];var xc=[Xn,ng,pg,rg,tg,vg,xg,zg,Bg,Dg,Fg,Hg,Mg,Og,Qg,Sg,Ug,Wg,Yg,_g,ah,ch,eh,sh,uh,Gh,Ih,Rh,Sh,Th,Uh,Vh,ci,di,ei,fi,gi,Ej,Kj,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn];var yc=[Yn,Lm,Km,Jm];var zc=[Zn,zd,Ad,Gd,Hd,Nd,Od,Ud,Vd,fe,ee,ke,je,me,ve,ue,Ze,Ye,mf,lf,Af,zf,Cf,Bf,Gf,Ff,If,Hf,Lf,Kf,Nf,Mf,Rf,Qf,Tf,Sf,Zf,Yf,Ve,_f,Xf,$f,bg,ag,fk,hg,gg,mg,lg,Lg,Kg,nh,mh,Bh,Ah,Ph,Oh,ai,$h,mi,li,pi,oi,ti,si,Ei,Di,Pi,Oi,_i,Zi,jj,ij,tj,sj,Aj,zj,Gj,Fj,Mj,Lj,Rj,Qj,_j,Zj,vk,uk,Vj,Mk,rl,ql,tl,sl,cg,ek,hk,Ek,Uk,dl,ol,pl,wm,vm,ym,Bm,zm,Am,Cm,Dm,Zm,Ym,yd,gk,$l,lj,Qm,gm,fm,em,dm,cm,bm,Be,Ne,Zn,Zn,Zn,Zn];var Ac=[_n,Bd,Id,Pd,Wd,_e,nf,wi,xi,yi,zi,Bi,Ci,Hi,Ii,Ji,Ki,Mi,Ni,Si,Ti,Ui,Vi,Xi,Yi,bj,cj,dj,ej,gj,hj,Pj,Uj,yl,Al,Cl,zl,Bl,Dl,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n,_n];var Bc=[$n,Wh,hi,$n];var Cc=[ao,Cd,sf,uf,vf,rf,Jd,Kd,Qd,df,ff,gf,cf,Xd,Yd,ge,le,Vf,Qh,El,Gl,Il,Ol,Ql,Kl,Ml,bi,Fl,Hl,Jl,Pl,Rl,Ll,Nl,ui,vi,Ai,Fi,Gi,Li,Qi,Ri,Wi,$i,aj,fj,Qk,Rk,Tk,ul,wl,vl,xl,Ik,Jk,Lk,_k,$k,cl,jl,kl,nl,xm,_m];var Dc=[bo,Bj,Hj,bo];var Ec=[co,oe,Wf,co];var Fc=[eo,vh,yh,Jh,Lh,eo,eo,eo];var Gc=[fo,nd];var Hc=[go,Nk,Ok,Fk,Gk,Vk,Xk,el,gl,go,go,go,go,go,go,go];var Ic=[ho,Bk,jk,kk,lk,rk,ho,ho];var Jc=[io,ni,qi,kj,oj,uj,wj,io];var Kc=[jo,pf,af,oh,ph,th,zh,Ch,Dh,Hh,Mh,Oj,Tj,Om,Nm,Mm];var Lc=[ko,wf,Ed,Ld,yf,hf,Sd,Zd,kf,wk,yk,Ak,mk,ok,qk,ko];var Mc=[lo,dg,ig,Dk,Pk,Sk,tk,Hk,Kk,Zk,al,il,ll,lo,lo,lo];var Nc=[mo,qf,bf,eg,jg,Fm,Gm,Hm];return{_i64Subtract:mn,_free:Qm,_main:od,_realloc:Rm,_i64Add:nn,_memmove:pn,_strlen:qn,_memset:ln,_malloc:Pm,_memcpy:on,_emscripten_replace_memory:sn,_bitshift64Shl:rn,__GLOBAL__I_a:ld,__GLOBAL__I_a698:$d,runPostSets:kn,stackAlloc:Oc,stackSave:Pc,stackRestore:Qc,setThrew:Rc,setTempRet0:Uc,setTempRet1:Vc,setTempRet2:Wc,setTempRet3:Xc,setTempRet4:Yc,setTempRet5:Zc,setTempRet6:_c,setTempRet7:$c,setTempRet8:ad,setTempRet9:bd,dynCall_iiii:En,dynCall_viiiiiii:Fn,dynCall_viiiii:Gn,dynCall_vi:Hn,dynCall_vii:In,dynCall_viiiiiiiii:Jn,dynCall_ii:Kn,dynCall_viiiiiid:Ln,dynCall_viii:Mn,dynCall_viiiiid:Nn,dynCall_v:On,dynCall_iiiiiiiii:Pn,dynCall_iiiii:Qn,dynCall_viiiiiiii:Rn,dynCall_viiiiii:Sn,dynCall_iii:Tn,dynCall_iiiiii:Un,dynCall_viiii:Vn}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiii": invoke_iiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_ii": invoke_ii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viii": invoke_viii, "invoke_viiiiid": invoke_viiiiid, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_fabs": _fabs, "_vsscanf": _vsscanf, "__ZSt9terminatev": __ZSt9terminatev, "___cxa_guard_acquire": ___cxa_guard_acquire, "_sscanf": _sscanf, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___ctype_toupper_loc": ___ctype_toupper_loc, "__addDays": __addDays, "_SDL_GetError": _SDL_GetError, "_sbrk": _sbrk, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_fileno": _fileno, "_fread": _fread, "_write": _write, "__isLeapYear": __isLeapYear, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "___cxa_does_inherit": ___cxa_does_inherit, "__exit": __exit, "___cxa_rethrow": ___cxa_rethrow, "_catclose": _catclose, "_llvm_lifetime_end": _llvm_lifetime_end, "_send": _send, "_SDL_GL_SetAttribute": _SDL_GL_SetAttribute, "___cxa_is_number_type": ___cxa_is_number_type, "_SDL_GetKeyboardState": _SDL_GetKeyboardState, "___cxa_free_exception": ___cxa_free_exception, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_isxdigit_l": _isxdigit_l, "___cxa_guard_release": ___cxa_guard_release, "_strerror_r": _strerror_r, "_glViewport": _glViewport, "___setErrNo": ___setErrNo, "_newlocale": _newlocale, "_isdigit_l": _isdigit_l, "___resumeException": ___resumeException, "_freelocale": _freelocale, "_glEnable": _glEnable, "_sprintf": _sprintf, "_vasprintf": _vasprintf, "_vsnprintf": _vsnprintf, "_strtoull_l": _strtoull_l, "_read": _read, "_SDL_SetVideoMode": _SDL_SetVideoMode, "_fwrite": _fwrite, "_time": _time, "_pthread_mutex_lock": _pthread_mutex_lock, "_catopen": _catopen, "_exit": _exit, "___ctype_b_loc": ___ctype_b_loc, "_fmod": _fmod, "_llvm_invariant_start": _llvm_invariant_start, "___cxa_allocate_exception": ___cxa_allocate_exception, "_strtoll": _strtoll, "_pwrite": _pwrite, "_glClearColor": _glClearColor, "_uselocale": _uselocale, "_SDL_Init": _SDL_Init, "_snprintf": _snprintf, "__scanString": __scanString, "___cxa_end_catch": ___cxa_end_catch, "_SDL_Quit": _SDL_Quit, "_strtoull": _strtoull, "_strftime": _strftime, "_isxdigit": _isxdigit, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_recv": _recv, "_tan": _tan, "_fgetc": _fgetc, "__parseInt64": __parseInt64, "__getFloat": __getFloat, "_abort": _abort, "_isspace": _isspace, "_pthread_cond_wait": _pthread_cond_wait, "_llvm_lifetime_start": _llvm_lifetime_start, "_ungetc": _ungetc, "_fflush": _fflush, "_strftime_l": _strftime_l, "__reallyNegative": __reallyNegative, "_SDL_PollEvent": _SDL_PollEvent, "_catgets": _catgets, "_glClear": _glClear, "_asprintf": _asprintf, "_SDL_PumpEvents": _SDL_PumpEvents, "_strtoll_l": _strtoll_l, "__arraySum": __arraySum, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_pread": _pread, "_mkport": _mkport, "_emscripten_set_main_loop": _emscripten_set_main_loop, "___errno_location": ___errno_location, "_copysign": _copysign, "___cxa_throw": ___cxa_throw, "_glColorMask": _glColorMask, "_SDL_GL_SwapBuffers": _SDL_GL_SwapBuffers, "_isdigit": _isdigit, "_strerror": _strerror, "__formatString": __formatString, "_atexit": _atexit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception, "___dso_handle": ___dso_handle, "_stderr": _stderr, "_stdin": _stdin, "_stdout": _stdout }, buffer);
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _emscripten_replace_memory = Module["_emscripten_replace_memory"] = asm["_emscripten_replace_memory"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var __GLOBAL__I_a698 = Module["__GLOBAL__I_a698"] = asm["__GLOBAL__I_a698"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






