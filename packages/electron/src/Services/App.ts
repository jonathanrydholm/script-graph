import { inject, injectable } from 'inversify';
import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { join } from 'path';
import { IConfiguration, IElectronApp } from './types';
import { ChildLogger, ILogger } from '@script_graph/logger';

@injectable()
export class ElectronApp implements IElectronApp {
    private instance: Electron.App;

    private mainWindow: BrowserWindow;

    private logger: ChildLogger;

    constructor(
        @inject('ILogger') logger: ILogger,
        @inject('IConfiguration') private config: IConfiguration,
    ) {
        this.logger = logger.getLogger('ElectronApp');
    }

    async init(): Promise<void> {
        if (started) {
            this.logger.info('App already started, quitting.');
            app.quit();
        }

        this.instance = app;

        await new Promise<void>((resolve, reject) => {
            this.instance.on('ready', () => {
                this.createWindow().then(resolve);
            });

            this.instance.on('window-all-closed', () => {
                if (process.platform !== 'darwin') {
                    this.instance.quit();
                    reject();
                }
            });

            this.instance.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow().then(resolve);
                }
            });
        });
    }

    getMainWindow(): BrowserWindow {
        return this.mainWindow;
    }

    private createWindow = async () => {
        this.logger.info('App is ready, creating window');

        this.mainWindow = new BrowserWindow({
            width: 1920,
            height: 1080,
            darkTheme: true,
            resizable: true,
            frame: true,
            center: true,
            webPreferences: {
                preload: join(__dirname, 'preload.js'),
            },
        });

        // and load the index.html of the app.
        if (this.config.environment() === 'dev') {
            await this.mainWindow.loadURL('http://localhost:5173');
        } else {
            await this.mainWindow.loadFile(
                join(__dirname, '..', 'ui', 'dist', 'index.html'),
            );
        }
    };
}
