$body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json"
Write-Host "JWT Token: $($res.token.Substring(0,40))..."
Write-Host "Role: $($res.role)"
Write-Host "Message: $($res.message)"

