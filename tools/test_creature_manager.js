const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class Vector3 {
  constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
  clone(){ return new Vector3(this.x,this.y,this.z); }
  copy(v){ this.x=v.x; this.y=v.y; this.z=v.z; return this; }
}
class Group {
  constructor(){ this.position=new Vector3(); this.rotation={y:0}; this.quaternion={clone(){return {copy(){}};},copy(){}}; this.scale={clone(){return {copy(){}};},copy(){}}; this.parent=null; this.children=[]; this.name=''; }
  add(o){ if(o.parent&&o.parent.remove)o.parent.remove(o); this.children.push(o); o.parent=this; }
  remove(o){ this.children=this.children.filter(x=>x!==o); if(o.parent===this)o.parent=null; }
}
class FakeActor {
  constructor(opts){ this.root=opts.root; this.species=opts.species; this.state='idle'; this.behaviorState=null; this.target=null; this.navCenter=new Vector3(); this.navRadius=3; this.moves=[]; this.animation={stopAll(){}}; }
  registerModel(){ return true; }
  enterRoom(){ return true; }
  placeAt(p){ this.root.position.copy(p); return true; }
  moveTo(p,opts){ this.moves.push({p:p.clone(),opts}); this.target=p.clone(); this.state='walk'; return true; }
  lookAtWorld(){}
  setBehaviorState(s){ this.behaviorState=s; this.state=s; return true; }
  clearBehaviorState(){ this.behaviorState=null; this.state='idle'; return true; }
  update(){ if(this.target){ this.root.position.copy(this.target); this.target=null; this.state='idle'; } }
}
const window={THREE:{Vector3,Group},CreatureActorSystem:{CreatureActor:FakeActor}};
const source=fs.readFileSync(path.join(__dirname,'..','src','creature-manager.js'),'utf8');
vm.runInNewContext(source,{window,console,Math,Object,Array,Map,Set,Number,Error});

const {CreatureManager}=window.CreatureManagerSystem;
const events=[];
const primaryRoot=new Group();
const primary=new FakeActor({root:primaryRoot,species:'eevee'});
const companionRoot=new Group();
companionRoot.position.x=0.1;
const companion=new FakeActor({root:companionRoot,species:'vaporeon'});
const manager=new CreatureManager({scene:new Group(),random:()=>0,onSocialEvent:e=>events.push(e)});
manager.setPrimary(primary,{id:'primary',species:'eevee'});
manager.registerCompanionActor({id:'vaporeon-companion',species:'vaporeon',actor:companion,root:companionRoot});
manager.setRoom('conservatory',{});
manager.update(0.1,0,{primary:{},companion:{},socialSuspended:false,reducedMotion:false,userActive:false});
assert(companion.moves.some(m=>m.opts.source==='separation'));

primary.state='idle'; primary.target=null; companion.state='idle'; companion.target=null;
manager.socialTimer=0;
manager.update(0.1,0.1,{primary:{},companion:{},socialSuspended:false,reducedMotion:false,userActive:false});
assert.equal(manager.getDebugState().activeCount,2);
assert.equal(manager.getDebugState().socialMode,'greet');

manager.notifyToyReleased(new Vector3(1,0,1),'ball',{});
assert.equal(manager.getDebugState().toyCompetition,true);
assert(events.some(e=>e.type==='toy-race'));

primary.behaviorState='sleep'; primary.state='sleep'; companion.behaviorState=null; companion.state='idle';
manager.socialMode=null;
manager.toyInterest=null;
manager.update(0.1,0.2,{primary:{},companion:{},socialSuspended:false,reducedMotion:false,userActive:false});
assert.equal(manager.getDebugState().socialMode,'nap-together');

console.log('creature manager unit test: PASS');
