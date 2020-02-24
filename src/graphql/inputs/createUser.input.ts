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

  // TODO: This will be used in separated endpoint for granting permissions on users not on creating a user.
  // @Field(() => [String])
  // @IsEnum(Roles, { each: true })
  // @ArrayUnique()
  // roles: Roles[];
}

export default CreateUserInput;
