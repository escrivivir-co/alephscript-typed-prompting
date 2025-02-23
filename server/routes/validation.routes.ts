import { Router } from "express";
import { storage } from "../storage";
import { validationReportSchema } from "@shared/schema";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const router = Router();
const ajv = new Ajv();
addFormats(ajv);
/* ajv.addFormat("date-time", (dateString) => {
	return !isNaN(Date.parse(dateString));
}); */
router.post("/:id", async (req, res) => {
    let report;
    try {
        const schema = await storage.getSchema(parseInt(req.params.id));
        if (!schema) {
            return res.status(404).json({ message: "Schema not found" });
        }

        const jsonSchema = JSON.parse(schema.jsonSchema);
        const validate = ajv.compile(jsonSchema);
        const valid = validate(req.body);

        report = {
            valid: valid,
            errors: !valid
                ? validate.errors?.map((err) => ({
                      path: err.instancePath,
                      message: err.message || "Unknown error",
                  }))
                : [],
        };
    } catch (err) {
        report = {
            valid: false,
            errors: [
                {
                    path: "/schema",
                    message: "Can not compile the schema!",
                },
            ],
        };
    }
    res.json(validationReportSchema.parse(report));
});

export default router;
