# V64 P6 — Commercial Upgrade/Downgrade Layer

Read-only plan transition metadata on top of [V64 P1–P5](./V64-COMMERCIAL-FOUNDATION.md). No runtime billing, API, DB, or UI changes.

## Scope

| Capability | Module |
|------------|--------|
| Transition builder | `transition.builder.ts` |
| Upgrade path map | `transition.paths.ts` |
| Downgrade path map | `transition.paths.ts` |
| Tier compatibility matrix | `transition.compatibility.ts` |
| Transition snapshot | `transition.snapshot.ts` |
| Validation | `transition.validate.ts` |

## Transition paths (3 tiers)

| Upgrades | Downgrades |
|----------|------------|
| starter → professional | professional → starter |
| starter → enterprise | enterprise → starter |
| professional → enterprise | enterprise → professional |

Each path includes monthly price delta, gained/lost `FeatureKey` list (read from `PLAN_FEATURE_MATRIX`), and message metadata.

## Usage

```ts
import {
  lookupUpgradePath,
  buildCommercialTransitionSnapshot,
  validateCommercialTransition,
} from "@/lib/commercial/v64";

const path = lookupUpgradePath("professional", "enterprise");
```

## Verify

```bash
npm run verify:v64-p6-commercial-transition
npm run verify:v64-commercial   # P1–P6
npm run verify
```

## Backward compatibility

- `PLAN_FEATURE_MATRIX` / `PLAN_USAGE_LIMITS` unchanged as runtime authority
- `buildUpgradeMessage` reused for upgrade copy reference only
- V63 growth services untouched
