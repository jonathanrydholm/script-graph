import { injectable } from 'inversify';
import { IConfiguration } from './types';
import { app } from 'electron';
import { join } from 'path';

@injectable()
export class Configuration implements IConfiguration {
    pluginPackageJsonPath(): string {
        return join(this.pluginDirectoryPath(), 'package.json');
    }
    pluginDirectoryPath(): string {
        return join(app.getPath('userData'), 'plugins');
    }
    environment(): 'dev' | 'prod' {
        return process.env.DEV === 'true' ? 'dev' : 'prod';
    }
}
