export type ToolParameterProperty = {
    type: string;
    description?: string;
    [key: string]: any;
}

export type ToolParameters = {
    type: "object";
    properties: {
        [key: string]: ToolParameterProperty;
    };
    required?: string[];
}

export type ToolDefinition = {
    name: string;
    description: string;
    parameters?: ToolParameters;
    required?: string[];
    handler: (args: any) => Promise<ToolResult>;
}

export type Tool = {
    [key: string]: ToolDefinition;
}

export type ToolResult = {
    content: Array<{
        type: string;
        text: string;
        [key: string]: any;
    }>;
}

export type ParsedResponse =
    | { type: "json"; data: any }
    | { type: "text"; text: string }
    | { type: "error"; text: string };

export type Message = {
    role: "system" | "user" | "assistant" | "tool";
    content?: string | null;
    name?: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}

export type ToolCall = {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string | object;
    };
}