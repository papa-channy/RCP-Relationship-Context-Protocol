import { evaluate } from "./evaluate.ts";

const CONTRACT = "rcp-v0.2-cleanroom-1";

function out(obj: unknown): void {
  process.stdout.write(JSON.stringify(obj));
}

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
try {
  const req = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (req === null || typeof req !== "object" || req.operation !== "evaluate_context_assertion") {
    out({ contract_version: CONTRACT, accepted: false, errors: ["unsupported operation"], semantic_digest: null });
  } else {
    const ext = Array.isArray(req.supported_extensions) ? req.supported_extensions.filter((x: unknown) => typeof x === "string") : [];
    const r = evaluate(req.assertion, ext);
    out({ contract_version: CONTRACT, accepted: r.accepted, errors: r.errors, semantic_digest: r.accepted ? r.digest : null });
  }
} catch (e) {
  out({ contract_version: CONTRACT, accepted: false, errors: [`internal: ${(e as Error).message}`], semantic_digest: null });
}
