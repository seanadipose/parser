/// <reference lib="webworker" />

addEventListener('message', ({ data: code }) => {
  if (typeof code !== 'string' || code.match(/.*[a-zA-Z]+.*/g)) {
    postMessage(
      'Error! Cannot evaluate complex expressions yet. Please try again later'
    );
  } else {
    postMessage(evaluate(convert(code)));
  }
});

function evaluate(postfix: any) {
  var resultStack = new Stack<any>();
  postfix = clean(postfix.trim().split(' '));
  postfix.forEach(function (op: string) {
    if (!isNaN(parseFloat(op))) {
      resultStack.push(op);
    } else {
      var val1 = resultStack.pop();
      var val2 = resultStack.pop();
      var parseMethodA = getParseMethod(val1);
      var parseMethodB = getParseMethod(val2);

      if (op === '+') {
        resultStack.push(parseMethodA(val1) + parseMethodB(val2));
      } else if (op === '-') {
        resultStack.push(parseMethodB(val2) - parseMethodA(val1));
      } else if (op === '*') {
        resultStack.push(parseMethodA(val1) * parseMethodB(val2));
      } else if (op === '/') {
        resultStack.push(parseMethodB(val2) / parseMethodA(val1));
      } else if (op === '^') {
        resultStack.push(Math.pow(parseMethodB(val2), parseMethodA(val1)));
      }
    }
  });

  if (resultStack.size() > 1) {
    return 'error';
  } else {
    return resultStack.pop();
  }
}

function isBalanced(postfix: string[]) {
  var count = 0;
  postfix.forEach(function (op) {
    if (op === ')') {
      count++;
    } else if (op === '(') {
      count--;
    }
  });

  return count === 0;
}

function getParseMethod(num: number) {
  return num % 1 === 0 ? parseInt : parseFloat;
}

function convert(expr: any) {
  var postfix = '';
  var ops = new Stack<string>();
  var operators: {
    [key: string]: { priority: number; associativity: string };
  } = {
    '^': {
      priority: 4,
      associativity: 'rtl',
    },
    '*': {
      priority: 3,
      associativity: 'ltr',
    },
    '/': {
      priority: 3,
      associativity: 'ltr',
    },
    '+': {
      priority: 2,
      associativity: 'ltr',
    },
    '-': {
      priority: 2,
      associativity: 'ltr',
    },
  };

  expr = clean(
    expr
      .trim()
      .replace(/\s+/g, '')
      .split(/([\+\-\*\/\^\(\)])/)
  );

  if (!isBalanced(expr)) {
    return 'error';
  }

  expr.forEach(function (exp: any) {
    if (!isNaN(parseFloat(exp))) {
      postfix += exp + ' ';
    } else if (exp === '(') {
      ops.push(exp);
    } else if (exp === ')') {
      while (ops.peek() !== '(') {
        postfix += ops.pop() + ' ';
      }
      ops.pop();
    } else if ('*^+-/'.indexOf(exp) !== -1) {
      var currOp = exp;
      var prevOp = ops.peek() || '';
      while (
        '*^+-/'.indexOf(prevOp) !== -1 &&
        ((operators[currOp].associativity === 'ltr' &&
          operators[currOp].priority <= operators[prevOp]?.priority) ||
          (operators[currOp].associativity === 'rtl' &&
            operators[currOp].priority < operators[prevOp]?.priority))
      ) {
        postfix += ops.pop() + ' ';
        prevOp = ops.peek() || '';
      }
      ops.push(currOp);
    }
  });

  while (ops.size() > 0) {
    postfix += ops.pop() + ' ';
  }
  return postfix;
}

function clean(arr: string[]) {
  return arr.filter(function (a) {
    return a !== '';
  });
}

export class Stack<T> {
  private wmkey = {};
  private items = new WeakMap<typeof this.wmkey, T[]>();

  constructor() {
    this.items.set(this.wmkey, []);
  }

  push(element: T) {
    let stack = this.items.get(this.wmkey);
    stack && stack.push(element);
  }

  pop() {
    let stack = this.items.get(this.wmkey);
    return stack && stack.pop();
  }

  peek() {
    let stack = this.items.get(this.wmkey);
    return stack && stack[stack.length - 1];
  }

  clear() {
    this.items.set(this.wmkey, []);
  }

  size() {
    return this.items.get(this.wmkey)?.length || 0;
  }
}
