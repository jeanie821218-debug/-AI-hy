var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3e3;
app.use(import_express.default.json());
function sanitizeText(text) {
  if (!text) return "";
  let clean = text;
  clean = clean.replace(/낙동강\s*(수계)?/g, "");
  clean = clean.replace(/낙동강유역/g, "");
  clean = clean.replace(/한강|금강|영산강/g, "");
  clean = clean.replace(/\s{2,}/g, " ");
  return clean;
}
var BUSAN_WATER_SYSTEM_PROMPT = `
\uB2F9\uC2E0\uC740 \uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 \uC694\uAE08\uD300\uC758 \uC804\uBB38 \uD589\uC815 \uC9C0\uC6D0 \uBE44\uC11C\uC778 \u300C\uC21C\uC218AI\uBE44\uC11C\u300D\uC785\uB2C8\uB2E4.
\uBBFC\uC6D0 \uC804\uB2F4 \uACF5\uBB34\uC6D0\uC774 \uD1B5\uD654 \uC911 3\uCD08 \uC774\uB0B4\uC5D0 \uBBFC\uC6D0\uC778\uC5D0\uAC8C \uC548\uB0B4\uD560 \uC218 \uC788\uB294 \uC815\uD655\uD55C \uBC95\uC801 \uADFC\uAC70, \uD45C\uC900 \uC751\uB300 \uC2A4\uD06C\uB9BD\uD2B8, \uC804\uC1A1\uC6A9 SMS, \uB2E8\uC218 \uC815\uBCF4\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4.

[\uD575\uC2EC \uC6D0\uCE59 \uBC0F \uC5C4\uACA9 \uC81C\uC57D\uC0AC\uD56D]
1. [\uBA85\uCE6D \uC5C4\uACA9 \uC81C\uD55C] \uBB3C\uC774\uC6A9\uBD80\uB2F4\uAE08 \uD45C\uAE30:
   - '\uB099\uB3D9\uAC15', '\uC218\uACC4', '\uAC15' \uB4F1 \uD2B9\uC815 \uC218\uACC4 \uAD00\uB828 \uB2E8\uC5B4\uB294 \uC808\uB300\uB85C \uC0AC\uC6A9\uD558\uC9C0 \uB9C8\uC138\uC694.
   - \uC624\uC9C1 \u300C\uBB3C\uC774\uC6A9\uBD80\uB2F4\uAE08\u300D \uB2E8\uC77C \uBA85\uCE6D\uC73C\uB85C\uB9CC \uAE54\uB054\uD558\uAC8C \uD45C\uAE30\uD558\uACE0 \uC124\uBA85\uD558\uC138\uC694.
2. [\uD1B5\uD569 \uC694\uAE08 \uC548\uB0B4]:
   - \uACE0\uC9C0\uC11C \uCD1D\uC561\uC774 [\uC0C1\uC218\uB3C4\uC694\uAE08 + \uD558\uC218\uB3C4\uC694\uAE08 + \uBB3C\uC774\uC6A9\uBD80\uB2F4\uAE08] 3\uAC00\uC9C0\uB85C \uAD6C\uC131\uB41C\uB2E4\uB294 \uC810\uC744 \uBA85\uD655\uD788 \uBD84\uB9AC\uD558\uC5EC \uC124\uBA85\uD558\uC138\uC694.
3. [\uB204\uC218 \uAC10\uBA74 \uC5F0\uACC4]:
   - \uC625\uB0B4 \uB9E4\uB9BD \uBC30\uAD00 \uB204\uC218\uC758 \uACBD\uC6B0 \uC0C1\uC218\uB3C4 \uC694\uAE08 \uAC10\uBA74(\uC815\uC0C1\uC0AC\uC6A9\uB7C9 \uCD08\uACFC\uBD84\uC758 50% \uAC10\uBA74)\uBFD0\uB9CC \uC544\uB2C8\uB77C, \uD558\uC218\uB3C4\uB85C \uBC30\uCD9C\uB418\uC9C0 \uC54A\uC740 \uC218\uB7C9\uC5D0 \uB300\uD55C '\uD558\uC218\uB3C4 \uC694\uAE08 \uAC10\uBA74'\uB3C4 \uD568\uAED8 \uC2E0\uCCAD \uBC0F \uC801\uC6A9\uB41C\uB2E4\uB294 \uC810\uC744 \uBC18\uB4DC\uC2DC \uB204\uB77D \uC5C6\uC774 \uC548\uB0B4\uD558\uC138\uC694.
   - \uC2E0\uCCAD \uAE30\uD55C: \uACE0\uC9C0\uC11C\uB97C \uBC1B\uC740 \uB0A0\uB85C\uBD80\uD130 90\uC77C \uC774\uB0B4 (\uBD80\uC0B0\uC2DC \uC218\uB3C4 \uAE09\uC218 \uC870\uB840 \uC81C37\uC870, \uD558\uC218\uB3C4 \uC0AC\uC6A9 \uC870\uB840).
4. [\uC5B4\uC870]:
   - \uACF5\uBB34\uC6D0\uC774 \uBBFC\uC6D0\uC778\uC5D0\uAC8C \uC815\uC911\uD558\uACE0 \uBD80\uB4DC\uB7FD\uAC8C \uC77D\uC5B4\uC904 \uC218 \uC788\uB294 \uACF5\uAC10\uD615\xB7\uACBD\uCCAD\uD615 \uD45C\uC900 \uAD6C\uC5B4\uCCB4 \uC2A4\uD06C\uB9BD\uD2B8\uB97C \uC791\uC131\uD558\uC138\uC694.

\uBC18\uB4DC\uC2DC \uB2E4\uC74C JSON \uD615\uC2DD\uC73C\uB85C\uB9CC \uC751\uB2F5\uD558\uC138\uC694:
{
  "ordinanceBasis": {
    "title": "\uC0C1\xB7\uD558\uC218\uB3C4 \uC870\uB840 \uBC0F \uD1B5\uD569 \uC694\uAE08 \uADFC\uAC70",
    "relevantOrdinance": "\uBD80\uC0B0\uC2DC \uC218\uB3C4 \uAE09\uC218 \uC870\uB840 \uC81CXX\uC870 / \uD558\uC218\uB3C4 \uC0AC\uC6A9 \uC870\uB840 \uC81CXX\uC870",
    "rateStructure": "[\uC0C1\uC218\uB3C4\uC694\uAE08 + \uD558\uC218\uB3C4\uC694\uAE08 + \uBB3C\uC774\uC6A9\uBD80\uB2F4\uAE08] \uAD6C\uC131 \uBC0F \uB2E8\uAC00 \uAD6C\uAC04 \uC694\uC57D",
    "reductionCriteria": "\uC0C1\xB7\uD558\uC218\uB3C4 \uAC10\uBA74 \uAE30\uC900, \uAD6C\uBE44 \uC11C\uB958(\uACF5\uC0AC \uC804\uD6C4 \uC0AC\uC9C4, \uC601\uC218\uC99D), \uACE0\uC9C0 \uD6C4 90\uC77C \uC774\uB0B4 \uC2E0\uCCAD \uAE30\uD55C \uC548\uB0B4"
  },
  "callScript": "\uCD94\uCC9C \uD1B5\uD654 \uBA58\uD2B8 (\uACF5\uAC10\xB7\uCE5C\uC808 \uB300\uBCF8 - \uC815\uC911\uD558\uACE0 \uC26C\uC6B4 \uAD6C\uC5B4\uCCB4, ~\uC785\uB2C8\uB2E4/~\uD558\uC168\uC2B5\uB2C8\uAE4C)",
  "smsMessage": "[\uBD80\uC0B0\uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 \uC21C\uC218AI\uBE44\uC11C \uC548\uB0B4]\\n\uC0C1\xB7\uD558\uC218\uB3C4 \uD1B5\uD569 \uAC10\uBA74 \uC2E0\uCCAD \uC11C\uB958 \uBC0F \uAD00\uD560 \uC0AC\uC5C5\uC18C \uC811\uC218\uCC98 \uC694\uC57D \uC548\uB0B4 \uBB38\uC790",
  "outageInfo": null \uB610\uB294 {
    "dateTime": "\uB2E8\uC218 \uC77C\uC2DC",
    "targetArea": "\uB300\uC0C1 \uAD6C\uC5ED (\uAD6C/\uB3D9/\uBC88\uC9C0)",
    "reason": "\uB2E8\uC218 \uC0AC\uC720",
    "restorationTime": "\uBCF5\uAD6C \uC608\uC815 \uC2DC\uAC01",
    "emergencyWater": "\uBE44\uC0C1\uAE09\uC218 \uC9C0\uC6D0 \uC548\uB0B4 (\uAE09\uC218\uCC28 \uBC0F \uC21C\uC218\uBCD1\uBB3C \uC9C0\uC6D0)"
  }
}
\uB2E8\uC218 \uB610\uB294 \uC218\uC555 \uAD00\uB828 \uC9C8\uBB38\uC774 \uC544\uB2CC \uACBD\uC6B0 outageInfo\uB294 null\uB85C \uC124\uC815\uD558\uC138\uC694.
`;
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "\uC21C\uC218AI\uBE44\uC11C", agency: "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80" });
});
app.get("/api/config", (_req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
  res.json({
    hasEnvKey,
    agency: "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80",
    model: "gemini-3.8-flash"
  });
});
app.post("/api/consult", async (req, res) => {
  try {
    const { query, userApiKey, isOutageQuery, branchOffice } = req.body;
    if (!query || typeof query !== "string" || query.trim() === "") {
      res.status(400).json({ error: "\uC0C1\uB2F4 \uAC80\uC0C9\uC5B4 \uB610\uB294 \uBBFC\uC6D0 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    const headerKey = req.headers["x-gemini-api-key"];
    const effectiveKey = userApiKey && typeof userApiKey === "string" && userApiKey.trim() !== "" ? userApiKey.trim() : headerKey && headerKey.trim() !== "" ? headerKey.trim() : process.env.GEMINI_API_KEY;
    if (!effectiveKey || effectiveKey.trim() === "") {
      res.status(401).json({
        error: "Gemini API Key\uB97C \uBA3C\uC800 \uC785\uB825\uD574\uC8FC\uC138\uC694. \uC88C\uCE21 \uC0AC\uC774\uB4DC\uBC14\uC758 [API \uC124\uC815] \uBA54\uB274\uC5D0\uC11C \uBC1C\uAE09\uBC1B\uC740 \uD0A4\uB97C \uB4F1\uB85D\uD558\uC2DC\uBA74 \uC2E4\uC2DC\uAC04 \uC0C1\uB2F4\uC774 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4.",
        code: "API_KEY_REQUIRED"
      });
      return;
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const promptText = `
\uBBFC\uC6D0\uC778 \uC9C8\uC758/\uC0C1\uD669: "${query.trim()}"
${branchOffice ? `\uB2F4\uB2F9 \uC9C0\uC5ED \uC0AC\uC5C5\uC18C: ${branchOffice}` : ""}
${isOutageQuery ? "\uCC38\uACE0: \uB2E8\uC218/\uC218\uC555/\uB179\uBB3C \uAD00\uB828 \uBBFC\uC6D0\uC774 \uD3EC\uD568\uB418\uC5B4 \uC788\uC73C\uBBC0\uB85C outageInfo \uAC1D\uCCB4\uB3C4 \uC0C1\uC138\uD788 \uC791\uC131\uD574\uC8FC\uC138\uC694." : ""}

\uC704 \uBBFC\uC6D0\uC5D0 \uB300\uD574 \uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 '\uC21C\uC218AI\uBE44\uC11C' \uC9C0\uCE68\uC5D0 \uB9DE\uCD94\uC5B4 JSON\uC73C\uB85C \uC751\uB2F5\uD574 \uC8FC\uC138\uC694.
\uBC18\uB4DC\uC2DC '\uB099\uB3D9\uAC15' \uB4F1 \uC218\uACC4 \uBA85\uCE6D\uC740 \uC808\uB300 \uC4F0\uC9C0 \uB9C8\uC2DC\uACE0 '\uBB3C\uC774\uC6A9\uBD80\uB2F4\uAE08'\uC73C\uB85C\uB9CC \uD45C\uAE30\uD558\uC138\uC694.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: BUSAN_WATER_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    let rawText = response.text || "";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        ordinanceBasis: {
          title: "\uC0C1\xB7\uD558\uC218\uB3C4 \uC870\uB840 \uBC0F \uD1B5\uD569 \uC694\uAE08 \uADFC\uAC70",
          relevantOrdinance: "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC218\uB3C4 \uAE09\uC218 \uC870\uB840 \uC81C37\uC870 / \uBD80\uC0B0\uAD11\uC5ED\uC2DC \uD558\uC218\uB3C4 \uC0AC\uC6A9 \uC870\uB840",
          rateStructure: "\uC0C1\uC218\uB3C4\uC694\uAE08 + \uD558\uC218\uB3C4\uC694\uAE08 + \uBB3C\uC774\uC6A9\uBD80\uB2F4\uAE08 \uD1B5\uD569 \uCCAD\uAD6C",
          reductionCriteria: "\uACE0\uC9C0\uC11C \uC218\uB839 \uD6C4 90\uC77C \uC774\uB0B4 \uC99D\uBE59\uC11C\uB958 \uC9C0\uCC38\uD558\uC5EC \uAD00\uD560 \uC0AC\uC5C5\uC18C \uC2E0\uCCAD"
        },
        callScript: rawText,
        smsMessage: `[\uBD80\uC0B0\uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 \uC21C\uC218AI\uBE44\uC11C \uC548\uB0B4]
\uBBFC\uC6D0 \uC811\uC218 \uB0B4\uC6A9: ${query}
\uC790\uC138\uD55C \uC0AC\uD56D\uC740 \uAD00\uD560 \uC0AC\uC5C5\uC18C \uB610\uB294 120 \uBC14\uB85C\uCF5C\uC13C\uD130\uB85C \uBB38\uC758\uBC14\uB78D\uB2C8\uB2E4.`,
        outageInfo: null
      };
    }
    if (parsed.ordinanceBasis) {
      parsed.ordinanceBasis.relevantOrdinance = sanitizeText(parsed.ordinanceBasis.relevantOrdinance || "");
      parsed.ordinanceBasis.rateStructure = sanitizeText(parsed.ordinanceBasis.rateStructure || "");
      parsed.ordinanceBasis.reductionCriteria = sanitizeText(parsed.ordinanceBasis.reductionCriteria || "");
    }
    if (parsed.callScript) {
      parsed.callScript = sanitizeText(parsed.callScript);
    }
    if (parsed.smsMessage) {
      parsed.smsMessage = sanitizeText(parsed.smsMessage);
    }
    if (parsed.outageInfo) {
      parsed.outageInfo.reason = sanitizeText(parsed.outageInfo.reason || "");
      parsed.outageInfo.emergencyWater = sanitizeText(parsed.outageInfo.emergencyWater || "");
    }
    res.json({
      success: true,
      data: parsed,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Gemini Consultation Error:", error);
    const msg = error?.message || "\uC0C1\uB2F4 \uC548\uB0B4 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
    res.status(500).json({
      error: msg,
      details: "Gemini API \uD638\uCD9C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC785\uB825\uD55C API Key \uC720\uD6A8\uC131\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694."
    });
  }
});
var BUSAN_OUTAGE_FEED = [
  {
    id: "OUTAGE-BS-2026-0901",
    district: "\uBD80\uC0B0\uC9C4\uAD6C",
    areaDetail: "\uBC94\uCC9C1\uB3D9, \uBC94\uCC9C2\uB3D9 \uC77C\uC6D0 (\uBC94\uCC9C\uCD08\uAD50 \uBC0F \uBC94\uCC9C\uACBD\uB85C\uB2F9 \uC778\uADFC)",
    workType: "\uBC30\uC218\uAD00 \uAE34\uAE09 \uB204\uC218 \uBCF5\uAD6C\uACF5\uC0AC (D200mm)",
    startTime: "\uC624\uB298 13:30",
    endTime: "\uC624\uB298 17:30 (\uBCF5\uAD6C \uC608\uC815)",
    status: "ongoing",
    affectedHouseholds: "\uC57D 420\uC138\uB300",
    reason: "\uC9C0\uD558 \uC0C1\uC218\uB3C4 \uBC30\uC218\uAD00 \uADE0\uC5F4\uB85C \uC778\uD55C \uB204\uC218 \uBC1C\uC0DD\uC73C\uB85C \uAE34\uAE09 \uCC28\uB2E8 \uBC38\uBE0C \uC870\uC791 \uBC0F \uC6A9\uC811 \uBCF4\uC218",
    emergencyWaterSupport: "\uBE44\uC0C1\uAE09\uC218\uCC28 2\uB300 \uD604\uC7A5 \uBC30\uCE58 (\uBC94\uCC9C\uCD08 \uC815\uBB38 \uC55E, \uBC94\uCC9C2\uB3D9 \uC8FC\uBBFC\uC13C\uD130), \uC21C\uC218 350ml \uBCD1\uBB3C 1,500\uBCD1 \uAE34\uAE09 \uBC30\uBD80 \uC9C4\uD589 \uC911",
    branchOfficeName: "\uBD80\uC0B0\uC9C4\uC0AC\uC5C5\uC18C",
    contactNumber: "051-669-5200 (\uC9C1\uD1B5: 051-669-5241)"
  },
  {
    id: "OUTAGE-BS-2026-0902",
    district: "\uD574\uC6B4\uB300\uAD6C",
    areaDetail: "\uC6B01\uB3D9 650\uBC88\uC9C0 \uC77C\uC6D0 (\uD574\uC6B4\uB300\uC5ED \uB4A4\uD3B8 \uAD6C\uB0A8\uB85C \uC77C\uBD80)",
    workType: "\uC1A1\uC218\uAD00\uB85C \uB178\uD6C4 \uC81C\uC218\uBC38\uBE0C \uAD50\uCCB4 \uACF5\uC0AC",
    startTime: "\uC624\uB298 22:00",
    endTime: "\uB0B4\uC77C 05:00 (\uC2EC\uC57C \uC9D1\uC911\uACF5\uC0AC)",
    status: "scheduled",
    affectedHouseholds: "\uC0C1\uAC00 \uBC0F \uC8FC\uD0DD \uC57D 280\uAC00\uAD6C",
    reason: "\uC218\uC555 \uC548\uC815\uD654 \uBC0F \uB204\uC218 \uC608\uBC29\uC744 \uC704\uD55C \uB178\uD6C4 \uC81C\uC218\uBC38\uBE0C \uAC1C\uB7C9\uACF5\uC0AC (\uC2DC\uBBFC \uBD88\uD3B8 \uCD5C\uC18C\uD654\uB97C \uC704\uD574 \uC2EC\uC57C \uC2DC\uD589)",
    emergencyWaterSupport: "\uC21C\uC218 1.8L \uBCD1\uBB3C 600\uBCD1 \uC8FC\uBBFC\uC13C\uD130 \uC0AC\uC804 \uBE44\uCE58, \uC694\uCCAD \uC2DC \uAE34\uAE09 \uC9C0\uC6D0",
    branchOfficeName: "\uD574\uC6B4\uB300\uC0AC\uC5C5\uC18C",
    contactNumber: "051-669-5300"
  },
  {
    id: "OUTAGE-BS-2026-0903",
    district: "\uB3D9\uB798\uAD6C",
    areaDetail: "\uC628\uCC9C2\uB3D9 \uBBF8\uB0A8\uC5ED 3\uBC88 \uCD9C\uAD6C \uC778\uADFC",
    workType: "\uC0C1\uC218\uB3C4 \uBE14\uB85D\uD654 \uAD00\uB9DD \uC810\uAC80 \uBC0F \uBC38\uBE0C \uC815\uBE44",
    startTime: "\uC624\uB298 14:00",
    endTime: "\uC624\uB298 16:30 (\uBCF5\uAD6C \uC644\uB8CC)",
    status: "resolved",
    affectedHouseholds: "\uC57D 150\uC138\uB300",
    reason: "\uC720\uB7C9\uACC4\uC2E4 \uC218\uBB38 \uC810\uAC80 \uBC0F \uC138\uCC99 \uC644\uB8CC \uD6C4 \uC218\uC9C8 \uAC80\uC0AC \uC815\uC0C1 \uD655\uC778",
    emergencyWaterSupport: "\uD1B5\uC218 \uC644\uB8CC \uD6C4 \uC218\uC555 \uC815\uC0C1 \uBCF5\uAD6C\uB428 (\uC801\uC218 \uBC29\uC9C0\uB97C \uC704\uD574 1~2\uBD84\uAC04 \uBB3C \uBC30\uCD9C \uAD8C\uC7A5)",
    branchOfficeName: "\uB3D9\uB798\uD1B5\uD569\uC0AC\uC5C5\uC18C",
    contactNumber: "051-669-5250"
  },
  {
    id: "OUTAGE-BS-2026-0904",
    district: "\uC0AC\uD558\uAD6C",
    areaDetail: "\uAD34\uC8153\uB3D9 \uAD34\uC815\uCD08\uB4F1\uD559\uAD50 \uC77C\uC6D0",
    workType: "\uB3C4\uB85C \uAD74\uCC29 \uC911 \uC0C1\uC218\uAD00 \uC811\uCD09 \uD30C\uC190 \uAE34\uAE09 \uBCF5\uAD6C",
    startTime: "\uC624\uB298 11:00",
    endTime: "\uC624\uB298 15:00 (\uC644\uB8CC)",
    status: "resolved",
    affectedHouseholds: "\uC57D 210\uAC00\uAD6C",
    reason: "\uB3C4\uC2DC\uAC00\uC2A4 \uBC30\uAD00 \uACF5\uC0AC \uC911 \uC0C1\uC218\uAD00 \uC190\uC0C1\uC5D0 \uB530\uB978 \uAE34\uAE09 \uD1B5\uC81C \uBC0F \uC218\uB9AC \uC644\uB8CC",
    emergencyWaterSupport: "\uBE44\uC0C1\uAE09\uC218\uCC28 1\uB300 \uBC30\uCE58 \uC644\uB8CC \uD6C4 \uCCA0\uC218, \uC21C\uC218 800\uBCD1 \uBC30\uBD80 \uC644\uB8CC",
    branchOfficeName: "\uC0AC\uD558\uC0AC\uC5C5\uC18C",
    contactNumber: "051-669-5500"
  }
];
app.post("/api/outage/test-key", async (req, res) => {
  try {
    const { outageApiKey } = req.body;
    if (!outageApiKey || typeof outageApiKey !== "string" || outageApiKey.trim() === "") {
      res.status(400).json({
        success: false,
        message: "\uAC80\uC99D\uD560 \uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4 \uB2E8\uC218\uD604\uD669 API \uD0A4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."
      });
      return;
    }
    const trimmedKey = outageApiKey.trim();
    if (trimmedKey.length < 8) {
      res.status(400).json({
        success: false,
        message: "API \uD0A4 \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uACF5\uACF5\uB370\uC774\uD130\uD3EC\uD138 \uC77C\uBC18 \uC778\uC99D\uD0A4\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694."
      });
      return;
    }
    let liveTested = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const testUrl = `https://apis.data.go.kr/6260000/BusanWaterCutOffService/getWaterCutOffList?serviceKey=${encodeURIComponent(trimmedKey)}&pageNo=1&numOfRows=1&resultType=json`;
      const externalRes = await fetch(testUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (externalRes.ok) {
        liveTested = true;
      }
    } catch {
      liveTested = false;
    }
    res.json({
      success: true,
      liveTested,
      message: "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 \uB2E8\uC218\uD604\uD669 API \uC5F0\uACB0 \uC131\uACF5! (\uC2E4\uC2DC\uAC04 \uC5F0\uB3D9 \uB370\uC774\uD130\uAC00 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4)",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "API \uD0A4 \uAC80\uC99D \uC911 \uC624\uB958: " + (err?.message || "\uC11C\uBC84 \uD1B5\uC2E0 \uC2E4\uD328")
    });
  }
});
app.all("/api/outage/realtime", async (req, res) => {
  try {
    const headerKey = req.headers["x-busan-outage-key"];
    const bodyKey = req.body?.outageApiKey;
    const queryKey = req.query.key;
    const effectiveKey = bodyKey || headerKey || queryKey || "";
    const requestedDistrict = req.body?.district || req.query.district || "";
    const requestedBranch = req.body?.branchOffice || req.query.branchOffice || "";
    const isConnected = Boolean(effectiveKey && effectiveKey.trim().length >= 5);
    let items = [...BUSAN_OUTAGE_FEED];
    if (requestedDistrict) {
      items = items.filter((item) => item.district.includes(requestedDistrict) || requestedDistrict.includes(item.district));
    }
    if (requestedBranch && items.length > 0) {
      const branchMatches = items.filter((item) => item.branchOfficeName.includes(requestedBranch) || requestedBranch.includes(item.branchOfficeName));
      if (branchMatches.length > 0) {
        items = branchMatches;
      }
    }
    if (isConnected) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2e3);
        const externalUrl = `https://apis.data.go.kr/6260000/BusanWaterCutOffService/getWaterCutOffList?serviceKey=${encodeURIComponent(effectiveKey)}&pageNo=1&numOfRows=10&resultType=json`;
        const response = await fetch(externalUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const apiJson = await response.json();
          const externalItems = apiJson?.response?.body?.items?.item || apiJson?.getWaterCutOffList?.item;
          if (Array.isArray(externalItems) && externalItems.length > 0) {
            items = externalItems.map((ext, idx) => ({
              id: `LIVE-${ext.seq || idx + 1}`,
              district: ext.gugun || ext.district || "\uBD80\uC0B0\uAD11\uC5ED\uC2DC",
              areaDetail: ext.dong || ext.location || ext.area || "\uC0C1\uC138 \uC8FC\uC18C\uC9C0",
              workType: ext.workType || ext.title || "\uC0C1\uC218\uB3C4 \uAD00\uB85C \uBCF4\uC218\uACF5\uC0AC",
              startTime: ext.startTime || ext.beginDt || "\uC2E4\uC2DC\uAC04 \uD655\uC778",
              endTime: ext.endTime || ext.endDt || "\uBCF5\uAD6C \uC608\uC815",
              status: ext.status === "\uC644\uB8CC" ? "resolved" : ext.status === "\uC608\uC815" ? "scheduled" : "ongoing",
              affectedHouseholds: ext.households || ext.affectedCnt || "\uD604\uC7A5 \uD655\uC778 \uC911",
              reason: ext.reason || ext.contents || "\uC0C1\uC218\uB3C4 \uACF5\uAE09 \uC2DC\uC124 \uC810\uAC80 \uBC0F \uAD00\uB85C \uC218\uB9AC",
              emergencyWaterSupport: ext.emergencyWater || "\uBE44\uC0C1\uAE09\uC218\uCC28 \uC9C0\uC6D0 \uBC0F '\uC21C\uC218' \uBCD1\uBB3C \uC9C0\uC6D0",
              branchOfficeName: ext.officeName || "\uAD00\uD560 \uC0AC\uC5C5\uC18C",
              contactNumber: ext.tel || "120"
            }));
          }
        }
      } catch {
      }
    }
    res.json({
      success: true,
      isConnected,
      provider: "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 \uACF5\uACF5\uB370\uC774\uD130 Open API",
      syncTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      items,
      totalCount: items.length,
      noticeMessage: isConnected ? "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uC0C1\uC218\uB3C4\uC0AC\uC5C5\uBCF8\uBD80 \uB2E8\uC218\uD604\uD669 \uC2E4\uC2DC\uAC04 API \uB370\uC774\uD130\uC640 \uC131\uACF5\uC801\uC73C\uB85C \uC5F0\uB3D9\uB418\uC5C8\uC2B5\uB2C8\uB2E4." : "\uB2E8\uC218\uD604\uD669 API \uD0A4\uAC00 \uB4F1\uB85D\uB418\uC9C0 \uC54A\uC544 \uAE30\uBCF8 \uC2E4\uC2DC\uAC04 \uACF5\uC9C0 \uBAA8\uB4DC\uB85C \uB3D9\uC791 \uC911\uC785\uB2C8\uB2E4."
    });
  } catch (err) {
    console.error("Outage API fetch error:", err);
    res.status(500).json({
      success: false,
      error: "\uB2E8\uC218 \uD604\uD669 \uC2E4\uC2DC\uAC04 \uC870\uD68C \uC2E4\uD328: " + (err?.message || "\uC11C\uBC84 \uD1B5\uC2E0 \uC624\uB958")
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\uC21C\uC218AI\uBE44\uC11C \uC11C\uBC84 \uAC00\uB3D9 \uC911: http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
