const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nylkjecjaypwjtkfyrqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGtqZWNqYXlwd2p0a2Z5cnFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIzMTYzOCwiZXhwIjoyMDY2ODA3NjM4fQ.Kwwru1hZt-GFaXRH4et8_NmDFzaERa0jWMWTxR251rE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetVoiceUsage() {
  try {
    const userId = 'a3e4b202-438f-4a4a-bd4e-e450ea30b056';
    
    console.log('🔄 Resetting voice minutes usage...');
    
    const { data, error } = await supabase
      .from('subscription_usage')
      .update({ 
        usage_count: 0, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('feature_name', 'voice_minutes');
    
    if (error) {
      console.error('❌ Error resetting usage:', error);
    } else {
      console.log('✅ Voice minutes usage reset to 0!');
      console.log('📊 Updated rows:', data);
    }
  } catch (err) {
    console.error('❌ Failed to reset usage:', err);
  }
}

resetVoiceUsage();
