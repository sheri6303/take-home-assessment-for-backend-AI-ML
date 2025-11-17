# Task 2: Model Selection for AI Endpoints

Added support for selecting different GPT models in the chat and generate endpoints. Users can now pick between GPT-3.5 Turbo, GPT-4, or GPT-4 Turbo.

## Changes

### Controller (`src/controllers/ai.controller.js`)

The `chatSchema` already had a `model` field, but it wasn't being validated or used. Fixed that:

- Imported `AI_MODELS` constants
- Updated validation schemas to check model against allowed values:
  ```javascript
  model: z.enum([AI_MODELS.GPT_3_5_TURBO, AI_MODELS.GPT_4, AI_MODELS.GPT_4_TURBO]).optional()
  ```
- Pass the model parameter through to the service methods
- Added model to debug logs

### AI Service (`src/services/ai.service.js`)

The OpenAI service was hardcoded to use `'gpt-3.5-turbo'`. Made it dynamic:

**OpenAIService:**
- `chatCompletion()` now takes a `model` parameter (defaults to GPT_3_5_TURBO)
- Replaced the hardcoded string with the parameter:
  ```javascript
  async chatCompletion(messages, model = AI_MODELS.GPT_3_5_TURBO) {
    // ...
    const response = await this.client.chat.completions.create({
      model: model,  // was: 'gpt-3.5-turbo'
      // ...
    });
  }
  ```
- Updated `generateText()` to accept and pass through the model
- Added model to cache key so different models don't share cached responses

**MockAIService:**
- Updated signatures to accept model parameter (doesn't use it, but keeps interface consistent)

**AIService:**
- Updated to pass model through to underlying services

## Usage

**Chat endpoint:**
```json
POST /api/ai/chat
{
  "messages": [{"role": "user", "content": "Hello!"}],
  "model": "gpt-4"
}
```

**Generate endpoint:**
```json
POST /api/ai/generate
{
  "prompt": "Write a story",
  "model": "gpt-4-turbo-preview"
}
```

Available models:
- `gpt-3.5-turbo` (default if not specified)
- `gpt-4`
- `gpt-4-turbo-preview`

## Testing

```bash
# Default model
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'

# With GPT-4
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}], "model": "gpt-4"}'
```

## Notes

- JavaScript project - all `.js` files
- Model field was already in `chatSchema`, just needed validation and passing through
- `OpenAIService.chatCompletion()` was hardcoded - now uses the model parameter
- Cache keys include model to prevent cross-model cache hits
- Backward compatible - existing requests without model still work
