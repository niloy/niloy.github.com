(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var R = require("ramda");
var parse = require("./parser");
var evaluate = require("./evaluator");

var removeComments = R.replace(/;.*/g, "");
var getElement = document.getElementById.bind(document);
var fetchCode = num => getElement("codebox" + num).value;
var runButtonClicked = R.pipe(fetchCode, removeComments, str => "[" + str + "]", parse, evaluate.bind(null, {}), result => console.log(R.last(result)));

window.onload = function () {
  R.range(1, 9).forEach(function (n) {
    getElement("run" + n).addEventListener("click", runButtonClicked.bind(null, n));
  });
};

},{"./evaluator":2,"./parser":3,"ramda":"ramda"}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var R = require("ramda");

var symbolTable = {
  "print": function (_) {
    var _console;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return (_console = console).log.apply(_console, args);
  },
  "println": function (_) {
    var _console2;

    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return (_console2 = console).log.apply(_console2, args);
  },
  "+": function (_) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    return args.reduce(R.add);
  },
  "-": function (_) {
    for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    return args.reduce(R.subtract);
  },
  "*": function (_) {
    for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      args[_key5 - 1] = arguments[_key5];
    }

    return args.reduce(R.multiply);
  },
  "/": function (_) {
    for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      args[_key6 - 1] = arguments[_key6];
    }

    return args.reduce(R.divide);
  },
  "=": function (_) {
    for (var _len7 = arguments.length, args = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
      args[_key7 - 1] = arguments[_key7];
    }

    return args.reduce(Object.is);
  },
  "mod": (_, x, y) => R.mathMod(x, y),
  "inc": (_, x) => R.inc(x),
  "dec": (_, x) => R.dec(x),
  "map": (symTbl, fn, list) => R.map($ => invokeFunction(symTbl, fn, [$]), list),
  "filter": (symTbl, fn, list) => R.filter($ => invokeFunction(symTbl, fn, [$]), list),
  "reduce": (symTbl, fn, seed, list) => R.reduce((a, b) => invokeFunction(symTbl, fn, [a, b]), seed, list),
  "range": function (_, stop) {
    var start = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    return R.range(start, stop);
  },
  "count": (_, x) => R.length(x),
  "first": (_, x) => x[0],
  "last": (_, x) => R.last(x),
  "rest": (_, x) => R.tail(x),
  "even?": (_, x) => x % 2 === 0,
  "zero?": (_, x) => x === 0,
  "nth": (_, x, seq) => R.nth(x, seq),
  "int": (_, x) => parseInt(x, 10),
  "second": (_, x) => evaluate(_, x[1]),
  "cons": (_, ele, seq) => [ele].concat(seq)
};

module.exports = function (symbols, ast) {
  var symTbl = R.merge(symbolTable, symbols);
  return ast.map(evaluate.bind(null, symTbl));
};

var isLambda = R.propEq("type", "lambda");
var isJsFunction = R.compose(R.equals("Function"), R.type);
var isVector = Array.isArray;
var isIdentifier = $ => $.type === "identifier";
var isLazyExp = R.propEq("type", "lazyExp");

function evaluate(symbolTable, ast) {
  var isString = $ => typeof $ === "string";
  var isNumber = $ => typeof $ === "number";
  var isBoolean = $ => typeof $ === "boolean";
  var isList = $ => $.type === "list";
  var isNil = R.equals(null);
  var isShortLambda = $ => $.type === "slambda";

  return R.cond([[isNil, R.always(null)], [isString, R.identity], [isNumber, R.identity], [isBoolean, R.identity], [isLambda, R.identity], [isJsFunction, R.identity], [isShortLambda, compileSLambda.bind(null, symbolTable)], [isList, evalList.bind(null, symbolTable)], [isVector, R.identity], [isIdentifier, id => lookupIdentifier(symbolTable, id.value)], [R.T, throwError.bind(null, "Unable to evaluate", ast)]])(ast);
}

