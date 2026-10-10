# 평가 보고서: 재현성 감사자 / C6-C10 (1차 실행)

| 항목 | 값 |
|---|---|
| 평가자 | Sonnet 5.5, 재현성 감사자 |
| 유형 | agent |
| 대상 커밋 | `68026af` |
| 기준 버전 | CRITERIA v1.1 |
| 작성일 | 2026-10-10 |
| 교차 검증 | 높음 이상 발견 없음, 교차 검증 생략 |
| 실행 | 1차 실행. Fable 사용량 소진으로 중단된 실행에서 완료된 보고서. 2차 실행과 독립된 표본 |
| 생성 | `raw/run1-partial.json`의 구조화 출력을 변환 |

## 1. 요약

**한 줄 판정.** CI 세 워크플로의 모든 run 단계(28개)가 신규 클론에서 CI 버전(Python 3.12/Node 22)과 두 개의 더 새로운 조합(3.11/Node 24, 3.14/Node 26)에서 모두 통과했고 약 21초에 끝나 재현성은 높다. 반면 README·ROADMAP·core-v0.2의 '완료/executable coverage' 주장 중 일부는 과장되었거나 오래되었다: core §5의 13개 불변식 중 3개는 v0.2 테스트가 없거나 항상 참인 상수이고 5개는 일부만 시험되며, ROADMAP M4.6과 이슈 #19의 상태가 저장소 현실과 어긋난다.

**강점**

- C6: 신규 clone + 신규 venv에서 conformance.yml(14단계), reference-ecosystem.yml(9단계), semantic-v0.2.yml(7단계 + 독립성 grep 2개)이 모두 rc=0. Python 3.12.13/Node 22.23.3 합계 약 21초(wall).
- C6: 3.11/Node 24.14와 3.14.8/Node 26.4 조합에서도 28/28 통과. 런타임 버전 민감도는 관찰되지 않았다.
- C6: 외부 네트워크 의존은 pip/npm 설치뿐이다. 테스트 코드는 127.0.0.1 루프백 HTTP/stdio만 쓴다. jose·canonicalize·jwcrypto·rfc8785는 정확한 버전으로 고정되어 있다.
- C6: GitHub Actions 실제 기록(gh run list)에서 68026af의 'RCP Conformance'와 'RCP v0.2 Semantic Draft'가 success였다.
- C10: README·ROADMAP·spec/README·core-v0.2·wire-v0.2·하네스 README가 모두 비규범/실험 고지를 강하게 달고 있다. 작성자 오라클을 쓰는 reference_adapter는 '클린룸 증거 아님'이라고 명시하고, 하네스의 import 금지는 CI grep으로 강제한다.
- C10: 추적 중인 *.md 50개의 상대 링크 107개 중 깨진 것은 0개였다. 백틱 경로 참조도 실제 누락은 없었다(CONTRIBUTING.md의 provider-report.json은 산출물 이름, conformance/README.md의 /spec/…·/docs/…는 저장소 루트 기준 경로).
- C10: M0~M4.5의 ✅ 항목 대부분이 코드·테스트·PR로 뒷받침된다. PR #24/#26/#28/#30은 merged, 이슈 #23/#31은 존재한다. MCP SDK v2는 실제 2.3.1이 설치되어 MCP stdio 클라이언트의 readResource 경로를 실제로 쓴다.

**시급한 문제**

- core-v0.2-draft.md §5의 '다음은 executable coverage가 있다' 문장이 13개 불변식 전부에는 성립하지 않는다(RA-1, RA-2).
- ROADMAP M4.6 체크박스, 이슈 #19 상태, 문서의 '#19는 열려 있다'는 서술이 서로 모순이다. 또한 v0.2 클린룸 표면이 어느 진입 문서에도 연결되어 있지 않다(RA-3, RA-4).

## 2. 기준별 점수

