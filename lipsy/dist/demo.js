(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const R = require("ramda");
const parse = require("./parser");
const evaluate = require("./evaluator");

const removeComments = R.replace(/;.*/g, "");
const getElement = document.getElementById.bind(document);
const fetchCode = num => getElement("codebox" + num).value;
const runButtonClicked = R.pipe(fetchCode, removeComments, str => "[" + str + "]", parse, evaluate.bind(null, {}), result => console.log(R.last(result)));

window.onload = function () {
  R.range(1, 9).forEach(function (n) {
    getElement("run" + n).addEventListener("click", runButtonClicked.bind(null, n));
  });
};

},{"./evaluator":2,"./parser":3,"ramda":"ramda"}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

const R = require("ramda");

const symbolTable = {
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
    let start = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
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
  const symTbl = R.merge(symbolTable, symbols);
  return ast.map(evaluate.bind(null, symTbl));
};

const isLambda = R.propEq("type", "lambda");
const isJsFunction = R.compose(R.equals("Function"), R.type);
const isVector = Array.isArray;
const isIdentifier = $ => $.type === "identifier";
const isLazyExp = R.propEq("type", "lazyExp");

function evaluate(symbolTable, ast) {
  const isString = $ => typeof $ === "string";
  const isNumber = $ => typeof $ === "number";
  const isBoolean = $ => typeof $ === "boolean";
  const isList = $ => $.type === "list";
  const isNil = R.equals(null);
  const isShortLambda = $ => $.type === "slambda";

  return R.cond([[isNil, R.always(null)], [isString, R.identity], [isNumber, R.identity], [isBoolean, R.identity], [isLambda, R.identity], [isJsFunction, R.identity], [isShortLambda, compileSLambda.bind(null, symbolTable)], [isList, evalList.bind(null, symbolTable)], [isVector, R.identity], [isIdentifier, id => lookupIdentifier(symbolTable, id.value)], [R.T, throwError.bind(null, "Unable to evaluate", ast)]])(ast);
}

function throwError(msg, arg) {
  console.log(arg);
  throw new Error("Exception: " + msg);
}

function toList(args) {
  const list = args.slice(0);
  return Object.defineProperty(list, "type", { value: "list", enumerable: false });
}

function compileSLambda(symbolTable, args) {
  return compileLambda(symbolTable, [[], toList(args)]);
}

function lookupIdentifier(symbolTable, id) {
  const resolveIfLazy = R.ifElse(isLazyExp, resolveLazyExpression, R.identity);
  return id in symbolTable ? resolveIfLazy(symbolTable[id]) : eval(id);
}

function evalList(symbolTable, list) {
  const fn = R.head(list);
  const args = R.tail(list);
  const isDefinition = $ => $.value === "def";
  const isConditional = $ => $.value === "if";
  const isLambdaDefinition = $ => $.value === "fn";

  return R.cond([[isConditional, evalConditional.bind(null, symbolTable, args)], [isDefinition, registerDefinition.bind(null, symbolTable, args)], [isLambdaDefinition, compileLambda.bind(null, symbolTable, args)], [R.T, invokeFunction.bind(null, symbolTable, fn, args)]])(fn);
}

function compileLambda(symbolTable, args) {
  const params = R.head(args);
  const body = R.tail(args);
  return {
    type: "lambda",
    params: params,
    body: body,
    arity: params.length,
    symbolTable
  };
}

function evalConditional(symbolTable, args) {
  const ev = evaluate.bind(null, symbolTable);
  const condition = ev(R.nth(0, args));
  const then = R.nth(1, args);
  const otherwise = args.length > 2 ? R.nth(2, args) : null;
  return condition ? ev(then) : ev(otherwise);
}

function registerDefinition(symbolTable, args) {
  const name = R.head(args).value;
  const lazyExp = createLazyExpression(symbolTable, R.last(args));
  symbolTable[name] = lazyExp;
}

function createLazyExpression(symbolTable, ast) {
  return { symbolTable, ast, resolved: false, value: null, type: "lazyExp" };
}

function resolveLazyExpression(expression) {
  const isResolved = R.propEq("resolved", true);
  const getValue = R.path(["value"]);
  const resolveAndGetValue = exp => {
    const value = evaluate(expression.symbolTable, expression.ast);
    exp.value = isLazyExp(value) ? resolveLazyExpression(value) : value;
    exp.resolved = true;
    return value;
  };
  return R.ifElse(isResolved, getValue, resolveAndGetValue)(expression);
}

function invokeFunction(symbolTable, fn, args) {
  const fun = evaluate(symbolTable, fn);
  const evaledArgs = () => args.map(evaluate.bind(null, symbolTable));
  const inSymbolTable = value => R.contains(value, R.values(symbolTable));
  const notInSymbolTable = R.complement(inSymbolTable);
  const isPureJSFunction = R.both(notInSymbolTable, isJsFunction);

  return R.cond([[isLambda, () => executeLambda(symbolTable, fun, args)], [isPureJSFunction, () => fun.apply(undefined, _toConsumableArray(evaledArgs()))], [isJsFunction, () => fun.apply(null, [symbolTable].concat(evaledArgs()))], [R.T, () => new Error("Error in invokeFunction")]])(fun);
}

function executeLambda(symbolTable, fn, args) {
  const createLaxyExp = _ref => {
    var _ref2 = _slicedToArray(_ref, 2);

    let name = _ref2[0];
    let value = _ref2[1];
    return [name, createLazyExpression(symbolTable, value)];
  };
  const namedBindings = destructure(fn.params, args).map(createLaxyExp);
  const positionalParamNames = R.range(0, args.length).map(R.inc).map(R.concat("%"));
  const positionalBindings = R.zip(positionalParamNames, args);
  const allBindings = [["%", R.head(args)], ["%&", args]].concat(positionalBindings).concat(namedBindings);
  const newSymbolTable = R.mergeAll([fn.symbolTable, symbolTable, R.fromPairs(allBindings)]);
  return R.last(fn.body.map(evaluate.bind(null, newSymbolTable)));
}

