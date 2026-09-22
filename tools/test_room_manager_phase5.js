const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class Vector3 {
  constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
  clone(){ return new Vector3(this.x,this.y,this.z); }
  set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }
}
class FakeScale { constructor(){this.value=1;} setScalar(v){this.value=v;} }
class FakeGroup {
  constructor(name=''){ this.name=name; this.children=[]; this.userData={}; this.position=new Vector3(); this.rotation={y:0}; this.scale=new FakeScale(); this.parent=null; }
  add(o){ this.children.push(o); o.parent=this; }
  traverse(fn){ fn(this); this.children.forEach(c=>c.traverse ? c.traverse(fn) : fn(c)); }
}
class FakeScene extends FakeGroup {
  remove(o){ this.children=this.children.filter(x=>x!==o); o.parent=null; }
}
class FakeMesh extends FakeGroup {
  constructor(name=''){ super(name); this.isMesh=true; this.geometry={dispose(){}}; this.material={emissive:{},emissiveIntensity:0}; }
}
class FakeSave {
  constructor(){ this.data={ atmosphereUnlocked:{}, atmosphereSelected:{}, roomMemory:{}, crossContamination:{} }; }
  get(path,fallback){ let cur=this.data; for(const p of path.split('.')){ if(cur==null || !(p in cur)) return fallback; cur=cur[p]; } return cur; }
  set(path,value){ const parts=path.split('.'); let cur=this.data; for(let i=0;i<parts.length-1;i++){ if(!cur[parts[i]]||typeof cur[parts[i]]!=='object')cur[parts[i]]={}; cur=cur[parts[i]]; } cur[parts.at(-1)]=value; return value; }
}
function built(roomId){
  const group=new FakeGroup('room_'+roomId);
  const floor=new FakeMesh('floor'); floor.userData.walkable=true; floor.userData.walkRadius=4; group.add(floor);
  const cushion=new FakeMesh('cushion'); cushion.userData.placeableId=roomId+'_cushion'; cushion.userData.directManipulation={state:'released'}; group.add(cushion);
  const stateCalls=[];
  return {
    group,
    lights:[],
    particleFields:[],
    interactables:[],
    spawnPoint:new Vector3(0,0,1),
    entryPoints:{},
    continuationPoints:{},
    cameraBounds:{},
    atmosphereVariants:[{id:'default',label:'Default'}],
    applyNarrativeStage(s){ stateCalls.push(s); },
    stateCalls,
    update(){}
  };
}

const save=new FakeSave();
const scene=new FakeScene();
const visits=[];
const placements={
  vaporeon:{ vaporeon_cushion:{x:1.2,y:0.12,z:-0.8,ry:0.4} }
};
const worldState={
  noteVisit(roomId){ const s={roomId,stageIndex:roomId==='vaporeon'?2:0,stageId:'stage',label:'Stage'}; visits.push(roomId); return s; },
  listPlacements(roomId){ return placements[roomId]||{}; },
  listTraces(){ return []; },
  getHistorySummary(){ return {visitedRooms:['eevee'],advancedCount:1,mementoCount:1}; },
  savePlacement(roomId,id,t){ placements[roomId]=placements[roomId]||{}; placements[roomId][id]={x:t.position.x,y:t.position.y,z:t.position.z,ry:t.rotationY}; return placements[roomId][id]; }
};
const defs={};
for(const id of ['conservatory','vaporeon']){
  defs[id]={id,build(){return built(id);}};
}
defs.vaporeon.build=()=>{
  const b=built('vaporeon');
  b.entryPoints.conservatory=new Vector3(0,0,-3);
  b.continuationPoints.conservatory=new Vector3(0,0,0.8);
  return b;
};
const RoomKit={
  memento(){ const g=new FakeGroup('trace'); g.scale=new FakeScale(); return g; }
};
const window={
  THREE:{Vector3},
  ROOM_DEFINITIONS:defs,
  ROOM_ORDER:['conservatory','vaporeon'],
  RoomKit
};
const src=fs.readFileSync(path.join(__dirname,'..','src','room-manager.js'),'utf8');
vm.runInNewContext(src,{window,console,Math,Object,Array,Number,Set,Map});
const RoomManager=window.RoomManager;

let entryReceipt=null;
let doorRequest=null;
const manager=new RoomManager({
  scene,save,worldState,
  discoveryLog:{count(){return 0;},checkCombo(){return null;},unlockMemento(){return true;}},
  resonance:{bump(){}},
  cameraController:null,
  onRoomEnter:(roomId,builtRoom,entry)=>{ entryReceipt={roomId,builtRoom,entry}; },
  onDoorTravelRequested:req=>{ doorRequest=req; return true; }
});
manager.setActiveForm('eevee');

manager.goTo('conservatory');
assert.equal(scene.children.filter(x=>x.name.startsWith('room_')).length,1);
assert.deepEqual(visits,['conservatory']);

const fakeDoor=new FakeGroup('door');
assert.equal(manager.requestDoor('vaporeon',fakeDoor),true);
assert(doorRequest);
assert.equal(doorRequest.sourceRoomId,'conservatory');
assert.equal(manager.current.id,'conservatory');

manager.goTo('vaporeon',{entryFrom:'conservatory',viaDoor:true});
assert.equal(scene.children.filter(x=>x.name.startsWith('room_')).length,1);
assert.equal(manager.current.id,'vaporeon');
assert.equal(entryReceipt.entry.viaDoor,true);
assert.equal(entryReceipt.entry.fromRoomId,'conservatory');
assert.equal(entryReceipt.entry.entryPoint.z,-3);
assert.equal(entryReceipt.entry.continuePoint.z,0.8);
assert.equal(manager.previousId,'conservatory');

const cushion=manager.current.built.group.children.find(x=>x.userData.placeableId==='vaporeon_cushion');
assert(cushion);
assert.equal(cushion.position.x,1.2);
assert.equal(cushion.position.z,-0.8);
assert.equal(cushion.rotation.y,0.4);
assert.equal(cushion.userData.directManipulation.state,'resting');
assert.equal(manager.current.built.stateCalls.length,1);
assert.equal(manager.current.built.stateCalls[0].stageIndex,2);

cushion.position.set(-1.1,0.12,1.5);
cushion.rotation.y=-0.25;
const captured=manager.capturePlacement(cushion);
assert.equal(captured.x,-1.1);
assert.equal(captured.z,1.5);
assert.equal(captured.ry,-0.25);

console.log('phase5 room manager lifecycle test: PASS');
