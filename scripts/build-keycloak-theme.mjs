import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const buildSpiPath = join(here, "build-spi.mjs");

function isDirectory(path) {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
}

function locateWrapperMaven() {
    const distsRoot = join(homedir(), ".m2", "wrapper", "dists");
    if (!isDirectory(distsRoot)) return null;

    const versionDirs = readdirSync(distsRoot)
        .filter(f => f.startsWith("apache-maven-"))
        .filter(f => isDirectory(join(distsRoot, f)));

    for (const version of versionDirs) {
        const versionDir = join(distsRoot, version);
        const hashDirs = readdirSync(versionDir).filter(h => isDirectory(join(versionDir, h)));
        for (const hash of hashDirs) {
            // Try direct layout: <version>/<hash>/bin
            const directCandidate = join(versionDir, hash, "bin");
            if (isDirectory(directCandidate)) {
                return directCandidate;
            }
            // Try nested layout: <version>/<hash>/<version>/bin
            const nestedCandidate = join(versionDir, hash, version, "bin");
            if (isDirectory(nestedCandidate)) {
                return nestedCandidate;
            }
        }
    }
    return null;
}

const env = { ...process.env };
const mvnBin = locateWrapperMaven();
if (mvnBin) {
    const sep = process.platform === "win32" ? ";" : ":";
    env.PATH = mvnBin + sep + (env.PATH ?? "");
    console.log(`[build-keycloak-theme] Using wrapper-downloaded Maven: ${mvnBin}`);
} else {
    console.log("[build-keycloak-theme] Wrapper-downloaded Maven not found at ~/.m2/wrapper/dists/.");
    console.log("[build-keycloak-theme] Run './mvnw --version' once to download it, or install Maven system-wide.");
    console.log("[build-keycloak-theme] Continuing — relying on system PATH for 'mvn'.");
}

function run(cmd) {
    console.log(`[build-keycloak-theme] $ ${cmd}`);
    execSync(cmd, { stdio: "inherit", env, shell: true, cwd: repoRoot });
}

run("npm run build");
run("npx keycloakify build");
run(`node "${buildSpiPath}"`);
