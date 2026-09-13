type Props = {
  onStart: () => void;
};

export function StartScreen({ onStart }: Props) {
  return (
    <main className="start-screen">
      <section className="start-card">
        <div className="start-badge">부모참여수업</div>
        <h1>틀린 그림 찾기</h1>
        <p>각색된 명화를 터치해서 원본 명화와 다른 곳을 찾아보세요.</p>
        <div className="start-rule">
          <span>각색된 명화만 터치</span>
          <span>찾으면 양쪽 그림에 O 표시</span>
        </div>
        <button className="primary-button start-button" onClick={onStart}>시작하기</button>
      </section>
    </main>
  );
}
