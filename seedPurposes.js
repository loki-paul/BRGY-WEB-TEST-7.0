// seedPurposes.js
// RUN THIS ONCE ONLY

(function () {
  if (typeof firebase === "undefined") {
    console.error("❌ Firebase not loaded");
    return;
  }

  const db = firebase.firestore();

  const data = {
    barangay_clearance: [
      "Employment (local or abroad)",
      "Pre-employment requirement",
      "Business permit / renewal",
      "Police clearance requirement",
      "NBI clearance requirement",
      "Loan application (bank, lending, cooperative)",
      "Government transaction",
      "Legal requirement",
      "Court requirement",
      "Identification purposes",
      "Travel requirement",
      "Passport application support",
      "Immigration requirement",
      "School requirement",
      "Scholarship requirement",
      "Internship / OJT requirement",
      "Training or seminar requirement",
      "Housing or relocation requirement",
      "Insurance application",
      "Contract signing",
      "Notarization support",
      "Proof of good moral character",
      "Barangay records update",
      "General legal or official purposes"
    ],

    barangay_residency: [
      "Proof of residence",
      "School enrollment",
      "Scholarship requirement",
      "Employment verification",
      "Internship / OJT requirement",
      "Voter registration / transfer",
      "COMELEC requirement",
      "Government transaction",
      "PhilHealth / SSS / GSIS / Pag-IBIG requirement",
      "Bank or loan requirement",
      "Utility application (water, electricity, internet)",
      "Housing or rental requirement",
      "Relocation or transfer requirement",
      "Travel requirement",
      "Immigration support",
      "ID application",
      "Passport support",
      "Insurance application",
      "Court or legal requirement",
      "Social services requirement",
      "Census or barangay profiling",
      "Senior citizen / PWD registration",
      "Solo parent registration"
    ],

    barangay_indigency: [
      "Medical assistance",
      "Hospital admission",
      "Medicine assistance",
      "Laboratory or diagnostic assistance",
      "Surgery assistance",
      "PhilHealth requirement",
      "DSWD assistance",
      "LGU financial assistance",
      "Medical guarantee letter",
      "Educational assistance",
      "Scholarship application",
      "Tuition fee assistance",
      "School supplies assistance",
      "Burial or funeral assistance",
      "Death-related assistance",
      "Food assistance",
      "Emergency assistance",
      "Calamity or disaster assistance",
      "Housing assistance",
      "Legal aid",
      "Court fee assistance",
      "Bail assistance",
      "Livelihood assistance",
      "Transportation assistance",
      "Senior citizen assistance",
      "PWD assistance",
      "Solo parent assistance",
      "Women and children assistance",
      "Victim assistance",
      "Financial hardship certification"
    ],

    business: [
      "Business registration",
      "Permit renewal",
      "License application",
      "Tax payment",
      "Government compliance",
      "Banking requirements",
      "Loan application",
      "Partnership agreement",
      "Contract signing",
      "Legal documentation"
    ]
  };

  // DEFAULT = ALL COMBINED (NO DOC SELECTED)
  data.default = [
    ...new Set([
      ...data.barangay_clearance,
      ...data.barangay_residency,
      ...data.barangay_indigency,
      ...data.business
    ])
  ];

  db.collection("document_purposes")
    .doc("all")
    .set(data)
    .then(() => {
      console.log("✅ ALL purposes stored successfully");
    })
    .catch(err => {
      console.error("❌ Failed to store purposes:", err);
    });
})();
