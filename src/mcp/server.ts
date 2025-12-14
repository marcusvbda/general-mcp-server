import llm from "./llm";
import type { Tool, ToolDefinition, ParsedResponse, Message, ToolResult } from "./types.js";

const mcpServer = {
    tools: {} as Tool,
    setTools: (tools: Tool) => mcpServer.tools = tools,
    history: [] as Message[],
    addHistory: (history: Message[]) => mcpServer.history.push(...history),
    getHistory: (): Message[] => mcpServer.history,
    maxIterations: 10,
    setMaxIterations: (maxIterations: number) => mcpServer.maxIterations = maxIterations,
    assistantDescription: "",
    setAssistantDescription: (description: string) => mcpServer.assistantDescription = description,
    listTools: (): Omit<ToolDefinition, 'handler'>[] => {
        const { tools } = mcpServer;
        return Object.keys(tools).map((key: string) => {
            const { handler, ...toolInfo } = tools[key];
            return toolInfo;
        })
    },
    ask: async (prompt: string): Promise<ParsedResponse> => await mcpServer.orchestrateConversation(prompt),
    parseResponse: (intent: any): ParsedResponse => {
        let content = intent?.content;
        if (Array.isArray(content) && content.length > 0) {
            if (content[0]?.text) {
                content = content[0].text;
            } else if (content[0]?.type === 'text' && content[0]?.text) {
                content = content[0].text;
            } else {
                content = JSON.stringify(content);
            }
        }

        if (!content) {
            content = intent?.text || "No response";
        }

        if (typeof content === 'string') {
            const cleanedContent = content
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/, '')
                .replace(/\s*```$/g, '')
                .trim();

            try {
                const parsedContent = JSON.parse(cleanedContent);
                return { type: "json", data: parsedContent };
            } catch (e) {
                return { type: "text", text: content };
            }
        }

        if (typeof content === 'object' && content !== null) {
            return { type: "json", data: content };
        }

        return { type: "text", text: String(content) };
    },
    orchestrateConversation: async (prompt: string): Promise<ParsedResponse> => {
        const { listTools, executeTool, maxIterations, parseResponse, addHistory, getHistory } = mcpServer;
        const { identifyIntent } = llm;
        const history = getHistory();

        const messages: Message[] = [
            {
                role: "system",
                content: mcpServer.assistantDescription,
            },
            ...history,
            {
                role: "user",
                content: prompt,
            },
        ].filter((x): x is Message => x.content !== null && x.content !== undefined);

        let counterMaxIterations = maxIterations;
        while (counterMaxIterations > 0) {
            counterMaxIterations--;
            const intent = await identifyIntent(messages, listTools());
            addHistory(messages);

            if (!intent?.tool_calls || intent.tool_calls.length === 0) {
                return parseResponse(intent);
            }
            messages.push(intent);
            const toolResults = [];
            for (const tool_call of intent.tool_calls) {
                const action: any = tool_call?.function;
                if (action?.name) {
                    let parsedArgs = action.arguments;
                    if (typeof action.arguments === 'string') {
                        try {
                            parsedArgs = JSON.parse(action.arguments);
                        } catch (e) {
                            parsedArgs = action.arguments;
                        }
                    }

                    const result = await executeTool(action.name, parsedArgs);
                    const parsedResult = parseResponse(result);

                    let resultText = '';
                    if (parsedResult.type === 'json') {
                        resultText = JSON.stringify(parsedResult.data);
                    } else {
                        resultText = parsedResult.text;
                    }

                    toolResults.push({
                        tool_call_id: tool_call.id,
                        role: "tool" as const,
                        name: action.name,
                        content: resultText,
                    });
                }
            }

            messages.push(...toolResults);
        }

        return { type: "error", text: "Maximum iterations reached" };
    },
    executeTool: async (toolName: string, args: any): Promise<ToolResult> => {
        const { tools } = mcpServer;
        const tool = tools[toolName];
        if (!tool) {
            return {
                content: [
                    { type: "text", text: `Error: Tool '${toolName}' not found` }
                ]
            };
        }
        return await tool.handler(args);
    }
}

export default mcpServer;