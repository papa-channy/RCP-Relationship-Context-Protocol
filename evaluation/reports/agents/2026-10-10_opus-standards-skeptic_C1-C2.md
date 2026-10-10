# 평가 보고서: 표준 회의론자 / C1-C2

| 항목 | 값 |
|---|---|
| 평가자 | Opus 5.5, 표준 회의론자 |
| 유형 | agent |
| 대상 커밋 | `68026af` |
| 기준 버전 | CRITERIA v1.1 |
| 작성일 | 2026-10-10 |
| 교차 검증 | Sonnet 5.5가 높음 이상 발견을 재현·반박 시도 |
| 독립성 | `evaluation/`이 없는 커밋에서 작업, 자체 평가와 다른 보고서 미열람 |
| 생성 | 워크플로 `wf_b25ca37f-bb5`의 구조화 출력을 변환. 원본은 `raw/run2-result.json` |

## 1. 요약

**한 줄 판정.** RCP v0.2가 고유하다고 내세우는 다섯 개념 가운데 기존 표준과 선행연구로 대체할 수 없음이 입증된 것은 하나도 없다. 저장소의 오라클 9건은 PROV, ODRL, AuthZEN 조합과 ATMS 평가 규칙만으로 그대로 재현된다. 비독립 근거, 당사자별 의무, 부분 대체 같은 현실 상황은 현재 모델로 표현할 수 없거나 잘못 검증된다. 따라서 C1은 기대치(2)보다 낮은 1이다. 위임 경계는 대체로 실제 스키마에 반영됐다. 다만 v0.1 정책 어휘가 v0.2 오라클에 남아 있고, 의미가 없는 필드와 fail-closed 빈틈이 있어 C2는 2다.

**강점**

- 위임 경계가 스키마에 실제로 반영됐다. v0.2 스키마(spec/schemas/v0.2-draft/context-assertion.schema.json)에는 인가 요청·결정, 서명·암호, 전송 프레이밍, 신호 전달 필드가 없다. 최상위 confidence와 채널별 evidence_type도 실제로 제거됐다(스키마 7행 additionalProperties:false, 100-113행. wire 케이스 legacy-top-level-confidence-rejected와 unscoped-channel-name-rejected가 통과한다).
- standards-reconciliation-v0.2.md 112-154행은 필드마다 KEEP/MAP/BINDING/REMOVE 판정을 내리고 'RCP 고유 잔여 의미'를 적었다. 기존 표준과 겹치는 지점을 스스로 드러낸 정직한 작업이며, MCP·OAuth·JOSE를 Core에서 빼는 판단은 옳다.
- assertion_type과 epistemic_class를 직교 축으로 분리했다(wire-v0.2-draft.md 60-94행). 그래서 어휘가 서로 중복되지 않는다.
- required_extensions의 fail-closed 규칙이 실제로 실행된다(run_wire.py 145-150행. probe P13에서 미지원 필수 확장이 거부됨을 확인했다).
- README 22행과 core 438-446행의 '기존 표준이 소유하면 Core에 넣지 않는다'는 게이트 규칙이 명시돼 있어, 평가자가 이 문장을 그대로 시험할 수 있다.

**시급한 문제**

- [SS-01] 반대 가설을 반박한 증거가 없다. 기존 표준 조합이 실패하는 구체 시나리오가 실행 가능한 형태로든 문서로든 하나도 없다. 평가자가 만든 PROV+ODRL+AuthZEN 프로파일과 ATMS 평가 규칙이 저장소 오라클 9건을 9/9 재현했다. 결정적 선행연구인 ATMS(de Kleer 1986), why-provenance·provenance semiring, sticky policy·IFC, ODRL derive+nextPolicy는 저장소 어디에도 인용되지 않았다.
- [SS-02] 같은 출처에서 온 근거(메일과, 그 메일을 동기화한 CRM 레코드)를 독립 support_sets로 선언해도 검증을 통과한다. 원본 메일을 삭제한 뒤에도 오라클은 'recompute'로 단언을 살려 둔다. support_sets가 정당성을 주장하는 바로 그 지점에서 PROV hadPrimarySource보다 표현력이 낮다.
- [SS-03] mode=derived에서는 dependency의 source_participants를 선언하지 않아도 된다. 그래서 {A,B,C} 그룹 근거로 {A,B} 양자 단언을 basis 없이 만들어도 수락된다(probe P1 ACCEPTED). 핵심 불변식 '참여자 범위를 조용히 좁히지 않는다'를 wire 수준에서 우회할 수 있다.
- [SS-04] evidence에 붙은 policy_refs가 단언으로 전파되지 않아도 검증을 통과한다(P3, P3b ACCEPTED). README 92행의 'Transformation MUST NOT silently erase inherited restrictions'는 wire 적합성에서 강제되지 않는다.
- [SS-06] statement가 자유 텍스트이고 ActorReference에 역할 필드가 없다. 당사자별 의무, 부분 대체, 여러 관계에 걸친 단언, 시간에 따른 참여자 변화는 모두 스키마에서 거부된다(P5-P8). '약속(commitment)'의 핵심 구조를 LLM 없이 결정적으로 해석할 수 없다.

## 2. 기준별 점수

