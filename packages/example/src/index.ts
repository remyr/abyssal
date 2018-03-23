import { App, Application, ApplicationOptions } from "@abyssal/core";

import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";

@App({
  controllers: [UserController],
  services: [UserService],
})
class ExampleApplication extends Application {
  constructor(options: ApplicationOptions) {
    super(options);
  }
}

const application = new ExampleApplication({ port: 1337 });
application.start();
