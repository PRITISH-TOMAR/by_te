import { z } from "zod";

const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const dateSchema = z.coerce.date().refine((val) => !isNaN(val.getTime()), {
  message: "Invalid date",
});

const urlSchema = z
  .string()
  .min(1, "originalUrl is required")
  .transform((val) => val.trim())
  .transform((val) => (val.startsWith("http") ? val : `https://${val}`))
  .refine(
    (val) => {
      try {
        const url = new URL(val);

        // protocol check
        if (!["http:", "https:"].includes(url.protocol)) return false;

        const hostname = url.hostname;

        // regex check for domain (rejects "demo")
        if (!DOMAIN_REGEX.test(hostname)) return false;

        // block local/internal
        if (
          hostname === "localhost" ||
          hostname.startsWith("127.") ||
          hostname.startsWith("10.") ||
          hostname.startsWith("192.168.")
        ) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Enter a valid public URL (e.g., https://example.com)",
    },
  );

const SchemaHelper = { dateSchema, urlSchema };
export default SchemaHelper;
