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
  setAutonomyEnabled(enabled){ this.autonomyEnabled=!!enabled; }
  hold(){ this.target=null; this.state='idle'; }
  stop(){ this.hold(); }
  setBehaviorState(s){ this.behaviorState=s; this.state=s; return true; }
  clearBehaviorState(expected){ if(expected && this.behaviorState!==expected)return false; this.behaviorState=null; this.state='idle'; return true; }
  update(){ if(this.target){ this.root.position.copy(this.target); this.target=null; this.state='idle'; } }
}
const window={THREE:{Vector3,Group},CreatureActorSystem:{CreatureActor:FakeActor}};
const source=fs.readFileSync(path.join(__dirname,'..','src','creature-manager.js'),'utf8');
vm.runInNewContext(source,{window,console,Math,Object,Array,Map,Set,Number,Error});

const {CreatureManager}=window.CreatureManagerSystem;

const scene=new Group();
const originalParent=new Group();
originalParent.name='EeveeRig';
const wrapper=new Group();
wrapper.name='vaporeon_wrapper';
wrapper.visible=false;
wrapper.userData={rawRoot:{},animations:[]};
originalParent.add(wrapper);
const lifecycleManager=new CreatureManager({scene,random:()=>0});
const lifecyclePrimaryRoot=new Group();
const lifecyclePrimary=new FakeActor({root:lifecyclePrimaryRoot,species:'eevee'});
lifecycleManager.setPrimary(lifecyclePrimary,{id:'primary',species:'eevee'});
lifecycleManager.setRoom('conservatory',{});
const activated=lifecycleManager.activateCompanionModel({
  id:'vaporeon-companion',
  species:'vaporeon',
  wrapper,
  parentRoot:originalParent,
  spawnPoint:new Vector3(-1.2,0,0.8)
});
assert(activated);
assert.equal(wrapper.parent.name,'vaporeon-companion_root');
assert.equal(wrapper.visible,true);
assert.equal(lifecycleManager.getDebugState().activeCount,2);
assert.equal(lifecycleManager.deactivateCompanion('vaporeon-companion'),true);
assert.equal(wrapper.parent,originalParent);
assert.equal(wrapper.visible,false);
assert.equal(lifecycleManager.getDebugState().activeCount,1);

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

const commandManager = new CreatureManager({ scene:new Group(), random:()=>0 });
const commandPrimary = new FakeActor({root:new Group(),species:'eevee'});
const commandCompanionRoot = new Group(); commandCompanionRoot.position.x=-1;
const commandCompanion = new FakeActor({root:commandCompanionRoot,species:'vaporeon'});
commandManager.setPrimary(commandPrimary,{id:'primary',species:'eevee'});
commandManager.registerCompanionActor({id:'vaporeon-companion',species:'vaporeon',actor:commandCompanion,root:commandCompanionRoot});
commandManager.setRoom('conservatory',{});
assert(commandManager.commandCompanion('stay'));
assert.equal(commandManager.getDebugState().companions[0].command,'stay');
commandPrimary.root.position.x=4;
const stayMoveCount=commandCompanion.moves.length;
commandManager.update(0.4,0,{primary:{},companion:{},socialSuspended:false,reducedMotion:false,userActive:false});
assert.equal(commandCompanion.moves.length,stayMoveCount,'stay should prevent automatic separation and social movement');
assert.equal(commandManager.notifyToyReleased(new Vector3(2,0,2),'ball',{}),false,'stay should also suppress unsolicited toy pursuit');
assert(commandManager.commandCompanion('follow'));
commandManager.update(0.4,0.4,{primary:{},companion:{},socialSuspended:false,reducedMotion:false,userActive:false});
assert(commandCompanion.moves.some(m=>m.opts.source==='companion-follow'),'follow should track the primary instead of only issuing one move');
assert(commandManager.commandCompanion('recall'));
assert.equal(commandCompanion.moves[commandCompanion.moves.length-1].opts.source,'companion-follow');
assert(commandManager.commandCompanion('play'));
assert.equal(commandCompanion.behaviorState,'play');
commandManager.update(3,3,{primary:{},companion:{},socialSuspended:false,reducedMotion:false,userActive:false});
assert.equal(commandManager.getDebugState().companions[0].command,'autonomy','play should end and restore autonomous behavior');
assert(commandManager.commandCompanion('stay'));
commandManager.setRoom('vaporeon',{});
assert.equal(commandManager.getDebugState().companions[0].command,'autonomy','room changes should clear temporary commands');

console.log('creature manager unit test: PASS');
