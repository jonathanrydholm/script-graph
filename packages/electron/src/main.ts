import { ElectronApp } from './Services/App';
import { BlueprintService } from './Services/Blueprints';
import { DI } from './Services/DI';
import { IpcHandler } from './Services/IpcHandler';
import { Storage } from './Services/Storage';
import {
    IBlueprintService,
    IElectronApp,
    IIpcHandler,
    IStorage,
} from './Services/types';

DI.setup((container) => {
    container
        .bind<IIpcHandler>('IIpcHandler')
        .to(IpcHandler)
        .inSingletonScope();
    container.bind<IStorage>('IStorage').to(Storage).inSingletonScope();
    container
        .bind<IElectronApp>('IElectronApp')
        .to(ElectronApp)
        .inSingletonScope();
    container
        .bind<IBlueprintService>('IBlueprintService')
        .to(BlueprintService)
        .inSingletonScope();
});

DI.configure((container) => {
    container.get<IStorage>('IStorage').init();
});

DI.run(async (container) => {
    try {
        container.get<IIpcHandler>('IIpcHandler').init();
        await container.get<IElectronApp>('IElectronApp').init();
        await container
            .get<IBlueprintService>('IBlueprintService')
            .loadPlugins();
        await container.get<IStorage>('IStorage').loadStore();
        container.get<IIpcHandler>('IIpcHandler').setReady();
    } catch (error) {
        console.log(error);
        console.log('Error starting server', error);
    }
});
