# RCP v0.2 (68026af) 다중 에이전트 독립 평가 종합

## 1. 요약

RCP v0.2의 진단은 이렇습니다. 명세의 골격(열거값, 구조와 의미 검증의 2단계 분리, 위임 경계)과 재현성은 단계 기대치를 충족합니다. 하지만 핵심 불변식인 참여자 범위 비축소, 제한 상속, epistemic 승격 금지가 와이어 수준에서 일관되게 강제되지 않습니다. 저장소의 두 오라클이 같은 규칙에서 서로 모순되고, 테스트도 상당수 규칙을 고정하지 못합니다.

- **게이트: 통과.** C4와 C8에 `치명` 발견은 0건입니다. 경계 사례가 둘 있었습니다.
  - SA-01: 작성자가 치명 가능성을 언급했지만 검증 후 중간으로 내려갔습니다.
  - RT-3: 작성자가 "치명에 가장 가까운 경계"로 적었고 검증에서 높음이 유지됐습니다.
- **가중 점수 1.59, 단계 기대 가중 점수 2.49, 차이 −0.90.** 점수를 받은 기준은 10개 중 9개(가중치 94)입니다. C7은 어느 역할도 점수를 매기지 않아 집계에서 빠졌습니다. 기대치를 맞추거나 넘은 기준은 C6, C9, C10 셋뿐입니다. 가장 큰 기준(C4 16, C1 15, C3 14, C5 13, C8 12)은 모두 기대치보다 1~1.5점 낮습니다.
- **클린룸 등급: A.** 결과 등급 A, 독립성 상한 A입니다.
  - 근거: 공개 15/15(100%), 보류(held-out) 결정 케이스 29/29(100%), 불일치 3건 전부 원인 분류 완료, 클린룸 위반 0건, 계약 위반 0건.
  - AA가 아닌 이유는 구현자가 보고한 명세 모호가 12건이기 때문입니다(AA는 0건이어야 함).
  - 상한이 A인 이유는 구현 주체가 "작성자와 다른 계열의 AI 에이전트"이기 때문입니다.
  - 참조 오라클은 결정 케이스에서 27/29에 그쳐 클린룸 구현(29/29)보다 낮았습니다. 이는 명세보다 오라클 쪽에 결함이 있다는 직접 증거입니다.

## 2. 기준별 점수 표

| 기준 | 가중치 | 단계 기대 | spec-auditor | standards-skeptic | security-redteam | repro-auditor | 중앙값 | 범위 | 불일치 | 중앙값−기대 | 주된 이유 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C1 문제 정당성·표현 적합성 | 15 | 2 | – | 1 (중) | – | – | 1 | 1–1 | 아니오 | −1 | PROV+ODRL+AuthZEN+ATMS 대안 프로파일이 오라클 9/9를 재현함. 반례 시나리오와 선행연구(ATMS, why-provenance, sticky policy) 비교가 없음. 7개 현실 상황 중 3개를 표현할 수 없거나 잘못 검증함 |
| C2 표준 경계·표면 최소성 | 8 | 3 | – | 2 (중) | – | – | 2 | 2–2 | 아니오 | −1 | 인가·전송·암호·신호 필드는 실제로 빠짐. 그러나 v0.2 오라클에 v0.1 정책 어휘가 하드코딩돼 있고, trust_domain은 실행 의미가 0이며, mode와 visibility가 중복되고, PROV와 겹치는 role/relation 어휘가 남음 |
| C3 명세 엄밀성·일관성 | 14 | 2 | 1 (중) | – | – | – | 1 | 1–1 | 아니오 | −1 | v0.2에 BCP 14 선언이 없고 대문자 MUST가 0회인데 README는 MUST를 씀. 산문에 없는 오라클 규칙 약 13개, 미정의 스키마 용어 약 15개. 투영 규칙과 verified_fact basis 규칙이 문서·오라클 사이에서 모순됨 |
| C4 의미론적 건전성 | 16 | 3 | 1 (중) | 2 (하) | 2 (중) | – | 2 | 1–2 | 아니오 | −1 | 주요 경로는 결정적임. opaque/unavailable 모드 우회, 자기 지지 순환, 수명주기 상태 기계 부재, support_sets 구문 정규화, 'unknown' 리터럴에만 적용되는 fail-closed |
| C5 추적성·오라클 독립성 | 13 | 3 | 1 (상) | – | 2 (하) | – | 1.5 | 1–2 | 아니오 | −1.5 | 요구→케이스 추적표가 없음. 변이 시험에서 wire 12/18, semantic 12/24가 생존. 추상 스위트가 동어반복적임(child_access 미사용, historical_lineage_preserved 상수 True) |
| C6 재현성·실행 상태 | 5 | 3 | – | – | – | 3 (상) | 3 | 3–3 | 아니오 | 0 | 세 워크플로의 모든 단계가 두 런타임 조합에서 통과하고 반복 실행 결과가 같음. 잠금 파일과 루트 .gitignore가 없고 python 숨은 결합이 있음 |
| C7 상호운용 증거 강도 | 6 | 1 | – | – | – | – | – | – | – | – | 채점한 역할이 없어 가중 점수에서 제외됨(5절 참고) |
| C8 보안·프라이버시·오용 저항 | 12 | 2 | – | – | 1 (상) | – | 1 | 1–1 | 아니오 | −1 | v0.2 위협 모델이 없음(v0.1 시기의 46줄 비매핑 목록뿐). 적대적 객체 22건이 스키마, run_wire.py, 참조 어댑터를 모두 통과함 |
| C9 클린룸 구현 가능성 | 7 | 2 | 2 (하) | – | – | – | 2 | 2–2 | 아니오 | 0 | 공개 15건은 산문만으로 통과할 수 있음. 산문에 없는 오라클 규칙, 투영 모순, digest 정렬 모호성이 남음 |
| C10 주장 정직성·저장소 일관성 | 4 | 3 | – | – | – | 3 (중) | 3 | 3–3 | 아니오 | 0 | 링크 107개 모두 유효하고 실험 단계 고지가 일관됨. 그러나 core §5의 "실행 가능한 커버리지" 주장이 과장이고, ROADMAP M4.6이 stale이며, 규범 키워드가 불일치함 |

집계 결과는 가중 1.5904, 기대 가중 2.4894, 게이트 통과, 게이트 치명 0건입니다.

