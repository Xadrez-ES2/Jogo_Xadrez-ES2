import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const app = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(app, "coverage/evidencias-interface");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Execute com npm run evidence:interface dentro de app.");
mkdirSync(output, { recursive: true });

const commands = [
    ["unit", ["run", "coverage:interface:unit"]],
    ["integration", ["run", "coverage:interface:integration"]],
    ["system", ["run", "coverage:interface:system"]],
    ["regression", ["test", "--", "--reporter=default", "--reporter=json", "--outputFile=coverage/regression-results.json"]],
    ["lint", ["run", "lint"]],
    ["build", ["run", "build"]],
];
const executions = [];
for (const [id, args] of commands) {
    const startedAt = new Date().toISOString();
    console.log(`\n[evidências] npm ${args.join(" ")}`);
    const result = spawnSync(process.execPath, [npmCli, ...args], { cwd: app, encoding: "utf8" });
    const log = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`;
    writeFileSync(join(output, `${id}.log`), log);
    executions.push({ id, command: `npm ${args.join(" ")}`, startedAt, finishedAt: new Date().toISOString(), exitCode: result.status });
    console.log(`[evidências] ${id}: ${result.status === 0 ? "aprovado" : "falhou"}`);
    if (result.status !== 0) {
        writeFileSync(join(output, "execution-failure.json"), JSON.stringify(executions, null, 2));
        console.error(log);
        process.exit(result.status || 1);
    }
}
const read = (path) => JSON.parse(readFileSync(join(app, path), "utf8"));
const suites = [
    { id: "unit", name: "Unidade", objective: "Validar componentes, hooks e adaptadores isolados; engine e persistência substituídas por mocks nos casos que dependem dessas fronteiras." },
    { id: "integration", name: "Integração", objective: "Validar componentes e hooks colaborando com engine e IA reais; autenticação e persistência controladas, sem Firebase remoto." },
    { id: "system", name: "Sistema", objective: "Validar a aplicação frontend completa em Chromium: rotas, cliques, CSS, diálogos, IA e layout de celular; sessão de visitante, sem Google/Firestore reais." },
].map((suite) => {
    const folder = `coverage/interface-${suite.id}`;
    const result = read(`${folder}/test-results.json`);
    const cases = result.testResults.flatMap((file) => file.assertionResults.map((test) => ({
        file: relative(app, file.name), name: test.fullName, status: test.status, durationMs: test.duration,
    })));
    cpSync(join(app, folder), join(output, "reports", suite.id), { recursive: true });
    return { ...suite, startedAt: new Date(result.startTime).toISOString(), passed: result.numPassedTests,
        failed: result.numFailedTests, pending: result.numPendingTests, coverage: read(`${folder}/coverage-summary.json`).total, cases };
});
const regression = read("coverage/regression-results.json");
cpSync(join(app, "coverage/regression-results.json"), join(output, "regression-results.json"));
const git = (...args) => spawnSync("git", args, { cwd: app, encoding: "utf8" }).stdout.trim();
const summary = {
    generatedAt: new Date().toISOString(), sourceCommit: git("rev-parse", "HEAD"),
    workingTree: git("status", "--porcelain"), node: process.version, platform: process.platform,
    versions: Object.fromEntries(["vitest", "@vitest/coverage-v8", "@vitest/browser-playwright", "playwright"].map((name) =>
        [name, read(`node_modules/${name}/package.json`).version])),
    suites, regression: { passed: regression.numPassedTests, failed: regression.numFailedTests }, executions,
    limitations: [
        "Aceitação alfa e beta não executada. Não representa aprovação de usuários reais.",
        "Google Authentication e Firestore remotos não foram validados nestas suítes.",
        "Cobertura mede somente src/interface/**/*.ts e tsx, incluindo arquivos não exercitados; exclui declarações d.ts, engine e IA.",
        "Percentuais das suítes são independentes e não devem ser somados. O mapeamento do V8 em navegador pode apresentar denominador diferente do Node.",
        "Código funcional da interface, engine e IA não foi alterado por esta entrega de testes.",
    ],
};
writeFileSync(join(output, "summary.json"), JSON.stringify(summary, null, 2));
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const metrics = ["lines", "statements", "functions", "branches"];
const rows = suites.map((suite) => `<tr><td>${suite.name}</td><td>${suite.passed}</td><td>${suite.failed}</td>${metrics.map((key) => `<td>${suite.coverage[key].pct}% (${suite.coverage[key].covered}/${suite.coverage[key].total})</td>`).join("")}</tr>`).join("");
const sections = suites.map((suite) => `<section><h2>${suite.name}</h2><p>${suite.objective}</p><p>Execução: ${esc(suite.startedAt)}. <a href="reports/${suite.id}/index.html">Cobertura navegável</a> · <a href="reports/${suite.id}/test-results.json">Resultados originais</a></p><table><thead><tr><th>Caso / objetivo</th><th>Resultado</th><th>ms</th></tr></thead><tbody>${suite.cases.map((test) => `<tr><td>${esc(test.name)}<small>${esc(test.file)}</small></td><td>${esc(test.status)}</td><td>${Math.round(test.durationMs ?? 0)}</td></tr>`).join("")}</tbody></table></section>`).join("");
writeFileSync(join(output, "index.html"), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Evidências dos testes da interface</title><style>body{font:16px system-ui;max-width:1200px;margin:32px auto;padding:0 20px;color:#182238}h1,h2{color:#1645a0}table{border-collapse:collapse;width:100%;font-size:14px;margin:20px 0}th,td{text-align:left;border:1px solid #cbd5e1;padding:10px;vertical-align:top}th{background:#eff6ff}small{display:block;color:#52647a;margin-top:6px}section{margin:40px 0}code{overflow-wrap:anywhere}@media print{body{margin:0}section{break-before:page}tr{break-inside:avoid}}</style><h1>Evidências dos testes da interface</h1><p>Gerado em ${esc(summary.generatedAt)}. Node ${esc(summary.node)}, ${esc(summary.platform)}.</p><p>Commit-base: <code>${esc(summary.sourceCommit)}</code>. Alterações locais no momento da execução constam em <a href="summary.json">summary.json</a>.</p><p>Vitest ${summary.versions.vitest}; Playwright ${summary.versions.playwright}. Regressão Node/jsdom: ${summary.regression.passed} aprovados, ${summary.regression.failed} falhas. Os 6 casos de sistema são executados separadamente, em Chromium.</p><table><thead><tr><th>Tipo</th><th>Aprovados</th><th>Falhas</th><th>Linhas</th><th>Instruções</th><th>Funções</th><th>Ramos</th></tr></thead><tbody>${rows}</tbody></table><h2>Limites e pendências</h2><ul>${summary.limitations.map((text) => `<li>${esc(text)}</li>`).join("")}</ul><h2>Reproduzir</h2><pre>cd app\nnpm ci\nnpx playwright install chromium\nnpm run evidence:interface</pre>${sections}</html>`);
console.log(`\nEvidências prontas: ${join(output, "index.html")}`);
