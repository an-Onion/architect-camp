import * as md5 from 'md5'
import express = require('express');
import UserDao from './userDao';

function encrypt(userId: string, plaintext: string): string {
  return md5(plaintext+userId);
}

function checkPW(userId: string, plaintext: string, ciphertext: string): boolean {
  return encrypt(userId, plaintext) === ciphertext;
}

const app: express.Application = express();

app.post('/register', async (req: express.Request, res: express.Response) => {
  const {userId, password} = req.body;
  const ciphertext: string = encrypt(userId, password);
  const ret: boolean = await UserDao.save({userId, pwd: ciphertext});
  res.send(ret);
});

app.post('/login', async (req: express.Request, res: express.Response) => {
  const {userId, password} = req.body;
  const {pwd: ciphertext} = await UserDao.get(userId);
  res.send( checkPW(userId, password, ciphertext) );
});
