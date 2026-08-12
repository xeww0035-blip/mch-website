import bpy
import os
import sys


def argument(name: str) -> str:
    if name not in sys.argv:
        raise RuntimeError(f'Missing argument: {name}')
    index = sys.argv.index(name) + 1
    return sys.argv[index]


source = os.path.abspath(argument('--source'))
destination = os.path.abspath(argument('--destination'))
os.makedirs(os.path.dirname(destination), exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=source, load_ui=False, use_scripts=False)
bpy.ops.object.select_all(action='DESELECT')

selected = 0
for obj in bpy.context.scene.objects:
    # Blender's aurora/volume helpers are giant camera-facing planes. They
    # are recreated by the web shader, so exclude them from the GLB.
    if obj.type != 'MESH' or obj.hide_render or obj.hide_viewport or (obj.name.startswith('Plane') and obj.name not in {'Plane.006', 'Plane.007', 'Plane.008'}):
        continue
    obj.select_set(True)
    selected += 1

# The source scene is authored for Blender rendering. Keep the composition,
# but make the browser payload deterministic: resize large embedded textures
# and cap dense meshes before glTF extraction.
for image in bpy.data.images:
    width, height = image.size[:]
    longest = max(width, height)
    if longest > 1024 and width > 0 and height > 0:
        scale = 1024 / longest
        image.scale(max(1, round(width * scale)), max(1, round(height * scale)))

for obj in bpy.context.scene.objects:
    if obj.type != 'MESH' or obj.hide_render or obj.hide_viewport or (obj.name.startswith('Plane') and obj.name not in {'Plane.006', 'Plane.007', 'Plane.008'}):
        continue
    polygon_count = len(obj.data.polygons)
    if polygon_count <= 16000:
        continue
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    modifier = obj.modifiers.new(name='WebDecimate', type='DECIMATE')
    modifier.ratio = max(0.22, min(0.72, 16000 / polygon_count))
    bpy.ops.object.modifier_apply(modifier=modifier.name)

if selected == 0:
    raise RuntimeError('No visible mesh objects found in source scene')

bpy.context.view_layer.objects.active = next(obj for obj in bpy.context.selected_objects if obj.type == 'MESH')

bpy.ops.export_scene.gltf(
    filepath=destination,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    export_materials='EXPORT',
    export_image_format='WEBP',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)

print(f'WORLD_GLTF_EXPORTED objects={selected} destination={destination}')
