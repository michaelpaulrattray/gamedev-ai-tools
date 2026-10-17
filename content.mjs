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
  {
    // Licence guide (v2): steps, paths, licence table and FAQ live in data/guides/open-weights-model-licences.json
    // (brief: docs/briefs/open-weights-model-licences.md). Not a pipeline workflow, so engines is empty.
    slug: 'open-weights-model-licences',
    title: 'Open-weights model licences: what you can ship in a game',
    metaTitle: 'Open-weights model licences for games | GameDev AI Tools',
    description: 'Can you ship output from Hunyuan3D, SDXL, SD 3.5, FLUX or TRELLIS in a paid game? Each licence\'s catch, quoted and linked, with check dates.',
    tools: ['hunyuan3d', 'hunyuanworld', 'stable-audio'],
    task: '3d-models', engines: [],
    hero: 'guide-open-weights',
    flow: [{ label: 'Pick a model', ai: true }, { label: 'Read its licence' }, { label: 'Check caps and territory' }, { label: 'Keep a copy, disclose' }, { label: 'Ship' }],
    outcome: 'For each open-weights model a game dev is likely to run locally: the licence, whether outputs can be used commercially, any revenue, user or territory limit, and the catch, each linked to the licence text.',
    intro: '"Open weights" doesn\'t mean "free for commercial use". Here is how to check a model licence, and what 15 popular models\' licences say.',
    steps: [],
  },
];

export const DISCLOSURE = {
  title: 'Steam AI-content disclosure (and other stores)',
  description: 'What Steam\'s Content Survey asks about generative AI, plus what itch.io, Epic Games Store and Google Play publish. Dated, with source links.',
  // Direct answer shown right under the headline (and in the Article JSON-LD). Only facts sourced in the Steam section below.
  answer: 'Yes, Steam asks. Before review you complete a Content Survey with a section on generative AI. Valve says it is concerned with AI-made content that ships with the game and that players consume, such as artwork, sound, narrative and localisation, not efficiency gains from AI dev tools. If your game generates content with AI while it runs, you must also describe the guardrails that stop it generating illegal content.',
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
      s('Epic\'s "CreatedWithAI" and "NoAI" tags apply to assets sold on Fab, not to Epic Games Store game listings. Fab\'s Distribution Agreement (section 18(k)) requires publishers to tag content "CreatedWithAI" when a material portion of it is generated with generative AI; "NoAI" is an opt-in tag that bars buyers from using the content in AI datasets, AI development or as AI inputs.', 'https://www.fab.com/distribution-agreement') ] },
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


