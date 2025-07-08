const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create temporary files for waitlist build
const srcDir = path.join(__dirname, '..', 'src');
const publicDir = path.join(__dirname, '..', 'public');

// Backup original files
const originalIndex = path.join(srcDir, 'index.tsx');
const originalHtml = path.join(publicDir, 'index.html');
const backupIndex = path.join(srcDir, 'index.tsx.backup');
const backupHtml = path.join(publicDir, 'index.html.backup');

console.log('🔄 Building waitlist site...');

try {
  // Backup original files
  if (fs.existsSync(originalIndex)) {
    fs.copyFileSync(originalIndex, backupIndex);
  }
  if (fs.existsSync(originalHtml)) {
    fs.copyFileSync(originalHtml, backupHtml);
  }

  // Replace with waitlist files
  const waitlistIndex = path.join(srcDir, 'waitlist-index.tsx');
  const waitlistHtml = path.join(publicDir, 'waitlist.html');

  if (fs.existsSync(waitlistIndex)) {
    fs.copyFileSync(waitlistIndex, originalIndex);
    console.log('✅ Replaced index.tsx with waitlist version');
  }
  if (fs.existsSync(waitlistHtml)) {
    fs.copyFileSync(waitlistHtml, originalHtml);
    console.log('✅ Replaced index.html with waitlist version');
  }

  // Build the project
  console.log('📦 Running build...');
  execSync('npm run build', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..')
  });

  // Create waitlist-build directory
  const waitlistBuildDir = path.join(__dirname, '..', 'waitlist-build');
  const buildDir = path.join(__dirname, '..', 'dist');

  if (fs.existsSync(waitlistBuildDir)) {
    fs.rmSync(waitlistBuildDir, { recursive: true });
  }

  // Copy build to waitlist-build
  if (fs.existsSync(buildDir)) {
    fs.cpSync(buildDir, waitlistBuildDir, { recursive: true });
    
    // Remove unnecessary files
    const filesToRemove = [
      path.join(waitlistBuildDir, 'waitlist.html'),
      path.join(waitlistBuildDir, 'index.html.backup')
    ];
    
    filesToRemove.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️  Removed ${path.basename(file)}`);
      }
    });
    
    console.log('✅ Waitlist build created in waitlist-build/ directory');
    console.log('📁 You can now zip the contents of waitlist-build/ and upload to Porkbun');
  } else {
    console.log('❌ Build directory not found');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
} finally {
  // Restore original files
  if (fs.existsSync(backupIndex)) {
    fs.copyFileSync(backupIndex, originalIndex);
    fs.unlinkSync(backupIndex);
  }
  if (fs.existsSync(backupHtml)) {
    fs.copyFileSync(backupHtml, originalHtml);
    fs.unlinkSync(backupHtml);
  }
  console.log('🔄 Original files restored');
} 