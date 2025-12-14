import { Tool } from "../types.js";

const helloWorldTool: Tool = {
    hello_world: {
        name: "hello_world",
        description: "Say hello to a person.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                }
            },
            required: ["name"],
        },
        handler: async (args: { name: string }) => {
            return {
                content: [
                    { type: "text", text: `Hello ${args.name}!` }
                ]
            }
        }
    }
}

export default helloWorldTool;