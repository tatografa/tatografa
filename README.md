# tatografa — Vídeos com animações 3D (Three.js + Remotion)

Projeto configurado para criar vídeos com **animações 3D** (Three.js) e
fazer a **composição, áudio e renderização** do vídeo (Remotion).

## O que está instalado

| Pacote | Para quê |
| --- | --- |
| `remotion` + `@remotion/cli` | Compor cenas em React, sincronizar áudio e renderizar vídeo |
| `@remotion/three` | Ponte entre Remotion e Three.js (`<ThreeCanvas>`) |
| `three` + `@react-three/fiber` + `@react-three/drei` | Motor e helpers de 3D |
| `typescript` + tipos | Tipagem |

## Como usar

### 1. Abrir o estúdio (preview ao vivo)
```bash
npm run studio
```
Abre o Remotion Studio no navegador. Edite `src/Cubo3D.tsx` e veja o
resultado em tempo real.

### 2. Renderizar o vídeo em MP4
```bash
npm run render:cubo
```
Gera `out/cubo.mp4`. Para renderizar qualquer composição manualmente:
```bash
npm run render -- <IdDaComposicao> out/arquivo.mp4
```

## Estrutura

- `src/index.ts` — ponto de entrada (`registerRoot`).
- `src/Root.tsx` — registro das composições (um vídeo = uma `<Composition>`).
- `src/Cubo3D.tsx` — exemplo: cubo 3D girando com texto por cima.
- `remotion.config.ts` — configuração de render (codec, WebGL via `angle`, etc).
- `public/` — assets estáticos (áudio, imagens, modelos `.glb`), usados com `staticFile(...)`.

## Conceito importante do Remotion + Three.js

O Remotion renderiza **quadro a quadro**. Toda animação deve ser uma
**função do quadro atual** (`useCurrentFrame()`), e **não** de tempo real
(`useFrame`/`requestAnimationFrame`). Assim o preview e o render final ficam
idênticos. Veja o exemplo em `src/Cubo3D.tsx`.

## Áudio

Coloque um arquivo em `public/` (ex.: `musica.mp3`) e no componente:
```tsx
import { Audio, staticFile } from "remotion";
// ...
<Audio src={staticFile("musica.mp3")} />
```

## Modelos 3D (.glb/.gltf)

Coloque o `.glb` em `public/` e carregue com `useGLTF` do `@react-three/drei`
dentro do `<ThreeCanvas>`.
