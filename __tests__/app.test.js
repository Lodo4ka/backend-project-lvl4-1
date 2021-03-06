// @ts-check

import {
  describe, beforeAll, it, expect,
} from '@jest/globals';
import codes from 'http-codes';
import getApp from '../server/index.js';

describe('requests', () => {
  let app;

  beforeAll(async () => {
    app = await getApp();
  });

  it('GET 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('root'),
    });
    expect(res.statusCode).toBe(codes.OK);
  });

  it('GET 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/wrong-path',
    });
    expect(res.statusCode).toBe(codes.NOT_FOUND);
  });

  afterAll(() => {
    app.close();
  });
});
