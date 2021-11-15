import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to show the user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@test.com",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const userProfile = await showUserProfileUseCase.execute(
      token.user.id as string
    );

    expect(userProfile).toHaveProperty("id");
  });

  it("should not be able to show the profile when user does not exist", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("inexistentId");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
