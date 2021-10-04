// @ts-check

import path from 'path';
import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

export default class TaskStatus extends unique(Model) {
  static get tableName() {
    return 'task_statuses';
  }

  static relationMappings = {
    tasks: {
      relation: Model.HasManyRelation,
      modelClass: path.join(__dirname, 'Task.js'),
      join: {
        from: 'task_statuses.id',
        to: 'tasks.status_id',
      },
    },
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }

  optionLabel() {
    return this.name;
  }
}
