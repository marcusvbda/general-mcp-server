import dotenv from "dotenv";
import OpenAI from "openai";
import type { ToolDefinition, Message } from "./types.js";
dotenv.config();

const llm = {
    model: "gpt-4o-mini",
    setModel: (model: string) => llm.model = model,
    getModel: () => llm.model,
    client: new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1"
    }),
    identifyIntent: async (messages: Message[], tools: Omit<ToolDefinition, 'handler'>[]): Promise<Message> => {
        const { client, getModel } = llm;
        const response = await client.chat.completions.create({
            model: getModel(),
            messages: messages as any,
            tools: tools.map((tool) => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters ? {
                        ...tool.parameters,
                        required: tool.required || [],
                    } : undefined,
                },
            })),
            tool_choice: "auto",
        })
        return response.choices[0]?.message as Message;
    }
}

export default llm;