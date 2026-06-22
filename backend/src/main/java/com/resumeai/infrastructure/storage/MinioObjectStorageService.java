package com.resumeai.infrastructure.storage;

import com.resumeai.infrastructure.config.ResumeAiProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import java.io.InputStream;
import java.time.Duration;
import org.springframework.stereotype.Service;

@Service
public class MinioObjectStorageService implements ObjectStorageService {

    private final MinioClient minioClient;
    private final ResumeAiProperties properties;

    public MinioObjectStorageService(MinioClient minioClient, ResumeAiProperties properties) {
        this.minioClient = minioClient;
        this.properties = properties;
    }

    @Override
    public String put(String objectKey, InputStream inputStream, long size, String contentType) {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(properties.storage().bucket())
                    .object(objectKey)
                    .stream(inputStream, size, -1)
                    .contentType(contentType)
                    .build());
            return objectKey;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to store object: " + objectKey, exception);
        }
    }

    @Override
    public void delete(String objectKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(properties.storage().bucket())
                    .object(objectKey)
                    .build());
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to delete object: " + objectKey, exception);
        }
    }

    @Override
    public String presignedGetUrl(String objectKey, Duration expiry) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(properties.storage().bucket())
                    .object(objectKey)
                    .method(Method.GET)
                    .expiry(Math.toIntExact(expiry.toSeconds()))
                    .build());
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to create download URL for object: " + objectKey, exception);
        }
    }
}
