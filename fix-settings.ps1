# Comprehensive fix for Settings.tsx syntax errors
$file = "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Settings.tsx"

if (Test-Path $file) {
    Write-Host "Processing Settings.tsx..." -ForegroundColor Green
    
    # Read file content
    $content = Get-Content $file -Raw
    
    # Fix all syntax errors
    $content = $content -replace '\{Settings\}', '{"Settings"}'
    $content = $content -replace '\{Adjust text size\}', '{"Adjust text size"}'
    $content = $content -replace '\{Small\}', '{"Small"}'
    $content = $content -replace '\{Medium\}', '{"Medium"}'
    $content = $content -replace '\{Large\}', '{"Large"}'
    $content = $content -replace '\{Reduce Motion\}', '{"Reduce Motion"}'
    $content = $content -replace '\{Minimize animations\}', '{"Minimize animations"}'
    $content = $content -replace '\{High Contrast\}', '{"High Contrast"}'
    $content = $content -replace '\{Enhance visibility\}', '{"Enhance visibility"}'
    $content = $content -replace '\{Primary Color\}', '{"Primary Color"}'
    $content = $content -replace '\{Customize accent color\}', '{"Customize accent color"}'
    $content = $content -replace '\{Notifications & Accessibility\}', '{"Notifications & Accessibility"}'
    $content = $content -replace '\{Daily Reminders\}', '{"Daily Reminders"}'
    $content = $content -replace '\{Activity notifications\}', '{"Activity notifications"}'
    $content = $content -replace '\{Sound Effects\}', '{"Sound Effects"}'
    $content = $content -replace '\{Notification sounds\}', '{"Notification sounds"}'
    $content = $content -replace '\{Enable audio for text\}', '{"Enable audio for text"}'
    $content = $content -replace '\{Privacy & Language\}', '{"Privacy & Language"}'
    $content = $content -replace '\{Profile Visibility\}', '{"Profile Visibility"}'
    $content = $content -replace '\{Who can see your profile\}', '{"Who can see your profile"}'
    $content = $content -replace '\{Text-to-Speech\}', '{"Text-to-Speech"}'
    $content = $content -replace '\{Public\}', '{"Public"}'
    $content = $content -replace '\{Friends Only\}', '{"Friends Only"}'
    $content = $content -replace '\{Private\}', '{"Private"}'
    $content = $content -replace '\{Preferred Language\}', '{"Preferred Language"}'
    $content = $content -replace '\{Select your language\}', '{"Select your language"}'
    $content = $content -replace '\{English\}', '{"English"}'
    $content = $content -replace '\{Spanish\}', '{"Spanish"}'
    $content = $content -replace '\{French\}', '{"French"}'
    $content = $content -replace '\{Save Changes\}', '{"Save Changes"}'
    
    # Write back to file
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Fixed Settings.tsx" -ForegroundColor Yellow
}

Write-Host "Settings.tsx processed!" -ForegroundColor Cyan
