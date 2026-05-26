import { execFileSync } from "node:child_process";
import { copyFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const spiPom = join(repoRoot, "spi", "pom.xml");
const targetDir = join(repoRoot, "spi", "target");
const distDir = join(repoRoot, "dist_keycloak");

const isWindows = process.platform === "win32";
const wrapper = isWindows ? join(repoRoot, "mvnw.cmd") : join(repoRoot, "mvnw");

console.log(`[build-spi] ${wrapper} -B -f ${spiPom} clean package`);

// On Windows, .cmd files are not directly executable — invoke via cmd.exe /c
// to avoid shell:true and its arg-rejoin parsing problems.
if (isWindows) {
    execFileSync("cmd.exe", ["/c", wrapper, "-B", "-f", spiPom, "clean", "package"], {
        cwd: repoRoot,
        stdio: "inherit",
    });
} else {
    execFileSync(wrapper, ["-B", "-f", spiPom, "clean", "package"], {
        cwd: repoRoot,
        stdio: "inherit",
    });
}

if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

const candidates = readdirSync(targetDir).filter(
    f => f.endsWith(".jar") && !f.endsWith("-sources.jar") && !f.endsWith("-javadoc.jar")
);
if (candidates.length === 0) {
    throw new Error(`[build-spi] no JAR produced in ${targetDir}`);
}
if (candidates.length > 1) {
    console.warn(`[build-spi] multiple JARs found; using ${candidates[0]}`);
}

const jar = candidates[0];
const dest = join(distDir, "theme-config-spi.jar");
copyFileSync(join(targetDir, jar), dest);
console.log(`[build-spi] copied ${jar} -> dist_keycloak/theme-config-spi.jar`);