| ID | 점수 | 확신도 | 근거 |
|---|---|---|---|
| C1 | 1 | 중 | 개념별 결론은 다음과 같다. (1) support_sets: 개념은 선행연구가 완전히 다룬다. ATMS label의 environment 집합, why-provenance의 witness basis(PosBool DNF)와 같다. 표현은 PROV의 specializationOf 경로 패턴으로 부분 대체된다. 새로운 것은 관계 맥락 wire에 실었다는 점뿐이다. (2) 제한 상속: 완전히 기존 영역이다. sticky policy, IFC 레이블 join, ODRL derive+nextPolicy+conflict prohibit로 표현되고, 오라클 3건이 ODRL 접기로 재현됐다. (3) 하류 무효화와 lifecycle: 대부분 기존 영역이다(JTMS/ATMS 철회 전파, PROV wasInvalidatedBy, CAEP·SSF, VC 상태 목록, nanopub retract/supersede). RCP에 남는 것은 상태 열거값뿐이다. (4) epistemic class: 부분 대체된다. ECO/GO 증거 코드(TAS/IEA/IC 등)와 PROV wasQuotedFrom이 매우 가깝고, '승격 금지'는 검증 규칙 하나다. (5) 참여자 범위 투영: 부분 대체된다. AS2 audience, PROV qualified derivation의 hadPlan, SHACL 제약 하나로 표현할 수 있다. 고르는 규칙 자체는 RCP의 선택이다. 진정으로 새로운 개념은 없고, 남는 것은 도메인 프로파일로서 개념을 묶었다는 가치다. 저장소는 평평한 PROV에 대한 산문 논증(README 98-114, provenance-and-derivation-model.md 117-135)만 제시한다. qualified PROV나 TMS 같은 대안의 실패는 보이지 않는다. 표현 적합성은 7개 상황 중 1개가 거칠게나마 표현 가능하고, 3개는 확장이 필요하며, 3개는 불가능하거나 잘못 검증된다. 시나리오 근거가 일부 있어 1과 2 사이의 경계지만, 표현 적합성 결함 때문에 1로 둔다. |
| C2 | 2 | 중 | 위임 표의 인가·전송·암호·신호 책임은 스키마에서 실제로 빠졌다. 그러나 다음 잔여 문제가 남았다. v0.2 의미론 오라클에 v0.1 정책 어휘가 하드코딩돼 있다(allowed_purposes, external_processing, training, retention_max_seconds; run.py 69-101). PROV와 겹치면서 구별 의미가 없는 어휘가 있다(role derived_from, supports와 corroborates의 구분, AssertionRelation의 supports/refines). KEEP 근거로 든 trust_domain은 실행 의미가 0이다. mode와 visibility는 겹치고, 모순되는 조합도 수락된다. 네임스페이스 scope_type은 fail-closed가 적용되지 않는다. 표면이 최소라고 보기 어렵고, reconciliation 문서의 위임 주장 일부(정책 어휘 비소유, trust_domain 근거, projection_basis_ref '일반 대응 없음')가 코드나 표준 원문과 어긋난다. |
| C3 | N/A | N/A | 주 평가 범위가 아니다. |
| C4 | 2 | 하 | 부수적으로 수집한 증거만으로 매긴 점수다. 주요 경로는 결정적이다. 그러나 derived 모드에서 투영 검사를 우회할 수 있고(P1), evidence 수준 제한이 전파되지 않으며(P3), 같은 대상에 supersedes, conflicts_with, supports를 동시에 선언해도 수락되고(P16), wire 검증기와 추상 오라클의 투영 판정이 갈린다(P11). 엣지 의미론이 정의되지 않았다. 독립 근거 유지와 출처 비독립의 충돌(P4)은 불변식 사이의 실제 충돌 사례다. |
| C5 | N/A | N/A | 주 평가 범위가 아니다. 다만 SS-09에 오라클과 wire 사이의 불일치 증거를 남겼다. |
| C6 | N/A | N/A | v0.2 두 러너가 통과하는 것만 확인했다(31건, 20+1건). CI 전 단계는 재현하지 않았다. |
| C7 | N/A | N/A | 주 평가 범위가 아니다. |
| C8 | N/A | N/A | P1(참여자 범위 우회)과 P3(제한 세탁)는 C8과 관련된다. 위협 모델 전반은 평가하지 않았다. |
| C9 | N/A | N/A | 주 평가 범위가 아니다. |
| C10 | N/A | N/A | README 92행의 MUST NOT 문장과 wire 동작이 어긋나는 점(SS-04)은 기록했다. 전체 점검은 하지 않았다. |

## 3. 발견 사항

### SS-01: 기존 표준 프로파일이 실패한다는 반례가 없다. PROV+ODRL+AuthZEN+ATMS 프로파일이 오라클 9/9를 재현한다