## 3. 불일치 분석

집계 규칙상 불일치로 표시된 기준은 없습니다. 다만 범위가 1점인 C4와 C5는 근거를 비교해 둡니다. 나머지 기준(C1, C2, C3, C6, C8, C9, C10)은 채점자가 한 명뿐이라 교차 검증이 없습니다. 이 점수들은 한 역할의 판단에 기대고 있다는 점을 감안해야 합니다.

### C4 (spec-auditor 1 / standards-skeptic 2 / security-redteam 2, 중앙값 2)

- **관찰된 결함은 세 역할이 거의 같습니다.** 오라클 간 투영 모순(SA-03, SS-09, RT-3), 자기 지지 순환(SA-04, RT-6), 수명주기 공백(SA-05, RT-8), 제한 우회(SA-01, SS-04, RT-5)가 공통으로 나왔습니다.
- **1점 쪽 근거(spec-auditor).** core 5.4(opaque 허용)와 5.6/5.7(제한 비소실)이 충돌한다는 점을 "불변식 간 충돌"로 봤습니다. 핵심 불변식들이 충돌하지 않는다는 논증도 없다고 지적했습니다.
- **2점 쪽 근거(standards-skeptic, security-redteam).** 추상 오라클의 주요 경로(투영, 지원 집합 무효화, 제한 교집합, 승격 차단)는 결정적이고, 결함은 엣지와 와이어 수준에 몰려 있다고 봤습니다.
- **판단: 2가 더 잘 뒷받침됩니다.**
  - C4의 2점 앵커는 "주요 경로는 결정적, 엣지에서 미정의"이고 관찰된 현상과 맞습니다.
  - 교차 검증기가 SA-01, SA-04, SA-05를 모두 "draft 범위의 미정의 영역"이라는 이유로 높음에서 중간으로 낮췄습니다. 불변식이 직접 깨진 것은 아니라는 판단입니다.
  - 다만 standards-skeptic의 확신도는 '하'(부수 증거)이고 spec-auditor의 SA-01 지적은 검증에서 사실로 확인됐습니다. 따라서 2는 하한에 가까운 2로 읽어야 합니다.

### C5 (spec-auditor 1 / security-redteam 2, 중앙값 1.5)

- **1점 쪽 근거(spec-auditor, 확신도 상).**
  - 직접 만든 추적표: 산문 요구 30개 중 wire/공개 수준에서 양성·음성이 모두 시험된 것 11, 추상 스위트 전용 약 10, 미시험 7.
  - 변이 시험: wire 12/18 생존, semantic 12/24 생존. 교차 검증(SA-02 confirmed)에서 같은 수치가 재현됐습니다.
  - repro-auditor는 C5를 채점하지 않았지만 독립 변이 시험(RA-2)에서 19개 중 13개 생존이라는 같은 결과를 냈습니다.
- **2점 쪽 근거(security-redteam, 확신도 하).** 추적표와 변이 시험 없이 "보조 관찰"로 매겼다고 스스로 밝혔습니다.
- **판단: 1이 확실히 더 잘 뒷받침됩니다.** 서로 독립인 증거 세 갈래(spec-auditor 변이 시험, 검증기 재실행, repro-auditor 변이 시험)가 모두 1을 가리킵니다. 중앙값 1.5는 근거가 약한 쪽의 점수 때문에 올라간 값입니다.

### 단일 채점 기준 중 클린룸 결과와 대조할 수 있는 것: C9

spec-auditor는 확신도 '하'로 2를 주며 "명세에서 도출한 보류 케이스는 구현마다 갈라질 것"이라고 예측했습니다. 실제 충돌 시험은 이 예측과 일부만 맞았습니다.

- 클린룸 구현은 보류 결정 케이스 29/29로 기대값과 일치했습니다.
- 갈라진 것은 구현과 오라클이었습니다(결정 케이스 2건).
- 모호 12건이 보고됐고, 그중 투영 규칙은 예측대로 미결정 케이스에서 기대값과 갈렸습니다.

따라서 C9=2를 뒤집을 근거는 없습니다. 다만 "명세만으로 구현 가능"(implementable_from_spec=true)이라는 결과가 나왔으므로 C9의 주된 위험은 구현 불가능이 아니라 모호성입니다.

## 4. 통합 발견 목록

검증 상태 표기는 다음과 같습니다.
- confirmed: 교차 모델 검증에서 재현됨
- 미검증: 높음/치명이 아니어서 검증 대상이 아니었음

최종 심각도는 검증기의 조정값을 우선했습니다. 검증기끼리 의견이 갈린 경우에는 근거를 적었습니다.

### 높음

**A-01. 참여자 투영 규칙(target ⊆ source)이 두 오라클과 문서 사이에서 모순됨**
- 출처와 검증:
  - SA-03: confirmed, 높음→중간
  - RT-3: confirmed, 높음 유지
  - SS-09: 미검증
  - 클린룸: 모호 #3, 보류 케이스 `reject-source-subset-of-target-even-with-basis`
- 최종 심각도: **높음**. 두 검증기가 갈렸습니다. 높음을 택한 이유는 세 가지입니다.
  - RT-3 검증기가 `semantic-cases.json`의 `projection-target-not-in-source`(expected false)와 동등한 wire 객체가 wire 오라클에서 수락됨을 추가로 확인했습니다.
  - 독립 클린룸 충돌 시험에서도 이 지점이 실제로 갈렸습니다.
  - README가 가장 강하다고 내세우는 불변식에 해당합니다.
- 증거:
  - run.py:29-30은 target⊄source이면 basis가 있어도 거부합니다. run_wire.py:62-67은 basis만 있으면 수락합니다.
  - 프로브 P2({A,C}→{A,B}+basis), P11({A,B,C}→{A,D}), 02({A,B}→{A,B,C})가 모두 wire에서 수락됐고, 추상 오라클은 False를 냈습니다.
  - docs/semantic-scenarios-v0.2.md:34(비규범)는 ⊇를 필요조건으로 둡니다. wire:176과 core:97(규범 초안)은 basis만 요구합니다.
  - 다중 증거일 때 ⊇를 개별 증거 기준으로 볼지 합집합 기준으로 볼지가 정의되지 않았습니다.
