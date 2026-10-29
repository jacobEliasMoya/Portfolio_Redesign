"use client";
import type {ComponentProps,RefObject} from "react";
import {HexagonalUFO} from "./hexagonal-ufo";
import {UFOV3} from "./ufo-v3";
import {ReferenceUFO} from "./reference-ufo";
import {ClassicUFO} from "./classic-ufo";
export type UFOType="classic"|"hexagonal"|"reference"|"v3";
export function UFOModel({type="hexagonal",gearRef,engineRef,suspensionRef,...props}:ComponentProps<typeof ClassicUFO>&{type?:UFOType;gearRef?:RefObject<number>;engineRef?:RefObject<number>;suspensionRef?:RefObject<number>}){
 return type==="v3"?<UFOV3 {...props} gearRef={gearRef} engineRef={engineRef} suspensionRef={suspensionRef}/>:type==="reference"?<ReferenceUFO {...props} gearRef={gearRef} engineRef={engineRef} suspensionRef={suspensionRef}/>:type==="hexagonal"?<HexagonalUFO {...props} gearRef={gearRef} engineRef={engineRef} suspensionRef={suspensionRef}/>:<ClassicUFO {...props}/>;
}
