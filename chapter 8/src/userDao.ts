export default {
  save({userId, pwd}: {userId: string, pwd: string}): Promise<boolean> {
    return Promise.resolve(true);
  },
  get(userId: string): Promise<{userId: string, pwd: string}> {
    return Promise.resolve({userId: userId, pwd: ''});
  }
}
