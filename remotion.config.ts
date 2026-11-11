// Configuração do Remotion.
// Docs: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Em ambientes sem acesso à internet, o Remotion não consegue baixar o
// Chrome Headless Shell. Este bloco reaproveita um Chromium headless já
// instalado (ex.: o do Playwright em /opt/pw-browsers). Se não existir,
// o Remotion usa o download padrão normalmente — então isto é portátil.
const encontrarChromeHeadless = (): string | null => {
  const base = "/opt/pw-browsers";
  if (!existsSync(base)) return null;
  try {
    for (const dir of readdirSync(base)) {
      if (!dir.startsWith("chromium_headless_shell")) continue;
      const bin = join(
        base,
        dir,
        "chrome-headless-shell-linux64",
        "chrome-headless-shell",
      );
      if (existsSync(bin)) return bin;
    }
  } catch {
    return null;
  }
  return null;
};

const chromeHeadless = encontrarChromeHeadless();
if (chromeHeadless) {
  Config.setBrowserExecutable(chromeHeadless);
}

// Qualidade / formato de saída
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(null); // usa o número ideal de threads da máquina
Config.setCodec("h264");

// Three.js usa WebGL. Em servidores/ambientes headless SEM GPU, o
// renderizador precisa ser por software: "swangle" (ANGLE + SwiftShader)
// é o recomendado pelo Remotion (é o usado no Remotion Lambda).
// Se você rodar numa máquina COM GPU, pode trocar por "angle".
Config.setChromiumOpenGlRenderer("swangle");

// Overwrite do arquivo de saída sem perguntar
Config.setOverwriteOutput(true);
