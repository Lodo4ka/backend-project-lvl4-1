// @ts-check

import codes from 'http-codes';
import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test tasks CRUD', () => {
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
    it('index', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('tasks'),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('new', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('newTask'),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('create', async () => {
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('edit', async () => {
      const { name } = testData.tasks.updated;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'GET',
        url: app.reverse('editTask', { id: taskId }),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('update', async () => {
      const { name } = testData.tasks.updated;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('task', { id: taskId }),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('delete', async () => {
      const { name } = testData.tasks.deleted;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'DELETE',
        url: app.reverse('task', { id: taskId }),
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const task = await models.task.query().findById(taskId);

      expect(task).not.toBeUndefined();
    });
  });

  describe('errors', () => {
    let authCookie;

    beforeEach(async () => {
      const { email, password } = testData.users.existing;

      authCookie = await signIn(app, email, password);
    });

    it('create', async () => {
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        cookies: authCookie,
        payload: {},
      });

      expect(response.statusCode).toBe(codes.BAD_REQUEST);
    });

    it('update', async () => {
      const { name } = testData.tasks.updated;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('task', { id: taskId }),
        cookies: authCookie,
        payload: {},
      });

      expect(response.statusCode).toBe(codes.BAD_REQUEST);
    });

    it('delete', async () => {
      const taskId = 1;

      const response = await app.inject({
        method: 'DELETE',
        url: app.reverse('taskStatus', { id: taskId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });
  });

  describe('success', () => {
    let authCookie;

    beforeEach(async () => {
      const { email, password } = testData.users.existing;

      authCookie = await signIn(app, email, password);
    });

    it('index', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('tasks'),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.OK);
    });

    it('new', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('newTask'),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.OK);
    });

    it('create', async () => {
      const data = testData.tasks.new;

      const response = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        cookies: authCookie,
        payload: { data },
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const { name } = data;
      const task = await models.task.query().findOne({ name });

      expect(task).toMatchObject(data);
    });

    it('edit', async () => {
      const { name } = testData.tasks.updated;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'GET',
        url: app.reverse('editTask', { id: taskId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.OK);
    });

    it('update', async () => {
      const data = testData.tasks.new;
      const { name } = testData.tasks.updated;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('task', { id: taskId }),
        cookies: authCookie,
        payload: { data },
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const task = await models.task.query().findById(taskId);

      expect(task).toMatchObject(data);
    });

    it('delete', async () => {
      const { name } = testData.tasks.deleted;
      const { id: taskId } = await models.task.query().findOne({ name });

      const response = await app.inject({
        method: 'DELETE',
        url: app.reverse('task', { id: taskId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const task = await models.task.query().findById(taskId);

      expect(task).toBeUndefined();
    });
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
