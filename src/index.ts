#!/usr/bin/env node

import { program } from "commander";
import figlet from "figlet";
import chalk from "chalk";
import start from "./commands/start";
import choose from "./commands/choose";
import list from "./commands/list";
import add from "./commands/add";
import remove from "./commands/remove";
import edit from "./commands/edit";
import stop from "./commands/stop";

program
  .version("0.4.0")
  .description(
    chalk.green(figlet.textSync("zapmux CLI", { horizontalLayout: "full" })),
  );

program
  .command("start [projects...]")
  .action(start)
  .description("Start a new tmux session for a saved project");

program
  .command("choose [projectName]")
  .action(choose)
  .description("Choose a saved project to start a tmux session");

program.command("list").action(list).description("List all saved projects");

program
  .command("add")
  .action(add)
  .description("Add a new project interactively");

program
  .command("remove [projectName...]")
  .action(remove)
  .description("Remove a project");

program
  .command("edit [projectName]")
  .action(edit)
  .description("Edit a project");

program
  .command("stop [projectName]")
  .action(stop)
  .description("Stop a project if it has a running tmux session");

program.parse(process.argv);
