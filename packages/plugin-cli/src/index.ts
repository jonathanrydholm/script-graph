#!/usr/bin/env node

import { BuildPlugin } from 'BuildPlugin';
import { Command } from 'commander';
import { CreatePlugin } from 'CreatePlugin';

const program = new Command();

program
    .name('@script_graph/plugin-cli')
    .description('Script Graph plugin CLI')
    .version('0.0.1');

// attach subcommands
program.addCommand(CreatePlugin);
program.addCommand(BuildPlugin);

program.parse();
