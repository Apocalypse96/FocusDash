/**
 * Seed script to add sample data for testing Phase 2 integration
 * Run this script to populate the database with test sessions and goals
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedData() {
  console.log('🌱 Starting to seed data...');

  // You'll need to replace this with your actual user ID
  // You can get this from the browser console when logged in
  const userId = 'YOUR_USER_ID_HERE'; // Replace with actual user ID

  try {
    // Create sample sessions for the last 7 days
    const sessions = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Add 2-4 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
        const startMinute = Math.floor(Math.random() * 60);
        
        const startTime = new Date(date);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const duration = 25; // Pomodoro duration
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        const completed = Math.random() > 0.1; // 90% completion rate
        
        sessions.push({
          user_id: userId,
          type: 'pomodoro',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: duration,
          completed: completed,
          interrupted: !completed,
        });
      }
    }

    // Insert sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert(sessions);

    if (sessionError) {
      console.error('Error inserting sessions:', sessionError);
    } else {
      console.log(`✅ Created ${sessions.length} sample sessions`);
    }

    // Create sample goals
    const goals = [
      {
        user_id: userId,
        title: 'Complete Project Alpha',
        description: 'Finish the main features for the upcoming release',
        target_pomodoros: 20,
        current_pomodoros: 12,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        completed: false,
      },
      {
        user_id: userId,
        title: 'Daily Focus Goal',
        description: 'Complete 8 pomodoros today',
        target_pomodoros: 8,
        current_pomodoros: 5,
        deadline: new Date().toISOString(), // Today
        completed: false,
      },
      {
        user_id: userId,
        title: 'Learn React Hooks',
        description: 'Study and practice React hooks',
        target_pomodoros: 15,
        current_pomodoros: 15,
        completed: true,
      },
    ];

    // Insert goals
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .insert(goals);

    if (goalError) {
      console.error('Error inserting goals:', goalError);
    } else {
      console.log(`✅ Created ${goals.length} sample goals`);
    }

    console.log('🎉 Data seeding completed successfully!');
    console.log('📊 You should now see real data in your dashboard');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Instructions for running this script
console.log(`
📋 Instructions:
1. Replace 'YOUR_USER_ID_HERE' with your actual user ID
2. Run: node scripts/seed-data.js
3. Refresh your dashboard to see the data

To get your user ID:
1. Open browser console on the dashboard
2. Run: console.log(JSON.parse(localStorage.getItem('sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token'))?.user?.id)
`);

// Uncomment the line below to run the seeding
// seedData();
