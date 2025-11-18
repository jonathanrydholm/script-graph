import { Command } from 'commander';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export const CreatePlugin = new Command('create-plugin')
    .description('Creates a new script graph plugin in the current directory. ')
    .option('-n, --name <name>', 'Name of the plugin')
    .action(async ({ name }: { name: string }) => {
        const path = process.cwd();

        console.log(`Generating plugin files at: ${path}`);

        console.log('Creating package.json...');
        await GeneratePackageJson(path, name);
        console.log('Creating tsconfig.json...');
        await GenerateTsConfig(path);
        console.log('Creating src folder...');
        await mkdir(join(path, 'src'));
        console.log('Creating entrypoint...');
        await GenerateIndexTs(path);
        console.log('Creating eslint config...');
        await GenerateESLintConfig(path);
        console.log('Creating prettier config...');
        await GeneratePrettierConfig(path);
    });

const GenerateIndexTs = async (path: string) => {
    await writeFile(
        join(path, 'src', 'index.ts'),
        'export default () => console.log("running")',
        'utf8',
    );
};

const GeneratePackageJson = async (path: string, name: string) => {
    await writeFile(
        join(path, 'package.json'),
        JSON.stringify(
            {
                name,
                version: '0.0.1',
                type: 'module',
                main: './dist/index.js',
                types: './dist/index.d.ts',
                scripts: {
                    build: '@script_graph/plugin-cli build-plugin',
                    publish: '@script_graph/plugin-cli publish-plugin',
                },
                devDependencies: {
                    '@eslint/js': '^9.39.1',
                    '@types/node': '^24.10.0',
                    eslint: '^9.39.1',
                    typescript: '~5.9.3',
                    globals: '^16.5.0',
                    'typescript-eslint': '^8.46.3',
                    '@script_graph/plugin-cli': '^0.0.1',
                    '@script_graph/plugin-types': '^0.0.1',
                },
                dependencies: {},
            },
            null,
            4,
        ),
        'utf8',
    );
};

const GenerateTsConfig = async (path: string) => {
    await writeFile(
        join(path, 'tsconfig.json'),
        JSON.stringify(
            {
                compilerOptions: {
                    target: 'ESNext',
                    module: 'ESNext',
                    jsx: 'react-jsx',
                    declaration: true,
                    declarationDir: 'dist/types',
                    outDir: 'dist',
                    esModuleInterop: true,
                    skipLibCheck: true,
                    strict: true,
                    moduleResolution: 'Node',
                    baseUrl: './src',
                },
                include: ['src'],
                exclude: ['node_modules', 'dist'],
            },

            null,
            4,
        ),
        'utf8',
    );
};

const GenerateESLintConfig = async (path: string) => {
    await writeFile(
        join(path, 'eslint.config.js'),
        `import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node,
        },
        parserOptions: {
            tsconfigRootDir: import.meta.dirname,
        },
    },
]);`,
        'utf8',
    );
};

const GeneratePrettierConfig = async (path: string) => {
    await writeFile(
        join(path, '.prettierrc'),
        JSON.stringify(
            {
                semi: true,
                singleQuote: true,
                tabWidth: 4,
            },

            null,
            4,
        ),
        'utf8',
    );
};
