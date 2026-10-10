# 평가 보고서: 표준 회의론자 / C1-C2 (1차 실행)

| 항목 | 값 |
|---|---|
| 평가자 | Opus 5.5, 표준 회의론자 |
| 유형 | agent |
| 대상 커밋 | `68026af` |
| 기준 버전 | CRITERIA v1.1 |
| 작성일 | 2026-10-10 |
| 교차 검증 | Sonnet 5.5가 높음 이상 발견을 재현·반박 시도 |
| 실행 | 1차 실행. Fable 사용량 소진으로 중단된 실행에서 완료된 보고서. 2차 실행과 독립된 표본 |
| 생성 | `raw/run1-partial.json`의 구조화 출력을 변환 |

## 1. 요약

**한 줄 판정.** RCP v0.2의 고유 개념 다섯 가지는 모두 기존 표준이나 선행 연구로 부분 또는 완전히 표현됩니다. 기존 표준 조합이 실패한다는 것을 보여 주는 실행 가능한 증거는 저장소에 없습니다. 현재 남은 고유 가치는 '관계 맥락용 PROV/ODRL 프로파일 + 안전 기본 규칙 묶음' 수준으로 보입니다. 위임 경계 문서는 정직하지만, Core와 오라클에는 의미가 정의되지 않은 필드와 정책 어휘 잔재가 남아 있습니다.

**강점**

- 표준 위임이 문서에만 있지 않고 실제로 일부 이행되었습니다. v0.2 스키마 디렉터리에는 context-assertion.schema.json 하나만 있습니다. v0.1의 PermissionRequest/PermissionDecision, SecureEnvelope, RevocationEvent에 해당하는 객체는 v0.2 Core에 없습니다(ls spec/schemas/v0.2-draft). 최상위 confidence와 epistemic 중복 assertion_type도 스키마에서 거부됩니다(wire-cases: legacy-top-level-confidence-rejected, epistemic-duplicate-assertion-type-rejected PASS).
- docs/standards-reconciliation-v0.2.md:112-154는 필드 단위 KEEP/PROFILE/BINDING/REMOVE 판정표입니다. 표준 경계 문서로서 보기 드물게 구체적이며, 반증 가능한 형태로 주장을 내놓았습니다.
- required_extensions fail-closed 규칙이 명확하고 실행 검증됩니다(run_wire.py:145-150, wire-case unsupported-required-extension-fails-closed).
- README:249와 standards-boundary.md:290은 고유성 주장을 '가설'로 명시합니다. 외부 검증이 Core를 줄일 수 있다고도 스스로 적어 두었습니다.

**시급한 문제**

- Core 불변식 '참여자 범위의 침묵 축소 금지'를 와이어 검증기에서 우회할 수 있습니다. provenance.mode=derived 또는 opaque이면 source_participants 검사가 아예 실행되지 않습니다(probe P1, P1b ACCEPTED). 범위 확장 {A,B}→{A,B,D}도 아무 basis 문자열('x')만 있으면 통과합니다. 같은 경우를 추상 오라클 projection_allowed는 False로 판정하므로, 두 오라클이 서로 어긋납니다(P2).
- 제한 상속 불변식(5.6)도 와이어에서 깨집니다. 증거 수준의 policy_refs는 단언 policy_refs로 옮겨지지 않아도 통과합니다(P3 ACCEPTED). 추상 오라클의 제한 상속 시험은 와이어 모델에 존재하지 않는 4개 정책 차원(목적, 외부 처리, 학습, 보존 기간)에 묶여 있어 와이어와 분리되어 있습니다.
- 출처가 같은 비독립 증거를 표현할 방법이 없습니다. 그래서 원본이 삭제되어도 복사본 하나로 단언이 'recompute'로 살아남습니다(P5). 이 표현력은 PROV(hadPrimarySource)가 RCP보다 더 높습니다.

## 2. 기준별 점수

