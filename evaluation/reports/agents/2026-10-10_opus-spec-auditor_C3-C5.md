# 평가 보고서: 명세 감사자 / C3-C5

| 항목 | 값 |
|---|---|
| 평가자 | Opus 5.5, 명세 감사자 |
| 유형 | agent |
| 대상 커밋 | `68026af` |
| 기준 버전 | CRITERIA v1.1 |
| 작성일 | 2026-10-10 |
| 교차 검증 | Sonnet 5.5가 높음 이상 발견을 재현·반박 시도 |
| 독립성 | `evaluation/`이 없는 커밋에서 작업, 자체 평가와 다른 보고서 미열람 |
| 생성 | 워크플로 `wf_b25ca37f-bb5`의 구조화 출력을 변환. 원본은 `raw/run2-result.json` |

## 1. 요약

**한 줄 판정.** v0.2 명세는 필드·열거값 수준에서는 core/wire/schema가 대체로 맞물리지만, 검증기 규칙의 절반 이상이 산문에 없거나 테스트로 고정되지 않았다(변이체 42개 중 24개 생존). 두 오라클은 참여자 투영 규칙에서 서로 모순되고, opaque/unavailable 모드로 정책 보존 검사를 우회할 수 있으며, 자기 지지 순환과 수명주기 상태 기계는 정의되지 않았다. 명세 감사 관점에서 C3·C4·C5 모두 단계 기대치보다 낮다.

**강점**

- core-v0.2-draft.md, wire-v0.2-draft.md, context-assertion.schema.json 사이에서 epistemic_class 8개, lifecycle state 7개, evidence_type 5개, dependency_type 4개, assertion relation 5개 열거값이 서로 일치한다(core:145-154/223-231, wire:85-94/303-311, schema:26-37/264).
- 구조 검증(JSON Schema)과 의미 검증(semantic_errors)의 2단계 분리가 wire:401-411에 명시되어 있고 run_wire.py에 그대로 구현되어 있다.
- 공개 외부 케이스 15건은 모두 산문에 근거한 규칙(투영 basis, verified_fact basis 요구·해석 가능성, unknown scope fail-closed, required extension, self-relation, confidence 제거, epistemic/assertion_type 직교성)만 시험한다. 그래서 산문만 읽은 구현자도 통과할 수 있다.
- reference_adapter.py는 작성자 오라클을 재사용한다는 사실을 스스로 밝히고(reference_adapter.py:1-8) clean-room 증거에서 제외한다. 하네스는 오라클을 import하지 않는다.
- 세 스위트를 재실행한 결과 모두 통과했다: semantic 31/31, wire 20+1, external 15/15.
- 핵심 불변식 일부(투영 basis, 도착 순서는 supersession이 아님, required extension fail-closed, self-relation, verified basis 해석 가능성)는 변이 시험에서 실제로 케이스가 실패해 고정되어 있음을 확인했다.

**시급한 문제**

- provenance.mode를 'opaque' 또는 'unavailable'로 바꾸면 derivation을 그대로 노출한 채 material policy 의존을 policy_refs에서 빼도 검증기가 수락한다. 미지 support_set 참조와 미물질화 identity 의존도 함께 통과한다(SA-01). 제한 비소실 불변식(core 5.6/5.7, wire:283)이 enum 하나로 우회된다.
- 참여자 투영 규칙이 두 오라클 사이에서 모순된다. run.py는 target⊄source를 basis가 있어도 거부하지만 run_wire.py와 reference adapter는 수락한다(SA-03). 보류 케이스를 만들면 즉시 갈라진다.
- wire 의미 규칙 19개 중 정책 보존·identity 물질화를 포함한 12개, semantic 규칙 변이 24개 중 목적 교집합·declassification·extraction basis를 포함한 12개가 어떤 케이스로도 잡히지 않는다(SA-02).
- 자기 자신을 material support로 두는 순환 단언이 수락되고, 근거를 모두 제거해도 invalidate되지 않는다(SA-04). 수명주기 전이 규칙도 없다(SA-05).

## 2. 기준별 점수

