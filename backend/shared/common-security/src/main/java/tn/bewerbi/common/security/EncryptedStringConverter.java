package tn.bewerbi.common.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter that transparently encrypts String values with
 * AES-256-GCM on write and decrypts on read. Apply on a field with
 * {@code @Convert(converter = EncryptedStringConverter.class)}.
 *
 * <p>The converter is intentionally NOT marked {@code autoApply=true} —
 * encrypting every String column would explode storage and break
 * indexed lookups everywhere. Encryption is opt-in per column.
 *
 * <p>Storage impact: ciphertext is base64(12-byte IV + plaintext +
 * 16-byte tag) + 7-byte prefix → roughly {@code plaintext * 1.36 + 45}
 * bytes. Plan column widths accordingly (see V4 migrations on
 * identity-service and immigration-service).
 */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return FieldEncryption.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return FieldEncryption.decrypt(dbData);
    }
}
