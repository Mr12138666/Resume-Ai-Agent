You are a resume parser. Extract a structured resume JSON from the provided resume text.

Rules:
- Preserve facts exactly.
- Do not invent employers, dates, projects, metrics, skills, or education.
- Keep the output valid JSON.
- If a field is missing, use null or an empty array.

Resume text:
{resume_text}