- 권고: core §4.2/§5.2에서 ⊇ 필요조건과 다중 증거 판정 단위를 확정하고, 두 오라클을 맞추고, target⊄source+basis 음성 케이스를 wire와 공개 팩에 추가합니다. 추상 오라클과 wire 오라클을 교차 검증하는 테스트도 둡니다.

**A-02. derived 모드에서 evidence 배열을 생략하면 참여자 범위 검사가 꺼지고, projection_basis_ref는 존재 여부만 검사됨**
- 출처와 검증:
  - SS-03: confirmed, 높음 유지
  - RT-2: confirmed, 높음→중간
  - RA-3: 미검증, 중간
- 최종 심각도: **높음**.
  - SS-03 검증기는 공식 케이스 `derived-independent-support` 자체가 source_participants를 전혀 선언하지 않은 채 통과한다는 점, 그리고 무관한 evidence 목록도 수락된다는 점(P1d)을 추가로 확인했습니다.
  - RT-2 검증기는 opaque 모드도 원래 참여자 검사를 받지 않으므로 공격자의 추가 이득이 작다며 중간으로 봤습니다.
  - 그래도 높음을 택한 이유는 opaque를 선언하지 않은 정직한 구현에서도 검사가 실행되지 않기 때문입니다.
- 증거:
  - run_wire.py:62-67은 provenance.evidence만 순회합니다. Dependency 스키마(181-195)에는 참여자 필드가 없습니다. support_set ref가 evidence로 해석되는지는 검사하지 않습니다(100-111).
  - 프로브 P1, attacks/01은 ACCEPTED, 대조군 P1b와 01b는 REJECTED였습니다.
  - projection_basis_ref='basis:trust-me' 또는 'x'를 넣어도 수락됐습니다(01c, RA-3 프로브). 반면 verification_basis_refs는 해소를 요구해 두 기준이 비대칭입니다.
- 권고: derived 모드의 material evidence 의존을 provenance.evidence(source_participants 포함)로 해소하도록 강제합니다. 그렇지 않으면 opaque/unavailable을 명시하게 합니다. projection_basis_ref는 같은 객체 안에서 해소 가능한 참조로 제한하고 해소 실패는 fail-closed로 처리합니다. 음성 케이스를 추가합니다.

**A-03. 변이 시험에서 검증기 규칙 상당수가 어떤 케이스로도 잡히지 않음**
- 출처와 검증:
  - SA-02: confirmed, 높음 유지
  - RA-2: 미검증, 중간
- 최종 심각도: **높음**.
- 증거:
  - run_wire.py의 errors.append 19곳을 하나씩 무력화하자 13곳이 생존했습니다. L78은 등가 변이이므로 실질 생존은 12곳입니다.
  - 생존 규칙: L46·L48 카디널리티, L57 evidence_ref 유일성, L74, L84, L98 support_sets 필수, L107/109/111 support set 구성원 제약, L120 identity 물질화, L130 material policy 보존, L148.
  - 잡힌 규칙은 L50, L65, L104, L138, L143, L150의 6개뿐입니다.
  - semantic 쪽: spec-auditor 기준 12/24 생존, 검증기 재실행 기준 7개 중 6개 생존. 목적 교집합, retention 최소값, training deny, declassification이 생존했습니다. 공개 팩이 추가로 잡은 것은 L50 하나뿐입니다.
- 권고: 생존한 규칙마다 음성 케이스를 최소 1개씩 wire-cases와 공개(또는 보류) 팩에 추가하고, CI에 변이 시험을 넣어 생존 0을 목표로 둡니다.

### 중간

**A-04. 정책, identity, support_set 검사가 모두 `mode == "derived"` 안에만 있어 opaque/unavailable 모드로 우회됨**
- 출처와 검증:
  - SA-01: confirmed, 높음→중간
  - RT-7 일부: 미검증
- 최종 심각도: 중간. 검증기는 core 5.4가 opaque를 명시적 탈출구로 허용하고 wire §10이 "derived assertion"에 한정된다는 점을 들어 명세 경계가 모호한 문제로 봤습니다.
- 증거:
  - 같은 객체가 derived 모드에서는 'support_set references unknown dependency'와 'material policy dependencies are not preserved'로 거부됩니다. mode만 opaque나 unavailable로 바꾸면 accepted=True입니다(P7, P7b, 대조군 P7c).
  - P8(evidence 모드, identity 미물질화)과 RT 06c(opaque, identity:ghost)도 수락됐습니다.
  - 스키마 236-245는 비-derived 모드에서 derivation을 금지하지 않습니다.
  - 공개 팩에서 derivation이 있으면서 mode가 derived가 아닌 케이스는 0건입니다.
- 권고: derivation이 있으면 mode와 무관하게 검사를 적용하거나, 비-derived 모드에서 derivation을 스키마로 금지합니다. "opaque 계보에서도 policy_refs는 지울 수 없다"는 규칙을 core §5에 명시합니다.

**A-05. evidence 수준 policy_refs가 단언으로 전파되지 않아도 통과함(제한 상속이 와이어에서 축소됨)**
- 출처와 검증:
  - SS-04: confirmed, 높음→중간
  - RT-5: confirmed, 높음→중간
  - 클린룸: 모호 #7, 보류 케이스 `reject-evidence-restriction-silently-dropped`
- 최종 심각도: 중간.
- 증거:
  - P3, P3b, 04a는 evidence.policy_refs가 단언 policy_refs에 없어도 ACCEPTED였습니다. 04b(policy 의존을 material=false로 표기)와 04c(상충하는 policy_refs)도 ACCEPTED였습니다.
  - run_wire.py:122-133은 derived 모드의 material policy 의존만 봅니다.
  - 검증기 반론: wire:283이 요건을 "material policy dependency 유지"로 한정한 것은 문서화된 의도입니다. evidence.policy_refs는 같은 객체 안에 남아 있습니다. 다만 외부 계약 digest에서는 빠집니다.
  - 클린룸 충돌에서 구현은 확장 해석으로 거부했고 오라클은 수락했습니다. 이는 spec_ambiguity로 분류됐습니다.
- 권고: evidence.policy_refs가 단언 policy_refs(또는 material policy 의존)로 전파되어야 하는지 core/wire에서 확정하고, 결정한 대로 음성 케이스를 추가합니다. policy 의존의 material=false를 허용할지도 결정합니다.