| ID | 점수 | 확신도 | 근거 |
|---|---|---|---|
| C1 | N/A | N/A | 범위 밖이다. |
| C2 | N/A | N/A | 범위 밖이다. 참고로 provenance.mode와 visibility에 각각 'opaque' 값이 있어 개념이 겹친다는 점만 관찰했다. |
| C3 | 1 | 중 | 필드와 열거값의 문서 간 일치는 양호하다. 다만 v0.2 core/wire에는 RFC 2119/8174 선언이 없고 대문자 MUST가 0회이며 소문자 must만 core 9회, wire 3회 쓰인다. README는 같은 불변식을 MUST로 적는다(SA-07). 스키마 용어 약 15개(visibility, derived_from, valid_from/valid_until, reason_refs, provider_ref, occurred_at, organization_mediated, provider_defined 등)가 산문에 정의되지 않았다. 오라클 규칙 약 13개는 산문에 없다(SA-06). 참여자 투영(SA-03)과 verified_fact basis(SA-08)에서는 문서끼리, 또 오라클끼리 모순된다. 독립 구현자가 해석 차이 없이 읽을 수 있는 수준이 아니다. 단계 기대치 2보다 낮다. |
| C4 | 1 | 중 | 시험된 주요 경로(투영 basis, OR/AND support, 명시적 supersession, required extension)는 결정적이다. 그러나 core 5.4의 opaque/unavailable 허용과 5.6/5.7·wire §10의 제한 보존이 충돌해 우회 경로가 생긴다(SA-01). 자기 지지 순환이 하류 무효화를 무력화한다(SA-04). 수명주기 상태 기계는 상태 열거만 있고 전이, 제한성 순서, 시간 유효성 규칙이 없다(SA-05). support_sets 정규화는 의미가 아니라 구문 기준이다(SA-10). fail-closed는 리터럴 'unknown'에만 적용된다(SA-11). 핵심 불변식 사이의 충돌 부재가 논증되지 않았다. |
| C5 | 1 | 상 | 저장소에 요구→케이스 추적표가 없고 케이스 JSON에 requirement/invariant 참조 필드도 0개다. 내가 만든 추적표 기준으로 산문 요구 30개 가운데 wire 또는 공개 수준에서 양성·음성이 모두 시험된 것은 11개, 추상 시맨틱 스위트에서만 시험된 것은 약 10개, 미시험은 7개다. 반대로 시험은 있으나 산문 요구가 없는 오라클 규칙이 약 13개다. 변이 시험에서는 wire 18개(비등가) 중 12개, semantic 24개 중 12개가 생존했다. 추상 케이스는 explicit_projection_basis 같은 불리언을 입력으로 받는 사실상 동어반복이다. child_access 필드는 오라클이 읽지 않고, historical_lineage_preserved는 상수 True다(SA-09). 단계 기대치 3에 크게 못 미친다. |
| C6 | N/A | N/A | v0.2 세 스위트의 로컬 통과만 확인했고 CI 전 단계는 재현하지 않았다. |
| C7 | N/A | N/A | 범위 밖이다. |
| C8 | N/A | N/A | SA-01(제한 세탁), SA-11(미지 scope 수락)은 C8과 관련된다. 다만 체크리스트 전체를 감사하지 않았으므로 점수는 매기지 않는다. |
| C9 | 2 | 하 | 공개 15건은 산문만으로 통과할 수 있다. 하지만 산문에 없는 오라클 규칙 약 13개, 투영 규칙 모순, digest 정렬 모호성(SA-12) 때문에 명세에서 도출한 보류 케이스는 구현마다 갈라질 것이다. 클린룸 구현을 실제로 작성해 보지는 않았으므로 확신도는 하다. |
| C10 | N/A | N/A | core:253의 'The following have executable coverage'는 5.9(상수), 5.12(미시험), 5.6/5.7(wire 음성 케이스 없음) 때문에 과장이다. 다만 C10 전체를 감사하지는 않았다. |

## 3. 발견 사항

### SA-01: opaque/unavailable 모드에서 derivation을 실어도 정책·identity·support_set 검사가 모두 꺼진다 (제한 세탁 경로)

