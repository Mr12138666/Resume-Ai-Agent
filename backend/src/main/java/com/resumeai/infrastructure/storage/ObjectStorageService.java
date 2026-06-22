package com.resumeai.infrastructure.storage;

import java.io.InputStream;
import java.time.Duration;

public interface ObjectStorageService {

    String put(String objectKey, InputStream inputStream, long size, String contentType);

    String presignedGetUrl(String objectKey, Duration expiry);
}