**A-06. fail-closed가 리터럴 'unknown'에만 적용되어 미지의 네임스페이스 scope_type과 provider_defined가 통과함(오라클이 core §5.11과 불일치)**
- 출처와 검증:
  - RT-10: confirmed, 높음→중간. 검증기는 이 부분을 "실질 결함"으로 지목했습니다.
  - SA-11 일부, SS-07 일부: 미검증
  - 클린룸: 모호 #2, 보류 케이스 `reject-unsupported-namespaced-scope-type`
- 최종 심각도: 중간.
- 증거:
  - run_wire.py:45-50은 bilateral, group, unknown만 분기합니다.
  - P13/P9 'x-acme:secret-circle'/'x-vendor:everyone-in-org'와 P13b/P9b provider_defined(참여자 4명)가 카디널리티 검사도 없이 수락됐습니다.
  - 충돌 시험에서 클린룸 구현은 core §5.11에 따라 거부했고(기대값과 일치), 오라클은 수락했습니다. 오라클이 결정 케이스에서 틀린 2건 중 하나입니다.
- 권고: 미지원 네임스페이스 scope_type은 대응하는 required_extension 선언 없이는 거부합니다. provider_defined와 organization_mediated의 의미와 카디널리티를 정의합니다.

**A-07. verified_fact basis 규칙이 약하고 두 오라클이 서로 다름**
- 출처와 검증:
  - RT-4: confirmed, 높음→중간
  - SA-08: 미검증, 중간
  - 클린룸: 모호 #6
- 최종 심각도: 중간.
- 증거:
  - run_wire.py:135-138은 참조가 해소되는지만 봅니다.
  - unknown/opaque_ref 근거(03a), material=false policy 의존(03b, P9b), policy 참조(P9)를 basis로 쓴 verified_fact가 모두 수락됐습니다.
  - run.py:108-110은 입력이 전부 verified_fact이면 basis 없이 허용합니다. 이는 산문(core:160)과 스키마(69-77)의 무조건 요구와 다르고, 이 예외를 지운 변이도 생존했습니다.
  - 검증기 반론: core §4.5의 "basis/policy" 문구를 보면 policy 근거가 의도된 것일 수도 있습니다. 'rumor' 지적은 추상 테스트 표현을 잘못 읽은 것에 가깝습니다. 실질 결함은 non-material 의존을 근거로 허용하는 것이 §5.8과 정합하지 않는다는 점입니다.
- 권고: basis를 material evidence/assertion 의존으로 한정할지 명시합니다. semantic 오라클의 verified→verified 예외는 산문에 넣거나 삭제합니다. 둘 다 음성 케이스를 추가합니다.

**A-08. 자기 지지 순환 단언이 수락되고 근거를 모두 제거해도 무효화되지 않음**
- 출처와 검증:
  - SA-04: confirmed, 높음→중간
  - RT-6: 미검증, 중간
  - 클린룸: 모호 #8(구현은 확장 해석으로 자기 의존을 거부)
- 최종 심각도: 중간.
- 증거:
  - P21과 attacks/05(dependency_ref == assertion_id, support_sets=[[self]])가 ACCEPTED였습니다.
  - 근거 A, B를 제거해도 dependency_invalidation_result가 recompute, current_support_exists=True를 돌려줬습니다.
  - 상호 supersession(j↔k)도 양쪽 모두 오류 없이 통과했습니다.
  - run_wire.py:140-143은 assertion_relations의 자기 참조만 막습니다.
- 권고: dependency_ref == assertion_id를 즉시 금지합니다. 지지 그래프 비순환 요구, 순환 시 fail-closed, 상호 supersession 판정 규칙을 core에 둡니다.

**A-09. 수명주기 상태 기계가 없음(전이 표, 제한성 순서, 시간 유효성, 철회 후 노출이 모두 미정의)**
- 출처와 검증:
  - SA-05: confirmed, 높음→중간
  - RT-8: 미검증, 중간
- 최종 심각도: 중간.
- 증거:
  - core:223-235와 wire:303-317은 상태 7개를 나열하기만 합니다.
  - 다음이 모두 수락됐습니다: valid_from 2027 > valid_until 2020인 active(P11, 07b), 만료된 active(P11b), 관계 없는 superseded(07c), 같은 대상에 supersedes와 conflicts_with 동시 선언(07d, P16), statement와 visibility=full을 그대로 지닌 revoked(07a).
  - 케이스 35건의 상태 분포는 active 32, disputed 3이고 나머지 5개 상태는 한 번도 나오지 않습니다.
- 권고: 전이 표와 제한성 격자를 정의하고 valid_from ≤ valid_until을 검사합니다. revoked/invalidated 상태의 노출 형식(tombstone)을 정의하고, 사건 순서를 바꿔도 같은 최종 상태에 이르는지 시험하는 다중 사건 케이스를 추가합니다.

**A-10. v0.2 위협 모델이 없음**
- 출처와 검증: RT-1, confirmed, 높음→중간
- 최종 심각도: 중간. 검증기는 ROADMAP M5가 사실상 위협 초점 목록 역할을 하고 있으며 이는 프로세스 결함이라는 이유로 낮췄습니다.
- 증거:
  - docs/threat-and-rights-model.md는 46줄, 비규범이고 v0.2 필드·불변식·테스트와 매핑되지 않습니다.
  - v0.2 문서에서 threat를 grep하면 분류 라벨 2건만 나옵니다.
  - SECURITY_PRIVACY_REVIEW_CHECKLIST.md는 v0.1 대상입니다(SecureEnvelope, JOSE 중심). ROADMAP M5 체크박스는 전부 미체크입니다.
- 권고: 위협ID, 공격자 능력, 관련 와이어 필드와 불변식, 막는 테스트(없으면 갭)를 담은 v0.2 위협 매트릭스를 만들고, 체크리스트를 ContextAssertion 기준으로 다시 씁니다.

**A-11. 기존 표준 조합이 실패한다는 반례가 없고 선행연구 비교도 없음**
- 출처와 검증: SS-01, confirmed, 높음→중간
- 최종 심각도: 중간. 검증기는 9/9 재현이 오라클을 다른 어휘로 옮겨 적은 순환적 결과라는 점, 그리고 ODRL 접기 규칙은 평가자가 직접 짜 넣은 것이며 그것이 바로 RCP가 고유하다고 주장하는 합성 규칙이라는 점을 지적했습니다. 또 저장소의 주장 범위가 좁다는 점도 들어 낮췄습니다.
- 증거:
  - counter_profile.py는 'matched 9 of 9'를 출력했습니다.
  - ATMS, JTMS, semiring, why-prov, nanopub, hadPrimarySource, wasInvalidatedBy, sticky를 git grep 한 결과는 0건입니다.
  - 대안이 실패한다는 논증은 README:98-114와 reconciliation:54,143의 산문뿐입니다.
