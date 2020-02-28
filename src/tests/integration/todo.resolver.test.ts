import faker from 'faker';

import { apiCall } from '@src/utils/testHelpers';

describe('Test todos CRUD', () => {
  let token: string | null = null;
  const query = `
    query {
      todos {
        id
        title
        completed
        createdBy {
          id
          firstName
          roles
        }
      }
    }
  `;

  beforeAll(async () => {
    const { USER_USERNAME, USER_PASSWORD } = process.env;
    const loginData = {
      email: USER_USERNAME,
      password: USER_PASSWORD,
    };

    const loginQuery = `
      query login($loginData: LoginUserInput!) {
        login(data: $loginData) {
          firstName
          token
        }
      }
    `;

    const loginResponse = await apiCall(loginQuery, null, { loginData });

    token = loginResponse.data.login.token;
  });

  test('When we try to read the todos, it should get all todos for specific user in deault order', async () => {
    const todosResponse = await apiCall(query, token);
    const { todos } = todosResponse.data;

    expect(todos).toBeDefined();
    expect(todos).toHaveLength(2);
    expect(todos).toMatchSnapshot();
  });

  test('When we try to read the all todos with USER role, it should return `Wrong credentials` error', async () => {
    const getAllTodosQuery = `
    query {
      getAllTodos {
        id
        title
        completed
      }
    }
  `;
    const allTodosResponse = await apiCall(getAllTodosQuery, token);
    const data = allTodosResponse.data;

    expect(data).toBeNull();
    expect(allTodosResponse.errors).toBeDefined();
    expect(allTodosResponse.errors[0].message).toBe('Wrong credentials');
  });

  test('When we try to read the all todos with ADMIN role, it should match the snapshot', async () => {
    const getAllTodosQuery = `
      query {
        getAllTodos {
          id
          title
          completed,
          createdBy {
            id
            firstName
            roles
          }
        }
      }
    `;
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
    const loginData = {
      email: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    };

    const loginQuery = `
      query login($loginData: LoginUserInput!) {
        login(data: $loginData) {
          firstName
          token
        }
      }
    `;

    const loginResponse = await apiCall(loginQuery, null, { loginData });
    const adminToken = loginResponse.data.login.token;

    const allTodosResponse = await apiCall(getAllTodosQuery, adminToken);
    const { getAllTodos } = allTodosResponse.data;

    expect(getAllTodos).toMatchSnapshot();
  });

  test('When we try to create a todo, it should return that todo with id', async () => {
    const newTodo = {
      title: faker.random.words(),
    };
    const createTodoMutation = `
      mutation createTodo($newTodo: CreateTodoInput!) {
        createTodo(data: $newTodo) {
          id
          title
          completed
        }
      }
    `;

    const todosResponse = await apiCall(createTodoMutation, token, { newTodo });
    const { createTodo } = todosResponse.data;

    expect(createTodo).toBeDefined();
    expect(createTodo.id).toBeDefined();
    expect(createTodo.title).toBe(newTodo.title);
    expect(createTodo.completed).toBeFalsy();
  });

  test('When we try to update a todo, it should return that todo updated', async () => {
    const initialTodosResponse = await apiCall(query, token);
    const initialTodos = initialTodosResponse.data.todos;
    const todoToUpdate = {
      id: initialTodos[initialTodos.length - 1].id,
      title: faker.random.words(),
      completed: true,
    };

    const updateTodoMutation = `
      mutation updateTodo($todoToUpdate: UpdateTodoInput!) {
        updateTodo(data: $todoToUpdate) {
          id
          title
          completed
        }
      }
    `;

    const removeTodoResponse = await apiCall(updateTodoMutation, token, {
      todoToUpdate,
    });
    const { updateTodo } = removeTodoResponse.data;

    expect(updateTodo).toBeDefined();
    expect(updateTodo.title).toBe(todoToUpdate.title);
    expect(updateTodo.completed).toBeTruthy();
  });

  test('When we try to remove a todo, it should return that todo', async () => {
    const initialTodosResponse = await apiCall(query, token);
    const initialTodos = initialTodosResponse.data.todos;
    const todoToRemove = initialTodos[initialTodos.length - 1];
    const removeTodoMutation = `
      mutation removeTodo($id: String!) {
        removeTodo(id: $id)
      }
    `;

    const removeTodoResponse = await apiCall(removeTodoMutation, token, {
      id: todoToRemove.id,
    });
    const { removeTodo } = removeTodoResponse.data;

    expect(removeTodo).toBeTruthy();

    const afterRemoveTodosResponse = await apiCall(query, token);
    const afterRemoveTodos = afterRemoveTodosResponse.data.todos;

    expect(afterRemoveTodos.length).toBe(initialTodos.length - 1);
  });

  afterAll(() => {
    token = null;
  });
});
