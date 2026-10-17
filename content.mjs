// Editorial content. Every claim carries a source link. Dates are when we checked.
export const CHECKED = '2026-10-17';

// s(text, url) = a sourced statement. Rendered as text + [source] link.
const s = (text, url) => ({ text, url });

export const GUIDES = [
  {
    slug: 'ai-3d-model-to-engine',
    title: 'AI 3D model to game engine: generate, clean up in Blender, import',
    description: 'A sourced workflow for taking an AI-generated 3D model through Blender cleanup and retopology into Unity, Godot or Unreal.',
    tools: ['meshy', 'tripo', 'hyper3d-rodin', 'sloyd', 'hunyuan3d'],
    // Display metadata (summarises the steps below; no new facts): task = category art + filter, engines = engines the steps cover.
    task: '3d-models', engines: ['unity', 'godot', 'unreal'],
    // flow: short pipeline stages for the visual strip on guide cards/pages; `ai: true` stages show the guide's AI tool logos.
    hero: 'guide-3d-to-engine',
    flow: [{ label: 'Generate', ai: true }, { label: 'Export GLB/FBX' }, { label: 'Clean up in Blender' }, { label: 'Retopo + UV bake' }, { label: 'Import to engine' }],
    outcome: 'An AI-generated 3D model, cleaned up and reduced in Blender, UV-unwrapped with baked detail, and imported into Unity, Godot or Unreal.',
    intro: 'AI 3D generators give you a mesh fast, but it usually needs cleanup before it works well in a game. Here are the steps, each linked to the official documentation for that tool.',
    steps: [
      { h: 'Check the licence before you generate', p: [s('Commercial rights often depend on the plan. For example, Tripo\'s free plan is non-commercial, and Meshy\'s free plan licenses outputs under CC BY 4.0. Check the tool page for the source.', '/tools/tripo/')] },
      { h: 'Export in an engine-friendly format', p: [
        s('Meshy\'s API can output GLB, FBX, OBJ, USDZ, BLEND, STL and 3MF (only GLB unless you request others).', 'https://docs.meshy.ai/en/api/remesh'),
        s('Some generators can remesh before download. Meshy\'s Remesh API takes a target polycount (default 30,000) and a quad-dominant or triangle topology.', 'https://docs.meshy.ai/en/api/remesh') ] },
      { h: 'Import into Blender and clean up', p: [
        s('Import FBX through Blender\'s FBX importer (File › Import).', 'https://docs.blender.org/manual/en/latest/files/import_export/fbx.html'),
        s('Use Mesh › Clean Up tools (such as Merge by Distance) to remove duplicate vertices and degenerate geometry.', 'https://docs.blender.org/manual/en/latest/modeling/meshes/editing/mesh/cleanup.html'),
        s('Apply rotation and scale (Object › Apply) so transforms export cleanly.', 'https://docs.blender.org/manual/en/latest/scene_layout/object/editing/apply.html') ] },
      { h: 'Reduce or retopologise the mesh', p: [
        s('The Decimate modifier lowers the face count of a mesh that otherwise has no geometry problems.', 'https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/decimate.html'),
        s('For new topology, Blender\'s retopology tools include a Voxel remesher and a Quad remesher (QuadriFlow algorithm, slower but often cleaner).', 'https://docs.blender.org/manual/en/latest/modeling/meshes/retopology.html') ] },
      { h: 'UV unwrap and bake detail', p: [
        s('UV unwrap the low-poly mesh.', 'https://docs.blender.org/manual/en/latest/modeling/meshes/uv/unwrapping/index.html'),
        s('In Cycles, "Selected to Active" bakes detail from the high-poly (selected) object onto the low-poly (active) object, for example as a normal map.', 'https://docs.blender.org/manual/en/latest/render/cycles/baking.html') ] },
      { h: 'Import into your engine', p: [
        s('Unity: FBX is Unity\'s primary supported model format; exporting FBX straight into the Assets folder is the recommended approach.', 'https://docs.unity3d.com/Manual/ImportingModelFiles.html'),
        s('Godot: see the "Importing 3D scenes" guide for supported formats and import options.', 'https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/index.html'),
        s('Unreal Engine: see the FBX content pipeline documentation.', 'https://dev.epicgames.com/documentation/en-us/unreal-engine/fbx-content-pipeline') ] },
    ],
  },
  {
    slug: 'ai-voice-to-lip-sync',
    title: 'AI voice lines to lip-sync: TTS, then mouth animation',
    description: 'A sourced workflow for generating NPC voice lines with AI text-to-speech and driving lip-sync in 2D, Unity or Unreal.',
    tools: ['elevenlabs', 'inworld-ai', 'convai', 'charisma-ai'],
    task: 'voice', engines: ['unity', 'unreal'],
    hero: 'guide-voice-lipsync',
    flow: [{ label: 'Voice lines (TTS)', ai: true }, { label: 'Export audio' }, { label: 'Lip-sync tool' }, { label: 'Animate in engine' }],
    outcome: 'AI text-to-speech voice lines exported as audio, with lip-sync driven from that audio for 2D characters, Unity characters or Unreal MetaHumans.',
    intro: 'Generate the voice line first, then drive the mouth from the audio. Which lip-sync tool fits depends on your art style and engine.',
    steps: [
      { h: 'Use a plan that allows commercial use', p: [s('For example, ElevenLabs\' free plan is for non-commercial use only, and paid plans allow commercial use.', '/tools/elevenlabs/')] },
      { h: 'Generate and export the audio', p: [s('The ElevenLabs text-to-speech API defaults to MP3 (mp3_44100_128) and also offers PCM and other output formats.', 'https://elevenlabs.io/docs/api-reference/text-to-speech/convert')] },
      { h: '2D characters: Rhubarb Lip Sync', p: [
        s('Rhubarb Lip Sync analyses a recording and outputs mouth cues as TSV, XML, JSON or Moho .dat. It uses six basic mouth shapes (A–F) plus three optional extended shapes (G, H, X).', 'https://github.com/DanielSWolf/rhubarb-lip-sync') ] },
      { h: 'Unity 3D characters: uLipSync', p: [
        s('uLipSync (MIT licence) computes MFCCs from the playing AudioSource and drives SkinnedMeshRenderer blend shapes. It works in real time or as pre-baked data that you can convert to an AnimationClip.', 'https://github.com/hecomi/uLipSync') ] },
      { h: 'Unreal MetaHumans: audio-driven animation', p: [
        s('MetaHuman Animator\'s Audio Driven Animation turns a SoundWave asset into facial animation, either in real time or offline. The offline mode has extra controls for head movement, blinks and mood.', 'https://dev.epicgames.com/documentation/en-us/metahuman/audio-driven-animation') ] },
      { h: 'Other option: NVIDIA Audio2Face-3D', p: [s('NVIDIA publishes Audio2Face-3D models and tools on GitHub. Check each repo\'s own licence before you use it.', 'https://github.com/NVIDIA/Audio2Face-3D')] },
    ],
  },
  {
    slug: 'concept-to-texture-set',
    title: 'Concept art to a PBR texture set',
    description: 'A sourced workflow for turning AI concept or texture images into tileable PBR material maps for Unity, Godot or Unreal.',
    tools: ['scenario', 'layer-ai', 'leonardo-ai', 'meshy', 'unity-ai'],
    task: 'textures', engines: ['unity', 'godot', 'unreal'],
    hero: 'guide-texture-set',
    flow: [{ label: 'Tileable image', ai: true }, { label: 'Material maps' }, { label: 'Fix in Blender' }, { label: 'Engine material' }],
    outcome: 'A set of PBR material maps (base colour, normal, roughness or smoothness, metallic, AO) made from an AI image and set up as a material in Unity, Godot or Unreal.',
    intro: 'A concept image is not a material. Engines want a set of maps (albedo/base colour, normal, roughness or smoothness, metallic, AO). Here is a sourced route from an image to those maps.',
    steps: [
      { h: 'Generate a flat, tileable source image', p: [
        s('Some platforms target this directly. Layer lists "seamless textures" among its game-art agent skills.', 'https://layer.ai/agent-skills'),
        s('Check commercial terms on the tool page first. Scenario\'s free plan, for example, is personal/evaluation use only.', '/tools/scenario/') ] },
      { h: 'Convert the image into material maps', p: [
        s('Materialize (open source, GPL-3.0) is a program for converting images into materials for video games.', 'https://github.com/BoundingBoxSoftware/Materialize'),
        s('Or texture a mesh directly with an AI texturing tool. Meshy, for example, offers AI texturing and a Retexture API.', 'https://docs.meshy.ai/en/api') ] },
      { h: 'Bake or fix maps in Blender if needed', p: [s('Cycles baking can produce normal and other maps from geometry or shaders.', 'https://docs.blender.org/manual/en/latest/render/cycles/baking.html')] },
      { h: 'Set up the material in your engine', p: [
        s('Unity (Built-in Standard shader): metallic and specular workflows, with smoothness read from a chosen texture channel.', 'https://docs.unity3d.com/Manual/StandardShaderMaterialParameters.html'),
        s('Godot: StandardMaterial3D and ORMMaterial3D (occlusion, roughness and metallic packed into one texture).', 'https://docs.godotengine.org/en/stable/tutorials/3d/standard_material_3d.html'),
        s('Unreal Engine: texture import settings (compression and colour-space options for each map type).', 'https://dev.epicgames.com/documentation/en-us/unreal-engine/texture-import-settings-in-unreal-engine') ] },
    ],
  },
];

