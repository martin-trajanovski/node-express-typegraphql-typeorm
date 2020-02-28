import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from 'type-graphql';

import { Todo } from '@src/entities';
import { Context } from '@src/interfaces';

import { CreateTodoInput, UpdateTodoInput } from '../inputs';

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

  @Authorized()
  @Mutation(() => Todo)
  async updateTodo(@Arg('data') data: UpdateTodoInput) {
    try {
      const todoToUpdate = await Todo.findOne(data.id);

      if (todoToUpdate) {
        todoToUpdate.title = data.title;
        todoToUpdate.completed = data.completed;

        await Todo.update({ id: data.id }, todoToUpdate);

        return todoToUpdate;
      } else {
        throw new Error('Todo not found');
      }
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async removeTodo(@Arg('id') id: string) {
    try {
      await Todo.delete({ id });

      return true;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }
}

export default TodoResolver;