| ID | 점수 | 확신도 | 근거 |
|---|---|---|---|
| C1 | 1 | 중 | 시나리오 A~J는 '안전하지 않은 Consumer 행동'을 보여 줍니다. 하지만 'PROV+ODRL+AuthZEN+SSF 조합이 깨지는' 반례는 하나도 실행 가능하게 제시되지 않았습니다. 저장소에 PROV/ODRL/AuthZEN/SSF 매핑 산출물이 없고(grep 결과 문서 4개뿐, ROADMAP:215-218 미체크), 위임 판단은 한 문장짜리 서술입니다. 가장 강한 근거인 support_sets 논증은 '평평한 PROV 간선'만 반박하고, 한정 파생(qualified derivation)+프로파일 규칙은 다루지 않습니다. 이 의미론은 why-provenance, provenance semiring, ATMS 레이블과 48000/48000 일치했습니다(SS-01). 표현 적합성 7개 상황 중 2개는 Core에서 불가능하고 5개는 확장이 필요합니다(SS-10, SS-02). 1~2점 경계이며, 반대 가설을 시도하지 않았고 선행 연구를 언급하지 않았기 때문에 1점으로 판정했습니다. |
| C2 | 2 | 중 | 전송, 인가, 신호, 암호 책임은 v0.2 스키마에서 실제로 빠졌습니다(강점 참조). 그러나 (1) 추상 오라클이 정책 어휘를 하드코딩하고 있고(run.py:69-101), (2) 의미가 어디에도 정의되지 않은 열거값이 있으며(scope_type provider_defined/organization_mediated), (3) KEEP 판정 필드 상당수(trust_domain, lifecycle.state, representation, visibility)에 실행 불변식이 없어 자체 가드레일 5번(standards-boundary.md:300)을 위반하고, (4) PROV와 겹치는 actor_type과 중복 관계 어휘가 남아 있습니다. 위임은 대부분 '생략'이고 '매핑'은 아직 없습니다(M6 미착수). |
| C3 | N/A | N/A | 주 평가 범위가 아닙니다. 다만 wire-v0.2-draft.md:176(범위가 다르면 basis 필요)과 semantic-scenarios-v0.2.md:34(source⊇target이 필요조건) 사이의 불일치는 SS-04에 기록했습니다. |
| C4 | N/A | N/A | 주 평가 범위가 아닙니다. 관련 증거(P1~P4, P8)는 SS-04, SS-05, SS-07, SS-10에 기록했으며, 점수는 해당 평가자에게 맡깁니다. |
| C5 | N/A | N/A | 다루지 않았습니다. 다만 와이어 오라클과 추상 오라클이 투영 규칙에서 서로 다른 답을 내는 점(P2)은 오라클 일관성 문제로 SS-04에 기록했습니다. |
| C6 | N/A | N/A | v0.2 두 스위트만 실행했습니다(31건 PASS, 20+1건 PASS). CI 전체는 재현하지 않았습니다. |
| C7 | N/A | N/A | 다루지 않았습니다. |
| C8 | N/A | N/A | 주 평가 범위가 아닙니다. 제한 세탁(P3), 근거 세탁(P5), 범위 누출(P1)의 증거는 발견 항목에 기록했습니다. |
| C9 | N/A | N/A | 다루지 않았습니다. |
| C10 | N/A | N/A | 다루지 않았습니다. |

## 3. 발견 사항

### SS-01: support_sets는 기존 why-provenance/provenance semiring/ATMS 레이블과 의미가 같고, PROV 한정 파생 + 프로파일 규칙 1개로 재현됩니다

- 기준: C1
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: scratchpad/eval/standards-skeptic/prior_art_equiv.py를 실행했습니다. 무작위 support_sets 3000개 × 제거 부분집합 16개 = 48000쌍에 대해 conformance/v0_2/run.py:46-66 dependency_invalidation_result의 current_support_exists와 (a) 양의 불리언 다항식(Green·Karvounarakis·Tannen PODS 2007), (b) ATMS 레이블 환경 검사(de Kleer 1986), (c) PROV-O 프로파일('지원 집합마다 prov:qualifiedDerivation/prov:hadActivity 하나, 해당 activity가 prov:used한 엔티티 중 wasInvalidatedBy가 없으면 지원 성립')을 비교했습니다. 출력: 'compared 48000 (support_sets, removal) pairs; mismatches=0'. 이에 비해 저장소는 'PROV can express lineage but not alternative sufficient evidence sets'(standards-reconciliation-v0.2.md:143), 'A flat provenance edge does not say...'(README:100)라고 주장합니다. 저장소 전체 grep에서 semiring, why-provenance, ATMS, nanopub, verifiable credential은 0건이고, truth-maintenance는 core-v0.2-draft.md:436의 미해결 질문 1건뿐입니다.
- 내용: support_sets([[A],[B]] = A+B, [[A,B]] = A·B)는 Buneman 등(ICDT 2001)의 witness basis와 같고, semiring 다항식의 DNF와도 같습니다. 출처 제거는 변수를 0으로 두는 연산, 곧 deletion propagation입니다. 저장소가 반박한 것은 '평평한 PROV 간선'일 뿐입니다. PROV의 qualified Derivation/Activity로 그룹을 나누고 SHACL/SPARQL 규칙 하나를 프로파일로 정의하는 대안은 검토되지 않았습니다. 따라서 이 개념은 '선행 연구로 완전히 포괄, PROV로는 부분 포괄(프로파일 규칙 필요)'에 해당합니다. 새로운 것은 '관계 맥락 교환에서 이 필드를 필수로 둔다'는 프로파일 결정뿐입니다.
- 권고: support_sets를 'RCP 고유 의미론'이 아니라 why-provenance/ATMS 레이블의 직렬화로 재서술하십시오. 같은 사례를 PROV-O 한정 파생 + SHACL 규칙으로 인코딩해, 기존 표준 대안이 실제로 실패하는 지점이 있는지 실행 가능한 비교 사례로 문서화하십시오. 실패 지점이 없다면 Core 필드가 아니라 PROV 프로파일로 옮기십시오.
- 검증 의견: 독립 재현했습니다. run.py의 dependency_invalidation_result는 '지원 집합 중 제거된 출처와 교집합이 없는 것이 하나라도 있는가'를 계산합니다. 이는 정의상 양의 불리언 다항식(DNF)의 변수 0 대입 평가이자 ATMS 최소 환경 레이블 검사입니다. 제가 새로 작성한 스크립트로 무작위 48000쌍을 비교했더니 불일치가 0건이었습니다. 다만 이 일치는 오라클이 곧 DNF 평가이기 때문에 사실상 항진입니다. 저는 PROV-O 한정 파생 + SHACL 인코딩은 실행하지 못했고, 그 부분은 평가자의 서술에 의존하며 재현하지 못했습니다. 저장소에서 semiring, why-provenance, ATMS, nanopub, verifiable credential, sticky, hadPrimarySource를 git grep한 결과 0건이었고, truth-maintenance는 core-v0.2-draft.md:436의 미해결 질문 1건뿐이었습니다. 따라서 선행 연구 미인용은 사실입니다. 반박 소지도 있습니다. 순수 PROV는 복수 qualified derivation에 AND/OR 충분성 의미를 부여하지 않으므로, standards-reconciliation:143의 'PROV can express lineage but not alternative sufficient evidence sets'가 틀렸다고 단정할 수 없습니다. 평가자도 '프로파일 규칙 1개가 필요하다'고 인정합니다. 즉 실제 결함은 선행 연구 대조와 근거 서술의 누락이라는 문서·정당화 격차입니다. 테스트나 불변식이 깨진 것은 아닙니다. 그래서 높음은 과대평가이고 중간으로 조정합니다.
- 검증 근거: git grep -i -E 'semiring|why-provenance|ATMS|nanopub|verifiable credential|truth.maintenance|sticky|hadPrimarySource' → spec/core-v0.2-draft.md:436 한 줄만 나옴. scratchpad/eval/verify/standards-skeptic/equiv.py 실행 결과 '48000 0'(비교 쌍 수, 불일치 수). docs/standards-reconciliation-v0.2.md:143, README.md:100, spec/core-v0.2-draft.md 4.8절.

