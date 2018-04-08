import { App, Application, ApplicationOptions } from "@abyssaljs/core";

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

const application = new ExampleApplication({
  port: 1337,
  networkInterface: "0.0.0.0",
});
application.start();
