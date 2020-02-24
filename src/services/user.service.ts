import { Service } from 'typedi';

import { User } from '@src/entities';
import { UserInterface } from '@src/interfaces';

@Service()
class UserService {
  public async me(userId: string): Promise<UserInterface> {
    const me = await User.findOne({ id: userId });

    if (me) {
      const userDetailsToReturn: UserInterface = {
        id: me.id,
        email: me.email,
        firstName: me.firstName,
        lastName: me.lastName,
        roles: me.roles,
      };

      return userDetailsToReturn;
    } else {
      throw new Error('User not found');
    }
  }
}

export default UserService;
