"use client";
import type {ComponentProps,RefObject} from "react";
import {HexagonalUFO} from "./hexagonal-ufo";
import {ClassicUFO} from "./classic-ufo";
export type UFOType="classic"|"hexagonal";
export function UFOModel({type="hexagonal",gearRef,engineRef,...props}:ComponentProps<typeof ClassicUFO>&{type?:UFOType;gearRef?:RefObject<number>;engineRef?:RefObject<number>}){
 return type==="hexagonal"?<HexagonalUFO {...props} gearRef={gearRef} engineRef={engineRef}/>:<ClassicUFO {...props}/>;
}
