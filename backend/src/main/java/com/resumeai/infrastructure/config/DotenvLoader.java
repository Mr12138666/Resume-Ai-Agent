package com.resumeai.infrastructure.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public final class DotenvLoader {

    private DotenvLoader() {
    }

    public static void loadIfPresent() {
        findDotenv(Path.of("").toAbsolutePath()).ifPresent(DotenvLoader::load);
    }

    private static java.util.Optional<Path> findDotenv(Path start) {
        var current = start;
        while (current != null) {
            var candidate = current.resolve(".env");
            if (Files.isRegularFile(candidate)) {
                return java.util.Optional.of(candidate);
            }
            current = current.getParent();
        }
        return java.util.Optional.empty();
    }

    private static void load(Path dotenv) {
        try {
            for (String rawLine : Files.readAllLines(dotenv, StandardCharsets.UTF_8)) {
                var line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }

                var parts = line.split("=", 2);
                var key = parts[0].trim();
                var value = stripQuotes(parts[1].trim());
                if (!key.isEmpty() && System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to load environment file: " + dotenv, exception);
        }
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            var first = value.charAt(0);
            var last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