### SS-02: 같은 출처의 비독립 증거를 표현할 수 없어 '독립 근거 생존' 판정이 틀립니다. 이 부분은 PROV가 더 표현력이 높습니다

- 기준: C1, C4, C8
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 낮음)
- 근거: probes.py P5: Dependency에 had_primary_source를 추가하자 'SCHEMA-REJECT: Additional properties are not allowed (had_primary_source was unexpected)'가 났습니다(schema:181-195 additionalProperties:false). 오라클 확인: dependency_invalidation_result({support_sets:[[gmail:m1],[crm:m1-copy]], removed:[gmail:m1]}) → {'current_support_exists': True, 'action': 'recompute'}.
- 내용: Gmail 메시지와 그 메시지를 CRM에 로깅한 기록은 출처가 하나입니다. RCP에서는 둘을 [[E1],[E2]]로 적으면 독립 지원이 되고, 원본이 철회되어도 복사본 때문에 단언이 현재 상태로 유지됩니다. 반복이 근거를 승격시키는 셈인데, 이는 Core 5.3/시나리오 E의 '반복으로 승격 금지' 정신과 충돌합니다. role=corroborates로 표시하면 오히려 확증된 것처럼 보입니다. PROV는 prov:hadPrimarySource와 prov:wasQuotedFrom으로 공통 출처를 표현할 수 있습니다. 표현 적합성 분류: 불가능.
- 권고: EvidenceReference/Dependency에 공통 출처(primary source) 참조를 두거나 PROV hadPrimarySource 매핑을 필수로 하십시오. 지원 집합 평가는 출처 동치류 단위로 하도록 규정하십시오. 시맨틱 케이스에 '같은 출처의 이중 보고' 음성 사례를 추가하십시오.
- 검증 의견: 기계적 재현은 됩니다. had_primary_source를 Dependency에 넣으면 'Additional properties are not allowed (had_primary_source was unexpected)'로 스키마가 거부합니다. dependency_invalidation_result({support_sets:[[gmail:m1],[crm:m1-copy]], removed:[gmail:m1]})는 current_support_exists=True, action=recompute를 반환합니다. 그러나 결함의 크기와 표현은 과장되었습니다. (1) 스펙의 'independently sufficient'는 각 지원 집합이 단독으로 충분하다는 뜻으로 Provider가 선언합니다. 출처 독립성의 판정 기준은 정의하지 않으며, 같은 출처의 복사본을 별도 집합으로 적는 것은 Provider의 선언 오류입니다. (2) 올바른 결과는 이미 표현 가능합니다. 복사본을 원본과 같은 집합에 [[gmail:m1,crm:m1-copy]]로 묶으면 원본 제거 시 invalidate가 됩니다. 따라서 '표현 불가능'은 맞지 않고, 정확히는 '공통 출처라는 이유를 기계적으로 검증·기술할 필드가 없음'입니다. (3) Core 5.3 'no epistemic promotion'은 epistemic class를 verified_fact로 올리는 것을 막는 규칙입니다. 지원 집합의 생존 판정과는 다른 사안이라 충돌 주장은 오독에 가깝습니다. (4) core-v0.2-draft.md의 미해결 질문('Is disjunctive-normal support_sets expressive enough for real Providers?')이 이미 이 방향의 한계를 열어 둡니다. 다만 PROV의 hadPrimarySource가 이 점에서 더 풍부하다는 지적은 타당합니다. 설계상 갭으로 낮음입니다.
- 검증 근거: probes.py P5 출력 'SCHEMA-REJECT: Additional properties are not allowed'. 오라클 호출 결과 {'current_support_exists': True, 'action': 'recompute', 'historical_lineage_preserved': True}. spec/core-v0.2-draft.md 5.3(263행)은 epistemic class 승격 규칙. docs/semantic-scenarios-v0.2.md 80-106행 Scenario C와 wire-v0.2-draft.md 9절은 독립성 기준을 정의하지 않음.

### SS-03: 기존 표준 조합의 실패를 실행 가능하게 보여 주지 못했습니다. 위임과 고유성 판단이 한 문장짜리 서술에 머물러 있습니다

