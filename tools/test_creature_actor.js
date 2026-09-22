const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

class Vector3 {
  constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
  set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }
  clone(){ return new Vector3(this.x,this.y,this.z); }
}
class FakeMixer {
  constructor(){ this.actions=[]; }
  clipAction(clip){
    let a=this.actions.find(x=>x.clip===clip);
    if(!a){ a={clip,reset(){return this;},setEffectiveWeight(){return this;},setEffectiveTimeScale(){return this;},play(){return this;},fadeOut(){return this;},crossFadeTo(){return this;}}; this.actions.push(a); }
    return a;
  }
  update(){}
  stopAllAction(){}
}

const THREE={Vector3,AnimationMixer:FakeMixer};
const window={THREE};
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src','creature-actor.js'),'utf8'),{window,console,Math,Object,Map,Number,Array,Error});

const {CreatureActor,SEMANTIC_SLOTS}=window.CreatureActorSystem;
const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'assets','models','animation-contract.json'),'utf8'));
assert.deepStrictEqual(Array.from(SEMANTIC_SLOTS), contract.semantic_slots);

const root={position:new Vector3(),rotation:{y:0}};
const actor=new CreatureActor({root,species:'eevee'});
const floor={isMesh:true,userData:{walkable:true,walkRadius:2},getWorldPosition(v){v.set(0,0,0);}};
const group={traverse(fn){fn(floor);}};
actor.enterRoom('eevee',{group,spawnPoint:new Vector3(0,0,0.5)});
assert.equal(actor.getDebugState().walkableCount,1);
assert.equal(root.position.z,0.5);

actor.moveTo(new Vector3(1.2,0,0),{manual:true});
for(let i=0;i<180;i++) actor.update(1/60,i/60,{reducedMotion:true,cameraPosition:new Vector3(0,2,4)});
assert(Math.abs(root.position.x-1.2)<0.08,root.position.x);
assert(Math.abs(root.position.z)<0.08,root.position.z);

actor.moveTo(new Vector3(99,0,0),{manual:true});
assert(actor.getDebugState().target.x<=2.001);
actor.update(1/60,4,{suspended:true});
assert.equal(actor.getDebugState().state,'held');
assert.equal(actor.getDebugState().target,null);

console.log('creature actor unit test: PASS');
