#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import figlet from "figlet";
import chalk from "chalk";

console.log(
  chalk.green(figlet.textSync("zapmux CLI", { horizontalLayout: "full" })),
);

program.version("1.0.0").description("zapmux CLI");

program
  .command("start <projectName>")
  .action((projectName) => {
    console.log(`Creating a new project called ${projectName}...`);
  })
  .description("Start a new tmux session for a saved project");

program
  .command("choose")
  .action(() => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "Choose an option",
          choices: [
            { name: "Project 1", value: "project1" },
            { name: "Project 2", value: "project2" },
          ],
        },
      ])
      .then((answers) => {
        console.log(`You chose: ${answers.choice}`);
      });
  })
  .description("Choose a saved project to start a tmux session");

program
  .command("list")
  .action(() => {
    console.log("Listing saved projects...");
  })
  .description("List all saved projects");

program
  .command("add")
  .action(() => {
    console.log("Adding a new project...");
  })
  .description("Add a new project interactively");

program
  .command("remove <projectName>")
  .action(() => {
    console.log("Removing a project...");
  })
  .description("Remove a project");

program
  .command("edit <projectName>")
  .action(() => {
    console.log("Editing a project...");
  })
  .description("Edit a project");

program.parse(process.argv);
