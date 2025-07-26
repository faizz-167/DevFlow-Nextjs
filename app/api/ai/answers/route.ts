import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validation";
// import { openai } from "@ai-sdk/openai";
import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const openai = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
    const { question, content, userAnswer } = await req.json();
    try {
        const validatedData = AIAnswerSchema.safeParse({
            question,
            content,
            userAnswer,
        });
        if (!validatedData.success) {
            throw new ValidationError(
                validatedData.error.flatten().fieldErrors
            );
        }
        const { text } = await generateText({
            model: openrouter("qwen/qwen3-coder:free"),
            prompt: `Generate a markdown-formatted response to the following question: "${question}".
            Consider the provided context:
            **Context:** ${content}

            Also, prioritize and incorporate the user's answer when formulating your response:
            **User's Answer:** ${userAnswer}

            Prioritize the user's answer only if it's correct. If it's incomplete or incorrect, improve or correct it while keeping the response concise and to the point.
            Provide the final answer in markdown format.`,
            system: "You're an expert helping Assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, lists, and code blocks and empasis where necessary. For code-blocks, use smaller case language identifiers like 'javascript', 'python', etc.. ",
        });
        return NextResponse.json(
            { success: true, data: text },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}