- 기준: C1, C2
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: git ls-files | xargs grep -l -E 'prov:|odrl:|dpv:|authzen|caep' 결과는 docs/outreach/TARGET_MAP.md, docs/standards-boundary.md, docs/standards-reconciliation-v0.2.md, spec/wire-v0.2-draft.md 4개 문서뿐이고 코드와 픽스처는 0건입니다. ROADMAP.md:215-218의 PROV/AuthZEN/SSF/ODRL-DPV 프로파일은 모두 '- [ ]'(미착수)입니다. semantic-scenarios-v0.2.md:351은 '각 시나리오를 기존 표준과 대조해야 한다'고 스스로 적었지만 대조 산출물이 없습니다. WebFetch로 ODRL 2.2를 확인했습니다: §2.9 Policy Inheritance('child Policy may inherit all the atomic Rules of one or more parent Policies'), §2.6.3 Duty의 assignee, §2.10 conflict perm/prohibit/invalid. WebSearch로 Nanopub-X를 확인했습니다: npx:supersedes, npx:retracts.
- 내용: 개념별 판정은 다음과 같습니다(판단). (1) 참여자 범위 투영은 부분 포괄입니다. AS2 to/cc/audience + PROV 한정 파생의 prov:hadPlan(=projection_basis) + SHACL '참여자 집합이 다르면 Plan 필수'로 표현됩니다. 고유 부분은 'target⊆source 필요, basis 필수'라는 안전 기본값뿐입니다. (2) epistemic class도 부분 포괄입니다. GO evidence code(TAS/NAS/IC/IEA/EXP), ECO, PROV wasQuotedFrom, VC의 evidence/proof가 같은 축을 다룹니다. 고유 부분은 8개 값 목록과 승격 금지 규칙입니다. (3) support_sets는 SS-01에 정리했습니다. (4) 제한 상속은 선행 연구로 완전 포괄, 표준으로는 부분 포괄입니다. Myers-Liskov DLM의 레이블 join, sticky policy, ODRL inheritFrom과 conflict=prohibit가 해당합니다. 다만 ODRL은 파생 자산의 자동 상속을 정의하지 않으므로, 프로파일 규칙 1개가 필요합니다. (5) 하류 무효화/수명주기는 부분 포괄입니다. PROV wasInvalidatedBy, SSF 사용자 정의 이벤트, nanopub supersedes/retracts, JTMS/ATMS 철회, IVM의 DRed가 해당합니다. 고유 부분은 상태 열거값뿐이고 전이 규칙은 없습니다(SS-11). 다섯 개념 모두 '진정으로 새로움'으로 판정할 결정 시나리오가 저장소에 없습니다. README:22가 스스로 세운 정당성 기준은 아직 입증되지 않았습니다.
- 권고: 개념마다 'PROV+ODRL+AuthZEN+SSF(+선행 연구) 인코딩 → 같은 시나리오 → 어디서 결과가 갈리는지'를 픽스처와 실행 비교로 만드십시오. 갈리지 않는 개념은 Core에서 빼고 프로파일로 옮기십시오. standards-reconciliation에 선행 연구 절(provenance semiring, ATMS, DLM/sticky policy, ECO, nanopub, VC)을 추가하십시오.
- 검증 의견: 핵심 사실은 재현됩니다. git ls-files | xargs grep -l -E 'prov:|odrl:|dpv:|authzen|caep'는 docs/outreach/TARGET_MAP.md, docs/standards-boundary.md, docs/standards-reconciliation-v0.2.md, spec/wire-v0.2-draft.md 네 문서만 반환하며 코드와 픽스처는 0건입니다. ROADMAP.md M6의 PROV/AuthZEN/SSF/ODRL-DPV 프로파일은 모두 '- [ ]'입니다. 기존 표준 조합이 어디서 실패하는지 보여 주는 실행형 비교 사례가 없다는 점도 맞고, 선행 연구 절이 없다는 점은 SS-01에서 확인했습니다. 다만 반박할 부분이 있습니다. (1) '대조 산출물이 없다'는 과장입니다. docs/standards-reconciliation-v0.2.md(M4.5)가 필드 단위 대조표로 KEEP/PROFILE/MAP 판정을 내립니다. semantic-scenarios의 'reconcile 해야 한다'는 문장은 M4.5 이전에 쓰인 낡은 문장입니다. 빠진 것은 문서 대조가 아니라 실행형 대조입니다. (2) ROADMAP M6은 'Build only profiles demonstrated to be required by implementation'이라고 명시하므로 미착수는 의도입니다. (3) 개념별 '부분 포괄/완전 포괄' 판정은 평가자 스스로 '판단'이라 표시한 의견입니다. ODRL 인용(§2.9, §2.6.3, §2.10)과 Nanopub-X는 제가 웹으로 다시 확인하지 않았고, 일반 지식으로는 그럴듯하지만 미검증으로 둡니다. 따라서 근거 입증 부족이라는 취지는 타당하나 과장이 섞인 중간으로 조정합니다.
- 검증 근거: git ls-files | xargs grep -l ... → 4개 문서, 코드 0건. ROADMAP.md 215-218행 '- [ ]'. docs/semantic-scenarios-v0.2.md 346-349행 'Before doing so, the project should reconcile...' 문장. docs/standards-reconciliation-v0.2.md 존재. spec/core-v0.2-draft.md 12절 Core 추가 규칙.

### SS-04: 참여자 투영 불변식이 와이어 검증기에서 우회됩니다(derived/opaque 모드). 범위 확장도 임의 basis로 통과해 추상 오라클과 판정이 어긋납니다

