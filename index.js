#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const _ = require("lodash");
const pkgDir = require("pkg-dir");

const simpleGit = require("simple-git/promise")(pkgDir.sync());

inquirer
  .prompt([
    {
      name: "isJiraTicket",
      type: "confirm",
      message: "Is this code tied to a Jira ticket?",
    },
    {
      name: "jiraTicket",
      type: "input",
      message: "Enter the ticket number (i.e. ABC-101):",
      when: ({ isJiraTicket }) => {
        return !!isJiraTicket;
      },
    },
    {
      name: "description",
      type: "input",
      message: "Enter the description for your commit:",
      transformer: (input) => {
        const words = _.words(input);
        return words.map((word) => _.upperFirst(_.toLower(word))).join(" ");
      },
    },
    {
      name: "confirmCommit",
      type: "confirm",
      message: "Does everything look good?",
    },
  ])
  .then(({ isJiraTicket, jiraTicket, description, confirmCommit }) => {
    console.log("");
    // new line

    if (confirmCommit) {
      let message = "";
      if (isJiraTicket) {
        message = `${jiraTicket}: ${description}`;
      } else {
        message = `Tech: ${description}`;
      }

      simpleGit
        .commit(message)
        .then(() => {
          console.log(chalk.green("Code Committed:"));
          console.log(chalk.green(message));
        })
        .catch((error) => {
          console.log(chalk.red(error.message));
        });
    } else {
      console.log(chalk.red("Commit Aborted!"));
    }
  });
