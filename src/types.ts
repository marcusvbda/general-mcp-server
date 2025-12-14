import type { Tool } from "./mcp/types.js";

export type Server = {
  tools: Tool;
  listTools: () => { [key: string]: { name: string } };
};

