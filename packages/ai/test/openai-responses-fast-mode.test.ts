import { describe, expect, it } from "vitest";
import { getModel } from "../src/models.js";
import { streamOpenAIResponses } from "../src/providers/openai-responses.js";
import type { Context } from "../src/types.js";

const context: Context = {
	systemPrompt: "You are a helpful assistant.",
	messages: [{ role: "user", content: "Say hello", timestamp: Date.now() }],
};

describe("OpenAI Responses GPT-5.4 fast alias", () => {
	it("maps gpt-5.4-fast to gpt-5.4 with priority tier by default", async () => {
		const model = getModel("openai", "gpt-5.4-fast");
		let capturedPayload: unknown;

		try {
			const controller = new AbortController();
			controller.abort();

			const s = streamOpenAIResponses(model, context, {
				apiKey: "fake-key",
				signal: controller.signal,
				onPayload: (payload) => {
					capturedPayload = payload;
				},
			});

			for await (const event of s) {
				if (event.type === "error") {
					break;
				}
			}
		} catch {
			// Expected to fail due fake API key.
		}

		expect(capturedPayload).toBeDefined();
		if (!capturedPayload || typeof capturedPayload !== "object") {
			throw new Error("Expected payload to be an object");
		}
		const payload = capturedPayload as { model?: unknown; service_tier?: unknown };
		expect(payload.model).toBe("gpt-5.4");
		expect(payload.service_tier).toBe("priority");
	});

	it("honors explicit service tier overrides for gpt-5.4-fast", async () => {
		const model = getModel("openai", "gpt-5.4-fast");
		let capturedPayload: unknown;

		try {
			const controller = new AbortController();
			controller.abort();

			const s = streamOpenAIResponses(model, context, {
				apiKey: "fake-key",
				signal: controller.signal,
				serviceTier: "flex",
				onPayload: (payload) => {
					capturedPayload = payload;
				},
			});

			for await (const event of s) {
				if (event.type === "error") {
					break;
				}
			}
		} catch {
			// Expected to fail due fake API key.
		}

		expect(capturedPayload).toBeDefined();
		if (!capturedPayload || typeof capturedPayload !== "object") {
			throw new Error("Expected payload to be an object");
		}
		const payload = capturedPayload as { model?: unknown; service_tier?: unknown };
		expect(payload.model).toBe("gpt-5.4");
		expect(payload.service_tier).toBe("flex");
	});
});