- 권고: 고유 개념마다 "기존 표준 프로파일 픽스처 + RCP가 다른 결과를 내는 케이스"를 추가합니다. 만들 수 없는 개념은 프로파일로 내립니다. reconciliation에 ATMS/JTMS, provenance semiring, sticky policy/IFC, nanopub, VC 상태 목록, ECO 비교 절을 추가합니다.

**A-12. 비독립 근거(같은 출처의 사본)를 독립 support 경로로 선언할 수 있음**
- 출처와 검증: SS-02, confirmed, 높음→중간
- 최종 심각도: 중간. 검증기는 "불가능"이라는 표현이 과장이라고 봤습니다. Provider가 joint로 선언하면 invalidate가 나오고, 사본을 assertion 의존으로 모델링하는 우회도 있기 때문입니다.
- 증거:
  - [[mail],[crm]]에서 mail을 제거하면 recompute가 나옵니다. hadPrimarySource를 반영한 평가는 invalidate를 냈습니다.
  - Dependency와 EvidenceReference에는 공통 출처나 독립성 필드가 없습니다. had_primary_source를 넣으면 스키마가 거부합니다. 초기 문서에 있던 independent_of 후보는 v0.2 wire에서 빠졌습니다.
- 권고: 원본 참조나 독립성 선언 수단, 무효화 시 원본 폐쇄(closure)로 전파하는 규칙, 음성 케이스를 추가합니다.

**A-13. 표현 적합성 공백(당사자별 의무, 부분 대체, 다중 관계, 시간에 따른 참여자 변화, 등급형 불확실성)**
- 출처와 검증:
  - SS-06: confirmed, 높음→중간
  - SS-11: 미검증, 낮음, 판단
- 최종 심각도: 중간. 검증기는 extensions와 required_extensions로 구조 페이로드를 실을 수 있고(fail-closed 확인), refines나 전체 supersede로 우회할 수 있으며, "보편 관계 분류 비목표"가 문서화된 설계 결정이라는 점을 들어 낮췄습니다.
- 증거:
  - P5 participant role, P6 participant valid_from, P7 scope 배열, P8 supersedes fields가 모두 스키마에서 거부됐습니다. 2인 group은 의미 검사에서 거부됐습니다. statement는 문자열뿐입니다.
  - confidence 대체 경로는 선택 확장(정보 손실) 아니면 필수 확장(전체 거부)뿐입니다(P13).
- 권고: commitment 유형에 대해 obligor/obligee 역할, 참여자별 유효 구간, 부분 대체 대상 지정을 Core에 둘지 프로파일로 위임할지 결정합니다. 순서형 지지 강도나 공용 confidence 프로파일도 검토합니다.

**A-14. support_sets 의미가 미정임(구문 정규화, evidence 모드 미적용, 집합 밖 material 의존)**
- 출처와 검증:
  - SA-10: 미검증, 중간
  - SS-10: 미검증, 중간
  - 클린룸: 모호 #5
- 최종 심각도: 중간.
- 증거:
  - [[A,B],[B,A]]와 [[A],[A,B]]가 수락되고 digest에 비최소 형태가 그대로 남습니다(P3, P3b).
  - 어느 support set에도 없는 material 지지 의존 B가 수락됩니다(P4).
  - support_sets=[[A],[Z]]에서 근거 목록에 없는 Z가 생존 근거로 쓰입니다.
  - evidence 모드에서는 support_sets를 둘 수 없습니다(P2b: 'must not carry derivation semantics').
  - 오라클의 support_sets 규칙(run_wire.py:101-110)은 클린룸 구현보다 엄격하지만 보류 케이스로 시험되지 않았습니다.
- 권고: 중복 제거, 흡수 법칙 최소화, material 지지 의존의 소속 요구를 정하고, evidence 모드의 기본 AND/OR 규칙을 정의합니다. 오라클의 엄격한 support_sets 규칙을 산문에 올리고 보류 케이스로 시험합니다.

**A-15. 산문에 없는 오라클 규칙 약 13개와 미정의 스키마 용어 약 15개**
- 출처와 검증:
  - SA-06: 미검증, 중간
  - 클린룸: 모호 #1(group 하한), #4(actor 동일성 키), #9(중복 선언)
- 최종 심각도: 중간.
- 증거:
  - 산문에 없는 규칙: 카디널리티(run_wire.py:45-48), evidence_ref 유일성, evidence 모드 derivation 금지, SUPPORT_ROLES, actor 동일성 = (scope, id, type), run.py:69-101 정책 격자 등.
  - 산문에 정의가 없는 스키마 용어: visibility(필수 필드), derived_from, valid_from/valid_until, reason_refs, provider_ref, occurred_at, organization_mediated, provider_defined 등.
  - 이 목록은 A-03의 생존 규칙과 거의 겹칩니다.
- 권고: run_wire.py의 각 규칙에 core/wire 조항 ID를 붙여 산문으로 승격하거나 삭제합니다. 모든 스키마 필드와 열거값을 정의하고 'material'의 판정 기준도 정의합니다.

**A-16. v0.2 명세에 규범 키워드 체계가 없음**
- 출처와 검증:
  - SA-07: 미검증, 중간
  - RA-5: 미검증, 낮음
- 최종 심각도: 중간. C3 기준이 이 차이의 영향을 판단하라고 명시하고 있기 때문입니다.
- 증거:
  - core-v0.2: 대문자 MUST 0, 소문자 must 9. wire: MUST 0, must 3. README: MUST 8(87-94행, 같은 불변식).
  - core-v0.1: spec-auditor 집계로 MUST 99, repro-auditor 집계로 대문자 키워드 118. 집계 방식이 달라 수치가 다릅니다.
  - RFC 2119, RFC 8174, BCP 14는 저장소 전체에서 0건입니다.