- 기준: C1
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: 평가자 스크립트 eval/standards-skeptic/counter_profile.py를 실행한 출력은 'matched 9 of 9'였다. dependency_invalidation 3건은 support_sets를 PROV specializationOf와 used 패턴으로 옮기고 ATMS label로 평가해 RCP 출력과 같았다. policy_projection 3건은 ODRL derive+nextPolicy와 conflict prohibit 접기로 같았다. source_access 3건은 AuthZEN의 원본 자원 독립 평가로 같았다. 선행연구 인용 여부는 `git grep -il -e ATMS -e JTMS -e semiring -e why-prov -e nanopub -e 'verifiable cred' -e hadPrimarySource -e wasInvalidatedBy -e sticky` 결과 0건이었고, truth-maintenance는 spec/core-v0.2-draft.md:436의 '만들지 않겠다'는 문장 하나뿐이다. 대안 실패 논증은 README.md:98-114와 standards-reconciliation-v0.2.md:54,143('PROV does not ... define which alternative subsets ...')의 산문뿐이다. docs/semantic-scenarios-v0.2.md:351은 '기존 표준과 대조해야 한다'는 미완 과제로 남아 있다. ODRL 원문은 WebFetch https://www.w3.org/TR/odrl-vocab/ 로 확인했다: nextPolicy는 'To grant the specified Policy to a third party for their use of the Asset', derive는 'To create a new derivative Asset'이다.
- 내용: 개념별 판정은 다음과 같다. support_sets는 ATMS environment(de Kleer 1986)와 why-provenance witness basis(Buneman 2001, Green 2007 PosBool)를 관계 맥락에 옮긴 것이어서 개념상 새롭지 않다. 제한 상속은 sticky policy, IFC 레이블 join, ODRL derive+nextPolicy가 이미 다룬다. 하류 무효화는 TMS 철회 전파, DRed 뷰 유지보수, PROV wasInvalidatedBy, CAEP, VC 상태 목록, nanopub retract/supersede가 다룬다. epistemic class는 ECO/GO 증거 코드와 매우 가깝다. 참여자 투영은 AS2 audience, PROV hadPlan, SHACL 제약으로 구성할 수 있다. 정리하면 RCP의 고유 가치는 '이 조합을 관계 맥락 도메인 프로파일로 고정한 것'이고, 새로운 의미론은 아니다. 저장소 오라클에는 이 대안 프로파일과 RCP를 구별하는 케이스가 하나도 없다. 단, 평가자 프로파일은 rdflib·SHACL 없이 Python으로 흉내 낸 것이다.
- 권고: 개념마다 '기존 표준 프로파일로 인코딩한 픽스처 + RCP가 다른 결과를 내는 케이스'를 conformance에 추가해야 한다. 그런 케이스를 만들 수 없는 개념은 Core에서 빼고 PROV/ODRL 프로파일로 내려야 한다. standards-reconciliation에 ATMS/JTMS, provenance semiring, sticky policy/IFC, nanopublication, VC 상태 목록, ECO 비교 절을 추가해야 한다.
- 검증 의견: 사실 부분은 재현됐다. 직접 짠 대안 프로파일로 dependency_invalidation 3건, policy_projection 3건, source_access 3건이 모두 일치했다(9/9). 저장소 전체에서 ATMS, JTMS, semiring, why-prov, nanopub, hadPrimarySource, wasInvalidatedBy, sticky를 git grep 한 결과는 0건이었다. truth-maintenance는 core-v0.2-draft.md:436에 '만들지 않고 시간/분쟁을 표현할 수 있는가'라는 열린 질문으로 한 번 나올 뿐이다. 선행연구 비교 누락은 실제 결함이다. 다만 심각도는 과하다. (1) 9/9 재현은 오라클 함수를 다른 어휘로 옮겨 적은 것이라 순환적이다. 특히 ODRL 쪽은 목적 교집합, 금지 누적, 보존기간 최솟값이라는 접기 규칙을 내가 직접 짜 넣어야 했고, 그 합성 규칙이 바로 저장소가 RCP 고유 영역이라고 밝힌 부분이다(standards-reconciliation:286). ODRL 자체가 그 결과를 내는 것은 아니다. (2) 저장소는 새 의미론을 주장하지 않는다. reconciliation 표 대부분이 PROFILE/MAP이고, 주장 범위는 'PROV는 대안 충분 집합을 정의하지 않는다'(54행, 143행)로 좁다. 이 문장은 PROV에 대해서는 맞고 ATMS에 대해서는 침묵이다. (3) 핵심 불변식을 직접 깨는 것이 아니라 포지셔닝과 문서의 공백이다. 결론은 ATMS 환경, PosBool why-provenance와의 개념적 동일성이 문서화되지 않았고, 대안 프로파일과 구별하는 케이스가 없다는 지적은 타당하지만 '높음'까지는 아니라는 것이다.
- 검증 근거: v_ss01.py 출력 'matched 9 of 9'. git grep 선행연구 용어 rc=1(0건). core-v0.2-draft.md:436, README.md:98-114, standards-reconciliation-v0.2.md:54,62,143,286, semantic-scenarios-v0.2.md:351 확인. 스크래치: eval/verify/standards-skeptic/v_ss01.py

### SS-02: 비독립 근거(같은 출처 중복)를 독립 지원 경로로 선언할 수 있고, 원본을 삭제해도 단언이 유지된다