- 기준: C4, C8, C3
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: conformance/v0_2/run_wire.py:76-133. support_sets, identity, policy 검사가 전부 `if provenance["mode"] == "derived":` 블록 안에 있다. run_wire.py:73-74는 evidence 모드만 derivation을 금지한다. schema:236-245는 opaque/unavailable 모드에서 derivation을 금지하지 않는다. 프로브(eval/spec-auditor/probes.py → probe-results.json)를 reference_adapter로 실행한 결과: P7 opaque+derivation(material policy:p1)+policy_refs=[]+support_sets=[["evidence:UNKNOWN"]] → accepted=True. P7b unavailable 모드 동일 조건 → accepted=True. 대조군 P7c derived 모드 → accepted=False ('material policy dependencies are not preserved: policy:p1'). P8 evidence 모드+identity_dependency_refs 미물질화 → accepted=True.
- 내용: core:269(5.4)는 '의존을 보존하거나 opaque/unavailable을 명시'하라고 하여 opaque를 탈출구로 허용한다. 반면 core:277-281(5.6/5.7)과 wire:283은 제한이 파생으로 사라지지 않아야 한다고 한다. 두 불변식의 경계가 정의되지 않았다. 오라클은 mode 문자열 하나로 판단하기 때문에, derivation을 그대로 노출하고 material:true 정책 의존을 선언하면서 policy_refs에서는 빼는 모순된 객체를 수락한다. 소비자 입장에서는 정책 참조가 없는 단언, 곧 무제한처럼 보인다. 공개 케이스 15건의 opaque 모드 사례에는 derivation이 실린 경우가 없다. 그래서 이 경로는 시험되지 않는다. 핵심 제한 불변식이 테스트 오라클에서 실패 개방(fail-open)되므로 치명으로 볼 여지도 있다. 그래도 높음으로 분류한 이유는 wire §10의 문구가 'derived assertion'으로 한정되어 있고, opaque 계보 자체는 core 5.4가 허용하기 때문이다.
- 권고: derivation이 있으면 mode와 무관하게 support/policy/identity 검사를 적용하거나, opaque/unavailable 모드에서 derivation 존재 자체를 스키마로 금지한다. opaque 계보에서도 제한(policy_refs)은 지워질 수 없다는 규칙을 core §5에 명시한다. 이 조합의 음성 케이스를 wire와 공개 팩에 추가한다.
- 검증 의견: 동일 기반 케이스로 재현했다. derived 모드에서는 support_set의 미지 참조와 material 정책 의존 누락이 둘 다 거부된다. 같은 객체의 mode만 opaque나 unavailable로 바꾸면 accepted=True다. run_wire.py의 support/identity/policy 검사가 전부 `if provenance["mode"] == "derived"` 안에 있어서 생기는 현상이며, 스키마도 opaque와 unavailable에서 derivation을 금지하지 않는다. 다만 완전한 결함으로 보기는 어렵다. core 5.4가 opaque/unavailable을 명시적 탈출구로 허용한다. wire §10의 정책 보존 문구도 'derived assertion'에 한정된다. 공개 팩 15건에는 derivation을 가진 비-derived 케이스가 0건이어서 이 경로는 실제 시험되지 않는다. 오라클이 모순된 객체(material 정책 의존을 선언하고 policy_refs에서는 제외)를 수락하는 것은 사실이다. 그래도 mode 판정 경계가 명세에 모호하게 남은 문제에 가깝고, 핵심 불변식이 직접 깨진 것은 아니다. 높음은 과대평가로 보고 중간으로 낮춘다.
- 검증 근거: 직접 만든 probe를 reference_adapter에 넣어 실행했다(이 하네스의 scratch p.py). P7 derived: accepted=False, errors=['support_set references unknown dependency: evidence:UNKNOWN','material policy dependencies are not preserved: policy:no-training']. P7 opaque와 unavailable: accepted=True, errors=[]. run_wire.py:76-133의 검사가 derived 블록 안에 있음을 확인했다. public.json에서 derivation이 있는데 mode가 derived가 아닌 케이스 수는 0이다. spec/core-v0.2-draft.md:269(5.4), spec/wire-v0.2-draft.md:219와 §10도 확인했다.

### SA-02: 변이 시험: wire 의미 규칙 12/18, semantic 규칙 12/24가 어떤 케이스로도 잡히지 않는다

- 기준: C5
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 높음)
- 근거: eval/spec-auditor/mutate_wire.py로 run_wire.py 사본의 errors.append를 하나씩 무력화한 뒤 wire-cases와 public.json을 실행했다. 생존한 규칙: L46 bilateral 정확히 2, L48 group 3명 이상, L57 evidence_ref 유일, L74 evidence 모드 derivation 금지, L84 dependency_ref 중복, L98 material support에 support_sets 필요, L107/L109/L111 support set 구성원 제약, L120 identity 의존 물질화, L130 material policy 보존, L148 required extension payload 누락. L78은 스키마상 도달 불가인 등가 변이다. 잡힌 규칙은 L50, L65, L104, L138, L143, L150의 6개뿐이다. eval/spec-auditor/mutate_sem.py로 run.py를 변이한 결과 생존: 목적 union, external/training deny를 all로, retention max, declassification 불리언 완화, training/retention/purpose 검사 삭제, extracted_fact 무조건 허용, verified→verified basis 요구, composition id 재사용·addressable 무시, binding 리스트 정렬 제거.
- 내용: README:90과 core 5.4가 MUST로 내세우는 'material identity/policy 의존 보존'과 core 5.6/5.7 '제한 상속'이 wire 수준에서 양성 케이스로만 존재한다. 그래서 규칙을 지워도 스위트가 통과한다. semantic 정책 격자에서는 external_processing 하나만 음성으로 고정되어 있다. 목적 교집합, 보존 기간 최소값, training deny, declassification basis는 모두 고정되지 않았다. 스위트가 통과해도 이 불변식들이 구현되어 있다는 증거가 되지 않는다.
- 권고: 생존한 규칙마다 최소 1개의 음성 케이스를 wire 케이스와 공개 팩(또는 보류 팩)에 추가한다. CI에 변이 시험을 넣어 생존 변이 0을 목표로 둔다.
- 검증 의견: 변이 시험을 독립적으로 다시 수행했다. run_wire.py의 `errors.append(` 호출 19곳을 하나씩 무력화하고 wire-cases와 외부 하네스(public.json 15건)를 모두 돌렸다. 둘 다 통과한 생존 변이가 13개다. 이 중 L78 `derived provenance requires derivation`은 스키마가 이미 막는 등가 변이이므로 실질 생존은 12개다. 보고서와 일치한다. 잡힌 규칙은 L50, L65, L104, L138, L143, L150뿐이다. run.py(semantic)는 7개를 변이했고 external_processing만 잡혔다. 목적 union, 보존 기간 max, training 검사 삭제, 보존 기간 검사 삭제, 목적 검사 삭제, declassification 검사 삭제는 모두 생존했다. 스위트가 통과해도 구현 증거가 되지 않는다는 주장은 타당하다. 이것은 스펙 위반이 아니라 시험 품질 공백이다. 하지만 README와 core 5.x가 MUST로 두는 불변식 대부분이 해당되므로 높음을 유지한다.
- 검증 근거: scratch의 mut.py 출력: 46, 48, 57, 74, 78, 84, 98, 107, 109, 111, 120, 130, 148행이 SURVIVED(wire-cases와 harness 둘 다 통과)다. 50, 65, 104, 138, 143, 150행은 CAUGHT다. 기준선 하네스는 PASS (15/15 cases)다. run.py 변이는 purpose union, retention max, training deny, retention check, purpose check, declass가 SURVIVED이고 extern check만 CAUGHT다.

