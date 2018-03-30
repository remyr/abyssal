export class UserService {
  public isAdmin() {
    return Math.random() >= 0.5;
  }
}
