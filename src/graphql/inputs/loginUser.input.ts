import { IsNotEmpty, IsEmail } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
class LoginUserInput {
  @Field()
  @IsEmail({}, { message: 'Must be valid email' })
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;
}

export default LoginUserInput;
