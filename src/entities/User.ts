import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
@ObjectType()
class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'text' })
  firstName: string;

  @Field(() => String)
  @Column({ type: 'text' })
  lastName: string;

  @Field(() => String)
  @Column({ type: 'text' })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' })
  password: string;
}

export default User;
