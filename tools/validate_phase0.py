#!/usr/bin/env python3
import argparse, json
from pathlib import Path
SPECIES={"eevee","vaporeon","jolteon","flareon","espeon","umbreon","leafeon","glaceon","sylveon"}
SLOTS={"idle","walk","trot","sit","lie","sleep","wake","groom","stretch","play","eat","reaction"}
def main():
    ap=argparse.ArgumentParser(); ap.add_argument("manifest"); ap.add_argument("contract"); a=ap.parse_args()
    m=json.loads(Path(a.manifest).read_text()); c=json.loads(Path(a.contract).read_text())
    found={x["species"] for x in m["models"]}; assert found==SPECIES,(SPECIES-found,found-SPECIES)
    assert set(m["semantic_slots"])==SLOTS; assert set(c["semantic_slots"])==SLOTS; assert set(c["species"])==SPECIES
    for x in m["models"]:
        assert set(x["semantic_animation_slots"])==SLOTS
        assert x["inspection_state"] in {"verified_from_glb_json","partial_repository_evidence"}
        assert x["runtime_normalization"]["forward"]=="+Z" and x["runtime_normalization"]["grounded_y"]==0
    for sp,data in c["species"].items():
        assert set(data["slots"])==SLOTS,sp
        for value in data["slots"].values(): assert value is None or isinstance(value,str)
    print("phase0 schema validation: PASS")
if __name__=="__main__": main()
