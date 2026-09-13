# Anthony Browne Spot Game Design

## Goal
Build a lightweight classroom web game for a laptop connected to a smart TV/touch display. Children touch only the adapted artwork on the left. Correct/incorrect feedback appears on both the adapted and original artworks. After all artwork rounds finish, the app transitions to a manually started two-minute countdown for the next activity.

## Architecture
- Vite + React + TypeScript, no server and no database.
- Game data is bundled as JSON so deployment is static and resilient.
- A development-only polygon editor defines answer hit areas and marker positions. It is unavailable in production builds.
- All geometry is stored as normalized coordinates from 0 to 1, independent of screen resolution.

## Game flow
1. Display adapted artwork left and original artwork right.
2. Accept pointer/touch input only on the left artwork.
3. If the pointer is inside an unanswered polygon, persist a red O on both images at configured marker positions.
4. If the pointer is not inside an answer polygon, show a black X at the equivalent normalized location on both images for about 700 ms.
5. Completing a round reveals a next-round button. Completing the last round transitions to the timer preparation screen.
6. Timer screen waits for an explicit `2분 시작` press, counts from 2:00 to 0:00, then shows a finished state.

## Editor
- Development mode only, opened with `?editor=1`.
- Choose a round, create an answer, then click at least three points on the left image to create a polygon.
- Finished polygon vertices are draggable; the polygon itself is draggable.
- The left O marker defaults to the polygon centroid.
- The right O marker can be positioned by clicking or dragging on the right image.
- Delete answers and export the complete config as JSON.
- Editor state can be stored in localStorage for development preview. Production uses `src/config/gameConfig.json` only.

## Testing
- Geometry tests cover inside, outside, edge, vertex, and just-outside values.
- Coordinate conversion tests cover scaling independence.
- Timer formatting tests cover 2:00, 1:00, 0:09, and 0:00.

## Deployment
GitHub stores source; Vercel builds and hosts the static site. The Vercel project can later be deleted without deleting the GitHub repository.