- 기준: C1, C4
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: eval/standards-skeptic/probe.out의 '[P4 same-origin evidence as independent support] ACCEPTED'와 'oracle after user deletes mail:msg-1 -> {... action: recompute}'. counter_profile.out에서 같은 상황을 비교하면 'RCP oracle -> recompute | PROV hadPrimarySource-aware -> invalidate'이다. 스키마 Dependency(context-assertion.schema.json:181-195)와 EvidenceReference(155-180)에는 공통 출처, 파생 원본, 독립성을 나타내는 필드가 없다. PROV-DM은 Primary Source와 Quotation을 정의한다(WebFetch https://www.w3.org/TR/prov-dm/).
- 내용: Gmail 메시지를 CRM이 동기화한 레코드를 두 Provider가 각각 보고하면, support_sets는 [[mail],[crm]] 독립 경로가 된다. 사용자가 원본 메일을 삭제하거나 철회해도 사본 경로가 남아 단언이 'recompute'로 유지된다. 이는 철회 후 잔존과 증거 세탁의 통로이고, support_sets 존재 이유('원본이 사라지면 무엇이 살아남는가')를 RCP 스스로 틀리게 답하는 사례다. 표현 적합성 판정은 '불가능(잘못 검증됨)'이다.
- 권고: evidence나 dependency에 원본 참조(prov:hadPrimarySource에 대응)를 두거나, support_sets 원소 간 독립성 선언을 요구해야 한다. 또 무효화 계산 시 원본 폐쇄(closure)로 전파하는 규칙과 음성 케이스를 추가해야 한다.
- 검증 의견: 오라클로 재현했다. support_sets [[mail],[crm]]에서 mail을 제거하면 action=recompute, current_support_exists=true가 나온다. Dependency 스키마(181-195)와 EvidenceReference(155-180)에는 공통 출처나 독립성 필드가 없다. had_primary_source를 넣으면 스키마가 거부한다. 저장소 문서에도 same origin, 증거 세탁, 전이 닫힘(closure)에 대한 규칙이 없다. provenance-and-derivation-model.md에는 independent_of가 후보 관계로 있었지만 v0.2 wire에서는 빠졌다. 다만 '불가능(잘못 검증됨)'은 과장이다. support_sets의 독립성은 Provider가 선언하는 값이다. 사본임을 아는 Provider는 {mail,crm}을 joint로 선언하면 되고(실행해 보니 invalidate가 나온다), crm 사본을 assertion 타입 의존으로 모델링하면 상위 무효화가 전파되는 우회가 열려 있다. 출처를 모르는 Provider의 선언은 PROV hadPrimarySource로도 막지 못한다. 결함은 독립성 선언 수단과 닫힘 규칙, 음성 케이스의 부재이고, 불변식을 깨뜨리는 수준은 아니다.
- 검증 근거: run.dependency_invalidation_result 출력 recompute(독립 선언)와 invalidate(joint 선언). v_probe.py P5 'had_primary_source' SCHEMA-REJECT. docs/provenance-and-derivation-model.md의 independent_of 후보. 스키마 필드 목록(Dependency: dependency_ref, dependency_type, material, role).

### SS-03: derived 모드에서 참여자 범위 투영 검사를 우회할 수 있다

- 기준: C1, C4, C8
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 높음)
- 근거: probe.out의 '[P1 derived-mode, group evidence not declared, bilateral target] ACCEPTED'. 같은 근거를 provenance.evidence에 {A,B,C}로 선언하면 '[P1b ...] REJECTED'가 된다. run_wire.py:62-67의 투영 검사는 provenance.evidence만 순회한다. 스키마 Provenance(236-245)는 mode=derived일 때 evidence를 요구하지 않는다. run_wire.py:100-111도 support_set 참조가 evidence 목록으로 해석되는지 검사하지 않는다.
- 내용: README.md:88의 'Multi-party evidence MUST NOT silently collapse into a narrower target relationship scope'는 Core가 가장 강하다고 내세우는 불변식이다. 그러나 근거를 derived dependency 문자열로만 참조하면 원본 참여자 집합 자체가 선언되지 않아 검사가 작동하지 않는다. 즉 RCP 고유 개념 1번이 wire 수준에서 선택적으로만 적용된다. 이는 해당 개념이 실제로 '공유 계약'으로 기능하는지에 대한 C1 반증이기도 하다.
- 권고: derived 단언의 material evidence dependency는 같은 단언의 provenance.evidence(또는 해석 가능한 외부 참조)로 풀려야 하고 source_participants를 지니도록 강제해야 한다. 그렇지 않으면 opaque나 unavailable 모드로 명시 선언하게 하고, 해당 음성 케이스를 wire-cases에 추가해야 한다.
- 검증 의견: 재현됐다. derived-independent-support 케이스를 그대로 쓰면 provenance.evidence가 없어서 source_participants가 어디에도 선언되지 않았는데도 bilateral {A,B} 단언이 ACCEPTED다. 이 케이스는 이미 공식 conformance 케이스다. 같은 근거를 mode=derived 상태로 provenance.evidence에 {A,B,C}로 선언하면(P1b) projection_basis_ref가 없다는 이유로 거부되고, basis를 붙이면(P1c) 통과한다. derived 모드는 evidence를 요구하지 않고(스키마 241-244), run_wire.py의 투영 검사는 provenance.evidence만 순회하며, support_set이 가리키는 dependency_ref가 evidence 항목으로 해석되는지도 검사하지 않는다(P1d: 무관한 evidence 목록도 ACCEPTED). 그래서 README.md:88이 '가장 강한 Core 불변식'으로 내세우는 참여자 범위 비축소가 derived 경로에서는 기계적으로 검증되지 않는다. 완화 요소는 두 가지다. 선언을 검사하는 구조여서 evidence 모드에서도 Provider가 거짓 선언을 하면 못 잡고, 이 단계는 비규범 draft이며 'evidence를 독립 해석할 수 있게 할지'가 열린 질문 1번에 있다. 그래도 불변식이 선택 적용되는 구멍은 실제다.
- 검증 근거: v_probe.py: P1 ACCEPTED, P1b SEM-REJECTED('evidence:a changes participant scope without projection_basis_ref'), P1c ACCEPTED, P1d ACCEPTED. run_wire.py 62-67, 100-111. 스키마 241-244. README.md:88.

