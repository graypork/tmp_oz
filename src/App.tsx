import { useState } from 'react';
import { bundledGameConfig, loadGameConfig } from './config/gameConfig';
import { GameScreen } from './screens/GameScreen';
import { StartScreen } from './screens/StartScreen';
import { TimerScreen } from './screens/TimerScreen';
import { EditorScreen } from './editor/EditorScreen';
import { addFoundAnswer, createFoundState, previousGamePosition } from './game/session';
import type { AppStage } from './game/session';

function GameApp() {
  const [config] = useState(loadGameConfig);
  const [stage, setStage] = useState<AppStage>('start');
  const [roundIndex, setRoundIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(config.timerSeconds);
  const [foundByRound, setFoundByRound] = useState(() => createFoundState(config.rounds.length));

  function startGame() {
    setRoundIndex(0);
    setStage('game');
  }

  function handleFound(answerId: string) {
    setFoundByRound((current) => addFoundAnswer(current, roundIndex, answerId));
  }

  function handleAdvance() {
    if (roundIndex >= config.rounds.length - 1) {
      setStage('timer');
      return;
    }
    setRoundIndex((index) => index + 1);
  }

  function handleGameBack() {
    const previous = previousGamePosition(roundIndex);
    setRoundIndex(previous.roundIndex);
    setStage(previous.stage);
  }

  function handleTimerBack() {
    setRoundIndex(Math.max(0, config.rounds.length - 1));
    setStage('game');
  }

  if (stage === 'start') {
    return <StartScreen onStart={startGame} />;
  }

  if (stage === 'timer') {
    return (
      <TimerScreen
        seconds={timerSeconds}
        defaultSeconds={config.timerSeconds}
        onSecondsChange={setTimerSeconds}
        onBack={handleTimerBack}
      />
    );
  }

  const round = config.rounds[roundIndex];
  const foundIds = foundByRound[roundIndex] ?? new Set<string>();

  return (
    <GameScreen
      key={round.id}
      config={config}
      roundIndex={roundIndex}
      foundIds={foundIds}
      onFound={handleFound}
      onAdvance={handleAdvance}
      onBack={handleGameBack}
    />
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const editorRequested = params.get('editor') === '1';

  if (import.meta.env.DEV && editorRequested) {
    return <EditorScreen initialConfig={bundledGameConfig} />;
  }

  return <GameApp />;
}