- 기준: C1, C4, C8, C3
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 높음)
- 근거: probes.out: '[P1 derived-mode bypasses projection check ...] ACCEPTED', '[P1b opaque provenance: no projection basis needed] ACCEPTED', '[P2 wire: scope EXPANSION {A,B}->{A,B,D} with basis x] ACCEPTED / semantic-oracle projection_allowed same case: False'. 코드 위치: run_wire.py:62-67(evidence 항목이 있을 때만 검사하고 target⊆source 검사는 없음), run.py:29(target⊆source 강제), semantic-cases.json:27-32(projection-target-not-in-source expected false), wire-v0.2-draft.md:176('Whenever those sets differ ... basis required', 부분집합 조건 없음), semantic-scenarios-v0.2.md:34, core-v0.2-draft.md:261.
- 내용: C1 관점에서 보면 '가장 관계 특화적'이라고 내세운 개념의 실제 집행 수준은 'evidence가 내장된 경우에 한해, 참여자 집합이 다르면 비어 있지 않은 문자열이 있어야 한다'에 그칩니다. Dependency에는 source_participants가 없어서 derived 모드는 구조적으로 투영을 표현할 수 없습니다. opaque 모드는 허용된 노출 방식이므로 투영 축소가 침묵 속에서 일어나도 막을 수 없습니다. 외부 클린룸 하네스는 run_wire를 참조 오라클로 쓰기 때문에(reference_adapter.py:110-112), 클린룸 구현이 추상 오라클을 따르면 참조와 다른 답을 냅니다.
- 권고: 와이어 규칙에 target⊆source(증거별 또는 합집합 기준)를 명시하십시오. derived/opaque 모드에서는 source 참여자 범위 또는 '투영 없음' 선언을 필수로 두거나, 선언이 없으면 fail-closed로 처리하십시오. P1/P2를 음성 와이어 케이스로 추가하십시오.
- 검증 의견: 전부 재현했습니다. wire-cases.json의 explicit-bilateral-projection을 변형해 run_wire.semantic_errors에 넣은 결과는 다음과 같습니다. (a) 범위 확장: 증거 source {A,B}에서 target 그룹 {A,B,D}로 projection_basis_ref='x'를 달면 ACCEPTED입니다. 같은 입력을 run.py의 projection_allowed에 주면 False입니다. (b) 완전 분리된 source {C,D}에서 target {A,B}로 basis만 있어도 ACCEPTED입니다. (c) derived 모드(derived-independent-support)와 opaque 모드는 투영 검사를 아예 거치지 않아 ACCEPTED입니다. 근거 코드는 run_wire.py의 'source != target and not basis'뿐이고 부분집합 검사가 없습니다. 문서 불일치도 확인됩니다. semantic-scenarios Scenario A의 불변식은 'source_participants ⊇ target_participants is necessary but not sufficient'이고, semantic-cases.json의 projection-target-not-in-source는 expected_allowed=false입니다. 반면 wire-v0.2-draft.md 6절은 'differ → basis required'만 적고 ⊇ 조건이 없습니다. 외부 클린룸 하네스의 reference_adapter.py는 run_wire의 semantic_errors를 참조 오라클로 호출하므로, 추상 오라클을 따르는 구현과 참조 구현의 판정이 갈립니다. 다만 opaque 모드는 노출 방식이 허용된 설계이고 derived 모드의 Dependency에 source 참여자 필드가 없는 것은 스펙이 주장한 적 없는 범위이므로, 그 부분은 설계 갭이고 증거 모드 확장 통과는 명백한 불변식 불일치입니다. 핵심 불변식 자체가 스펙이나 테스트 안에서 직접 깨진 것은 아니므로(와이어 draft는 비규범이고 negative case도 없음) 치명은 아니고 높음을 유지합니다.
- 검증 근거: probes.py 출력: [P1 derived] ACCEPTED, [P1b opaque] ACCEPTED, [P2 scope EXPANSION {A,B}->{A,B,D} basis x] ACCEPTED, 'oracle expansion: False', [P1c disjoint source {C,D}->{A,B}] ACCEPTED. conformance/v0_2/run_wire.py의 투영 검사 루프, conformance/v0_2/run.py projection_allowed, conformance/v0_2/semantic-cases.json projection-target-not-in-source, conformance/external/v0_2/reference_adapter.py:110-112, docs/semantic-scenarios-v0.2.md Scenario A 불변식.

### SS-05: 제한 상속이 와이어에서 증거 수준 policy_refs를 잃어도 통과합니다. 추상 오라클의 제한 시험은 와이어 모델과 연결되지 않습니다

