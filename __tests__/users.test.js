// @ts-check

import _ from 'lodash';
import codes from 'http-codes';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
  });

  describe('auth', () => {
    it('edit', async () => {
      const { email, password } = testData.users.existing;
      const authCookie = await signIn(app, email, password);
      const { email: updatedUserEmail } = testData.users.updated;
      const { id: userId } = await models.user.query().findOne({ email: updatedUserEmail });

      const response = await app.inject({
        method: 'GET',
        url: app.reverse('editUser', { id: userId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('update', async () => {
      const data = testData.users.new;
      const { email, password } = testData.users.existing;
      const authCookie = await signIn(app, email, password);
      const { email: updatedUserEmail } = testData.users.updated;
      const { id: userId } = await models.user.query().findOne({ email: updatedUserEmail });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('user', { id: userId }),
        cookies: authCookie,
        payload: { data },
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('delete', async () => {
      const { email, password } = testData.users.existing;
      const authCookie = await signIn(app, email, password);
      const { email: deletedUserEmail } = testData.users.deleted;
      const { id: userId } = await models.user.query().findOne({ email: deletedUserEmail });

      const response = await app.inject({
        method: 'DELETE',
        url: app.reverse('user', { id: userId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const user = await models.user.query().findById(userId);

      expect(user).not.toBeUndefined();
    });
  });

  describe('errors', () => {
    it('create', async () => {
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('users'),
        payload: {},
      });

      expect(response.statusCode).toBe(codes.BAD_REQUEST);
    });

    it('update', async () => {
      const { email, password } = testData.users.updated;
      const authCookie = await signIn(app, email, password);
      const { id: userId } = await models.user.query().findOne({ email });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('user', { id: userId }),
        cookies: authCookie,
        payload: {},
      });

      expect(response.statusCode).toBe(codes.BAD_REQUEST);
    });
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(codes.OK);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(codes.OK);
  });

  it('create', async () => {
    const data = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: { data },
    });

    expect(response.statusCode).toBe(codes.FOUND);

    const { email } = data;
    const user = await models.user.query().findOne({ email });
    const expected = {
      ..._.omit(data, 'password'),
      passwordDigest: encrypt(data.password),
    };

    expect(user).toMatchObject(expected);
  });

  it('edit', async () => {
    const { email, password } = testData.users.updated;
    const authCookie = await signIn(app, email, password);
    const { id: userId } = await models.user.query().findOne({ email });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: userId }),
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(codes.OK);
  });

  it('update', async () => {
    const data = testData.users.new;
    const { email, password } = testData.users.updated;
    const authCookie = await signIn(app, email, password);
    const { id: userId } = await models.user.query().findOne({ email });

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('user', { id: userId }),
      cookies: authCookie,
      payload: { data },
    });

    expect(response.statusCode).toBe(codes.FOUND);

    const user = await models.user.query().findById(userId);
    const expected = {
      ..._.omit(data, 'password'),
      passwordDigest: encrypt(data.password),
    };

    expect(user).toMatchObject(expected);
  });

  it('delete', async () => {
    const { email, password } = testData.users.deleted;
    const authCookie = await signIn(app, email, password);
    const { id: userId } = await models.user.query().findOne({ email });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('user', { id: userId }),
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(codes.FOUND);

    const user = await models.user.query().findById(userId);

    expect(user).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
