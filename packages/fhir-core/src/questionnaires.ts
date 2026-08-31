import type { Questionnaire } from "@medplum/fhirtypes";

export const ADULT_INTAKE_QUESTIONNAIRE: Questionnaire = {
  resourceType: "Questionnaire",
  id: "adult-clinical-intake",
  title: "Comprehensive Adult Health Intake",
  status: "active",
  item: [
    {
      linkId: "general",
      text: "General Health Background",
      type: "group",
      item: [
        {
          linkId: "chief_complaint",
          text: "What is the primary reason for your visit today?",
          type: "string",
          required: true,
        },
        {
          linkId: "overall_health",
          text: "In general, would you say your health is:",
          type: "choice",
          required: true,
          answerOption: [
            { valueString: "Excellent" },
            { valueString: "Very Good" },
            { valueString: "Good" },
            { valueString: "Fair" },
            { valueString: "Poor" },
          ],
        },
      ],
    },
    {
      linkId: "lifestyle",
      text: "Lifestyle & Preventive Factors",
      type: "group",
      item: [
        {
          linkId: "exercise_days",
          text: "How many days per week do you engage in moderate to vigorous physical activity?",
          type: "integer",
          required: true,
        },
        {
          linkId: "tobacco_use",
          text: "Do you currently use any tobacco or nicotine products?",
          type: "boolean",
          required: true,
        },
        {
          linkId: "alcohol_frequency",
          text: "How often do you have a drink containing alcohol?",
          type: "choice",
          answerOption: [
            { valueString: "Never" },
            { valueString: "Monthly or less" },
            { valueString: "2-4 times a month" },
            { valueString: "2-3 times a week" },
            { valueString: "4 or more times a week" },
          ],
        },
      ],
    },
  ],
};

export const AHC_HRSN_QUESTIONNAIRE: Questionnaire = {
  resourceType: "Questionnaire",
  id: "ahc-hrsn-screening",
  title: "Accountable Health Communities Health-Related Social Needs (AHC HRSN) Screening",
  status: "active",
  item: [
    {
      linkId: "housing",
      text: "Housing Stability",
      type: "group",
      item: [
        {
          linkId: "housing_worried",
          text: "In the past 12 months, were you worried that you would not have stable housing?",
          type: "boolean",
          required: true,
        },
      ],
    },
    {
      linkId: "food",
      text: "Food Security",
      type: "group",
      item: [
        {
          linkId: "food_worry",
          text: "Within the past 12 months, we worried whether our food would run out before we got money to buy more.",
          type: "choice",
          required: true,
          answerOption: [
            { valueString: "Often true" },
            { valueString: "Sometimes true" },
            { valueString: "Never true" },
          ],
        },
      ],
    },
    {
      linkId: "transportation",
      text: "Transportation Access",
      type: "group",
      item: [
        {
          linkId: "transportation_barrier",
          text: "In the past 12 months, has lack of reliable transportation kept you from medical appointments or work?",
          type: "boolean",
          required: true,
        },
      ],
    },
  ],
};
