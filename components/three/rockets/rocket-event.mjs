export const ROCKET_RARITIES=Object.freeze([
 Object.freeze({id:"standard",label:"STANDARD",chance:.8,reward:5000,color:"#e9eee5",engines:1}),
 Object.freeze({id:"rare",label:"RARE",chance:.17,reward:10000,color:"#8dcff1",engines:3}),
 Object.freeze({id:"legendary",label:"LEGENDARY",chance:.03,reward:25000,color:"#efc563",engines:1}),
]);
export const ROCKET_FLIGHT_SECONDS=22,ROCKET_BLAST_SECONDS=1.65;
export const ROCKET_STAGING=Object.freeze({sideBoosters:7,heavyCore:10,standardCore:9,coast:.2,returnLife:8});
const unit=random=>Math.max(0,Math.min(1-Number.EPSILON,random()));
export const nextRocketDelay=random=>60+60*unit(random);
export function rollRocketRarity(random=Math.random){const ticket=Math.floor(unit(random)*10000);let threshold=0;for(const tier of ROCKET_RARITIES){threshold+=Math.round(tier.chance*10000);if(ticket<threshold)return tier;}return ROCKET_RARITIES.at(-1);}
export function createRocketEvent(random=Math.random){return {time:0,nextLaunch:nextRocketDelay(random),launchTime:0,deathTime:0,age:0,serial:0,phase:"waiting",tier:ROCKET_RARITIES[0],random};}
/** Flight and explosion both finish before the next 60–120s launch opportunity. No catch-up burst. */
export function stepRocketEvent(state,delta){
 if(!Number.isFinite(delta)||delta<0)return null;state.time+=delta;
 if(state.phase==="flight"){state.age=state.time-state.launchTime;if(state.age>=ROCKET_FLIGHT_SECONDS)state.phase="waiting";}
 if(state.phase==="exploding"&&state.time-state.deathTime>=ROCKET_BLAST_SECONDS)state.phase="waiting";
 if(state.phase==="waiting"&&state.time>=state.nextLaunch){state.serial++;state.tier=rollRocketRarity(state.random);state.launchTime=state.time;state.age=0;state.phase="flight";state.nextLaunch=state.time+nextRocketDelay(state.random);return "launch";}
 return null;
}
export function destroyRocketEvent(state){if(state.phase!=="flight")return 0;state.phase="exploding";state.deathTime=state.time;return state.tier.reward;}
