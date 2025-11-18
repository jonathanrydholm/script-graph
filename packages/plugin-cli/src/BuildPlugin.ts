import { Command } from 'commander';
import { resolve } from 'path';
import { build } from 'tsup';
import { create } from 'archiver';
import { createWriteStream } from 'fs';
import { readFile, rm } from 'fs/promises';
import { Logger } from '@script_graph/logger';

export const BuildPlugin = new Command('build-plugin')
    .description('Creates a new script graph plugin in the current directory. ')
    .action(async () => {
        const loggerDef = new Logger();
        loggerDef.init({ development: true });
        const logger = loggerDef.getLogger();
        const cwd = process.cwd();

        const packageJsonSource = await readFile(
            resolve(cwd, 'package.json'),
            'utf8',
        );

        const packageJsonParsed = JSON.parse(packageJsonSource) as {
            version: string;
            name: string;
        };

        const entry = resolve(cwd, 'src/index.ts');

        logger.info(
            `Building plugin ${packageJsonParsed.name} with version ${packageJsonParsed.version}...`,
        );

        try {
            logger.debug(`Building with tsup.`);
            await build({
                entry: [entry],
                format: ['esm'],
                dts: true,
                sourcemap: true,
                clean: true,
                minify: false,
                target: 'es2020',
                outDir: resolve(cwd, 'dist'),
                silent: true,
            });

            logger.debug(`Creating archive...`);
            const archive = create('zip', {
                zlib: { level: 9 },
            });

            logger.debug(`Creating archive dist directory.`);
            archive.directory(`${resolve(cwd, 'dist')}/`, 'dist');

            logger.debug(`Creating archive package.json file.`);
            archive.file(resolve(cwd, 'package.json'), {
                name: 'package.json',
            });

            logger.debug(`Creating writestream`);
            const output = createWriteStream(
                resolve(
                    cwd,
                    `${packageJsonParsed.name.replaceAll('/', '_')}-${packageJsonParsed.version}.zip`,
                ),
            );

            output.on('close', function () {
                logger.info(archive.pointer() + ' total bytes');
            });

            archive.on('warning', function (err) {
                logger.warn(err);
                throw err;
            });

            archive.on('error', function (err) {
                logger.error(err);
                throw err;
            });

            archive.pipe(output);

            logger.debug(`Finalizing archiving`);
            await archive.finalize();

            logger.info('Finished');
        } catch (e) {
            logger.error(e);
        }

        logger.debug(`Removing generated dist folder`);
        await rm(resolve(cwd, 'dist'), { recursive: true, force: true });
    });
