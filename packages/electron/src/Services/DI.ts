import 'reflect-metadata';
import { Container } from 'inversify';

class DependencyInjection {
    private container: Container;
    private setupCallback: (container: Container) => void = () => console.log('Setup unconfigured');
    private configureCallback: (container: Container) => void = () => console.log('Configure unconfigured');

    constructor() {
        this.container = new Container();
    }

    setup = (callback: (container: Container) => void) => {
        this.setupCallback = callback;
    };

    configure = (callback: (container: Container) => void) => {
        this.configureCallback = callback;
    };

    run = async (callback: (container: Container) => Promise<void>): Promise<void> => {
        this.setupCallback(this.container);
        this.configureCallback(this.container);
        await callback(this.container);
    };

    mock = (callback: (container: Container) => void) => {
        this.container.snapshot();
        this.setupCallback(this.container);
        callback(this.container);
    };

    unmock = () => {
        this.container.restore();
    };

    getContainer = () => this.container;
}

export const DI = new DependencyInjection();