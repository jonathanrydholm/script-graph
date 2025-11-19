import { injectable } from 'inversify';
import Pino, { Logger as PinoLogger, Level } from 'pino';
import Pretty from 'pino-pretty';

@injectable()
export class Logger implements ILogger {
    private pino!: ChildLogger;

    init(options: ILoggerOptions): void {
        this.pino = Pino(
            options.development
                ? Pretty({
                      colorize: true,
                      singleLine: true,
                      levelFirst: true,
                      minimumLevel: options.level,
                  })
                : {
                      level: options.level,
                  },
        );
    }

    getLogger(service?: string): ChildLogger {
        if (!service) {
            return this.pino;
        }
        return this.pino.child({ service });
    }
}

export interface ILogger {
    init(options: ILoggerOptions): void;
    getLogger(service?: string): ChildLogger;
}

type ILoggerOptions = {
    development: boolean;
    level?: Level;
};

export type ChildLogger = PinoLogger;
