#!/usr/bin/env bun
import Logger from "@bejibun/logger";
import {isEmpty, isCommandExists} from "@bejibun/utils";
import {rmSync} from "fs";
import path from "path";

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

Logger.separator();
Logger.setContext(context).info("Cloning the Project");
Logger.separator();

Bun.spawnSync(["git", "clone", "https://github.com/Bejibun-Framework/bejibun.git", directory], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit"
});

Logger.empty();
Logger.separator();
Logger.setContext(context).info("Installing Dependencies");
Logger.separator();

const workingDirectory: string = path.resolve(process.cwd(), directory);

Bun.spawnSync(["bun", "install"], {
    cwd: workingDirectory,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit"
});

Logger.empty();
Logger.separator();
Logger.setContext(context).info("Cleansing");
Logger.separator();

for (const clean of [".git", "CHANGELOG.md", "LICENSE", "ROADMAP.md"]) {
    Logger.setContext("Cleansing").debug(`Removing ${clean}`);
    rmSync(path.resolve(workingDirectory, clean), {
        recursive: true,
        force: true
    });
}

Logger.empty();
Logger.separator();
Logger.setContext(context).info("Setup Environment");
Logger.separator();

Logger.setContext("Environment").debug("Copying .env.example to .env");
Logger.setContext("Environment").debug("Set app name");
await Bun.write(
    path.resolve(workingDirectory, ".env"),
    (
        await Bun.file(path.resolve(workingDirectory, ".env.example")).text()
    ).replaceAll("Bejibun", directory)
);

Logger.empty();
Logger.setContext(context).info("Your framework is ready.., Happy Coding!.");