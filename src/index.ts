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

program
  .version("0.2.0")
  .description(
    chalk.green(figlet.textSync("zapmux CLI", { horizontalLayout: "full" })),
  );

program
  .command("start <projects...>")
  .action(start)
  .description("Start a new tmux session for a saved project");

program
  .command("choose")
  .action(choose)
  .description("Choose a saved project to start a tmux session");

program.command("list").action(list).description("List all saved projects");

program
  .command("add")
  .action(add)
  .description("Add a new project interactively");

program
  .command("remove <projectName>")
  .action(remove)
  .description("Remove a project");

program
  .command("edit <projectName>")
  .action(edit)
  .description("Edit a project");

program.parse(process.argv);
