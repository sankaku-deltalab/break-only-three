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
  restartGame,
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
        <title>Break Only Three</title>
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
    <div
      onKeyDown={() => {}}
      onClick={() => dispatch(startGameFromMenu({}))}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div>
        <h1>Break only three</h1>
        <div>Tap to START</div>
      </div>
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
      onKeyDown={() => {}}
      onClick={() => dispatch(restartGame({}))}
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'rgb(255, 255, 255)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        <h1>score: {result.score}</h1>
        <div>Tap to RESTART</div>
        <button
          onKeyDown={() => {}}
          onClick={e => {
            location.href = tweetUrl({score: result.score});
            e.stopPropagation();
          }}
          style={{
            margin: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TwitterIcon />
            <div style={{padding: 2}}>Share</div>
          </div>
        </button>
      </div>
    </div>
  );
};

const TwitterIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
    </svg>
  );
};

const tweetUrl = (args: {score: number}): string => {
  const host = location.href;
  const tweet_text = `Score: ${args.score}`;
  return constructUrl('http://twitter.com/intent/tweet', {
    host,
    text: tweet_text,
    url: host,
    hashtags: 'breakonlythree',
  });
};

const constructUrl = (host: string, base: Record<string, string>): string => {
  // In dev env, I cannot use URI class (I don't know why). So I wrote this function.
  const paramsStr = Object.entries(base)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  if (paramsStr === '') return host;
  return encodeURI(`${host}?${paramsStr}`);
};

export default IndexPage;
