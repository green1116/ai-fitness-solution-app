/**
 * PI-3.2 compatibility shim — Domain ports live in PI-3.3 runtime registry.
 */
export {
  resolveDomainPort,
  resolveSupportingPorts,
  type ResolvedDomainPort as DomainCapabilityPort,
} from "../runtime/domain-port-registry";