export const DISCLOSURE = {
  title: 'Steam AI-content disclosure (and other stores)',
  description: 'What Steam\'s Content Survey asks about generative AI, plus what itch.io, Epic Games Store and Google Play publish. Dated, with source links.',
  sections: [
    { h: 'Steam (Valve)', items: [
      s('Before review, you complete a Content Survey. Its third section covers generative AI in development or in the product.', 'https://partner.steamgames.com/doc/gettingstarted/contentsurvey'),
      s('Valve says efficiency gains from AI-powered dev tools are "not the focus" of the section. It is concerned with AI-created content that ships with the game and is consumed by players, such as artwork, sound, narrative and localisation.', 'https://partner.steamgames.com/doc/gettingstarted/contentsurvey'),
      s('Pre-Generated content (made with AI during development) is reviewed the same way as non-AI content, against your Steam Distribution Agreement promises: no illegal or infringing content, and consistency with your marketing materials.', 'https://partner.steamgames.com/doc/gettingstarted/contentsurvey'),
      s('Live-Generated content (made by AI while the game runs) has the same rules, plus you must describe the guardrails that stop it generating illegal content.', 'https://partner.steamgames.com/doc/gettingstarted/contentsurvey'),
      s('Valve does not currently ship Live-Generated AI in Adult Only Sexual Content games.', 'https://partner.steamgames.com/doc/gettingstarted/contentsurvey'),
      s('Valve revised and clarified this guidance in January 2026 (as reported by Game Developer on 16 January 2026).', 'https://www.gamedeveloper.com/business/valve-tweaks-and-clarifies-ai-disclosure-rules-for-steam') ] },
    { h: 'itch.io', items: [
      s('In a developer update dated 20 November 2024, itch.io added a "Generative AI disclosure" field covering Graphics, Sound, Text & Dialog and Code. Answering yes applies the "AI Generated" tag; answering no applies "No AI".', 'https://itch.io/t/4309690/generative-ai-disclosure-tagging'),
      s('The field is required for asset creators. Untagged assets made with generative AI are no longer eligible for indexing on browse pages.', 'https://itch.io/t/4309690/generative-ai-disclosure-tagging'),
      s('See also the AI disclosure section of itch.io\'s quality guidelines.', 'https://itch.io/docs/creators/quality-guidelines') ] },
    { h: 'Epic Games Store', items: [
      s('We found no generative-AI disclosure requirement in Epic\'s published store requirements (checked on the date below).', 'https://dev.epicgames.com/docs/epic-games-store/requirements-guidelines/distribution-requirements/requirements-overview'),
      s('Epic\'s "NoAI" and "CreatedWithAI" tags apply to marketplace assets, not store game listings.', 'https://marketplacehelp.epicgames.com/s/article/Introducing-the-NoAI-and-CreatedWithAI-tags?language=en_US') ] },
    { h: 'Google Play', items: [
      s('Google Play\'s AI-Generated Content policy covers apps that generate content with AI (for example from user prompts). Those apps must prevent restricted content and provide a way to report offensive AI output.', 'https://support.google.com/googleplay/android-developer/answer/14094294?hl=en') ] },
  ],
  note: 'This is a summary, not legal advice. Store rules change, so read the linked pages before you submit.',
};