- 권고: v0.2 core/wire에 BCP 14 선언을 추가하고, 적합성 요구 문장에만 대문자 키워드와 요구 ID를 붙입니다. README는 그 ID를 인용하거나 "후보·비규범"으로 낮춥니다.

**A-17. 추상 semantic 스위트가 동어반복적이고, core §5 "실행 가능한 커버리지" 주장이 과장임**
- 출처와 검증:
  - SA-09: 미검증, 중간
  - RA-1: 미검증, 중간
- 최종 심각도: 중간.
- 증거:
  - source_access_allowed는 child_access를 읽지 않습니다(grep 결과 0행).
  - historical_lineage_preserved는 상수 True입니다(run.py:65). 따라서 5.9는 실패할 수 없습니다.
  - 5.1과 5.12에는 대응 케이스가 없습니다.
  - 입력이 explicit_projection_basis 같은 불리언입니다.
  - semantic 정책 필드는 wire 스키마에 없습니다.
  - 케이스 JSON에 requirement 참조 필드가 0개입니다.
- 권고: §5 도입 문장을 불변식별 상태표(커버됨/부분/없음)로 바꿉니다. 케이스에 요구 ID와 도출 근거를 붙이고, 추상 범주를 wire 객체와 다중 사건 시퀀스로 다시 표현합니다.

**A-18. 외부 클린룸 계약(공개 팩, digest)의 탐지력이 단일 객체 수준에 그침**
- 출처와 검증:
  - RA-9: 미검증, 중간
  - RT-12: 미검증, 낮음
- 최종 심각도: 중간.
- 증거:
  - 공개 15건은 모두 단일 ContextAssertion의 수락/거부 판정입니다. 부분 소스 무효화, 정책 단조성, 도착 순서 같은 31개 시나리오는 어댑터에 전달되지 않습니다.
  - digest에는 evidence 단위 source_participants/policy_refs, visibility, 타임스탬프가 빠집니다.
- 권고: 상태 전이와 다객체 케이스를 계약에 추가하거나, M4.6의 성공 주장을 "와이어 객체 검증 표면"으로 한정합니다. 보안 관련 거부 케이스를 보류 팩에 추가합니다.

**A-19. 테넌트 간 신원 상관: trust_domain과 참여자 scope의 정합성이 검사되지 않음, actor 동일성 미정의**
- 출처와 검증:
  - RT-7: 미검증, 중간
  - SA-11 일부, SS-07 일부: 미검증
- 최종 심각도: 중간.
- 증거:
  - alice@t1과 alice@t2를 identity 의존 없이 한 단언에 넣은 06a가 수락됐습니다.
  - trust_domain 불일치(06b, P1b, P10)도 수락됐습니다.
  - (A,t1,person)과 (A,t1,agent)를 bilateral로 둔 P1도 수락됐습니다.
  - grep 결과 trust_domain은 run_wire.py:169의 정규화에만 쓰입니다.
- 권고: actor 동일성 키를 산문으로 정의하고, 참여자 scope가 여럿이면 모든 모드에서 material identity_binding을 요구합니다. trust_domain 정합 규칙을 정의하거나 trust_domain을 제거합니다.

**A-20. provenance.visibility가 실제 노출 필드와 연동되지 않고 mode와 중복됨**
- 출처와 검증:
  - RT-9: 미검증, 중간
  - SS-07 일부: 미검증
- 최종 심각도: 중간.
- 증거:
  - visibility=hidden인데 source_participants {A,B,C}와 occurred_at을 노출한 08이 수락됐습니다. support_sets 구조를 노출한 10도 수락됐습니다.
  - 모순 조합 P12(evidence+hidden)와 P12b(opaque+full+derivation 전체)도 수락됐습니다.
- 권고: mode와 visibility를 통합하거나 허용 조합 표를 둡니다. visibility 값마다 허용되는 필드를 정의하고 위반을 거부합니다.

**A-21. v0.2 의미론 오라클에 v0.1 정책 어휘가 하드코딩돼 있음**
- 출처와 검증: SS-05, 미검증, 중간
- 증거:
  - run.py:69-101에 allowed_purposes, external_processing, training, retention_max_seconds가 있고, semantic-cases에 allowed_purposes가 7회 나옵니다.
  - v0.2 스키마에는 이 필드들이 없습니다.
  - 이는 core:239-249의 "정책 언어를 정의하지 않는다"는 선언과 모순됩니다.
- 권고: policy_projection 케이스를 ODRL/DPV 프로파일 예시로 옮기거나, 오라클 입력을 policy_refs와 외부 PDP 결과로 추상화합니다.

**A-22. Core의 관계·역할 어휘가 PROV와 중복되고 서로 구별되는 의미가 없음**
- 출처와 검증: SS-08, 미검증, 중간
- 증거:
  - SUPPORT_ROLES는 supports, corroborates, derived_from을 동일하게 취급합니다. refines는 실행 의미가 없습니다.
  - P16(supersedes+conflicts_with+supports 동시 선언)이 수락됐습니다.
  - projection_basis_ref의 "일반 대응 없음" 주장은 PROV Plan/hadPlan과 대조하면 부정확합니다.
- 권고: 구별 의미가 없는 값은 제거하거나 PROV 매핑으로 내리고, 모순되는 관계 조합을 거부하는 규칙을 추가합니다.

**A-23. 교차 객체 속성(근거 assertion의 epistemic class, 상호 순환, 철회 전파, 집계 추론)에 대한 적합성 계약이 없음**
- 출처와 검증: RT-11, 미검증, 중간, 판단
- 증거: semantic_errors는 단일 dict만 받습니다. wire §18은 그래프 규칙이 스키마 밖에 있다고 하지만 다객체 코퍼스는 없습니다.
- 권고: 위협 커버리지 매트릭스에 단일 객체 검증의 한계를 명시하고, 다객체 시나리오 적합성 계약을 신설합니다.

**A-24. 의존성 잠금이 없고 범위가 느슨함**
- 출처와 검증: RA-6, 미검증, 중간
- 증거:
  - package-lock, 루트 .gitignore, .nvmrc, .python-version이 없습니다.
  - jsonschema `>=4.23,<5`, MCP SDK `^2.0.0`이고 CI는 npm install을 씁니다.
  - MCP 2.0.0 설치에서 npm audit이 GHSA-6qxp-vccf-f47h(high)를 보고했습니다.