### SS-04: 제한 상속이 wire에서 '정책 의존 참조 복사'로 축소됐고, evidence 수준 제한은 전파되지 않는다

- 기준: C1, C2, C10
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: probe.out의 '[P3 evidence policy_refs dropped at assertion level] ACCEPTED'와 '[P3b derived: evidence policy_ref not carried to policy_refs] ACCEPTED'. run_wire.py:122-133은 dependency_type=='policy'이고 material인 참조가 최상위 policy_refs에 포함되는지만 본다. evidence[].policy_refs(스키마 174-178)는 어디서도 검사하지 않는다. 주장 쪽 근거는 README.md:92 'Transformation MUST NOT silently erase inherited restrictions', standards-reconciliation-v0.2.md:138 'restrictions attached to material source evidence', 같은 문서 286행 'RCP still owns the composition rule', wire-v0.2-draft.md:283이다.
- 내용: RCP가 고유 영역이라고 남긴 '제한 상속'은 실제 wire 적합성에서 문자열 집합 포함 검사 하나뿐이다. 그 형태는 ODRL의 sticky policy(derive 권한에 nextPolicy 의무)와 같다. 근거에 직접 붙은 제한은 단언으로 옮겨지지 않아도 통과하므로 제한 세탁이 가능하다. 남은 부분은 새롭지 않고, 새롭다고 주장한 합성 규칙은 wire에 없다.
- 권고: evidence.policy_refs를 단언 policy_refs, 또는 material policy dependency로 전파하도록 강제하는 규칙과 음성 케이스를 추가해야 한다. 합성 규칙 자체는 ODRL/DPV 프로파일로 위임하고, Core에는 '전파 누락 금지'만 남기는 편이 정직하다.
- 검증 의견: 관찰은 재현됐다. evidence[].policy_refs에 policy를 달고 단언 최상위 policy_refs를 비워도 evidence 모드(P3)와 derived 모드(P3b) 모두 ACCEPTED다. run_wire.py의 검사는 dependency_type=='policy'이고 material인 의존이 최상위 policy_refs에 포함되는지만 본다. 대조군 P3c에서는 거부된다. 다만 심각도는 낮춘다. (1) wire-v0.2-draft.md:283이 적합성 요건을 'material policy dependency가 유지될 것'으로 명시해 이 범위는 문서화된 의도다. (2) 정책 관련 '정책 언어를 만들지 않고 참조만 운반한다'는 결정이 §10에 명시돼 있다. (3) '제한 세탁'은 과장이다. evidence[].policy_refs는 같은 객체 안에 그대로 남아 있어 소비자가 볼 수 있고, 지워지려면 Provider가 의존 선언 자체를 생략해야 하는데 이는 모든 자기 선언형 검사의 한계다(P3d: policy 의존을 아예 생략하면 ACCEPTED). 합성 규칙(교집합, 금지 누적, 최솟값)은 abstract 오라클(run.py)에만 있고 wire에는 없다는 평가는 맞다. 실제 공백은 'evidence.policy_refs를 단언 수준 제한과 어떻게 연결할지' 규칙과 음성 케이스가 없다는 것이다.
- 검증 근거: v_probe.py: P3 ACCEPTED, P3b ACCEPTED, P3c SEM-REJECTED(대조군), P3d ACCEPTED. run_wire.py:122-133. wire-v0.2-draft.md §10와 283행. README.md:92.

### SS-05: v0.2 의미론 오라클에 v0.1 정책 어휘와 합성 의미론이 하드코딩돼 있다

- 기준: C2, C5
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: conformance/v0_2/run.py:69-101의 effective_parent_policy와 policy_projection_valid는 allowed_purposes 교집합, external_processing과 training의 deny 우선, retention_max_seconds 최소값을 쓴다. `grep -c allowed_purposes conformance/v0_2/semantic-cases.json`은 7이다. 같은 어휘의 출처는 v0.1(spec/profiles/context-selection-boundaries-v0.1.md:16, spec/registries/capabilities.md:23)이다. v0.2 스키마에는 이 필드가 없다(policy_refs는 문자열 배열뿐, 51-55행). 위임 주장은 core-v0.2-draft.md:239-249 'RCP does not define a universal policy language'와 standards-reconciliation-v0.2.md:66-70이다.
- 내용: Core 적합성 오라클이 특정 정책 어휘(목적, 외부 처리, 학습, 보존 기간)와 그 결합 연산(교집합, deny-wins, min)을 사실상 정의한다. 이는 ODRL/DPV에 위임한다는 경계 선언과 모순된다. 동시에 v0.2 wire가 담을 수 없는 의미론을 시험하므로, 클린룸 구현자는 이 규칙을 어디에서 구현해야 하는지 알 수 없다. 이런 어휘 특화 의미론은 C2가 찾으라고 한 잔존 항목의 전형이다.
- 권고: policy_projection 케이스를 'ODRL/DPV 프로파일 예시'로 옮기거나, 오라클 입력을 policy_refs 집합과 외부 PDP 결과로 추상화해야 한다. Core 오라클에는 '파생 단언이 부모의 material 정책 참조를 잃지 않는다'만 남기는 것이 좋다.

