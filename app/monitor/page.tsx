import type {Metadata} from 'next';
import {MonitorExperience} from '@/features/monitor/monitor';
export const metadata:Metadata={title:'Silver Orbit — Jake’s Space',description:'Explore the Silver Orbit 3D monitor and play the live space portfolio on its display.'};
export default function MonitorPage(){return <MonitorExperience/>;}
