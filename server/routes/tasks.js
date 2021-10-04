// @ts-check

import i18next from 'i18next';
import codes from 'http-codes';

// Роуты текущего шага:
// GET /tasks - страница со списком всех задач
// GET /tasks/new - страница создания задачи
// GET /tasks/:id - страница просмотра задачи
// GET /tasks/:id/edit - страница редактирования задачи
// POST /tasks - создание новой задачи
// PATCH /tasks/:id - обновление задачи
// DELETE /tasks/:id - удаление задачи

// Требования к проекту
// Связь между сущностями должна быть реализована внешними ключами на уровне базы данных.
// Если пользователь связан хотя бы с одной задачей, его нельзя удалить
// Если статус связан хотя бы с одной задачей, его нельзя удалить
// Тексты элементов Label должны быть как в демонстрационном проекте
// Значения атрибутов формы должны быть как в демонстрационном проекте
// Фильтрацию задач пока реализовывать не нужно

// Задачи
// Напишите тесты на контроллер задач.
// Реализуйте CRUD задач. Подключите флэш сообщения. Храните все тексты интерфейсов в i18next.
// Добавьте ссылку на список задач в основное меню.
// Сделайте так, чтобы добавлять, редактировать задачи могли бы только залогиненные пользователи.
// Удалять задачи может только создатель.

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const tasks = await app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor]');

      reply.render('tasks/index', { tasks });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('tasks/new', { task, statuses, users });
      return reply;
    })
    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const { data: formData } = req.body;

      try {
        const taskData = {
          ...formData,
          creatorId: req.user.id,
          statusId: formData.statusId ? Number(formData.statusId) : null,
          executorId: formData.executorId ? Number(formData.executorId) : null,
        };

        const task = await app.objection.models.task.fromJson(taskData);
        await app.objection.models.task.query().insert(task);
        req.flash('info', i18next.t('flash.task.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const task = await app.objection.models.task.fromJson(
          req.body.data,
          { skipValidation: true },
        );

        req.flash('error', i18next.t('flash.task.create.error'));
        reply.render('tasks/new', {
          task, statuses, users, errors: err.data,
        });
        reply.code(codes.BAD_REQUEST);
        return reply;
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const task = await app.objection.models.task.query().findById(id);

      reply.render('tasks/edit', { task, statuses, users });
      return reply;
    })
    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);

      reply.render('tasks/show', { task });
      return reply;
    })
    .patch('/tasks/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const { data: formData } = req.body;
      const task = await app.objection.models.task.query().findById(id);

      try {
        const taskData = {
          ...formData,
          creatorId: req.user.id,
          statusId: formData.statusId ? Number(formData.statusId) : null,
          executorId: formData.executorId ? Number(formData.executorId) : null,
        };

        task.$setJson(taskData);
      } catch (err) {
        req.flash('error', i18next.t('flash.task.edit.error'));
        reply.render('tasks/edit', { task, errors: err.data });
        reply.code(codes.BAD_REQUEST);
        return reply;
      }

      await task.$query().patch();

      req.flash('info', i18next.t('flash.task.edit.success'));
      reply.redirect(app.reverse('tasks'));
      return reply;
    })
    .delete('/tasks/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);

      if (task.creatorId === req.user.id) {
        await app.objection.models.task.query().deleteById(id);
        req.flash('info', i18next.t('flash.task.delete.success'));
      } else {
        req.flash('error', i18next.t('flash.task.delete.error'));
      }

      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
