#!/usr/bin/env bun
import Logger from "@bejibun/logger";
import Chalk from "@bejibun/logger/facades/Chalk";
import {isEmpty, isCommandExists} from "@bejibun/utils";
import {rmSync} from "fs";
import path from "path";
import ora from "ora";

const context: string = "Bejibun";

if (!isCommandExists("git")) {
    Logger.setContext(context).error("The git command doesn't exists.");
    process.exit(1);
}

if (!isCommandExists("bun")) {
    Logger.setContext(context).error("The bun command doesn't exists.");
    process.exit(1);
}

const directory: string | undefined = process.argv.slice(2)[0];

if (isEmpty(directory)) {
    Logger.setContext(context).error("The destination directory not provided.");
    process.exit(1);
}

const spinnerPullStarterKit = ora(Chalk.setValue(" Pulling starter kit...").inline().warn().show()).start();
Bun.spawnSync(["git", "clone", "https://github.com/Bejibun-Framework/bejibun.git", directory]);
spinnerPullStarterKit.succeed(Chalk.setValue(" Pulling starter kit.").inline().warn().show());

const workingDirectory: string = path.resolve(process.cwd(), directory);

const spinnerInstallDependencies = ora(Chalk.setValue(" Installing dependencies...").inline().warn().show()).start();
Bun.spawnSync(["bun", "install"], {
    cwd: workingDirectory
});
spinnerInstallDependencies.succeed(Chalk.setValue(" Installing dependencies.").inline().warn().show());

const spinnerCleansing = ora(Chalk.setValue(" Cleansing...").inline().warn().show()).start();
for (const clean of [".git", "CHANGELOG.md", "LICENSE", "ROADMAP.md"]) {
    rmSync(path.resolve(workingDirectory, clean), {
        recursive: true,
        force: true
    });
}
spinnerCleansing.succeed(Chalk.setValue(" Cleansing.").inline().warn().show());

const spinnerSetupEnvironment = ora(Chalk.setValue(" Setup environment...").inline().warn().show()).start();
await Bun.write(
    path.resolve(workingDirectory, ".env"),
    (
        await Bun.file(path.resolve(workingDirectory, ".env.example")).text()
    ).replaceAll("Bejibun", directory)
);
spinnerSetupEnvironment.succeed(Chalk.setValue(" Setup environment.").inline().warn().show());

Logger.empty();
console.log(Chalk.setValue("Success! Project initialization completed.").inline().debug().show());