// "New this week": real releases, newest first. Dates are the source's publication date, converted to Australia/Brisbane.
// Optional per item: type ('Launch' | 'Update' | 'Pricing change' | 'Licence change' | 'Funding'; otherwise inferred from the title,
// defaulting to 'Update') and why (one sourced line, "Why it matters for game devs"; omitted when not set).
export const NEWS = [
  { date: '2026-10-15', title: 'ElevenLabs launches Instant Soundtracks', tool: 'elevenlabs',
    text: 'Upload a video in ElevenCreative and get an original score plus sound effects placed at detected timestamps. In the API, separate_tracks returns music and SFX as separate files.',
    source: 'https://elevenlabs.io/blog/introducing-instant-soundtracks', sourceName: 'ElevenLabs blog' },
  { date: '2026-10-15', title: 'Scenario open-sources a Blender extension for AI agents', tool: 'scenario',
    text: 'Scenario\'s CEO announced on 14 October an open-source Blender extension that lets AI agents inspect and edit scenes, build camera paths and request renders. Generation still runs on Scenario\'s online service.',
    source: 'https://runtimewire.com/article/scenario-blender-agent-plugin', sourceName: 'RuntimeWire' },
  { date: '2026-10-14', title: 'Meshy introduces an Ultra 4K mode', tool: 'meshy',
    text: 'A new generation mode that produces models with up to 80 million triangles before simplification, alongside the Standard and Ultra 2K modes. Exact launch date: unverified (date shown is when it was reported).',
    source: 'https://digestai.news/story/meshy-introduces-ultra-4k-for-3d-models-with-80m-triangles', sourceName: 'DigestAI' },
  { date: '2026-10-10', title: 'Meta unveils Horizon Create and Horizon Studio', tool: null,
    text: 'Two AI game-authoring tools, a mobile app and a browser editor, for building 2D and 3D games from natural-language prompts and publishing to Facebook, Instagram and Horizon. Both are in early access via a waitlist.',
    source: 'https://www.gamedevwire.com/articles/meta-launches-horizon-create-and-studio-for-ai-driven-mobile-game-development-4ae6a900', sourceName: 'Game Dev Wire' },
];

// Comparison pairs: rendered only from data/tools.json fields (no scores).
export const COMPARE = [
  ['meshy', 'tripo'], ['hyper3d-rodin', 'meshy'], ['suno', 'udio'], ['aiva', 'mubert'], ['cursor', 'github-copilot'], ['cursor', 'windsurf'],
  ['elevenlabs', 'inworld-ai'], ['convai', 'inworld-ai'], ['cascadeur', 'deepmotion'], ['crowdin', 'gridly'], ['modl-ai', 'nunu-ai'],
  ['runway', 'luma-ai'], ['pixellab', 'retro-diffusion'], ['scenario', 'layer-ai'],
];