### SS-06: 표현 적합성 결함: 당사자별 의무, 부분 대체, 다중 관계, 시간에 따른 참여자 변화를 표현할 수 없다

- 기준: C1
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: probe.out 결과는 다음과 같다. P5 participant role은 "Additional properties are not allowed ('role' was unexpected)"로 거부된다. P6 participant valid_from도 같은 이유로 거부된다. P7 relationship_scope 배열은 schema-invalid다. P8 supersedes의 fields는 'fields' was unexpected로 거부된다. P14 2인 group은 'group scope must contain at least three distinct participants'로 거부된다(run_wire.py:47-48). P15 조직 단위 근거와 개인 대상의 조합은 projection_basis_ref 없이는 거부되고, 소속이나 멤버십 의미는 없다. statement는 {type:string}뿐이다(스키마 38행). ActorReference는 actor_id, scope, actor_type만 갖는다(114-128). 가이드레일 standards-boundary.md:299는 'Two Providers need deterministic agreement on it without an LLM guessing the semantics'다.
- 내용: 상황별 판정은 다음과 같다. (1) 여러 관계에 걸친 단언: 확장이 필요하다. 단언을 복제해야 하고, 복제본을 잇는 관계 타입도 없다. (2) 시간에 따라 바뀌는 참여자: 확장이 필요하다. 참여자 단위 유효기간이 없어 단언 전체를 supersede해야 한다. (3) Provider마다 다른 범위 단위: 확장이 필요하다. 불투명한 basis 참조만 있고 소속 의미가 없다. (4) 충돌하지 않지만 불확실한 근거: 거칠게만 표현된다(SS-11 참조). (5) 부분 대체: 불가능하다. statement가 자유 텍스트이고 supersedes가 단언 전체 단위다. (6) 당사자별 의무가 다른 약속: Core로는 불가능하다. 누가 누구에게 무엇을 언제 해야 하는지가 statement 산문 안에만 있다. (7) 비독립 근거: 불가능하며 잘못 검증된다(SS-02). commitment가 기본 assertion_type인데도 그 구조를 결정적으로 비교할 수 없다는 점이 RCP 자신의 가이드레일과 정면으로 충돌한다.
- 권고: 최소 구조로 participant role(최소한 obligor와 obligee), 참여자별 유효 구간, 부분 대체 대상을 지정할 수단, 다중 범위 단언 또는 분할 관계를 검토해야 한다. 다른 대안은 commitment류의 구조 표현을 외부 어휘(예: schema.org, AS2 확장)에 위임하고, Core는 그 참조만 지니도록 경계를 다시 긋는 것이다.
- 검증 의견: 스키마 거부 결과는 모두 재현됐다. participant의 role과 valid_from은 additionalProperties 위반이고, relationship_scope 배열과 supersedes의 fields도 거부되며, 2인 group은 의미 검사에서 거부되고, statement는 문자열뿐이다(객체는 거부). Core에 obligor/obligee, 참여자별 유효 구간, 부분 대체 수단이 없는 것은 사실이고 commitment가 기본 assertion_type 중 하나인 점과 긴장이 있다. 그러나 '표현할 수 없다/불가능'은 과장이다. (1) extensions와 required_extensions가 있어 x-acme:obligations 같은 구조 페이로드를 실을 수 있고, 지원하지 않는 소비자는 fail-closed로 거부한다(직접 실행해 확인). 상호운용 의미는 프로파일에 맡겨지는 것이다. (2) 부분 대체는 refines 관계나 새 단언 + 전체 supersede로 우회 가능하다. (3) '보편 관계 분류를 만들지 않는다'와 '새 Core 필드는 가드레일 5개를 모두 통과해야 한다'는 설계 결정이 문서화돼 있고(standards-boundary §14, wire §17), 어떤 base assertion_type이 살아남는지는 열린 질문이다. 인용한 standards-boundary:299는 Core 추가 가드레일의 조건이지 commitment 구조 요건이 아니다. (7)번은 SS-02와 중복이다. 따라서 결함은 '핵심 타입 commitment의 당사자별 구조가 확장에만 의존한다'는 설계 공백이며 불변식 위반은 아니다.
- 검증 근거: v_probe.py: P5 role / P6 valid_from / P7 scope array / P8 fields SCHEMA-REJECT, 2인 group SEM-REJECTED, statement object SCHEMA-REJECT. 확장 경로: schema errs [], supported [], unsupported ['required extension is unsupported: x-acme:obligations']. refines 관계 ACCEPTED. standards-boundary.md §14, wire-v0.2-draft.md §17,§19.

### SS-07: 의미 없는 KEEP 필드와 fail-closed 빈틈: trust_domain, 네임스페이스 scope_type, mode/visibility 모순

