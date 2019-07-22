$contents = "#!C:/Program\ Files/Git/usr/bin/sh.exe
set -e
set -u
./git-hooks/pre-commit.sh
"


$path = [System.IO.Path]::GetFullPath("$PSScriptRoot\..\.git\hooks\pre-commit")

New-Item -ItemType File -Path $path -Value $contents -Force
