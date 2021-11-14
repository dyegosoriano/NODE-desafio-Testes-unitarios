import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let repository: InMemoryUsersRepository;

describe("Authenticate User UseCase", () => {
  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(repository);
    createUserUseCase = new CreateUserUseCase(repository);
  });

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute({
      password: "teste123",
      email: "dyego@email",
      name: "Dyego",
    });

    const result = await authenticateUserUseCase.execute({
      password: "teste123",
      email: "dyego@email",
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "teste@email.com",
        password: "teste123",
      });
    }).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        password: "teste123",
        email: "dyego@email",
        name: "Dyego",
      });

      await authenticateUserUseCase.execute({
        password: "incorrect_password",
        email: "dyego@email",
      });
    }).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