- 기준: C2, C4
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: probe.out 결과는 다음과 같다. '[P9 unknown namespaced scope_type without required_extensions] ACCEPTED', '[P9b provider_defined scope_type] ACCEPTED', '[P10 trust_domain mismatches every participant scope] ACCEPTED', '[P12 mode=evidence + visibility=hidden while evidence fully listed] ACCEPTED', '[P12b mode=opaque + visibility=full + full derivation] ACCEPTED'. `grep -n trust_domain conformance/v0_2/*.py conformance/external/v0_2/*.py`는 run_wire.py:169(정규화) 한 곳뿐이다. 주장 쪽 근거는 standards-reconciliation-v0.2.md:122 'trust_domain ... KEEP ... prevents accidental cross-tenant/cross-domain identity/context collapse'와 core-v0.2-draft.md:295-297 'Unknown relationship scope, required semantic extensions, or other material semantics are not interpreted as a more permissive known value'다.
- 내용: trust_domain은 KEEP 근거로 테넌트 붕괴 방지를 들지만 실행 의미가 전혀 없다. ActorReference.scope와 역할이 겹치는 이중 필드이기도 하다. scope_type은 unknown만 fail-closed로 처리하고, 미지의 네임스페이스 값과 provider_defined는 카디널리티 검사도 없이 통과한다. 이는 '미지의 material 의미론은 fail-closed' 규칙의 예외다. provenance.mode와 visibility는 노출 수준을 이중으로 표현하며, 서로 모순되는 조합도 수락된다.
- 권고: trust_domain은 participant.scope와의 정합성 규칙을 정의하거나 제거해야 한다. 네임스페이스 scope_type은 required_extensions에 선언되지 않으면 거부해야 한다. mode와 visibility는 하나로 합치거나 허용 조합 표를 정의해야 한다.

### SS-08: Core 관계·역할 어휘가 PROV와 중복되고 서로 구별되는 의미가 없다. projection_basis_ref의 '일반 대응 없음' 주장도 부정확하다