### SA-03: 참여자 투영 규칙(target ⊆ source)이 두 오라클과 문서 사이에서 모순된다

- 기준: C3, C4, C5
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: conformance/v0_2/run.py:29-30 `if not target or not target.issubset(source): return False`. semantic-cases.json:27-32의 projection-target-not-in-source는 basis가 있어도 expected false다. docs/semantic-scenarios-v0.2.md:36 '`source_participants ⊇ target_participants` is necessary but not sufficient'. 반면 run_wire.py:62-67은 집합이 다를 때 projection_basis_ref만 요구한다. wire:176도 'Whenever those sets differ ... an explicit semantic basis is required'라고 쓴다. 프로브 P2(source {A,C}, target {A,B}, basis 있음)를 reference_adapter로 돌리면 accepted=True다. 같은 조건에서 run.projection_allowed(...)는 False를 돌려준다.
- 내용: clean-room 허용 입력인 scenarios 문서와 semantic 오라클은 'B가 참여하지 않은 근거로 {A,B} 단언 불가'를 필수 조건으로 둔다. core 4.2와 wire §6, 그리고 외부 하네스가 쓰는 wire 오라클은 basis만 있으면 허용한다. 공개 케이스에는 이 경우가 없다. 따라서 명세에서 도출한 보류 케이스를 만들면 구현과 참조 오라클이 반드시 갈라진다. 또 증거가 여러 개일 때 ⊇를 개별 증거 기준으로 볼지 합집합 기준으로 볼지도 정의되지 않았다.
- 권고: core §4.2/§5.2에 ⊇ 필요조건(그리고 다중 증거일 때의 판정 단위)을 명시하고, run_wire.py와 공개 팩에 target⊄source+basis 음성 케이스를 추가한다.
- 검증 의견: 불일치는 재현됐다. source={A,C}, target={A,B}, projection_basis_ref 있음 조건에서 reference_adapter(run_wire 오라클)는 accepted=True다. semantic 오라클의 run.projection_allowed는 같은 조건에서 False다. docs/semantic-scenarios-v0.2.md:34는 `source_participants ⊇ target_participants`를 necessary로 명시한다. 반면 core §4.2/5.2와 wire §6(176행)은 집합이 다르면 basis만 요구하고 ⊇ 조건은 언급하지 않는다. 문서와 두 오라클 사이에 실제 모순이 있다. 다만 basis가 명시되므로 core 5.2의 '조용한 collapse 금지' 자체는 깨지지 않았다. 또 ⊇ 규칙은 비규범 시나리오 문서와 추상 semantic 오라클에만 있다. 따라서 높음은 과대평가이며 중간으로 낮춘다. 다중 증거에서 ⊇의 판정 단위가 미정의라는 지적도 맞다.
- 검증 근거: probe P2: reference_adapter가 (True, [])를 돌려줬다. run.projection_allowed({source:[A,C], target:[A,B], explicit_projection_basis:true})는 False다. docs/semantic-scenarios-v0.2.md:34, spec/wire-v0.2-draft.md:176, spec/core-v0.2-draft.md:97("requires an explicit semantic projection basis"), run.py:29-30, run_wire.py:62-67을 확인했다.

### SA-04: 자기 지지 순환 단언이 수락되고, 근거를 모두 제거해도 무효화되지 않는다

