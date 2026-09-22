import bpy
import os
import sys

SPECIES_MAP = [
    {
        "name": "eevee",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_5"
    },
    {
        "name": "vaporeon",
        "source": "assets/source/ac31af7bbb3b4c229d70e668e3c846e2_unpacked/scene.gltf",
        "armature": "Object_3"
    },
    {
        "name": "jolteon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_4"
    },
    {
        "name": "flareon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_2"
    },
    {
        "name": "espeon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_6"
    },
    {
        "name": "umbreon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_0"
    },
    {
        "name": "leafeon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_7"
    },
    {
        "name": "glaceon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_8"
    },
    {
        "name": "sylveon",
        "source": "assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf",
        "armature": "GLTF_created_9"
    }
]

out_dir = os.path.abspath("assets/models")
os.makedirs(out_dir, exist_ok=True)

for entry in SPECIES_MAP:
    sp_name = entry["name"]
    src_file = os.path.abspath(entry["source"])
    arm_name = entry["armature"]
    out_path = os.path.join(out_dir, f"{sp_name}.glb")
    
    print(f"\n==================================================")
    print(f"[EXTRACT] Starting extraction for {sp_name.upper()}...")
    print(f"  Source: {src_file}")
    print(f"  Armature: {arm_name}")
    print(f"  Target: {out_path}")
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=src_file)
    
    arm = bpy.data.objects.get(arm_name)
    if not arm:
        print(f"ERROR: Armature '{arm_name}' not found for {sp_name}")
        continue
        
    skinned_meshes = [
        m for m in bpy.data.objects
        if m.type == 'MESH' and any(mod.type == 'ARMATURE' and mod.object == arm for mod in m.modifiers)
    ]
    print(f"  Found {len(skinned_meshes)} skinned meshes: {[m.name for m in skinned_meshes]}")
    
    # Unparent armature and zero out local transforms
    arm.parent = None
    arm.location = (0, 0, 0)
    arm.rotation_euler = (0, 0, 0)
    arm.scale = (1, 1, 1)
    
    # Clear bone custom shapes
    for b in arm.pose.bones:
        b.custom_shape = None
        
    # Delete all other objects from scene
    for obj in list(bpy.data.objects):
        if obj != arm and obj not in skinned_meshes:
            bpy.data.objects.remove(obj, do_unlink=True)
            
    # Purge unlinked mesh data (e.g. Icospheres)
    for m in list(bpy.data.meshes):
        if m.users == 0:
            bpy.data.meshes.remove(m)
            
    # Purge unlinked materials / textures / images if unreferenced
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat)
            
    # Select only arm and skinned meshes
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    for m in skinned_meshes:
        m.select_set(True)
    bpy.context.view_layer.objects.active = arm
    
    # Export cleanly to GLB
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_selection=True,
        export_format='GLB',
        export_yup=True,
        export_apply=False,
        export_animations=True,
        export_skins=True,
        export_morph=True
    )
    
    fsize = os.path.getsize(out_path)
    print(f"[SUCCESS] Exported {out_path} ({fsize:,} bytes)")

print("\n[COMPLETE] All 9 species successfully extracted!")
