interface Component {
  draw(): void;
}

class Node implements Component {

  readonly #children: Component[];
  readonly #tag: string;
  readonly #value: string;

  constructor(args : {tag: string, value: string}) {
    this.#tag = args.tag;
    this.#value = args.value;
    this.#children = [];
  }

  public addChild(child : Component) {
    this.#children.push(child);
    return this;
  }

  public draw() {
    console.log(` print ${this.#tag}(${this.#value}) `);
    this.#children.forEach(child => child.draw())
  }
}

class Leaf implements Component {
  readonly #tag: string;
  readonly #value: string;

  constructor(args : {tag: string, value: string}) {
    this.#tag = args.tag;
    this.#value = args.value;
  }

  public draw() {
    console.log(` print ${this.#tag}(${this.#value}) `);
  }
}


export class WinForm extends Node {
  constructor(value: string) {
    super({ tag: 'WinForm', value })
  }
}

export class Frame extends Node {
  constructor(value: string) {
    super({ tag: 'Frame', value })
  }
}


export class Label extends Leaf {
  constructor(value: string) {
    super({ tag: 'Label', value })
  }
}

export class Picture extends Leaf {
  constructor(value: string) {
    super({ tag: 'Picture', value })
  }
}

export class Button extends Leaf {
  constructor(value: string) {
    super({ tag: 'Button', value })
  }
}

export class TextBox extends Leaf {
  constructor(value: string) {
    super({ tag: 'TextBox', value })
  }
}

export class PasswordBox extends Leaf {
  constructor(value: string) {
    super({ tag: 'PasswordBox', value })
  }
}

export class CheckBox extends Leaf {
  constructor(value: string) {
    super({ tag: 'CheckBox', value })
  }
}

export class LinkLabel extends Leaf {
  constructor(value: string) {
    super({ tag: 'LinkLabel', value })
  }
}
