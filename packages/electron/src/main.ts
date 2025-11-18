import { app } from 'electron';
import { ElectronApp } from './Services/App';
import { Configuration } from './Services/Configuration';
import { DI } from './Services/DI';
import { IpcHandler } from './Services/IpcHandler';
import { Storage } from './Services/Storage';
import {
    IConfiguration,
    IElectronApp,
    IIpcHandler,
    IStorage,
} from './Services/types';
import { FlowRuntime } from '@script_graph/flow-runtime';
import { PluginInstaller } from '@script_graph/plugin-installer';
import { join } from 'path';
import { ILogger, Logger } from '@script_graph/logger';

DI.setup((container) => {
    container
        .bind<FlowRuntime>('FlowRuntime')
        .to(FlowRuntime)
        .inSingletonScope();
    container
        .bind<PluginInstaller>('PluginInstaller')
        .to(PluginInstaller)
        .inSingletonScope();

    container.bind<ILogger>('ILogger').to(Logger).inSingletonScope();
    container
        .bind<IConfiguration>('IConfiguration')
        .to(Configuration)
        .inSingletonScope();
    container
        .bind<IIpcHandler>('IIpcHandler')
        .to(IpcHandler)
        .inSingletonScope();
    container.bind<IStorage>('IStorage').to(Storage).inSingletonScope();
    container
        .bind<IElectronApp>('IElectronApp')
        .to(ElectronApp)
        .inSingletonScope();
});

DI.configure((container) => {
    container.get<ILogger>('ILogger').init({
        development:
            container.get<IConfiguration>('IConfiguration').environment() ===
            'dev',
    });
    container.get<IStorage>('IStorage').init();
});

DI.run(async (container) => {
    try {
        container.get<IIpcHandler>('IIpcHandler').init();
        await container.get<IElectronApp>('IElectronApp').init();

        container
            .get<PluginInstaller>('PluginInstaller')
            .watchPlugins(join(app.getPath('userData'), 'plugins'));

        container
            .get<PluginInstaller>('PluginInstaller')
            .onPluginsModified((plugins) => {
                /** Emit to client */
                container
                    .get<IElectronApp>('IElectronApp')
                    .getMainWindow()
                    .webContents.send(
                        'onPluginsModified',
                        JSON.stringify(plugins),
                    );
                /** Update available runtime nodes */
                container
                    .get<FlowRuntime>('FlowRuntime')
                    .setSGNodes(plugins.flatMap((plugin) => plugin.nodes));
            });
        await container.get<IStorage>('IStorage').loadStore();
        container.get<IIpcHandler>('IIpcHandler').setReady();
    } catch (error) {
        console.log(error);
        console.log('Error starting server', error);
    }
});
