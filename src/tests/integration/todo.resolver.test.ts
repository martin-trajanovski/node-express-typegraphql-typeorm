import { apiCall } from '@src/utils/testHelpers';

describe('Test todos CRUD', () => {
  let token: string | null = null;
  const query = `
    query {
      todos {
        id
        title
        completed
      }
    }
  `;

  beforeAll(async () => {
    const loginQuery = `
      query {
        login(data: {email: "test@test.com", password: "test123"}) {
          firstName
          token
        }
      }
    `;

    const loginResponse = await apiCall(loginQuery);

    token = loginResponse.data.login.token;
  });

  test('When we try to read the todos, it should get all todos for specific user in deault order', async () => {
    const todosResponse = await apiCall(query, token);
    const { todos } = todosResponse.data;

    expect(todos).toBeDefined();
    expect(todos).toHaveLength(2);
    expect(todos).toMatchSnapshot();
  });

  test('When we try to create a todo, it should return that todo with id', async () => {
    const createTodoMutation = `
      mutation {
        createTodo(data: {title: "New test todo"}) {
          id
          title
          completed
        }
      }
    `;

    const todosResponse = await apiCall(createTodoMutation, token);
    const { createTodo } = todosResponse.data;

    expect(createTodo).toBeDefined();
    expect(createTodo.id).toBeDefined();
    expect(createTodo.title).toBe('New test todo');
    expect(createTodo.completed).toBeFalsy();
  });

  test('When we try to update a todo, it should return that todo updated', async () => {
    const initialTodosResponse = await apiCall(query, token);
    const initialTodos = initialTodosResponse.data.todos;
    const todoToUpdate = initialTodos[initialTodos.length - 1];
    const updateTodoMutation = `
      mutation {
        updateTodo(data: {id: "${todoToUpdate.id}", title: "Test todo updated", completed: true}) {
          id
          title
          completed
        }
      }
    `;

    const removeTodoResponse = await apiCall(updateTodoMutation, token);
    const { updateTodo } = removeTodoResponse.data;

    expect(updateTodo).toBeDefined();
    expect(updateTodo.title).toBe('Test todo updated');
    expect(updateTodo.completed).toBeTruthy();
  });

  test('When we try to remove a todo, it should return that todo', async () => {
    const initialTodosResponse = await apiCall(query, token);
    const initialTodos = initialTodosResponse.data.todos;
    const todoToRemove = initialTodos[initialTodos.length - 1];
    const removeTodoMutation = `
      mutation {
        removeTodo(id: "${todoToRemove.id}")
      }
    `;

    const removeTodoResponse = await apiCall(removeTodoMutation, token);
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
