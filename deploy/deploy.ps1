# Build + deploy do álbum para a VPS
# Uso:  pwsh -File deploy\deploy.ps1

$ErrorActionPreference = 'Stop'

$Remote   = 'root@72.62.12.42'
$DocRoot  = '/home/visaoativa/web/albumfifa.com.br/public_html'
$Owner    = 'visaoativa:www-data'
$DistPath = Join-Path $PSScriptRoot '..\dist'

Write-Host '==> npm run build' -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot '..')
try   { npm run build }
finally { Pop-Location }

if (-not (Test-Path $DistPath)) { throw "dist/ não encontrado em $DistPath" }

Write-Host "==> Limpando $DocRoot" -ForegroundColor Cyan
ssh $Remote "rm -rf $DocRoot/* $DocRoot/.[!.]* 2>/dev/null; true"

Write-Host '==> Enviando dist/ via SCP' -ForegroundColor Cyan
scp -r "$DistPath\*" "${Remote}:$DocRoot/"

Write-Host '==> Ajustando permissões' -ForegroundColor Cyan
ssh $Remote "chown -R $Owner $DocRoot/ && find $DocRoot -type d -exec chmod 755 {} \; && find $DocRoot -type f -exec chmod 644 {} \;"

Write-Host '==> Teste HTTP' -ForegroundColor Cyan
ssh $Remote "curl -sI --resolve albumfifa.com.br:80:72.62.12.42 http://albumfifa.com.br/ | head -3"

Write-Host '==> Deploy concluído.' -ForegroundColor Green
