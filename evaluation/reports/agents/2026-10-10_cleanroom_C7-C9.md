# 클린룸 구현 평가: TypeScript 독립 구현 / C7, C9

| 항목 | 값 |
|---|---|
| 구현자 | Sonnet 5.5 에이전트 |
| 보류 케이스 작성자 | Opus 5.5 에이전트, 명세 문서만 열람 |
| 충돌 시험·분류 | Opus 5.5 에이전트 |
| 언어 | TypeScript (Node 24.14.0, type stripping, ajv 8 + ajv-formats 3) |
| 대상 커밋 | `68026af` |
| 작성일 | 2026-10-10 |
| 원본 | `raw/run2-result.json`, `raw/run2-heldout-pack.json`, `raw/run2-*.json`, `raw/cleanroom-impl/` |

## 1. 등급

**A** (결과 등급 A, 독립성 상한 A)

| 지표 | 값 |
|---|---|
| 공개 케이스 | 15/15 |
| 보류 케이스, 명세가 결과를 정하는 것 | 29/29 |
| 보류 케이스, 전체 | 31/32 |
| 계약 위반 응답 | 0 |
| 명세 모호·스키마 불일치 건수 | 12 |
| 클린룸 위반 | 없음 |

**등급의 의미.** 결과 조건은 A를 충족했다. 공개 100%, 보류 90% 이상이고 모든 불일치의 원인이 분류되었다.
명세 모호가 남아 있어 AA 조건은 충족하지 못했다. 독립성 상한도 A다. 저장소 작성자(ChatGPT)와 다른 계열의 AI 에이전트이지만 사람이 아니기 때문이다.

**이 등급이 증명하지 않는 것.** 외부 계약은 단일 객체의 수락 여부와 요약값만 시험한다. 근거 철회 후 재평가 같은 수명주기 동작은 시험 범위 밖이다.
따라서 A 등급은 정적 유효성 판정에 대한 합의만 보여 준다.

## 2. 참조 오라클과의 비교

보류 케이스를 참조 오라클에도 돌렸다. 명세에서 도출한 기대값과 맞춘 비율은 구현이 오라클보다 높았다.

| 대상 | 명세가 정하는 케이스 일치 | 전체 일치 |
|---|---|---|
| 클린룸 구현 | 29/29 | 31/32 |
| 참조 오라클 | 27/29 | 29/32 |

### 불일치 사례

- **reject-unsupported-namespaced-scope-type** (명세가 결정). 기대 거부, 구현 False, 오라클 True. 분류: 구현 결함 (설명상 결함 주체는 구현이 아니라 참조 오라클이다. 분류 라벨 오기).
  결함은 구현이 아니라 참조 오라클 쪽에 있다. spec/core-v0.2-draft.md:295-297(§5.11)은 'Unknown relationship scope ... are not interpreted as a more permissive known value'라고 해서 알 수 없는 relationship scope를 required extension과 별개로 fail-closed 대상으로 명시한다. docs/IMPLEMENTER_GUIDE_V0_2.md:48도 'fail-closed unknown material relationship scope'를 요구한다. conformance/external/v0_2/CONTRACT.md:36에 따르면 supported_extensions는 평가기가 이해하는 것으로 간주할 네임스페이스 확장의 목록이다. 그런데 x-famapp:household는 supported_extensions=[]에 없으므로 평가기 입장에서는 알 수 없는 scope다. 스키마(context-assertion.schema.json:135-140)가 ExtensionName 형식의 scope_type을 허용하므로 구조 검증은 통과한다. 오라클 wt/conformance/v0_2/run_wire.py:45-50은 리터럴 문자열 'unknown'만 거부하고, 지원되지 않는 네임스페이스 scope_type은 카디널리티 검사조차 하지 않은 채 통과시킨다. 클린룸 구현(impl/src/evaluate.ts:100)은 core §5.11을 그대로 적용해 거부하며, 이 판단이 기대값과 일치한다.
