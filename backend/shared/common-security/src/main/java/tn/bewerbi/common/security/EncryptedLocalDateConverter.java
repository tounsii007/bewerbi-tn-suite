package tn.bewerbi.common.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Encrypts LocalDate values by serializing them to ISO-8601 first
 * ({@code yyyy-MM-dd}), then running the same AES-GCM pass as
 * {@link EncryptedStringConverter}. The DB column must be a text-ish
 * type (VARCHAR / TEXT), not DATE, since GCM ciphertext is a base64
 * blob.
 *
 * <p>Range/ordering queries on the column stop working at the SQL
 * level after encryption — that's the trade-off. For visa appointment
 * dates this is acceptable: the app reads the date back into Java and
 * compares it there, and the only "list upcoming" query already pulls
 * the row by user, so ordering can happen in-memory.
 */
@Converter
public class EncryptedLocalDateConverter implements AttributeConverter<LocalDate, String> {

    @Override
    public String convertToDatabaseColumn(LocalDate attribute) {
        if (attribute == null) return null;
        return FieldEncryption.encrypt(attribute.toString());
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String decoded = FieldEncryption.decrypt(dbData);
        try {
            return LocalDate.parse(decoded);
        } catch (DateTimeParseException e) {
            // Either a corrupt/tampered row or somebody wrote a non-
            // ISO date via raw SQL. Surface the failure rather than
            // silently returning null.
            throw new IllegalStateException(
                    "Decrypted value is not an ISO-8601 LocalDate", e);
        }
    }
}
