# Task 2: Model Selection for AI Endpoints - Solution

## Overview

Added model selection capability to chat and generate endpoints, allowing users to choose between GPT-3.5 Turbo, GPT-4, and GPT-4 Turbo models. The model parameter is validated against available models and defaults to GPT-3.5 Turbo if not specified.

## Implementation

### 1. Updated Controller Validation (`src/controllers/ai.controller.js`)

- Imported `AI_MODELS` from constants
- Updated `chatSchema` and `textSchema` to validate `model` parameter:
  ```javascript
  model: z.enum([AI_MODELS.GPT_3_5_TURBO, AI_MODELS.GPT_4, AI_MODELS.GPT_4_TURBO]).optional()
  ```
- Updated `chat` and `generate` handlers to pass model to service methods
- Added model to debug logging

### 2. Updated AI Service (`src/services/ai.service.js`)

**MockAIService:**
- Updated `chatCompletion(messages, _model)` and `generateText(prompt, _systemPrompt, _model)` to accept model parameter
- Model parameter is unused in mock service but maintains interface consistency

**OpenAIService:**
- Updated `chatCompletion()` to accept `model` parameter with default `AI_MODELS.GPT_3_5_TURBO`
- Replaced hardcoded `'gpt-3.5-turbo'` with dynamic `model` parameter:
  ```javascript
  async chatCompletion(messages, model = AI_MODELS.GPT_3_5_TURBO) {
    // ...
    const response = await this.client.chat.completions.create({
      model: model,  // Now uses provided model
      messages: messages,
      // ...
    });
  }
  ```
- Updated `generateText()` to accept and pass model parameter
- Enhanced cache key to include model: `chat:${model}:${hash(...)}` to prevent cross-model cache hits

**AIService:**
- Updated `chatCompletion(messages, model)` and `generateText(prompt, systemPrompt, model)` to accept and pass through model parameter
- Model is passed to underlying service (OpenAI or Mock) and to fallback mock service

## Files Changed

- **Modified:** `src/controllers/ai.controller.js`, `src/services/ai.service.js`

## API Usage

### Chat Endpoint

**POST** `/api/ai/chat`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "gpt-4"
}
```

**Valid Models:**
- `gpt-3.5-turbo` (default)
- `gpt-4`
- `gpt-4-turbo-preview`

### Generate Endpoint

**POST** `/api/ai/generate`

**Request:**
```json
{
  "prompt": "Write a short story",
  "systemPrompt": "You are a creative writer",
  "model": "gpt-4-turbo-preview"
}
```

## Key Features

- **Model Validation**: Only accepts models defined in `AI_MODELS` constants
- **Default Behavior**: Falls back to `GPT_3_5_TURBO` if no model specified
- **Cache Isolation**: Cache keys include model to prevent incorrect cache hits across different models
- **Backward Compatible**: Existing requests without model parameter continue to work

## Testing

```bash
# Test with default model (GPT-3.5 Turbo)
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'

# Test with GPT-4
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}], "model": "gpt-4"}'

# Test with GPT-4 Turbo
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a story", "model": "gpt-4-turbo-preview"}'
```

## Implementation Notes

- ✅ **JavaScript Project**: All files use `.js` extension (not `.ts`)
- ✅ **Model Field Validation**: `chatSchema` includes `model` field validated with `z.enum([AI_MODELS.GPT_3_5_TURBO, AI_MODELS.GPT_4, AI_MODELS.GPT_4_TURBO]).optional()` and passed through to service
- ✅ **Dynamic Model Selection**: `OpenAIService.chatCompletion()` now accepts `model` parameter (defaults to `AI_MODELS.GPT_3_5_TURBO`) instead of hardcoded `'gpt-3.5-turbo'`
- ✅ **Architecture Patterns**: Follows established patterns with separate controllers (`ai.controller.js`), routes (`ai.routes.js`), and singleton service (`aiService`)