function throwError(msg, arg) {
  console.log(arg);
  throw new Error("Exception: " + msg);
}

function toList(args) {
  var list = args.slice(0);
  return Object.defineProperty(list, "type", { value: "list", enumerable: false });
}

function compileSLambda(symbolTable, args) {
  return compileLambda(symbolTable, [[], toList(args)]);
}

function lookupIdentifier(symbolTable, id) {
  var resolveIfLazy = R.ifElse(isLazyExp, resolveLazyExpression, R.identity);
  return id in symbolTable ? resolveIfLazy(symbolTable[id]) : eval(id);
}

function evalList(symbolTable, list) {
  var fn = R.head(list);
  var args = R.tail(list);
  var isDefinition = $ => $.value === "def";
  var isConditional = $ => $.value === "if";
  var isLambdaDefinition = $ => $.value === "fn";

  return R.cond([[isConditional, evalConditional.bind(null, symbolTable, args)], [isDefinition, registerDefinition.bind(null, symbolTable, args)], [isLambdaDefinition, compileLambda.bind(null, symbolTable, args)], [R.T, invokeFunction.bind(null, symbolTable, fn, args)]])(fn);
}

function compileLambda(symbolTable, args) {
  var params = R.head(args);
  var body = R.tail(args);
  return {
    type: "lambda",
    params: params,
    body: body,
    arity: params.length,
    symbolTable
  };
}

function evalConditional(symbolTable, args) {
  var ev = evaluate.bind(null, symbolTable);
  var condition = ev(R.nth(0, args));
  var then = R.nth(1, args);
  var otherwise = args.length > 2 ? R.nth(2, args) : null;
  return condition ? ev(then) : ev(otherwise);
}

function registerDefinition(symbolTable, args) {
  var name = R.head(args).value;
  var lazyExp = createLazyExpression(symbolTable, R.last(args));
  symbolTable[name] = lazyExp;
}

function createLazyExpression(symbolTable, ast) {
  return { symbolTable, ast, resolved: false, value: null, type: "lazyExp" };
}

function resolveLazyExpression(expression) {
  var isResolved = R.propEq("resolved", true);
  var getValue = R.path(["value"]);
  var resolveAndGetValue = exp => {
    var value = evaluate(expression.symbolTable, expression.ast);
    exp.value = isLazyExp(value) ? resolveLazyExpression(value) : value;
    exp.resolved = true;
    return value;
  };
  return R.ifElse(isResolved, getValue, resolveAndGetValue)(expression);
}

function invokeFunction(symbolTable, fn, args) {
  var fun = evaluate(symbolTable, fn);
  var evaledArgs = () => args.map(evaluate.bind(null, symbolTable));
  var inSymbolTable = value => R.contains(value, R.values(symbolTable));
  var notInSymbolTable = R.complement(inSymbolTable);
  var isPureJSFunction = R.both(notInSymbolTable, isJsFunction);

  return R.cond([[isLambda, () => executeLambda(symbolTable, fun, args)], [isPureJSFunction, () => fun.apply(undefined, _toConsumableArray(evaledArgs()))], [isJsFunction, () => fun.apply(null, [symbolTable].concat(evaledArgs()))], [R.T, () => new Error("Error in invokeFunction")]])(fun);
}

function executeLambda(symbolTable, fn, args) {
  var createLaxyExp = _ref => {
    var _ref2 = _slicedToArray(_ref, 2);

    var name = _ref2[0];
    var value = _ref2[1];
    return [name, createLazyExpression(symbolTable, value)];
  };
  var namedBindings = destructure(fn.params, args).map(createLaxyExp);
  var positionalParamNames = R.range(0, args.length).map(R.inc).map(R.concat("%"));
  var positionalBindings = R.zip(positionalParamNames, args);
  var allBindings = [["%", R.head(args)], ["%&", args]].concat(positionalBindings).concat(namedBindings);
  var newSymbolTable = R.mergeAll([fn.symbolTable, symbolTable, R.fromPairs(allBindings)]);
  return R.last(fn.body.map(evaluate.bind(null, newSymbolTable)));
}

