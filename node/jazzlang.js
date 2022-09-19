const fs = require("fs");

function Jazzlang(size = 32768) {
  this.memory = new Array(size).fill(0);
  this.code = [];
  this.ptr = 0;
  this.pc = 0;
  this.jumpTo = {};
}

Jazzlang.prototype.load = function (code) {
  const rawCode = code
    .split("재즈가 뭐라고 생각하세요?")[1]
    .split("이거야")[0]
    .split("");
  let read = 0;

  while (read < rawCode.length) {
    if (rawCode[read] === "샤") {
      if (rawCode[read + 1] === "빱") {
        this.code.push(">");
        read += 2;
      } else if (rawCode[read + 1] === "바" && rawCode[read + 2] === "다") {
        this.code.push(",");
        read += 3;
      }
    } else if (rawCode[read] === "사" && rawCode[read + 1] === "바") {
      this.code.push("<");
      read += 2;
    } else if (rawCode[read] === "두") {
      if (rawCode[read + 1] === "비") {
        this.code.push("+");
        read += 2;
      } else if (rawCode[read + 1] === "밥") {
        this.code.push("-");
        read += 2;
      } else if (rawCode[read + 1] === "붸" && rawCode[read + 2] === "둡") {
        this.code.push(".");
        read += 3;
      } else if (rawCode[read + 1] === "봐") {
        this.code.push("]");
        read += 2;
      }
    } else if (rawCode[read] === "뚜" && rawCode[read + 1] === "비") {
      this.code.push("[");
      read += 2;
    } else {
      read += 1;
    }
  }
};

Jazzlang.prototype.preprocess = function () {
  // 점프 위치 기록
  const stack = [];
  for (let i = 0; i < this.code.length; i += 1) {
    const command = this.code[i];
    if (command === "[") {
      stack.push(i);
    } else if (command === "]") {
      if (stack.length === 0) throw new Error("Syntax error");

      this.jumpTo[i] = stack.pop();
      this.jumpTo[this.jumpTo[i]] = i;
    }
  }

  if (stack.length > 0) throw new Error("Syntax error");
};

Jazzlang.prototype.increasePtr = function () {
  if (this.ptr >= this.memory.length - 1) throw new Error("Out of memory");
  this.ptr += 1;
};

Jazzlang.prototype.decreasePtr = function () {
  if (this.ptr <= 0) throw new Error("Out of memory");
  this.ptr -= 1;
};

Jazzlang.prototype.increaseValue = function () {
  this.memory[this.ptr] += 1;
};

Jazzlang.prototype.decreaseValue = function () {
  this.memory[this.ptr] -= 1;
};

Jazzlang.prototype.printValue = function () {
  process.stdout.write(String.fromCharCode(this.memory[this.ptr]));
};

Jazzlang.prototype.storingValue = function () {
  let buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, 0, 1);
  this.memory[this.ptr] = buffer.toString("utf8").charCodeAt(0);
};

Jazzlang.prototype.jump = function (command) {
  if (command === "[" && this.memory[this.ptr] === 0) {
    this.pc = this.jumpTo[this.pc];
  } else if (command === "]" && this.memory[this.ptr] !== 0) {
    this.pc = this.jumpTo[this.pc];
  }
};

Jazzlang.prototype.run = function () {
  this.preprocess();

  while (this.pc < this.code.length) {
    const command = this.code[this.pc];

    if (command === ">") this.increasePtr();
    else if (command === "<") this.decreasePtr();
    else if (command === "+") this.increaseValue();
    else if (command === "-") this.decreaseValue();
    else if (command === ".") this.printValue();
    else if (command === ",") this.storingValue();
    else if (command === "[" || command === "]") this.jump(command);

    this.pc += 1;
  }
};

fs.readFile(process.argv[2], function (err, data) {
  if (err) throw new Error(err.message);
  const jazz = new Jazzlang();
  jazz.load(data.toString());
  jazz.run();
  process.stdout.write("\n");
});
