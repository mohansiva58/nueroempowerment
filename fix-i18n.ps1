# PowerShell script to replace react-i18next imports with react-intl
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
        # Replace the import
        $content = $content -replace "import { useTranslation } from 'react-i18next';", ""
        $content = $content -replace 'import { useTranslation } from "react-i18next";', ""
        # Remove the useTranslation hook usage
        $content = $content -replace "const { t } = useTranslation\(\);", ""
        $content = $content -replace 'const \{ t \} = useTranslation\(\);', ""
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "All files processed!"
