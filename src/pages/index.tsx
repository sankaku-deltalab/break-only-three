import type {NextPage} from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {useWindowSize} from '@react-hook/window-size';

import styles from '../styles/Home.module.css';
import {useAppSelector, useAppDispatch} from '../hooks';

import {startGameFromMenu, selectMode} from '../features/reactpixi/gameSlice';

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
      <button onClick={() => dispatch(startGameFromMenu({}))}>
        Start game
      </button>
    </div>
  );
};

const Game = () => {
  const [winWidth, winHeight] = useWindowSize();
  const mode = useAppSelector(selectMode);

  const visible = mode === 'game';
  const visibility = visible ? 'visible' : 'hidden';
  const scale = visible ? 1.0 : 0.0;

  const [width, height] = [winWidth * scale, winHeight * scale];

  return (
    <div style={{visibility, position: 'absolute'}}>
      <StageForNextjs canvasSize={{x: width, y: height}} />
    </div>
  );
};

export default IndexPage;
