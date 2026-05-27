// Admin Panel Setup Verification Script
// Run this with: node verify-admin-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Admin Panel Setup...\n');

let issuesFound = 0;
let checksCompleted = 0;

// Helper functions
const checkFileExists = (filePath) => {
  checksCompleted++;
  if (fs.existsSync(filePath)) {
    console.log(`✅ [${checksCompleted}] File exists: ${filePath}`);
    return true;
  } else {
    console.log(`❌ [${checksCompleted}] Missing file: ${filePath}`);
    issuesFound++;
    return false;
  }
};

const checkFileContains = (filePath, searchString, description) => {
  checksCompleted++;
  if (!fs.existsSync(filePath)) {
    console.log(`❌ [${checksCompleted}] File not found: ${filePath}`);
    issuesFound++;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(searchString)) {
    console.log(`✅ [${checksCompleted}] ${description}`);
    return true;
  } else {
    console.log(`❌ [${checksCompleted}] Missing in ${filePath}: ${description}`);
    issuesFound++;
    return false;
  }
};

const countOccurrences = (filePath, searchString) => {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf8');
  return (content.match(new RegExp(searchString, 'g')) || []).length;
};

// Check 1: Essential files
console.log('\n📁 Checking Essential Files...');
checkFileExists('package.json');
checkFileExists('src/lib/supabase.ts');
checkFileExists('src/contexts/AuthContext.tsx');
checkFileExists('src/components/AdminLayout.tsx');
checkFileExists('.env.example') || checkFileExists('.env');

// Check 2: Admin pages
console.log('\n📄 Checking Admin Pages...');
const adminPages = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/AdminRooms.tsx',
  'src/pages/AdminBookings.tsx',
  'src/pages/AdminFAQ.tsx',
  'src/pages/AdminReviews.tsx',
  'src/pages/AdminFeatures.tsx',
  'src/pages/AdminAttractions.tsx',
  'src/pages/AdminUsers.tsx',
  'src/pages/Login.tsx'
];

adminPages.forEach(page => checkFileExists(page));

// Check 3: Text color fix verification
console.log('\n🎨 Verifying Text Color Fix...');
const filesToCheck = [
  'src/pages/AdminFAQ.tsx',
  'src/pages/AdminRooms.tsx',
  'src/pages/AdminReviews.tsx',
  'src/pages/AdminBookings.tsx'
];

filesToCheck.forEach(file => {
  const count = countOccurrences(file, 'text-gray-900');
  checksCompleted++;
  if (count > 0) {
    console.log(`✅ [${checksCompleted}] ${file}: Found ${count} instances of text-gray-900`);
  } else {
    console.log(`⚠️ [${checksCompleted}] ${file}: No text-gray-900 found (may need manual check)`);
    issuesFound++;
  }
});

// Check 4: AuthContext functionality
console.log('\n🔐 Checking Authentication Setup...');
checkFileContains('src/contexts/AuthContext.tsx', 'signIn', 'SignIn function defined');
checkFileContains('src/contexts/AuthContext.tsx', 'signOut', 'SignOut function defined');
checkFileContains('src/contexts/AuthContext.tsx', 'is_admin', 'Admin check implemented');

// Check 5: Supabase client setup
console.log('\n💾 Checking Supabase Configuration...');
checkFileContains('src/lib/supabase.ts', 'createClient', 'Supabase client created');
checkFileContains('src/lib/supabase.ts', 'VITE_SUPABASE_URL', 'Environment variable used');

// Check 6: Admin Layout protection
console.log('\n🛡️ Checking Admin Route Protection...');
checkFileContains('src/components/AdminLayout.tsx', 'is_admin', 'Admin check in layout');
checkFileContains('src/components/AdminLayout.tsx', 'navigate', 'Redirect logic present');

// Check 7: Package dependencies
console.log('\n📦 Checking Dependencies...');
if (checkFileExists('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@supabase/supabase-js',
    'react',
    'react-dom',
    'react-router-dom',
    'react-hot-toast'
  ];
  
  requiredDeps.forEach(dep => {
    checksCompleted++;
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ [${checksCompleted}] Dependency found: ${dep}`);
    } else {
      console.log(`❌ [${checksCompleted}] Missing dependency: ${dep}`);
      issuesFound++;
    }
  });
}

// Check 8: Netlify Functions
console.log('\n⚡ Checking Netlify Functions...');
checkFileExists('netlify/functions/simple-login.js') || 
checkFileExists('netlify/functions/simple-login.ts') ||
checkFileExists('functions/simple-login.js');

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total checks: ${checksCompleted}`);
console.log(`Issues found: ${issuesFound}`);

if (issuesFound === 0) {
  console.log('\n✨ All checks passed! Admin panel setup looks good.');
  console.log('\n📝 Next steps:');
  console.log('1. Ensure .env file has correct Supabase credentials');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run dev');
  console.log('4. Test login at: http://localhost:5173/login');
  console.log('5. Open test page: http://localhost:5173/test-admin-functionality.html');
} else {
  console.log(`\n⚠️  Found ${issuesFound} issue(s) that need attention.`);
  console.log('\n📝 Recommended actions:');
  console.log('1. Review the issues marked with ❌ above');
  console.log('2. Check the ADMIN_PANEL_DEBUG_GUIDE.md for solutions');
  console.log('3. Verify all required files are present');
  console.log('4. Run: npm install to ensure dependencies');
}

console.log('\n' + '='.repeat(50));
console.log('For detailed debugging info, see: ADMIN_PANEL_DEBUG_GUIDE.md');
console.log('For interactive testing, open: test-admin-functionality.html');
console.log('='.repeat(50) + '\n');

process.exit(issuesFound > 0 ? 1 : 0);
