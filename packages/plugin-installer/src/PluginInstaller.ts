import AdmZip from 'adm-zip';
import { readFile, rm } from 'fs/promises';
import { dirname, extname, join, parse } from 'path';
import Module from 'module';
import { Plugin } from '@script_graph/plugin-types';
import { inject, injectable } from 'inversify';
import { LoadedPlugin } from 'types';
import { watch } from 'chokidar';
import { ChildLogger, ILogger } from '@script_graph/logger';

/** TODO, watch plugin directory  */

@injectable()
export class PluginInstaller {
    private logger: ChildLogger;

    constructor(@inject('ILogger') logger: ILogger) {
        this.logger = logger.getLogger('PluginInstaller');
    }

    private registeredPlugins: LoadedPlugin[] = [];

    private pluginsModifiedListeners: ((plugins: LoadedPlugin[]) => void)[] =
        [];

    /** Listen to any plugin mutations originating directly from the filesystem. */
    onPluginsModified(listener: (plugins: LoadedPlugin[]) => void) {
        this.pluginsModifiedListeners.push(listener);
    }

    getRegisteredPlugins() {
        return this.registeredPlugins;
    }

    installPlugin() {
        // Download zipped plugin from somwehere. Where? Should be a configurable endpoint but this endpoint has to follow the same format. Marketplace api.
        // Put it into the installed plugins folder
    }

    uninstallPlugin() {
        // Remove plugin from installed plugins
    }

    watchPlugins = (pluginDirectory: string) => {
        const watcher = watch(pluginDirectory, {
            persistent: true,
            ignoreInitial: false,
            depth: 0,
        });

        watcher
            .on('add', async (file) => {
                if (this.isPluginFile(file)) {
                    this.logger.info('Plugin added');
                    await this.registerPlugin(file);
                    this.pluginsModifiedListeners.forEach((listener) =>
                        listener(this.registeredPlugins),
                    );
                }
            })
            .on('change', async (file) => {
                if (this.isPluginFile(file)) {
                    this.logger.info('Plugin modified');
                    this.unregisterPlugin(file);
                    await this.registerPlugin(file);
                    this.pluginsModifiedListeners.forEach((listener) =>
                        listener(this.registeredPlugins),
                    );
                }
            })
            .on('unlink', (file) => {
                if (this.isPluginFile(file)) {
                    this.logger.info('Plugin removed');
                    this.unregisterPlugin(file);
                    this.pluginsModifiedListeners.forEach((listener) =>
                        listener(this.registeredPlugins),
                    );
                }
            })
            .on('error', (err) => console.error('Watcher error:', err));
    };

    private isPluginFile(filePath: string): boolean {
        return extname(filePath).toLowerCase() === '.zip';
    }

    private unregisterPlugin(zipPath: string) {
        this.registeredPlugins = this.registeredPlugins.filter(
            ({ path }) => path !== zipPath,
        );
    }

    private async registerPlugin(zipPath: string) {
        try {
            const unsippedDirname = join(dirname(zipPath), crypto.randomUUID());

            this.logger.info('Registering plugin ' + zipPath);

            new AdmZip(zipPath).extractAllTo(unsippedDirname, true);

            this.logger.info('Zip done');

            const rawPackageJson = await readFile(
                join(unsippedDirname, 'package.json'),
                'utf8',
            );

            this.logger.info('raw done');

            const packageJson = JSON.parse(rawPackageJson);

            this.logger.info('parse done');

            const requireFromPlugins = Module.createRequire(
                join(unsippedDirname, 'dist', 'index.js'),
            );

            const requirePath = requireFromPlugins.resolve('./index.js');

            this.logger.info('require done');

            const plugin = requireFromPlugins('./index.js').default as Plugin;

            delete require.cache[requirePath];

            this.logger.info('load done');

            this.registeredPlugins.push({
                path: zipPath,
                name: packageJson.name,
                version: packageJson.version,
                ...plugin,
            });
            await rm(unsippedDirname, { force: true, recursive: true });
        } catch (e) {
            this.logger.error(e, 'Could not register plugin: ' + zipPath);
        }
    }
}
