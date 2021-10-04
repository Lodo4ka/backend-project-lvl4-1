// @ts-check

module.exports = {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      user: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
        actionNotAvailable: 'Вы не можете редактировать или удалять другого пользователя',
      },
      taskStatus: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      task: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача успешно удалена',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        taskStatuses: 'Статусы',
        tasks: 'Задачи',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      user: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        email: 'Email',
        password: 'Пароль',
        createdAt: 'Дата создания',
        actions: 'Действия',
        new: {
          submit: 'Сохранить',
          title: 'Регистрация',
        },
        edit: {
          title: 'Изменение пользователя',
          action: 'Изменить',
        },
        delete: {
          action: 'Удалить',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      taskStatus: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: 'Действия',
        create: 'Создать статус',
        new: {
          title: 'Создание статуса',
          action: 'Создать',
        },
        edit: {
          title: 'Изменение статуса',
          action: 'Изменить',
        },
        delete: {
          action: 'Удалить',
        },
      },
      task: {
        id: 'ID',
        name: 'Наименование',
        description: 'Описание',
        status: 'Статус',
        statusId: 'Статус',
        creator: 'Автор',
        creatorId: 'Автор',
        executor: 'Исполнитель',
        executorId: 'Исполнитель',
        createdAt: 'Дата создания',
        actions: 'Действия',
        create: 'Создать задачу',
        new: {
          title: 'Создание задачи',
          action: 'Создать',
        },
        edit: {
          title: 'Изменение задачи',
          action: 'Изменить',
        },
        delete: {
          action: 'Удалить',
        },
      },
    },
  },
};
