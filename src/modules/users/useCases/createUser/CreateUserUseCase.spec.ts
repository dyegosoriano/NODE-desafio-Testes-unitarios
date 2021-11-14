import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let repository: InMemoryUsersRepository;

describe("Create User useCase", () => {
  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(repository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      password: "teste123",
      email: "dyego@email",
      name: "Dyego",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a user with exists email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        password: "teste123",
        email: "dyego@email",
        name: "Dyego",
      });

      await createUserUseCase.execute({
        password: "teste123",
        email: "dyego@email",
        name: "Dyego",
      });
    }).rejects.toEqual(new CreateUserError());
  });
});
