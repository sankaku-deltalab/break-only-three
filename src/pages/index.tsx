import type {NextPage} from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {useWindowSize} from '@react-hook/window-size';

import styles from '../styles/Home.module.css';
import {useAppSelector, useAppDispatch} from '../hooks';

import {
  startGameFromMenu,
  selectMode,
  selectResult,
  returnToMenuFromResult,
  selectRepresentation,
} from '../features/reactpixi/gameSlice';
import {RecSetTrait} from 'curtain-call3';

const StageForNextjs = dynamic(
  () => import('../features/reactpixi/stage-for-nextjs'),
  {ssr: false}
);

const IndexPage: NextPage = () => {
  const mode = useAppSelector(selectMode);

  return (
    <div className={styles.container}>
      <Head>
        <title>Redux Toolkit</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Menu />
      <Game />
      <GameResult />
    </div>
  );
};

const Menu = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectMode);

  const visible = mode === 'menu';

  if (!visible) {
    return <></>;
  }

  return (
    <div>
      <div>Try STG</div>
      <button
        onKeyDown={() => {}}
        onClick={() => dispatch(startGameFromMenu({}))}
      >
        Start game
      </button>
    </div>
  );
};

const Game = () => {
  const [winWidth, winHeight] = useWindowSize();

  const mode = useAppSelector(selectMode);
  const representation = useAppSelector(selectRepresentation);

  const visible = mode in RecSetTrait.new(['game', 'game-result']);
  const visibility = visible ? 'visible' : 'hidden';
  const scale = visible ? 1.0 : 0.0;

  const [width, height] = [winWidth * scale, winHeight * scale];

  const uiVisible = mode in RecSetTrait.new(['game']);

  return (
    <div style={{visibility, position: 'absolute'}}>
      <StageForNextjs canvasSize={{x: width, y: height}} />
      {uiVisible ? (
        <div
          style={{
            position: 'absolute',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {`score: ${representation.score}`}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

const GameResult = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectMode);
  const result = useAppSelector(selectResult);

  const visible = mode === 'game-result';

  if (!visible) {
    return <></>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'rgb(255, 255, 255)',
      }}
    >
      <div>Result</div>
      <div>{result.endReason}</div>
      <div>score: {result.score}</div>
      <button
        onKeyDown={() => {}}
        onClick={() => dispatch(returnToMenuFromResult({}))}
      >
        Return to menu
      </button>
    </div>
  );
};

export default IndexPage;
