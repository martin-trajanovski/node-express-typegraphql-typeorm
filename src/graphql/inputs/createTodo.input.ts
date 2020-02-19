import { IsNotEmpty, IsString } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
class CreateTodoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;
}

export default CreateTodoInput;
