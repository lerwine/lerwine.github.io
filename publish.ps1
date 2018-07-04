Function Remove-DirectoryContentsRecursive {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$TargetDirectory
    )
    if ($TargetDirectory | Test-Path -PathType Container) {
        @(Get-ChildItem -LiteralPath $TargetDirectory -Directory) | ForEach-Object {
            Remove-DirectoryContentsRecursive -SourceDirectory $_.FullName -TargetDirectory $TargetPath;
            Remove-Item -LiteralPath $_.FullName -Force;
        }
        @(Get-ChildItem -LiteralPath $SourceDirectory -File) | ForEach-Object {
            Remove-Item -LiteralPath $_.FullName -Force;
        }
    }
}

Function Copy-DirectoryRecursive {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$SourceDirectory,
        
        [Parameter(Mandatory = $true)]
        [string]$TargetDirectory
    )

    @(Get-ChildItem -LiteralPath $SourceDirectory -Directory) | ForEach-Object {
        $TargetPath = $TargetDirectory | Join-Path -ChildPath $_.Name;
        if (-not ($TargetPath | Test-Path -PathType Container)) {
            if ($TargetPath | Test-Path) { (Remove-Item -LiteralPath $TargetPath) | Out-Null }
            (New-Item -Path $TargetPath -ItemType "Directory") | Out-Null;
            Copy-DirectoryRecursive -SourceDirectory $_.FullName -TargetDirectory $TargetPath;
        }
    }
    @(Get-ChildItem -LiteralPath $SourceDirectory -File) | ForEach-Object {
        $TargetPath = $TargetDirectory | Join-Path -ChildPath $_.Name;
        if (($TargetPath | Test-Path -PathType Container)) { Remove-DirectoryContentsRecursive -TargetDirectory $TargetPath }
        Copy-Item -LiteralPath $_.FullName -Destination $TargetPath -Force;
    }
}


Function Get-GitStatus {
    Param()
    $GitStatus = @{
        Modified = @();
        Deleted = @();
        Added = @();
        NotStaged = @();
    }
    @(((git 'status' '-s') | Out-String) -split '\r\n?|\n') | ForEach-Object {
        if ($_ -match '^\s*([^\s]+)\s*(\S+(?:\s+\S+)*)\s*$') {
            switch ($Matches[1]) {
                'M' { $GitStatus.Modified += @($Matches[2]); break; }
                'D' { $GitStatus.Deleted += @($Matches[2]); break; }
                'A' { $GitStatus.Added += @($Matches[2]); break; }
                default { $GitStatus.NotStaged += @($Matches[2]); break; }
            }
        }
    }
    (New-Object -TypeName 'System.Management.Automation.PSObject' -Property $GitStatus) | Write-Output;
}

Function Submit-GitChanges {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $GitStatus = Get-GitStatus;

    if ($GitStatus.NotChanged.Count -gt 0) {
        $GitStatus.NotChanged | ForEach-Object { (git 'add' $_ ) | Out-Null }
    }
    if ($GitStatus.Modified.Count -gt 0 -or $GitStatus.Deleted.Count -gt 0 -or $GitStatus.Added.Count -gt 0 -or $GitStatus.NotStaged.Count -gt 0) {
        (git 'commit' '-m' $Message '-q')
    }
}

$JSonText = (Get-Content -LiteralPath ($PSScriptRoot | Join-Path -ChildPath 'package.json') | Out-String).Trim();
$PackageJson = $JSonText | ConvertFrom-Json;
if ($PackageJson.main -isnot [string]) { throw "package.json does not have a 'main' setting." }
if ($PackageJson.main.Length -eq 0) { throw "package.json 'main' setting is empty." }

$SourceDir = $null;
if ($PackageJson.main.StartsWith('/') -or $PackageJson.main.StartsWith('\')) {
    $SourceDir = $PSScriptRoot | Join-Path -ChildPath $PackageJson.main.Substring(1);
} else {
    $SourceDir = $PSScriptRoot | Join-Path -ChildPath $PackageJson.main;
}
$SourceDir = $SourceDir | Split-Path -Parent;
if (-not ($SourceDir | Test-Path -PathType Container)) { throw "Directory for the package.json 'main' setting does not exist" }

$TempFolder = $env:TEMP | Join-Path -ChildPath ([Guid]::NewGuid().ToString('N'));
(New-item -Path $TempFolder -ItemType "Directory") | Out-Null;
try {
    Copy-DirectoryRecursive -SourceDirectory $SourceDir -TargetDirectory $TempFolder;
} finally { <#Remove-Item -Path $TempFolder -Force#> }
('.gitignore', 'LICENSE') | ForEach-Object { Copy-Item -LiteralPath ($PSScriptRoot | Join-Path -ChildPath $_) -Destination ($TempFolder | Join-Path -ChildPath $_) }
$GitStatus

Submit-GitChanges -Message 'Added new publishing script';