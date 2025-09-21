#!/usr/bin/env node

/**
 * Test direct avec Supabase pour vérifier le problème de cache
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ktfdrwpvofxuktnunukv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmRyd3B2b2Z4dWt0bnVudWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU5NTg0MCwiZXhwIjoyMDczMTcxODQwfQ.Epv9_DhrTR6uzM2vf0LqTzgUkIDy5HGfw9FjHUFDf4c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const TEST_EMAIL = 'test-payment@example.com';

async function testSupabaseDirect() {
  console.log('🔍 Test direct Supabase\n');
  
  try {
    // 1. Récupérer le candidat
    console.log('1. Récupération du candidat...');
    const { data: candidate, error: fetchError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('email', TEST_EMAIL)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError);
      return;
    }
    
    console.log('✅ Candidat récupéré:');
    console.log('   - ID:', candidate.id);
    console.log('   - Email:', candidate.email);
    console.log('   - Plan Type:', candidate.plan_type);
    console.log('   - Featured:', candidate.is_featured);
    console.log('   - Updated At:', candidate.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Mettre à jour le plan
    console.log('2. Mise à jour du plan vers Premium...');
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const updateData = {
      plan_type: 'premium',
      plan_start_date: now.toISOString(),
      plan_end_date: endDate.toISOString(),
      is_featured: true,
      featured_until: endDate.toISOString()
    };
    
    const { data: updatedCandidate, error: updateError } = await supabaseAdmin
      .from('candidates')
      .update(updateData)
      .eq('id', candidate.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
      return;
    }
    
    console.log('✅ Plan mis à jour:');
    console.log('   - Plan Type:', updatedCandidate.plan_type);
    console.log('   - Featured:', updatedCandidate.is_featured);
    console.log('   - Updated At:', updatedCandidate.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Récupérer immédiatement après
    console.log('3. Récupération immédiate après mise à jour...');
    const { data: candidate2, error: fetchError2 } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('email', TEST_EMAIL)
      .single();
    
    if (fetchError2) {
      console.error('❌ Erreur récupération 2:', fetchError2);
      return;
    }
    
    console.log('✅ Candidat récupéré après mise à jour:');
    console.log('   - Plan Type:', candidate2.plan_type);
    console.log('   - Featured:', candidate2.is_featured);
    console.log('   - Updated At:', candidate2.updated_at);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Attendre et récupérer à nouveau
    console.log('4. Attente de 3 secondes...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('5. Récupération après attente...');
    const { data: candidate3, error: fetchError3 } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('email', TEST_EMAIL)
      .single();
    
    if (fetchError3) {
      console.error('❌ Erreur récupération 3:', fetchError3);
      return;
    }
    
    console.log('✅ Candidat récupéré après attente:');
    console.log('   - Plan Type:', candidate3.plan_type);
    console.log('   - Featured:', candidate3.is_featured);
    console.log('   - Updated At:', candidate3.updated_at);
    
    // 5. Remettre à free
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('6. Remise à free...');
    
    const resetData = {
      plan_type: 'free',
      plan_start_date: null,
      plan_end_date: null,
      is_featured: false,
      featured_until: null
    };
    
    const { data: resetCandidate, error: resetError } = await supabaseAdmin
      .from('candidates')
      .update(resetData)
      .eq('id', candidate.id)
      .select()
      .single();
    
    if (resetError) {
      console.error('❌ Erreur reset:', resetError);
      return;
    }
    
    console.log('✅ Candidat remis à free:');
    console.log('   - Plan Type:', resetCandidate.plan_type);
    console.log('   - Featured:', resetCandidate.is_featured);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testSupabaseDirect();