- 권고: lock 파일을 커밋하고 npm ci를 씁니다. Python 제약/해시 잠금, 버전 파일, actions SHA 고정을 추가합니다.

### 낮음

**A-25. digest support_sets 외곽 정렬 규칙이 모호함**
- 출처와 검증: SA-12(미검증), 클린룸 모호 #10
- 증거:
  - CONTRACT.md:125의 "JSON-array value" 문구가 모호합니다.
  - reference_adapter.py:52는 json.dumps 문자열로 정렬해, [['ev:a'],['ev:a b']]에서 배열 사전식과 다른 결과를 냅니다.
  - 비BMP 문자는 Python과 JS의 정렬 결과가 다릅니다.
- 권고: "Unicode 코드포인트 기준 배열 사전식"처럼 정확히 정의하고 경계 문자 케이스를 추가합니다.

**A-26. 숨은 결합과 비결정적 산출물**
- 출처와 검증: RA-7, 미검증
- 증거:
  - test-equivalence.mjs가 PATH의 python과 jsonschema를 요구합니다.
  - 고정 포트 45301-45305, 45390, 45501-45505를 씁니다.
  - demo trace와 하네스 보고서 해시가 실행마다 다릅니다. 판정 자체는 결정적입니다.
- 권고: python 선행 조건을 문서화하고, 포트를 0 또는 환경변수로 받고, 정규화 해시를 제공합니다.

**A-27. 저장소 stale 문서**
- 출처와 검증: RA-4, 미검증
- 증거:
  - ROADMAP:184-186의 M4.6 준비 항목 3개는 이미 존재하는데 미체크입니다(과소 주장).
  - reference/README.md가 stale합니다.
- 권고: 체크박스를 갱신하고 reference/README를 정리합니다.

**A-28. LICENSE와 보안 연락처 부재, PR/CI 외부 근거 미확인**
- 출처와 검증: RA-8, 미검증, 판단
- 증거:
  - git ls-files에 LICENSE가 없습니다.
  - SECURITY.md:31-33은 "전용 연락처 공개 전"이라고 적습니다.
  - M4.1~M4.6 커밋 제목에 PR 번호가 없습니다.
- 권고: 코드와 스펙 라이선스를 명시하고 보안 연락처를 게시합니다. PR 번호는 링크나 커밋 해시로 대체합니다.

### 반박된 발견

없습니다. 교차 검증을 받은 발견 15건(SA-01~05, SS-01~04, SS-06, RT-1~5, RT-10)은 모두 confirmed였습니다. 그중 SA-02, SS-03, RT-3을 뺀 12건은 심각도가 높음에서 중간으로 낮춰졌습니다. 낮춘 이유는 공통적으로 세 가지입니다.

- 비규범 draft 범위의 미정의 영역이다.
- Provider 자기 선언의 한계는 어떤 검사도 막을 수 없다.
- 문서가 이미 한계를 인정한 설계 선택이다.

일부 세부 주장은 검증에서 과장으로 판정됐습니다. 해당 항목의 본문은 그 판정을 반영해 서술했습니다.
- RT-4: 'rumor' 지적은 추상 테스트 표현을 잘못 읽은 것에 가깝다.
- RT-10: "빈 policy_refs = 무제한" 해석은 명세 어디에도 없다.
- SS-06: "표현 불가"는 확장 경로가 있어 과장이다.

## 5. 클린룸 결과

### 구현 개요
- TypeScript(Node 24.14.0, ajv 8 + ajv-formats 3)로 구현했습니다.
- 읽은 자료는 허용된 사본뿐입니다: 구현자 가이드, CONTRACT, core/wire 초안, 스키마, 시나리오, standards-boundary/reconciliation 문서, harness.py 앞 150줄, public.json.
- 감사에서 금지 참조 0건, import 대상 정상, 스키마가 바이트 단위로 동일함을 확인해 위반 없음으로 판정했습니다.
- 공개 15건은 첫 실행에서 15/15였고 디버깅 수정이 없었습니다. 따라서 공개 케이스에서 규칙을 학습한 사례는 없습니다.

### 증거 무결성 관련 주의
- **사전 존재 파일.** 작업 시작 시 cleanroom/impl/에 출처를 알 수 없는 파일이 이미 있었습니다. 구현 에이전트는 이를 읽지 않고 삭제한 뒤 처음부터 새로 작성했다고 보고했습니다. 출처는 확인할 수 없습니다.
- **이전 실행 산출물.** 충돌 디렉터리에 있던 이전 실행 산출물(다른 케이스 세트 ho-01~ho-32)은 old/로 옮겨졌습니다.
- **보류 팩 버전 문자열.** 하네스가 받는 버전 문자열에 맞추기 위해 내용이 같은 heldout-run.json을 따로 만들어 실행했습니다.

### 구현자가 보고한 모호 12건(분류별)

| 분류 | 건수 | 항목 |
|---|---|---|
| spec_ambiguity | 9 | group 인원 하한, provider_defined/organization_mediated 의미, actor 동일성 키, support_sets 참조 종류, verification_basis 해소 범위, material identity/policy 보존 조건(evidence policy 상속을 확장 해석), 자기 참조 범위(자기 의존 거부를 확장 해석), 중복/모순 선언, digest 외곽 정렬 |
| schema_prose_mismatch | 1 | source가 target을 포함하지 않는 경우(wire §6 대 시나리오 A) |
| standards_overlap | 1 | date-time format, required_extensions와 확장 타입의 관계 |
| other | 1 | 공개 케이스로부터 학습한 규칙 기록(해당 없음) |

12번째 항목은 모호라기보다 기록이므로 실질적인 모호는 11건입니다.

### 충돌 시험 집계
- 공개: 15/15, 계약 위반 0, case_error 0.
- 보류: 총 32건, 결정 29건, 미결정 3건.
  - 구현과 기대값 일치: 전체 31/32, 결정 29/29.
  - 오라클과 기대값 일치: 전체 29/32, 결정 27/29.
  - 둘 다 수락한 케이스에서 구현과 오라클의 semantic_digest는 모두 같았습니다.

### 불일치 3건과 분류

