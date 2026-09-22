import bpy
import os
from mathutils import Vector, Matrix

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf")

# Let's inspect GLTF_created_0 (Umbreon)
arm = bpy.data.objects.get("GLTF_created_0")
assert arm is not None, "GLTF_created_0 not found"

# Find all meshes that use this armature
skinned_meshes = []
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for mod in obj.modifiers:
            if mod.type == 'ARMATURE' and mod.object == arm:
                skinned_meshes.append(obj)
                break
print(f"Found {len(skinned_meshes)} skinned meshes for {arm.name}: {[m.name for m in skinned_meshes]}")

# Force depsgraph update
depsgraph = bpy.context.evaluated_depsgraph_get()

# Compute world-space bounding box using evaluated mesh vertices
all_world_coords = []
for m in skinned_meshes:
    m_eval = m.evaluated_get(depsgraph)
    mesh_data = m_eval.to_mesh()
    mat = m_eval.matrix_world
    for v in mesh_data.vertices:
        all_world_coords.append(mat @ v.co)
    m_eval.to_mesh_clear()

print(f"Total evaluated vertices: {len(all_world_coords)}")
min_x = min(v.x for v in all_world_coords)
max_x = max(v.x for v in all_world_coords)
min_y = min(v.y for v in all_world_coords)
max_y = max(v.y for v in all_world_coords)
min_z = min(v.z for v in all_world_coords)
max_z = max(v.z for v in all_world_coords)

center_x = (min_x + max_x) / 2.0
center_y = (min_y + max_y) / 2.0
height = max_z - min_z
target_height = 1.25
scale = target_height / height

print(f"BBox: X=[{min_x:.2f}, {max_x:.2f}], Y=[{min_y:.2f}, {max_y:.2f}], Z=[{min_z:.2f}, {max_z:.2f}]")
print(f"Center: ({center_x:.2f}, {center_y:.2f}), Height: {height:.2f}, Target: {target_height:.2f}, Scale: {scale:.4f}")

# Now unparent arm from any scene diorama, preserving its world matrix
orig_world_mat = arm.matrix_world.copy()
arm.parent = None
arm.matrix_world = orig_world_mat

# Transformation matrix to center at X=0, Y=0, ground min_z to 0, and scale to target_height
# In Blender, Z is up, Y is back/front, X is left/right.
# When glTF exporter runs with export_yup=True, Blender Z becomes glTF Y, Blender -Y becomes glTF Z.
# Let's check which way Umbreon is facing in Blender:
# In our previous render of Umbreon, let's see its orientation.
# If we apply translation and scale:
# New world matrix for arm:
# T_inv translates (center_x, center_y, min_z) to (0, 0, 0)
T_to_origin = Matrix.Translation(Vector((-center_x, -center_y, -min_z)))
S = Matrix.Diagonal(Vector((scale, scale, scale, 1.0)))
new_world_mat = S @ T_to_origin @ orig_world_mat

arm.matrix_world = new_world_mat

# Also for any skinned meshes whose parent was not arm:
for m in skinned_meshes:
    if m.parent != arm:
        m_world = m.matrix_world.copy()
        m.parent = arm
        m.matrix_world = S @ T_to_origin @ m_world

# Clear all bone custom shapes
for b in arm.pose.bones:
    b.custom_shape = None

# Delete all other objects in scene to keep export clean
for obj in list(bpy.data.objects):
    if obj != arm and obj not in skinned_meshes:
        bpy.data.objects.remove(obj, do_unlink=True)

# Also remove any orphan meshes like Icosphere
for m in list(bpy.data.meshes):
    if m.users == 0:
        bpy.data.meshes.remove(m)

# Select only arm and skinned meshes
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
for m in skinned_meshes:
    m.select_set(True)
bpy.context.view_layer.objects.active = arm

os.makedirs("assets/models", exist_ok=True)
out_path = os.path.abspath("assets/models/umbreon_test.glb")
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
print(f"Exported to {out_path}, size: {os.path.getsize(out_path)} bytes")