- 기준: C1, C4, C8
- 심각도: 높음
- 구분: 검증됨
- 교차 검증: confirmed (심각도 높음 → 중간)
- 근거: probes.out: '[P3 evidence policy_refs not carried to assertion policy_refs] ACCEPTED'(evidence.policy_refs=[policy:external-processing-deny], assertion.policy_refs=[]). run_wire.py:122-133은 derivation의 policy 의존성만 검사하고 provenance.evidence[*].policy_refs는 보지 않습니다. run.py:69-101의 effective_parent_policy는 allowed_purposes/external_processing/training/retention_max_seconds를 다루지만, 이 필드들은 v0.2 스키마에 없습니다(schema:51-55, 174-178은 문자열 참조만 있음).
- 내용: Core 5.6과 5.7('변환이 제한을 지우지 않는다')이 RCP 고유 가치라고 주장되지만, 와이어 수준 집행은 '문자열 참조 복사 여부'뿐이고 그마저 evidence 모드에서는 빠집니다. 추상 오라클의 단조성 검사(목적 교집합, deny 유지, 보존 기간 최솟값)는 DLM 레이블 join이나 ODRL conflict=prohibit와 같은 기존 의미론입니다. 그런데 이 검사를 와이어 객체에 적용할 방법이 없으므로, 고유 개념의 집행이 실제로는 비어 있습니다.
- 권고: evidence 모드에서도 증거 policy_refs ⊆ 단언 policy_refs를 요구하십시오. 추상 단조성 규칙은 ODRL/DPV 프로파일 위의 검사로 옮기고, 와이어 케이스와 연결하십시오.
- 검증 의견: 재현됩니다. 증거 모드에서 evidence[0].policy_refs=['policy:external-processing-deny']이고 assertion.policy_refs가 없는 인스턴스가 ACCEPTED입니다. 대조군으로 derived 모드에서 material policy 의존성을 assertion.policy_refs에서 빼면 'material policy dependencies are not preserved'로 REJECTED됩니다. run_wire.py는 derivation의 policy 의존성만 검사하고 provenance.evidence[*].policy_refs는 보지 않습니다. run.py의 effective_parent_policy가 쓰는 allowed_purposes, external_processing, training, retention_max_seconds는 v0.2 스키마에 없는 필드이므로 추상 단조성 검사는 와이어 객체에 적용할 수 없습니다. 그러나 이는 상당 부분 의도된 설계입니다. wire-v0.2-draft.md 10절은 'RCP v0.2 does not define a universal policy ... vocabulary'이고 '참조만 운반'하며, 적합성 요건은 'material policy dependencies가 파생 단언에 남아야 한다'로 한정합니다. Core 5.7도 제한 보존이 'applicable policy profile'에 따른다고 적습니다. 따라서 추상 단조성과 와이어의 단절 및 '고유 개념 집행이 비어 있다'는 평가는 문서화된 범위의 결과입니다. 실제 결함은 증거 모드에서 증거 수준 policy_refs 전파가 검사되지 않는 구멍(Core 5.4·5.6과의 긴장)입니다. DLM·ODRL과의 의미 중복 주장은 SS-01·03과 같은 성격의 의견입니다. 높음은 과대평가이고 중간으로 조정합니다.
- 검증 근거: probes.py 출력: [P3 evidence policy_refs not carried] ACCEPTED, [P3b derived policy dep not carried (control)] REJECTED ['material policy dependencies are not preserved: policy:no-training']. spec/wire-v0.2-draft.md 10절(268-285행), spec/core-v0.2-draft.md 5.4·5.6·5.7, spec/schemas/v0.2-draft/context-assertion.schema.json의 policy_refs는 문자열 배열, conformance/v0_2/run_wire.py의 derived 블록.

### SS-06: 적합성 오라클이 정책 어휘(목적, 외부 처리, 학습, 보존 기간)를 하드코딩합니다. 정책 어휘를 위임했다는 주장과 모순됩니다

- 기준: C2
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: grep 결과 conformance/v0_2/run.py:70-78, 93-99와 semantic-cases.json:80-143입니다. 반면 standards-boundary.md:184는 'The syntax and vocabulary of those policies live outside Core', core-v0.2-draft.md:239는 'RCP does not define a universal policy language'라고 적었습니다. v0.2-semantic-conformance-notes.md:97-104는 이를 '추상 정규화 차원'이라고 정당화합니다.
- 내용: 이 네 차원은 v0.1 레지스트리(spec/registries/purposes.md, processing-locations.md)의 잔재이며 DPV의 dpv:Purpose, StorageDuration, 처리 위치 개념과 겹칩니다. 오라클이 특정 차원 집합을 고정하면, 클린룸 구현자는 RCP가 이 네 차원을 정의한다고 읽을 수 있습니다.
- 권고: 오라클 입력을 DPV/ODRL 용어로 표기하거나, '프로파일 제공 정책 격자의 meet 연산'으로 일반화하십시오. 차원 이름은 테스트 프로파일 파일로 분리하십시오.

### SS-07: verified_fact의 근거 검사가 명목상입니다. 정책 참조나 자기 자신의 source_statement 증거도 검증 근거로 통과합니다

- 기준: C1, C4, C8
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: probes.out: '[P4a verified_fact with basis = policy ref] ACCEPTED'(verification_basis_refs=[policy:no-training]), '[P4b verified_fact with basis = its own source_statement evidence] ACCEPTED'. run_wire.py:135-138은 근거가 알려진 evidence/dependency ref 집합에 있는지만 확인합니다.
- 내용: epistemic class의 핵심 불변식인 '승격 금지'가 와이어에서는 '아무 ref나 하나 걸면 승격 가능'으로 약해집니다. W3C VC(issuer + proof + evidence)나 ECO의 실험 증거 코드보다 검증 의미가 약하므로, 이 개념을 RCP 고유 가치로 주장할 근거가 더 줄어듭니다.
- 권고: 검증 근거는 dependency_type이 evidence/assertion인 항목이어야 한다고 규정하십시오. 근거 자체의 epistemic 등급이나 검증 활동(PROV Activity/VC proof) 참조도 요구하십시오.

### SS-08: KEEP 판정 필드 상당수에 실행 불변식이 없습니다. scope_type의 provider_defined/organization_mediated는 의미가 정의되지 않았습니다

