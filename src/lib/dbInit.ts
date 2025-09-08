import { supabase } from './supabase';

export const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Check if tables exist by trying to query them
    const tableChecks = [
      { name: 'leaderboard', query: () => supabase.from('leaderboard').select('id').limit(1) },
      { name: 'posts', query: () => supabase.from('posts').select('id').limit(1) },
      { name: 'users', query: () => supabase.from('users').select('id').limit(1) }
    ];

    const missingTables = [];

    for (const table of tableChecks) {
      try {
        const { error } = await table.query();
        if (error) {
          console.warn(`❌ Table '${table.name}' not accessible:`, error.message);
          missingTables.push(table.name);
        } else {
          console.log(`✅ Table '${table.name}' is accessible`);
        }
      } catch (error) {
        console.warn(`❌ Error checking table '${table.name}':`, error);
        missingTables.push(table.name);
      }
    }

    if (missingTables.length > 0) {
      console.warn('⚠️ Missing tables detected:', missingTables);
      console.log('📝 To fix database errors:');
      console.log('1. Go to: https://vsyyshxtwfhqqonsjzrr.supabase.co');
      console.log('2. Open SQL Editor');
      console.log('3. Run the script in users_table_fix.sql');
      console.log('4. Or run the full script in supabase_setup.sql');
      
      // Return mock data status
      return {
        success: true,
        usingMockData: true,
        missingTables
      };
    }

    console.log('✅ All database tables are accessible');
    return {
      success: true,
      usingMockData: false,
      missingTables: []
    };

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return {
      success: false,
      usingMockData: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Initialize database on module load (non-blocking)
initializeDatabase().then(result => {
  if (result.usingMockData) {
    console.log('🔄 Running in mock data mode due to missing database tables');
  } else {
    console.log('🚀 Database fully operational');
  }
}).catch(error => {
  console.error('🚨 Database initialization error:', error);
});
