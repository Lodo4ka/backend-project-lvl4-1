// @ts-check

import path from 'path';
import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

export default class Task extends unique(Model) {
  static get tableName() {
    return 'tasks';
  }

  static relationMappings = {
    status: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, 'TaskStatus.js'),
      join: {
        from: 'tasks.status_id',
        to: 'task_statuses.id',
      },
    },
    creator: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, 'User.js'),
      join: {
        from: 'tasks.creator_id',
        to: 'users.id',
      },
    },
    executor: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, 'User.js'),
      join: {
        from: 'tasks.executor_id',
        to: 'users.id',
      },
    },
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer', min: 1 },
        creatorId: { type: 'integer', min: 1 },
        executorId: { type: 'integer', min: 1 },
      },
    };
  }
}
