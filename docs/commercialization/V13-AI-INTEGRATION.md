# V13 Real AI Integration Foundation

**Version:** `v13.0-ai-integration-1`  
**Status:** Unified AI provider layer with stub/real dual mode  
**Predecessor:** V12.5 Knowledge Base Foundation (`v12.5-knowledge-base`)  
**Successor:** V13.5 AI Proposal Autopilot Foundation

## Goal

建立真实 AI 接入层，将 Knowledge Base、Tender Intelligence、Proposal Generation 统一接入外部大模型。保留完整抽象层、可切换性、成本控制、失败降级与审计能力。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| AI Provider Adapter | `runAiProviderAdapterRuntime` | `GET /api/ai-integration/provider-adapter/run` | `npm run verify:ai-provider-adapter` |
| Prompt Orchestration | `runPromptOrchestrationRuntime` | `GET /api/ai-integration/prompt-orchestration/run` | `npm run verify:prompt-orchestration` |
| Model Routing | `runModelRoutingRuntime` | `GET /api/ai-integration/model-routing/run` | `npm run verify:model-routing` |
| AI Safety | `runAiSafetyRuntime` | `GET /api/ai-integration/safety/run` | `npm run verify:ai-safety` |
| AI Cost Control | `runAiCostControlRuntime` | `GET /api/ai-integration/cost-control/run` | `npm run verify:ai-cost-control` |
| AI Audit | `runAiAuditRuntime` | `GET /api/ai-integration/audit/run` | `npm run verify:ai-audit` |
| AI Knowledge Fusion | `runAiKnowledgeFusionRuntime` | `GET /api/ai-integration/knowledge-fusion/run` | `npm run verify:ai-knowledge-fusion` |
| AI Generation Dashboard | `runAiGenerationDashboardRuntime` | `GET /api/ai-integration/dashboard/run` | `npm run verify:ai-generation-dashboard` |

Unified gateway: `generateWithGateway()` — `GET /api/ai-integration/gateway/run`

## Module Layout

```
lib/ai-integration/
  shared/                 # runtime harness + stub/real mode
  provider-adapter/       # OpenAI / Claude / Gemini / DeepSeek / Qwen
  prompt-orchestration/   # system / user / tender / proposal / knowledge prompts
  model-routing/          # provider selection + fallback
  safety/                 # sanitization + validation + guards
  cost-control/           # token usage + daily/monthly limits
  audit/                  # provider / model / prompt / cost audit trail
  knowledge-fusion/       # Tender Intelligence + Knowledge Base + Proposal + Context
  dashboard/              # readiness metrics
  gateway.ts              # unified generate entry point
  evidence.ts
  index.ts
```

## Provider Adapter Interface

- `generateText()`
- `generateStructuredOutput()`
- `generateProposalDraft()`
- `generateComplianceDraft()`
- `generateRiskDraft()`

## Dual Mode

| Mode | Trigger |
|------|---------|
| `stub` | Default; verify scripts force stub |
| `real` | `AI_INTEGRATION_MODE=real` + provider API key env |

Env keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `DEEPSEEK_API_KEY`, `DASHSCOPE_API_KEY`

Cost limits: `AI_DAILY_COST_LIMIT_USD`, `AI_MONTHLY_COST_LIMIT_USD`, `AI_DAILY_TOKEN_LIMIT`, `AI_MONTHLY_TOKEN_LIMIT`

## Boundaries

- **不修改** Proposal Engine、Proposal PDF、Plan/Budget/ZIP 生产引擎
- **所有 AI 调用** 必须通过 `generateWithGateway()` 或 Provider Adapter
- **独立于** `lib/ai-readiness/`（V11.5 契约层保留）

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:ai-provider-adapter
npm run verify:prompt-orchestration
npm run verify:model-routing
npm run verify:ai-safety
npm run verify:ai-cost-control
npm run verify:ai-audit
npm run verify:ai-knowledge-fusion
npm run verify:ai-generation-dashboard
```

Evidence：`buildAiIntegrationEvidence()` — 由 `verify:ai-generation-dashboard` 覆盖。

## Next: V13.5 AI Proposal Autopilot Foundation

- 方案自动生成编排
- 与 AI Integration Gateway 深度桥接
