import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsNotEmpty()
  lastName: string;

  @Field()
  @MinLength(6)
  password: string;
}

export default CreateUserInput;
