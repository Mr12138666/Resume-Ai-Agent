package com.resumeai.infrastructure.document;

import java.io.InputStream;

public interface DocumentTextExtractor {

    String extract(InputStream inputStream, String filename, String contentType);
}
