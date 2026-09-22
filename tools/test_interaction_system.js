const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class Vector3 {
  constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
  set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }
  clone(){ return new Vector3(this.x,this.y,this.z); }
  copy(v){ this.x=v.x; this.y=v.y; this.z=v.z; return this; }
  sub(v){ this.x-=v.x; this.y-=v.y; this.z-=v.z; return this; }
  add(v){ this.x+=v.x; this.y+=v.y; this.z+=v.z; return this; }
  addScaledVector(v,s){ this.x+=v.x*s; this.y+=v.y*s; this.z+=v.z*s; return this; }
  multiplyScalar(s){ this.x*=s; this.y*=s; this.z*=s; return this; }
  length(){ return Math.sqrt(this.lengthSq()); }
  lengthSq(){ return this.x*this.x+this.y*this.y+this.z*this.z; }
}
class Dummy {}
const THREE={Vector3,Group:Dummy,Mesh:Dummy,BoxGeometry:Dummy,MeshToonMaterial:Dummy};
const window={THREE,navigator:{vibrate(){return true;}}};
const source=fs.readFileSync(path.join(__dirname,'..','src','interaction-system.js'),'utf8');
vm.runInNewContext(source,{window,console,Math,Object,Map,Set,Number,Array,Error,performance:{now:()=>1000}});

const {StrokeTracker,classifyTactileRegion,DirectInteractionSystem}=window.EeveeInteractionSystem;
const bounds={min:{x:-1,y:0,z:-1},max:{x:1,y:2,z:1}};
assert.equal(classifyTactileRegion({name:'LEar1'},new Vector3(0,1.8,0),bounds),'ears');
assert.equal(classifyTactileRegion({name:'Tail3'},new Vector3(0,0.8,-0.8),bounds),'tail');
assert.equal(classifyTactileRegion({name:'Body'},new Vector3(0,1.85,0.4),bounds),'head');
assert.equal(classifyTactileRegion({name:'Body'},new Vector3(0,1.2,-0.1),bounds),'back');

const stroke=new StrokeTracker();
stroke.begin(0,0,'head',0);
stroke.sample(60,0,'head',300);
stroke.sample(120,0,'neck',600);
const summary=stroke.end(600);
assert.equal(summary.length,'medium');
assert.equal(summary.speed,'gentle');
assert.equal(summary.primaryRegion,'head');

const sys=new DirectInteractionSystem({scene:null,reducedMotion:true});
const obj={
  userData:{directManipulation:{kind:'ball',floorY:0.2}},
  position:new Vector3(0,0.2,0),
  parent:null,
  getWorldPosition(v){return v.copy(this.position);}
};
sys.registerProp(obj);
assert.equal(sys.getManipulableObjects().length,1);
sys.beginPropDrag(obj,new Vector3(0,0.2,0),0);
sys.dragPropTo(new Vector3(1,0.2,0),200);
const released=sys.releaseProp(200);
assert.equal(released.kind,'ball');
assert(released.velocity.x>0);
assert.equal(sys.isDragging(obj),false);

const furniture={
  userData:{
    placeableId:'test_cushion',
    directManipulation:{kind:'furniture',floorY:0.12,persistentPlacement:true}
  },
  position:new Vector3(0,0.12,0),
  parent:null,
  getWorldPosition(v){return v.copy(this.position);}
};
sys.registerProp(furniture);
sys.beginPropDrag(furniture,new Vector3(0,0.12,0),0);
sys.dragPropTo(new Vector3(1.2,0.12,-0.8),120);
const furnitureRelease=sys.releaseProp(120);
assert.equal(furnitureRelease.kind,'furniture');
assert.equal(furnitureRelease.velocity.length(),0);
assert.equal(furniture.userData.directManipulation.state,'resting');
assert.equal(sys.getDebugState().placeableCount,1);

console.log('interaction system unit test: PASS');
