package com.resumeai.infrastructure.storage;

import com.resumeai.infrastructure.config.ResumeAiProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean
    MinioClient minioClient(ResumeAiProperties properties) {
        return MinioClient.builder()
                .endpoint(properties.storage().endpoint())
                .credentials(properties.storage().accessKey(), properties.storage().secretKey())
                .build();
    }

    @Bean
    MinioBucketInitializer minioBucketInitializer(MinioClient minioClient, ResumeAiProperties properties) {
        return new MinioBucketInitializer(minioClient, properties.storage().bucket());
    }

    public record MinioBucketInitializer(MinioClient minioClient, String bucket) {

        public MinioBucketInitializer {
            try {
                var exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
                if (!exists) {
                    minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                }
            } catch (Exception exception) {
                throw new IllegalStateException("Failed to initialize MinIO bucket: " + bucket, exception);
            }
        }
    }
}
