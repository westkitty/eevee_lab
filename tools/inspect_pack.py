import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf")

for arm in sorted([o for o in bpy.context.scene.objects if o.type == 'ARMATURE'], key=lambda x: x.name):
    meshes = [c for c in bpy.context.scene.objects if c.parent == arm and c.type == 'MESH']
    tex_list = []
    mat_list = []
    for m in meshes:
        for s in m.material_slots:
            if s.material:
                mat_list.append(s.material.name)
                if s.material.use_nodes:
                    for n in s.material.node_tree.nodes:
                        if n.type == 'TEX_IMAGE' and n.image:
                            tex_list.append(n.image.name)
    parent_name = arm.parent.name if arm.parent else "None"
    print(f"{arm.name:15s} (parent: {parent_name:25s})")
    print(f"   Meshes: {[m.name for m in meshes]}")
    print(f"   Materials: {set(mat_list)}")
    print(f"   Textures: {set(tex_list)}")

print("\n=== OTHER MESHES NOT UNDER ARMATURES ===")
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH' and (not obj.parent or obj.parent.type != 'ARMATURE'):
        if 'fireRed' not in obj.name and 'fireRed' not in (obj.parent.name if obj.parent else ''):
            print(f" - {obj.name} parent={obj.parent.name if obj.parent else 'None'}")