- 기준: C2, C4
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: run_wire.py의 semantic_errors(38-152행)를 필드별로 grep한 결과, representation, visibility, evidence_type, provider_ref, occurred_at, trust_domain, relationship_ref, assertion_type, lifecycle state, valid_from/valid_until, reason_refs, statement가 모두 0회 등장합니다. probes.out: '[P9a scope_type=provider_defined] ACCEPTED', '[P9b cross-tenant participants, trust_domain=tenant:t3] ACCEPTED'. provider_defined/organization_mediated는 schema:137에만 나오고 spec과 docs 어디에도 정의가 없습니다(grep 0건). standards-reconciliation-v0.2.md:122는 trust_domain을 'KEEP — prevents accidental cross-tenant ... collapse'로 판정했습니다. standards-boundary.md:300의 가드레일 5번은 'It produces an executable interoperability invariant'입니다.
- 내용: 저장소 자체 규칙으로 보면 이 필드들은 Core에 남을 자격이 아직 없습니다. 특히 scope_type=unknown은 fail-closed로 거부되는데, 의미가 정의되지 않은 provider_defined는 카디널리티 검사까지 건너뛰고 통과합니다. 이는 '미지 값은 더 제한적으로 해석한다'는 원칙(5.11)과 어긋납니다.
- 권고: 각 KEEP 필드에 최소 한 개의 실행 불변식을 붙이거나 프로파일/확장으로 강등하십시오. provider_defined는 프로파일 참조를 필수로 하고, 없으면 fail-closed로 처리하십시오. trust_domain과 actor scope의 관계도 규정하십시오.

### SS-09: 기존 어휘와의 중복 및 Core 내부 중복 어휘가 남아 있습니다(actor_type, representation과 visibility, role과 relation)

- 기준: C2
- 심각도: 낮음
- 구분: 판단
- 교차 검증: 미검증
- 근거: schema:121-125 actor_type 열거값 person/organization/service/agent는 PROV-O의 prov:Person/prov:Organization/prov:SoftwareAgent와 같은 축입니다. standards-reconciliation-v0.2.md:120은 이를 PROFILE/MAP으로 판정했지만 Core 스키마에 기본 열거값으로 남아 있습니다. actor_type은 신원 동등성 키에 들어갑니다(run_wire.py:34-35). probe P13에서 같은 B가 evidence에서는 unknown, target에서는 person으로 표기되면 투영 basis가 요구됩니다. representation(schema:164: opaque_ref/type_only/...)과 provenance.visibility(schema:226: type_only/opaque/...)는 노출 수준 축이 겹칩니다. Dependency.role(schema:191: supports/corroborates/refines)과 AssertionRelation.relation(schema:253)은 같은 관계 어휘를 두 위치에서 씁니다.
- 내용: 분류 어휘가 신원 키에 들어가면 Provider마다 타입 표기 단위가 다를 때 같은 사람을 다른 참여자로 취급합니다. fail-closed 쪽이라 안전하긴 하지만 상호운용 마찰이 생깁니다. 같은 의미를 두 경로로 표현할 수 있으면 구현마다 정규화 결과가 갈릴 수 있습니다.
- 권고: actor_type은 신원 키에서 빼고 PROV/DPV 매핑 프로파일로 옮기십시오. representation과 visibility를 하나의 노출 축으로 합치거나 둘의 차이를 규정하십시오. assertion 의존성 role과 assertion_relations 중 하나를 정본으로 정하십시오.

### SS-10: 표현 적합성: 현실 상황 7개 중 Core에서 불가능 2개, 확장 필요 5개입니다. 서로 모순되는 관계 선언도 통과합니다

- 기준: C1
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: probes.out 기준입니다. P6(relationship_scope를 배열로) SCHEMA-REJECT 'is not of type object'. P10(참여자별 valid_until) SCHEMA-REJECT. P13(Provider별 타입/범위 단위 차이) SEMANTIC-REJECT. P11(관계 'qualifies') SCHEMA-REJECT 'not one of [supports, corroborates, conflicts_with, supersedes, refines]'. P7b(확장으로 불확실성/의무 전달 시 미지원 Consumer) SEMANTIC-REJECT 'required extension is unsupported'. P12(부분 대체 selector) SCHEMA-REJECT. P7(당사자별 의무 필드) SCHEMA-REJECT. P5(비독립 증거)는 SS-02 참조. P8(같은 대상에 supersedes+conflicts_with+supports 동시 선언) ACCEPTED.
- 내용: 상황별 분류입니다. (1) 여러 관계에 걸친 단언은 확장이 필요합니다. 단언을 복제하고 lineage로 묶어야 합니다. (2) 시간에 따라 바뀌는 참여자도 확장이 필요합니다. 단언 단위 supersedes로만 표현됩니다. (3) Provider마다 다른 범위 단위도 확장이 필요합니다. 조직/멤버 포함 관계가 없고 actor_key는 완전 일치를 요구합니다. (4) 충돌은 아니지만 불확실한 근거도 확장이 필요합니다. confidence가 확장으로 빠졌고, required로 두면 미지원 Consumer는 거부하며, optional로 두면 Core 의미가 아닙니다. (5) 부분 대체도 확장이 필요합니다. 단언을 분할하고 refines로 우회해야 합니다. (6) 당사자별 의무를 지닌 약속은 Core에서 불가능합니다. statement 산문으로만 표현되고, ODRL Duty assignee는 이를 구조적으로 표현합니다. (7) 같은 출처의 비독립 증거는 불가능하고 결과도 틀립니다(SS-02). 이 가운데 (6), (7)은 기존 표준이 RCP보다 표현력이 높은 사례입니다.
- 권고: C1 표현 적합성 표를 저장소 문서에 두고, 각 상황을 와이어 픽스처로 만드십시오. 의무는 ODRL Duty 매핑, 출처 공유는 PROV hadPrimarySource 매핑으로 해결할 수 있는지 먼저 검토하십시오. 모순 관계 조합은 거부 규칙을 정하십시오.

