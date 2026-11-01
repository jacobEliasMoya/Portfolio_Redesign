import type {Metadata} from 'next';
import {ArcadeExperience} from '@/features/arcade/arcade';
export const metadata:Metadata={title:"Jake’s Space — Arcade",description:"Step up to the cabinet. Play Jake’s live space portfolio in arcade mode."};
export default function ArcadePage(){return <ArcadeExperience/>;}
