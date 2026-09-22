import bpy
import sys
import os
import zipfile
import math
from mathutils import Vector, Matrix

def log(msg):
    print(f"[EEVEE-PIPELINE] {msg}")

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)

def unpack_zip(zip_path, extract_dir):
    log(f"Unpacking {zip_path} -> {extract_dir}")
    os.makedirs(extract_dir, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    return extract_dir

def find_model_file(directory):
    for root, _, files in os.walk(directory):
        for f in files:
            ext = f.lower().split('.')[-1]
            if ext in ['gltf', 'glb', 'fbx', 'obj', 'blend']:
                return os.path.join(root, f)
    return None

def import_model(file_path):
    log(f"Importing: {file_path}")
    ext = file_path.lower().split('.')[-1]
    if ext in ['gltf', 'glb']:
        bpy.ops.import_scene.gltf(filepath=file_path)
    elif ext == 'fbx':
        bpy.ops.import_scene.fbx(filepath=file_path)
    elif ext == 'obj':
        try:
            bpy.ops.wm.obj_import(filepath=file_path)
        except Exception:
            bpy.ops.import_scene.obj(filepath=file_path)
    elif ext == 'blend':
        with bpy.data.libraries.load(file_path) as (data_from, data_to):
            data_to.objects = data_from.objects
        for obj in data_to.objects:
            if obj is not None:
                bpy.context.scene.collection.objects.link(obj)
    else:
        raise ValueError(f"Unsupported format: {ext}")

def inspect_scene_objects():
    objects = [obj for obj in bpy.context.scene.objects if obj.type in ['MESH', 'ARMATURE']]
    log(f"Found {len(objects)} mesh/armature objects in scene:")
    for obj in objects:
        bbox = [Vector(corner) for corner in obj.bound_box]
        min_c = Vector((min(c.x for c in bbox), min(c.y for c in bbox), min(c.z for c in bbox)))
        max_c = Vector((max(c.x for c in bbox), max(c.y for c in bbox), max(c.z for c in bbox)))
        size = max_c - min_c
        log(f" - [{obj.type}] '{obj.name}' parent={obj.parent.name if obj.parent else 'None'} size=({size.x:.2f}, {size.y:.2f}, {size.z:.2f})")
    return objects

def export_character(name, target_objects, output_path, target_height=1.2):
    log(f"Processing and exporting '{name}' -> {output_path}")
    
    # Deselect all
    bpy.ops.object.select_all(action='DESELECT')
    for obj in target_objects:
        obj.select_set(True)
    
    # Calculate bounding box of all target objects combined
    min_x = min_y = min_z = float('inf')
    max_x = max_y = max_z = float('-inf')
    
    for obj in target_objects:
        matrix = obj.matrix_world
        for corner in obj.bound_box:
            world_corner = matrix @ Vector(corner)
            min_x = min(min_x, world_corner.x)
            max_x = max(max_x, world_corner.x)
            min_y = min(min_y, world_corner.y)
            max_y = max(max_y, world_corner.y)
            min_z = min(min_z, world_corner.z)
            max_z = max(max_z, world_corner.z)
            
    center_x = (min_x + max_x) / 2.0
    center_y = (min_y + max_y) / 2.0
    height_z = max_z - min_z
    depth_y = max_y - min_y
    
    # In Blender: Z is up. In Three.js: Y is up.
    # GLTF exporter automatically converts Blender Z-up to glTF Y-up.
    # We ground min_z to 0, and center X and Y at 0.
    scale_factor = target_height / max(height_z, 0.001) if height_z > 0 else 1.0
    
    # Create an anchor empty
    anchor = bpy.data.objects.new(f"{name}_Root", None)
    bpy.context.scene.collection.objects.link(anchor)
    
    for obj in target_objects:
        if obj.parent is None:
            # Apply offset to place feet at Z=0 and center at X=0, Y=0
            obj.location.x -= center_x
            obj.location.y -= center_y
            obj.location.z -= min_z
            obj.scale *= scale_factor
            obj.parent = anchor
            
    bpy.ops.object.select_all(action='DESELECT')
    anchor.select_set(True)
    for obj in target_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = anchor
    
    # Export as GLB
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        use_selection=True,
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        export_animations=True,
        export_skins=True,
        export_morph=True
    )
    log(f"Successfully exported: {output_path} ({os.path.getsize(output_path)} bytes)")

def run():
    argv = sys.argv
    if "--" in argv:
        args = argv[argv.index("--") + 1:]
    else:
        args = []
        
    source_input = args[0] if len(args) > 0 else "assets/source"
    output_dir = args[1] if len(args) > 1 else "assets/models"
    
    clean_scene()
    
    if os.path.isfile(source_input) and source_input.lower().endswith('.zip'):
        extract_dir = os.path.join(os.path.dirname(source_input), "unpacked")
        unpack_zip(source_input, extract_dir)
        model_file = find_model_file(extract_dir)
    elif os.path.isdir(source_input):
        model_file = find_model_file(source_input)
    else:
        model_file = source_input
        
    if not model_file or not os.path.exists(model_file):
        log(f"No valid model file found in: {source_input}")
        return
        
    import_model(model_file)
    objects = inspect_scene_objects()
    
    # Map species names to candidate objects
    species_names = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon']
    matched = {}
    
    for sp in species_names:
        matched[sp] = [obj for obj in objects if sp in obj.name.lower()]
        
    for sp, objs in matched.items():
        if objs:
            out_file = os.path.join(output_dir, f"{sp}.glb")
            target_h = 0.95 if sp == 'eevee' else 1.25
            export_character(sp, objs, out_file, target_height=target_h)
        else:
            log(f"Warning: No matching objects found for '{sp}' in primary source.")

if __name__ == "__main__":
    run()