### SS-11: 가장 고유하다는 '하류 무효화/수명주기'에 와이어나 실행 표면이 없습니다. 존재하는 추상 오라클은 ATMS 철회와 같습니다

- 기준: C1, C2
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: conformance/external/v0_2/CONTRACT.md:35 'operation — currently fixed to evaluate_context_assertion'은 정적 단일 객체 평가입니다. 변경 이벤트, 전이 입력, 전후 상태를 비교하는 연산은 없습니다. run_wire.py에서 lifecycle.state에 대한 의미 검사는 0건입니다(SS-08 grep). 하류 무효화를 다루는 것은 run.py:46-66의 15행 함수(support 생존 여부 → none/recompute/invalidate)뿐이고, 이 결과는 SS-01의 ATMS 레이블 검사와 48000/48000 일치합니다. SSF 프로파일은 ROADMAP.md:217에서 미착수입니다. core-v0.2-draft.md:233-235는 전이 결과를 열거만 하고 전이 함수는 정의하지 않습니다.
- 내용: README:5와 standards-boundary.md:64는 'Relationship-assertion lifecycle after dependency change'를 RCP Core 소유로 둡니다. 그러나 와이어에는 어떤 변경이 어떤 상태 전이를 일으키는지 표현할 수단도, 이를 시험할 수단도 없습니다. 신호 전달은 SSF로 위임되었지만 그 프로파일이 없으므로, 이 개념은 현재 'PROV wasInvalidatedBy + 상태 열거값'에 불과합니다.
- 권고: (이전 단언, 변경 신호) → (새 상태, 새 lineage) 형태의 전이 케이스와 하네스 연산을 추가하십시오. 그렇게 해도 기존 TMS/IVM 의미론과 다른 결과가 나오지 않는다면, 고유성 주장을 '관계 맥락 프로파일'로 낮추십시오.

## 4. 실행한 검증

```text
아래 명령은 모두 wt 체크아웃(68026af)과 .venv에서 실행했습니다.
1) `python conformance/v0_2/run.py` → 'RCP v0.2 draft semantic conformance: PASS (31 cases)'.
2) `python conformance/v0_2/run_wire.py` → 'PASS (20 schema/semantic cases, 1 binding-equivalence case)'.
3) `python scratchpad/eval/standards-skeptic/probes.py`(출력: probes.out): 와이어 스키마와 semantic_errors에 대한 반례 탐침 13종입니다. ACCEPTED는 P1, P1b, P2, P3, P4a, P4b, P8, P9a, P9b입니다. 스키마 거부는 P5, P6, P7, P10, P11, P12, 의미 거부는 P7b, P13입니다. P2에서는 추상 오라클 projection_allowed가 False를 내 와이어 오라클과 판정이 갈렸습니다.
4) `python scratchpad/eval/standards-skeptic/prior_art_equiv.py`(출력: prior_art_equiv.out): run.py의 dependency_invalidation_result를 semiring 다항식, ATMS 레이블, PROV-O 한정 파생 프로파일과 48000쌍 비교했고 불일치는 0입니다.
5) `git ls-files | xargs grep -l -E 'prov:|odrl:|dpv:|authzen|caep'` → 문서 4개만 걸렸고 실행 매핑 산출물은 없습니다.
6) `grep -il 'semiring|why-provenance|ATMS|nanopub|verifiable cred|truth-maintenance'` → core-v0.2-draft.md 1건(미해결 질문)뿐입니다.
7) run_wire.py semantic_errors 범위(38-152행)를 필드별로 grep했습니다. representation, visibility, trust_domain, lifecycle state 등 12개 필드가 0회 등장합니다.
8) WebFetch https://www.w3.org/TR/odrl-model/ 로 §2.9 Policy Inheritance, §2.6.3 Duty assignee, §2.10 conflict 전략을 확인했습니다. WebSearch로 Nanopub-X의 npx:supersedes와 npx:retracts를 확인했습니다.
```

## 5. 평가 한계

- PROV 대안은 rdflib/SHACL 없이 파이썬 트리플 목록으로만 모사했습니다. 실제 PROV-O 직렬화와 SHACL 검증으로 확인한 것은 아닙니다.
- 선행 연구 대응(GO/ECO 증거 코드, DLM, sticky policy, why-provenance, ATMS)은 평가자의 지식에 기반한 판단입니다. 원문을 웹에서 확인한 것은 ODRL 2.2와 Nanopub-X뿐입니다.
- AuthZEN, SSF/CAEP, VC, Solid 원문은 이번에 다시 읽지 않았습니다.
- 바인딩(bindings/v0_2) 코드, v0.1 생태계, CI 전체 재현은 범위 밖으로 두었습니다.
- 다섯 개념의 '부분 포괄' 판정은 프로파일 규칙 1~2개를 추가하면 기존 표준으로 같은 결과를 낸다는 주장입니다. 그 프로파일을 실제로 작성해 실행 검증하지는 않았습니다(support_sets 제외).
- C4·C8 관련 발견(SS-04, SS-05, SS-07)은 주 기준 밖이라 점수에 반영하지 않았고, 심각도는 '높음'으로 두었습니다. 시험이 잘못된 동작을 단언하는 경우가 아니라 집행 공백이라고 판단했기 때문입니다. 게이트 판단은 C4/C8 평가자에게 맡깁니다.
