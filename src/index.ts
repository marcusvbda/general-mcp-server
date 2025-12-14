import mcpServer from "./mcp/server";
import formula1Tool from "./mcp/tools/formula-1";
import helloWorldTool from "./mcp/tools/hello-world";
import userTool from "./mcp/tools/user";

mcpServer.setAssistantDescription("Você é um assistente de IA que responde perguntas sobre o usuario. Seu nome é TARS - se for pedido JSON, responda APENAS o JSON, nada além disso.");
mcpServer.setTools({
    ...helloWorldTool,
    ...userTool,
    ...formula1Tool
});
const response = await mcpServer.ask("Quem venceu a formula 1 em 2025?")
console.log(response);