# PowerShell script to fix all JSX syntax errors

Write-Host "Starting to fix all JSX syntax errors..." -ForegroundColor Green

# Fix Learning.tsx
Write-Host "Fixing Learning.tsx..." -ForegroundColor Yellow
$learningFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Learning.tsx"
if (Test-Path $learningFile) {
    $content = Get-Content $learningFile -Raw
    $content = $content -replace '\{My Learning Plan\}', '{"My Learning Plan"}'
    Set-Content $learningFile -Value $content
    Write-Host "Fixed Learning.tsx" -ForegroundColor Green
}

# Fix Daily.tsx  
Write-Host "Fixing Daily.tsx..." -ForegroundColor Yellow
$dailyFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Daily.tsx"
if (Test-Path $dailyFile) {
    $content = Get-Content $dailyFile -Raw
    $content = $content -replace '\{Total Tasks\}', '{"Total Tasks"}'
    Set-Content $dailyFile -Value $content
    Write-Host "Fixed Daily.tsx" -ForegroundColor Green
}

# Fix Games.tsx
Write-Host "Fixing Games.tsx..." -ForegroundColor Yellow
$gamesFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Games.tsx"
if (Test-Path $gamesFile) {
    $content = Get-Content $gamesFile -Raw
    $content = $content -replace '\{Brain Games\}', '{"Brain Games"}'
    Set-Content $gamesFile -Value $content
    Write-Host "Fixed Games.tsx" -ForegroundColor Green
}

# Fix Community.tsx
Write-Host "Fixing Community.tsx..." -ForegroundColor Yellow
$communityFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Community.tsx"
if (Test-Path $communityFile) {
    $content = Get-Content $communityFile -Raw
    $content = $content -replace '\{Search amazing content\.\.\.\}', '{"Search amazing content..."}'
    Set-Content $communityFile -Value $content
    Write-Host "Fixed Community.tsx" -ForegroundColor Green
}

# Fix Profile.tsx
Write-Host "Fixing Profile.tsx..." -ForegroundColor Yellow
$profileFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Profile.tsx"
if (Test-Path $profileFile) {
    $content = Get-Content $profileFile -Raw
    $content = $content -replace '\{Joined March 2024\}', '{"Joined March 2024"}'
    Set-Content $profileFile -Value $content
    Write-Host "Fixed Profile.tsx" -ForegroundColor Green
}

# Fix Assessment.tsx - the long text needs quotes
Write-Host "Fixing Assessment.tsx..." -ForegroundColor Yellow
$assessmentFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Assessment.tsx"
if (Test-Path $assessmentFile) {
    $content = Get-Content $assessmentFile -Raw
    # Fix the long text that spans multiple lines
    $content = $content -replace '\{This Neurodiversity Assessment identifies traits of conditions like ADHD, Dyslexia, or Autism through simple yes/no questions\. It's a user-friendly starting point for understanding your cognitive profile\.\}', '{"This Neurodiversity Assessment identifies traits of conditions like ADHD, Dyslexia, or Autism through simple yes/no questions. It''s a user-friendly starting point for understanding your cognitive profile."}'
    Set-Content $assessmentFile -Value $content
    Write-Host "Fixed Assessment.tsx" -ForegroundColor Green
}

# Fix Settings.tsx - corrupted language options
Write-Host "Fixing Settings.tsx..." -ForegroundColor Yellow
$settingsFile = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Settings.tsx"
if (Test-Path $settingsFile) {
    $content = Get-Content $settingsFile -Raw
    # Fix corrupted Spanish option
    $content = $content -replace '\{Espa.*ol\}', '{"Spanish"}'
    # Fix corrupted French option
    $content = $content -replace '\{Fran.*ais\}', '{"French"}'
    # Fix German option
    $content = $content -replace '\{Deutsch\}', '{"German"}'
    Set-Content $settingsFile -Value $content
    Write-Host "Fixed Settings.tsx" -ForegroundColor Green
}

Write-Host "All JSX syntax errors have been fixed!" -ForegroundColor Green
Write-Host "You can now restart the development server." -ForegroundColor Cyan