- 기준: C4
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: 프로브 P21: assertion_id='assertion:k'인 단언에 dependency {dependency_ref:'assertion:k', type:'assertion', role:'supports', material:true}와 support_sets=[['assertion:k']]를 넣으면 reference_adapter에서 accepted=True다. run_wire.py:140-143은 assertion_relations의 자기 참조만 막고 dependencies는 검사하지 않는다. run.dependency_invalidation_result({all_sources:[A,B,assertion:k], support_sets:[[A],[B],[assertion:k]], removed:[A,B]})는 {'current_support_exists': True, 'action': 'recompute'}를 돌려준다. 상호 supersession(j supersedes k, k supersedes j)도 둘 다 semantic_errors가 []다.
- 내용: core 5.8(의존 변경의 하류 결과)과 5.10(독립 근거 보존)은 지지 그래프가 비순환이라고 암묵적으로 가정한다. 자기 의존 하나로 근거를 전부 철회한 뒤에도 단언이 current로 남는다. 단언 간 순환과 상호 supersession은 단일 객체 검증으로 원리상 탐지할 수 없다. 그런데 명세는 다중 단언 그래프 수준의 규칙(순환 금지, 충돌 시 current 판정)을 전혀 정의하지 않는다.
- 권고: dependency_ref == assertion_id를 금지하는 규칙을 추가한다. 지지 그래프 비순환 요구와 순환이 있을 때의 판정(fail-closed)을 core에 명시한다. 상호 supersession의 결정 규칙도 정의한다.
- 검증 의견: 재현됐다. assertion_id='assertion:k'인 단언이 자기 자신을 material support dependency와 support_set으로 참조해도 accepted=True다. run_wire.py의 자기참조 검사는 assertion_relations에만 적용된다. dependency_invalidation_result에 all_sources=[A,B,assertion:k], support_sets=[[A],[B],[assertion:k]], removed=[A,B]를 넣으면 current_support_exists=True, action='recompute'를 돌려준다. 상호 supersession(j↔k)도 둘 다 accepted=True다. 지지 그래프 비순환성과 current 판정 규칙은 명세 어디에도 없다. 다만 wire §17은 JSON Schema가 모든 graph/lifecycle 규칙을 담지 않는다고 명시한다. 이 문서는 draft이고 다중 단언 그래프 규칙은 아직 정의되지 않은 영역이다. 단일 객체 자기 의존 금지는 값싼 추가 규칙이므로 결함이긴 하다. 다만 설계상 미정의된 draft 범위이므로 높음은 과하고 중간으로 본다.
- 검증 근거: probe P21: accepted=True, errors=[]. dependency_invalidation_result는 {'current_support_exists': True, 'action': 'recompute', 'historical_lineage_preserved': True}를 반환했다. 상호 supersession probe 2건은 모두 (True, [])다. wire-v0.2-draft.md:297은 relation 자기참조만 언급한다. wire:411은 graph 규칙을 스키마에 강제하지 않는다고 적는다.

### SA-05: 수명주기 상태 기계가 없다: 전이, 제한성 순서, 시간 유효성이 모두 미정의

- 기준: C4, C3, C5
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: core:223-235와 wire:303-317은 상태 7개를 나열하고 'transition to a more restrictive/currently non-active state'라고만 적는다. 상태 간 제한성 순서나 전이 표는 없다. schema:258-273의 valid_from, valid_until, reason_refs는 산문에 언급되지 않는다. 프로브 P11(valid_from 2027 > valid_until 2020, state active) → accepted=True. P11b(active인데 valid_until 2000년) → accepted=True. superseded 상태인데 supersedes 관계가 어디에도 없는 경우 → semantic_errors []. 케이스 35건 전체의 lifecycle.state 분포는 {active:32, disputed:3}으로, superseded/expired/invalidated/revoked/historical은 한 번도 등장하지 않는다.
- 내용: 설계 논지(core:9)가 'information and lifecycle model'인데, 실행 가능한 수명주기 의미는 추상 함수 dependency_invalidation_result의 action 문자열(none/recompute/invalidate)뿐이다. 이 action이 7개 상태 중 무엇에 대응하는지도 정의되어 있지 않다. revoked에서 active로 돌아올 수 있는지, disputed와 superseded가 동시에 발생하면 어느 상태가 우선하는지, 사건 도착 순서가 바뀌면 같은 최종 상태에 이르는지가 모두 열려 있다. 도착 순서 독립성은 쌍 단위 불리언(arrival_order 2건)으로만 시험된다.
- 권고: 상태 전이 표와 상태 간 제한성 격자를 정의하고, 사건 순서 교환 시 같은 최종 상태에 이른다는 성질을 시험하는 다중 사건 케이스를 추가한다. valid_from ≤ valid_until 같은 시간 일관성 규칙도 둔다.
- 검증 의견: 재현됐다. valid_from 2027 > valid_until 2020인 active 단언은 accepted=True다. valid_until=2000년인데 active인 단언도 accepted=True다. state=superseded인데 supersedes 관계가 없는 단언도 accepted=True다. core 4.10과 wire §12는 7개 상태를 나열하고 '더 제한적인 상태로 전이'라고만 쓴다. 전이 표, 제한성 순서, valid_from/valid_until/reason_refs의 의미가 산문에 없다. 케이스 전체의 lifecycle.state 분포는 wire-cases 20건(active 18, disputed 2)과 public 15건(active 14, disputed 1)을 합쳐 active 32, disputed 3이고, 나머지 5개 상태는 한 번도 등장하지 않는다. 명세 공백과 시험 공백은 사실이다. 다만 대상은 'normative freeze 이전' draft이다. 이 문서가 설계 논지(core:9)로 lifecycle model을 내세우는 만큼 공백이 큰 것은 맞지만, 규칙 위반이 아니라 아직 미완성인 영역이다. 높음은 과하고 중간으로 본다.
- 검증 근거: probe P11(valid_from > valid_until)과 P11b(만료된 valid_until + active)는 둘 다 (True, [])다. superseded + 관계 없음 probe도 (True, [])다. 상태 분포는 Counter 계산 결과 wire-cases {active:18, disputed:2}, public.json {active:14, disputed:1}이다. spec/core-v0.2-draft.md:221-233과 spec/wire-v0.2-draft.md:301-317을 확인했다.

