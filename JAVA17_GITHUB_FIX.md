# Java 17 GitHub Actions Fix

The Android Gradle plugin requires Java 17. GitHub runners can contain multiple JDKs, and simply installing `openjdk-17-jdk` with `apt` does not always make it the active Java for Gradle.

This project fixes that by using `actions/setup-java` before Buildozer runs:

```yaml
- name: Set up Java 17
  uses: actions/setup-java@v5
  with:
    distribution: temurin
    java-version: '17'
```

The workflow also verifies the active Java:

```yaml
- name: Verify Java
  run: |
    java -version
    echo "JAVA_HOME=$JAVA_HOME"
    which java
```

Expected output should include Java 17:

```text
openjdk version "17..."
JAVA_HOME=...
```

If the log still shows Java 11, check that the repository is using the updated workflow files from `.github/workflows/`.

## Why OpenJDK was removed from apt

The workflows no longer install `openjdk-17-jdk` through `apt`. That package was slow to download and did not guarantee that Gradle selected Java 17.

`actions/setup-java` is the correct mechanism because it sets `JAVA_HOME` and updates `PATH` for later steps.
