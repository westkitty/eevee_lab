import bpy
import sys
import os
import math
from mathutils import Vector

def render_glb(glb_path, out_img_path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Remove any Icosphere helper objects created by gltf addon
    for o in list(bpy.data.objects):
        if 'Ico' in o.name or 'icosphere' in o.name.lower():
            bpy.data.objects.remove(o, do_unlink=True)
            
    # Calculate bounding box of all imported mesh objects
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        print(f"No meshes found in GLB: {glb_path}")
        return
        
    depsgraph = bpy.context.evaluated_depsgraph_get()
    all_coords = []
    for m in meshes:
        m_eval = m.evaluated_get(depsgraph)
        mesh_data = m_eval.to_mesh()
        mat = m_eval.matrix_world
        for v in mesh_data.vertices:
            all_coords.append(mat @ v.co)
        m_eval.to_mesh_clear()
        
    min_x = min(v.x for v in all_coords)
    max_x = max(v.x for v in all_coords)
    min_y = min(v.y for v in all_coords)
    max_y = max(v.y for v in all_coords)
    min_z = min(v.z for v in all_coords)
    max_z = max(v.z for v in all_coords)
    
    center = Vector(((min_x + max_x) / 2.0, (min_y + max_y) / 2.0, (min_z + max_z) / 2.0))
    height = max_z - min_z
    depth = max_y - min_y
    width = max_x - min_x
    radius = max(height, depth, width)
    print(f"Loaded {os.path.basename(glb_path)}: Center={center}, Radius={radius:.3f}, Bounds=[({min_x:.2f},{min_y:.2f},{min_z:.2f}) -> ({max_x:.2f},{max_y:.2f},{max_z:.2f})]")
    
    # Add Studio 3-point Lighting
    light_key = bpy.data.objects.new("KeyLight", bpy.data.lights.new("KeyLight", 'SUN'))
    light_key.data.energy = 3.5
    light_key.rotation_euler = (math.radians(50), math.radians(20), math.radians(-45))
    bpy.context.scene.collection.objects.link(light_key)
    
    light_fill = bpy.data.objects.new("FillLight", bpy.data.lights.new("FillLight", 'SUN'))
    light_fill.data.energy = 1.8
    light_fill.rotation_euler = (math.radians(45), math.radians(-30), math.radians(135))
    bpy.context.scene.collection.objects.link(light_fill)
    
    light_rim = bpy.data.objects.new("RimLight", bpy.data.lights.new("RimLight", 'SUN'))
    light_rim.data.energy = 2.5
    light_rim.rotation_euler = (math.radians(-30), 0, math.radians(180))
    bpy.context.scene.collection.objects.link(light_rim)
    
    # Add Camera (front 3/4 view)
    cam_data = bpy.data.cameras.new("RenderCam")
    cam = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    
    # Position camera looking at center
    cam_dist = radius * 1.8
    cam.location = center + Vector((cam_dist * 0.7, -cam_dist * 0.9, radius * 0.45))
    
    # Point camera at center
    direction = center - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()
    
    # Render settings
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
    scene.render.film_transparent = True
    scene.render.filepath = out_img_path
    
    os.makedirs(os.path.dirname(out_img_path), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print(f"Saved preview render to: {out_img_path}")

def render_all():
    species_list = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon']
    out_dir = "/Users/andrew/.gemini/antigravity/brain/82942612-b373-4a12-8faf-ce167d7a8e77/renders/models"
    for sp in species_list:
        glb = os.path.abspath(f"assets/models/{sp}.glb")
        img = os.path.join(out_dir, f"{sp}.png")
        if os.path.exists(glb):
            print(f"\n--- Rendering preview for {sp} ---")
            render_glb(glb, img)

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[-2].endswith('.glb'):
        render_glb(sys.argv[-2], sys.argv[-1])
    else:
        render_all()
