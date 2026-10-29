"use client";
import {useEffect,useMemo} from "react";
import {createArchiveSatellite,disposeArchiveSatellite} from "./create-archive-satellite.mjs";
export function ArchiveSatellite(){
 const model=useMemo(()=>createArchiveSatellite(),[]);
 useEffect(()=>()=>disposeArchiveSatellite(model),[model]);
 return <primitive object={model} dispose={null}/>;
}