function destructure(name, value) {
  return R.cond([[isVector, destructureVector], [isIdentifier, destructureIdentifier], [R.T, () => new Error("Unable to destructure")]])(name, value);
}

function destructureIdentifier(identifer, value) {
  return [[identifer.value, value]];
}

function destructureVector(names, values) {
  const isRestArg = R.compose(R.propEq("value", "&"), R.head);
  const isEmpty = (names, values) => R.isEmpty(names) || R.isEmpty(values);
  const destructureAndCollect = (names, values) => {
    const first = destructure(R.head(names), R.head(values));
    const rest = destructureVector(R.tail(names), R.tail(values));
    return first.concat(rest);
  };
  const collectRestArg = (names, values) => destructure(R.nth(1, names), values);

  return R.cond([[isEmpty, () => []], [isRestArg, collectRestArg], [R.T, destructureAndCollect]])(names, values);
}

},{"ramda":"ramda"}],3:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

const R = require("ramda");

module.exports = parse;

const startsWith = R.curry((needle, stack) => stack.startsWith(needle));
const startsWithRoundBracket = startsWith("(");
const startsWithDoubleQuote = startsWith("\"");
const startsWithCurlyBrace = startsWith("{");
const startsWithSquareBracket = startsWith("[");
const startsWithHashRoundBracket = startsWith("#(");

function parse(str) {
  const str1 = dropSpaces(str);
  const isBoolean = $ => $ === "true" || $ === "false";
  const startsWithColon = startsWith(":");
  const startsWithHashBracket = startsWith("#{");
  const startsWithHashDoubleQuote = startsWith("#\"");
  const isNil = R.equals("nil");

  return R.cond([[startsWithRoundBracket, parseList], [isNumber, parseNumber], [startsWithDoubleQuote, parseString], [startsWithCurlyBrace, parseMap], [isBoolean, parseBoolean], [startsWithHashBracket, parseSet], [startsWithColon, parseSymbol], [startsWithSquareBracket, parseVector], [startsWithHashDoubleQuote, parseRegEx], [startsWithHashRoundBracket, parseShortLambda], [isNil, R.always(null)], [R.T, parseIdentifier]])(str1);
}

const splitAfterMatchingBracket = R.curry(function (openBracket, closeBracket, str) {
  function throwError() {
    throw new Error("Unbalanced brackets");
  }

  function split(left, right, bracketCount) {
    const h = R.head(right);
    return R.cond([[() => bracketCount === 0, () => [left, right]], [() => isEmptyString(right), throwError], [() => h === openBracket, () => split(left + h, R.tail(right), bracketCount + 1)], [() => h === closeBracket, () => split(left + h, R.tail(right), bracketCount - 1)], [R.T, () => split(left + h, R.tail(right), bracketCount)]])();
  }

  return split(R.head(str), R.tail(str), 1);
});

function parseShortLambda(str) {
  const list = parseListBody(stripBrackets(R.tail(str)));
  return Object.defineProperty(list, "type", { value: "slambda", enumerable: false });
}

function parseRegEx(str) {
  const body = stripBrackets(R.tail(str));
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

  const elem = _splitAfterNextToken2[0];
  const rest = _splitAfterNextToken2[1];

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

  const key = _splitAfterNextToken4[0];
  const rest1 = _splitAfterNextToken4[1];

  var _splitAfterNextToken5 = splitAfterNextToken(rest1);

  var _splitAfterNextToken6 = _slicedToArray(_splitAfterNextToken5, 2);

  const value = _splitAfterNextToken6[0];
  const rest2 = _splitAfterNextToken6[1];

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
  const list = parseListBody(stripBrackets(str));
  return Object.defineProperty(list, "type", { value: "list", enumerable: false });
}

function parseVector(str) {
  const vector = parseListBody(stripBrackets(str));
  return Object.defineProperty(vector, "type", { value: "vector", enumerable: false });
}

function stripBrackets(str) {
  return R.dropLast(1, R.tail(str));
}

function splitAfterNextToken(str) {
  const str1 = dropSpaces(str);
  const dropHeadAndAppendSplit = R.curry((openB, closeB, str) => {
    const h = R.head(str);

    var _splitAfterMatchingBr = splitAfterMatchingBracket(openB, closeB, R.drop(1, str));

    var _splitAfterMatchingBr2 = _slicedToArray(_splitAfterMatchingBr, 2);

    const left = _splitAfterMatchingBr2[0];
    const right = _splitAfterMatchingBr2[1];

    return [h + left, right];
  });

  return R.cond([[startsWithRoundBracket, splitAfterMatchingBracket("(", ")")], [startsWithCurlyBrace, splitAfterMatchingBracket("{", "}")], [startsWithSquareBracket, splitAfterMatchingBracket("[", "]")], [startsWithDoubleQuote, splitAfterQuoteEnd], [startsWithHashRoundBracket, dropHeadAndAppendSplit("(", ")")], [R.T, splitOnNextSpace]])(str1);
}

function splitAfterQuoteEnd(str) {
  function split(left, right) {
    const curr = R.head(right);
    const prev = R.last(left);
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

  const elem = _splitAfterNextToken8[0];
  const rest = _splitAfterNextToken8[1];

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
  const index = str.indexOf(" ");

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
