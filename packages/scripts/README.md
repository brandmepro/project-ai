# Setup Scripts

This folder contains utility scripts for setting up the development environment.

## Available Scripts

### setup-java-env.ps1

Configures Java environment variables for Capacitor Android development.

**What it does:**
- Sets `JAVA_HOME` to your JDK installation
- Adds Java bin directory to `PATH`
- Verifies Java installation

**Usage:**

From project root:
```powershell
bun run setup:java
```

Or directly:
```powershell
powershell -ExecutionPolicy Bypass -File ./packages/scripts/setup-java-env.ps1
```

**Prerequisites:**
- JDK 17 or higher installed at `C:\Program Files\Java\jdk-17`
- If your Java is installed elsewhere, edit the script and update the `$javaPath` variable

**After running:**
- Close and reopen your terminal/VS Code
- Verify with: `java -version`
- Then you can run: `bun run mobile:run:android`

## When to Use

Run `setup:java` on:
- New development machine setup
- After reinstalling Java
- If you get `JAVA_HOME is not set` errors when building Android apps
