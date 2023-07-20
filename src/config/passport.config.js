import { Command } from "commander";

const program = new Command();

program.option("-p <port>", "Puerto del servidor", 8080);

program.parse();

export default program;