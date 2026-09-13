import type { PointerEventHandler, ReactNode } from 'react';

type Props = {
  title: string;
  image: string;
  interactive?: boolean;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  children?: ReactNode;
};

export function PaintingPane({ title, image, interactive = false, onPointerDown, children }: Props) {
  return (
    <section className="painting-pane">
      <h2>{title}</h2>
      <div
        className={`painting-frame ${interactive ? 'interactive' : ''}`}
        onPointerDown={interactive ? onPointerDown : undefined}
      >
        <img src={image} alt={title} draggable={false} />
        {children}
      </div>
    </section>
  );
}
