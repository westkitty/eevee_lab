const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class FakeSave {
  constructor(){ this.state={}; }
  get(path,fallback){
    let cur=this.state;
    for(const p of path.split('.')){ if(cur==null || cur[p]===undefined) return fallback; cur=cur[p]; }
    return cur;
  }
  set(path,value){
    const parts=path.split('.');
    let cur=this.state;
    for(let i=0;i<parts.length-1;i++){ if(!cur[parts[i]] || typeof cur[parts[i]]!=='object') cur[parts[i]]={}; cur=cur[parts[i]]; }
    cur[parts[parts.length-1]]=value;
    return value;
  }
}
const save=new FakeSave();
const bond={tier(){return 2;}};
const events=[];
const window={};
const source=fs.readFileSync(path.join(__dirname,'..','src','creature-behavior.js'),'utf8');
vm.runInNewContext(source,{window,console,Math,Object,Array,Number,Error});

const {CreatureMemory,NeedState,BehaviorScheduler}=window.CreatureBehaviorSystem;
const memory=new CreatureMemory(save);
memory.recordInteraction('eevee','pet',{region:'ears'});
memory.recordInteraction('eevee','pet',{region:'ears'});
memory.recordInteraction('eevee','brush',{region:'back'});
memory.recordInteraction('eevee','toyRetrieve',{toy:'ball'});
memory.recordInteraction('eevee','feed',{food:'berry'});
memory.enterRoom('eevee','eevee');
memory.noteQuiet('eevee','eevee');
let snap=memory.snapshot('eevee');
assert.equal(snap.favoriteTouchZone,'ears');
assert.equal(snap.favoriteToy,'ball');
assert.equal(snap.favoriteFood,'berry');
assert.equal(snap.preferredSleepSpot,'eevee');
assert.equal(snap.interactions.pet,2);

const needs=new NeedState('flareon');
const before=needs.restInclination;
needs.update(60,true);
assert(needs.restInclination>before);
needs.interact('pet');
assert(needs.restInclination<1);

const scheduler=new BehaviorScheduler({save,bond,memory,emit:e=>events.push(e),random:()=>0,species:'eevee'});
scheduler.enterRoom('eevee');
scheduler.requestBondGesture('test');
assert(events.some(e=>e.type==='bond-gesture'));
scheduler.needs.restInclination=0.8;
scheduler.lastInteractionAgo=40;
scheduler.quietAccum=20;
scheduler.update(1,{idle:true,userActive:false,specialAction:false});
assert.equal(scheduler.sleeping,true);
assert(events.some(e=>e.type==='sleep-start'));
scheduler.recordInteraction('pet',{region:'head'});
assert.equal(scheduler.sleeping,false);
assert(events.some(e=>e.type==='sleep-end'));

console.log('creature behavior unit test: PASS');
