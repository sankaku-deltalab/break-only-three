import {Vec2d, Vec2dTrait} from 'curtain-call2';

export const unit = 50;
export const gameArea: Vec2d = {x: unit * 6, y: unit * 8};
export const gameAreaHalf: Vec2d = Vec2dTrait.div(gameArea, 2);
export const gameAreaNW: Vec2d = Vec2dTrait.mlt(gameAreaHalf, -1);
export const gameAreaSE: Vec2d = gameAreaHalf;