### SA-06: 오라클 규칙 약 13개가 산문에 없고, 스키마 용어 약 15개가 산문에 정의되지 않았다

- 기준: C3, C5, C9
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: 산문 grep 결과 'exactly two', 'at least three', 'cardinality'(가이드 47행의 한 단어 제외), 'must not carry derivation', 'explicit support_sets', 'duplicate', 'unique'에 해당하는 규칙 문장이 core/wire/scenarios/CONTRACT에 없다. 산문에 없는 오라클 규칙: run_wire.py:45-48 cardinality, :56-57 evidence_ref 유일, :73-74, :83-84, :97-98, :106-111(material, evidence/assertion 타입, SUPPORT_ROLES에서 refines 제외 — :26), :118-120 identity 물질화 방식, :34-35 actor 동일성 = (scope, id, type), run.py:69-101 정책 격자(목적 교집합, deny 우선, retention 최소). 스크립트로 스키마 이름 99개를 core+wire 산문과 대조한 결과 미언급 항목: visibility, full, redacted, hidden, derived_from, valid_from, valid_until, reason_refs, provider_ref, occurred_at, note, organization_mediated, provider_defined, assertion_relations, assertion_ref, evidence_ref.
- 내용: SA-02에서 생존한 규칙이 산문에 없는 규칙과 거의 겹친다. 시험도 산문 근거도 없는 규칙이 참조 검증기에만 존재하는 셈이다. 필수 필드인 provenance.visibility에는 정의가 아예 없다. mode와 visibility 양쪽에 'opaque' 값이 있는데 둘의 관계도 정의되지 않았다. 'material'의 판정 기준은 core:182의 자기지시적 설명뿐이다.
- 권고: run_wire.py의 각 규칙에 core/wire 조항 ID를 붙여 산문으로 승격하거나 삭제한다. 스키마의 모든 필드와 열거값에 산문 정의를 두고, 'material'의 판정 기준을 정의한다.

### SA-07: v0.2 명세에 규범 키워드 체계가 없다 (README의 MUST와 불일치)

- 기준: C3, C10
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: grep -o '\bMUST\b' 집계: core-v0.2-draft.md MUST=0/SHOULD=0/MAY=0, 소문자 must=9. wire-v0.2-draft.md MUST=0, must=3. core-v0.1.md MUST=99. README.md MUST=8(87-94행, 같은 불변식을 MUST로 기술). '2119'와 '8174'는 v0.2 문서에 0회. IMPLEMENTER_GUIDE의 MUST 1회(31행)는 clean-room 절차 규칙이다.
- 내용: core는 상태를 'non-normative design draft'로 두고 불변식도 'candidate'라고 부른다(core:251-253). 그런데 README는 같은 문장을 대문자 MUST로 제시한다. 구현자는 어떤 문장이 적합성 요구인지, 오라클 규칙 중 무엇이 'should'인지 구분할 수 없다. 'should not define', 'may', 'candidate'가 섞여 있어 core §5 불변식과 §4 설명문의 규범 수준이 같은지도 판단할 수 없다.
- 권고: v0.2 core/wire에 BCP 14 선언을 추가하고, 적합성 요구 문장에만 대문자 키워드와 요구 ID를 붙인다. README의 MUST는 해당 ID를 인용하는 방식으로 맞춘다.

### SA-08: verified_fact basis 규칙: semantic 오라클이 산문·스키마와 모순되고, basis 해석 기준도 너무 약하다

- 기준: C3, C4
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: core:160 'verified_fact requires an explicit basis that resolves into declared lineage'(무조건 요구). schema:69-77도 무조건 required다. 그런데 run.py:108-110은 입력이 모두 verified_fact면 basis 없이 허용하고, run.py:145-149도 같다. run.epistemic_transition_allowed({source_classes:['verified_fact'], output_class:'verified_fact', verification_basis:False})는 True를 돌려준다. 이 예외를 제거한 변이도 생존한다(SA-02). 프로브 P9 verification_basis_refs=['policy:p1'](정책 의존) → accepted=True. P9b basis가 material:false 의존 → accepted=True(run_wire.py:135-138).
- 내용: 두 오라클이 같은 불변식(no epistemic promotion)에 대해 서로 다른 규칙을 가진다. 'resolves into declared lineage'는 아무 의존 ref와 문자열이 일치하기만 하면 충족된다. 정책 참조나 비물질 의존을 검증 근거로 내세워도 verified_fact가 수락되므로, 승격 방지 불변식의 실효가 약하다.
- 권고: basis는 material인 evidence/assertion 의존으로만 해석되어야 한다고 명시한다. semantic 오라클의 verified→verified 예외는 산문에 넣거나 삭제한다. 둘 다 음성 케이스를 추가한다.

