import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useWindowSize} from '@react-hook/window-size';

import {useAppSelector, useAppDispatch} from '../hooks';

import {
  selectMode,
  selectPerkChoosingState,
  selectRepresentation,
  addEvents,
  selectLevelState,
} from '../features/reactpixi/gameSlice';
import {RecSetTrait, Result, Res, Event} from 'curtain-call3';
import {useEffect, useState} from 'react';
import {TryStgSetting} from '../game/setting';
import {PerkTrait} from '../game/perk';

type Stg = TryStgSetting;

const StageForNextjs = dynamic(
  () => import('../features/reactpixi/stage-for-nextjs'),
  {ssr: false}
);

const perkImages = {
  bigPaddle: '/images/perk_icons/big_paddle.png',
  flatPaddle: '/images/perk_icons/flat_paddle.png',
  penetrativePaddle: '/images/perk_icons/penetrative_paddle.png',
  hyperSensitivePaddle: '/images/perk_icons/hyper_sensitive_paddle.png',
  bigBall: '/images/perk_icons/big_ball.png',
  slowBall: '/images/perk_icons/slow_ball.png',
  penetrativeWall: '/images/perk_icons/penetrative_wall.png',
  sniperLauncher: '/images/perk_icons/sniper_launcher.png',
  strongHitStop: '/images/perk_icons/strong_hit_stop.png',
};

export const Game = () => {
  const [winWidth, winHeight] = useWindowSize();

  const mode = useAppSelector(selectMode);
  const representation = useAppSelector(selectRepresentation);

  const visible = mode in RecSetTrait.new(['game', 'game-result']);
  const visibility = visible ? 'visible' : 'hidden';
  const scale = visible ? 1.0 : 0.0;

  const [width, height] = [winWidth * scale, winHeight * scale];

  return (
    <div style={{visibility, position: 'absolute'}}>
      <StageForNextjs canvasSize={{x: width, y: height}} />
      <OverlayUi score={representation.score} />
      <ChoicePerkUi />
    </div>
  );
};

const OverlayUi: React.FC<{score: number}> = ({score}) => {
  const mode = useAppSelector(selectMode);
  const uiVisible = mode in RecSetTrait.new(['game']);

  if (!uiVisible) return <></>;

  return (
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
        {`score: ${score}`}
      </div>
    </div>
  );
};

const ChoicePerkUi: React.FC<{}> = () => {
  const choosingState = useAppSelector(selectPerkChoosingState);
  const dispatch = useAppDispatch();
  const [chosenCardIdx, setChosenCardIdx] = useState<Result<number>>(
    Res.err('nothing chosen')
  );

  useEffect(() => {
    if (choosingState.err) {
      setChosenCardIdx(Res.err({}));
    }
  }, [choosingState]);

  const handleSelectCard = (idx: number) => {
    setChosenCardIdx(Res.ok(idx));
  };

  const handleSubmit = () => {
    if (chosenCardIdx.err) return;

    const perk = perks[chosenCardIdx.val];
    const ev: Event<Stg, 'userChosePerk'> = {
      type: 'userChosePerk',
      payload: {perk},
    };
    dispatch(addEvents({events: [ev]}));
  };

  const handleSkip = () => {
    const ev: Event<Stg, 'userChosePerk'> = {
      type: 'userChosePerk',
      payload: {perk: undefined},
    };
    dispatch(addEvents({events: [ev]}));
  };

  if (choosingState.err) return <></>;

  const perks = choosingState.val.perks;

  const cardsEl = (
    <div
      style={{
        padding: 10,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        {perks.map((perk, i) => {
          const background =
            chosenCardIdx.ok && chosenCardIdx.val === i ? 'red' : 'white';
          return (
            <div
              key={perk}
              style={{flexBasis: '30%', background, padding: 2}}
              onClick={() => handleSelectCard(i)}
            >
              <img
                src={perkImages[perk]}
                style={{
                  width: '100%',
                  height: 'auto',
                  background: 'black',
                  border: 10,
                }}
              />
              <p style={{color: 'red'}}>{PerkTrait.getPerkInfo(perk).name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const cardTitle = chosenCardIdx.err
    ? 'Select Perk'
    : PerkTrait.getPerkInfo(perks[chosenCardIdx.val]).name;
  const cardTitleEl = (
    <div style={{height: '100%', color: 'red'}}>
      <h1>{cardTitle}</h1>
    </div>
  );

  const cardDescription = chosenCardIdx.err
    ? ''
    : PerkTrait.getPerkInfo(perks[chosenCardIdx.val]).description;
  const cardDescriptionEl = (
    <div
      style={{
        height: '100%',
        color: 'red',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>{cardDescription}</p>
    </div>
  );

  const submitOrSkipButtonsEl = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        height: '100%',
        padding: 10,
        color: 'red',
      }}
    >
      <button
        style={{padding: 10, width: '100%', height: '100%'}}
        onClick={handleSubmit}
      >
        Submit
      </button>
      <button
        style={{padding: 10, width: '100%', height: '100%'}}
        onClick={handleSkip}
      >
        Skip
      </button>
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      <div style={{width: '100%', height: '10vh'}}></div>
      <div style={{width: '100%', height: '40vh'}}>{cardsEl}</div>
      <div style={{width: '100%', height: '10vh'}}>{cardTitleEl}</div>
      <div style={{width: '100%', height: '20vh'}}>{cardDescriptionEl}</div>
      <div style={{width: '100%', height: '10vh'}}>{submitOrSkipButtonsEl}</div>
    </div>
  );
};
