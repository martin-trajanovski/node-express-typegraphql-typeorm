import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from 'type-graphql';

import Todo from '@src/entities/Todo';
import { Context } from '@src/interfaces';

import CreateTodoInput from '../inputs/createTodo.input';

@Resolver()
class TodoResolver {
  @Authorized('ADMIN')
  @Query(() => [Todo])
  async getAllTodos() {
    const todos = await Todo.find({ relations: ['createdBy'] });

    return todos;
  }

  @Authorized()
  @Query(() => [Todo])
  async todos(@Ctx() ctx: Context) {
    const todos = await Todo.find({
      where: { createdBy: ctx.user.id },
      relations: ['createdBy'],
    });

    return todos;
  }

  @Authorized()
  @Mutation(() => Todo)
  async createTodo(@Arg('data') data: CreateTodoInput, @Ctx() ctx: Context) {
    const dataWithCreatorId = { ...data, createdBy: ctx.user };
    const todo = Todo.create(dataWithCreatorId);

    await todo.save();

    return todo;
  }
}

export default TodoResolver;
