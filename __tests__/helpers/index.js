// @ts-check

import fs from 'fs';
import path from 'path';

const getFixturePath = (filename) => path.join(__dirname, '..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;

  // получаем данные из фикстур и заполняем БД
  await knex('users').insert(getFixtureData('users.json'));
  await knex('tasks').insert(getFixtureData('tasks.json'));
  await knex('task_statuses').insert(getFixtureData('taskStatuses.json'));
};

export const signIn = async (app, email, password) => {
  const { cookies } = await app.inject({
    method: 'POST',
    url: app.reverse('session'),
    payload: {
      data: { email, password },
    },
  });

  const [authCookie] = cookies;
  const { name, value } = authCookie;

  return { [name]: value };
};