| ID | 점수 | 확신도 | 근거 |
|---|---|---|---|
| C1 | N/A | N/A | 이 역할의 범위 밖이라 증거를 모으지 않았다. |
| C2 | N/A | N/A | 다루지 않았다. |
| C3 | N/A | N/A | 규범 언어 불일치(RA-5)만 관찰했다. 스키마와 Wire의 필드 대조는 하지 않아 점수를 매기지 않았다. |
| C4 | N/A | N/A | 다루지 않았다. |
| C5 | N/A | N/A | 불변식 대 케이스 매핑 일부(RA-1, RA-2)만 수행했다. 전체 추적표와 변이 시험은 하지 않았다. |
| C6 | 3 | 상 | 신규 clone에서 CI 3개 워크플로의 모든 run 단계가 CI 버전과 두 개의 더 새로운 조합에서 통과했고 21초 안에 끝났다. 네트워크는 설치 단계에서만 쓰이고 비결정성은 데모 산출물의 UUID/타임스탬프뿐이다(테스트 판정에는 영향 없음). 4점이 아닌 이유는 lockfile이 없고 npm install과 caret 범위를 쓰며 cryptography 등 전이 의존성이 고정되지 않았고(RA-7) CI 경로 필터, 고정 포트, .gitignore 부재 같은 위생 결함이 있기 때문이다(RA-8). |
| C7 | N/A | N/A | 다루지 않았다. |
| C8 | N/A | N/A | 다루지 않았다. |
| C9 | N/A | N/A | 다루지 않았다. 다만 v0.2 하네스는 단일 ContextAssertion 수락/거부만 시험한다는 점(RA-3)은 C9 평가자에게 참고가 된다. |
| C10 | 3 | 중 | 고지·한계 서술·링크 무결성·M0~M4.5의 ✅ 근거는 양호하다. 그러나 core §5의 'executable coverage' 문장이 13개 중 3개(5.1, 5.9, 5.12)에는 근거가 없고 5개(5.4, 5.5, 5.7, 5.8, 5.11)는 일부만 근거가 있다(RA-1, RA-2). 여기에 ROADMAP M4.6과 이슈 #19의 상태 불일치(RA-3, RA-4), 대문자 MUST와 소문자 must의 불일치(RA-5), 진입 문서의 v0.1 쏠림(RA-6)이 더해진다. 비규범 고지가 영향을 완화하므로 3점으로 두되, 경계선(2에 가까운 3)이다. |

## 3. 발견 사항

### RA-1: core-v0.2 §5의 'executable coverage' 문장이 불변식 13개 전부에는 성립하지 않는다

- 기준: C10, C5
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: spec/core-v0.2-draft.md:253 '다음은 executable coverage가 있고…'. 매핑한 근거: conformance/v0_2/semantic-cases.json(10개 범주 31건), conformance/v0_2/wire-cases.json(20건), conformance/v0_2/run.py, conformance/v0_2/run_wire.py. 명령: grep -ci 'rights' semantic-cases.json wire-cases.json run_wire.py → 0/0/0; grep -ci central → 0/0/0; grep -ci unavailable → 0/0/0. semantic-cases.json:97,116,141의 declassification_basis는 전부 false. wire-cases.json의 scope_type 'unknown' 케이스는 0건(external/v0_2/cases/public.json:377에만 있음).
- 내용: 불변식별 판정(근거가 있는 것만 지지로 계산). 지지(5): 5.2 참여자 붕괴 금지, 5.3 인식론적 승격 금지, 5.6 변환이 제한을 지우지 않음, 5.10 독립 지지 경로(단, '현재 정책이 허용할 때'라는 조건은 시험되지 않음), 5.13 전송 프레이밍. 부분 지지(5): 5.4 계보 연속성(material 정책/신원 의존성 보존은 run_wire.py에서 시험되나, 'opaque/unavailable 명시' 분기는 시험되지 않는다. opaque는 픽스처 모드로만 쓰이고 unavailable은 어디에도 없음), 5.5 자식 접근이 원본 접근을 주지 않음(오라클 source_access_allowed는 입력 플래그 두 개를 읽을 뿐 자식/원본 관계를 계산하지 않음), 5.7 보수적 상속(프로파일 정의 완화 분기는 한 번도 실행되지 않음), 5.8 의존성 변경(증거·신원 변경만 시험하고 정책·인가 근거 변경은 없음), 5.11 미지 범위 fail-closed(run_wire.py:49-50에 코드는 있으나 wire-cases.json에 케이스 없음; 하네스 public.json에만 있음). 근거 없음(3): 5.1 권리 확장 금지(v0.2 케이스 0건, 참조 생태계의 v0.1 permission-before-retrieval이 가장 가까움), 5.9 역사적 계보 불변(RA-2), 5.12 중앙 인프라 의존 금지(시험 불가능한 구조적 요구인데 'executable'로 분류됨).
- 권고: §5 문구를 '아래 불변식 중 X개는 실행 가능한 시험이 있고 나머지는 서술뿐'으로 바꾸거나, 불변식마다 케이스 ID를 연결한 표를 둔다. 5.1·5.9·5.12는 시험을 추가하거나 '미시험'으로 표시한다.

