#!/usr/bin/env python3
"""Inspect Eevee Lab runtime GLBs without Blender or Three.js.

Reads only the glTF JSON chunk and emits deterministic rig capability data.
It never edits model binaries.
"""
from __future__ import annotations
import argparse, json, re, struct
from pathlib import Path

SPECIES = ["eevee","vaporeon","jolteon","flareon","espeon","umbreon","leafeon","glaceon","sylveon"]
SEMANTIC_SLOTS = ["idle","walk","trot","sit","lie","sleep","wake","groom","stretch","play","eat","reaction"]
TARGET_HEIGHT = {"eevee": 0.95, **{s: 1.35 for s in SPECIES if s != "eevee"}}

def read_glb_json(path: Path):
    with path.open("rb") as fh:
        header = fh.read(12)
        if len(header) != 12: raise ValueError(f"{path}: truncated GLB header")
        magic, version, total = struct.unpack("<4sII", header)
        if magic != b"glTF" or version != 2: raise ValueError(f"{path}: expected glTF 2.0 GLB")
        chunk_header = fh.read(8)
        if len(chunk_header) != 8: raise ValueError(f"{path}: missing JSON chunk")
        length, kind = struct.unpack("<II", chunk_header)
        if kind != 0x4E4F534A: raise ValueError(f"{path}: first chunk is not JSON")
        payload = fh.read(length).rstrip(b"\\x00 \\t\\r\\n")
    return json.loads(payload.decode("utf-8")), total

def unique(items): return list(dict.fromkeys(x for x in items if x))

def role_groups(joints):
    patterns = {
      "head": re.compile(r"^(Head|Nose|EndHead|EndNose)(?:_|$)", re.I),
      "neck": re.compile(r"^Neck\\d*(?:_|$)", re.I),
      "ears": re.compile(r"^(?:L|R)?Ear\\d*|^End(?:L|R)?Ear", re.I),
      "tail": re.compile(r"^(?:L|R)?Tail\\d*|^End(?:L|R)?Tail", re.I),
      "forelimbs": re.compile(r"^(?:L|R)(?:Shoulder|Arm|ForeArm|Hand)(?:_|$)", re.I),
      "hindlimbs": re.compile(r"^(?:L|R)(?:Thigh|Leg|Foot|Toe\\d*)(?:_|$)|^End(?:L|R)(?:Foot|Toe\\d*)", re.I),
      "feelers_ribbons": re.compile(r"^(?:L|R)?(?:Feeler|Ribbon)", re.I),
      "fins_flukes": re.compile(r"^(?:L|R)?(?:Fin|Fluke)|^End(?:L|R)?(?:Fin|Fluke)", re.I),
      "hair_bangs": re.compile(r"^(?:L|R)?(?:Hair|Bang)|^End(?:L|R)?(?:Hair|Bang)", re.I),
    }
    return {k:[n for n in joints if rx.search(n)] for k,rx in patterns.items()}

def inspect_model(path, species):
    g,total=read_glb_json(path); nodes=g.get("nodes",[]); acc=g.get("accessors",[])
    skins=g.get("skins",[]); meshes=g.get("meshes",[]); mats=g.get("materials",[])
    joints=unique(nodes[i].get("name",f"node_{i}") for s in skins for i in s.get("joints",[]) if i < len(nodes))
    animations=[]
    for a in g.get("animations",[]):
        durations=[]
        for s in a.get("samplers",[]):
            i=s.get("input")
            if isinstance(i,int) and i < len(acc) and acc[i].get("max"): durations.append(float(acc[i]["max"][0]))
        targets=unique(nodes[c.get("target",{}).get("node",-1)].get("name") for c in a.get("channels",[])
                       if isinstance(c.get("target",{}).get("node"),int) and 0 <= c["target"]["node"] < len(nodes))
        animations.append({"name":a.get("name") or "(unnamed)","duration_seconds":round(max(durations,default=0),3),
                           "channel_count":len(a.get("channels",[])),"target_count":len(targets)})
    morph_max=morph_prims=0
    for m in meshes:
        for p in m.get("primitives",[]):
            n=len(p.get("targets",[]))
            if n: morph_prims+=1; morph_max=max(morph_max,n)
    tex={k:0 for k in ["baseColor","normal","metallicRoughness","occlusion","emissive"]}
    for m in mats:
        p=m.get("pbrMetallicRoughness",{})
        tex["baseColor"] += int("baseColorTexture" in p); tex["metallicRoughness"] += int("metallicRoughnessTexture" in p)
        tex["normal"] += int("normalTexture" in m); tex["occlusion"] += int("occlusionTexture" in m); tex["emissive"] += int("emissiveTexture" in m)
    return {"species":species,"asset":f"assets/models/{species}.glb","inspection_state":"verified_from_glb_json",
            "byte_length":total,"gltf":{"version":g.get("asset",{}).get("version"),"generator":g.get("asset",{}).get("generator")},
            "runtime_normalization":{"grounded_y":0.0,"target_height_m":TARGET_HEIGHT[species],"forward":"+Z"},
            "skin_count":len(skins),"joint_count":len(joints),"joints":joints,"roles":role_groups(joints),
            "animations":animations,"semantic_animation_slots":{s:None for s in SEMANTIC_SLOTS},
            "semantic_classification":"needs_visual_classification" if animations else "no_embedded_clips",
            "morph_targets":{"primitive_count":morph_prims,"max_per_primitive":morph_max},
            "materials":[m.get("name") or "(unnamed)" for m in mats],"texture_slots":tex,"known_anomalies":[]}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("model_dir",nargs="?",default="assets/models")
    ap.add_argument("--output",default="assets/models/rig-manifest.json"); ap.add_argument("--baseline",default=None)
    args=ap.parse_args(); root=Path(args.model_dir); models=[]; missing=[]
    for sp in SPECIES:
        p=root/f"{sp}.glb"
        if not p.exists(): missing.append(sp)
        else: models.append(inspect_model(p,sp))
    payload={"schema_version":1,"baseline_commit":args.baseline,"generator":"tools/inspect_glb_manifest.py",
             "semantic_slots":SEMANTIC_SLOTS,"models":models,"missing_models":missing}
    out=Path(args.output); out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,indent=2)+"\\n",encoding="utf-8")
    return 0 if not missing else 2

if __name__=="__main__": raise SystemExit(main())
