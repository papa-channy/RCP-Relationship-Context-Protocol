# evaluation/ — 시스템 검수 작업 공간

> 이 폴더는 `review/system-evaluation` 브랜치에만 존재한다. `main`으로 병합하지 않는다.
> 여기서 나온 결론 중 반영할 것은 별도 브랜치에서 일반 PR로 옮긴다.

## 목적

RCP 저장소 전체를 합의된 기준으로 평가하고, 여러 평가자(에이전트·자체 평가)의 결과를
같은 형식으로 기록해 비교·종합한다.

## 구조

```text
evaluation/
├── README.md            # 이 문서: 운영 규칙
├── CRITERIA.md          # 평가 기준과 채점 척도 (기준이 바뀌면 버전을 올린다)
├── DECISIONS.md         # 기준 변경 이력과 결정 근거
├── baseline/            # 평가 대상 스냅샷: 커밋, CI/테스트 실행 결과, 수치
├── reports/
│   ├── self/            # 자체 평가 (프로젝트 작성자 관점)
│   └── agents/          # 에이전트별 독립 평가
├── synthesis/           # 평가 간 비교, 합의/불일치, 최종 상태 보고서
└── templates/
    └── REPORT_TEMPLATE.md
```

## 파일 명명 규칙

```text
reports/agents/<YYYY-MM-DD>_<evaluator>_<scope>.md
reports/self/<YYYY-MM-DD>_self_<scope>.md
```

- `evaluator`: 모델·역할 이름. 예: `opus-5.5-spec-reviewer`, `fable-5.1-adversary`
- `scope`: `full` 또는 기준 ID 묶음. 예: `C3-C4`

## 운영 규칙

1. **평가 대상 고정.** 모든 보고서는 `baseline/`에 기록된 커밋 해시를 대상으로 한다.
   대상 커밋이 다르면 보고서 머리말에 명시한다.
2. **독립성.** 에이전트 평가자는 다른 평가자의 보고서와 `synthesis/`를 읽지 않고 작성한다.
   자체 평가도 에이전트 보고서를 보기 전에 먼저 작성한다.
3. **증거 필수.** 모든 점수에는 `파일:줄` 또는 실행 명령과 출력 근거가 붙어야 한다.
   근거 없는 점수는 종합 단계에서 제외한다.
4. **검증과 의견의 분리.** 각 발견은 `검증됨`(재현/인용 가능) 또는 `판단`(해석)으로 표시한다.
5. **수정 금지.** 이 브랜치에서 `evaluation/` 밖의 파일을 고치지 않는다.
