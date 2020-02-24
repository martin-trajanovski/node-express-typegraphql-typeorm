import { ObjectType, Field, ID } from 'type-graphql';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { User } from '.';

@Entity()
@ObjectType()
class Todo extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'text' })
  title: string;

  @Field(() => User)
  @ManyToOne(() => User)
  createdBy: User;

  @Field(() => Boolean)
  @Column({ default: false })
  completed: boolean;
}

export default Todo;
