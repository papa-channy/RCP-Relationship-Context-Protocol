# 평가 보고서: 보안·프라이버시 레드팀 / C8-C4

| 항목 | 값 |
|---|---|
| 평가자 | Sonnet 5.5, 보안·프라이버시 레드팀 |
| 유형 | agent |
| 대상 커밋 | `68026af` |
| 기준 버전 | CRITERIA v1.1 |
| 작성일 | 2026-10-10 |
| 교차 검증 | Opus 5.5가 높음 이상 발견을 재현·반박 시도 |
| 독립성 | `evaluation/`이 없는 커밋에서 작업, 자체 평가와 다른 보고서 미열람 |
| 생성 | 워크플로 `wf_b25ca37f-bb5`의 구조화 출력을 변환. 원본은 `raw/run2-result.json` |

## 1. 요약

**한 줄 판정.** v0.2 보안·프라이버시 위협 모델이 없고(위협 목록은 v0.1 시기의 46줄짜리 비매핑 문서뿐), 적대적 ContextAssertion 22건이 스키마, run_wire.py semantic_errors, 외부 참조 어댑터를 모두 통과해 참여자 범위 붕괴, epistemic 세탁, 제한 세탁, 테넌트 간 상관을 와이어 수준에서 막지 못한다. 치명 판정 기준에는 못 미쳐 게이트는 발동하지 않는다.

**강점**

- CHARTER.md:127-130과 README.md:199-200이 감시, 소셜 스코어링, 데이터 브로커 사용을 명시적 비목표로 선언한다. 다만 산문 선언일 뿐 프로토콜 필드로는 강제되지 않는다.
- ROADMAP.md M5가 참여자 범위 누출, 테넌트 간 상관, epistemic laundering, derived-data laundering, 제한 상속 오류를 미검토 위험으로 정직하게 열거한다. spec/core-v0.2-draft.md §10도 외부 보안 검토 미수행을 명시한다.
- evidence 모드에서 출처 참여자와 대상 범위가 다르면 projection_basis_ref를 요구하는 검사는 동작한다. 통제군 01b가 REJECTED로 확인됐다.
- 알 수 없는 required_extensions와 scope_type=unknown은 fail-closed로 거부된다(run_wire.py:49, :145-). 추상 오라클 run.py의 policy_projection은 목적, 외부처리, 학습, 보존기간을 보수적으로(교집합/최소값) 계산한다.
- SECURITY.md는 production-ready가 아님을 밝히고 메타데이터(신원 링크, 출처 그래프, 철회 이력) 자체를 민감 대상으로 본다. v0.1 체크리스트는 항목별로 구체적이다.

**시급한 문제**

- v0.2 위협 모델이 없다. 위협을 v0.2 필드, 불변식, 테스트에 매핑한 문서가 하나도 없다.
- 불변식 5.2(참여자 붕괴 금지)와 5.3(epistemic 승격 금지)은 와이어에서 우회가 쉽다. derived 모드에서 evidence 배열을 생략하면 5.2 검사가 꺼지고, verified_fact의 근거는 문자열 포함 여부만 본다.
- 불변식 5.6/5.7(제한 상속)은 와이어 표현이 없어(policy_refs는 불투명 문자열) 추상 오라클에서만 시험된다.
- 목적, 수신자, 동의 필드가 없고 빈 policy_refs가 '무제한'으로 통과한다. 감시, 스코어링, 브로커링 오용을 프로토콜 구조가 어렵게 만들지 못한다.

## 2. 기준별 점수

| ID | 점수 | 확신도 | 근거 |
|---|---|---|---|
| C1 | N/A | N/A | 다루지 않음. |
| C2 | N/A | N/A | 다루지 않음. |
| C3 | N/A | N/A | 다루지 않음. |
| C4 | 2 | 중 | 추상 오라클은 주요 경로(투영, 지원 집합 무효화, 제한 교집합, 승격 차단)에서 결정적이다. 그러나 와이어 오라클이 추상 오라클과 모순된다(범위 확대: 추상 projection_allowed=False, 와이어 수락). verified_fact 근거 해석, 자기 순환 지원, lifecycle 상태 기계(전이, 유효기간, 철회 후 처리)는 미정의 또는 미검사다. 기대치 3에 못 미친다. |
| C5 | 2 | 하 | 보조 관찰이다. 추상 오라클 일부 함수(source_access_allowed 등)는 입력 필드 동치 비교여서 불변식 5.5를 사실상 시험하지 않는다. 외부 어댑터는 run_wire.py를 그대로 import하므로 하네스 PASS가 위 우회를 잡을 수 없다. 요구-테스트 추적표는 만들지 않았다. |
| C6 | N/A | N/A | run.py, run_wire.py PASS는 확인했으나 재현성 전체는 평가하지 않음. |
| C7 | N/A | N/A | 다루지 않음. |
| C8 | 1 | 상 | v0.2 위협 모델 부재(docs/threat-and-rights-model.md 46줄은 v0.1 시기 비규범 목록이며 v0.2 필드, 불변식, 테스트와 매핑이 없다. 체크리스트도 'Core v0.1' 대상). 적대적 객체 22건이 스키마, run_wire.py, 외부 참조 어댑터를 통과했다. 목적, 수신자, 동의, 제한의 와이어 표현이 없어 오용 저항이 문서 수준에 머문다. 비목표 선언, M5의 정직한 미검토 표기, 일부 fail-closed 규칙은 가점. v0.2 단계 기대치 2보다 한 단계 낮다. |
| C9 | N/A | N/A | 다루지 않음. |
| C10 | N/A | N/A | 다루지 않음. |

