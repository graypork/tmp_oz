# Anthony Browne Spot-the-Difference Game

부모참여수업에서 스마트TV 터치로 진행하는 틀린그림찾기 웹앱입니다.

## 실행

```bash
npm install
npm run dev
```

- 일반 게임: `http://localhost:5173/`
- 영역 편집기(개발 모드): `http://localhost:5173/?editor=1`
- 편집기 임시값 미리보기: `http://localhost:5173/?preview=1`

## 수업 흐름

1. 시작 화면에서 `시작하기`
2. 명화 1 틀린그림찾기
3. 명화 2 틀린그림찾기
4. `명화 속 우리 아이 찾기` 3분 타이머

각 명화에서는 `이전으로`를 눌러도 이미 찾은 정답이 유지됩니다. 정답을 모두 찾으면 화면 중앙에 완료 모달이 나타납니다. 정답 터치 시 짧은 차임 효과음이 재생됩니다.

타이머 실행 중에는 `시간 종료` 버튼으로 즉시 종료 상태를 테스트할 수 있으며, 자동 종료와 수동 종료 모두 종료 차임이 재생됩니다.

## 정답 영역 편집

`?editor=1`에서 각색 명화 위에 자유도형(Polygon) 정답 범위를 만들 수 있습니다. 왼쪽/오른쪽 정답 O 위치를 각각 조절하고 JSON 다운로드를 누르면 모든 라운드가 하나의 `gameConfig.json`으로 저장됩니다.

편집 중 내용은 브라우저 Local Storage에 임시 저장됩니다. 최종 확정값은 `src/config/gameConfig.json`에 반영합니다.

## 검증

```bash
npm test
npm run build
```

`npm test`는 외부 테스트 라이브러리 없이 Node 내장 테스트 러너를 사용합니다.
