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
        if ($TargetPath | Test-Path -PathType Leaf) {
            $SourceContent = (Get-Content -LiteralPath $_.FullName -Force) | Out-String;
            $TargetContent = (Get-Content -LiteralPath $TargetPath -Force) | Out-String;
            if ($SourceContent -ceq $TargetContent) { $TargetPath = $null }
        }
        if ($TargetPath -ne $null) {
            Copy-Item -LiteralPath $_.FullName -Destination $TargetPath -Force;
        }
    }
}


Function Get-GitStatus {
    [CmdletBinding(DefaultParameterSetName = 'All')]
    Param(
        [Parameter(Mandatory = $true, ParameterSetName = 'Branches')]
        [switch]$BranchesOnly,
        
        [Parameter(Mandatory = $true, ParameterSetName = 'Files')]
        [switch]$FilesOnly,

        [Parameter(ParameterSetName = 'All')]
        [switch]$All
    )
    $GitStatus = @{ };
    if ($PSCmdlet.ParameterSetName -eq 'All' -or $PSCmdlet.ParameterSetName -eq 'Branches') {
        $GitStatus['CurrentBranch'] = $null;
        $GitStatus['LocalBranches'] = @();
        $GitStatus['RemoteBranches'] = @();
    
        $GitStatus.LocalBranches = @(((git 'branch' '--list') | Out-String) -split '\r\n?|\n') | ForEach-Object {
            if ($_ -match '^\s*(\*\s+)?(\S+(?:\s+\S+)*)\s*$') {
                if ($Matches[1] -ne $null) { $GitStatus.CurrentBranch = $Matches[2] }
                $Matches[2] | Write-Output;
            }
        }
        $GitStatus.RemoteBranches = @(((git 'branch' '--list' '--remote') | Out-String) -split '\r\n?|\n') | ForEach-Object {
            if ($_ -match '^\s*(?:\*\s+)?(\S+(?:\s+\S+)*)/(\S+(?:\s+\S+)*)\s*$') {
                (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    Remote = $Matches[1];
                    Branch = $Matches[2];
                }) | Write-Output;
            }
        }
    }
    if ($PSCmdlet.ParameterSetName -eq 'All' -or $PSCmdlet.ParameterSetName -eq 'Files') {
        $GitStatus['Modified'] = @();
        $GitStatus['Deleted'] = @();
        $GitStatus['Added'] = @();
        $GitStatus['NotStaged'] = @();
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
    }
    (New-Object -TypeName 'System.Management.Automation.PSObject' -Property $GitStatus) | Write-Output;
}

Function Submit-GitChanges {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $GitStatus = Get-GitStatus -FilesOnly;

    if ($GitStatus.NotChanged.Count -gt 0) {
        $GitStatus.NotChanged | ForEach-Object { (git 'add' $_ ) | Out-Null }
    }
    if ($GitStatus.Modified.Count -gt 0 -or $GitStatus.Deleted.Count -gt 0 -or $GitStatus.Added.Count -gt 0 -or $GitStatus.NotStaged.Count -gt 0) {
        (git 'commit' '-m' $Message '-a' '-q')
    }
}

Function Select-GitBranch {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $GitStatus = Get-GitStatus;
    if ($GitStatus.Modified.Count -gt 0 -or $GitStatus.Deleted.Count -gt 0 -or $GitStatus.Added.Count -gt 0 -or $GitStatus.NotStaged.Count -gt 0) {
        if ($GitStatus.CurrentBranch -ne $Name) { throw "Cannot change branch - Changes need to be checked in" }
    } else {
        if ($GitStatus.CurrentBranch -ne $Name) {
            $bn = $GitStatus.LocalBranches | Where-Object { $_ -ceq $Name } | Select-Object -First 1;
            if ($bn -eq $null) { $GitStatus.LocalBranches | Where-Object { $_ -ieq $Name } | Select-Object -First 1 }
            if ($bn -eq $null) {
                $bn = $GitStatus.RemoteBraches | Where-Object { $_.Branch -ceq $Name } | Select-Object -First 1;
                if ($bn -eq $null) {
                    $GitStatus.RemoteBraches | Where-Object { $_.Branch -ieq $Name } | Select-Object -First 1;
                    if ($bn -eq $null) { throw "Branch $Name not found." }
                }
                (git 'checkout' '-b' $bn.Remote '--track' "$($bn.Remote)/$($bn.Branch)")
            } else {
                (git 'checkout' $bn)
            }
            $GitStatus = Get-GitStatus -BranchesOnly;
            if ($GitStatus.CurrentBranch -ne $Name) { throw "Failed to switch branches" }
        }
    }
}

Function Import-GitChangesFromRemote {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Remote,
        
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Repository
    )

    Process {
        (git "pull" "--tags" $Remote $Repository) | Out-Null;
    }
}

Function Export-GitChangesToRemote {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Remote,
        
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Repository
    )

    Process {
        (git "push" $Remote "$Repository`:$Repository") | Out-Null;
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
    Submit-GitChanges -Message 'Publish updates';
    $OriginalStatus = Get-GitStatus;
    Select-GitBranch -Name 'gh-pages';
    try {
        $Status = Get-GitStatus;
        $CurrentRemote = $Status.RemoteBranches | Where-Object { $_.Branch -eq $Status.CurrentBranch }
        Export-GitChangesToRemote -Remote $CurrentRemote -Repository $Status.CurrentBranch;
        Import-GitChangesFromRemote -Remote $CurrentRemote -Repository $Status.CurrentBranch;
        Copy-DirectoryRecursive -SourceDirectory $TempFolder -TargetDirectory $PSScriptRoot;
        Submit-GitChanges -Message 'Publish updates';
        Export-GitChangesToRemote -Remote $CurrentRemote -Repository $Status.CurrentBranch;
    } finally { Select-GitBranch -Name $OriginalStatus.CurrentBranch }
} finally { <#Remove-Item -Path $TempFolder -Force#> }
('.gitignore', 'LICENSE') | ForEach-Object { Copy-Item -LiteralPath ($PSScriptRoot | Join-Path -ChildPath $_) -Destination ($TempFolder | Join-Path -ChildPath $_) }



