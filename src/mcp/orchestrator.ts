import dotenv from "dotenv";
import OpenAI from "openai";
import mcpServer from "./server.js";

import type { ToolDefinition } from "./types.js";

dotenv.config();

type Message = {
    role: "system" | "user" | "assistant" | "tool";
    content?: string | null;
    name?: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}

type ToolCall = {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string | object;
    };
}

type ParsedResponse =
    | { type: "json"; data: any }
    | { type: "text"; text: string }
    | { type: "error"; text: string };

class McpOrchestrator {
    private model: string = process.env.OPEN_AI_MODEL!;
    private client: OpenAI;
    private history: Message[] = [];
    private maxIterations: number = 10;
    private assistantDescription: string = "";


    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY!,
            baseURL: process.env.OEPN_AI_BASE_URL!
        });
    }

    setModel(model: string): void {
        this.model = model;
    }

    setMaxIterations(iterations: number): void {
        this.maxIterations = iterations;
    }

    setAssistantDescription(description: string): void {
        this.assistantDescription = description;
    }

    addHistory(messages: Message[]): void {
        this.history.push(...messages);
    }

    getHistory(): Message[] {
        return [...this.history];
    }

    private async askLLM(messages: Message[], tools: Omit<ToolDefinition, 'handler'>[]): Promise<Message> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: messages as any,
            tools: tools.map((tool) => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema,
                },
            })),
            tool_choice: "auto",
        });
        return response.choices[0]?.message as Message;
    }

    private parseResponse(intent: any): ParsedResponse {
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
    }

    async ask(prompt: string): Promise<ParsedResponse> {
        const toolsList = mcpServer.handleToolsList();
        const tools = toolsList.tools;

        const messages: Message[] = [
            {
                role: "system",
                content: this.assistantDescription,
            },
            ...this.getHistory(),
            {
                role: "user",
                content: prompt,
            },
        ].filter((x): x is Message => x.content !== null && x.content !== undefined);

        let counterMaxIterations = this.maxIterations;
        while (counterMaxIterations > 0) {
            counterMaxIterations--;
            const intent = await this.askLLM(messages, tools);
            this.addHistory(messages);

            if (!intent?.tool_calls || intent.tool_calls.length === 0) {
                return this.parseResponse(intent);
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

                    const result = await mcpServer.handleToolsCall({
                        name: action.name,
                        arguments: parsedArgs
                    });

                    let resultText = '';
                    if (result.content && result.content.length > 0) {
                        resultText = result.content[0].text || JSON.stringify(result.content);
                    } else {
                        resultText = JSON.stringify(result);
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
    }
}

export default new McpOrchestrator();

