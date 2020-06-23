# 极客时间《架构师训练营》第三章课后作业

## 1. 请在草稿纸上手写一个单例模式的实现代码，拍照提交作业

![Singleton][1]

## 2. 请用组合设计模式编写程序，打印输出图 1 的窗口，窗口组件的树结构如图 2 所示，打印输出示例参考图 3

![Exercise][2]

经典的组合模式题，题目没有限定语言，我就用 Typescript 来写了。先定义一个通用接口——Component，只有一个唯一的方法 `draw`：

```typescript
interface Component {
  draw(): void;
}
```

再定义两个实现类 Node 和 Leaf 继承 Component 接口，分别表示中间节点和叶子节点。两个实现类的区别是：Node 节点多一个`addChild`方法，用于增加子节点；draw 上也有一点区别，Leaf 节点只打印自己，但是 Node 结点会递归打印子节点。

```typescript
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
    this.#children.forEach(child => child.draw());
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
```

之后就是无脑继承了：WinForm, Frame 类继承 Node 节点；Picture, Button,  Label, TextBox, PasswordBox, CheckBox, LinkLabel 继承 Leaf 节点即可：

![Composite][4]

```typescript
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
```

```typescript
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
```

最后就是 client 调用了：

```typescript
import { WinForm, Frame, Picture, Button,  Label, TextBox, PasswordBox, CheckBox, LinkLabel } from './Component';

const winForm: WinForm = new WinForm('WINDOW窗口' );

const logo: Picture = new Picture('LOGO图片');
const btnLogin: Button = new Button('登陆');
const btnRegister: Button = new Button('注册');
const frame: Frame = new Frame('FRAME1')

winForm
  .addChild(logo)
  .addChild(btnLogin)
  .addChild(btnRegister)
  .addChild(frame);


const labelUserName: Label = new Label('用户名');
const textBoxUserName: TextBox = new TextBox('文本框');
const labelPassword: Label = new Label('密码');
const pwdBox: PasswordBox = new PasswordBox('密码框');
const checkbox: CheckBox = new CheckBox('复选框');
const textBoxRemember: TextBox = new TextBox('记住用户名');
const link: LinkLabel = new LinkLabel('忘记密码');

frame
  .addChild(labelUserName)
  .addChild(textBoxUserName)
  .addChild(labelPassword)
  .addChild(pwdBox)
  .addChild(checkbox)
  .addChild(textBoxRemember)
  .addChild(link);

winForm.draw();
```

打印结果如下所示：

![Result][3]

[1]: ./img/singleton.jpg
[2]: ./img/exercise.png
[3]: ./img/print.png
[4]: ./img/composite.drawio.png
