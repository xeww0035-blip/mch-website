import bpy
import json
import math
import os
import sys
from collections import defaultdict
from mathutils import Matrix


def argument(name: str) -> str:
    if name not in sys.argv:
        raise RuntimeError(f'Missing argument: {name}')
    return sys.argv[sys.argv.index(name) + 1]


source = os.path.abspath(argument('--source'))
destination = os.path.abspath(argument('--destination'))
os.makedirs(destination, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=source, load_ui=False, use_scripts=False)
bpy.context.scene.frame_set(bpy.context.scene.frame_start)
depsgraph = bpy.context.evaluated_depsgraph_get()
depsgraph.update()

for image in bpy.data.images:
    width, height = image.size[:]
    longest = max(width, height)
    if longest > 256 and width > 0 and height > 0:
        ratio = 256 / longest
        image.scale(max(1, round(width * ratio)), max(1, round(height * ratio)))


foreground_prototypes = {
    'Circle.004', 'Circle.006', 'Circle.007',
    'Circle.005', 'Circle.008', 'Circle.009', 'Circle.010',
    'Cube.002', 'Cube.003', 'Cube.005',
}

hero_trees = {'Circle.003'} | {f'Circle.{index:03d}' for index in range(11, 27)}

chunks = {
    'world-core.glb': {'Landscape.003', 'Landscape.004', 'Landscape_plane'},
    'mountain.glb': {'Landscape', 'Landscape.001', 'Landscape.002'},
    'cabin.glb': {'Cube', 'Cube.001'},
    # Keep one original high-detail tree geometry and restore all 17 Blender
    # placements as web instances instead of duplicating the mesh 17 times.
    'hero-trees.glb': {'Circle.003'},
    'foreground-prototypes.glb': foreground_prototypes,
}


# Preserve the actual Blender particle placement before modifying emitters.
# Blender -> glTF/Three coordinate basis: (x, y, z) -> (x, z, -y).
conversion = Matrix.Rotation(math.radians(-90), 4, 'X')
conversion_inverse = conversion.inverted()
instance_groups = defaultdict(list)

for instance in depsgraph.object_instances:
    if not instance.is_instance or not instance.parent:
        continue
    parent_name = instance.parent.original.name
    prototype_name = instance.object.original.name
    if parent_name not in {'Landscape.003', 'Landscape.004'} or prototype_name not in foreground_prototypes:
        continue
    web_matrix = conversion @ instance.matrix_world @ conversion_inverse
    location, rotation, scale = web_matrix.decompose()
    instance_groups[prototype_name].append({
        'position': [round(value, 5) for value in location],
        'quaternion': [round(rotation.x, 6), round(rotation.y, 6), round(rotation.z, 6), round(rotation.w, 6)],
        'scale': [round(value, 6) for value in scale],
    })

target_counts = {
    'Circle.006': 90,
    'Circle.007': 45,
    'Circle.004': 18,
    'Circle.005': 65,
    'Circle.008': 65,
    'Circle.009': 65,
    'Circle.010': 65,
    'Cube.002': 25,
    'Cube.003': 25,
    'Cube.005': 25,
}

sampled_instances = []
for prototype_name, transforms in sorted(instance_groups.items()):
    target = min(target_counts.get(prototype_name, len(transforms)), len(transforms))
    for index in range(target):
        source_index = min(len(transforms) - 1, math.floor(index * len(transforms) / target))
        sampled_instances.append({'prototype': prototype_name, **transforms[source_index]})

instances_path = os.path.join(destination, 'foreground-instances.json')
with open(instances_path, 'w', encoding='utf-8') as handle:
    json.dump({'version': 1, 'instances': sampled_instances}, handle, separators=(',', ':'))
print(f'WORLD_INSTANCES_EXPORTED count={len(sampled_instances)} path={instances_path}')

hero_tree_instances = []
for object_name in sorted(hero_trees):
    obj = bpy.data.objects.get(object_name)
    if not obj:
        continue
    web_matrix = conversion @ obj.matrix_world @ conversion_inverse
    location, rotation, scale = web_matrix.decompose()
    hero_tree_instances.append({
        'prototype': 'Circle.003',
        'position': [round(value, 5) for value in location],
        'quaternion': [round(rotation.x, 6), round(rotation.y, 6), round(rotation.z, 6), round(rotation.w, 6)],
        'scale': [round(value, 6) for value in scale],
    })

hero_instances_path = os.path.join(destination, 'hero-tree-instances.json')
with open(hero_instances_path, 'w', encoding='utf-8') as handle:
    json.dump({'version': 1, 'instances': hero_tree_instances}, handle, separators=(',', ':'))
print(f'WORLD_HERO_TREES_EXPORTED count={len(hero_tree_instances)} path={hero_instances_path}')


all_asset_names = set().union(*chunks.values())
asset_objects = [
    obj for obj in bpy.context.scene.objects
    if obj.type == 'MESH' and obj.name in all_asset_names
]


def activate(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


for obj in asset_objects:
    # Particle systems are rebuilt as InstancedMesh in the browser. Removing
    # only the modifiers keeps the emitter surface without destroying it.
    for modifier in list(obj.modifiers):
        if modifier.type == 'PARTICLE_SYSTEM':
            obj.modifiers.remove(modifier)

    activate(obj)
    for modifier in list(obj.modifiers):
        if modifier.type == 'SUBSURF':
            modifier.levels = min(modifier.levels, 1)
            modifier.render_levels = min(modifier.render_levels, 1)
        if modifier.type in {'SUBSURF', 'DISPLACE'}:
            try:
                bpy.ops.object.modifier_apply(modifier=modifier.name)
            except RuntimeError:
                print(f'WORLD_MODIFIER_SKIPPED object={obj.name} modifier={modifier.name}')

    polygon_count = len(obj.data.polygons)
    if obj.name in {'Landscape.003', 'Landscape.004'}:
        target_polygons = 18000
    elif obj.name in hero_trees:
        target_polygons = 8500
    elif obj.name.startswith('Landscape'):
        target_polygons = 14000
    else:
        target_polygons = 9000

    if polygon_count > target_polygons:
        modifier = obj.modifiers.new(name='WebChunkDecimate', type='DECIMATE')
        modifier.ratio = max(0.12, min(0.9, target_polygons / polygon_count))
        bpy.ops.object.modifier_apply(modifier=modifier.name)

for filename, names in chunks.items():
    bpy.ops.object.select_all(action='DESELECT')
    objects = [obj for obj in asset_objects if obj.name in names]
    if not objects:
        print(f'WORLD_CHUNK_SKIPPED filename={filename}')
        continue

    if filename in {'foreground-prototypes.glb', 'hero-trees.glb'}:
        # Particle instance matrices already contain placement. Export the
        # prototype nodes at identity so Three.js can reuse their geometry.
        for obj in objects:
            obj.matrix_world = Matrix.Identity(4)

    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    output = os.path.join(destination, filename)
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_materials='EXPORT',
        export_image_format='WEBP',
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,
    )
    size_mb = os.path.getsize(output) / (1024 * 1024)
    print(f'WORLD_CHUNK_EXPORTED filename={filename} objects={len(objects)} size_mb={size_mb:.2f}')