| 케이스 | 결정성 | 기대 | 구현 | 오라클 | 분류 | 의미 |
|---|---|---|---|---|---|---|
| reject-unsupported-namespaced-scope-type | 결정 | 거부 | 거부 | 수락 | implementation_defect (결함은 **오라클**) | run_wire.py:45-50이 리터럴 'unknown'만 거부해 core §5.11과 가이드:48을 위반함(A-06) |
| reject-evidence-restriction-silently-dropped | 결정(검증 에이전트는 이 라벨이 과대평가라고 판단) | 거부 | 거부 | 수락 | spec_ambiguity | 원칙(wire:281, core §5.6-5.7)과 검사 가능한 규칙(wire:283) 사이의 간극. 구현의 거부는 스스로 밝힌 확장 해석에 기댄 것임(A-05) |
| reject-source-subset-of-target-even-with-basis | 미결정 | 거부 | 수락 | 수락 | spec_ambiguity | 규범 wire:176은 basis만 요구하고, 비규범 시나리오:34는 ⊇를 요구함(A-01) |

CRITERIA 규칙에 따라 기대값과 오라클이 다른 2건(결정 케이스)은 구현 실패로 세지 않고 명세나 오라클 결함의 증거로 기록합니다. 두 번째 케이스를 미결정으로 재분류하더라도 구현의 결정 케이스 일치는 28/28로 그대로 100%입니다.

### 등급 A가 증명하는 것
- 공개 명세 사본만으로 독립 언어(TypeScript)의 단일 객체 검증기를 만들 수 있다는 것(implementable_from_spec=true).
- 그 검증기가 공개 팩과, 명세에서 도출한 보류 결정 케이스 전부와 일치한다는 것.
- CRITERIA상 BBB 이상, 곧 투자 등급입니다. 상호운용 증거로 인정되는 범위에 듭니다.
- 참조 오라클이 명세에서 벗어난 지점(A-06)과, 명세가 결정을 내리지 않은 지점(A-01, A-05)을 실제 충돌로 드러냈습니다.

### 등급 A가 증명하지 않는 것
- **제3자 구현(L3)이 아닙니다.** 다른 계열의 AI 에이전트가 같은 평가 파이프라인 안에서 만든 구현이고, 보류 팩도 같은 평가 안에서 작성됐습니다. 그래서 상한이 A입니다. C7은 이번 집계에서 채점되지 않았고, 이 종합에서도 점수를 새로 매기지 않습니다.
- **핵심 차별 의미론을 검증하지 않습니다.** 계약이 단일 객체 수락/거부와 digest뿐이어서 support_sets 무효화, 제한 상속 합성, 하류 재평가, 수명주기는 시험되지 않았습니다(A-18, A-23).
- **구현자들이 같은 결과를 낸다고 보장하지 않습니다.** 모호가 11~12건이고, 일부 일치는 구현자의 보수적 확장 해석(evidence policy 상속, 자기 의존 거부)에 기댔습니다. 다른 구현자가 다른 해석을 고르면 갈라질 수 있습니다.
- **테스트 충분성을 증명하지 않습니다.** 오라클의 더 엄격한 support_sets 규칙을 건드리는 보류 케이스가 없었습니다. 변이 생존 규칙(A-03) 대부분도 보류 팩이 시험하지 않았습니다.

## 6. 우선 조치 (외부 클린룸 연락 전)

1. **투영 규칙을 하나로 확정합니다(A-01).** core §4.2/§5.2에 ⊇ 필요조건 여부와 다중 증거 판정 단위를 명시합니다. run.py, run_wire.py, 시나리오 문서를 일치시키고 target⊄source+basis 음성 케이스를 추가합니다. 외부 구현자가 맨 처음 부딪힐 모순입니다.
2. **오라클이 명세를 어기는 곳을 고칩니다(A-06).** 미지원 네임스페이스 scope_type과 provider_defined를 fail-closed로 처리합니다. 오라클이 보류 결정 케이스에서 틀린 상태로는 외부 결과를 공정하게 판정할 수 없습니다.
3. **검사의 모드 의존성을 없앱니다(A-02, A-04).** derived 모드의 evidence 해소, 참여자 선언 강제, projection_basis_ref 해소를 요구합니다. derivation이 있으면 mode와 무관하게 정책, identity, support_set 검사를 적용합니다.
4. **제한 상속 범위를 결정합니다(A-05, A-07).** evidence.policy_refs 전파 여부, policy 의존의 material=false 허용 여부, verified_fact basis의 허용 종류를 산문으로 정하고 음성 케이스를 둡니다.
5. **산문에 없는 오라클 규칙을 정리합니다(A-15, A-16, A-25).** 각 규칙에 조항 ID를 붙여 산문으로 승격하거나 삭제하고, BCP 14 선언을 추가하고, 미정의 스키마 용어와 digest 정렬 규칙을 정의합니다. 클린룸 구현자가 보고한 모호 11건에 각각 답을 남깁니다.
6. **테스트가 규칙을 고정하게 합니다(A-03, A-17, A-18).** 생존 변이마다 음성 케이스를 추가하고, CI에 변이 시험을 넣고, 케이스에 요구 ID를 붙입니다. 공개 및 보류 팩에 보안 관련 거부 케이스를 추가합니다. 다객체 계약을 미룬다면 M4.6 주장을 "와이어 객체 검증 표면"으로 한정합니다.
7. **값싼 의미론 규칙을 먼저 추가합니다(A-08, A-09).** 자기 의존을 금지하고 valid_from ≤ valid_until을 검사합니다. 수명주기 전이 표는 최소한 "미정의"로 명시합니다.
8. **외부 참여 장벽을 없앱니다(A-28, A-24, A-27).** LICENSE와 보안 연락처를 게시하고, 의존성을 잠그고, ROADMAP M4.6을 갱신하고, core §5 커버리지 주장을 상태표로 고칩니다.
9. **v0.2 위협 매트릭스를 작성합니다(A-10, A-19, A-20, A-23).** 위협별로 필드, 불변식, 테스트, 갭을 매핑하고 단일 객체 검증의 한계를 명시합니다. 이 문서는 외부 보안 검토 요청의 전제 조건입니다.
10. **표준 대비 차별성을 문서화합니다(A-11, A-12, A-13, A-21, A-22).** 고유 개념마다 기존 표준 프로파일과 결과가 갈리는 케이스를 만들고, 선행연구 비교 절을 추가하고, v0.1 정책 어휘와 PROV 중복 어휘를 정리합니다. 클린룸 연락 자체를 막지는 않지만, 표준화 단체를 대상으로 한 연락 전에는 필요합니다.