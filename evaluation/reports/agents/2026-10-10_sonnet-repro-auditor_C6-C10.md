# 평가 보고서: 재현성 감사자 / C6-C10

| 항목 | 값 |
|---|---|
| 평가자 | Sonnet 5.5, 재현성 감사자 |
| 유형 | agent |
| 대상 커밋 | `68026af` |
| 기준 버전 | CRITERIA v1.1 |
| 작성일 | 2026-10-10 |
| 교차 검증 | 높음 이상 발견 없음, 교차 검증 생략 |
| 독립성 | `evaluation/`이 없는 커밋에서 작업, 자체 평가와 다른 보고서 미열람 |
| 생성 | 워크플로 `wf_b25ca37f-bb5`의 구조화 출력을 변환. 원본은 `raw/run2-result.json` |

## 1. 요약

**한 줄 판정.** 깨끗한 clone에서 세 워크플로의 모든 run 단계가 CI 버전(Python 3.12, Node 22)과 로컬 기본 환경(Python 3.11, Node 24)에서 모두 통과하고 상대 링크 107개도 전부 유효하다. 다만 의존성 잠금이 없고, core-v0.2-draft §5의 '실행 가능한 커버리지' 주장이 변이 시험에서 상당 부분 과장으로 드러났다.

**강점**

