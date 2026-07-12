import { streamText, convertToCoreMessages, StreamData } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { tools } from '@/lib/tools'
import { log } from '@/lib/logger'
import { describeToolActivity } from '@/lib/thinking'
import type { UserProfile, ProviderConfig, AIProvider } from '@/types'
import { PROVIDER_META } from '@/types'
import type { LanguageModelV1 } from 'ai'

const BASE_SYSTEM = `You are ShopSmart's helpful shopping assistant. You help customers:
- Find products using natural language search
- Compare items side by side
- Get personalized recommendations based on their profile
- Track prices and set drop alerts
- Understand what a product does and whether it fits their needs

Always be concise. After searching, highlight the 2–3 best matches with a short reason for each rather than listing everything. When a user profile is active, use it to personalize your suggestions naturally — mention why a product fits them specifically.

Available tools: searchProducts, getProductDetails, compareProducts, trackPrice, getRecommendations.`

const AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1'

function buildModel(config: ProviderConfig): LanguageModelV1 {
  const { provider, apiKey } = config
  const model = PROVIDER_META[provider].model
  const providerMap: Record<AIProvider, () => LanguageModelV1> = {
    openai: () => createOpenAI({ apiKey })(model),
    anthropic: () => createAnthropic({ apiKey })(model),
    google: () => createGoogleGenerativeAI({ apiKey })(model),
    xai: () => createXai({ apiKey })(model),
    // Vercel AI Gateway exposes an OpenAI-compatible endpoint that routes to
    // any provider/model behind a single API key, e.g. "anthropic/claude-3-5-sonnet".
    vercel: () => createOpenAI({ apiKey, baseURL: AI_GATEWAY_BASE_URL })(model),
  }
  return providerMap[provider]()
}

export async function POST(req: Request) {
  const { messages, profile, providerConfig }: {
    messages: unknown[]
    profile?: UserProfile
    providerConfig?: ProviderConfig
  } = await req.json()

  if (!providerConfig?.apiKey) {
    return new Response(JSON.stringify({ error: 'No API key provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  log('chat:request', {
    messageCount: messages.length,
    profileId: profile?.id ?? null,
    provider: providerConfig.provider,
    model: PROVIDER_META[providerConfig.provider].model,
  })

  const system = profile
    ? `${BASE_SYSTEM}\n\nActive user profile:\nName: ${profile.name}\n${profile.context}`
    : BASE_SYSTEM

  // Carries "thinking" trace lines (derived from tool activity) to the client
  // alongside the normal text stream, so the UI can render a live thought
  // bubble without needing a reasoning-capable model.
  const data = new StreamData()

  try {
    const coreMessages = convertToCoreMessages(messages as Parameters<typeof convertToCoreMessages>[0])

    const result = streamText({
      model: buildModel(providerConfig),
      system,
      messages: coreMessages,
      tools,
      maxSteps: 5,
      onStepFinish: (step) => {
        const toolsUsed = step.toolCalls?.map((t) => t.toolName) ?? []
        log('chat:step', {
          toolsUsed,
          finishReason: step.finishReason,
          textLength: step.text?.length ?? 0,
        })

        for (const toolResult of step.toolResults ?? []) {
          const thought = describeToolActivity(toolResult.toolName, toolResult.args, toolResult.result)
          log('agent:thinking', { toolName: toolResult.toolName, thought })
          data.appendMessageAnnotation({ type: 'thinking', text: thought, at: Date.now() })
        }
      },
      onFinish: ({ usage }) => {
        log('chat:finish', {
          promptTokens: usage?.promptTokens,
          completionTokens: usage?.completionTokens,
        })
        data.close()
      },
    })

    return result.toDataStreamResponse({
      data,
      getErrorMessage: (error) => {
        log('chat:stream-error', { error: String(error) })
        return String(error)
      },
    })
  } catch (err) {
    log('chat:error', { error: String(err) })
    data.close()
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
