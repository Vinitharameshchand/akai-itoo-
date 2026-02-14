 # Random commit messages list
$messages = @(
    "update tweaks",
    "small fixes",
    "patch applied",
    "minor improvements",
    "refactor change",
    "cleanup",
    "bug fix",
    "adjust config",
    "optimize code",
    "final touch",
    "quick update",
    "style improvements",
    "UI enhancements",
    "performance boost",
    "code cleanup",
    "dependency update",
    "fix typo",
    "improve layout",
    "update styles",
    "refactor components",
    "add validation",
    "update documentation",
    "improve responsiveness",
    "fix alignment",
    "update dependencies",
    "enhance UX",
    "fix spacing",
    "improve accessibility",
    "update colors",
    "fix navigation",
    "optimize images",
    "improve performance",
    "update fonts",
    "fix responsive design",
    "add animations",
    "improve loading",
    "update API calls",
    "fix error handling",
    "improve state management",
    "update routing"
)

# Get all modified, added or deleted files from git
$files = git status --porcelain | ForEach-Object { $_.Substring(3) }

foreach ($file in $files) {

    # Pick a random message
    $msg = Get-Random -InputObject $messages
    
    Write-Host "Staging and committing: $file with message: '$msg'"

    # Add file
    git add "$file"

    # Commit file
    git commit -m "$msg"
}

Write-Host "All changes committed successfully!" 