### SA-09: 추상 semantic 스위트는 동어반복적이고 wire 표현과 연결되지 않는다 (오라클 독립성 부재)

- 기준: C5
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: run.py:123-124 source_access_allowed는 case['source_access']=='allow' and case['source_state']=='active'를 반환하며, child_access를 읽지 않는다(grep -n child_access run.py 결과 0행). 그런데 이 케이스로 core 5.5 '자식 접근이 원본 접근을 주지 않음'을 시험한다고 한다. run.py:65는 historical_lineage_preserved를 상수 True로 둔다(5.9). 입력은 explicit_projection_basis, verification_basis, direct_extraction_basis, explicit_supersedes 같은 불리언이다. semantic 정책 격자의 필드(allowed_purposes, external_processing, training, retention_max_seconds)는 wire 스키마에 없다(wire는 policy_refs 문자열만 둔다). 케이스 JSON 3종에 requirement/invariant 참조 필드는 0개다.
- 내용: semantic 31건의 기대값은 명세에서 독립적으로 도출된 것이 아니라 오라클 분기 조건을 그대로 다시 적은 것이다. 5.1, 5.5, 5.7, 5.8, 5.9와 arrival order는 wire 객체 수준에서 시험할 경로가 없다. 따라서 core:253의 'have executable coverage'는 추상 장난감 함수 수준의 커버리지다. 내 추적표 기준 산문 요구 30개 가운데 wire/공개 수준 양·음성 시험 11개, 추상 전용 약 10개, 미시험 7개(identity/policy 음성, optional extension, 5.12, 스코프 actor 동일성, identity 병합, 수명주기 상태)다.
- 권고: 각 케이스에 요구 ID를 붙이고, 추상 범주를 wire 객체와 다중 사건 시퀀스로 재표현한다. 기대값의 도출 근거(조항)를 기록한다.

### SA-10: support_sets가 의미 수준에서 정규화되지 않는다: 중복, 비최소 상위집합, 어느 집합에도 없는 material 지지 의존이 모두 수락된다

- 기준: C4, C3
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: schema:207-217 uniqueItems는 순서를 구분하므로 [[A,B],[B,A]]가 통과한다. 프로브 P3 → accepted=True, digest support_sets=[[A,B],[A,B]](중복). P3b [[A],[A,B]] → accepted=True, digest가 비최소 형태를 유지한다. 논리적으로 같은 [[A],[B]]와 [[A],[B],[A,B]]는 normalize_assertion 결과가 다르다(결과 False). P4: material supports 의존 B가 어느 support set에도 없음 → accepted=True. run.dependency_invalidation_result({all_sources:[A], support_sets:[[A],[Z]], removed:[A]}) → recompute(근거 목록에 없는 Z가 생존 근거로 쓰인다).
- 내용: DNF 의미(A ∨ (A∧B) ≡ A)가 정규화에 반영되지 않는다. 그래서 '동일한 semantic state' 비교와 하네스 digest가 의미가 아니라 구문 동등성이다. support set에 속하지 않은 material 지지 의존이 무슨 뜻인지(제거 시 recompute인지 none인지)도 정의되지 않았다.
- 권고: support set 내부 중복 제거, 흡수 법칙에 따른 최소화, 집합 간 중복 금지를 정규화나 검증 규칙으로 정하고, 모든 material 지지 의존이 적어도 한 support set에 속하도록 요구할지 결정한다.

### SA-11: fail-closed가 리터럴 'unknown'에만 적용되고, actor 동일성과 trust_domain 규칙이 없다

- 기준: C4, C8, C3
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: run_wire.py:45-50은 bilateral/group/unknown만 판정한다. 프로브 P13 scope_type='x-acme:secret-circle'(required_extensions 없음) → accepted=True. P13b provider_defined, 참여자 4명 → accepted=True. P1 participants=[(A,tenant:t1,person),(A,tenant:t1,agent)]로 'bilateral' → accepted=True. 이는 run_wire.py:34-35 actor_key가 actor_type을 동일성에 포함하기 때문이다. P1b 참여자 scope가 tenant:t9/t8인데 trust_domain='tenant:t1' → accepted=True.
- 내용: core 5.11은 '미지의 relationship scope는 더 허용적인 값으로 해석되지 않는다'고 한다. 그러나 소비자가 모르는 namespaced scope_type은 required extension으로 선언되지 않으면 그대로 수락된다. core 4.1은 identifier가 scope로 한정된다고만 하고 actor_type이 동일성에 들어가는지는 말하지 않는다. 그 결과 같은 사람이 두 타입으로 등장하는 '자기 자신과의 bilateral'이 가능하다. trust_domain(테넌트 격리 경계, core:88)과 참여자 scope의 관계도 검사되지 않는다.
- 권고: base 집합 밖의 scope_type은 대응 required_extension을 요구하거나 fail-closed로 처리한다. actor 동일성 키를 산문으로 정의하고, trust_domain과 참여자 scope의 정합 규칙을 둔다.

### SA-12: 외부 계약의 digest 정렬 규칙이 모호해 독립 구현과 참조 어댑터가 다른 digest를 낼 수 있다

