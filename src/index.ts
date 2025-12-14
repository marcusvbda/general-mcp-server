import mcpServer from "./mcp/server.js";
import orchestrator from "./mcp/orchestrator.js";
import formula1Tool from "./mcp/tools/formula-1.js";
import helloWorldTool from "./mcp/tools/hello-world.js";
import userTool from "./mcp/tools/user.js";

// Register tools
mcpServer.setTools({
    ...helloWorldTool,
    ...userTool,
    ...formula1Tool
});

orchestrator.setAssistantDescription("Você é um assistente de IA que responde perguntas sobre o usuario. Seu nome é TARS - se for pedido JSON, responda APENAS o JSON, nada além disso.");
const response = await orchestrator.ask("Diga hello world para o usuario");
console.log(response);