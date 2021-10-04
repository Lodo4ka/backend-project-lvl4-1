// @ts-check

import _ from 'lodash';
import i18next from 'i18next';
import codes from 'http-codes';

export default (app) => {
  app
    .get('/statuses', { name: 'taskStatuses', preValidation: app.authenticate }, async (req, reply) => {
      const taskStatuses = await app.objection.models.taskStatus.query();
      reply.render('statuses/index', { taskStatuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newTaskStatus', preValidation: app.authenticate }, (req, reply) => {
      const taskStatus = new app.objection.models.taskStatus();
      reply.render('statuses/new', { taskStatus });
      return reply;
    })
    .post('/statuses', { preValidation: app.authenticate }, async (req, reply) => {
      try {
        const taskStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(taskStatus);
        req.flash('info', i18next.t('flash.taskStatus.create.success'));
        reply.redirect(app.reverse('taskStatuses'));
        return reply;
      } catch (err) {
        const taskStatus = await app.objection.models.taskStatus.fromJson(
          req.body.data,
          { skipValidation: true },
        );

        req.flash('error', i18next.t('flash.taskStatus.create.error'));
        reply.render('statuses/new', { taskStatus, errors: err.data });
        reply.code(codes.BAD_REQUEST);
        return reply;
      }
    })
    .get('/statuses/:id/edit', { name: 'editTaskStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const taskStatus = await app.objection.models.taskStatus.query().findById(id);

      reply.render('statuses/edit', { taskStatus });
      return reply;
    })
    .patch('/statuses/:id', { name: 'taskStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const taskStatus = await app.objection.models.taskStatus.query().findById(id);

      try {
        taskStatus.$setJson(req.body.data);
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.taskStatus.edit.error'));
        reply.render('statuses/edit', { taskStatus, errors: data });
        reply.code(codes.BAD_REQUEST);
        return reply;
      }

      await taskStatus.$query().patch();

      req.flash('info', i18next.t('flash.taskStatus.edit.success'));
      reply.redirect(app.reverse('taskStatuses'));
      return reply;
    })
    .delete('/statuses/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      const taskStatus = await app.objection.models.taskStatus.query()
        .withGraphJoined('tasks')
        .findById(id);
      const { tasks = [] } = taskStatus;

      if (_.isEmpty(tasks)) {
        await app.objection.models.taskStatus.query().deleteById(id);
        req.flash('info', i18next.t('flash.taskStatus.delete.success'));
      } else {
        req.flash('error', i18next.t('flash.taskStatus.delete.error'));
      }

      reply.redirect(app.reverse('taskStatuses'));
      return reply;
    });
};