- **reject-evidence-restriction-silently-dropped** (명세가 결정). 기대 거부, 구현 False, 오라클 True. 분류: 명세 모호.
  원칙 차원의 산문은 거부 쪽을 가리킨다. spec/wire-v0.2-draft.md:281은 'derivation or projection does not silently erase material restrictions'라고 하고, spec/core-v0.2-draft.md:275-281(§5.6-5.7)은 extraction 등 변환이 source 제한을 느슨하게 하지 않는다고 한다. docs/semantic-scenarios-v0.2.md:137-139와 docs/standards-boundary.md:182도 같은 취지다. 그러나 wire 수준에서 실제로 검사 가능한 적합성 규칙은 spec/wire-v0.2-draft.md:283 한 줄뿐이다. 이 규칙은 'material policy dependencies'(derivation lineage의 policy 의존성)가 derived assertion에 실려 있어야 한다는 것만 요구한다. evidence 수준의 policy_refs(wire:274)가 'material'한지, assertion.policy_refs로 반드시 상속되어야 하는지는 문장으로 정의되어 있지 않다. 게다가 core:281은 제한의 효력을 'according to the applicable policy profile'에 맡기는데, 그 프로파일은 아직 없다. 오라클(run_wire.py:122-133)은 wire:283을 문자 그대로 구현해 derivation의 policy 의존성만 검사하므로, mode=evidence인 이 케이스를 수락한다. 구현은 자기 보고서에 '산문에 명시되지 않은 확장 해석'으로 적어 둔 보수적 규칙(evidence[].policy_refs ⊆ assertion.policy_refs, impl/src/evaluate.ts:170)으로 거부한다. 기대값이 명확한 문장과 모순되지는 않으므로 case_error는 아니다. 다만 '결정적(determinate)'이라는 라벨은 과대평가이고, 실질적으로는 산문의 원칙과 검사 가능한 규칙 사이의 간극이다.
- **reject-source-subset-of-target-even-with-basis** (명세 침묵). 기대 거부, 구현 True, 오라클 True. 분류: 명세 모호.
  규범 문서는 basis를 필요조건으로만 규정한다. spec/wire-v0.2-draft.md:176('Whenever those sets differ ... an explicit semantic basis is required'), spec/core-v0.2-draft.md:97, docs/standards-boundary.md:280이 그렇다. source가 target의 상위집합이어야 한다는 추가 조건은 어디에도 없다. 반면 docs/semantic-scenarios-v0.2.md:34는 'source_participants ⊇ target_participants is necessary but not sufficient'라고 하고, :29는 'explicit narrower evidence basis'를 요구해 {jin}에서 {jin,mira}로 넓히는 투영을 배제하는 것으로 읽힌다. 그런데 이 문서는 :3에서 스스로 'non-normative'라고 밝힌다. 구현과 오라클은 모두 wire 규칙대로 basis만 있으면 수락했고(오라클 run_wire.py:62-67), 둘은 서로 일치한다. 기대값 false는 규범 문장과 직접 모순되지 않는다. 규범 문장은 필요조건만 말할 뿐 충분조건은 말하지 않기 때문이다. 따라서 case_error가 아니라, 규범 wire와 비규범 시나리오 불변식 사이의 모호성이다. 구현자도 이 지점을 모호성으로 자기 보고했다.

## 3. 구현자가 기록한 명세 모호

