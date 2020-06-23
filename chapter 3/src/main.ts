import { WinForm, Picture, Button, Frame, Label, TextBox, PasswordBox, CheckBox, LinkLabel } from './Component';

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
