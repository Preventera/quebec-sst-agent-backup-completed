# Remplacer le contenu du fichier
@"
export default function handler(req, res) {
  const scenarioId = parseInt(req.query.scenarioId) || 52;
  
  const data = {
    scenarioId: scenarioId,
    title: "Capsules vidéo obligations LMRSST", 
    agents: ["ALSS", "LexiNorm", "Hugo", "DiagSST"],
    status: "SafeVision webhook working",
    timestamp: new Date().toISOString()
  };
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(data);
}
"@ | Out-File -FilePath api/safevision-webhook.js -Encoding UTF8 -NoNewline