- 기준: C2
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: 스키마 190-192행의 role enum은 supports, corroborates, derived_from, refines다. run_wire.py:26은 SUPPORT_ROLES = {supports, corroborates, derived_from}로 셋을 동일하게 취급한다. AssertionRelation(247-256)의 supports, corroborates, refines는 run_wire.py:140-143의 자기참조 검사 말고는 실행 의미가 없다. probe.out의 '[P16 supersedes+conflicts_with+supports same target] ACCEPTED'. standards-reconciliation-v0.2.md:136은 projection_basis_ref에 'no direct generic equivalent'라고 적었다. 그러나 PROV-DM의 Plan은 'a set of actions or steps intended by one or more agents to achieve some goals'로 정의되고 qualified association의 hadPlan으로 연결된다(WebFetch https://www.w3.org/TR/prov-dm/).
- 내용: derived_from은 prov:wasDerivedFrom을 그대로 복제한 것이다. supports와 corroborates의 차이, 관계 수준의 refines는 아무 결정적 결과도 만들지 않는다. 결국 Core 표면에 '위임하겠다'던 일반 lineage 어휘가 남아 있다. 같은 대상에 대체, 충돌, 지원을 동시에 선언해도 거부되지 않아 관계 어휘의 결정성 주장(wire-v0.2-draft.md:295)도 뒷받침되지 않는다. projection basis는 PROV의 계획(hadPlan)이나 qualified derivation 속성으로 매핑할 수 있으므로, 고유하다는 주장은 '참여자 집합이 다르면 basis가 필수'라는 규칙 하나로 줄어든다.
- 권고: 구별 의미가 없는 role과 relation 값은 제거하거나 PROV 매핑으로 내리고, 서로 모순되는 관계 조합의 거부 규칙을 추가해야 한다. reconciliation 표의 projection_basis_ref 행은 'prov:hadPlan으로 매핑할 수 있고, RCP는 필수 조건만 소유한다'로 고쳐야 한다.

### SS-09: wire 검증기와 추상 오라클의 참여자 투영 판정이 다르다(대상이 근거 집합의 부분집합이 아닌 경우)

- 기준: C5, C4
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: probe.out의 '[P11 wire: target {A,D} from source {A,B,C} with basis] ACCEPTED'와 'abstract oracle same situation -> False'. run.py:29는 'if not target or not target.issubset(source): return False'다. run_wire.py:64는 집합이 서로 다르고 basis가 없을 때만 오류를 낸다.
- 내용: 근거에 없는 참여자 D를 basis 문자열 하나로 대상 관계에 넣을 수 있다. 추상 의미론(semantic-cases의 projection-target-not-in-source)은 이를 금지하지만 wire 수준에서는 허용된다. 같은 개념에 두 개의 정답 오라클이 있는 셈이어서, 클린룸 구현자는 어느 쪽을 따라야 하는지 판단할 수 없다.
- 권고: wire semantic_errors에 부분집합 조건을 추가하거나, basis가 참여자 추가를 허용하는지를 명세에서 확정해야 한다. 그 결정을 담은 wire 음성 케이스도 필요하다.

### SS-10: 직접 근거(evidence 모드) 단언에서는 지원 충분성을 표현할 수 없다

- 기준: C1, C4
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: probe.out의 '[P2 evidence-mode two items, no support_sets possible] ACCEPTED'와 '[P2b evidence-mode + derivation/support_sets] REJECTED ['evidence provenance mode must not carry derivation semantics']'. 근거 위치는 run_wire.py:73-74와 README.md:100 'A flat provenance edge does not say whether evidence is jointly required or independently sufficient'다.
- 내용: 근거 두 개를 직접 나열한 evidence 모드 단언에서는 두 근거가 함께 필요한지(AND) 각각 충분한지(OR)를 선언할 수 없다. support_sets 도입 이유로 든 '평평한 lineage 문제'가 가장 흔한 단언 형태에 그대로 남아 있고, 그런 단언은 근거 하나가 철회됐을 때의 결과가 정의되지 않는다.
- 권고: evidence 모드에서도 support_sets(또는 기본값 규칙, 예: 단일 공동 집합)를 명시하고, 그에 대응하는 무효화 케이스를 추가해야 한다.

### SS-11: 불확실하지만 충돌하지 않는 근거를 거칠게만 표현할 수 있고, 등급형 불확실성은 버려지거나 단언 전체를 거부하게 만든다

- 기준: C1
- 심각도: 낮음
- 구분: 판단
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: probe.out의 '[P13 uncertainty as required extension, consumer unaware] REJECTED ['required extension is unsupported: x-example:confidence-model']'. wire-v0.2-draft.md:110-122는 confidence를 required_extensions에 넣는 예시를 직접 제시한다. Core에서 쓸 수 있는 것은 epistemic_class 열거값(스키마 26-37)과 corroborates 관계뿐이다.
- 내용: confidence를 제거한 판단 자체는 타당하다. 그러나 대체 경로가 '선택 확장(모르는 소비자는 무시해 정보 손실)' 아니면 '필수 확장(모르는 소비자는 단언 전체 거부)'뿐이다. '약하게 지지함'이나 '판단 보류' 같은 순서형 불확실성을 표현할 Core 수단이 없다. 표현 적합성 판정은 '부분 표현 가능(거칠게)'이다.
- 권고: 보정이 필요 없는 순서형 지지 강도(예: weak, strong)나 불확실 표식을 Core 후보로 검토하거나, 공용 confidence 프로파일 하나를 정의해 확장 인식률을 높여야 한다.

## 4. 실행한 검증

```text
모든 명령은 /private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/wt (68026af)에서 실행했다.
(1) `.venv/bin/python conformance/v0_2/run.py` 결과는 'PASS (31 cases)'이고, `run_wire.py` 결과는 'PASS (20 schema/semantic cases, 1 binding-equivalence case)'다.
(2) 평가자 스크립트 eval/standards-skeptic/probe.py는 저장소의 semantic_errors와 jsonschema Draft2020-12 검증기를 그대로 써서 변형 인스턴스 21개를 검사했다(출력은 probe.out). P1, P2, P3, P3b, P4, P9, P9b, P10, P11, P12, P12b, P16은 ACCEPTED, P5-P8은 SCHEMA-INVALID, P13, P14, P15는 REJECTED다.
(3) eval/standards-skeptic/counter_profile.py는 PROV(specializationOf, used) 인코딩에 ATMS label 평가를 더한 프로파일, ODRL derive+nextPolicy와 conflict prohibit 접기, AuthZEN 원본 평가를 저장소 semantic-cases의 dependency_invalidation 3건, policy_projection 3건, source_access 3건에 적용했다. 결과는 'matched 9 of 9'였다. 같은 출처 사례에서는 RCP가 recompute, PROV hadPrimarySource를 반영한 평가가 invalidate를 냈다.
(4) `git grep -il` 로 ATMS, JTMS, semiring, why-prov, nanopub, verifiable cred, hadPrimarySource, wasInvalidatedBy, sticky, bundle을 찾았고 모두 0건이었다. truth-maint는 core 436행 1건이었다.
(5) `grep allowed_purposes|external_processing|retention_max_seconds`로 v0.2 오라클 run.py:69-101과 v0.1 출처를 확인했다.
(6) `grep trust_domain conformance/v0_2/*.py conformance/external/v0_2/*.py` 결과는 run_wire.py:169 한 곳뿐이었다.
(7) WebFetch로 W3C PROV-DM(Primary Source, Quotation, Invalidation, Plan, Bundle 정의)과 ODRL Vocabulary(nextPolicy, inheritFrom, conflict perm/prohibit, derive 정의)를 확인했다.
```

## 5. 평가 한계

counter_profile.py는 rdflib이나 SHACL 같은 실제 PROV/ODRL 도구 없이 Python으로 프로파일 의미를 흉내 낸 것이다. 실제 표준 직렬화와 추론기로 검증한 것은 아니며, 저장소 오라클과 같은 계산 구조를 다른 이름으로 다시 쓴 면이 있다. 이 결과는 '오라클이 RCP와 대안 프로파일을 구별하지 못한다'는 증거로만 읽어야 한다. 웹으로 원문을 확인한 표준은 PROV-DM과 ODRL Vocabulary뿐이다. ATMS(de Kleer 1986), provenance semiring(Green 등 2007), why-provenance(Buneman 등 2001), sticky policy, ECO/GO 증거 코드, nanopub의 retract/supersede, VC Bitstring Status List, CAEP는 평가자 지식에 근거했고 원문을 재확인하지 않았다. 따라서 개념 매핑 일부는 '판단'에 가깝다. v0.1, reference-ecosystem, bindings 동등성, 외부 하네스의 held-out 케이스는 평가하지 않았다. C4 점수는 주 범위 밖에서 부수적으로 모은 증거에 근거하므로 확신도가 낮다.
