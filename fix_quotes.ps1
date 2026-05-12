$srcPath = "c:\drishya2\frontend\src"
$files = Get-ChildItem -Recurse -Path $srcPath -Include "*.jsx","*.js" | Where-Object {
    $_.FullName -notlike "*node_modules*" -and
    $_.Name -ne "api.js"
}

$totalFixed = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match '\$\{API_BASE_URL\}') {
        Write-Host "Fixing quotes in: $($file.Name)"
        
        # Fix pattern 1: "${API_BASE_URL}/..." -> `${API_BASE_URL}/...`  (double-quote strings)
        # Fix pattern 2: '${API_BASE_URL}/...'  -> `${API_BASE_URL}/...`  (single-quote strings)
        # We do this by finding axios calls with the broken interpolation

        # Replace "...${API_BASE_URL}..."  with backtick version
        # Strategy: find any string literal containing ${API_BASE_URL} that is NOT already in backticks
        
        # Replace double-quoted strings containing ${API_BASE_URL}
        $newContent = $content -replace '"(\$\{API_BASE_URL\}[^"]*)"', '`$1`'
        # Replace single-quoted strings containing ${API_BASE_URL}  
        $newContent = $newContent -replace "'(\$\{API_BASE_URL\}[^']*)'", '`$1`'
        
        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "  Fixed: $($file.Name)"
            $totalFixed++
        } else {
            Write-Host "  No change needed: $($file.Name)"
        }
    }
}

Write-Host ""
Write-Host "Total files fixed: $totalFixed"
