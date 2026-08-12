import bpy
import sys
from collections import Counter
from mathutils import Vector

source = sys.argv[sys.argv.index('--source') + 1]
bpy.ops.wm.open_mainfile(filepath=source, load_ui=False, use_scripts=False)
bpy.context.scene.frame_set(bpy.context.scene.frame_start)
depsgraph = bpy.context.evaluated_depsgraph_get()
depsgraph.update()

for collection_name in ('Small Pines', 'bushes', 'Rocks'):
    collection = bpy.data.collections.get(collection_name)
    if not collection:
        continue
    for obj in collection.objects:
        if obj.type != 'MESH':
            continue
        dimensions = tuple(round(value, 2) for value in obj.dimensions)
        print(
            f'WORLD_COLLECTION name={collection_name!r} object={obj.name!r} '
            f'dims={dimensions} polygons={len(obj.data.polygons)} hide_render={obj.hide_render}'
        )

for obj in bpy.context.scene.objects:
    if obj.type == 'CAMERA':
        location = tuple(round(value, 2) for value in obj.matrix_world.translation)
        rotation = tuple(round(value, 4) for value in obj.matrix_world.to_euler())
        print(
            f'WORLD_CAMERA name={obj.name!r} location={location} rotation={rotation} '
            f'lens={round(obj.data.lens, 2)} clip=({obj.data.clip_start},{obj.data.clip_end})'
        )
for obj in bpy.context.scene.objects:
    if obj.type != 'MESH':
        continue
    dimensions = tuple(round(value, 2) for value in obj.dimensions)
    location = tuple(round(value, 2) for value in obj.matrix_world.translation)
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    bounds_min = tuple(round(min(corner[index] for corner in corners), 2) for index in range(3))
    bounds_max = tuple(round(max(corner[index] for corner in corners), 2) for index in range(3))
    polygons = len(obj.data.polygons)
    materials = ','.join(material.name for material in obj.data.materials if material)
    modifiers = ','.join(f'{modifier.name}:{modifier.type}' for modifier in obj.modifiers)
    print(
        f'WORLD_OBJECT name={obj.name!r} location={location} dims={dimensions} '
        f'bounds_min={bounds_min} bounds_max={bounds_max} polygons={polygons} '
        f'materials={materials!r} modifiers={modifiers!r}'
    )
    evaluated_obj = obj.evaluated_get(depsgraph)
    for system in evaluated_obj.particle_systems:
        settings = system.settings
        instance_object = settings.instance_object.name if settings.instance_object else None
        instance_collection = settings.instance_collection.name if settings.instance_collection else None
        print(
            f'WORLD_PARTICLES emitter={obj.name!r} name={system.name!r} count={settings.count} '
            f'render_type={settings.render_type!r} instance_object={instance_object!r} '
            f'instance_collection={instance_collection!r} hair_length={round(settings.hair_length, 3)} '
            f'children={settings.child_percent}/{settings.rendered_child_count}'
        )
        particles = list(system.particles)
        if particles:
            mins = tuple(round(min(particle.location[index] for particle in particles), 2) for index in range(3))
            maxs = tuple(round(max(particle.location[index] for particle in particles), 2) for index in range(3))
            sample = particles[0]
            print(
                f'WORLD_PARTICLE_BOUNDS emitter={obj.name!r} name={system.name!r} '
                f'min={mins} max={maxs} sample_location={tuple(round(value, 2) for value in sample.location)} '
                f'sample_size={round(sample.size, 3)} sample_rotation={tuple(round(value, 3) for value in sample.rotation)}'
            )

instance_counts = Counter()
instance_samples = {}
for instance in depsgraph.object_instances:
    if not instance.is_instance or not instance.parent:
        continue
    parent_name = instance.parent.original.name
    if parent_name not in {'Landscape.003', 'Landscape.004'}:
        continue
    object_name = instance.object.original.name
    key = (parent_name, object_name)
    instance_counts[key] += 1
    if key not in instance_samples:
        location, rotation, scale = instance.matrix_world.decompose()
        instance_samples[key] = (
            tuple(round(value, 2) for value in location),
            tuple(round(value, 3) for value in scale),
        )

for (parent_name, object_name), count in instance_counts.items():
    print(
        f'WORLD_INSTANCE parent={parent_name!r} object={object_name!r} count={count} '
        f'sample={instance_samples[(parent_name, object_name)]}'
    )