## 3. 발견 사항

### RT-1: v0.2 위협 모델이 없고, 기존 위협 문서는 v0.2 필드, 불변식, 테스트에 매핑되지 않는다

- 기준: C8
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: docs/threat-and-rights-model.md는 46줄이며 위협 20개를 불릿으로 나열할 뿐이고 맨 위에 'initial rights model', 'non-normative'라고 적혀 있다. v0.2 문서에서 threat를 grep하면 IMPLEMENTER_GUIDE_V0_2.md와 INDEPENDENT_IMPLEMENTATION_REPORT_V0_2_TEMPLATE.md의 분류 라벨 'security_or_privacy_concern'만 나온다. docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md:1은 'experimental RCP Core v0.1'이라 명시하고 SecureEnvelope, JOSE, PermissionDecision 중심이다. SECURITY.md는 33줄의 일반 기대사항이다. ROADMAP.md M5 체크박스는 전부 미체크다.
- 내용: 위협 목록(group-context misattribution, source-statement-to-fact collapse, derived-data laundering, provenance leakage, cross-tenant identity graphs)은 RCP 고유 위협을 정확히 짚는다. 그러나 각 위협이 어느 v0.2 필드(participants, source_participants, verification_basis_refs, policy_refs, support_sets, lifecycle), 어느 불변식(§5.x), 어느 테스트 케이스로 막히는지 연결이 없다. 그래서 불변식이 실제로 막는지를 문서에서 확인할 수 없고, 아래 RT-2부터 RT-10의 우회가 위협 모델과의 대조 없이 방치됐다.
- 권고: 위협ID, 공격자 능력, 관련 와이어 필드와 불변식, 막는 테스트(없으면 갭 명시)를 담은 v0.2 위협 모델 표를 신설한다. 체크리스트도 v0.2 ContextAssertion 기준으로 재작성한다.
- 검증 의견: 사실관계는 모두 재확인했다. docs/threat-and-rights-model.md는 46줄이고 'intentionally non-normative', 'initial rights model'이라고 명시한 채 위협 20개를 불릿으로만 나열한다. v0.2 관련 문서(spec/*v0.2*, conformance/v0_2, external/v0_2, IMPLEMENTER_GUIDE_V0_2 등)에서 threat를 grep하면 IMPLEMENTER_GUIDE_V0_2.md:154와 리포트 템플릿:116의 분류 라벨 'security_or_privacy_concern'만 나온다. SECURITY_PRIVACY_REVIEW_CHECKLIST.md:1은 'RCP Core v0.1'이고 §9 SecureEnvelope, §10 JOSE, §2 PermissionDecision을 중심으로 짜여 있다. outreach/SECURITY_REVIEW_REQUEST.md도 core-v0.1을 검토 대상으로 지정한다. 위협, 필드, 불변식, 테스트를 잇는 매핑은 실제로 없다. 다만 프로젝트는 ROADMAP M5(194-207행)에서 독립 보안 검토를 아직 하지 않은 향후 마일스톤으로 두고 있고, 그 항목(participant-scope leakage, epistemic laundering, derived-data laundering 등)이 사실상 v0.2 위협 초점 목록 역할을 한다. 스펙 전체도 non-normative draft다. 따라서 이 갭은 문서와 프로세스의 결함이지 불변식이 직접 깨진 것은 아니어서 '높음'에서 '중간'으로 낮춘다.
- 검증 근거: wc -l: threat-and-rights-model.md 46줄, SECURITY.md 33줄. grep -rniE 'threat|security_or_privacy' on v0.2 docs: 결과는 IMPLEMENTER_GUIDE_V0_2.md:154, INDEPENDENT_IMPLEMENTATION_REPORT_V0_2_TEMPLATE.md:116 두 건뿐이다. SECURITY_PRIVACY_REVIEW_CHECKLIST.md:1 '# RCP Core v0.1 — Security & Privacy Review Checklist', §9 'SecureEnvelope authorization binding', §10 'JOSE profile review'. ROADMAP.md:194-207 M5 체크박스 전부 [ ].

### RT-2: derived 모드에서 evidence 배열을 생략하면 참여자 붕괴 검사(불변식 5.2)가 꺼지고, projection_basis_ref는 임의 문자열이어도 통과한다

- 기준: C8, C4
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: run_wire.py:62-67은 provenance.evidence 항목에만 source_participants를 비교한다. derivation.dependencies에는 참여자 필드가 없다. 재현: scratchpad/eval/security-redteam/run_all.sh. attacks/01-participant-collapse-derived-mode.json(의존성 ref 'evidence:group-chat-ABC', 대상 {A,B}, 문장에 '(source: group chat A,B,C)')는 ACCEPTED. 통제군 attacks/01b는 같은 의미를 evidence 모드로 쓰면 'evidence:g changes participant scope without projection_basis_ref'로 REJECTED. attacks/01c는 projection_basis_ref='basis:trust-me'(어디에도 해석되지 않음)로 ACCEPTED.
- 내용: core-v0.2-draft.md §4.2/§5.2는 {A,B,C}의 근거가 조용히 {A,B}의 맥락이 되어서는 안 된다고 하지만, 출처 참여자를 선언하지 않으면 '선언된 출처 참여자와 다름'을 판정할 수 없어 검사가 우회된다. 악의적 Provider는 derived 모드만 쓰면 된다. projection_basis_ref는 해석 규칙이 없어(wire §6 '증명 언어를 정의하지 않는다') 존재 여부만 본다. 문서가 한계를 인정하고 있어 치명이 아닌 높음으로 둔다(판단).
- 권고: derived 모드에서도 의존성이 가리키는 evidence의 source_participants 선언을 요구하거나, 출처 참여자를 알 수 없으면 대상 범위를 제한하는 규칙을 둔다. projection_basis_ref는 같은 객체 내 해석 가능한 참조 또는 필수 프로파일 네임스페이스로 제한하고, 해석 실패는 fail-closed로 한다. derived 모드 우회를 wire-cases.json에 음성 케이스로 추가한다.
- 검증 의견: 공격 객체를 직접 새로 작성해 재현했다. 대상 {A,B}, derived 모드, evidence 타입 의존성 'evidence:g', support_sets [['evidence:g']]로 구성하고 statement에 그룹 출처를 적었는데 schema와 semantic 검사를 모두 통과했다. 같은 의미를 evidence 모드로 쓰면서 source_participants를 {A,B,C}로 두면 'changes participant scope without projection_basis_ref'로 거부된다. 여기에 projection_basis_ref='basis:trust-me'만 넣으면 다시 통과한다. run_wire.py:62-67은 provenance.evidence 항목만 검사하고 Dependency 스키마(schema:181-195)에는 참여자 필드가 없으므로 지적이 맞다. wire-cases의 derived 케이스 3건은 모두 evidence 배열이 없어 이 경로에서 참여자 검사가 한 번도 실행되지 않는다. 반박 요소도 있다. (1) wire §8과 core §5.4는 opaque/unavailable provenance를 명시적으로 허용하고, opaque 모드는 원래 참여자 검사를 받지 않는다. 그래서 악의적 Provider에게 derived 우회는 opaque 대비 추가 이득이 크지 않다. (2) projection_basis_ref가 임의 문자열이라는 점은 wire §6('does not define a universal proof language')과 core §11 및 wire §19의 열린 질문에 이미 적힌 한계다. 실질 결함은 이것이다. derived 모드에서 evidence 타입 의존성이 EvidenceReference로 해석되도록 요구하지 않는다. 그래서 opaque를 선언하지 않은 정직한 구현도 participant collapse 검사를 받지 않는다. 이를 근거로 '중간'으로 둔다.
- 검증 근거: probe.py 출력: 'RT2-derived-collapse: ACCEPTED', 'RT2-evidence-control: REJECTED sem=[evidence:g changes participant scope without projection_basis_ref]', 'RT2-basis-arbitrary: ACCEPTED'. 참고로 derived 모드에 evidence 배열을 함께 넣으면 REJECTED된다(RT2-derived-with-evidence-list). 따라서 우회 조건은 evidence 배열을 생략하는 것이다. run_wire.py:62-67, schema Dependency:181-195.

### RT-3: 추상 오라클과 와이어 오라클이 범위 확대(권한 확장)에서 서로 모순된다

- 기준: C4, C8
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 높음)
- 근거: run.py:26-33 projection_allowed는 target이 source의 부분집합이 아니면 False. 직접 호출 결과: projection_allowed({source:[A,B], target:[A,B,C], explicit_projection_basis:True}) = False. 반면 run_wire.py:62-64는 source != target이고 basis 문자열만 있으면 통과한다. attacks/02-scope-widening-C-added.json(근거 참여자 {A,B}, 대상 group {A,B,C}, projection_basis_ref='basis:x')이 외부 어댑터에서 ACCEPTED.
- 내용: 불변식 5.1(No rights expansion)에 따르면 양자 대화 근거로 제3자 C가 포함된 그룹 맥락을 만들 수 없다고 읽는 것이 자연스럽고, 추상 오라클도 그렇게 인코딩했다. 와이어 오라클은 '다르면 basis'로 일반화되어 C를 새로 편입시키는 방향까지 basis 한 줄로 허용한다. 두 오라클이 같은 저장소의 31+20 케이스를 모두 PASS하면서 서로 모순된다는 점이 스펙 결함의 직접 증거다.
- 권고: 와이어 오라클을 target ⊆ source로 맞추고, 확대 방향은 별도 명시적 의미(예: 추가 참여자의 동의 증거)를 요구한다. 추상-와이어 오라클 간 교차 검증 테스트를 추가한다.
- 검증 의견: 재현했고, 지적보다 더 강한 증거도 찾았다. run.py:26-33 projection_allowed는 target이 source의 부분집합이 아니면 basis가 있어도 False를 반환한다(직접 호출: {A,B}에서 {A,B,C}로, basis=True면 False). 반면 run_wire.py:62-64는 집합이 서로 다르고 basis 문자열만 있으면 통과시킨다. 내가 만든 객체 중 근거 {A,B}에서 group {A,B,C}로 가는 것도 ACCEPTED였다. 더 결정적인 것은 semantic-cases.json의 'projection-target-not-in-source'다. 이 케이스는 source {A,B}, target {A,D}, basis=true를 expected_allowed=false로 명시하는데, 이와 동등한 wire 객체({A,B}에서 {A,D}, basis 'basis:x')가 wire 오라클에서는 ACCEPTED다. docs/semantic-scenarios-v0.2.md:34도 'source_participants ⊇ target_participants is necessary but not sufficient'라고 명시한다. 반대편에서는 wire §6과 core §4.2가 'Whenever those sets differ ... an explicit semantic basis is required'라고 쓰고 있어 wire 오라클이 wire 문서와는 일치한다. 그러니 이것은 저장소 내부 문서와 오라클 사이의 실제 모순이다. 두 스위트가 모두 PASS한다(31케이스, 20+1케이스). draft 단계이고 wire 문서 문언이 basis만으로 허용하므로 '치명'이 아닌 '높음'을 유지한다.
- 검증 근거: probe.py: 'RT3-widen: ACCEPTED', 'abstract projection_allowed widen: False', 'RT3-target-not-in-source(A,D): ACCEPTED'. semantic-cases.json: {"id": "projection-target-not-in-source", "source_participants": ["A","B"], "target_participants": ["A","D"], "explicit_projection_basis": true, "expected_allowed": false}. semantic-scenarios-v0.2.md:34. run.py:26-33 vs run_wire.py:62-64.

### RT-4: verified_fact 승격 방어가 '근거 문자열이 참조 집합에 있는가'뿐이라 약한 근거가 verified_fact가 된다

- 기준: C8, C4
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: run_wire.py:135-138은 known_basis_refs = evidence_refs | dependency_refs 포함 여부만 확인한다. 어댑터 ACCEPTED: 03a(근거가 evidence_type=unknown, representation=opaque_ref인 'B is insolvent.' verified_fact), 03b(근거가 material=false인 policy 의존성 'policy:p1'을 가리키는 'B committed fraud.' verified_fact), 03c(근거가 어디서도 해석되지 않는 'assertion:weak-inference-7'). 추상 오라클 run.py:104-111도 bool(case.get('verification_basis'))이라 verification_basis='rumor'면 True다(직접 호출 확인: source_statement->verified_fact, basis='rumor' -> True).
- 내용: 불변식 5.3은 verified_fact가 선언된 계보로 해석되는 명시적 근거를 요구한다고 하지만, 근거의 종류(evidence/assertion/policy/identity), 대표성(material), 표현 충실도(opaque_ref/type_only), 근거 assertion의 epistemic class는 전혀 검사되지 않는다. 약한 주장이 형식 요건만 갖추면 verified_fact로 전파되어 epistemic laundering이 성립한다. 근거 assertion이 실제로 verified인지는 단일 객체로는 알 수 없다.
- 권고: 단일 객체 수준에서 근거는 material evidence/assertion 유형만 허용하고, opaque_ref/type_only 단독 근거와 policy/identity_binding 의존성은 금지한다. 교차 객체 수준에서는 verified_fact의 근거 assertion이 verified_fact이거나 명시적 검증 프로파일이어야 한다는 규칙과 교차 객체 테스트를 정의한다.
- 검증 의견: 재현했다. 세 경우가 모두 ACCEPTED였다. (a) evidence_type=unknown, representation=opaque_ref인 근거를 둔 verified_fact. (b) material=false인 policy 의존성을 verification_basis_refs로 지정한 verified_fact. (c) assertion 의존성을 근거로 둔 verified_fact. 해석되지 않는 ref는 거부되므로 검사는 '참조 해석'만 한다(run_wire.py:135-138). 하지만 일부는 과장이다. (1) core §4.5와 §5.3, wire §3이 요구하는 것은 'explicit basis that resolves into declared lineage'뿐이고, 오라클은 그것을 정확히 구현한다. 단일 객체 검증기는 Provider가 실제로 검증했는지 원천적으로 판별할 수 없다. (2) §4.5 'verification occurred under an explicit basis/policy'라는 문언을 보면 policy 근거도 의도된 것일 수 있다. (3) 추상 오라클의 'rumor' 지적은 오독에 가깝다. semantic-cases에서 verification_basis는 불리언 플래그로 쓰이는 추상 테스트 표현이라 문자열 의미를 검사할 대상이 아니다. 진짜 결함은 이것이다. non-material 의존성을 verification 근거로 허용하는 것은 §5.8(material 의존성 변경 시 재평가)과 정합하지 않는다. 근거가 사라져도 verified_fact가 재평가 대상이 되지 않는다. 그래서 '중간'으로 낮춘다.
- 검증 근거: probe.py: 'RT4a-unknown-opaque: ACCEPTED', 'RT4b-policy-nonmaterial-basis: ACCEPTED', 'RT4c-assertion-basis: ACCEPTED', 대조군 'RT4-control-unresolved: REJECTED'. 'abstract verified with basis=rumor: True'(run.py:104-111, 테스트 케이스는 boolean 사용). core-v0.2-draft.md:148 'verified_fact — verification occurred under an explicit basis/policy', :160.

### RT-5: 제한(policy) 상속이 와이어에서 불투명 문자열이어서 제한 세탁이 가능하고, 불변식 5.6/5.7은 추상 오라클에서만 시험된다

- 기준: C8, C4
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: 스키마 policy_refs는 string 배열이다(context-assertion.schema.json:51-55, 174-178). run_wire.py:121-133은 'material=true인 policy 의존성은 assertion.policy_refs에 포함'만 확인하고 derived 모드에서만 실행된다. 어댑터 ACCEPTED: 04a(evidence.policy_refs=[no-external-processing, no-training, org-confidential]인 근거로 assertion.policy_refs 없음, evidence 모드), 04b(policy:org-confidential 의존성을 material=false로 표기), 04c(policy:no-training과 policy:allow-all을 동시에 policy_refs에 둠). 추상 policy_projection(run.py:62-85)의 목적/외부처리/학습/보존 비교는 와이어에 대응 필드가 없다.
- 내용: Provider가 제한된 근거에서 파생한 assertion을 만들면서 evidence 쪽 policy_refs를 버리거나 material=false로 표기하면 제한이 사라지고도 통과한다. 어떤 ref 문자열이 더 제한적인지 비교할 방법이 없어(§5.7 '프로파일 정의') 충돌 해소도 불가능하다. 결과적으로 5.6/5.7은 와이어 상호운용 보장이 아니라 설계 의도에 불과하다. 문서(wire §10)는 이를 프로파일로 미룬다고 인정하나, 프로파일이 없는 상태에서 Core 적합성이 이 우회를 허용한다.
- 권고: (1) evidence.policy_refs는 파생 assertion의 policy_refs에 포함되어야 한다는 규칙을 단일 객체 검사로 추가한다. (2) policy 의존성의 material=false를 금지하거나 미표기 policy를 fail-closed로 처리한다. (3) 최소 정규화 제약(no_external_processing, no_training, retention_max 등)을 인라인 필드로 승격하는 안을 열린 질문(§11)에서 결정한다.
- 검증 의견: 재현했다. (a) evidence.policy_refs에 no-training 등 3개가 있는데 assertion.policy_refs가 없는 evidence 모드 객체가 ACCEPTED였다. (b) policy 의존성을 material=false로 표기한 객체도 ACCEPTED였다. 같은 객체를 material=true로 바꾸면 'material policy dependencies are not preserved'로 거부된다. (c) 상충하는 policy_refs도 ACCEPTED였다. run_wire.py:122-133의 정책 보존 검사는 derived 모드의 material policy 의존성에만 적용된다. 반박 요소도 확인했다. (1) 04a에서 제한은 객체 밖으로 '사라지지' 않는다. evidence 수준 policy_refs가 같은 객체에 남아 있고 normalize_assertion(200행)에도 보존된다. 다만 외부 계약의 reference_adapter semantic_digest는 assertion 수준 policy_refs만 담고 evidence 수준은 뺀다. (2) materiality는 Provider가 스스로 선언하는 값이라 04b는 사실상 '거짓 선언' 문제다. (3) 정책 의미와 충돌 해소는 wire §10, core §4.11, 열린 질문 §11('Which policy constraints ... must be normalized inline')에서 프로파일로 미룬다고 명시돼 있다. 5.6/5.7의 목적, 학습, 보존 비교가 추상 오라클(run.py:62-85)에만 있고 와이어에 대응 필드가 없다는 지적은 사실이다. 문서화된 한계라 '중간'으로 둔다.
- 검증 근거: probe.py: 'RT5a-evidence-policy-dropped: ACCEPTED', 'RT5b-policy-nonmaterial: ACCEPTED', 'RT5b-control-material: REJECTED sem=[material policy dependencies are not preserved: policy:org-confidential]', 'RT5c-conflicting: ACCEPTED'. schema:51-55, 174-178 (string 배열). run_wire.py:122-133 (derived 분기 내부). wire-v0.2-draft.md:267-283.

### RT-6: 자기 순환 지원과 해석되지 않는 의존성 참조가 통과하며, 순환/해석 검사는 단일 객체 구조상 불가능하다

- 기준: C4, C8
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: attacks/05-self-supporting-assertion.json: assertion_id='assertion:self', 의존성 dependency_ref='assertion:self'(type=assertion, role=supports, material=true), support_sets=[['assertion:self']] -> 어댑터 ACCEPTED. run_wire.py:140-143은 assertion_relations의 자기참조만 거부하고 derivation.dependencies의 자기참조는 보지 않는다. attacks/03c도 'assertion:weak-inference-7'이 어디서도 해석되지 않은 채 통과.
- 내용: 자기 자신이 유일한 지원인 assertion은 '독립적으로 충분한 근거 경로'(§4.8)를 위조하며, 무효화 연쇄에서 영원히 current로 남거나 철회 전파를 막을 수 있다(철회 후 잔존). 자기참조는 단일 객체 검사로 잡을 수 있으나 상호 순환은 다객체 그래프라 현재 검증 구조로는 불가능하다. wire §18이 스키마는 그래프 규칙을 인코딩하지 않는다고 하면서 그래프 규칙을 시험하는 다객체 코퍼스는 v0.2에 존재하지 않는다.
- 권고: dependency_ref == assertion_id 거부를 즉시 추가하고, 다객체 그래프 적합성 스위트(순환, 미해결 참조, 무효화 연쇄)를 별도 신설한다.

### RT-7: trust_domain과 참여자 scope 간 관계가 검증되지 않고, identity_dependency_refs는 derived 모드에서만 검사되어 테넌트 간 신원 상관이 와이어에 남는다

- 기준: C8
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: 어댑터 ACCEPTED: 06a(참여자 alice@tenant:t1, alice@tenant:t2, trust_domain=tenant:t1, 'same person who moonlights for a competitor', identity_dependency_refs 없음), 06b(참여자 scope=t1,t2, trust_domain=tenant:t3), 06c(mode=opaque, identity_dependency_refs=['identity:ghost'], 해당 의존성 없음). run_wire.py의 identity 검사는 provenance.mode=='derived' 블록 안(76행 이후)에만 있다. actor_key는 scope를 키에 포함해 'alice'가 두 테넌트에서 별개 행위자로 취급된다.
- 내용: 스키마와 오라클 어디에도 '서로 다른 테넌트의 행위자를 한 assertion 참여자로 묶으려면 신원 바인딩 의존성이 필요하다'는 규칙이 없다. 따라서 테넌트 경계를 넘는 상관을 assertion 하나로 표현하고 유통할 수 있다(core §4.1 '불확실한 신원 증거가 민감한 이력을 조용히 합치면 안 됨'이 와이어에서 비강제). 신원 의존성이 선언돼도 opaque/evidence 모드면 실체 확인을 건너뛴다. SECURITY.md의 'tenant-scoped identity graphs' 기대와도 어긋난다.
- 권고: 참여자 scope가 둘 이상이면 모든 모드에서 material identity_binding 의존성을 필수화한다. trust_domain이 참여자 scope 집합과 일치하거나 포함 관계여야 한다는 검사를 둔다. 모든 모드에서 identity_dependency_refs 해석을 검사한다.

### RT-8: lifecycle 의미론이 얇아 철회 후에도 전문(statement/provenance)이 유지되고 상태, 유효기간, 관계의 불일치가 통과한다

- 기준: C4, C8
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: 어댑터 ACCEPTED: 07a(lifecycle.state=revoked, statement에 민감 본문, provenance.visibility=full), 07b(state=active, valid_from=2030, valid_until=2020), 07c(state=superseded이나 supersedes 관계 없음), 07d(같은 대상에 supersedes와 conflicts_with 동시). 스키마 Lifecycle(context-assertion.schema.json:245-263)은 state 열거와 optional 시각뿐이고 reason_refs도 선택. run_wire.py에 lifecycle 검사는 없다.
- 내용: core §4.10은 전이를 정의하지 않고 '재평가는 처리 연산'이라 한다. 철회/무효화된 assertion이 statement와 근거 참조를 그대로 싣고 다니는 것을 막는 규칙이 없다(철회 후 잔존). 불변식 5.9(역사 불변)와 철회 시 데이터 최소화의 균형이 미정의다. 상태 기계 전이표가 없어 C4의 상태 공간 정의가 부분적이다.
- 권고: lifecycle 전이표(허용/금지 전이, 상태별 필수 필드)를 core에 규범적으로 추가하고, revoked/invalidated 상태에서의 statement/evidence 노출 제한(tombstone 형식)과 valid_from<valid_until 검사를 정의한다.

### RT-9: provenance.visibility가 실제 노출 필드와 연동되지 않아 '숨김'이어도 근거 참여자, 시각, 지원 구조가 노출된다

- 기준: C8
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: 어댑터 ACCEPTED: 08(visibility=hidden인데 evidence에 ref 'evidence:dm-with-C-about-layoffs', source_participants {A,B,C}, occurred_at 포함), 10(visibility=hidden인 derived가 dependency_ref 'evidence:a-private-journal'/'evidence:b-private-email'과 support_sets 구조를 노출). 스키마는 derived 모드에서 derivation.dependencies minItems=1을 강제(context-assertion.schema.json:180-196)하고, run_wire.py와 어댑터 digest 어디에도 visibility 검사가 없다.
- 내용: evidence.source_participants는 필수 필드라서 {A,B} 대상 assertion을 볼 수 있는 소비자는 제3자 C의 존재와 그룹 소속을 알게 된다(참여자 범위 누출). support_sets는 어떤 근거 하나만으로 충분한지(즉 코로보레이션 구조)까지 드러내 파생 assertion으로부터 원본 근거 추론을 돕는다. '파생 + 계보 유지'와 '근거 은닉'을 동시에 만족하는 모드가 없다. 일부는 설계상 불가피한 트레이드오프(판단).
- 권고: visibility 값별로 허용되는 필드를 정의(예: hidden이면 evidence/dependency_ref를 불투명 핸들로, source_participants는 대상 범위 부분집합만)하고 위반을 거부한다. 소비자 권한별 투영 규칙을 core에 추가한다.

### RT-10: 목적, 수신자, 동의 필드 부재와 '빈 policy_refs = 무제한' 해석으로 감시, 스코어링, 브로커링 오용을 구조가 막지 못한다

- 기준: C8
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: 어댑터 ACCEPTED: 09a(assertion_type='x-broker:social-score', epistemic_class=system_inference, 참여자 {B, scorer(service)}, statement '...financially stressed; trust score 0.12', extensions x-broker:profile{score,segments,resale:true}, provenance opaque/hidden, policy_refs 없음). 스키마 required 목록(context-assertion.schema.json:8-19)에 purpose/audience/consent/policy 관련 필수 필드가 없고 policy_refs는 선택. CHARTER.md:127-130은 감시, 사회신용, 브로커 네트워크를 비목표로 선언하지만 필드는 없다. 09b: scope_type='x-vendor:everyone-in-org'가 required_extensions 없이 ACCEPTED, 09c: epistemic_class=unknown + mode=unavailable + hidden이 계보 없이 ACCEPTED.
- 내용: actor_type에 service/agent를 허용하고 participants 최소 2명이라, '개인 + 스코어링 서비스' 쌍으로 개인 프로파일을 관계 맥락처럼 포장할 수 있다. 어떤 목적으로 누구에게 전달 가능한지 구속하는 와이어 요소가 없고(정책은 전부 참조), 정책 부재가 무제한으로 읽힌다. 확장 scope_type/assertion_type이 required_extensions에 안 적혀도 통과해 5.11(알 수 없는 material 의미는 fail-closed)이 'unknown' 리터럴 하나에만 적용된다. 비목표는 산문이므로 오용 저항은 프로토콜 수준이 아니다.
- 권고: 민감 추론(system_inference/interpretation)이나 비-bilateral 사람-서비스 쌍은 최소 하나의 policy_ref 또는 purpose 제약을 필수화하고, 정책 부재를 '전달 불가'로 정의한다. 확장 타입이 material 의미를 바꾸는 경우 required_extensions 선언을 강제하며(미선언 x- scope_type/assertion_type 거부), 소셜 스코어링류 확장은 등록 거부 목록을 둔다.
- 검증 의견: 재현했다. 'x-broker:social-score' 타입, 참여자 {B(person), scorer(service)}, system_inference, opaque/hidden provenance, policy_refs 없음으로 만든 객체가 ACCEPTED였다. scope_type='x-vendor:everyone-in-org'와 'provider_defined'도 required_extensions 없이 ACCEPTED였다. epistemic_class=unknown과 mode=unavailable 조합도 ACCEPTED였다. 이에 비해 scope_type='unknown' 리터럴만 거부된다(run_wire.py:49-50). schema required(8-19)에 목적, 수신자, 동의 필드가 없다는 점과 CHARTER 비목표(감시, social-credit, data-broker)가 산문뿐이라는 점도 사실이다. 그러나 상당 부분은 과장이다. (1) '빈 policy_refs = 무제한'이라는 해석은 스펙 어디에도 없다. core §3과 wire §15·§17은 권한과 인가를 AuthZEN, OAuth 등 외부로 명시적으로 위임한다. 와이어 유효성은 사용 허가가 아니며, threat 문서는 'Unknown permission is non-executable'을 기본 자세로 둔다. (2) 목적과 동의를 Core에 넣지 않은 것은 문서화된 설계 선택이다(universal policy vocabulary 비목표). 실질 결함은 미선언 namespaced/provider_defined scope_type이 참여자 수 검사와 fail-closed를 모두 피해 간다는 점이다. 이를 이해하지 못하는 Consumer에게는 사실상 unknown material semantics이므로 §5.11의 취지와 어긋난다. 따라서 '중간'으로 낮춘다.
- 검증 근거: probe.py: 'RT10a-broker: ACCEPTED', 'RT10b-ext-scope: ACCEPTED', 'RT10-provider_defined-scope: ACCEPTED', 'RT10c-unknown: ACCEPTED', 대조군 'RT10-control-unknown-scope: REJECTED sem=[unknown relationship scope is material and must fail closed]'. run_wire.py:45-50 (bilateral, group, unknown만 분기). CHARTER.md 비목표 목록. core-v0.2-draft.md:297 §5.11.

### RT-11: 단일 객체 검증이 원천적으로 잡지 못하는 교차 객체 속성이 위협 대응 주장과 대응하는 시험 없이 남아 있다

- 기준: C8, C4, C5
- 심각도: 중간
- 구분: 판단
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: run_wire.py semantic_errors(instance, supported_extensions)는 단일 dict만 받는다. wire §18은 '스키마가 그래프/lifecycle 규칙을 모두 인코딩하도록 강제하지 않는다'고 하지만 conformance/v0_2에는 다객체 코퍼스가 없다(semantic-cases.json은 추상 입력). 어댑터(reference_adapter.py:1-12)는 run_wire.py를 import하며 독립 증거로 세지 말라고 자체 명시. 현 구조에서 감지 불가: 근거 assertion의 epistemic class(RT-4), 상호 순환(RT-6), 철회 전파 후 파생물 잔존, 같은 사람의 테넌트 간 assertion 합산, 동일 Provider 내 여러 assertion 결합으로 인한 범위 재구성(집계 추론).
- 내용: 주요 RCP 위협(epistemic laundering, 제한 세탁, 철회 후 잔존, 테넌트 간 상관)은 본질적으로 다객체/상태 속성이다. 단일 객체 오라클이 PASS해도 이 위협에 대한 보장은 0이다. 외부 클린룸 하네스 결과가 향후 PASS해도 같은 단일 객체 계약(CONTRACT.md §5)을 시험하므로 이 갭을 노출하지 않는다.
- 권고: 스키마/단일 객체 한계를 명시한 '위협 커버리지 매트릭스'를 문서화하고, 다객체 시나리오(근거 assertion 집합 + 파생 assertion + 철회 이벤트)를 입력으로 받는 v0.2 교차 객체 적합성 계약을 추가한다.

### RT-12: 참조 어댑터 digest는 policy 내용, visibility, lifecycle 시각, 근거 참여자를 제외해 외부 구현이 이 보안 속성을 일치시킬 필요가 없다

- 기준: C8, C5
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: conformance/external/v0_2/CONTRACT.md §4와 reference_adapter.py:semantic_digest(): 포함 필드는 assertion_id, assertion_type, epistemic_class, scope_type, target_participants, evidence_refs, material_dependency_refs, support_sets, policy_refs(최상위만), lifecycle_state, required_extensions. 제외: statement, evidence의 source_participants/projection_basis_ref/policy_refs, visibility, 타임스탬프, 비-material 의존성.
- 내용: 클린룸 구현이 digest를 맞추더라도 참여자 투영 근거, 근거 단위 policy, visibility 처리를 올바르게 구현했는지 digest로는 검증되지 않는다. accept/reject는 공개 케이스로 시험되지만 위 RT-2부터 RT-9가 보이듯 케이스 자체가 우회 경로를 다루지 않는다. 오라클 독립성(C5) 영역과 겹치며 보안 관점의 보조 관찰이다.
- 권고: 보안 관련 거부 케이스(derived 모드 투영, 근거 policy 드롭, 약한 verified 근거 등)를 보류 케이스로 추가하고, digest에 evidence 단위 source_participants/policy_refs를 포함하는 확장 계약 버전을 고려한다.

## 4. 실행한 검증

```text
wt에서 source .venv/bin/activate 후 python conformance/v0_2/run.py 실행 결과 'PASS (31 cases)', python conformance/v0_2/run_wire.py 실행 결과 'PASS (20 schema/semantic cases, 1 binding-equivalence case)'. 적대적 객체 생성은 python scratchpad/eval/security-redteam/gen.py로 23개 JSON을 attacks/에 만들었다. scratchpad/eval/security-redteam/run_all.sh가 각 객체를 conformance/external/v0_2/reference_adapter.py에 harness 계약 형식으로 전달한다(JSON Schema FormatChecker 후 run_wire.semantic_errors 호출). 결과는 통제군 01b만 REJECTED('evidence:g changes participant scope without projection_basis_ref')이고 나머지 22건은 ACCEPTED였다. run.py 함수 직접 호출로 projection_allowed({A,B}->{A,B,C}, basis=True)=False, epistemic_transition_allowed(source_statement->verified_fact, verification_basis='rumor')=True를 확인했다. 문서는 docs/threat-and-rights-model.md(46줄), docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md(v0.1 대상), SECURITY.md, spec/core-v0.2-draft.md §5, spec/wire-v0.2-draft.md, ROADMAP.md M5, CHARTER.md §5, README.md 비목표를 확인했다.
```

## 5. 평가 한계

reference-ecosystem(v0.1 Node 서비스), bindings/v0_2, JOSE 프로파일의 암호 검토는 범위 밖이라 평가하지 않았다. 적대적 객체는 스키마, 단일 객체 오라클, 참조 어댑터 기준 통과를 보인 것이며 실제 소비자 구현에서의 악용 가능성은 소비자 동작에 따라 다르다. RT-2와 RT-9 등 일부 우회는 문서가 이미 한계로 인정한 설계상 미정의일 수 있어 불변식이 직접 깨졌다기보다 주장된 보장보다 약하다는 판단이므로 치명이 아닌 높음으로 분류했다(게이트 규칙 미발동, RT-3의 추상-와이어 오라클 모순이 가장 치명에 가까운 경계 사례). 요구-테스트 추적표와 변이 시험은 수행하지 않아 C5 점수는 보조 관찰 기반이며 확신도가 낮다. 클린룸 검증기는 작성하지 않았다.
