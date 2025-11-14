import { injectable } from 'inversify';
import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { join } from 'path';
import { IElectronApp } from './types';

@injectable()
export class ElectronApp implements IElectronApp {
    private instance: Electron.App;

    private mainWindow: BrowserWindow;

    async init(): Promise<void> {
        if (started) {
            console.log('App already started, quitting.');
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
        console.log('App is ready, creating window');

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

        const dev = 'http://localhost:5173';

        // and load the index.html of the app.
        if (dev) {
            await this.mainWindow.loadURL(dev);
        } else {
            await this.mainWindow.loadFile(
                join(
                    __dirname,
                    `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
                ),
            );
        }
    };
}
