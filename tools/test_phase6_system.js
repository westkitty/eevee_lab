const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class Color {
  constructor(hex=0){ this.hex=Number(hex)||0; }
  setHex(hex){ this.hex=Number(hex)||0; return this; }
  copy(other){ this.hex=other.hex; return this; }
  clone(){ return new Color(this.hex); }
}
class Vector3 {
  constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
  clone(){ return new Vector3(this.x,this.y,this.z); }
  copy(v){ this.x=v.x; this.y=v.y; this.z=v.z; return this; }
  sub(v){ this.x-=v.x; this.y-=v.y; this.z-=v.z; return this; }
  add(v){ this.x+=v.x; this.y+=v.y; this.z+=v.z; return this; }
  set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }
  lengthSq(){ return this.x*this.x+this.y*this.y+this.z*this.z; }
  normalize(){ const l=Math.sqrt(this.lengthSq())||1; this.x/=l; this.y/=l; this.z/=l; return this; }
  multiplyScalar(s){ this.x*=s; this.y*=s; this.z*=s; return this; }
}

const window={THREE:{Vector3}};
const source=fs.readFileSync(path.join(__dirname,'..','src','phase6-system.js'),'utf8');
vm.runInNewContext(source,{window,console,Math,Object,Array,Number,String,Set,Map});
const P6=window.EeveePhase6System;

// Explicit shiny profile affects only named materials and restores originals.
const named={
  name:'Material__105',
  color:new Color(0x112233),
  emissive:new Color(0x000000),
  emissiveIntensity:0
};
const gem={
  name:'Material__107',
  color:new Color(0x223344),
  emissive:new Color(0x000000),
  emissiveIntensity:0
};
const unknown={
  name:'UnexpectedMaterial',
  color:new Color(0x334455),
  emissive:new Color(0x000000),
  emissiveIntensity:0
};
const records=[named,gem,unknown].map(mat=>({
  mat,
  name:mat.name,
  color:mat.color.clone(),
  emissive:mat.emissive.clone(),
  emissiveIntensity:mat.emissiveIntensity
}));
assert.equal(P6.applyShinyProfile('espeon',records,true),2);
assert.equal(named.color.hex,0x73d88e);
assert.equal(gem.color.hex,0xff3355);
assert.equal(gem.emissive.hex,0xff2448);
assert.equal(unknown.color.hex,0x334455);
P6.applyShinyProfile('espeon',records,false);
assert.equal(named.color.hex,0x112233);
assert.equal(gem.color.hex,0x223344);
assert.equal(gem.emissive.hex,0x000000);

// Ability contract rejects mismatched room targets and persists compatible mutations.
let recorded=null;
let applied=null;
const worldState={recordAbilityMutation(roomId,targetId,mutation){recorded={roomId,targetId,mutation};}};
const roomManager={
  current:{id:'jolteon'},
  applyAbilityMutation(m){applied=m; return true;}
};
const abilities=new P6.AbilitySystem({worldState,roomManager});
const powerTarget={userData:{abilityTarget:{id:'ability_jolteon',roomId:'jolteon',targetType:'power'}}};
const waterTarget={userData:{abilityTarget:{id:'ability_vaporeon',roomId:'vaporeon',targetType:'water'}}};
assert.equal(abilities.canUseAbility('jolteon',powerTarget),true);
assert.equal(abilities.canUseAbility('jolteon',waterTarget),false);
const bad=abilities.performAbility('jolteon',waterTarget);
assert.equal(bad.ok,false);
assert.equal(bad.reason,'incompatible-target');
const stalePowerTarget={userData:{abilityTarget:{id:'ability_jolteon_old',roomId:'old-room',targetType:'power'}}};
const stale=abilities.performAbility('jolteon',stalePowerTarget);
assert.equal(stale.ok,false);
assert.equal(stale.reason,'stale-target-room');
assert.equal(P6.ABILITIES.vaporeon.icon,'💧');
assert.equal(P6.ABILITIES.sylveon.icon,'🎀');
const good=abilities.performAbility('jolteon',powerTarget);
assert.equal(good.ok,true);
assert.equal(good.mutation.abilityId,'relay-charge');
assert.equal(recorded.roomId,'jolteon');
assert.equal(recorded.targetId,'ability_jolteon');
assert.equal(applied.mutation,'charged');

// Physical evolution is a two-step offer/commit with actor-owned approach.
const actor={
  root:{position:new Vector3(0,0,0)},
  state:'idle',
  target:null,
  moved:null,
  holdSeconds:0,
  moveTo(p,opts){this.moved=p.clone();this.target=p.clone();this.state='walk';this.targetSource=opts.source;},
  lookAtWorld(){},
  clearBehaviorState(){},
  stop(){this.target=null;this.state='idle';},
  hold(s){this.holdSeconds=s;}
};
const stone={
  position:new Vector3(1.5,0,0),
  getWorldPosition(v){return v.copy(this.position);}
};
let current='eevee';
const stages=[];
let swapped=null;
let completed=null;
const evolution=new P6.EvolutionController({
  actor,
  getCurrentSpecies:()=>current,
  isSpeciesReady:()=>true,
  reducedMotion:()=>true,
  onStage:(stage)=>stages.push(stage),
  onSwap:(species)=>{swapped=species;current=species;},
  onComplete:(species)=>{completed=species;}
});
const offered=evolution.request('jolteon',stone);
assert.equal(offered.ok,true);
assert.equal(evolution.state,'approach');
assert.equal(actor.targetSource,'evolution');

// Second activation commits, but swap waits until the actor reaches the stone.
const committed=evolution.request('jolteon',stone);
assert.equal(committed.committed,true);
assert.equal(evolution.commitRequested,true);
actor.root.position.copy(evolution.approachPoint);
actor.target=null; actor.state='idle';
evolution.update(0.05);
assert.equal(evolution.state,'charge');
evolution.update(0.1);
evolution.update(0.05);
assert.equal(swapped,'jolteon');
assert.equal(evolution.state,'reveal');
evolution.update(0.1);
evolution.update(0.05);
assert.equal(completed,'jolteon');
assert.equal(evolution.state,'idle');
assert(stages.includes('approach') && stages.includes('ready') && stages.includes('charge') && stages.includes('reveal') && stages.includes('complete'));

console.log('phase6 system test: PASS');
