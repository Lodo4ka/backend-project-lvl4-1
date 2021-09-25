// @ts-check

import codes from 'http-codes';
import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
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
        url: app.reverse('taskStatuses'),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('new', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('newTaskStatus'),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('create', async () => {
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('taskStatuses'),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('edit', async () => {
      const { name } = testData.taskStatuses.updated;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'GET',
        url: app.reverse('editTaskStatus', { id: taskStatusId }),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('update', async () => {
      const { name } = testData.taskStatuses.updated;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('taskStatus', { id: taskStatusId }),
      });

      expect(response.statusCode).toBe(codes.FOUND);
    });

    it('delete', async () => {
      const { name } = testData.taskStatuses.deleted;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'DELETE',
        url: app.reverse('taskStatus', { id: taskStatusId }),
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const taskStatus = await models.taskStatus.query().findById(taskStatusId);

      expect(taskStatus).not.toBeUndefined();
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
        url: app.reverse('taskStatuses'),
        cookies: authCookie,
        payload: {},
      });

      expect(response.statusCode).toBe(codes.BAD_REQUEST);
    });

    it('update', async () => {
      const { name } = testData.taskStatuses.updated;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('taskStatus', { id: taskStatusId }),
        cookies: authCookie,
        payload: {},
      });

      expect(response.statusCode).toBe(codes.BAD_REQUEST);
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
        url: app.reverse('taskStatuses'),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.OK);
    });

    it('new', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('newTaskStatus'),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.OK);
    });

    it('create', async () => {
      const data = testData.taskStatuses.new;

      const response = await app.inject({
        method: 'POST',
        url: app.reverse('taskStatuses'),
        cookies: authCookie,
        payload: { data },
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const { name } = data;
      const taskStatus = await models.taskStatus.query().findOne({ name });

      expect(taskStatus).toMatchObject(data);
    });

    it('edit', async () => {
      const { name } = testData.taskStatuses.updated;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'GET',
        url: app.reverse('editTaskStatus', { id: taskStatusId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.OK);
    });

    it('update', async () => {
      const data = testData.taskStatuses.new;
      const { name } = testData.taskStatuses.updated;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('taskStatus', { id: taskStatusId }),
        cookies: authCookie,
        payload: { data },
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const taskStatus = await models.taskStatus.query().findById(taskStatusId);

      expect(taskStatus).toMatchObject(data);
    });

    it('delete', async () => {
      const { name } = testData.taskStatuses.deleted;
      const { id: taskStatusId } = await models.taskStatus.query().findOne({ name });

      const response = await app.inject({
        method: 'DELETE',
        url: app.reverse('taskStatus', { id: taskStatusId }),
        cookies: authCookie,
      });

      expect(response.statusCode).toBe(codes.FOUND);

      const taskStatus = await models.taskStatus.query().findById(taskStatusId);

      expect(taskStatus).toBeUndefined();
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