| 분류 | 주제 | 명세 위치 | 구현자의 선택 |
|---|---|---|---|
| 명세 모호 | 그룹 범위(group) 참가자 수 하한 | core §4.2 / guide §4 (bilateral/group scope cardinality) / schema RelationshipScope.participants minItems 2 | bilateral은 정확히 2명, group은 3명 이상을 요구하도록 구현. 스키마는 최소 2명만 강제하고 산문은 'cardinality'라고만 말하며 구체 수치를 주지 않음. 공개 케이스는 이 경계를 검증하지 않았음(공개 케이스로부터 학습한 규칙 아님). |
| 명세 모호 | 알려진 scope_type 중 provider_defined / organization_mediated의 의미 | schema RelationshipScope.scope_type enum / core §5.11 | 스키마 enum에 있는 알려진 값이므로 의미 제약 없이(참가자 2명 이상) 수락. 'unknown'만 fail-closed로 거부. 네임스페이스 확장 scope_type은 supported_extensions에 없으면 거부. provider_defined가 외부 프로파일 없이 해석 불가이므로 거부해야 한다는 읽기도 가능. |
| 스키마·문장 불일치 | source_participants가 target을 포함하지 않는 경우(source가 부분집합)의 처리 | wire §6 ('Whenever those sets differ ... basis required') vs semantic-scenarios Scenario A ('source ⊇ target is necessary but not sufficient') | 집합이 다르면 projection_basis_ref 필수, basis가 있으면 수락(source가 target의 진부분집합이어도). Scenario A의 '필요조건' 문구를 별도 거부 규칙으로 해석하지 않음. basis 값은 불투명 문자열로만 취급하고 해소(resolve)를 요구하지 않음. |
| 명세 모호 | 참가자 동일성 비교 키 | core §4.1 (identifier meaning is scoped), wire §5 | [scope, actor_id, actor_type] 3-튜플 전체로 집합 비교. actor_type만 다른 동일 (scope,actor_id)는 다른 행위자로 취급(보수적으로 basis 요구). 단 target 참가자 내 동일 (scope,actor_id) 중복은 거부. |
| 명세 모호 | support_sets 참조가 가리킬 수 있는 의존성 종류 | core §4.8 / wire §9 / guide §4 (independently sufficient support_sets) | support_sets의 각 ref가 derivation.dependencies에 선언되어 있기만 하면 수락(종류 evidence/assertion/identity_binding/policy 및 material 여부 불문). 산문은 'evidence support paths'라고 하나 policy/identity 의존성이나 non-material 의존성이 포함될 때의 처리를 규정하지 않음. 더 엄격한 읽기(evidence/assertion & material만 허용)도 가능. |
| 명세 모호 | verification_basis_refs의 해소 대상 범위 | core §4.5, wire §3 ('resolve to declared lineage') | basis ref는 provenance.evidence[].evidence_ref 또는 derivation.dependencies[].dependency_ref(종류 불문) 중 하나로 해소되어야 함. policy/identity 의존성도 '선언된 lineage'로 인정(core §4.5가 'basis/policy' 하에 검증이라 서술). verification_basis_refs가 verified_fact가 아닌 클래스에 있어도 동일하게 해소를 요구. opaque/unavailable로 lineage가 비면 verified_fact는 자동 거부. |
| 명세 모호 | material identity/policy 의존성 보존의 정확한 조건 | core §5.4, §5.6-5.7, wire §10, guide §4 | derivation 객체가 존재할 때만: (a) relationship_scope.identity_dependency_refs의 각 ref는 material=true인 identity_binding 의존성으로 존재해야 하고, (b) material=true인 policy 의존성의 ref는 top-level policy_refs에 있어야 함. 또한 모든 mode에서 evidence[].policy_refs는 assertion.policy_refs에 포함되어야 함(제한이 변환으로 사라지지 않는다는 §5.6의 보수적 해석). 이 세 번째 규칙(evidence policy 상속)은 산문이 명시적으로 문자화하지 않은 확장 해석이며 공개 케이스에서는 영향이 없었음. |
| 명세 모호 | 자기 참조 범위 | wire §11 ('An assertion cannot meaningfully declare one of these relations to itself'), guide §4 (assertion self-relation rejection) | assertion_relations[].assertion_ref == assertion_id이면 거부. 추가로 derivation 의존성의 dependency_ref가 assertion_id와 같아도 거부(자기 의존). 후자는 산문에 명시되지 않은 확장. |
| 명세 모호 | 중복/모순 선언의 처리 | schema uniqueItems (객체 단위) / CONTRACT §4 digest 정규화 | 같은 evidence_ref가 evidence 배열에 두 번 나오면 거부, 같은 dependency_ref가 서로 다른 dependency_type 또는 material 값으로 선언되면 거부(모호한 materiality는 fail-closed). role만 다른 중복은 수락하며 digest에는 CONTRACT의 'collect and sort' 문구대로 중복 제거 없이 포함. |
| 명세 모호 | digest support_sets 외곽 정렬 비교 방식 | CONTRACT §4 ('sort the outer list lexicographically by its JSON-array value') | 각 집합을 요소 단위(리스트 사전식, 짧은 접두사 우선)로 비교하고 Unicode 코드포인트 순서를 사용. 'JSON 문자열 비교'로 읽으면 ["a"]와 ["a","b"]의 순서가 달라지므로 모호. 공개 케이스는 이 차이를 드러내지 않았음. 동일 의미의 중복 집합도 제거하지 않음. |
| 표준 중복 | 날짜-시간 format 검증 및 required_extensions와 확장 타입의 관계 | schema format: date-time; wire §13; core §5.11 | ajv-formats로 date-time format을 실제로 강제(스키마가 선언했으므로). required_extensions만 supported_extensions로 fail-closed 판정하며, 네임스페이스 assertion_type/evidence_type/actor_type은 required_extensions에 없으면 무시 가능한 것으로 수락(공개 케이스 namespaced-evidence-channel-accepted와 산문의 'optional extension ... ignorable' 일치). scope_type 확장만 material로 간주. 이는 공개 케이스가 학습시킨 규칙이 아니라 산문(§13)에서 도출했으나 케이스가 이를 확인해 줌. |
| 기타 | 공개 케이스로부터 학습한 규칙 기록 | 해당 없음 | 공개 케이스를 처음 실행했을 때 15/15 통과했고 디버깅 중 구현을 수정한 적이 없으므로, 공개 케이스가 산문에 없는 규칙을 가르쳐 준 사례는 없음. 실행 후 거부 사유를 점검했을 때 모두 의도한 규칙(투영 basis 누락, support_sets 미선언 참조, basis 미해소, unknown scope, 미지원 required extension, 스키마 additionalProperties, 자기 relation)에 의한 것이었음. |

