const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class FakeParam {
  constructor(value=0){ this.value=value; this.targets=[]; }
  cancelScheduledValues(){}
  setTargetAtTime(value,time,constant){ this.value=value; this.targets.push({value,time,constant}); }
}
class FakeNode {
  constructor(){ this.connections=[]; this.started=0; this.stopped=0; }
  connect(node){ this.connections.push(node); return node; }
  disconnect(){ this.connections=[]; }
  start(){ this.started++; }
  stop(){ this.stopped++; }
}
class FakeGain extends FakeNode { constructor(){ super(); this.gain=new FakeParam(); } }
class FakeOsc extends FakeNode { constructor(){ super(); this.frequency=new FakeParam(); this.type='sine'; } }
class FakeFilter extends FakeNode { constructor(){ super(); this.frequency=new FakeParam(); this.type='lowpass'; } }
class FakeBufferSource extends FakeNode { constructor(){ super(); this.buffer=null; this.loop=false; } }
class FakeContext {
  constructor(){
    this.currentTime=12;
    this.sampleRate=100;
    this.destination=new FakeNode();
    this.calls={gain:0,osc:0,buffer:0,source:0,filter:0};
  }
  createGain(){ this.calls.gain++; return new FakeGain(); }
  createOscillator(){ this.calls.osc++; return new FakeOsc(); }
  createBuffer(channels,length){ this.calls.buffer++; const data=new Float32Array(length); return {getChannelData(){return data;}}; }
  createBufferSource(){ this.calls.source++; return new FakeBufferSource(); }
  createBiquadFilter(){ this.calls.filter++; return new FakeFilter(); }
}

const window={THREE:{}};
const source=fs.readFileSync(path.join(__dirname,'..','src','phase7-living-world.js'),'utf8');
vm.runInNewContext(source,{window,console,Math,Object,Array,Number,String,Date,Map,Set,Float32Array});
const P7=window.EeveeLivingWorld;

const clock=new P7.WorldClock({dayLengthMs:24000,now:()=>0});
assert.equal(clock.sample(0).phase,'night');
assert.equal(clock.sample(5000).phase,'dawn');
assert.equal(clock.sample(12000).phase,'day');
assert.equal(clock.sample(18000).phase,'dusk');
assert.equal(clock.sample(18000).label,'18:00');

const state={habitatHour:12,dayIndex:7};
const w1=P7.weatherFor('jolteon',state);
const w2=P7.weatherFor('jolteon',state);
assert.equal(w1,w2);
assert(P7.ROOM_WEATHER.jolteon.includes(w1));
assert(P7.weatherModifier('storm').particles>P7.weatherModifier('clear').particles);
assert.equal(P7.phaseForHour(23),'night');
assert.equal(P7.phaseForHour(6),'dawn');

const ctx=new FakeContext();
const audioEngine={ctx};
const save={get(path,fallback){return path==='ui.ambienceLevel'?0.7:fallback;}};
const director=new P7.AudioDirector({audioEngine,save});
assert.equal(director.getDebugState().initialized,false);
assert.equal(director.apply({roomId:'jolteon',phase:'dusk',weather:'storm'}),true);
assert.equal(director.getDebugState().initialized,true);
assert.equal(director.getDebugState().contextReused,true);
assert.equal(ctx.calls.osc,1);
assert.equal(ctx.calls.source,1);
assert.equal(ctx.calls.gain,3);
const master=director.master;
const activeGain=master.gain.value;
assert(activeGain>0);
director.setSuspended(true);
assert.equal(director.getDebugState().suspended,true);
assert.equal(master.gain.targets.at(-1).value,0);
director.setSuspended(false);
assert.equal(master.gain.targets.at(-1).value,0.7*0.22);
director.apply({roomId:'jolteon',phase:'dusk',weather:'storm'});
assert.equal(ctx.calls.osc,1); // graph is reused, not rebuilt.
director.setLevel(0.25);
assert.equal(master.gain.targets.at(-1).value,0.25*0.22);
director.dispose();
assert.equal(director.getDebugState().initialized,false);

console.log('phase7 living world test: PASS');
