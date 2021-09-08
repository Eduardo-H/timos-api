import { ICreateUserTokenDTO } from '@modules/accounts/dtos/ICreateUserTokenDTO';
import { UserTokens } from '@modules/accounts/infra/typeorm/entities/UserTokens';

import { IUsersTokensRepository } from '../IUsersTokensRepository';

class UserTokensRepositoryInMemory implements IUsersTokensRepository {
  tokens: UserTokens[] = [];

  async create({
    user_id,
    expire_date,
    refresh_token
  }: ICreateUserTokenDTO): Promise<UserTokens> {
    const userToken = new UserTokens();

    Object.assign(userToken, {
      user_id,
      expire_date,
      refresh_token
    });

    this.tokens.push(userToken);

    return userToken;
  }

  async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserTokens> {
    const token = this.tokens.find(
      (token) =>
        token.user_id === user_id && token.refresh_token === refresh_token
    );

    return token;
  }

  async deleteById(id: string): Promise<void> {
    const index = this.tokens.findIndex((token) => token.id === id);

    this.tokens.splice(index, 1);
  }
}

export { UserTokensRepositoryInMemory };