### RA-2: 5.9 '역사적 계보 불변'은 오라클이 항상 True를 반환하는 상수라 시험이 아니다

- 기준: C10, C5
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: conformance/v0_2/run.py:65 '"historical_lineage_preserved": True,'. dependency_invalidation 케이스 3건이 모두 기대값 True를 갖는다(grep -n historical_lineage conformance/v0_2/run.py → 65 한 줄뿐).
- 내용: dependency_invalidation_result()는 current_support_exists와 action만 입력에서 계산하고 historical_lineage_preserved는 입력과 무관하게 상수다. 이 값을 거짓으로 만드는 구현이나 입력이 존재할 수 없으므로 README의 '역사적 계보는 다시 쓰이지 않는다'(README.md:94)와 core 5.9는 이 스위트가 어떤 위반도 탐지하지 못한다. 같은 성격으로 arrival_order(run.py:153-156)는 케이스가 이미 explicit_supersedes 플래그를 주고 오라클이 그 불리언을 되돌려 줄 뿐이다.
- 권고: 계보 보존을 실제 상태(예: 재계산 전후의 lineage 레코드 비교)에서 계산하도록 오라클을 고치거나, 이 필드를 '미시험'으로 표기한다.

### RA-3: v0.2 클린룸 표면(M4.6 준비물)이 ROADMAP·README·spec README·core §10에 반영되지 않았고, 하네스는 생애주기 시나리오를 다루지 않는다

- 기준: C10, C9
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: ROADMAP.md:184-190의 M4.6 7개 항목이 전부 '[ ]'. 커밋 68026af 'M4.6: prepare v0.2 clean-room implementation harness'는 docs/IMPLEMENTER_GUIDE_V0_2.md, docs/INDEPENDENT_IMPLEMENTATION_REPORT_V0_2_TEMPLATE.md, conformance/external/v0_2/{CONTRACT.md,README.md,cases/public.json,harness.py,reference_adapter.py}를 추가했다. 명령: grep -rln 'IMPLEMENTER_GUIDE_V0_2\|external/v0_2' --include='*.md' --include='*.yml' . → docs/IMPLEMENTER_GUIDE_V0_2.md, .github/workflows/semantic-v0.2.yml, conformance/external/v0_2/README.md 세 곳뿐. grep -rn 'M4.6' --include='*.md' . → ROADMAP.md:178 하나. spec/README.md:149-151은 '독립적으로 검증된 v0.2 구현 대상이 아직 없다. 다음 단계는 외부 클린룸 구현'이라고 쓰고 가이드 링크가 없다. README.md의 'Executable evidence'(223-236행)와 core-v0.2 §10도 하네스를 언급하지 않는다.
- 내용: ROADMAP의 앞 세 항목(구현자 표면 공개, 참조 코드 없이 소비 가능한 스위트, v0.2용 보고서 템플릿)은 실제로 산출물이 존재하는데 미완료로 남아 있다(과소 주장). 또 어떤 진입 문서도 v0.2 가이드로 연결하지 않아 외부 구현자가 찾을 경로가 없다(RA-6). 게다가 '현재 의미론/와이어 스위트를 참조 코드 없이 소비 가능'이라는 항목은 일부만 충족된다: conformance/external/v0_2/cases/public.json의 15건은 모두 단일 ContextAssertion 수락/거부이고(CONTRACT.md operation은 evaluate_context_assertion 하나), 31건 시맨틱 시나리오(무효화·대체·조합·정책 투영·도착 순서·식별 변경)는 외부 구현이 접근할 방법이 없다. 이것들이 RCP의 핵심 가치인 하류 무효화와 수명주기다.
- 권고: ROADMAP에서 완료된 항목을 체크하고 '시맨틱 시나리오는 아직 외부 소비 불가'를 명시한다. README, spec/README, conformance/README, core §10에 IMPLEMENTER_GUIDE_V0_2로 가는 링크를 추가한다. 시나리오 계층의 외부 계약(예: evaluate_dependency_change)을 설계한다.

