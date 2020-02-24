import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from 'type-graphql';

import { Todo } from '@src/entities';
import { Context } from '@src/interfaces';

import { CreateTodoInput } from '../inputs';

@Resolver()
class TodoResolver {
  @Authorized('ADMIN')
  @Query(() => [Todo])
  async getAllTodos() {
    try {
      const todos = await Todo.find({ relations: ['createdBy'] });

      return todos;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }

  @Authorized()
  @Query(() => [Todo])
  async todos(@Ctx() ctx: Context) {
    try {
      const todos = await Todo.find({
        where: { createdBy: ctx.user.id },
        relations: ['createdBy'],
      });

      return todos;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }

  @Authorized()
  @Mutation(() => Todo)
  async createTodo(@Arg('data') data: CreateTodoInput, @Ctx() ctx: Context) {
    try {
      const dataWithCreatorId = { ...data, createdBy: ctx.user };
      const todo = Todo.create(dataWithCreatorId);

      await todo.save();

      return todo;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }
}

export default TodoResolver;
