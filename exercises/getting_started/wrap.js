'use strict';

function wrap(ctx) {
  /* eslint-disable new-cap, no-extend-native, no-param-reassign, no-native-reassign, no-undef */
  var p;
  var savedPrototype;

  function isInUserCode(stack) {
    return stack[0].getFileName().substring(0, ctx.mainProgram.length)
      === ctx.mainProgram;
  }

  ctx.usedPromise = false;
  ctx.usedFulfill = false;

  require('es6-promise');
  p = Promise;

  Promise = function Promise(func) {
    var stack = ctx.$captureStack(Promise);
    var inUserCode = isInUserCode(stack);
    var transformedFunc = function (fulfill, reject) {
      func(function (value) {
        ctx.usedFulfill = ctx.usedFulfill || inUserCode;
        fulfill(value);
      }, reject);
    };

    ctx.usedPromise = ctx.usedPromise || inUserCode;

    if (this instanceof Promise) {
      return new p(transformedFunc);
    }

    return p(transformedFunc);
  };

  savedPrototype = {
    then: p.prototype.then,
  };

  Promise.prototype = p.prototype;
  ctx.usedPrototypeThen = false;
  ctx.usedPrototypeThenAfterFulfill = false;

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var stack = ctx.$captureStack(Promise.prototype.then);
    var inUserCode = isInUserCode(stack);

    ctx.usedPrototypeThen = ctx.usedPrototypeThen || inUserCode;
    ctx.usedPrototypeThenAfterFulfill = ctx.usedPrototypeThenAfterFulfill ||
      inUserCode && ctx.usedFulfill;

    return savedPrototype.then.apply(this, arguments);
  };
  /* eslint-enable new-cap, no-extend-native, no-param-reassign, no-undef */
}

wrap.wrapSubmission = true;
wrap.wrapSolution = true;

module.exports = wrap;