- 기준: C9, C3
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: CONTRACT.md:125 'sort the outer list lexicographically by its JSON-array value'. reference_adapter.py:52는 json.dumps 문자열로 정렬한다. 실험 결과 [['ev:a'],['ev:a b']]를 JSON 문자열로 정렬하면 [['ev:a b'],['ev:a']], 배열 사전식으로 정렬하면 [['ev:a'],['ev:a b']]가 된다. 비BMP 문자는 Python(코드포인트)과 JS(UTF-16) 정렬 결과가 다르다. 'lexicographically'의 문자 단위도 정의되지 않았다.
- 내용: 공개 케이스의 ref에는 공백이나 '!' 같은 문자가 없어 드러나지 않는다. 보류 케이스에서는 클린룸 구현의 digest 불일치가 명세 결함이 아니라 구현 실패로 오분류될 수 있다.
- 권고: 정렬 키를 '각 원소를 Unicode 코드포인트 순으로 비교하는 배열 사전식'처럼 정확히 정의하고, 경계 문자를 담은 케이스를 추가한다.

## 4. 실행한 검증

```text
모든 명령은 대상 체크아웃 wt(68026af)에서 .venv/bin/python으로 실행했다. 스크립트와 출력은 eval/spec-auditor/에 있다.
1) 기준선: conformance/v0_2/run.py → 'PASS (31 cases)'. run_wire.py → 'PASS (20 schema/semantic cases, 1 binding-equivalence case)'. external/v0_2/harness.py --cmd reference_adapter.py → 'PASS (15/15 cases)'(ref-report.json). jsonschema 4.26.0과 rfc3339-validator 0.1.4가 설치되어 있어 date-time 형식 검사가 동작한다(P25 잘못된 날짜 거부로 확인).
2) 규범 키워드 집계: grep -o '\bMUST\b' 등. core-v0.2 MUST 0/must 9, wire MUST 0/must 3, README MUST 8, core-v0.1 MUST 99. 2119/8174 선언은 v0.2 문서에 없다.
3) 스키마-산문 대조 스크립트: 스키마 이름 99개 중 core+wire 산문 미언급은 visibility, redacted, hidden, derived_from, valid_from, valid_until, reason_refs, provider_ref, occurred_at, organization_mediated, provider_defined, assertion_relations 등이다.
4) mutate_wire.py: run_wire.semantic_errors의 errors.append 19곳을 하나씩 무력화하고 wire-cases와 public.json으로 판정했다. 6개 잡힘(L50, L65, L104, L138, L143, L150), 1개 등가(L78), 12개 생존.
5) mutate_sem.py: run.py 변이 24개 중 12개 잡힘, 12개 생존(정책 격자 7, extracted/verified 2, composition 2, binding 정렬 1).
6) probes.py: 구체 JSON 단언 25개를 reference_adapter에 넣었다. 수락: P1, P1b, P2, P3, P3b, P4, P7, P7b, P8, P9, P9b, P11, P11b, P12, P13, P13b, P21, P23, P24. 거부: P7c, P20, P22, P25.
7) run.py와 run_wire.py 함수 직접 호출: 순환 → recompute, verified→verified basis 없이 True, 투영 {A,C}→{A,B}+basis에서 semantic False/wire 수락, 상호 supersedes는 양쪽 모두 []. 논리적으로 같은 support_sets의 normalize 결과는 다르다.
8) 케이스 열거값 분포: 35개 인스턴스에서 lifecycle은 active 32/disputed 3, mode는 evidence 15/derived 5/opaque 15(unavailable 0), scope_type은 bilateral 33/group 1/unknown 1이다. 케이스 JSON의 requirement 참조 필드는 0개다.
9) 추적표(산문 요구 30개 기준): wire/공개 수준 양·음성 시험 11, 추상 전용 약 10, 미시험 7. 시험은 있으나 산문 요구가 없는 오라클 규칙은 약 13개다.
```

## 5. 평가 한계

1) 클린룸 검증기를 직접 작성하지 않았다. C9 판단은 산문과 오라클 규칙의 대조에 근거한다.
2) bindings/v0_2(MCP/HTTP) 실행과 v0.1 스위트, CI 워크플로 전체는 재현하지 않았다.
3) 추적표의 '요구' 30개는 core §4·§5, wire §3-§13, scenarios A의 문장을 내가 분해한 것이다. 분해 단위에 따라 개수가 달라질 수 있다.
4) 변이 시험은 errors.append 단위와 손으로 고른 semantic 변이로 했다. 모든 변이 연산자를 망라하지 않았다.
5) 공개 케이스의 기대 digest가 오라클 출력을 복사한 것인지 손으로 쓴 것인지는 커밋 이력을 확인하지 않아 판정하지 못했다(참조 어댑터와 15/15 일치한다는 것만 확인).
6) SA-01을 치명이 아닌 높음으로 분류한 것은 core 5.4의 opaque 허용 문구를 감안한 판단이다. 오케스트레이터가 게이트 규칙을 적용할 때 재검토할 수 있다.
