# Setup Java Environment Variables for Capacitor Android Development
# This script configures JAVA_HOME and adds Java to PATH

Write-Host 'Setting up Java environment variables...' -ForegroundColor Cyan

# Check for Android Studio's bundled JDK
$javaPath = 'C:\Program Files\Android\Android Studio\jbr'

if (-Not (Test-Path $javaPath)) {
    Write-Host 'ERROR: Android Studio JDK not found!' -ForegroundColor Red
    Write-Host 'Please install Android Studio from: https://developer.android.com/studio' -ForegroundColor Yellow
    Write-Host 'Android Studio includes JDK 21 required for Capacitor development.' -ForegroundColor Yellow
    exit 1
}

Write-Host "Java found at: $javaPath" -ForegroundColor Green

$javaBinPath = "$javaPath\bin"

# Set JAVA_HOME (permanently for user)
Write-Host 'Setting JAVA_HOME environment variable...' -ForegroundColor Cyan
[Environment]::SetEnvironmentVariable('JAVA_HOME', $javaPath, 'User')

# Add Java bin to PATH (permanently for user) - PUT IT FIRST for priority
Write-Host 'Adding Java to PATH...' -ForegroundColor Cyan
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')

# Remove any existing Java paths to avoid conflicts
$pathArray = $currentPath -split ';'
$cleanedPaths = $pathArray | Where-Object { $_ -notmatch '\\Java\\' -and $_ -notmatch '\\jbr\\' }
$cleanedPath = $cleanedPaths -join ';'

# Add Android Studio JDK at the BEGINNING (highest priority)
$newPath = "$javaBinPath;$cleanedPath"
[Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
Write-Host 'Android Studio JDK added to PATH with highest priority' -ForegroundColor Green

# Set for current session (immediate effect) - PUT IT FIRST
$env:JAVA_HOME = $javaPath
$env:Path = "$javaBinPath;" + $env:Path

Write-Host ''
Write-Host 'Setting up Android SDK...' -ForegroundColor Cyan

# Find Android SDK location
$possibleSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk"
)

$androidSdkPath = $null
foreach ($sdkPath in $possibleSdkPaths) {
    if (Test-Path $sdkPath) {
        $androidSdkPath = $sdkPath
        Write-Host "Found Android SDK at: $sdkPath" -ForegroundColor Green
        break
    }
}

if (-Not $androidSdkPath) {
    Write-Host 'WARNING: Android SDK not found!' -ForegroundColor Yellow
    Write-Host 'Please open Android Studio and install the Android SDK.' -ForegroundColor Yellow
    Write-Host 'Then run this script again.' -ForegroundColor Yellow
} else {
    # Set ANDROID_HOME (permanently for user)
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidSdkPath, 'User')
    $env:ANDROID_HOME = $androidSdkPath
    
    # Add Android SDK tools to PATH
    $androidToolsPaths = "$androidSdkPath\platform-tools;$androidSdkPath\tools;$androidSdkPath\tools\bin"
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    
    if ($currentPath -notlike "*platform-tools*") {
        $newPath = "$currentPath;$androidToolsPaths"
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        $env:Path += ";$androidToolsPaths"
        Write-Host 'Android SDK tools added to PATH' -ForegroundColor Green
    }
}

Write-Host ''
Write-Host 'Environment setup complete!' -ForegroundColor Green
Write-Host ''
Write-Host 'IMPORTANT: Close and reopen your terminal for permanent changes.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Verifying setup:' -ForegroundColor Cyan
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White

# Test Java
try {
    $javaVersion = & java -version 2>&1
    Write-Host ''
    Write-Host 'Java version:' -ForegroundColor Cyan
    Write-Host $javaVersion -ForegroundColor White
} catch {
    Write-Host 'ERROR: Could not verify Java installation' -ForegroundColor Red
}

Write-Host ''
Write-Host 'You can now run mobile commands!' -ForegroundColor Green
