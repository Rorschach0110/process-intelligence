const fields = ["case_id", "activity", "timestamp", "resource", "energy_kwh", "material_kg", "device"];
const state = { file: "data/sample_event_log.csv", fields, mapping: Object.fromEntries(fields.map((name) => [name, name])), cy: null };
const $ = (selector) => document.querySelector(selector);
const formatKg = (value) => `${Number(value || 0).toFixed(1)} kg`;

function setText(selector, value) {
  $(selector).textContent = value;
}

function renderRows(containerId, rows, render) {
  $(containerId).innerHTML = rows.map(render).join("");
}

function renderMapping() {
  $("#mappingControls").innerHTML = fields
    .map((name) => `<label>${name}<select data-field="${name}">${state.fields.map((field) => `<option ${state.mapping[name] === field ? "selected" : ""}>${field}</option>`).join("")}</select></label>`)
    .join("");
  document.querySelectorAll("[data-field]").forEach((select) => {
    select.addEventListener("change", () => {
      state.mapping[select.dataset.field] = select.value;
    });
  });
}

function renderPreview(rows) {
  if (!rows.length) {
    $("#previewTable").innerHTML = "";
    return;
  }
  const headers = Object.keys(rows[0]);
  $("#previewTable").innerHTML = `<table><thead><tr>${headers.map((key) => `<th>${key}</th>`).join("")}</tr></thead><tbody>${rows
    .slice(0, 5)
    .map((row) => `<tr>${headers.map((key) => `<td>${row[key] || ""}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

async function uploadCsv() {
  const file = $("#csvFile").files[0];
  if (!file) return;
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload-csv", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "上传失败");
  state.file = data.file;
  state.fields = data.fields;
  fields.forEach((name) => {
    state.mapping[name] = data.fields.includes(name) ? name : data.fields[0];
  });
  setText("#uploadStatus", data.file);
  renderMapping();
  renderPreview(data.preview);
}

async function runPipeline() {
  $("#runPipeline").disabled = true;
  $("#runPipeline").textContent = "分析中...";
  try {
    const response = await fetch("/api/run-pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: state.file, mapping: state.mapping, factors: readFactors() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Pipeline failed");
    render(data);
    loadHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    $("#runPipeline").disabled = false;
    $("#runPipeline").textContent = "运行分析";
  }
}

function readFactors() {
  return {
    electricity_kg_per_kwh: Number($("#electricityFactor").value),
    material_kg_per_kg: Number($("#materialFactor").value),
  };
}

function render(data) {
  setText("#eventsMetric", data.process.events);
  setText("#casesMetric", data.process.cases);
  setText("#carbonMetric", formatKg(data.carbon.summary.total_carbon_kg));
  setText("#savingMetric", formatKg(data.optimization.estimated_saving_kg));
  setText("#sourceFile", data.source.file);
  setText("#graphSchema", `${data.knowledge_graph.nodes.length} 节点 / ${data.knowledge_graph.edges.length} 关系`);
  setText("#objective", data.optimization.objective);
  renderRows("#processEdges", data.process.edges, (edge) => `<div class="list-row"><strong>${edge.source} -> ${edge.target}</strong><span class="badge">${edge.count}</span></div>`);
  renderRows("#bottlenecks", data.process.bottlenecks, (row) => `<div class="list-row"><strong>${row.activity}</strong><span class="badge">${row.total_duration_min} min</span></div>`);
  renderCarbonBars(data.carbon.by_activity);
  renderGraph(data.knowledge_graph);
  renderRecommendations(data);
  renderReport(data);
}

function renderCarbonBars(rows) {
  const maxCarbon = Math.max(...rows.map((row) => row.carbon_kg), 1);
  renderRows("#carbonBars", rows, (row) => `<div class="bar-row"><div class="bar-label"><strong>${row.activity}</strong><span>${formatKg(row.carbon_kg)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max((row.carbon_kg / maxCarbon) * 100, 4)}%"></div></div></div>`);
}

function renderGraph(graph) {
  if (!window.cytoscape) {
    renderFallbackGraph(graph);
    return;
  }
  state.cy = cytoscape({
    container: $("#graphPreview"),
    elements: graphElements(graph),
    style: graphStyle(),
    layout: { name: "breadthfirst", directed: true, padding: 24, spacingFactor: 1.1 },
  });
}

function renderFallbackGraph(graph) {
  const nodes = graph.nodes.slice(0, 12);
  $("#graphPreview").innerHTML = nodes
    .map((node) => `<span class="fallback-node kind-${node.kind}">${node.label}</span>`)
    .join("");
}

function graphElements(graph) {
  return [
    ...graph.nodes.map((node) => ({ data: { id: node.id, label: node.label, kind: node.kind } })),
    ...graph.edges.map((edge, index) => ({ data: { id: `e${index}`, source: edge.source, target: edge.target, label: edge.relation } })),
  ];
}

function graphStyle() {
  return [
    { selector: "node", style: { label: "data(label)", "background-color": "#138a63", color: "#152033", "font-size": 11, "text-wrap": "wrap", "text-max-width": 92 } },
    { selector: 'node[kind = "process"]', style: { "background-color": "#1769e0" } },
    { selector: 'node[kind = "metric"]', style: { "background-color": "#bf3d3d" } },
    { selector: 'node[kind = "resource"]', style: { "background-color": "#b56a00" } },
    { selector: "edge", style: { width: 2, "line-color": "#3b82f6", "target-arrow-color": "#3b82f6", "target-arrow-shape": "triangle", "curve-style": "bezier" } },
    { selector: 'edge[label = "NEXT"]', style: { "line-color": "#f59e0b", "target-arrow-color": "#f59e0b" } },
  ];
}

function renderRecommendations(data) {
  renderRows("#recommendations", data.optimization.recommendations, (item) => `<section class="recommendation"><div><h3>${item.title}</h3><p>${item.reason}</p><p>${item.action}</p><small>置信度 ${Math.round(item.confidence * 100)}% · 证据 ${JSON.stringify(item.evidence)}</small></div><div class="saving">${formatKg(item.estimated_saving_kg)}</div></section>`);
}

function renderReport(data) {
  $("#reportView").textContent = `报告摘要\n数据源: ${data.source.file}\n事件/案例: ${data.process.events}/${data.process.cases}\n总碳排: ${formatKg(data.carbon.summary.total_carbon_kg)}\n预计节省: ${formatKg(data.optimization.estimated_saving_kg)}`;
}

async function loadHistory() {
  const data = await fetch("/api/runs").then((response) => response.json());
  renderRows("#runHistory", data.runs, (run) => `<div class="list-row"><strong>${run.created_at || run.run_id}</strong><span>${formatKg(run.total_carbon_kg)} / ${formatKg(run.estimated_saving_kg)}</span></div>`);
}

async function queryGraph() {
  const kind = encodeURIComponent($("#graphKind").value);
  const q = encodeURIComponent($("#graphQuery").value);
  const data = await fetch(`/api/graph/query?kind=${kind}&q=${q}`).then((response) => response.json());
  renderGraph(data);
}

async function exportCypher() {
  const data = await fetch("/api/graph/export?format=cypher").then((response) => response.json());
  $("#reportView").textContent = data.content;
}

$("#uploadButton").addEventListener("click", () => uploadCsv().catch((error) => alert(error.message)));
$("#runPipeline").addEventListener("click", runPipeline);
$("#queryGraph").addEventListener("click", queryGraph);
$("#exportCypher").addEventListener("click", exportCypher);
renderMapping();
runPipeline();
loadHistory();
