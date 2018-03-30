import "reflect-metadata";
import {
  APP_CONTROLLERS,
  APP_SERVICES,
  APP_PLUGINS,
} from "../reflection-types";

export interface IAppOptions {
  controllers?: any[];
  services?: any[];
  plugins?: any[];
}

export function App(options: IAppOptions) {
  return (target: any) => {
    Reflect.defineMetadata(
      APP_CONTROLLERS,
      options.controllers,
      target.prototype,
    );
    Reflect.defineMetadata(APP_SERVICES, options.services, target.prototype);
    Reflect.defineMetadata(APP_PLUGINS, options.plugins, target.prototype);
  };
}