### RA-4: GitHub 이슈 #19가 'completed'로 닫혀 있는데 저장소 문서는 열려 있다고 하고 로드맵은 미완료로 둔다

- 기준: C10
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: 명령: gh api repos/papa-channy/RCP-Relationship-Context-Protocol/issues/19 → state=closed, state_reason=completed, closed_at=2026-10-08T17:31:11Z, title 'M4.6: Obtain first unrelated clean-room RCP v0.2 implementation'. conformance/external/v0_2/README.md 끝부분: 'Issue #19 remains open until an actual unrelated implementation supplies that evidence.' ROADMAP.md:178은 M4.6을 '← next external milestone'으로 둔다. README.md:245는 '독립 제3자 v0.2 구현: not established'.
- 내용: 이슈는 68026af 푸시 직후 1초 안에 닫혔다(CI 실행 시각 17:31:12Z). 이슈 제목은 '무관한 구현을 얻는다'인데 실제로는 무관한 구현이 없다. 문서는 일관되게 '아직 없다'고 말하므로 README의 서술은 정직하지만, 외부 추적기는 완료로 읽힌다. 하네스 README는 '열려 있다'고 단정하기 때문에 지금은 거짓이다. 이슈 상태는 저장소 밖 가변 정보라서 평가 시점의 관찰이다.
- 권고: 이슈를 다시 열거나 '하네스 준비' 이슈와 '실제 구현 획득' 이슈로 분리한다. 하네스 README의 단정 문장은 이슈 번호를 빼거나 상태와 맞춘다.

### RA-5: README는 v0.2 불변식을 대문자 MUST로 적지만 v0.2 명세는 소문자 must이고 RFC 2119 선언도 없다

- 기준: C10, C3
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: 명령: grep -o '\bMUST( NOT)?\b' | wc -l → README.md 8, spec/core-v0.1.md 99, spec/core-v0.2-draft.md 0, spec/wire-v0.2-draft.md 0. 소문자 must: core-v0.2 9, wire-v0.2 3. spec/core-v0.1.md:9에는 키워드 선언이 있고 v0.2 두 문서에는 RFC 2119/8174 선언이 없다. README.md:87-95 'RCP MUST NOT create rights…'는 core-v0.2:257 'RCP must not create rights…'와 같은 내용이다.
- 내용: README는 비규범 초안인 v0.2를 RFC 2119 어조로 제시하여 독자에게 규범적 요구처럼 읽히게 한다. 반면 명세 본문은 'non-normative design draft'(core-v0.2:3)라고 선언한다. 결과적으로 어느 쪽이 권위 있는지가 불분명하다. docs/IMPLEMENTER_GUIDE_V0_2.md와 하네스 README는 다시 대문자 MUST/MAY를 쓴다.
- 권고: README의 불변식 서술을 소문자나 '후보 불변식' 표현으로 낮추거나, v0.2 문서에 비규범 상태를 유지하는 한 키워드 비규범 선언을 한 줄 넣는다.

