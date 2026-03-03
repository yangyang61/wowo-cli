#! /usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import { select, input } from "@inquirer/prompts";
import ora from "ora";
import download from "download-git-repo";
import { promisify } from "util";
import fs from "fs-extra";
import path from "path";

// 包装 download 为 Promise 版本
const downloadPromise = promisify(download);

program.version("1.0.0").description("我的自定义前端脚手架");

program
  .command("create <project-name>")
  .description("创建一个新项目")
  .action(async (projectName) => {
    // --- 第一部分：Inquirer 交互提问 ---
    const template = await select({
      message: "请选择项目模板：",
      choices: [
        {
          name: "普通模板",
          value: "yangyang61/wowo-react-template#main",
        },
        {
          name: "Wallet 模板",
          value: "yangyang61/wowo-react-template#main",
        },
      ],
    });

    const description = await input({
      message: "请输入项目描述：",
      default: "A new frontend project",
    });

    console.log(chalk.blue(`\n准备创建项目: ${projectName}`));
    console.log(chalk.blue(`项目描述: ${description}\n`));

    // --- 第二部分：使用 Ora 显示 Loading，并下载模板 ---
    const spinner = ora("正在拉取远程模板...").start();

    try {
      // download-git-repo 格式: 'direct:url#branch'
      // clone: true 表示使用 git clone
      await downloadPromise(template, projectName);

      spinner.succeed(chalk.green("模板下载成功！"));

      const pkgPath = path.join(process.cwd(), projectName, "package.json");
      const pkg = await fs.readJson(pkgPath);
      pkg.name = projectName; // 修改为用户输入的项目名
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });

      console.log("\n--------------------------");
      console.log(`  cd ${projectName}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
      console.log("--------------------------\n");
    } catch (err) {
      spinner.fail(chalk.red("模板下载失败，请检查网络或 URL："));
      console.error(err);
    }
  });

program.parse(process.argv);
