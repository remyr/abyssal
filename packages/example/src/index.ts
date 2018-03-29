import { App, Application, ApplicationOptions } from "@abyssal/core";

import { Plugins } from "./plugins";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";

@App({
  controllers: [UserController],
  services: [UserService],
  plugins: Plugins,
})
class ExampleApplication extends Application {
  constructor(options: ApplicationOptions) {
    super(options);
  }
}

const application = new ExampleApplication({ port: 8000 });
application.start();
