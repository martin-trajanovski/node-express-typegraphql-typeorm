import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
class UpdateTodoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;
}

export default UpdateTodoInput;
