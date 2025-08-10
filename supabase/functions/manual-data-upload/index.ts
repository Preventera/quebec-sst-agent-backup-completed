import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, fileName, fileData, metadata } = await req.json()
    console.log(`Action: ${action}, Fichier: ${fileName}, Enregistrements: ${fileData?.length}`)

    if (action === 'process_manual_upload') {
      const result = await processManualUpload(fileName, fileData, metadata, supabaseClient)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Action non supportée' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function processManualUpload(fileName: string, fileData: any[], metadata: any, supabaseClient: any) {
  console.log(`Traitement du fichier ${fileName} avec ${fileData.length} enregistrements`)
  
  // Validation et standardisation des données
  const processedData = validateAndProcessData(fileData, fileName)
  
  if (processedData.length === 0) {
    throw new Error('Aucun enregistrement valide trouvé dans le fichier')
  }

  // Insertion en base de données
  const syncResult = await syncToDatabase(processedData, supabaseClient)
  
  // Log de l'upload
  await logUpload(fileName, metadata, syncResult, supabaseClient)
  
  return {
    recordsProcessed: fileData.length,
    recordsValid: processedData.length,
    recordsInserted: syncResult.inserted,
    recordsUpdated: syncResult.updated,
    fileName: fileName,
    uploadedAt: metadata.uploadedAt,
    statistics: calculateStatistics(processedData)
  }
}

function validateAndProcessData(rawData: any[], fileName: string) {
  const validRecords = []
  const requiredFields = ['annee', 'secteur_activite', 'type_lesion']
  
  console.log(`Validation de ${rawData.length} enregistrements du fichier ${fileName}`)

  for (let i = 0; i < rawData.length; i++) {
    const record = rawData[i]
    
    // Vérification des champs requis
    const missingFields = requiredFields.filter(field => !record[field])
    if (missingFields.length > 0) {
      console.warn(`Enregistrement ${i + 1} ignoré - champs manquants: ${missingFields.join(', ')}`)
      continue
    }

    // Validation de l'année
    const annee = parseInt(record.annee)
    if (isNaN(annee) || annee < 1990 || annee > new Date().getFullYear()) {
      console.warn(`Enregistrement ${i + 1} ignoré - année invalide: ${record.annee}`)
      continue
    }

    // Normalisation et enrichissement
    const processedRecord = {
      id: record.id || `upload_${fileName}_${i}_${Math.random().toString(36).substr(2, 6)}`,
      annee: annee,
      secteur_activite: record.secteur_activite.trim(),
      scian_code: record.scian_code || null,
      type_lesion: record.type_lesion.trim(),
      partie_lesee: record.partie_lesee || null,
      nature_lesion: record.nature_lesion || record.type_lesion,
      genre_blessure: record.genre_blessure || record.type_lesion,
      agent_causal: record.agent_causal || null,
      evenement_accident: record.evenement_accident || null,
      nb_cas: parseInt(record.nb_cas) || 1,
      nb_jours_perdus: parseInt(record.nb_jours_perdus) || 0,
      cout_total: parseFloat(record.cout_total) || 0,
      gravite: record.gravite || determineGravite(record.nb_jours_perdus, record.nb_cas),
      province: record.province || 'QC',
      source: `Upload manuel - ${fileName}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    validRecords.push(processedRecord)
  }

  console.log(`${validRecords.length} enregistrements valides sur ${rawData.length} traités`)
  return validRecords
}

function determineGravite(joursPerdus: any, nbCas: any): string {
  const jours = parseInt(joursPerdus) || 0
  const cas = parseInt(nbCas) || 1
  const moyenneJours = jours / cas

  if (moyenneJours <= 3) return 'Légère'
  if (moyenneJours <= 10) return 'Modérée'
  if (moyenneJours <= 30) return 'Grave'
  return 'Très grave'
}

async function syncToDatabase(processedData: any[], supabaseClient: any) {
  let inserted = 0
  let updated = 0
  const batchSize = 50

  console.log(`Synchronisation de ${processedData.length} enregistrements en lots de ${batchSize}`)

  for (let i = 0; i < processedData.length; i += batchSize) {
    const batch = processedData.slice(i, i + batchSize)
    
    try {
      const { data, error } = await supabaseClient
        .from('lesions_professionnelles')
        .upsert(batch, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select('id')

      if (error) {
        console.error('Erreur batch insert:', error)
        // Essayer d'insérer individuellement en cas d'erreur de lot
        for (const record of batch) {
          try {
            await supabaseClient
              .from('lesions_professionnelles')
              .upsert(record, { onConflict: 'id' })
            inserted++
          } catch (individualError) {
            console.error(`Erreur enregistrement individuel ${record.id}:`, individualError)
          }
        }
      } else {
        inserted += batch.length
      }

      console.log(`Lot ${Math.floor(i/batchSize) + 1} traité: ${batch.length} enregistrements`)
      
    } catch (batchError) {
      console.error(`Erreur lors du traitement du lot ${Math.floor(i/batchSize) + 1}:`, batchError)
    }
  }

  console.log(`Synchronisation terminée: ${inserted} insérés, ${updated} mis à jour`)
  return { inserted, updated }
}

async function logUpload(fileName: string, metadata: any, syncResult: any, supabaseClient: any) {
  try {
    // On pourrait créer une table de logs d'uploads si nécessaire
    console.log(`Upload logged: ${fileName}, ${syncResult.inserted} records inserted`)
  } catch (error) {
    console.error('Erreur lors du log de l\'upload:', error)
  }
}

function calculateStatistics(data: any[]) {
  const totalCas = data.reduce((sum, record) => sum + record.nb_cas, 0)
  const totalCouts = data.reduce((sum, record) => sum + record.cout_total, 0)
  const totalJoursPerdus = data.reduce((sum, record) => sum + record.nb_jours_perdus, 0)

  const secteurs = [...new Set(data.map(r => r.secteur_activite))]
  const annees = [...new Set(data.map(r => r.annee))].sort()

  const topLesions = Object.entries(
    data.reduce((acc: any, record) => {
      acc[record.type_lesion] = (acc[record.type_lesion] || 0) + record.nb_cas
      return acc
    }, {})
  )
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([type, cas]) => ({ type, cas }))

  return {
    resume: {
      totalCas,
      totalCouts,
      totalJoursPerdus,
      coutMoyenParCas: totalCas > 0 ? Math.round(totalCouts / totalCas) : 0,
      joursMoyensParCas: totalCas > 0 ? Math.round(totalJoursPerdus / totalCas * 10) / 10 : 0
    },
    periodeAnalysee: {
      anneeDebut: Math.min(...annees),
      anneeFin: Math.max(...annees),
      nombreAnnees: annees.length
    },
    couverture: {
      nombreSecteurs: secteurs.length,
      secteurs: secteurs.slice(0, 10) // Limiter pour éviter une réponse trop longue
    },
    topLesions
  }
}