### RA-6: 기여/아웃리치 진입 문서가 아직 v0.1 Provider 하네스로 안내하고 #19를 v0.1 마일스톤으로 부른다 (v0.1/v0.2 혼동)

- 기준: C10
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: docs/outreach/IMPLEMENTATION_CHALLENGE.md:15,19,20은 spec/core-v0.1.md, docs/IMPLEMENTER_GUIDE.md, provider-harness-profile-v0.1.md를 읽으라고 하고 :5는 'Provider implementation'을 만들라고 한다. CONTRIBUTING.md:24,29,66도 v0.1 문서를 가리키며 이슈 #19를 추적처로 쓴다. docs/outreach/TECHNICAL_BRIEF.md:217은 'Preserved v0.1 clean-room milestone: Issue #19', 반면 docs/IMPLEMENTER_GUIDE_V0_2.md:130은 '## 9. Required evidence for Issue #19'.
- 내용: 같은 이슈 #19가 한 곳에서는 v0.1 클린룸, 다른 곳에서는 v0.2 클린룸이다. README와 ROADMAP은 다음 결정적 단계가 v0.2 클린룸이라고 하는데, 실제로 외부 구현자가 따라갈 아웃리치 문서는 v0.1 Provider 구현 챌린지다. 어느 쪽 결과가 들어와도 증거 해석이 모호해진다.
- 권고: IMPLEMENTATION_CHALLENGE와 CONTRIBUTING에 v0.2 챌린지 경로를 추가하고, #19의 범위를 한 가지로 정리한다.

### RA-7: 의존성 고정이 불완전하다: lockfile 없음, npm install, caret 범위, 전이 의존성 미고정

- 기준: C6
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: find . -name package-lock.json -not -path '*/node_modules/*' → 없음(git ls-files에 lockfile 0개). conformance/requirements.txt: 'jsonschema[format]>=4.23,<5'(설치 결과 4.26.0). bindings/v0_2/package.json: '@modelcontextprotocol/client' '^2.0.0', server '^2.0.0', zod '^4.0.0'(설치 결과 2.3.1, 4.6.5). implementations/python-probe/requirements.txt는 jwcrypto==1.6.1, rfc8785==0.1.4만 고정하고 전이 의존성 cryptography는 50.0.2가 설치됨. 워크플로는 모두 'npm install'(npm ci 아님). 반대로 crypto/external/reference-ecosystem은 jose 6.2.12, canonicalize 5.1.0을 정확히 고정했다.
- 내용: 오늘은 통과하지만, 2026-10-10에 해석된 2.3.1이 아닌 다른 MCP SDK 2.x가 나오면 같은 커밋이 다른 결과를 낼 수 있다. 특히 v0.2 바인딩 증명은 SDK v2 마이너 릴리스에 가장 민감하다. CI에 schedule(cron) 트리거가 없어 드리프트가 다음 푸시까지 숨는다.
- 권고: 각 npm 디렉터리에 package-lock.json을 커밋하고 CI에서 npm ci를 쓴다. Python은 pip-compile 등으로 전이 의존성까지 고정한 요구 파일을 둔다. 주간 cron으로 최신 의존성 해석을 시험한다.

### RA-8: CI/실행 위생: 경로 필터 공백, 고정 포트, .gitignore 부재, 데모 산출물 비결정

