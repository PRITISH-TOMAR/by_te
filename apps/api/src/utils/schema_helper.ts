import { z } from "zod";

const dateSchema = z.coerce.date().refine((val) => !isNaN(val.getTime()), {
  message: "Invalid date",
});

const urlSchema = z
  .string()
  .min(1, "originalUrl is required")
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        return ["http:", "https:"].includes(url.protocol);
      } catch {
        return false;
      }
    },
    {
      message: "Only valid HTTP/HTTPS URLs are allowed",
    },
  );

const SchemaHelper = { dateSchema, urlSchema };
export default SchemaHelper;
