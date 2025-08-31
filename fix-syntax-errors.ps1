# PowerShell script to fix syntax errors in React component files
$files = @(
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Settings.tsx",
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Learning.tsx",
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Games.tsx",
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Daily.tsx",
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Assessment.tsx",
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Community.tsx",
    "C:\Users\sujay\Desktop\NUEROHUB\src\pages\Profile.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Green
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Fix common syntax errors
        $content = $content -replace '\{Settings saved!\}', '{"Settings saved!"}'
        $content = $content -replace '\{Search courses\.\.\.\}', '{"Search courses..."}'
        $content = $content -replace '\{Level Up Your Brain!\}', '{"Level Up Your Brain!"}'
        $content = $content -replace '\{Daily Activities\}', '{"Daily Activities"}'
        $content = $content -replace '\{About This Assessment\}', '{"About This Assessment"}'
        $content = $content -replace '\{Please log in to access the platform\}', '{"Please log in to access the platform"}'
        $content = $content -replace '\{John Doe\}', '{"John Doe"}'
        $content = $content -replace '\{Embark on an epic cognitive adventure! Complete challenges, earn achievements, and climb the leaderboards while boosting your brainpower\.\}', '{"Embark on an epic cognitive adventure! Complete challenges, earn achievements, and climb the leaderboards while boosting your brainpower."}'
        
        # Write back to file
        Set-Content -Path $file -Value $content -Encoding UTF8
        Write-Host "Fixed $file" -ForegroundColor Yellow
    }
}

Write-Host "All files processed!" -ForegroundColor Cyan