function destructure(name, value) {
  return R.cond([[isVector, destructureVector], [isIdentifier, destructureIdentifier], [R.T, () => new Error("Unable to destructure")]])(name, value);
}

function destructureIdentifier(identifer, value) {
  return [[identifer.value, value]];
}

function destructureVector(names, values) {
  var isRestArg = R.compose(R.propEq("value", "&"), R.head);
  var isEmpty = (names, values) => R.isEmpty(names) || R.isEmpty(values);
  var destructureAndCollect = (names, values) => {
    var first = destructure(R.head(names), R.head(values));
    var rest = destructureVector(R.tail(names), R.tail(values));
    return first.concat(rest);
  };
  var collectRestArg = (names, values) => destructure(R.nth(1, names), values);

  return R.cond([[isEmpty, () => []], [isRestArg, collectRestArg], [R.T, destructureAndCollect]])(names, values);
}

},{"ramda":"ramda"}],3:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var R = require("ramda");

module.exports = parse;

var startsWith = R.curry((needle, stack) => stack.startsWith(needle));
var startsWithRoundBracket = startsWith("(");
var startsWithDoubleQuote = startsWith("\"");
var startsWithCurlyBrace = startsWith("{");
var startsWithSquareBracket = startsWith("[");
var startsWithHashRoundBracket = startsWith("#(");

function parse(str) {
  var str1 = dropSpaces(str);
  var isBoolean = $ => $ === "true" || $ === "false";
  var startsWithColon = startsWith(":");
  var startsWithHashBracket = startsWith("#{");
  var startsWithHashDoubleQuote = startsWith("#\"");
  var isNil = R.equals("nil");

  return R.cond([[startsWithRoundBracket, parseList], [isNumber, parseNumber], [startsWithDoubleQuote, parseString], [startsWithCurlyBrace, parseMap], [isBoolean, parseBoolean], [startsWithHashBracket, parseSet], [startsWithColon, parseSymbol], [startsWithSquareBracket, parseVector], [startsWithHashDoubleQuote, parseRegEx], [startsWithHashRoundBracket, parseShortLambda], [isNil, R.always(null)], [R.T, parseIdentifier]])(str1);
}

var splitAfterMatchingBracket = R.curry(function (openBracket, closeBracket, str) {
  function throwError() {
    throw new Error("Unbalanced brackets");
  }

  function split(left, right, bracketCount) {
    var h = R.head(right);
    return R.cond([[() => bracketCount === 0, () => [left, right]], [() => isEmptyString(right), throwError], [() => h === openBracket, () => split(left + h, R.tail(right), bracketCount + 1)], [() => h === closeBracket, () => split(left + h, R.tail(right), bracketCount - 1)], [R.T, () => split(left + h, R.tail(right), bracketCount)]])();
  }

  return split(R.head(str), R.tail(str), 1);
});

function parseShortLambda(str) {
  var list = parseListBody(stripBrackets(R.tail(str)));
  return Object.defineProperty(list, "type", { value: "slambda", enumerable: false });
}

function parseRegEx(str) {
  var body = stripBrackets(R.tail(str));
  return new RegExp(body);
}

function parseSymbol(str) {
  return { type: "symbol", value: R.tail(str) };
}

function parseIdentifier(str) {
  return { type: "identifier", value: str };
}

function parseSet(str) {
  return parseSetBody(stripBrackets(R.tail(str)));
}

function parseSetBody(str) {
  if (isEmptyString(str)) {
    return new Set();
  }

  var _splitAfterNextToken = splitAfterNextToken(str);

  var _splitAfterNextToken2 = _slicedToArray(_splitAfterNextToken, 2);

  var elem = _splitAfterNextToken2[0];
  var rest = _splitAfterNextToken2[1];

  return parseSetBody(rest).add(parse(elem));
}