// Engine hub editorial layer for /engine/<page>/ (briefs in docs/briefs/). Rendered on top of the auto-generated
// tool table. Every statement is sourced; anything a vendor doesn't state is written as "Not stated by vendor".
// Shape: { checked, title, description, answer, sections: [{ h, intro?, items: [s()], tools?: [slugs], table? }], faq: [{ q, a, url }] }
export const ENGINE_HUBS = {
  godot: {
    checked: '2026-10-17',
    title: 'Godot AI tools: plugins and MCP | GameDev AI Tools',
    description: 'AI tools that work with Godot 4: editor assistants, MCP servers and asset generators, with pricing and commercial-use terms from each vendor, dated.',
    answer: 'AI reaches Godot three ways: community editor plugins, MCP servers that let agents like Claude Code or Cursor drive the editor, and generators whose files Godot imports (GLB, PNG, WAV). Below are the tools whose vendors state Godot support, what each costs, and whether you can ship the output commercially.',
    sections: [
      { h: 'AI coding assistants for GDScript and C#', intro: 'Cursor, GitHub Copilot and Windsurf aren\'t Godot-specific: they work on any text file, so they work on .gd and .cs files. Each connects to MCP servers, and each tool page links its free plan and output terms.', tools: ['cursor', 'github-copilot', 'windsurf'], items: [] },
      { h: 'In-editor Godot plugins (community projects, not official Godot tools)', items: [
        s('GodotAI adds an AI chat panel to the Godot editor for Claude, ChatGPT, OpenRouter models or local models (Ollama, LM Studio, llama.cpp). It needs Godot 4.5 or later, and its Asset Library listing gives the licence as "Proprietary".', 'https://godotengine.org/asset-library/asset/4916'),
        s('Godot AI Assistant Hub (Flamx Games) is an MIT-licensed plugin that embeds AI assistants in Godot. It doesn\'t run models itself: it connects to a provider, local first (Ollama), with Google Gemini, Ollama Turbo and OpenRouter also supported. Minimum Godot version: Not stated by vendor.', 'https://github.com/FlamxGames/godot-ai-assistant-hub'),
        s('AI Copilot for Godot (unxsist) is an MIT-licensed agent in the editor dock that reads files, writes GDScript, edits scenes and runs your game. Its README badge shows Godot 4.7.', 'https://github.com/unxsist/godot-ai-chat/') ] },
      { h: 'MCP servers: letting an agent drive the Godot editor', intro: 'An MCP (Model Context Protocol) server gives an outside AI agent tools it can call, here to read and change a Godot project. Listed alphabetically by repo; no ranking.', items: [
        s('Coding-Solo/godot-mcp (MIT): launch the editor, run projects in debug mode, capture debug output, create scenes and add nodes, export MeshLibrary resources, and manage UIDs (Godot 4.4+). The README recommends Godot 4.7 (tested on 4.7 stable) and needs Node.js 18+.', 'https://github.com/Coding-Solo/godot-mcp'),
        s('hi-godot/godot-ai (MIT): connects Claude Code, Claude Desktop, Codex and other MCP clients to a live Godot editor, with tools to build scenes, edit nodes and scripts, wire signals and set up UI, materials and animation. Godot AI v4 needs Godot 4.7+; C# support is text-only.', 'https://github.com/hi-godot/godot-ai') ] },
      { h: 'Asset generators that export to Godot', intro: 'Meshy, Tripo, Hyper3D Rodin and Sloyd each list an official Godot plugin or bridge. Check the licence before you generate: on the free plans, Meshy licenses output under CC BY 4.0 (attribution required), Tripo\'s is non-commercial, and Hunyuan3D\'s licence excludes the EU, UK and South Korea.', tools: ['meshy', 'tripo', 'hyper3d-rodin', 'sloyd', 'hunyuan3d'], items: [
        s('Meshy lists a Godot plugin among its game-engine integrations.', 'https://www.meshy.ai/integrations'),
        s('Tripo lists a Godot plugin (Godot 4.4+) on its developer plugins page.', 'https://developers.tripo3d.ai/en/docs/plugins'),
        s('Hyper3D lists a Rodin add-on for Godot.', 'https://docs.hyper3d.ai/en/addons'),
        s('Sloyd lists a Godot plugin among its integrations.', 'https://sloyd.gitbook.io/documentation/integrations'),
        s('Godot imports glTF 2.0 (.gltf and .glb) 3D scenes; glTF is the recommended format to export from Blender.', 'https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html'),
        s('2D tools mostly export PNG images or sprite sheets, which Godot imports as textures.', 'https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_images.html'),
        s('Audio tools export files such as WAV, Ogg Vorbis or MP3, which Godot imports.', 'https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_audio_samples.html'),
        s('Watch the audio free plans: ElevenLabs, Suno and Stable Audio limit commercial use to paid plans (each tool page links its terms).', '/cheat-sheet/') ] },
      { h: 'Selling AI-made assets on the Godot Asset Store', items: [
        s('You can upload AI-generated assets or code, but you must disclose what is AI-generated, or how AI was used, when you submit. That includes AI material you\'ve edited and AI material placed inside something made by hand.', 'https://store.godotengine.org/help/'),
        s('The store added AI disclosure information to assets (30 October 2025) and later a filter for assets that use AI.', 'https://store.godotengine.org/changelog/'),
        s('For selling your game on Steam and other stores, see our store AI-disclosure summary.', '/steam-ai-disclosure/') ] },
      { h: 'Godot\'s AI contribution policy (engine code, not your game)', items: [
        s('Godot\'s 2026 contribution policy (30 June 2026) is about pull requests to the Godot engine itself: no autonomous AI agents or vibe coding, no AI-generated substantial code, and AI use must be disclosed in the PR. It doesn\'t restrict games you make with Godot.', 'https://godotengine.org/article/contribution-policy-2026/'),
        s('Godot is released under the MIT licence.', 'https://godotengine.org/license/') ] },
    ],
    faq: [
      { q: 'What\'s the difference between a Godot AI plugin and a Godot MCP server?', a: 'A plugin adds an AI chat or agent panel inside the Godot editor. An MCP server lets an outside agent, such as Claude Code or Cursor, read and change your project.', url: 'https://github.com/hi-godot/godot-ai' },
      { q: 'Can I use AI-generated assets in a paid Godot game?', a: 'Godot\'s MIT licence doesn\'t restrict it. What matters is each AI tool\'s own terms: our cheat sheet lists, for every tool, whether free-plan output can go in a commercial game.', url: '/cheat-sheet/' },
      { q: 'Can I sell AI-made assets on the Godot Asset Store?', a: 'Yes, if you disclose what is AI-generated, or how AI was used, when you submit, including AI material you\'ve edited.', url: 'https://store.godotengine.org/help/' },
      { q: 'Does Godot\'s AI policy ban games made with AI?', a: 'No. The 2026 contribution policy covers code contributed to the Godot engine, not games made with Godot.', url: 'https://godotengine.org/article/contribution-policy-2026/' },
      { q: 'Which AI 3D generators export to Godot?', a: 'Meshy, Tripo, Hyper3D Rodin and Sloyd each list an official Godot plugin or bridge. Most other 3D generators export GLB, which Godot imports.', url: 'https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html' },
    ],
  },
  unity: {
    checked: '2026-10-17',
    title: 'Unity AI tools and credits | GameDev AI Tools',
    description: 'Unity AI credits and pricing by plan, who owns what it generates, and other AI tools with Unity plugins. Sourced from vendor pages and dated.',
    answer: 'Unity\'s AI tools run on Unity Credits. Pro includes 2,000 a month and Enterprise 3,000. Unity Personal gets a 14-day free trial, then a paid subscription ($10/month per Unity\'s FAQ; currency not stated by vendor). Unity says you own your inputs and outputs, but third-party terms also cover its generators. The CLI, MCP server and official agent plugin are free.',
    sections: [
      { h: 'Quick answer: Unity AI cost by plan', table: {
        head: ['Plan', 'Monthly credits', 'How you get access'],
        rows: [
          ['Personal (free engine plan)', '1,000 (listed with the paid subscription)', '14-day free trial, then a paid subscription: "converts to a $10/month subscription" (currency not stated by vendor)'],
          ['Pro (from $2,310/yr)', '2,000', 'Included in the paid plan'],
          ['Enterprise (custom pricing)', '3,000', 'Included in the paid plan'],
          ['Industry (custom pricing)', 'Not stated by vendor', 'Included ("Pro, Enterprise, and Industry customers receive access")'],
        ],
        sources: [['Plans & Pricing', 'https://unity.com/products'], ['Unity AI FAQ', 'https://unity.com/features/ai']],
      }, items: [
        s('Credits reset at the start of each billing cycle and unused credits don\'t roll over. At zero, AI features pause until the reset or until you buy more credits.', 'https://docs.unity.com/en-us/ai/credits/credits-about'),
        s('Additional credit bundles are sold, and Unity Credits are non-refundable except as required by law.', 'https://unity.com/legal/unity-ai-credits-terms'),
        s('The Unity CLI, the MCP server and Unity\'s official plugin are free to use, and the MCP server doesn\'t need Unity AI credits.', 'https://unity.com/features/ai') ] },
      { h: 'What a Unity Credit buys', table: {
        head: ['Activity', 'Example credits'],
        rows: [['AI Assistant message', '4 to 1,500 or more'], ['Image', '1–6'], ['Texture', '1–9'], ['3D model', '8–13'], ['Sound effects', '1–5'], ['Music', '3–5'], ['Text to speech', 'About 3'], ['Animation (text to motion)', 'About 5'], ['Skybox', '2–5'], ['Video', '5–15'], ['Price per credit in money', 'Not stated by vendor']],
        sources: [['About Unity Credits', 'https://docs.unity.com/en-us/ai/credits/credits-about']],
      }, items: [
        s('Unity says these figures are "representative examples only", that real use varies with the model and the request, and that the Unity Dashboard is the authority for your organisation.', 'https://docs.unity.com/en-us/ai/credits/credits-about') ] },
      { h: 'Can you ship what Unity AI generates?', tools: ['layer-ai', 'scenario'], items: [
        s('Ownership: Unity\'s AI Guiding Principles say "You own your input and output data", regardless of the partner model used, and training on your content is off by default (Guiding Principles last updated 19 August 2026, for Unity Editor 6.7 and below).', 'https://unity.com/legal/unityai-guiding-principles'),
        s('Third-party terms: Unity\'s Third-Party AI Terms (updated 28 July 2026) say generator use is also governed by the providers\' own terms: Layer AI (FLUX-based models, sprites), Scenario (FLUX, GPT-Image, Google Gemini and Seedream models; images, 3D models, skyboxes, textures, sound and video) and Uthana (animation).', 'https://unity.com/legal/third-party-ai-terms'),
        s('Responsibility: Unity says you\'re responsible for making sure your use of its AI tools and any generated assets don\'t infringe third-party rights.', 'https://unity.com/legal/unityai-guiding-principles'),
        s('Unity\'s FAQ adds that developers are fully responsible for app-store declarations and verifying usage rights.', 'https://unity.com/features/ai'),
        s('Metadata: Unity embeds "UnityAI" metadata in all generations, so you can find and remove them.', 'https://unity.com/legal/unityai-guiding-principles'),
        s('For declaring AI content when you sell the game, see our Steam and store AI-disclosure summary.', '/steam-ai-disclosure/'),
        s('Engine plan: Unity Pro is required for businesses with more than $200K in funding or annual revenue.', 'https://unity.com/products') ] },
      { h: 'Using outside agents with Unity (MCP, CLI, plugin)', intro: 'Cursor, GitHub Copilot and Windsurf can connect to MCP servers.', tools: ['cursor', 'github-copilot', 'windsurf'], items: [
        s('Unity\'s MCP server is set up through the Unity CLI and requires Unity 6 or later. Unity\'s official plugin is listed for Claude Code, Codex and Grok.', 'https://unity.com/features/ai'),
        s('Using a third-party agent through Unity\'s AI gateway doesn\'t consume Unity credits.', 'https://unity.com/features/ai'),
        s('The CLI is free and separate from Unity AI, and doesn\'t need a Unity AI subscription.', 'https://docs.unity.com/en-us/unity-cli/replace-mcp-server-unity-cli') ] },
      { h: 'Selling AI-made assets on the Unity Asset Store', items: [
        s('Content made with AI, completely or in part, must say so in the marketing data, and the "AI description" field must name the AI tools used, the content they generated and the modifications you made.', 'https://assetstore.unity.com/publishing/submission-guidelines'),
        s('AI or AI-assisted content can\'t use words that imply human effort, such as "drawn", "hand drawn" or "painted". AI may be used for logos, backgrounds or supplemental visuals in marketing material if the package is accurately shown.', 'https://assetstore.unity.com/publishing/submission-guidelines'),
        s('Unity can reject submissions mass-produced with AI that lack sufficient differentiation, and AI-generated 3D data must be retopologised and optimised before submission.', 'https://assetstore.unity.com/publishing/submission-guidelines') ] },
    ],
    faq: [
      { q: 'Is Unity AI free on Unity Personal?', a: 'There\'s a 14-day free trial. After that it\'s a paid subscription: Unity\'s FAQ says the trial "converts to a $10/month subscription" (the currency isn\'t stated).', url: 'https://unity.com/features/ai' },
      { q: 'How many credits does a 3D model cost in Unity AI?', a: 'Unity\'s example range is 8 to 13 credits per generation, but it says actual use varies and the Unity Dashboard is authoritative.', url: 'https://docs.unity.com/en-us/ai/credits/credits-about' },
      { q: 'Do I own what Unity AI generates?', a: 'Unity\'s AI Guiding Principles say you own your input and output data. Its generators are also governed by third-party terms (Layer AI, Scenario, Uthana).', url: 'https://unity.com/legal/unityai-guiding-principles' },
      { q: 'Do unused Unity Credits roll over?', a: 'No. They reset at the start of each billing cycle.', url: 'https://docs.unity.com/en-us/ai/credits/credits-about' },
      { q: 'Does using Claude Code or Cursor with Unity cost Unity Credits?', a: 'Unity\'s FAQ says a third-party agent used through its AI gateway doesn\'t consume Unity credits, and the MCP server doesn\'t need credits.', url: 'https://unity.com/features/ai' },
      { q: 'Can I sell AI-generated assets on the Unity Asset Store?', a: 'Yes, if you disclose it: the "AI description" field must name the AI tools used and what they generated. Follow Unity\'s submission guidelines.', url: 'https://assetstore.unity.com/publishing/submission-guidelines' },
    ],
  },
};
