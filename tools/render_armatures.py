import bpy
import os
import math
from mathutils import Vector

output_dir = "/Users/andrew/.gemini/antigravity/brain/82942612-b373-4a12-8faf-ce167d7a8e77/renders/armatures"
os.makedirs(output_dir, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="assets/source/886732730f9048b990d4220ca01db24a_unpacked/scene.gltf")

# Hide all non-mesh / non-armature objects (like room furniture, bed, TV, etc.)
furniture_keywords = ['firered', 'bed', 'chair', 'table', 'carpet', 'bookshelf', 'computer', 'dresser', 'nes', 'railing', 'stairs', 'tv', 'wall', 'icosphere']

armatures = sorted([obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE'], key=lambda a: a.name)

# Set up render camera & lights
cam_data = bpy.data.cameras.new(name="RenderCam")
cam_obj = bpy.data.objects.new(name="RenderCam", object_data=cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

light_data = bpy.data.lights.new(name="RenderSun", type='SUN')
light_data.energy = 3.0
light_obj = bpy.data.objects.new(name="RenderSun", object_data=light_data)
light_obj.rotation_euler = (math.radians(45), math.radians(30), 0)
bpy.context.scene.collection.objects.link(light_obj)

bpy.context.scene.render.resolution_x = 512
bpy.context.scene.render.resolution_y = 512
bpy.context.scene.render.film_transparent = True

# Disable all objects first
for obj in bpy.context.scene.objects:
    if obj not in [cam_obj, light_obj]:
        obj.hide_render = True

for idx, arm in enumerate(armatures):
    # Find all meshes belonging to this armature
    meshes = [child for child in bpy.context.scene.objects if child.parent == arm and child.type == 'MESH']
    if not meshes:
        continue
        
    # Calculate bounding box in world space
    min_x = min_y = min_z = float('inf')
    max_x = max_y = max_z = float('-inf')
    
    for m in meshes:
        m.hide_render = False
        for corner in m.bound_box:
            wc = m.matrix_world @ Vector(corner)
            min_x = min(min_x, wc.x)
            max_x = max(max_x, wc.x)
            min_y = min(min_y, wc.y)
            max_y = max(max_y, wc.y)
            min_z = min(min_z, wc.z)
            max_z = max(max_z, wc.z)
            
    center = Vector(((min_x + max_x) / 2.0, (min_y + max_y) / 2.0, (min_z + max_z) / 2.0))
    size = Vector((max_x - min_x, max_y - min_y, max_z - min_z))
    max_dim = max(size.x, size.y, size.z, 0.1)
    
    # Position camera looking at center from front 3/4
    dist = max_dim * 2.2
    cam_obj.location = center + Vector((dist * 0.7, -dist * 0.7, dist * 0.5))
    
    # Track to center
    direction = center - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    
    out_png = os.path.join(output_dir, f"armature_{idx}_{arm.name}.png")
    bpy.context.scene.render.filepath = out_png
    bpy.ops.render.render(write_still=True)
    print(f"Rendered armature {idx} ({arm.name}) -> {out_png}")
    
    # Hide meshes again
    for m in meshes:
        m.hide_render = True