function parseBoolean(str) {
  return str === "true" ? true : false;
}

function parseMap(str) {
  return parseMapBody(stripBrackets(str));
}

function parseMapBody(str) {
  if (isEmptyString(str)) {
    return new Map();
  }

  var _splitAfterNextToken3 = splitAfterNextToken(str);

  var _splitAfterNextToken4 = _slicedToArray(_splitAfterNextToken3, 2);

  var key = _splitAfterNextToken4[0];
  var rest1 = _splitAfterNextToken4[1];

  var _splitAfterNextToken5 = splitAfterNextToken(rest1);

  var _splitAfterNextToken6 = _slicedToArray(_splitAfterNextToken5, 2);

  var value = _splitAfterNextToken6[0];
  var rest2 = _splitAfterNextToken6[1];

  return setMap(parseMapBody(rest2), parse(key), parse(value));
}

function setMap(map, key, value) {
  map.set(key, value);
  return map;
}

function parseString(str) {
  return stripBrackets(str);
}

function parseList(str) {
  var list = parseListBody(stripBrackets(str));
  return Object.defineProperty(list, "type", { value: "list", enumerable: false });
}

function parseVector(str) {
  var vector = parseListBody(stripBrackets(str));
  return Object.defineProperty(vector, "type", { value: "vector", enumerable: false });
}

function stripBrackets(str) {
  return R.dropLast(1, R.tail(str));
}

function splitAfterNextToken(str) {
  var str1 = dropSpaces(str);
  var dropHeadAndAppendSplit = R.curry((openB, closeB, str) => {
    var h = R.head(str);

    var _splitAfterMatchingBr = splitAfterMatchingBracket(openB, closeB, R.drop(1, str));

    var _splitAfterMatchingBr2 = _slicedToArray(_splitAfterMatchingBr, 2);

    var left = _splitAfterMatchingBr2[0];
    var right = _splitAfterMatchingBr2[1];

    return [h + left, right];
  });

  return R.cond([[startsWithRoundBracket, splitAfterMatchingBracket("(", ")")], [startsWithCurlyBrace, splitAfterMatchingBracket("{", "}")], [startsWithSquareBracket, splitAfterMatchingBracket("[", "]")], [startsWithDoubleQuote, splitAfterQuoteEnd], [startsWithHashRoundBracket, dropHeadAndAppendSplit("(", ")")], [R.T, splitOnNextSpace]])(str1);
}

function splitAfterQuoteEnd(str) {
  function split(left, right) {
    var curr = R.head(right);
    var prev = R.last(left);
    return R.cond([[() => curr === `"` && prev !== "\\", () => [left + curr, R.tail(right)]], [R.T, () => split(left + curr, R.tail(right))]])();
  }

  return split(R.head(str), R.tail(str));
}

function parseListBody(str) {
  if (isEmptyString(str)) {
    return [];
  }

  var _splitAfterNextToken7 = splitAfterNextToken(str);

  var _splitAfterNextToken8 = _slicedToArray(_splitAfterNextToken7, 2);

  var elem = _splitAfterNextToken8[0];
  var rest = _splitAfterNextToken8[1];

  return [parse(elem)].concat(parseListBody(rest));
}

function dropSpaces(str) {
  return str.trim();
}

function isEmptyString(str) {
  return str.trim().length === 0;
}

function splitAt(at, str) {
  return [R.slice(0, at, str), R.slice(at, str.length, str)];
}

function splitOnNextSpace(str) {
  var index = str.indexOf(" ");

  if (index !== -1) {
    return splitAt(index, str);
  } else {
    return [str, ""];
  }
}

function isNumber(str) {
  return (/^-?\d/.test(str)
  );
}

function parseNumber(str) {
  return parseFloat(str);
}

},{"ramda":"ramda"}]},{},[1]);