## 4. 클린룸 무결성

- 구현자 자기 신고: 금지 자료 접촉 없음, 명세만으로 구현 가능 예.
- 열람 파일: /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/docs/IMPLEMENTER_GUIDE_V0_2.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/conformance/external/v0_2/CONTRACT.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/spec/core-v0.2-draft.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/spec/wire-v0.2-draft.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/spec/schemas/v0.2-draft/context-assertion.schema.json, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/docs/semantic-scenarios-v0.2.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/docs/standards-boundary.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/docs/standards-reconciliation-v0.2.md, /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/conformance/external/v0_2/harness.py (앞 150줄), /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/conformance/external/v0_2/cases/public.json (케이스 id/기대값 목록 및 구현 완료 후 assertion을 어댑터에 입력해 거부 사유 확인, 한 케이스의 derivation 구조 출력)
- 감사 결과: node_modules를 제외한 /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/cleanroom/impl 전체를 다음 패턴으로 검색했다: run_wire, run\.py, normalize_wire, reference_adapter, reference-ecosystem, bindings/v0_2, /Users/chan/Developer/service/RCP-Relationship-Context-Protocol, scratchpad/wt. 일치 0건이었다(grep exit=1). 소스는 src/adapter.ts와 src/evaluate.ts 두 파일뿐이다. import 대상은 node:fs, node:url, node:path, ajv/dist/2020.js, ajv-formats, ./evaluate.ts뿐이다. 파일 읽기는 evaluate.ts:9의 ../schema.json 하나뿐이며, 이 파일은 cleanroom/spec/schemas/v0.2-draft/context-assertion.schema.json과 바이트 단위로 동일하다(cmp로 확인). 자기 보고의 files_read에도 금지 자료는 없다(harness.py와 public.json만 포함). 오라클과 공유하는 코드 경로나 금지 경로를 참조한 구체적 증거가 없으므로 위반이 아니다.
- 구조적 장치: 구현자 디렉터리에는 허용 파일 9개와 테스트 실행기만 있었다. 보류 케이스는 구현이 끝난 뒤 처음 디스크에 쓰였다.

## 5. 재현: 첫 번째 실행

Fable 5.1 사용량 소진으로 첫 실행이 중단되었고, 재개 시 파이프라인 전체가 다시 실행되었다.
첫 실행의 클린룸 사슬은 완료되어 있었으므로 서로 독립인 두 번째 표본이 된다. 원본은 `raw/run1-partial.json`이다.

| 지표 | 1차 | 2차 |
|---|---|---|
| 보류 케이스 수 (명세가 정하는 것) | 32 (26) | 32 (29) |
| 공개 케이스, 구현 | 15/15 | 15/15 |
| 명세가 정하는 보류 케이스, 구현 | 26/26 | 29/29 |
| 명세가 정하는 보류 케이스, 오라클 | 25/26 | 27/29 |
| 구현자가 기록한 명세 모호 | 15 | 12 |

두 실행 모두 같은 결론을 낸다. 명세만 읽은 구현은 명세에서 도출한 기대값을 모두 맞췄고, 참조 오라클은 그렇지 못했다.
특히 **증거에 붙은 정책 제한이 단언에서 사라지는 경우**는 두 실행의 보류 케이스 작성자가 각자 독립적으로 만들었고, 두 번 모두 오라클만 이를 수락했다.

1차 불일치:

- ho-10-unsupported-namespaced-scope-type (명세 침묵): 기대 False, 구현 False, 오라클 True, 명세 모호
- ho-20-support-set-outer-order-prefix (명세 침묵): 기대 True, 구현 True, 오라클 True, 명세 모호
- ho-23-reject-evidence-restriction-dropped (명세가 결정): 기대 False, 구현 False, 오라클 True, 보안·프라이버시
- ho-24-identity-binding-not-in-scope (명세 침묵): 기대 False, 구현 False, 오라클 True, 명세 모호
