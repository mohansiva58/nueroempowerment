# PowerShell script to replace t() function calls with static text
$files = @(
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Community.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Jobs.tsx", 
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Games.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Learning.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Daily.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Profile.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Settings.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Quiz.tsx",
    "c:\Users\sujay\Desktop\NUEROHUB\src\pages\Assessment.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        
        # Replace common t() function calls with static text for now
        # This is a temporary fix - the proper way would be to implement FormattedMessage for each
        $content = $content -replace "t\('([^']+)',\s*'([^']+)'\)", '$2'
        $content = $content -replace 't\("([^"]+)",\s*"([^"]+)"\)', '$2'
        $content = $content -replace "{t\('([^']+)',\s*'([^']+)'\)}", '$2'
        $content = $content -replace '{t\("([^"]+)",\s*"([^"]+)"\)}', '$2'
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed t() calls in: $file"
    }
}

Write-Host "All t() function calls replaced!"
