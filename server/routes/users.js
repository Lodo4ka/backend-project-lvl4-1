// @ts-check

import _ from 'lodash';
import i18next from 'i18next';
import codes from 'http-codes';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.user.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (err) {
        const user = await app.objection.models.user.fromJson(
          req.body.data,
          { skipValidation: true },
        );

        req.flash('error', i18next.t('flash.user.create.error'));
        reply.render('users/new', { user, errors: err.data });
        reply.code(codes.BAD_REQUEST);
        return reply;
      }
    })
    .get('/users/:id/edit', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      if (req.user.id !== Number(id)) {
        req.flash('error', i18next.t('flash.user.actionNotAvailable'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      const user = await app.objection.models.user.query().findById(id);
      reply.render('users/edit', { user });
      return reply;
    })
    .patch('/users/:id', { name: 'user', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      if (req.user.id !== Number(id)) {
        req.flash('error', i18next.t('flash.user.actionNotAvailable'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      const user = await app.objection.models.user.query().findById(id);

      try {
        user.$setJson(req.body.data);
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.user.edit.error'));
        reply.render('users/edit', { user, errors: data });
        reply.code(codes.BAD_REQUEST);
        return reply;
      }

      await user.$query().patch();

      req.flash('info', i18next.t('flash.user.edit.success'));
      reply.redirect(app.reverse('users'));
      return reply;
    })
    .delete('/users/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      if (req.user.id !== Number(id)) {
        req.flash('error', i18next.t('flash.user.actionNotAvailable'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      const user = await app.objection.models.user.query()
        .withGraphJoined('[createdTasks, executedTasks]')
        .findById(id);
      const { createdTasks = [], executedTasks = [] } = user;

      if (_.isEmpty(createdTasks) && _.isEmpty(executedTasks)) {
        await app.objection.models.user.query().deleteById(id);
        req.logOut();
        req.flash('info', i18next.t('flash.user.delete.success'));
      } else {
        req.flash('error', i18next.t('flash.user.delete.error'));
      }

      reply.redirect(app.reverse('users'));
      return reply;
    });
};
