$port = 8080
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener

try {
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
} catch {
  Write-Host "포트 $port 이(가) 이미 사용 중입니다."
  Write-Host "기존 'Pearl Sounds' 서버 창을 닫고 다시 실행해 주세요."
  exit 1
}

Write-Host "Pearl Sounds - http://localhost:$port/ (Range/seek 지원)"
Start-Process "http://localhost:$port/"

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.mp3'  = 'audio/mpeg'
  '.wav'  = 'audio/wav'
  '.ogg'  = 'audio/ogg'
}

function Send-Bytes {
  param(
    [System.Net.HttpListenerResponse]$Response,
    [byte[]]$Bytes,
    [int]$Offset,
    [int]$Count
  )

  $Response.ContentLength64 = $Count
  $Response.OutputStream.Write($Bytes, $Offset, $Count)
}

function Handle-Request {
  param([System.Net.HttpListenerContext]$Context)

  $request = $Context.Request
  $response = $Context.Response

  try {
    $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
    if ($localPath -eq '/') { $localPath = '/index.html' }

    $relativePath = $localPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
    $filePath = Join-Path $root $relativePath

    if (-not (Test-Path $filePath -PathType Leaf)) {
      $indexPath = Join-Path $filePath 'index.html'
      if (Test-Path $indexPath -PathType Leaf) {
        $filePath = $indexPath
      } else {
      $response.StatusCode = 404
      $notFound = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
      Send-Bytes -Response $response -Bytes $notFound -Offset 0 -Count $notFound.Length
      return
      }
    }

    $fileLength = (Get-Item $filePath).Length
    $ext = [IO.Path]::GetExtension($filePath).ToLower()
    $response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
    $response.Headers['Accept-Ranges'] = 'bytes'

    $rangeHeader = $request.Headers['Range']
    if ($rangeHeader -and $rangeHeader.StartsWith('bytes=')) {
      $rangeSpec = $rangeHeader.Substring(6)
      $start = 0
      $end = $fileLength - 1

      if ($rangeSpec -match '^(\d*)-(\d*)$') {
        if ($Matches[1] -ne '') { $start = [long]$Matches[1] }
        if ($Matches[2] -ne '') { $end = [long]$Matches[2] }
        if ($Matches[1] -eq '' -and $Matches[2] -ne '') {
          $suffixLength = [long]$Matches[2]
          $start = [Math]::Max($fileLength - $suffixLength, 0)
        }
      }

      if ($start -gt $end -or $start -ge $fileLength) {
        $response.StatusCode = 416
        $response.Headers['Content-Range'] = "bytes */$fileLength"
        return
      }

      $end = [Math]::Min($end, $fileLength - 1)
      $length = $end - $start + 1

      $response.StatusCode = 206
      $response.Headers['Content-Range'] = "bytes $start-$end/$fileLength"

      $stream = [System.IO.File]::OpenRead($filePath)
      try {
        $null = $stream.Seek($start, [System.IO.SeekOrigin]::Begin)
        $buffer = New-Object byte[] 65536
        $remaining = $length
        while ($remaining -gt 0) {
          $read = $stream.Read($buffer, 0, [Math]::Min($buffer.Length, $remaining))
          if ($read -le 0) { break }
          $response.OutputStream.Write($buffer, 0, $read)
          $remaining -= $read
        }
      } finally {
        $stream.Close()
      }
    } else {
      $response.StatusCode = 200
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      Send-Bytes -Response $response -Bytes $bytes -Offset 0 -Count $bytes.Length
    }
  } catch {
    $response.StatusCode = 500
    $message = [Text.Encoding]::UTF8.GetBytes('500 Internal Server Error')
    Send-Bytes -Response $response -Bytes $message -Offset 0 -Count $message.Length
  } finally {
    $response.Close()
  }
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  Handle-Request $context
}