- 재현성: conformance.yml, reference-ecosystem.yml, semantic-v0.2.yml의 모든 run 단계가 새 clone, 새 venv(Python 3.12.13), Node v22.23.3에서 exit 0으로 끝났다. 웜 캐시 기준 단계별 실행 시간은 0~2초다. 로컬 기본 환경(Python 3.11.15, Node 24.14.0)에서도 v0.1/v0.2 스위트, 바인딩 증명, relay 테스트가 통과했다.
- 비결정성: conformance/run.py와 conformance/v0_2/run.py를 3회 반복해도 출력이 같았다. 변하는 것은 demo 산출물(canonical-trace.json의 타임스탬프와 UUID)과 하네스 보고서(run_at, 절대경로)뿐이고 판정에는 영향이 없다.
- 하한 버전 시험: jsonschema==4.23.0에서 v0.2 시맨틱과 와이어 스위트가 통과했고, @modelcontextprotocol/*를 2.0.0으로 고정해도 bindings/v0_2 동등성 테스트가 통과했다. 선언된 범위의 양 끝에서 재현된다.
- 네트워크 의존: npm/pip 설치 단계를 빼면 외부망 접속이 없다. 테스트는 127.0.0.1 루프백과 stdio만 쓴다.
- 문서 정직성: README(L3, L140, L245-247), ROADMAP(L3, L155), core-v0.2-draft(L3-5, L386, L419-425), conformance/external/v0_2/README의 고지가 '실험적, 비표준, 제3자 구현 없음, 보안 검토 미완료, reference_adapter는 클린룸 증거 아님'을 반복해서 밝힌다. 마크다운 상대 링크 107개 중 깨진 것은 0개다.
- ROADMAP M0~M4.5의 [x] 항목 대부분이 코드와 테스트로 뒷받침된다. 예를 들어 M1의 7개 와이어 객체는 spec/schemas/*.json 7개와 fixtures에, M4.4는 bindings/v0_2/mcp-server.mjs(registerResource)와 test-equivalence.mjs(client.readResource)에 대응한다.
- CI 독립성 가드: semantic-v0.2.yml의 grep 단계가 harness.py의 오라클 import를 막는다. 로컬에서 같은 grep을 재현했을 때 exit 0이었다.

**시급한 문제**

- core-v0.2-draft.md §5의 '다음 불변식은 실행 가능한 커버리지를 가진다'는 문장은 13개 불변식 중 5.1과 5.12에 대응 케이스가 없고 5.9는 오라클이 True를 하드코딩해 항진이다. 변이 시험에서도 와이어 시맨틱 규칙 19개 중 13개를 꺼도 어떤 스위트도 실패하지 않았다(RA-1, RA-2).
- 클린룸 구현자 가이드(IMPLEMENTER_GUIDE_V0_2.md §4)가 구현을 요구하는 항목(참여자 수 제약, 정책 의존성 보존, 신원 의존성 구체화, support_sets 필수)을 공개 15케이스가 탐지하지 못한다. 구현을 빠뜨린 외부 구현도 통과할 수 있어 M4.6의 증거 가치가 훼손된다(RA-2, RA-9).
- projection_basis_ref는 존재 여부만 검사한다. 존재하지 않는 문자열 'x'를 넣으면 은밀한 그룹→양자 축소가 통과한다. 반면 verification_basis_refs는 해소(resolve)를 요구하므로 두 기준이 비대칭이다(RA-3).

## 2. 기준별 점수

| ID | 점수 | 확신도 | 근거 |
|---|---|---|---|
| C1 | N/A | N/A | 이 역할의 범위 밖이라 평가하지 않았다. |
| C2 | N/A | N/A | 평가하지 않았다. |
| C3 | N/A | N/A | 규범 언어 불일치만 RA-5에 기록했고, 스펙과 스키마의 필드 대조는 하지 않아 점수화하지 않았다. |
| C4 | N/A | N/A | 의미론 평가는 수행하지 않았다. |
| C5 | N/A | N/A | 변이 시험 증거(RA-2)는 얻었으나 요구→케이스 추적표 전체를 만들지 않아 점수화하지 않았다. |
| C6 | 3 | 상 | 세 워크플로의 모든 run 단계를 새 clone에서 그대로 실행해 통과했다(Python 3.12.13/Node 22.23.3, 그리고 Python 3.11/Node 24). 단계별 시간은 웜 캐시 기준 0~2초이고 반복 실행 결과가 같으며, 네트워크는 패키지 설치에만 필요하다. 감점 요인은 세 가지다. (1) 잠금 파일이 없고 npm install을 쓴다. (2) 루트 .gitignore가 없어 node_modules와 package-lock.json이 추적되지 않은 채 남는다. (3) bindings 테스트가 PATH의 python에 jsonschema가 설치돼 있어야 한다는 사실이 숨은 결합이다. 기대치 3과 일치한다. |
| C7 | N/A | N/A | 평가하지 않았다. |
| C8 | N/A | N/A | 평가하지 않았다. |
| C9 | N/A | N/A | 클린룸 구현은 시도하지 않았다. 공개 팩의 탐지력 한계(RA-9)만 기록했다. |
| C10 | 3 | 중 | 링크 107개 모두 유효하고 실험 단계 고지가 일관되며 ROADMAP의 [x] 항목은 거의 전부 뒷받침된다. README에는 ✅ 표기가 없고 산문 주장만 있다. 하위 3점인 이유는 다음과 같다. (a) core-v0.2-draft §5의 '실행 가능한 커버리지' 주장이 13개 중 최소 3개(5.1, 5.9, 5.12)에서 허위이거나 항진이고 여러 항목은 약하게만 뒷받침된다. (b) ROADMAP M4.6의 완료된 하위 항목이 체크되지 않은 stale 상태다. (c) README는 대문자 MUST를 쓰고 v0.2 초안은 소문자 must만 쓰며 RFC 2119 선언이 저장소 어디에도 없다. (d) reference/README.md가 stale하다. §5의 과장이 더 크게 드러나면 2점으로 내려갈 수 있다. |

## 3. 발견 사항

### RA-1: core-v0.2-draft §5 '실행 가능한 커버리지' 주장이 과장: 5.1/5.12는 케이스 없음, 5.9는 항진

- 기준: C10, C5
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: spec/core-v0.2-draft.md:253은 '다음 불변식은 실행 가능한 커버리지를 가진다'고 쓴다. 5.1(권리 확장 금지, L255-257)과 5.12(중앙 인프라 의존 금지, L299-301)는 conformance/v0_2/semantic-cases.json, wire-cases.json, external/v0_2/cases/public.json 어디에도 대응 케이스가 없다(grep rights|central 결과 없음). 5.9(역사적 계보 불변, L287-289)는 conformance/v0_2/run.py:65에서 "historical_lineage_preserved": True를 하드코딩해 반환하고, semantic-cases.json:63,70,77의 기대값도 true라서 어떤 입력으로도 실패할 수 없다. 5.7의 declassification 규칙(run.py:90-91)은 변이 시험에서 살아남았다. 5.8은 신원 변경 케이스만 있고 정책/인가 근거 변경 케이스는 없다.
- 내용: 13개 불변식 전체를 '실행 가능한 커버리지'로 묶은 문장은 최소 3개(5.1, 5.9, 5.12)에서 사실과 다르다. 5.7과 5.8은 부분 커버리지다. 문서 전체의 비규범/실험 고지는 충실하므로 정직성 문제라기보다 정확도 문제다. 그래도 스펙이 자신의 증거 수준을 한 단계 높게 기술하고 있다.
- 권고: §5 도입 문장을 불변식별 상태표(커버됨/부분/없음)로 바꾸거나, 5.1과 5.12를 '시험 불가 또는 아키텍처 속성'으로 분류한다. 5.9는 입력에 따라 달라지는 실제 계보 보존 검사를 추가한다.

### RA-2: 변이 시험: 와이어 시맨틱 규칙 19개 중 13개와 정책 규칙 대부분이 어떤 스위트에서도 미탐지

- 기준: C5, C10, C9
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: clone에서 conformance/v0_2/run_wire.py의 errors.append( 호출을 하나씩 무력화하고 run_wire.py와 외부 하네스 15케이스(reference_adapter 경유)를 둘 다 실행했다. 살아남은 변이는 L46(쌍방향 참여자 수), L48(그룹 3인 이상), L57(evidence_ref 유일성), L74, L78, L84, L98(material support에 support_sets 필수), L107, L109, L111, L120(신원 의존성 구체화), L130(material 정책 의존성 보존), L148이다. 사멸한 변이는 L50, L65, L104, L138, L143, L150뿐이다. run.py에서도 살아남은 변이가 있다: L93 허용 목적 부분집합, L97 training deny, L99 retention 상한, L90-91 declassification 보류, L140/L144 합성 규칙. 외부 공개 팩은 L50만 추가로 사멸시킨다. 실행 후 git diff --stat은 비어 있고 원본은 복원했다.
- 내용: IMPLEMENTER_GUIDE_V0_2.md §4가 구현을 요구하는 '그룹 범위 카디널리티, material 정책/신원 의존성 보존, support_sets' 같은 규칙이 현재 어떤 부정 케이스로도 검증되지 않는다. README(L233)와 spec/README의 '교차 참조/fail-closed 시맨틱 검증' 서술은 검증기 구현이 있다는 뜻으로는 참이지만, 시험이 그 구현을 강제한다는 뜻으로는 참이 아니다.
- 권고: 살아남은 변이마다 최소 하나의 부정 케이스를 wire-cases.json과 public.json에 추가한다. 정책 규칙은 목적, training, retention 각각에 대해 확대를 시도하는 부정 케이스를 둔다.

### RA-3: projection_basis_ref가 존재 여부만 검사되어 허위 참조로 은밀한 범위 축소가 통과

- 기준: C10, C4, C3
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: conformance/v0_2/run_wire.py:60-65는 not evidence.get("projection_basis_ref")만 검사한다. 재현: wire-cases.json의 silent-bilateral-collapse-rejected 인스턴스에서 모든 evidence의 projection_basis_ref를 'x'로 바꾸면 semantic_errors()가 []이고 JSON Schema 오류도 []였다. 대조: verification_basis_refs는 run_wire.py:136-138에서 evidence/dependency로 해소되어야 한다. core-v0.2-draft.md:97은 '명시적 시맨틱 투영 근거'를 요구한다.
- 내용: README 불변식 '다자 근거는 좁은 대상 범위로 조용히 붕괴해서는 안 된다'가 존재하지 않는 참조 하나로 우회된다. 추상 오라클 run.py:23-27도 explicit_projection_basis 불리언만 본다. 스펙은 이를 열린 질문(L431)으로 인정하지만 '실행 가능한 커버리지'(§5.2)와는 모순된다.
- 권고: projection_basis_ref를 derivation.dependencies 또는 evidence의 선언된 항목으로 해소하도록 요구하고, 허위 참조 부정 케이스를 추가한다. 불가능하면 §5.2에 '존재 여부만 검사'라는 한계를 적는다.

### RA-4: 저장소 stale 문서: ROADMAP M4.6 체크박스와 reference/README.md

- 기준: C10
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: ROADMAP.md:184-186의 [ ] 'v0.2 클린룸 구현자 표면 공개', '참조 코드 없이 소비 가능한 스위트', '외부 구현 보고서 템플릿 갱신' 세 항목은 이미 docs/IMPLEMENTER_GUIDE_V0_2.md, conformance/external/v0_2/(CONTRACT.md, harness.py, cases/public.json), docs/INDEPENDENT_IMPLEMENTATION_REPORT_V0_2_TEMPLATE.md로 존재한다(HEAD 커밋 메시지도 'M4.6: prepare ...'). reference/README.md:3 'This directory will contain the RCP reference implementation'은 계획된 구성요소를 나열하지만 실제 참조 구현은 reference-ecosystem/에 있고, 이 디렉터리는 README 저장소 구조(README.md:255-278)에도 없다. ROADMAP.md:157 '✅ after merge of Issue #31 work'는 서술이 어색하다.
- 내용: 과소 주장이라 과장보다 안전하지만 상태 추적이 부정확하다. 외부 독자가 'M4.6 준비가 안 됐다'고 오해할 수 있다.
- 권고: M4.6의 준비 항목 3개를 [x]로 바꾸고 '외부 구현 대기' 항목만 [ ]로 남긴다. reference/README.md는 reference-ecosystem으로 안내하거나 삭제한다.

### RA-5: 규범 언어 불일치와 RFC 2119 선언 부재

- 기준: C10, C3
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: README.md:87-96은 v0.2 핵심 불변식을 굵은 대문자 MUST / MUST NOT / MAY로 쓴다. spec/core-v0.2-draft.md(대문자 키워드 0개, 소문자 must/should/may 33개)와 spec/wire-v0.2-draft.md(0개, 소문자 17개)는 '비규범 설계 초안'(core L3, wire L3)이다. spec/core-v0.1.md는 대문자 118개를 쓴다. 'RFC 2119', 'RFC 8174', 'BCP 14' 문자열은 저장소 마크다운 전체에서 0건이다. IMPLEMENTER_GUIDE_V0_2.md와 CONTRACT.md는 대문자 MUST를 쓰지만 키워드 선언은 없다.
- 내용: 가장 눈에 띄는 README가 비규범 초안 위에 규범 어조를 얹고 있다. 대문자 MUST를 쓰는 문서(core-v0.1, IMPLEMENTER_GUIDE_V0_2)에도 정의 선언이 없어 대문자의 규범성이 정의되지 않았다.
- 권고: README 불변식 절에 '후보 불변식이며 비규범'이라고 쓰거나 키워드를 소문자로 낮춘다. 규범 문서에는 RFC 2119/8174 선언 문단을 추가한다.

### RA-6: 의존성 잠금 부재, 느슨한 범위, 루트 .gitignore 부재

- 기준: C6
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: git ls-files에는 package-lock.json, 루트 .gitignore, .nvmrc, .python-version, pyproject, LICENSE가 모두 없다(reference-ecosystem/.gitignore만 있고 그 안에는 /out/ 뿐). 설치 후 git status --short에 node_modules/와 package-lock.json 4개, __pycache__ 3개가 추적되지 않은 채 나타났다. 느슨한 범위: conformance/requirements.txt의 jsonschema[format]>=4.23,<5(해소 결과 4.26.0), 전이 의존성 cryptography>=49.0.0(해소 결과 50.0.2), bindings/v0_2/package.json의 @modelcontextprotocol/*와 zod ^2.0.0/^4.0.0(해소 결과 2.3.1/4.6.5). 반면 jwcrypto==1.6.1, rfc8785==0.1.4, jose 6.2.12, canonicalize 5.1.0은 정확히 고정돼 있다. CI는 npm install을 쓰고 ubuntu-latest와 actions/*@v4 태그를 쓴다. MCP 2.0.0으로 고정한 설치는 npm audit에서 GHSA-6qxp-vccf-f47h(high, OAuth client credential 전송)를 보고했고, 이 취약 범위는 ^2.0.0 안에 있다.
- 내용: 오늘은 전부 통과하지만 두 의존성 계열(jsonschema 4.x, MCP SDK 2.x)이 향후 변경돼도 재현이 보장되지 않는다. 같은 커밋의 CI 결과가 시간에 따라 달라질 수 있다. 하한 버전 시험은 통과했으므로 현재 위험은 낮다.
- 권고: package-lock.json을 커밋하고 CI에서 npm ci를 쓴다. Python은 제약 파일이나 해시 잠금을 둔다. 루트 .gitignore와 .nvmrc, .python-version을 추가하고 가능하면 actions를 SHA로 고정한다.

### RA-7: 숨은 결합과 비결정적 산출물: python 호출, 고정 포트, 하네스 보고서

- 기준: C6
- 심각도: 낮음
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: bindings/v0_2/test-equivalence.mjs:16-17은 process.env.PYTHON || 'python'으로 conformance/v0_2/normalize_wire.py를 실행한다. 따라서 npm test는 PATH의 python에 jsonschema가 설치돼 있어야 하며 bindings/v0_2/README는 이를 선행 조건으로 적지 않는다(CI에서는 앞 단계의 pip install 덕분에 우연히 충족). 고정 포트: reference-ecosystem/tests/revocation-recompute.mjs:5-11은 45301-45305와 45390, operator-blind-relay.mjs:79-86은 45501-45505를 쓴다. demo를 2회 실행하면 reference-ecosystem/out/canonical-trace.json의 SHA-256이 달랐다(693c14b5… 대 a8530b85…, generated_at/resolution_id/claim_id 상이). conformance/external/v0_2/out/self-test-report.json에는 run_at과 절대 경로가 들어 있어 해시가 매번 다르다. 이 out/ 디렉터리는 추적되지 않는다. conformance/external/v0_2/README.md의 예시는 --rcp-revision repository-self-test인데 CI는 ${GITHUB_SHA}를 쓴다.
- 내용: 판정(PASS/FAIL)은 결정적이고 3회 반복 결과가 동일했다. 비결정성은 산출물 메타데이터에만 있고, 포트 충돌은 병렬 실행이나 개발자 로컬에서 위험하다.
- 권고: bindings README에 python과 pip 선행 조건을 명시한다. 포트는 0번(OS 할당)으로 바꾸거나 환경변수로 받는다. 산출물 비교용으로 시간과 UUID를 제외한 정규화 해시를 제공한다.

### RA-8: M4.x 완료 주장의 외부 근거(PR·CI) 비검증과 LICENSE·보안 연락처 부재

- 기준: C10
- 심각도: 낮음
- 구분: 판단
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: ROADMAP.md:95,109,127,143은 'PR #24/#26/#28/#30 완료', L157은 'Issue #31'을 인용한다. 로컬 git log에서 M2 커밋은 '(#13)(#14)(#15)'를 달고 있으나 M4.1~M4.6 커밋 제목에는 PR 번호가 없다. 작성 시각은 2026-10-09 01:52~02:31 사이의 연속 커밋이다(68026af 02:31, abdb9cc 02:20, 4c0f925 01:52). 저장소에는 LICENSE 파일이 없다(git ls-files 검색 결과 없음, README/CHARTER/CONTRIBUTING에 라이선스 언급 없음). SECURITY.md:31-33은 '전용 보안 연락처가 공개될 때까지'라고 적는다.
- 내용: 체크아웃만으로는 PR 병합과 GitHub Actions 통과를 확인할 수 없다. 다만 해당 CI 단계들은 내 환경에서 모두 통과했으므로 'CI 검증' 주장 자체는 로컬 재현으로 뒷받침된다. 라이선스 부재는 공개 프로토콜 연구에서 외부 구현자의 참여 가능성(재사용 권리)과 직결된다.
- 권고: LICENSE(코드)와 스펙 문서용 라이선스를 명시한다. ROADMAP의 PR 번호를 링크로 만들거나 커밋 해시로 대체한다. 보안 연락처를 게시한다.

### RA-9: 외부 클린룸 공개 팩 15케이스는 인스턴스 수준 검사뿐이고 31개 시맨틱 시나리오를 노출하지 않음

- 기준: C10, C9, C5
- 심각도: 중간
- 구분: 검증됨
- 교차 검증: 미검증 (중간 이하라 교차 검증 대상 아님)
- 근거: conformance/external/v0_2/cases/public.json의 15개 id(basic-bilateral-evidence … namespaced-evidence-channel-accepted)는 모두 단일 ContextAssertion 인스턴스의 수용/거부 판정이다. 부분 소스 무효화, 대체 vs 충돌, 정책 단조성, 에피스템 보존, 도착 순서, 크로스 프로바이더 합성(semantic-cases.json 31케이스)은 CONTRACT/하네스가 어댑터에 전달하지 않는다. 하네스 자체시험은 'PASS (15/15 cases)'였다. IMPLEMENTER_GUIDE_V0_2.md:5는 이 대상이 '서비스 토폴로지가 아니라 시맨틱 객체'를 시험한다고 말하고, ROADMAP M4.6(L187)은 'semantic target'을 구현하라고 요구한다. README.md:249도 'v0.2 시맨틱 표면의 클린룸 구현'을 다음 결정적 단계로 둔다.
- 내용: 클린룸 구현이 공개 팩을 전부 통과해도 확인되는 것은 '와이어 객체 검증기'이고, 핵심 차별 가설(support_sets 무효화, 제한 상속, 하류 재평가)은 검증되지 않는다. RA-2와 결합하면 구현을 대충 해도 통과할 가능성이 높다.
- 권고: 어댑터 계약에 상태 전이 케이스(소스 제거 후 동작, 정책 단조성 질의 등)를 추가하거나, M4.6 성공 주장을 '와이어 객체 검증 표면'으로 한정한다.

## 4. 실행한 검증

```text
"git clone 후 68026af 체크아웃; uv로 Python 3.12.13 venv 생성, npm i node@22로 Node v22.23.3 확보(CI와 같은 메이저). conformance.yml 전 단계 실행: pip install, conformance/run.py ('RCP conformance bootstrap: PASS'), boundary_checks.py (PASS), JOSE 테스트 PASS, Node↔Python 벡터 양방향 PASS, 외부 Provider 하네스 자체시험 PASS, 모두 exit 0. reference-ecosystem.yml 전 단계: smoke, test:permission, test:revocation, test:policy, test:relay, test:identity, demo 모두 PASS(각 0~1초). semantic-v0.2.yml 전 단계: run.py 'PASS (31 cases)', run_wire.py 'PASS (20 schema/semantic cases, 1 binding-equivalence case)', grep 가드 exit 0, 외부 하네스 자체시험 'PASS (15/15 cases)'(${GITHUB_SHA} 대신 git rev-parse HEAD), bindings/v0_2 npm test 'binding equivalence: PASS'. 재현성 보강: Python 3.11.15 + Node 24.14.0 통과, jsonschema==4.23.0 하한 통과, MCP SDK 2.0.0 고정 통과, run.py 3회 반복 동일, demo 2회 시 trace 해시 상이. 변이 시험: run_wire.py errors.append 19곳과 run.py 정책·return False 14곳을 하나씩 무력화하고 원본 복원(git diff --stat 비어 있음). 프로브: projection_basis_ref='x' 주입 시 시맨틱·스키마 오류 모두 []. 링크 점검: 상대 링크 107개 중 깨진 것 0개, 외부 URL 2개는 오프라인이라 미확인. README/ROADMAP/core-v0.2-draft 주장 대 코드·테스트 대조, RFC2119 키워드 grep. 완료 주장 판정 요약: M0 지원, M1 지원(스키마 7개, fixtures, run.py가 모든 케이스 파일 소비, JOSE 변조/오키 케이스, Node↔Python PASS), M2 대부분 지원(minimum-data planning은 control-plane server.mjs:186과 drift 테스트 재계획으로 부분 지원, 전용 단언 없음), M3 지원, M4.1~M4.5 지원(ARCHITECTURE.md:9,102,110,354; v0.2 스키마에 transformation/confidence 없음), M4.4 지원(단일 fixture 한정), M4.6은 체크박스 stale(과소 주장)."
```

## 5. 평가 한계

"실행 시간은 웜 캐시 기준이다. 콜드 설치 시간과 네트워크 장애 영향은 측정하지 못했다. 환경은 macOS(arm64)이며 CI의 ubuntu-latest가 아니다. Python 3.12.13과 Node 22.23.3은 CI가 해소하는 정확한 패치 버전과 다를 수 있다. GitHub Actions 자체는 실행하지 못했고 upload-artifact 단계는 생략했다. 원격 PR/이슈(#19, #23, #24, #26, #28, #30, #31)와 CI 이력은 오프라인이라 확인하지 못했다. 변이 시험은 errors.append 제거와 return False 무력화 두 가지 단순 변이만 썼다. 생존은 규칙이 불필요하다는 뜻이 아니라 시험이 그 규칙을 강제하지 않는다는 뜻이며, 일부 규칙은 변이 방식의 한계로 해석이 갈릴 수 있다. C10 검증에서 M2 일부(raw-content 경계, 정책 드리프트)는 테스트 존재와 단언 일부만 확인했고 충분성은 평가하지 않았다. standards-reconciliation-v0.2.md의 필드별 결정은 형식과 존재만 확인했다. C1, C2, C4, C7, C8, C9는 이 역할의 범위 밖이라 점수화하지 않았다. 스펙↔스키마 필드 대조(C3)와 요구→케이스 전체 추적표(C5)도 만들지 않았다. 링크 점검은 마크다운 상대 링크만 대상이며 헤딩 앵커는 검증하지 않았다. 스크래치 디렉터리에 clone, venv, node22 설치본, 로그가 남아 있다. 대상 체크아웃(wt)의 추적 파일은 수정하지 않았다."