- 기준: C6
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증
- 근거: (a) .github/workflows/conformance.yml은 reference-ecosystem/**와 bindings/**를 paths에 두지 않지만 'Install reference Provider dependencies for harness self-test'로 reference-ecosystem을 설치해 하네스 self-test를 돌린다. reference-ecosystem.yml은 conformance/external/**와 spec/**를 paths에 두지 않는다. semantic-v0.2.yml은 conformance/requirements.txt를 설치하지만 그 파일이 paths에 없다(conformance/v0_2/**만). (b) reference-ecosystem/tests/*.mjs는 45401-45505, 45580, 45590 같은 포트를 하드코딩. 포트 45403을 점유한 채 npm run test:policy → 'Error: service did not become healthy: http://127.0.0.1:45403/health'로 28초 후 실패(큰 소리로 실패하므로 오탐은 없음). (c) 저장소에 .gitignore가 없다: 전체 단계 실행 후 git status --short가 node_modules/, package-lock.json, __pycache__/, conformance/external/v0_2/out/, reference-ecosystem/out/ 등을 미추적으로 표시. (d) 데모를 두 번 실행하면 canonical-brief.txt는 동일하나 canonical-trace.json은 generated_at, resolution_id, claim_id(UUID), issued_at이 달라 cmp 실패.
- 내용: (a)의 결과로 reference-ecosystem 변경이 하네스 self-test를 깨뜨려도 PR에서 잡히지 않을 수 있다. (b)는 병렬 실행·공유 CI 러너에서 취약. (d)는 테스트 판정에는 영향이 없고(브리프는 결정적) 산출물 해시 비교 용도로만 쓸 수 없다는 뜻이다. 어느 것도 현재 통과 결과를 뒤집지는 않는다.
- 권고: paths 필터를 교차 의존성에 맞게 넓히거나 하나의 워크플로로 합친다. 포트를 0(임의 할당)으로 받도록 하고, .gitignore를 추가하며, 트레이스의 비결정 필드를 정규화한다.

### RA-9: 바인딩 동등성 증명은 두 서버가 같은 정적 JSON 파일을 내보낸다는 점에서 주장 범위가 좁고 README 문구가 이를 넘어선다

- 기준: C10, C5
- 심각도: 낮음
- 구분: 판단
- 교차 검증: 미검증
- 근거: bindings/v0_2/test-equivalence.mjs: MCP stdio 서버(mcp-server.mjs)와 HTTP 서버(http-server.mjs)가 같은 bindings/v0_2/assertion.json을 반환하고, 클라이언트가 받은 JSON을 conformance/v0_2/normalize_wire.py로 정규화해 문자열이 같은지 비교한다(normalize_wire.py는 스키마+시맨틱 검증 후에만 출력하므로 '같은 검증기를 통과했다'는 로그는 사실이다). README.md:140 '이것은 시험된 의미론 조각이 숨은 MCP 전용 상태를 요구하지 않음을 증명한다.'
- 내용: 정적 페이로드는 어떤 JSON이든 두 전송을 손실 없이 통과하므로 이 시험은 '전송이 바이트를 바꾸지 않는다'는 점만 보인다. 서버 쪽 의미 계산(무효화, 대체 등)이 바인딩마다 다르게 동작하는지는 시험하지 않는다. 그나마 README.md:140이 '외부 상호운용 증거 아님'이라고 단서를 달고 'tested slice'로 범위를 한정하여 과장은 약하다. 또 이 시험은 PATH의 'python'(PYTHON 환경변수 기본값)과 사전 설치된 jsonschema에 의존하는데 bindings/v0_2/README.md:111-112가 이를 안내하므로 재현성 문제는 아니다.
- 권고: 문구를 '정적 ContextAssertion의 직렬화가 두 바인딩에서 보존됨'으로 좁히고, 의미론적 동등성은 서버가 상태 변화(무효화)를 노출하는 경우에 별도로 증명한다.

## 4. 실행한 검증

```text
["git clone /Users/chan/Developer/service/RCP-Relationship-Context-Protocol → checkout 68026af (scratch/clone, clone_a, clone_b). uv venv로 Python 3.12.13, npm install node@22으로 Node v22.23.3 확보(로컬 기본은 Python 3.11.15/Node 24.14/Node 26.4). 시스템 npm 11.9.0을 Node 22로 구동했으므로 CI(Node 22 번들 npm 10.x)와 npm 버전만 다르다.", "scratch/runci.sh로 세 워크플로의 모든 run 단계를 순서대로 실행: conformance.yml(pip 설치, conformance/run.py, boundary_checks.py, python-probe 설치, crypto npm install/test, Node↔Python 두 방향 벡터, external npm install, reference-ecosystem npm install, 독립성 grep, 외부 Provider self-test), reference-ecosystem.yml(npm install, smoke, test:permission, test:revocation, test:policy, test:relay, test:identity, demo), semantic-v0.2.yml(v0_2/run.py, run_wire.py, 독립성 grep, 외부 v0_2 하네스 self-test, bindings npm install/test). 결과: Python 3.12 + Node 22에서 전부 rc=0, 전체 21.1초(wall). 대표 출력: 'RCP v0.2 draft semantic conformance: PASS (31 cases)', 'wire conformance: PASS (20 schema/semantic cases, 1 binding-equivalence case)', 'external clean-room harness: PASS (15/15 cases)'.", "동일 스크립트를 Python 3.11.15+Node 24.14.0(run_py311_node24.log)과 Python 3.14.8+Node 26.4.0(run_py314_node26.log)에서 재실행: 둘 다 28/28 rc=0.", "비결정성: canonical demo 2회 실행 비교 → canonical-brief.txt 동일, canonical-trace.json은 generated_at/UUID/issued_at 차이. 포트 45403 점유 시 test:policy가 명시적 오류로 실패(28초).", "의존성 확인: package-lock.json 없음, 설치된 MCP SDK 2.3.1/zod 4.6.5/jsonschema 4.26.0/cryptography 50.0.2, workflow가 npm install과 ubuntu-latest/태그 고정 action을 사용.", "gh run list: 68026af의 Conformance와 v0.2 Semantic Draft 워크플로 success. gh api로 PR #24/#26/#28/#30 merged, 이슈 #19 closed(completed) 확인.", "링크 점검 스크립트: 추적 중 *.md 50개의 상대 링크 107개 중 깨진 것 0개. 백틱 경로 참조의 실제 누락 0개.", "README.md·ROADMAP.md의 ✅/[x] 전 항목을 코드와 테스트에 대조: M0~M4.5 지지, M4.6의 앞 세 항목은 산출물이 존재하지만 미체크(RA-3). core-v0.2 §5의 13개 불변식을 semantic-cases.json/wire-cases.json/run.py/run_wire.py/public.json에 매핑(RA-1, RA-2). 규범 키워드 빈도 grep(RA-5)."]
```

## 5. 평가 한계

["콜드 npm/pip 캐시나 완전 오프라인 상태에서의 설치는 시험하지 않았다. 설치 시간(npm 0.4-2.6초)은 로컬 캐시 영향이 있어 CI 러너보다 빠를 수 있다. 오프라인 재현성은 미검증이다.", "Linux(ubuntu-latest) 실행은 하지 않았다. macOS(arm64, Darwin 25.6)에서만 재현했다. CI 성공 기록은 gh run list로만 확인했다.", "Node 22는 npm 패키지 node@22로 설치했고 npm CLI는 시스템 11.9.0을 썼다. 정확히 actions/setup-node가 주는 Node 22.x/npm 10.x 조합은 아니다. action 버전(checkout@v4 등) 자체는 실행하지 않았다.", "변이 시험(규칙 하나를 끄고 실패 여부 확인)과 전체 요구-케이스 추적표는 만들지 않았다. RA-1의 불변식 매핑은 케이스 이름, JSON 키, 오라클 코드를 읽어 판정한 것이고 일부 항목(5.5, 5.10)은 해석이 갈릴 수 있다.", "이슈 #19의 닫힘 상태(RA-4)는 평가 시점의 GitHub 상태이며 시간이 지나면 바뀔 수 있다. docs/ 아래 나머지 설계 문서(threat/rights/provenance 등)의 내용 정확성과 spec/wire-v0.2-draft.md ↔ 스키마의 필드 단위 일치는 점검하지 않았다."]
