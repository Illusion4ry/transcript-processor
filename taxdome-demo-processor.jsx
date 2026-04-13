import { useState, useRef, useCallback, useEffect } from "react";

/* ── Icons ──────────────────────────────────────────────────────────────────── */
const Ic=({d,size=16,style})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>{(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}</svg>;
const IUp=p=><Ic {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>;
const ICp=p=><Ic {...p} d={["M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2","M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8V4z"]}/>;
const IMl=p=><Ic {...p} d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"]}/>;
const IFl=p=><Ic {...p} d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]}/>;
const IDl=p=><Ic {...p} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]}/>;
const IRf=p=><Ic {...p} d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>;
const ICk=p=><Ic {...p} d="M20 6L9 17l-5-5"/>;
const ISp=p=><Ic {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>;

/* ── Sandbox-safe clipboard ──────────────────────────────────────────────────── */
function copyText(text){
  if(navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text).then(()=>true).catch(()=>execCopy(text));
  return Promise.resolve(execCopy(text));
}
function execCopy(text){
  const el=document.createElement("textarea");
  el.value=text;el.style.cssText="position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el);el.focus();el.select();
  let ok=false;try{ok=document.execCommand("copy");}catch{}
  document.body.removeChild(el);return ok;
}

/* ── Data ───────────────────────────────────────────────────────────────────── */
const PLANS={
  essentials:{name:"Essentials",tagline:"Exclusively for solo practitioners — 1 seat",soloOnly:true,prices:{1:800,2:750,3:700},
    features:["Unlimited CRM and client management","Client portal and mobile app","Workflow automation and task templates","Proposals and payment processing","Unlimited document storage and e-signatures","QuickBooks Online integration","Email and chat support (avg. 24h response)"]},
  pro:{name:"Pro",tagline:"Built for growing firms of any size",soloOnly:false,prices:{1:1000,2:950,3:900},
    features:["Everything in Essentials","Unlimited team members (per seat)","Recurring jobs and scheduling","IRS integration for transcript downloads","Custom firm URL and branded emails","Real-time team chat (60-day history)","30-day activity feed","Standard support (avg. 8h response)"]},
  business:{name:"Business",tagline:"Premium tools and support for larger firms",soloOnly:false,prices:{1:1200,2:1150,3:1100},
    features:["Everything in Pro","AI-powered reporting and analytics","Unlimited team chat history","365-day activity feed","Dedicated Customer Success Manager (5+ seats)","Bi-annual business reviews (5+ seats)","Enterprise QuickBooks integration (1.5 GB uploads)","Priority support (avg. 1h response)"]},
};
const ONBOARDING={
  none:{name:"No Onboarding Package",price:0,sessions:"—",workflows:"—",manager:"—",duration:"—",ideal:"Self-starters using TaxDome Academy",features:[]},
  group:{name:"Group Onboarding",price:0,sessions:"Live 1-hr sessions Mon–Thu @ 1 PM ET",workflows:"—",manager:"Customer Onboarding Manager (group-led)",duration:"Ongoing",ideal:"Self-starters who want to learn live",features:["Live group sessions Mon–Thu at 1 PM ET","Session recordings available","Led by Customer Onboarding Manager","TaxDome Academy access"]},
  guided:{name:"Guided Onboarding",price:999,sessions:"1-hr kickoff + 5 x 1-hr consultations",workflows:"1 custom workflow",manager:"Dedicated Onboarding Manager (90 days)",duration:"Up to 90 days",ideal:"Growing firms who want hands-on guidance",features:["1-hour kickoff meeting","5 one-hour consultation sessions","1 custom workflow setup","CRM and contact import assistance","Dedicated Onboarding Manager (90 days)","Advanced training (time entries, invoice imports)"]},
  enhanced:{name:"Enhanced Onboarding",price:1999,sessions:"1-hr kickoff + up to 8 x 1-hr sessions",workflows:"Up to 2 workflows",manager:"Senior Onboarding Manager (120 days)",duration:"Up to 120 days",ideal:"Firms wanting a fully tailored, strategic setup",features:["1-hour kickoff meeting","Up to 8 one-hour sessions","Up to 2 custom workflows","CRM and contact import assistance","Senior Onboarding Manager (120 days)","Advanced training included","Complex needs accommodated"]},
  premium:{name:"Premium Onboarding",price:3499,sessions:"1-hr kickoff + 5x implementation + 2x follow-up",workflows:"Done-for-you: 2 automated pipelines + full workflow",manager:"Senior Onboarding Manager + Private Slack (60-90 days)",duration:"60-90 days (go live in 3 weeks)",ideal:"Firms wanting the fastest, most hands-on onboarding",features:["Kickoff + 5 implementation + 2 follow-up sessions","Done-for-you: up to 2 automated pipelines","Full workflow setup (invoicing, docs, automations)","Private Slack channel with Senior Manager","CRM and contact import assistance","Target go-live within 3 weeks"],note:"Requires 5+ team members. Canadian pricing: $4,800 CAD."},
};

/* ── Fields with extraction hints ───────────────────────────────────────────── */
const FIELDS=[
  {key:"closeDate",            label:"Close Date",                   hint:"Any date the prospect mentioned as a target to sign, start, or decide — e.g. 'we want to be live by Q3' or 'let's move forward next month'."},
  {key:"amount",               label:"Amount ($)",                   hint:"Any dollar figure discussed as the deal value, subscription cost, or budget the prospect mentioned — numbers only, no symbols."},
  {key:"confirmedTeamMembers", label:"Confirmed Team Members",       hint:"Number of full-time staff who would need a TaxDome login — look for 'we have X people on the team', 'X accountants', or 'X users'."},
  {key:"individualClients",    label:"# of Individual Clients",      hint:"Count of individual (personal) tax clients — mentions of 'individual returns', 'personal clients', '1040s', or 'personal tax prep'."},
  {key:"businessClients",      label:"# of Business/Entity Clients", hint:"Count of business or entity clients — 'business returns', 'small businesses', 'S-corps', 'LLCs', 'partnerships', 'corporate returns'."},
  {key:"yearlyRevenue",        label:"Yearly Company Revenue",       hint:"The firm's annual gross revenue or billing — 'we bill X per year', 'revenue of X', or any annual income figure the prospect shares."},
  {key:"estimatedYearlyReturns",label:"Estimated Yearly Returns",    hint:"Total tax returns or filings prepared per year — 'we do X returns a year', 'X filings', or 'X tax season clients'."},
  {key:"industry",             label:"Industry",                     hint:"Primary professional category of the firm — Tax Preparation, Bookkeeping, CPA Firm, Accounting, Payroll, Financial Advisory, etc."},
  {key:"servedNiche",          label:"Served Niche",                 hint:"Specific client type or market focus — 'real estate investors', 'restaurants', 'medical practices', 'e-commerce', 'small businesses'."},
  {key:"currentTools",         label:"Current Tools & Use",          hint:"Software and tools they use today for practice management, workflow, or communication — e.g. 'we use Drake, ShareFile, and Canopy'."},
  {key:"objections",           label:"Objections",                   hint:"Any hesitation or pushback mentioned — price concerns, migration fears, timing issues, contract length, team adoption worries, etc."},
  {key:"decisionMaker",        label:"Decision Maker",               hint:"The person with final authority to approve the purchase — name, title, or description like 'my partner' or 'I make that call'."},
  {key:"buyingTimeline",       label:"Buying Timeline",              hint:"When they expect to make a decision — 'end of the month', 'after tax season', 'Q2', 'we're evaluating for 30 days', etc."},
  {key:"nextSteps",            label:"Next Steps",                   hint:"Specific actions agreed upon at the end of the demo — sending a proposal, scheduling a follow-up, a trial, a technical review, etc."},
  {key:"whatResonated",        label:"What Resonated",               hint:"Features or benefits the prospect reacted positively to — automation, client portal, e-signatures, workflow, pricing, support, etc."},
  {key:"painPoints",           label:"Pain Points",                  hint:"Problems or frustrations with their current situation — manual work, disorganized files, slow processes, client communication issues."},
  {key:"notes",                label:"Notes",                        hint:"A brief overall summary — firm profile, tone of the meeting, specific details that don't fit other fields, and general impressions."},
  {key:"likelihoodToClose",    label:"Likelihood to Close",          hint:"Based on the prospect's engagement, urgency, and buying signals throughout the conversation — rated X out of 10."},
  {key:"howHeard",             label:"How They Heard About TaxDome", hint:"How the prospect first discovered TaxDome — Google search, referral, LinkedIn, conference, TaxDome Academy, webinar, etc."},
  {key:"needFollowUp",         label:"Need Follow-up Call",          hint:"Whether a follow-up call was scheduled or needed — 'Yes - MM/DD/YYYY' if a date was mentioned, 'No' if not required."},
];

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function parseVTT(c){
  const segs=[];let cur={speaker:"",text:""};
  for(const line of c.split("\n")){
    if(line.includes("-->")||/^\d+$/.test(line.trim())||line.trim()===""||line.trim()==="WEBVTT")continue;
    const m=line.match(/^([^:]+):\s*(.*)/);
    if(m){if(cur.text)segs.push({...cur});cur={speaker:m[1].trim(),text:m[2].trim()};}
    else cur.text+=" "+line.trim();
  }
  if(cur.text)segs.push(cur);return segs;
}
const todayStr=()=>new Date().toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
const validUntilStr=()=>{const d=new Date();d.setDate(d.getDate()+7);return d.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});};
const f$=n=>"$"+Math.round(n).toLocaleString();
const savPct=(pk,y)=>{if(y===1)return null;const p=PLANS[pk];return Math.round((p.prices[1]-p.prices[y])/p.prices[1]*100)+"% off";};
const defaultData=()=>({closeDate:"",amount:"",confirmedTeamMembers:"",individualClients:"",businessClients:"",yearlyRevenue:"",estimatedYearlyReturns:"",industry:"",servedNiche:"",currentTools:"",objections:"",decisionMaker:"",buyingTimeline:"",nextSteps:"",whatResonated:"",painPoints:"",notes:"",likelihoodToClose:"",howHeard:"",needFollowUp:""});

/* ── API call wrapper ────────────────────────────────────────────────────────── */
async function callClaude(prompt,maxTokens=1500){
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]})
  });
  const d=await r.json();
  return d.content?.find(b=>b.type==="text")?.text||"";
}

/* ── Transcript extraction — handles unlimited length via chunking ───────────── */
// Strategy:
//  • If transcript ≤ 90,000 chars (~22k tokens input) → send in one shot, model reads everything
//  • If transcript > 90,000 chars → split into ~80k-char chunks, summarise each chunk into
//    a compact "sales intelligence summary", then do a final extraction pass over all summaries.
//  This ensures a 3-hour transcript is handled just as accurately as a 30-minute one.

const CHUNK_SIZE = 80000; // ~20k tokens — well within Claude's context window per chunk

async function extractDemoData(transcript,onProgress){
  const chars=transcript.length;
  if(chars<=CHUNK_SIZE){
    // Single pass — full transcript
    onProgress&&onProgress("Extracting insights from full transcript...");
    return runExtraction(transcript);
  }
  // Multi-chunk: summarise each chunk first
  const chunks=[];
  for(let i=0;i<chars;i+=CHUNK_SIZE) chunks.push(transcript.slice(i,i+CHUNK_SIZE));
  const summaries=[];
  for(let i=0;i<chunks.length;i++){
    onProgress&&onProgress(`Processing chunk ${i+1} of ${chunks.length}...`);
    const sum=await callClaude(
      `You are a sales analyst. Read this segment (${i+1}/${chunks.length}) of a TaxDome sales demo transcript and extract a compact intelligence summary covering: team size, client counts, revenue figures, tools mentioned, pain points, buying signals, objections, decisions, and any specific numbers or commitments made. Be thorough and precise — include exact figures when mentioned. Keep your response under 600 words.\n\nTRANSCRIPT SEGMENT:\n${chunks[i]}`,
      800
    );
    summaries.push(`--- Segment ${i+1} ---\n${sum}`);
  }
  onProgress&&onProgress("Synthesising all segments into final notes...");
  return runExtraction(summaries.join("\n\n"),true);
}

async function runExtraction(text,isSummary=false){
  const sourceLabel=isSummary?"SUMMARISED TRANSCRIPT SEGMENTS":"FULL TRANSCRIPT";
  const prompt=`You are an expert SaaS sales analyst. Carefully read this TaxDome demo ${isSummary?"intelligence summary":"transcript"} and extract the following data points with precision.

${sourceLabel}:
${text}

EXTRACTION RULES (follow these carefully):
- closeDate: Any date mentioned for signing, starting, or deciding. Format MM/DD/YYYY. Convert phrases like "end of Q3" to a realistic date.
- amount: Dollar value of the deal, numbers only (e.g. 3000). Leave empty if not discussed.
- confirmedTeamMembers: Full-time staff needing TaxDome logins only — not seasonal or temporary.
- individualClients: Count of individual/personal tax clients (1040s, personal returns). Numbers only.
- businessClients: Count of business/entity clients (S-corps, LLCs, partnerships, corporate returns). Numbers only.
- yearlyRevenue: The firm's annual gross revenue or billing. Numbers only (e.g. 500000).
- estimatedYearlyReturns: Total tax returns prepared per year. Numbers only.
- industry: Primary professional category (Tax Preparation, Bookkeeping, CPA Firm, Accounting, Payroll, etc.).
- servedNiche: Specific client type or market focus (e.g. "Real estate investors", "Small businesses").
- currentTools: All software and tools in use today, as a concise single line.
- objections: All concerns or hesitations raised, as a concise single line.
- decisionMaker: Name and/or title of the purchase decision maker.
- buyingTimeline: When they plan to decide, as a concise phrase.
- nextSteps: Specific agreed-upon next actions from the demo, as a concise line.
- whatResonated: Features or benefits they reacted positively to, as a concise line.
- painPoints: Problems or frustrations with their current situation, as a concise line.
- notes: A 2-3 sentence summary covering the firm profile, tone, and important context.
- likelihoodToClose: Your assessment based on engagement and signals, format X/10.
- howHeard: How they discovered TaxDome, as a concise phrase.
- needFollowUp: "Yes - MM/DD/YYYY" if a follow-up was agreed upon, or "No".

Return ONLY valid JSON, no markdown, no explanation:
{"closeDate":"","amount":"","confirmedTeamMembers":"","individualClients":"","businessClients":"","yearlyRevenue":"","estimatedYearlyReturns":"","industry":"","servedNiche":"","currentTools":"","objections":"","decisionMaker":"","buyingTimeline":"","nextSteps":"","whatResonated":"","painPoints":"","notes":"","likelihoodToClose":"","howHeard":"","needFollowUp":""}`;

  try{
    const text2=await callClaude(prompt,1500);
    return JSON.parse(text2.replace(/```json|```/g,"").trim());
  }catch{return defaultData();}
}

/* ── Email generation ────────────────────────────────────────────────────────── */
async function generateEmail(data,length){
  const today=todayStr();
  const instr={
    short:"Write a SHORT friendly personal follow-up (3 to 4 sentences). Warm and direct.",
    medium:"Write a MEDIUM personal follow-up (2 to 3 paragraphs). Sound like a real person, not a template.",
    long:"Write a detailed personal follow-up (4 to 5 paragraphs) covering discussion points, their situation, and clear next steps."
  };
  const prompt=`You are Edgar Espinoza, Senior Account Executive at TaxDome. ${instr[length]}
Industry: ${data.industry||"accounting/tax"}
Pain points: ${data.painPoints||"workflow inefficiencies"}
What resonated: ${data.whatResonated||"automation features"}
Next steps: ${data.nextSteps||"schedule follow-up"}
Decision maker: ${data.decisionMaker||"the prospect"}
Objections: ${data.objections||"none noted"}
Timeline: ${data.buyingTimeline||"undetermined"}
Rules: No em dashes, no bullets, warm conversational tone, use contractions, reference specific context.
Always include a natural invitation to schedule a follow-up meeting using this exact link (present it as a plain URL, not markdown): https://calendly.com/d/csvs-b9g-s2x/30-min-taxdome-follow-up-with-edgar?month=2026-04
Subject must be: TaxDome Meeting Follow-up ${today}
End with:
Best regards,

Edgar Espinoza
Senior Account Executive, TaxDome
Format: first line "Subject: TaxDome Meeting Follow-up ${today}", blank line, body, sign-off.`;
  try{return await callClaude(prompt,1000);}
  catch{return "Unable to generate email.";}
}

/* ── HTML proposal builder — produces a self-contained file the user prints to PDF ──
 * Approach: build a complete HTML string → Blob → object URL → <a download> click.
 * This reliably works in any browser or sandboxed iframe — no Workers, no canvas needed.
 * The downloaded .html auto-triggers the print dialog; user selects "Save as PDF".
 */
const esc=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function buildProposalHTML({P,plan,ob,years,seats,ppy,tpy,grand,iMo,iAmt,disc,payPara,comp,color}){
  const dot=`<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#1565d8;margin-right:6px;margin-top:4px;flex-shrink:0;vertical-align:top"></span>`;
  const fg=items=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-top:8px">${items.map(f=>`<div style="display:flex;align-items:flex-start;font-size:12px;color:#4a5568;line-height:1.5;margin-bottom:3px">${dot}${esc(f)}</div>`).join("")}</div>`;
  // Each section is wrapped in a div that: (a) tries to avoid internal breaks,
  // (b) adds generous bottom padding so the next section's header always starts
  // with breathing room — browsers use this padding as a "safe zone" before breaking.
  const sec=(show,html,compact=false)=>show
    ?`<div class="section${compact?" compact":""}">${html}</div>`:"";
  const h2=t=>`<h2 style="font-size:16px;font-weight:800;color:${color};margin-bottom:14px;padding-left:12px;border-left:3px solid ${color};letter-spacing:-0.2px;break-after:avoid;page-break-after:avoid">${t}</h2>`;
  const ml=t=>`<div class="meta-label">${t}</div>`;
  const safeRow=html=>`<tr style="page-break-inside:avoid;break-inside:avoid">${html}</tr>`;

  // Count active sections to decide page-break strategy
  const activeSections=[comp.valueProp,comp.pricing,comp.onboarding,comp.paymentTerms,comp.terms,comp.notes&&P.customNotes].filter(Boolean).length;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(P.firmName||"TaxDome")} Proposal</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a1d23;font-size:13px;line-height:1.6}
h2{font-size:16px;font-weight:800;margin-bottom:14px;break-after:avoid;page-break-after:avoid}
.meta-label{opacity:.55;font-size:9px;letter-spacing:.7px;text-transform:uppercase;margin-bottom:3px}

/* ── Section layout ──────────────────────────────────────────────────────────
   Each section sits in the natural flow. We use padding (not margin) so that
   when a page break lands inside the padding it looks intentional — like a
   proper top/bottom gutter — not like a content cutoff.
   
   The key rule: headings never appear alone at the bottom of a page.
   Short sections (payment terms, next steps) stay together completely.
   Long sections (pricing, onboarding) can break, but only at safe points.
   ──────────────────────────────────────────────────────────────────────────── */
.section{
  padding:26px 0 30px;
  border-bottom:1px solid #f0f2f5;
  /* Allow break inside long sections */
  break-inside:auto;
  page-break-inside:auto;
  /* Prevent a lone heading from stranding at page bottom */
  orphans:3;
  widows:3;
}
.section:last-of-type{border-bottom:none;padding-bottom:0}

/* Compact = guaranteed to fit on one page — never split */
.section.compact{
  break-inside:avoid;
  page-break-inside:avoid;
}
/* After the cover header, always start content on a new page if there are
   4+ sections, so the header fills its page and content pages are full */
.content-body{
  padding:${activeSections>=4?"32px 42px":"28px 42px"};
}

/* Tables: keep header row glued to first data row; rows don't split */
table{border-collapse:collapse;width:100%}
thead{display:table-header-group;break-inside:avoid;page-break-inside:avoid}
tr{break-inside:avoid;page-break-inside:avoid}
td,th{vertical-align:top}

/* Prevent widows/orphans in paragraphs */
p{orphans:4;widows:4;margin:0}

/* Inline keep-together blocks (feature lists, cards, small tables) */
.nb{break-inside:avoid;page-break-inside:avoid}

/* Heading always pulls its following sibling with it */
h2+*,.section-intro+*{break-before:avoid;page-break-before:avoid}

@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12.5px}
  @page{margin:0.42in 0.45in;size:A4}
  .header-block{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  /* When header fills a page, push content to next page */
  ${comp.header&&activeSections>=3?".content-body{page-break-before:always;break-before:page}":""}
  /* Long sections can naturally break between subsections */
  .section{break-before:auto;page-break-before:auto}
  /* Very short sections should stay together */
  .section.compact{break-inside:avoid !important;page-break-inside:avoid !important}
  /* Keep the Calendly / schedule row with the next-steps grid */
  .calendly-row{break-before:avoid;page-break-before:avoid}
}
</style></head><body>
${comp.header?`
<div class="header-block nb" style="background:${color};color:#fff;">
  <!-- Brand bar -->
  <div style="background:${color}cc;padding:10px 42px;display:flex;align-items:center;gap:10px;">
    <div style="width:28px;height:28px;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:${color};flex-shrink:0;letter-spacing:-0.5px;">TD</div>
    <span style="font-size:13px;font-weight:700;color:#fff;letter-spacing:0.3px;">TaxDome</span>
    <span style="font-size:11px;color:rgba(255,255,255,.65);margin-left:4px;">The all-in-one platform for tax &amp; accounting professionals</span>
  </div>
  <!-- Main header -->
  <div style="padding:48px 42px 44px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;opacity:.55;margin-bottom:10px;text-transform:uppercase;">Prepared Exclusively For</div>
    <div style="font-size:32px;font-weight:800;margin-bottom:8px;letter-spacing:-0.5px;">${esc(P.firmName||"Your Firm")}</div>
    <div style="width:48px;height:3px;background:rgba(255,255,255,.5);border-radius:2px;margin-bottom:28px;"></div>
    <div style="display:flex;gap:0;flex-wrap:wrap;margin-top:4px;">
      <div style="padding:10px 24px 10px 0;margin-right:24px;border-right:1px solid rgba(255,255,255,.2);">${ml("Prepared By")}<div style="font-weight:700;font-size:13px">${esc(P.preparedBy)}</div></div>
      <div style="padding:10px 24px 10px 0;margin-right:24px;border-right:1px solid rgba(255,255,255,.2);">${ml("Date")}<div style="font-weight:700;font-size:13px">${esc(P.createdDate)}</div></div>
      <div style="padding:10px 0;">${ml("Valid Until")}<div style="font-weight:700;font-size:13px">${esc(P.validUntil)}</div></div>
    </div>
  </div>
</div>`:""}
<div class="content-body">
${sec(comp.valueProp,`${h2("Why TaxDome?")}<p style="font-size:13px;color:#4a5568;line-height:1.8;margin-bottom:14px">${esc(P.whyTaxdome)}</p>${P.challenges?`<div class="nb" style="padding:14px;background:#f8f9fb;border-radius:8px;border-left:3px solid ${color};margin-bottom:10px"><div style="font-size:10px;font-weight:700;color:#64708a;margin-bottom:6px;text-transform:uppercase">Addressing Your Challenges</div><p style="font-size:13px;color:#4a5568;line-height:1.6">${esc(P.challenges)}</p></div>`:""}${P.whatResonated?`<div class="nb" style="padding:14px;background:${color}14;border-radius:8px"><div style="font-size:10px;font-weight:700;color:${color};margin-bottom:6px;text-transform:uppercase">What Resonated During Your Demo</div><p style="font-size:13px;color:#4a5568;line-height:1.6">${esc(P.whatResonated)}</p></div>`:""}`,false)}
${sec(comp.pricing,`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">${h2("Pricing &amp; Licensing")}<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${color}20;color:${color}">${esc(plan.name)}${years>1?` <span style="padding:2px 7px;border-radius:5px;font-size:10px;background:#edf7ed;color:#2e7d32">${years}-Year</span>`:""}</span></div><p style="font-size:12px;color:#8b92a0;margin-bottom:14px">${esc(plan.tagline)}. All subscriptions are billed annually and paid upfront.</p><table class="nb" style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8f9fb"><th style="text-align:left;padding:9px 13px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Description</th><th style="text-align:left;padding:9px 13px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Qty</th><th style="text-align:left;padding:9px 13px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Per Seat / Year</th><th style="text-align:left;padding:9px 13px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Total</th></tr></thead><tbody>${safeRow(`<td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;font-weight:600;background:#f0f5ff">TaxDome ${esc(plan.name)}</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;background:#f0f5ff">${seats} seat${seats>1?"s":""}</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;background:#f0f5ff">${f$(ppy)}/seat/yr</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;color:${color};font-weight:700;background:#f0f5ff">${f$(tpy)}/yr</td>`)}${years>1?safeRow(`<td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;color:#64708a;font-size:11px">${years}-Year Term Discount</td><td colspan="2" style="padding:11px 13px;border-bottom:1px solid #f0f2f5;color:#2e7d32;font-size:11px">${disc} vs. 1-year rate</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;color:#64708a;font-size:11px">x ${years} years</td>`):""}${ob.price>0?safeRow(`<td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;font-weight:600;background:#fff8f0">Onboarding: ${esc(ob.name)}</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;background:#fff8f0">1</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;background:#fff8f0">One-time, paid at signup</td><td style="padding:11px 13px;border-bottom:1px solid #f0f2f5;font-weight:700;background:#fff8f0">${f$(ob.price)}</td>`):""}${safeRow(`<td colspan="2" style="padding:12px 13px;font-weight:700;font-size:13px;background:#f8f9fb">Total Investment (${years}-Year Term${ob.price>0?", incl. onboarding":""})</td><td style="padding:12px 13px;background:#f8f9fb"></td><td style="padding:12px 13px;font-weight:700;font-size:15px;color:${color};background:#f8f9fb">${f$(grand)}</td>`)}</tbody></table><div class="nb" style="padding:10px 13px;background:#fafbfc;border:1px solid #f0f2f5;border-top:none"><div style="font-size:10px;font-weight:700;color:#64708a;margin-bottom:6px;text-transform:uppercase">Plan Includes</div>${fg(plan.features)}</div><p style="font-size:11px;color:#b0b8c9;margin-top:10px">Valid until ${esc(P.validUntil)}. Pricing billed annually, subject to final agreement.</p>`,false)}
${sec(comp.onboarding,`${h2("Onboarding Package")}<p style="font-size:12px;color:#8b92a0;margin-bottom:14px">TaxDome's onboarding ensures your team is up and running fast.</p>${P.onboardingKey==="none"?`<div class="nb" style="border:1px solid #e8eaed;border-radius:9px;overflow:hidden"><div style="padding:14px 16px;background:${color}10;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:14px;font-weight:700">Group Onboarding</div><div style="font-size:12px;color:#64708a;margin-top:3px">Included with every TaxDome plan — no extra cost</div></div><div style="font-size:14px;font-weight:700;color:#2e7d32">Free</div></div><div style="padding:12px 16px;background:#fafbfc"><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;margin-bottom:8px"><div style="display:flex;align-items:flex-start;font-size:12px;color:#4a5568;gap:5px;margin-bottom:2px"><span style="width:4px;height:4px;min-width:4px;border-radius:50%;background:#2e7d32;display:inline-block;margin-top:5px;flex-shrink:0"></span>Live group sessions Mon–Thu at 1 PM ET</div><div style="display:flex;align-items:flex-start;font-size:12px;color:#4a5568;gap:5px;margin-bottom:2px"><span style="width:4px;height:4px;min-width:4px;border-radius:50%;background:#2e7d32;display:inline-block;margin-top:5px;flex-shrink:0"></span>Session recordings available</div><div style="display:flex;align-items:flex-start;font-size:12px;color:#4a5568;gap:5px;margin-bottom:2px"><span style="width:4px;height:4px;min-width:4px;border-radius:50%;background:#2e7d32;display:inline-block;margin-top:5px;flex-shrink:0"></span>Led by Customer Onboarding Manager</div><div style="display:flex;align-items:flex-start;font-size:12px;color:#4a5568;gap:5px;margin-bottom:2px"><span style="width:4px;height:4px;min-width:4px;border-radius:50%;background:#2e7d32;display:inline-block;margin-top:5px;flex-shrink:0"></span>Full access to TaxDome Academy</div></div><p style="font-size:12px;color:#64708a">Prefer dedicated one-on-one support? Guided, Enhanced, and Premium packages are available — ask your TaxDome rep for details.</p></div></div>`:`<div class="nb" style="border:1px solid #e8eaed;border-radius:9px;overflow:hidden"><div style="padding:14px 16px;background:${color}10;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:14px;font-weight:700">${esc(ob.name)}</div><div style="font-size:12px;color:#64708a;margin-top:3px">${esc(ob.ideal)}</div></div><div style="font-size:20px;font-weight:700;color:${ob.price>0?color:"#2e7d32"}">${ob.price>0?f$(ob.price):"Free"}</div></div><div style="padding:14px 16px;background:#fafbfc"><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:12px;margin-bottom:10px"><div><span style="font-weight:700;color:#64708a">Sessions: </span>${esc(ob.sessions)}</div><div><span style="font-weight:700;color:#64708a">Duration: </span>${esc(ob.duration)}</div><div><span style="font-weight:700;color:#64708a">Workflows: </span>${esc(ob.workflows)}</div><div><span style="font-weight:700;color:#64708a">Manager: </span>${esc(ob.manager)}</div></div><div style="font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase;margin-bottom:5px">What's Included</div>${fg(ob.features)}${ob.note?`<p style="font-size:11px;color:#b0b8c9;margin-top:8px">${esc(ob.note)}</p>`:""}</div></div>`}<div class="nb" style="margin-top:10px;padding:9px 13px;background:#f8f9fb;border-radius:8px;font-size:12px;color:#64708a">Onboarding is paid upfront at signup alongside your subscription.</div>`,true)}
${sec(comp.paymentTerms,`${h2("Payment Terms")}<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap"><div style="padding:9px 14px;background:${color}14;border-radius:7px;font-size:13px"><span style="font-weight:700;color:${color}">Structure: </span>${P.paymentType==="upfront"?"Full Payment Upfront":`${iMo}-Month Installment Plan`}</div><div style="padding:9px 14px;background:#f8f9fb;border-radius:7px;font-size:13px"><span style="font-weight:700;color:#64708a">Total: </span><span style="font-weight:700">${f$(grand)}</span></div></div><div class="nb" style="padding:14px;background:#f8f9fb;border-radius:9px;font-size:13px;color:#4a5568;line-height:1.7">${esc(payPara)}</div>${P.paymentType==="installments"?`<div class="nb" style="margin-top:14px"><div style="font-size:11px;font-weight:700;color:#64708a;text-transform:uppercase;margin-bottom:8px">Installment Schedule</div><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8f9fb"><th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Payment</th><th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Due</th><th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:#64708a;text-transform:uppercase">Amount</th></tr></thead><tbody>${Array.from({length:iMo},(_,i)=>safeRow(`<td style="padding:10px 12px;border-bottom:1px solid #f0f2f5;font-weight:${i===0?700:400};background:${i===0?"#f0f5ff":"#fff"}">Payment ${i+1}${i===0?" (upon signing)":""}</td><td style="padding:10px 12px;border-bottom:1px solid #f0f2f5;color:#64708a;background:${i===0?"#f0f5ff":"#fff"}">${i===0?"Upon signing":`Month ${i+1}`}</td><td style="padding:10px 12px;border-bottom:1px solid #f0f2f5;font-weight:700;color:${i===0?color:"#1a1d23"};background:${i===0?"#f0f5ff":"#fff"}">${f$(iAmt)}</td>`)).join("")}${safeRow(`<td colspan="2" style="padding:10px 12px;font-weight:700;background:#f8f9fb">Total</td><td style="padding:10px 12px;font-weight:700;color:${color};background:#f8f9fb">${f$(grand)}</td>`)}</tbody></table></div>`:""}`)}
${sec(comp.terms,`${h2("Next Steps")}<div class="nb" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[["step1","1"],["step2","2"],["step3","3"],["step4","4"]].map(([k,n])=>`<div style="padding:13px;background:#f8f9fb;border-radius:8px;display:flex;gap:10px;align-items:flex-start"><div style="width:24px;height:24px;min-width:24px;border-radius:6px;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;line-height:24px;text-align:center">${n}</div><span style="font-size:13px;color:#1a1d23;line-height:1.5">${esc(P[k])}</span></div>`).join("")}</div>${P.agreedNextSteps?`<div class="nb" style="margin-top:10px;padding:12px;background:${color}12;border-radius:8px;font-size:13px"><span style="font-weight:700;color:${color}">Agreed next steps: </span><span style="color:#4a5568">${esc(P.agreedNextSteps)}</span></div>`:""}<div class="nb calendly-row" style="margin-top:10px;padding:10px 13px;background:${color}0e;border-radius:8px;font-size:12px;display:flex;align-items:center;gap:8px"><span style="font-size:13px">📅</span> <span style="color:#4a5568">Ready to talk?</span> <a href="https://calendly.com/d/csvs-b9g-s2x/30-min-taxdome-follow-up-with-edgar?month=2026-04" style="color:${color};font-weight:700;text-decoration:none">Schedule a 30-min follow-up with Edgar →</a></div>`,true)}${comp.notes&&P.customNotes?sec(true,`${h2("Additional Notes")}<div style="padding:14px;border:1px dashed #d0d5de;border-radius:8px;font-size:13px;color:#4a5568;line-height:1.7;white-space:pre-wrap">${esc(P.customNotes)}</div>`,true):""}
<div class="nb" style="margin-top:28px;padding-top:20px;border-top:2px solid ${color};display:flex;justify-content:space-between;align-items:center">
  <div style="display:flex;align-items:center;gap:8px;">
    <div style="width:22px;height:22px;background:${color};border-radius:5px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:10px;color:#fff;letter-spacing:-0.5px;">TD</div>
    <span style="font-size:11px;color:${color};font-weight:700;">TaxDome</span>
    <span style="font-size:11px;color:#8b92a0;margin-left:4px;">— Prepared by <strong>${esc(P.preparedBy)}</strong></span>
  </div>
  <div style="font-size:11px;color:#8b92a0">Valid until <span style="font-weight:700;color:${color}">${esc(P.validUntil)}</span></div>
</div>
</div>
<script>
window.addEventListener("load",function(){setTimeout(function(){window.print();},500);});
<\/script>
</body></html>`;
}

/* ── Style tokens ────────────────────────────────────────────────────────────── */
const B="#004392",BF="#e6eef8",BP="#eef3fb",GR="#f0f2f5",BRD="#e8eaed",BRD2="#f0f2f5",TX="#1a1d23",MT="#64708a",FT="#8b92a0",HT="#b0b8c9";
const cs={background:"#fff",borderRadius:13,border:`1px solid ${BRD}`,overflow:"hidden"};
const lS=(mt=12)=>({fontSize:11,fontWeight:600,color:MT,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:5,marginTop:mt});
const iS={width:"100%",padding:"7px 10px",border:`1px solid ${BRD}`,borderRadius:7,fontSize:13,color:TX,outline:"none",background:"#fff"};
const peS={background:"transparent",border:"none",outline:"none",fontFamily:"inherit",color:"inherit",resize:"none",lineHeight:"inherit",fontSize:"inherit",fontWeight:"inherit",width:"100%"};
const thS={textAlign:"left",padding:"9px 13px",fontSize:11,fontWeight:600,color:MT,textTransform:"uppercase",letterSpacing:.4};
const tdS=(e={})=>({padding:"11px 13px",borderBottom:`1px solid ${BRD2}`,...e});

/* ── Sub-components ──────────────────────────────────────────────────────────── */
const Sw=({checked,onChange})=>(
  <div onClick={()=>onChange(!checked)} style={{position:"relative",width:34,height:18,cursor:"pointer",flexShrink:0}}>
    <div style={{position:"absolute",inset:0,background:checked?B:"#dde0e7",borderRadius:20,transition:".2s"}}/>
    <div style={{position:"absolute",height:12,width:12,left:checked?19:3,bottom:3,background:"#fff",borderRadius:"50%",transition:".2s"}}/>
  </div>
);
const PE=({value,onChange,multiline,style,placeholder,rows})=>
  multiline?<textarea style={{...peS,...style}} value={value} onChange={e=>onChange(e.target.value)} rows={rows||3} placeholder={placeholder||""}/>
           :<input    style={{...peS,...style}} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""}/>;

function Tooltip({text}){
  const[show,setShow]=useState(false);
  const[above,setAbove]=useState(false);
  const ref=useRef(null);
  const toggle=useCallback((e)=>{
    e.stopPropagation();
    if(!show&&ref.current){
      const rect=ref.current.getBoundingClientRect();
      // If less than 160px above, show below instead
      setAbove(rect.top>200);
    }
    setShow(s=>!s);
  },[show]);
  return(
    <span ref={ref} style={{position:"relative",display:"inline-flex",alignItems:"center",marginLeft:5,cursor:"pointer",flexShrink:0}}
      onMouseEnter={e=>{
        e.stopPropagation();
        if(ref.current){const r=ref.current.getBoundingClientRect();setAbove(r.top>200);}
        setShow(true);
      }}
      onMouseLeave={e=>{e.stopPropagation();setShow(false);}}
      onClick={toggle}>
      <span style={{width:15,height:15,borderRadius:"50%",background:"#dde0e7",color:"#64708a",fontSize:9,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",lineHeight:1,userSelect:"none",flexShrink:0}}>?</span>
      {show&&(
        <div style={{
          position:"absolute",
          ...(above
            ?{bottom:"calc(100% + 7px)"}
            :{top:"calc(100% + 7px)"}),
          left:"50%",transform:"translateX(-50%)",
          background:"#1a1d23",color:"#e8eaed",
          fontSize:11,lineHeight:1.55,
          padding:"9px 12px",borderRadius:8,
          width:230,zIndex:1000,
          pointerEvents:"none",
          boxShadow:"0 6px 20px rgba(0,0,0,.22)",
          whiteSpace:"normal",fontWeight:400,
          textTransform:"none",letterSpacing:0,
        }}>
          {text}
          <span style={{
            position:"absolute",
            ...(above?{top:"100%",borderTop:"5px solid #1a1d23",borderBottom:"none"}:{bottom:"100%",borderBottom:"5px solid #1a1d23",borderTop:"none"}),
            left:"50%",transform:"translateX(-50%)",
            width:0,height:0,
            borderLeft:"5px solid transparent",
            borderRight:"5px solid transparent",
          }}/>
        </div>
      )}
    </span>
  );
}

function Toast({msg}){
  return msg?(
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1a1d23",color:"#fff",padding:"10px 20px",borderRadius:9,fontSize:13,fontWeight:500,zIndex:9998,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 20px rgba(0,0,0,.22)",pointerEvents:"none",whiteSpace:"nowrap"}}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      {msg}
    </div>
  ):null;
}

/* ── Main App ────────────────────────────────────────────────────────────────── */
export default function App(){
  const[tab,setTab]=useState("upload");
  const[dark,setDark]=useState(false);
  const[drag,setDrag]=useState(false);
  const[proc,setProc]=useState(false);
  const[procMsg,setProcMsg]=useState("");
  const[demo,setDemo]=useState(defaultData());
  const[transcript,setTranscript]=useState("");
  const[fileName,setFileName]=useState("");
  const[transcriptStats,setTranscriptStats]=useState(null); // {chars,chunks}
  const[toast,setToast]=useState("");
  const[eLen,setELen]=useState("medium");
  const[eTxt,setETxt]=useState("");
  const[eLoad,setELoad]=useState(false);
  const[eCopied,setECopied]=useState(false);
  const[color,setColor]=useState(B);
  const[pdfStep,setPdfStep]=useState(null); // null | "building" | "done" | "error"
  const[comp,setComp]=useState({header:true,valueProp:true,pricing:true,onboarding:true,paymentTerms:true,terms:true,notes:false});

  const[P,setP]=useState({
    firmName:"",niche:"",preparedBy:"Edgar Espinoza",closeDate:"",
    validUntil:validUntilStr(),createdDate:todayStr(),
    planKey:"pro",seats:"3",years:1,onboardingKey:"none",
    paymentType:"upfront",installmentMonths:"3",
    whyTaxdome:"TaxDome is the all-in-one platform built for tax and accounting professionals. It brings your client portal, workflow automation, e-signatures, invoicing, and team collaboration into one place so your team can spend more time on clients and less time on paperwork.",
    challenges:"",whatResonated:"",
    step1:"Review this proposal with your team",
    step2:"Fill out our simple sign-up form to get started",
    step3:"Activate your TaxDome account",
    step4:"Begin onboarding and go live",
    agreedNextSteps:"",customNotes:"",
  });
  const sp=(k,v)=>setP(p=>({...p,[k]:v}));
  const fRef=useRef();
  const toastTimer=useRef(null);

  /* ── Theme tokens — recomputed when dark mode changes ── */
  const D=dark;
  const dGR=D?"#0f1117":GR;
  const dTX=D?"#e8eaed":TX;
  const dMT=D?"#94a3b8":MT;
  const dFT=D?"#64748b":FT;
  const dHT=D?"#475569":HT;
  const dBRD=D?"#1e2533":BRD;
  const dBRD2=D?"#1a2030":BRD2;
  const dCS={background:D?"#161b27":"#fff",borderRadius:13,border:`1px solid ${dBRD}`,overflow:"hidden"};
  const dLS=(mt=12)=>({fontSize:11,fontWeight:600,color:dMT,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:5,marginTop:mt});
  const dIS={width:"100%",padding:"7px 10px",border:`1px solid ${dBRD}`,borderRadius:7,fontSize:13,color:dTX,outline:"none",background:D?"#0d1117":"#fff"};
  const dBP=D?"#0e1929":BP;



  /* ── Auto-populate proposal from demo data ── */
  useEffect(()=>{
    if(!demo.industry&&!demo.servedNiche)return;
    setP(p=>({...p,
      firmName:       p.firmName       ||demo.industry          ||"",
      niche:          p.niche          ||demo.servedNiche        ||"",
      closeDate:      p.closeDate      ||demo.closeDate          ||"",
      seats:          (p.seats==="3"&&demo.confirmedTeamMembers)?demo.confirmedTeamMembers:p.seats,
      challenges:     p.challenges     ||demo.painPoints         ||"",
      whatResonated:  p.whatResonated  ||demo.whatResonated      ||"",
      agreedNextSteps:p.agreedNextSteps||demo.nextSteps          ||"",
    }));
  },[demo]);

  const plan=PLANS[P.planKey],ob=ONBOARDING[P.onboardingKey];
  const years=parseInt(P.years)||1,seats=plan.soloOnly?1:(parseInt(P.seats)||1);
  const ppy=plan.prices[years],tpy=ppy*seats,grand=tpy*years+ob.price;
  const iMo=parseInt(P.installmentMonths)||1,iAmt=grand/iMo,disc=savPct(P.planKey,years);
  const payPara=P.paymentType==="upfront"
    ?`The full investment of ${f$(grand)} is due upon signing. Payment is processed securely through TaxDome's billing portal and your license(s) will be activated immediately upon receipt.`
    :`The total investment of ${f$(grand)} will be divided into ${iMo} equal payments of ${f$(iAmt)}. The first payment is due upon signing, with the remaining ${iMo-1} payment${iMo-1>1?"s":""} processed on the same calendar day each subsequent month. All licenses are activated upon receipt of the first payment.`;

  /* ── File handling ── */
  const handleFile=useCallback(async(file)=>{
    if(!file?.name.endsWith(".vtt"))return alert("Please upload a .vtt file.");
    setFileName(file.name);setProc(true);
    const raw=await file.text();
    const segs=parseVTT(raw);
    const txt=segs.map(s=>`${s.speaker}: ${s.text}`).join("\n");
    setTranscript(txt);
    const chars=txt.length;
    const chunks=Math.ceil(chars/CHUNK_SIZE);
    setTranscriptStats({chars,chunks});
    setProcMsg(chunks>1?`Long transcript detected (${chars.toLocaleString()} chars) — processing in ${chunks} chunks...`:"Extracting insights from transcript...");
    const result=await extractDemoData(txt,(msg)=>setProcMsg(msg));
    setDemo(result);setProc(false);setProcMsg("");setTab("notes");
  },[]);
  const onDrop=useCallback(e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);},[handleFile]);

  /* ── Copy ── */
  const[copiedKey,setCopiedKey]=useState(null);
  const copiedTimer=useRef(null);
  const showToast=useCallback((label)=>{
    setToast(`${label} copied`);
    if(toastTimer.current)clearTimeout(toastTimer.current);
    toastTimer.current=setTimeout(()=>setToast(""),2200);
  },[]);
  const copyCell=useCallback((key,val,label)=>{
    if(!val)return;
    // Try Clipboard API first, fall back to execCommand
    const doExec=()=>{
      const ta=document.createElement("textarea");
      ta.value=val;
      ta.style.cssText="position:fixed;top:0;left:0;width:2px;height:2px;padding:0;border:none;outline:none;box-shadow:none;background:transparent;";
      document.body.appendChild(ta);
      ta.focus();ta.select();
      try{document.execCommand("copy");}catch{}
      document.body.removeChild(ta);
    };
    const markCopied=()=>{
      setCopiedKey(key);
      showToast(label);
      if(copiedTimer.current)clearTimeout(copiedTimer.current);
      copiedTimer.current=setTimeout(()=>setCopiedKey(null),1800);
    };
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(val).then(markCopied).catch(()=>{doExec();markCopied();});
    }else{
      doExec();markCopied();
    }
  },[showToast]);

  /* ── Email ── */
  const genEmail=useCallback(async()=>{setELoad(true);setETxt(await generateEmail(demo,eLen));setELoad(false);},[demo,eLen]);
  const copyEmail=()=>copyText(eTxt).then(()=>{setECopied(true);setTimeout(()=>setECopied(false),1500);});
  const gmail=()=>{const ls=eTxt.split("\n"),sl=ls.find(l=>l.startsWith("Subject:"))||"";window.open(`mailto:?subject=${encodeURIComponent(sl.replace("Subject:","").trim())}&body=${encodeURIComponent(eTxt.replace(sl,"").trim())}`);};

  /* ── Print to PDF ─────────────────────────────────────────────────────────────
   * Build the HTML string, encode it as a data: URL, open it in a new tab.
   * The tab loads as a real document so window.load fires and window.print()
   * triggers the native print dialog automatically. No downloads, no blobs,
   * no iframe — just a data URL in a new tab. Always works.
   * ─────────────────────────────────────────────────────────────────────────── */
  const exportPDF=useCallback(()=>{
    if(pdfStep==="building")return;
    setPdfStep("building");
    setTimeout(()=>{
      try{
        const html=buildProposalHTML({P,plan,ob,years,seats,ppy,tpy,grand,iMo,iAmt,disc,payPara,comp,color});
        // Encode as data URL — the new tab loads it as a real document, so
        // the window.load listener inside the HTML fires and calls window.print()
        const dataUrl="data:text/html;charset=utf-8,"+encodeURIComponent(html);
        const newTab=window.open(dataUrl,"_blank");
        if(!newTab){
          // Popup blocked — fall back to blob download
          const blob=new Blob([html],{type:"text/html;charset=utf-8"});
          const url=URL.createObjectURL(blob);
          const a=document.createElement("a");
          a.href=url;
          a.download=`${(P.firmName||"TaxDome_Proposal").replace(/\s+/g,"_")}_Proposal.html`;
          document.body.appendChild(a);a.click();
          setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},500);
          setPdfStep("downloaded");
          setTimeout(()=>setPdfStep(null),5000);
          return;
        }
        setPdfStep(null);
      }catch(err){
        console.error("Export error:",err);
        setPdfStep("error");
        setTimeout(()=>setPdfStep(null),5000);
      }
    },60);
  },[P,plan,ob,years,seats,ppy,tpy,grand,iMo,iAmt,disc,payPara,comp,color,pdfStep]);

  /* ── Notes columns ── */
  const leftF=FIELDS.filter((_,i)=>i%2===0),rightF=FIELDS.filter((_,i)=>i%2!==0);
  const noteCol=(fields,isRight)=>(
    <div style={{flex:1,borderRight:isRight?"none":`2px solid ${BRD}`}}>
      {fields.map(f=>{
        const val=demo[f.key]||"";
        const isCopied=copiedKey===f.key;
        return(
          <div key={f.key}>
            {/* Label row */}
            <div style={{padding:"9px 15px",fontSize:11,fontWeight:600,color:MT,textTransform:"uppercase",letterSpacing:.4,background:"#f8f9fb",borderBottom:"1px solid #eef0f3",display:"flex",alignItems:"center"}}>
              {f.label}<Tooltip text={f.hint}/>
            </div>
            {/* Value row — entire cell is the click target */}
            <div
              onClick={()=>copyCell(f.key,val,f.label)}
              style={{
                padding:"10px 14px",
                borderBottom:"1px solid #eef0f3",
                cursor:val?"pointer":"default",
                background:isCopied?"#edf7ed":undefined,
                transition:"background .18s",
                minHeight:38,
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between",
                gap:10,
                userSelect:"none",
              }}
              onMouseEnter={e=>{if(val&&!isCopied)e.currentTarget.style.background=BP;}}
              onMouseLeave={e=>{if(!isCopied)e.currentTarget.style.background="";}}
            >
              {val
                ?<span style={{fontSize:13,color:TX,lineHeight:1.5,flex:1,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{val}</span>
                :<span style={{fontSize:13,color:"#c0c6d0",fontStyle:"italic"}}>Not captured</span>
              }
              {val&&(
                <span style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:3,fontSize:10,color:isCopied?"#2e7d32":"#b0b8c9",fontWeight:isCopied?600:400,transition:"color .18s"}}>
                  {isCopied
                    ?<><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Copied</>
                    :<><ICp size={10}/>Copy</>
                  }
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  const psec=(last=false)=>({marginBottom:last?0:24,paddingBottom:last?0:24,borderBottom:last?"none":`1px solid ${BRD2}`});

  /* ── PDF overlay ── */
  const PdfOverlay=()=>pdfStep?(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"40px 48px",textAlign:"center",maxWidth:380,boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
        {pdfStep==="building"&&(
          <>
            <div style={{width:60,height:60,background:BF,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 22px"}}>
              <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.9s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:TX,marginBottom:8}}>Opening proposal...</div>
            <div style={{fontSize:13,color:FT,lineHeight:1.6}}>A new tab will open with your proposal and the print dialog will appear automatically.</div>
          </>
        )}
        {pdfStep==="downloaded"&&(
          <>
            <div style={{width:60,height:60,background:"#edf7ed",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 22px"}}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:TX,marginBottom:8}}>HTML file downloaded</div>
            <div style={{fontSize:13,color:FT,lineHeight:1.65,marginBottom:16}}>Your browser blocked the new tab. The proposal was saved as an HTML file instead. Open it, then press <strong>Ctrl+P</strong> and choose <strong>Save as PDF</strong>.</div>
            <button onClick={()=>setPdfStep(null)} style={{padding:"9px 22px",borderRadius:8,background:B,color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Got it</button>
          </>
        )}
        {pdfStep==="error"&&(
          <>
            <div style={{width:60,height:60,background:"#fef2f2",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 22px"}}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:TX,marginBottom:8}}>Something went wrong</div>
            <div style={{fontSize:13,color:FT,lineHeight:1.65,marginBottom:20}}>Could not generate the proposal. Please try again.</div>
            <button onClick={()=>setPdfStep(null)} style={{padding:"9px 22px",borderRadius:8,background:B,color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Close</button>
          </>
        )}
      </div>
    </div>
  ):null;

  /* ── Render ── */
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:dGR,minHeight:"100vh",color:dTX,transition:"background .2s,color .2s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:${D?"#2d3748":"#c8cdd7"};border-radius:3px}
        input,select,textarea,button{font-family:inherit}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{width:13px;height:13px;border:2px solid ${D?"#2d3748":"#e0e3ea"};border-top-color:${B};border-radius:50%;animation:spin .6s linear infinite;display:inline-block}
        ${D?`select option{background:#161b27;color:#e8eaed}`:""}
      `}</style>
      <Toast msg={toast}/>
      <PdfOverlay/>

      <div style={{maxWidth:1440,margin:"0 auto",padding:22}}>

        {/* Header */}
        <div style={{...dCS,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 22px",marginBottom:22,overflow:"visible"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Dark mode toggle */}
            <button onClick={()=>setDark(d=>!d)} title={dark?"Switch to light mode":"Switch to dark mode"}
              style={{width:34,height:34,borderRadius:8,border:`1px solid ${dBRD}`,background:D?"#1e2533":"#f0f2f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
              {D
                ?<svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                :<svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#64708a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <div style={{width:34,height:34,background:B,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13}}>TD</div>
            <div><div style={{fontSize:16,fontWeight:600,letterSpacing:-.3,color:dTX}}>TaxDome</div><div style={{fontSize:11,color:dFT}}>Demo Intelligence Suite</div></div>
          </div>
          <nav style={{display:"flex",gap:3}}>
            {[["upload","Upload"],["notes","Post-Demo Notes"],["email","Follow-up Email"],["proposal","Proposal"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:7,border:"none",background:tab===k?B:D?"#1e2533":"transparent",color:tab===k?"#fff":dMT,fontSize:13,fontWeight:500,cursor:"pointer",transition:"all .15s"}}>{l}</button>
            ))}
          </nav>
          {fileName&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:500,background:BF,color:B}}><IFl size={11}/>{fileName}</span>}
        </div>

        {/* Upload */}
        {tab==="upload"&&<div style={dCS}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${dBRD2}`,display:"flex",alignItems:"center",gap:7}}><IUp size={14} style={{color:B}}/><span style={{fontSize:14,fontWeight:600}}>Upload Demo Transcript</span></div>
          <div style={{padding:20}}>
            {proc?(
              <div style={{textAlign:"center",padding:"50px 20px"}}>
                <div style={{width:50,height:50,background:BF,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><div className="spin" style={{width:22,height:22,borderWidth:3}}/></div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:5}}>Processing Transcript</div>
                <div style={{fontSize:13,color:dFT,marginBottom:8}}>{procMsg}</div>
                {transcriptStats?.chunks>1&&(
                  <div style={{display:"inline-block",padding:"6px 14px",background:BF,borderRadius:7,fontSize:12,color:B}}>
                    {transcriptStats.chars.toLocaleString()} characters across {transcriptStats.chunks} processing chunks
                  </div>
                )}
              </div>
            ):(
              <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={onDrop} onClick={()=>fRef.current?.click()}
                style={{border:`2px dashed ${drag?B:"#d0d5de"}`,borderRadius:11,padding:"46px 22px",textAlign:"center",cursor:"pointer",background:drag?BP:"#fafbfc",transition:"all .2s"}}>
                <input ref={fRef} type="file" accept=".vtt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                <div style={{width:48,height:48,background:BF,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:B}}><IUp size={22}/></div>
                <div style={{fontSize:16,fontWeight:600,marginBottom:5}}>Drop your .vtt file here</div>
                <div style={{fontSize:13,color:dFT,marginBottom:6}}>or click to browse — supports WebVTT transcript format</div>
                <div style={{fontSize:12,color:dHT,marginBottom:16}}>No length limit — long transcripts are processed in chunks automatically</div>
                <button onClick={e=>{e.stopPropagation();fRef.current?.click();}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:B,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer"}}><IUp size={13}/>Choose File</button>
              </div>
            )}
            {transcript&&!proc&&(
              <div style={{marginTop:18,padding:14,background:D?"#0d1117":"#f8f9fb",borderRadius:9,border:`1px solid ${dBRD}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                  <div style={{fontSize:11,fontWeight:600,color:dMT,textTransform:"uppercase",letterSpacing:.5}}>Transcript Preview</div>
                  {transcriptStats&&<div style={{fontSize:11,color:dHT}}>{transcriptStats.chars.toLocaleString()} characters{transcriptStats.chunks>1?` · processed in ${transcriptStats.chunks} chunks`:""}</div>}
                </div>
                <div style={{fontFamily:"monospace",fontSize:12,color:D?"#94a3b8":"#4a5568",lineHeight:1.7,maxHeight:150,overflowY:"auto",whiteSpace:"pre-wrap"}}>{transcript.slice(0,1300)}{transcript.length>1300?"\n...":""}</div>
              </div>
            )}
          </div>
        </div>}

        {/* Notes */}
        {tab==="notes"&&<div style={dCS}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${dBRD2}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:7}}><IFl size={14} style={{color:B}}/>Post-Demo Notes</span>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:11,color:dHT}}>Click any value cell to copy</span>
              <button onClick={()=>{setDemo(defaultData());setFileName("");setTranscript("");setTranscriptStats(null);}} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,background:D?"#161b27":"#fff",color:dTX,border:`1px solid ${dBRD}`,fontSize:12,fontWeight:500,cursor:"pointer"}}><IRf size={12}/>Reset</button>
            </div>
          </div>
          <div style={{display:"flex"}}>{noteCol(leftF,false)}{noteCol(rightF,true)}</div>
        </div>}

        {/* Email */}
        {tab==="email"&&<div style={dCS}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${dBRD2}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <span style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:7}}><IMl size={14} style={{color:B}}/>Follow-up Email Suite</span>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:13,color:dFT}}>Length:</span>
              <div style={{display:"flex",border:`1px solid ${dBRD}`,borderRadius:8,overflow:"hidden"}}>
                {["short","medium","long"].map(l=><button key={l} onClick={()=>setELen(l)} style={{padding:"7px 13px",fontSize:13,fontWeight:500,background:eLen===l?B:"#fff",color:eLen===l?"#fff":MT,border:"none",cursor:"pointer",transition:"all .15s"}}>{l[0].toUpperCase()+l.slice(1)}</button>)}
              </div>
              <button onClick={genEmail} disabled={eLoad} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:B,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",opacity:eLoad?.7:1}}>
                {eLoad?<><div className="spin"/>Generating...</>:<><ISp size={13}/>Generate Email</>}
              </button>
            </div>
          </div>
          <div style={{padding:20}}>
            {!eTxt&&!eLoad?(
              <div style={{textAlign:"center",padding:"46px 22px",color:dFT}}>
                <IMl size={30} style={{margin:"0 auto 10px",display:"block",color:"#c8cdd7"}}/>
                <p style={{fontSize:14,marginBottom:5}}>No email drafted yet</p>
                <p style={{fontSize:12}}>Pick a length and hit Generate Email to draft a note from Edgar</p>
              </div>
            ):(
              <>
                <textarea style={{fontSize:14,lineHeight:1.8,color:dTX,width:"100%",border:`1px solid ${dBRD}`,borderRadius:10,padding:18,resize:"vertical",minHeight:230,outline:"none",fontFamily:"inherit"}} value={eTxt} onChange={e=>setETxt(e.target.value)} rows={17}/>
                <div style={{display:"flex",gap:8,marginTop:11}}>
                  <button onClick={copyEmail} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:D?"#161b27":"#fff",color:dTX,border:`1px solid ${dBRD}`,fontSize:13,fontWeight:500,cursor:"pointer"}}>
                    {eCopied?<><ICk size={13}/>Copied!</>:<><ICp size={13}/>Copy to Clipboard</>}
                  </button>
                  <button onClick={gmail} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:B,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer"}}><IMl size={13}/>Draft in Gmail</button>
                </div>
              </>
            )}
          </div>
        </div>}

        {/* Proposal */}
        {tab==="proposal"&&(
          <div style={{display:"grid",gridTemplateColumns:"305px 1fr",gap:18,alignItems:"start"}}>
            {/* Settings */}
            <div style={{...dCS,maxHeight:"calc(100vh - 120px)",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${dBRD2}`,flexShrink:0}}><span style={{fontSize:14,fontWeight:600}}>Proposal Settings</span></div>
              {/* Sticky print button */}
              <div style={{padding:"14px 18px 10px",borderBottom:`1px solid ${dBRD2}`,flexShrink:0,background:D?"#161b27":"#fff"}}>
                <button onClick={exportPDF} disabled={pdfStep==="building"}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"12px 14px",borderRadius:9,background:B,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:pdfStep==="building"?"not-allowed":"pointer",opacity:pdfStep==="building"?.7:1}}>
                  {pdfStep==="building"
                    ?<><div className="spin" style={{borderTopColor:"rgba(255,255,255,.9)"}}/>Opening...</>
                    :<><IDl size={16}/>Save & Print</>}
                </button>
                <p style={{fontSize:11,color:dHT,marginTop:6,textAlign:"center",lineHeight:1.5}}>Opens in a new tab — print dialog launches automatically.</p>
              </div>
              {/* Scrollable rest of settings */}
              <div style={{padding:18,overflowY:"auto",flex:1}}>

                {/* ── Sections ── */}
                <div style={{fontSize:10,fontWeight:600,color:dHT,textTransform:"uppercase",letterSpacing:.6,padding:"10px 0 5px",borderTop:`1px solid ${dBRD2}`}}>Sections</div>
                {[["header","Cover Header"],["valueProp","Value Proposition"],["pricing","Pricing & Licensing"],["onboarding","Onboarding Package"],["paymentTerms","Payment Terms"],["terms","Next Steps"],["notes","Custom Notes"]].map(([k,l])=>(
                  <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${dBRD2}`}}>
                    <span style={{fontSize:13}}>{l}</span><Sw checked={comp[k]} onChange={v=>setComp(p=>({...p,[k]:v}))}/>
                  </div>
                ))}

                {/* ── Brand color ── */}
                <div style={{fontSize:10,fontWeight:600,color:dHT,textTransform:"uppercase",letterSpacing:.6,padding:"10px 0 5px",borderTop:`1px solid ${dBRD2}`,marginTop:4}}>Brand Color</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
                  {[["#004392","TaxDome Navy"],["#1976D3","TaxDome Blue"],["#1a1d23","Charcoal"]].map(([c,label])=>(
                    <div key={c} onClick={()=>setColor(c)} title={label} style={{width:24,height:24,borderRadius:6,background:c,cursor:"pointer",boxShadow:color===c?`0 0 0 2.5px #1976D3`:`0 0 0 1px ${BRD}`,border:"2px solid transparent",flexShrink:0}}/>
                  ))}
                  <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:24,height:24,border:`1px solid ${dBRD}`,borderRadius:6,cursor:"pointer",padding:1}}/>
                </div>

                {/* ── Client details (niche removed) ── */}
                <div style={{fontSize:10,fontWeight:600,color:dHT,textTransform:"uppercase",letterSpacing:.6,padding:"10px 0 5px",borderTop:`1px solid ${dBRD2}`}}>Client Details</div>
                {[["firmName","Firm / Client Name","e.g. Smith & Associates CPA"],["preparedBy","Prepared By",""],["validUntil","Valid Until",""]].map(([k,l,ph])=>(
                  <div key={k} style={{marginBottom:10}}><span style={dLS()}>{l}</span><input style={dIS} value={P[k]} onChange={e=>sp(k,e.target.value)} placeholder={ph}/></div>
                ))}

                {/* ── Plan & Licensing ── */}
                <div style={{fontSize:10,fontWeight:600,color:dHT,textTransform:"uppercase",letterSpacing:.6,padding:"10px 0 5px",borderTop:`1px solid ${dBRD2}`}}>Plan & Licensing</div>
                <div style={{marginBottom:10}}><span style={dLS()}>TaxDome Plan</span>
                  <select style={dIS} value={P.planKey} onChange={e=>sp("planKey",e.target.value)}>
                    <option value="essentials">Essentials — Solo only</option>
                    <option value="pro">Pro — Any team size</option>
                    <option value="business">Business — Premium</option>
                  </select>
                </div>
                {plan.soloOnly
                  ?<div style={{padding:"8px 11px",background:BF,borderRadius:7,fontSize:12,color:B,marginBottom:10}}>Essentials is a single-user plan — 1 license included.</div>
                  :<div style={{marginBottom:10}}><span style={dLS()}>Number of Licenses</span><input type="number" min="1" style={dIS} value={P.seats} onChange={e=>sp("seats",e.target.value)}/></div>
                }
                <div style={{marginBottom:10}}><span style={dLS()}>Subscription Term</span>
                  <select style={dIS} value={P.years} onChange={e=>sp("years",parseInt(e.target.value))}>
                    <option value={1}>1 Year — {f$(plan.prices[1])}/seat/yr</option>
                    <option value={2}>2 Years — {f$(plan.prices[2])}/seat/yr (save {Math.round((plan.prices[1]-plan.prices[2])/plan.prices[1]*100)}%)</option>
                    <option value={3}>3 Years — {f$(plan.prices[3])}/seat/yr (save {Math.round((plan.prices[1]-plan.prices[3])/plan.prices[1]*100)}%)</option>
                  </select>
                </div>

                {/* ── Onboarding ── */}
                <div style={{fontSize:10,fontWeight:600,color:dHT,textTransform:"uppercase",letterSpacing:.6,padding:"10px 0 5px",borderTop:`1px solid ${dBRD2}`}}>Onboarding Package</div>
                <div style={{marginBottom:10}}><span style={dLS()}>Package</span>
                  <select style={dIS} value={P.onboardingKey} onChange={e=>sp("onboardingKey",e.target.value)}>
                    <option value="none">No onboarding package</option>
                    <option value="group">Group Onboarding — Free</option>
                    <option value="guided">Guided Onboarding — $999</option>
                    <option value="enhanced">Enhanced Onboarding — $1,999</option>
                    <option value="premium">Premium Onboarding — $3,499</option>
                  </select>
                </div>

                {/* ── Payment Terms ── */}
                <div style={{fontSize:10,fontWeight:600,color:dHT,textTransform:"uppercase",letterSpacing:.6,padding:"10px 0 5px",borderTop:`1px solid ${dBRD2}`}}>Payment Terms</div>
                <div style={{marginBottom:10}}><span style={dLS()}>Payment Structure</span>
                  <select style={dIS} value={P.paymentType} onChange={e=>sp("paymentType",e.target.value)}>
                    <option value="upfront">Full Payment Upfront</option>
                    <option value="installments">Installment Plan (up to 6 months)</option>
                  </select>
                </div>
                {P.paymentType==="installments"&&(
                  <div style={{marginBottom:10}}><span style={dLS()}>Number of Installments</span>
                    <select style={dIS} value={P.installmentMonths} onChange={e=>sp("installmentMonths",e.target.value)}>
                      {[2,3,4,5,6].map(n=><option key={n} value={n}>{n} payments of {f$(grand/n)}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Live preview */}
            <div style={{background:D?"#161b27":"#fff",border:`1px solid ${dBRD}`,borderRadius:12,overflow:"hidden"}}>
              {comp.header&&(
                <div style={{background:color,color:"#fff"}}>
                  {/* Brand bar - slightly lighter via opacity overlay */}
                  <div style={{background:"rgba(255,255,255,.15)",padding:"10px 32px",display:"flex",alignItems:"center",gap:10,backdropFilter:"none"}}>
                    <div style={{width:26,height:26,background:D?"#161b27":"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:color,flexShrink:0,letterSpacing:"-0.5px"}}>TD</div>
                    <span style={{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:.3}}>TaxDome</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.65)",marginLeft:4}}>The all-in-one platform for tax &amp; accounting professionals</span>
                  </div>
                  {/* Firm name + meta */}
                  <div style={{padding:"32px 32px 28px"}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:2,opacity:.55,marginBottom:8,textTransform:"uppercase"}}>Prepared Exclusively For</div>
                    <div style={{fontSize:26,fontWeight:800,marginBottom:6,letterSpacing:"-.5px"}}><PE value={P.firmName||"Your Firm"} onChange={v=>sp("firmName",v)} style={{color:"#fff",fontSize:26,fontWeight:800}}/></div>
                    <div style={{width:44,height:3,background:"rgba(255,255,255,.5)",borderRadius:2,marginBottom:18}}/>
                    <div style={{display:"flex",gap:0,flexWrap:"wrap"}}>
                      {[["Prepared By","preparedBy"],["Date","createdDate"],["Valid Until","validUntil"]].map(([lb,k],i,arr)=>(<div key={k} style={{paddingRight:18,marginRight:18,borderRight:i<arr.length-1?`1px solid rgba(255,255,255,.2)`:"none"}}>
                        <div style={{opacity:.5,fontSize:9,letterSpacing:.7,textTransform:"uppercase",marginBottom:3}}>{lb}</div>
                        <PE value={P[k]} onChange={v=>sp(k,v)} style={{color:"#fff",fontWeight:700,fontSize:12}}/>
                      </div>))}
                    </div>
                  </div>
                </div>
              )}
              <div style={{padding:"28px 32px"}}>
                {comp.valueProp&&<div style={psec()}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:10,color:color,paddingLeft:11,borderLeft:`3px solid ${color}`}}>Why TaxDome?</div>
                  <PE multiline value={P.whyTaxdome} onChange={v=>sp("whyTaxdome",v)} rows={4} style={{fontSize:14,color:D?"#94a3b8":"#4a5568",lineHeight:1.8,marginBottom:12}}/>
                  <div style={{padding:13,background:D?"#0d1117":"#f8f9fb",borderRadius:8,borderLeft:`3px solid ${color}`,marginBottom:10}}><div style={{fontSize:10,fontWeight:600,color:dMT,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Addressing Your Challenges</div><PE multiline value={P.challenges} onChange={v=>sp("challenges",v)} rows={2} style={{fontSize:13,color:D?"#94a3b8":"#4a5568",lineHeight:1.6}} placeholder="Client's main challenges..."/></div>
                  <div style={{padding:13,background:`${color}10`,borderRadius:8}}><div style={{fontSize:10,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:.4,color}}>What Resonated During Your Demo</div><PE multiline value={P.whatResonated} onChange={v=>sp("whatResonated",v)} rows={2} style={{fontSize:13,color:D?"#94a3b8":"#4a5568",lineHeight:1.6}} placeholder="What got them excited..."/></div>
                </div>}
                {comp.pricing&&<div style={psec()}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{fontSize:16,fontWeight:800,color:color,paddingLeft:11,borderLeft:`3px solid ${color}`}}>Pricing &amp; Licensing</div>
                    <span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:`${color}14`,color}}>{plan.name}{years>1&&<span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:600,background:"#edf7ed",color:"#2e7d32",marginLeft:6}}>{years}-Year</span>}</span>
                  </div>
                  <p style={{fontSize:12,color:dFT,marginBottom:12}}>{plan.tagline}. All subscriptions are billed annually and paid upfront.</p>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{background:color}}>{["Description","Qty","Per Seat / Year","Total"].map(h=><th key={h} style={{...thS,color:"#fff",background:color}}>{h}</th>)}</tr></thead>
                    <tbody>
                      <tr style={{background:dBP}}><td style={tdS({fontWeight:500})}>TaxDome {plan.name}</td><td style={tdS()}>{seats} seat{seats>1?"s":""}</td><td style={tdS()}>{f$(ppy)}/seat/yr</td><td style={tdS({color,fontWeight:600})}>{f$(tpy)}/yr</td></tr>
                      {years>1&&<tr><td style={tdS({color:dMT,fontSize:12})}>{years}-Year Term Discount</td><td colSpan={2} style={tdS({color:"#2e7d32",fontSize:12})}>{disc} vs. 1-year rate</td><td style={tdS({color:dMT,fontSize:12})}>x {years} years</td></tr>}
                      {ob.price>0&&<tr style={{background:"#fff8f0"}}><td style={tdS({fontWeight:500})}>Onboarding: {ob.name}</td><td style={tdS()}>1</td><td style={tdS()}>One-time, paid at signup</td><td style={tdS({fontWeight:600})}>{f$(ob.price)}</td></tr>}
                      <tr style={{background:D?"#0d1117":"#f8f9fb"}}><td colSpan={2} style={{padding:"11px 13px",fontWeight:600}}>Total Investment ({years}-Year{ob.price>0?", incl. onboarding":""})</td><td style={{padding:"11px 13px"}}></td><td style={{padding:"11px 13px",fontWeight:700,color}}>{f$(grand)}</td></tr>
                    </tbody>
                  </table>
                  <div style={{padding:"10px 13px",background:D?"#0d1117":"#fafbfc",border:`1px solid ${dBRD2}`,borderTop:"none"}}>
                    <div style={{fontSize:11,fontWeight:600,color:dMT,marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>Plan Includes</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 16px"}}>{plan.features.map((f,i)=><div key={i} style={{fontSize:12,color:D?"#94a3b8":"#4a5568",display:"flex",alignItems:"flex-start",gap:5,lineHeight:1.5,marginBottom:3}}><span style={{width:4,height:4,minWidth:4,borderRadius:"50%",background:color,display:"inline-block",marginTop:5,flexShrink:0}}></span>{f}</div>)}</div>
                  </div>
                  <p style={{fontSize:11,color:dHT,marginTop:10}}>Valid until {P.validUntil}. Pricing billed annually, subject to final agreement.</p>
                </div>}
                {comp.onboarding&&<div style={psec()}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:4,color:color,paddingLeft:11,borderLeft:`3px solid ${color}`}}>Onboarding Package</div>
                  <p style={{fontSize:12,color:dFT,marginBottom:12}}>TaxDome's onboarding ensures your team is up and running fast — with bilingual support available.</p>
                  {P.onboardingKey==="none"
                    ?<div style={{border:`1px solid #c8d8ef`,borderRadius:9,overflow:"hidden",marginTop:4}}>
                        <div style={{padding:"12px 14px",background:"#eef3fb",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div>
                            <div style={{fontSize:14,fontWeight:600}}>Group Onboarding</div>
                            <div style={{fontSize:12,color:dMT,marginTop:2}}>Included with every TaxDome plan — no extra cost</div>
                          </div>
                          <div style={{fontSize:14,fontWeight:700,color:"#2e7d32"}}>Free</div>
                        </div>
                        <div style={{padding:"12px 14px",background:D?"#0d1117":"#fafbfc",borderTop:`1px solid ${dBRD2}`}}>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 14px",marginBottom:6}}>
                            {["Live group sessions Mon–Thu at 1 PM ET","Session recordings available","Led by Customer Onboarding Manager","Full access to TaxDome Academy"].map((f,i)=>(
                              <div key={i} style={{fontSize:12,color:D?"#94a3b8":"#4a5568",display:"flex",alignItems:"flex-start",gap:5,lineHeight:1.5,marginBottom:2}}><span style={{width:4,height:4,minWidth:4,borderRadius:"50%",background:"#2e7d32",display:"inline-block",marginTop:5,flexShrink:0}}></span>{f}</div>
                            ))}
                          </div>
                          <p style={{fontSize:12,color:dMT,marginTop:6}}>Prefer dedicated one-on-one support? Guided, Enhanced, and Premium packages are available — ask your TaxDome rep for details.</p>
                        </div>
                      </div>
                    :<div style={{border:`1px solid ${dBRD}`,borderRadius:9,overflow:"hidden",marginTop:10}}>
                      <div style={{padding:"12px 14px",background:`${color}08`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><div style={{fontSize:14,fontWeight:600}}>{ob.name}</div><div style={{fontSize:12,color:dMT,marginTop:2}}>{ob.ideal}</div></div>
                        {ob.price>0?<div style={{fontSize:18,fontWeight:600,color}}>{f$(ob.price)}</div>:<div style={{fontSize:14,fontWeight:600,color:"#2e7d32"}}>Free</div>}
                      </div>
                      <div style={{padding:"12px 14px",background:D?"#0d1117":"#fafbfc",borderTop:`1px solid ${dBRD2}`}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 18px",fontSize:12,marginBottom:8}}>{[["Sessions",ob.sessions],["Duration",ob.duration],["Workflows",ob.workflows],["Manager",ob.manager]].map(([l,v])=><div key={l}><span style={{fontWeight:600,color:dMT}}>{l}: </span><span>{v}</span></div>)}</div>
                        <div style={{fontSize:11,fontWeight:600,color:dMT,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>What's Included</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 14px"}}>{ob.features.map((f,i)=><div key={i} style={{fontSize:12,color:D?"#94a3b8":"#4a5568",display:"flex",alignItems:"flex-start",gap:5,lineHeight:1.5,marginBottom:3}}><span style={{width:4,height:4,minWidth:4,borderRadius:"50%",background:B,display:"inline-block",marginTop:5,flexShrink:0}}></span>{f}</div>)}</div>
                        {ob.note&&<p style={{fontSize:11,color:dHT,marginTop:8}}>{ob.note}</p>}
                      </div>
                    </div>
                  }
                  <div style={{marginTop:10,padding:"9px 13px",background:`${color}10`,borderRadius:8,fontSize:12,color:color}}>Onboarding is paid upfront at signup alongside your subscription.</div>
                </div>}
                {comp.paymentTerms&&<div style={psec()}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:8,color:color,paddingLeft:11,borderLeft:`3px solid ${color}`}}>Payment Terms</div>
                  <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                    <div style={{padding:"8px 14px",background:`${color}10`,borderRadius:7,fontSize:13}}><span style={{fontWeight:600,color}}>Structure: </span><span>{P.paymentType==="upfront"?"Full Payment Upfront":`${iMo}-Month Installment Plan`}</span></div>
                    <div style={{padding:"8px 14px",background:D?"#0d1117":"#f8f9fb",borderRadius:7,fontSize:13}}><span style={{fontWeight:600,color:dMT}}>Total: </span><span style={{fontWeight:600}}>{f$(grand)}</span></div>
                  </div>
                  <div style={{padding:14,background:D?"#0d1117":"#f8f9fb",borderRadius:9,fontSize:13,color:D?"#94a3b8":"#4a5568",lineHeight:1.7}}>{payPara}</div>
                  {P.paymentType==="installments"&&<div style={{marginTop:12}}>
                    <div style={{fontSize:12,fontWeight:600,color:dMT,marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>Installment Schedule</div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead><tr style={{background:color}}>{["Payment","Due","Amount"].map(h=><th key={h} style={{...thS,color:"#fff",background:color}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {Array.from({length:iMo},(_,i)=>(
                          <tr key={i} style={{background:i===0?BP:undefined}}>
                            <td style={tdS({fontWeight:i===0?600:400})}>Payment {i+1}{i===0?" — upon signing":""}</td>
                            <td style={tdS({color:dMT,fontSize:12})}>{i===0?"Upon signing":`Month ${i+1}`}</td>
                            <td style={tdS({fontWeight:600,color:i===0?color:TX})}>{f$(iAmt)}</td>
                          </tr>
                        ))}
                        <tr style={{background:D?"#0d1117":"#f8f9fb"}}><td colSpan={2} style={{padding:"11px 13px",fontWeight:600}}>Total</td><td style={{padding:"11px 13px",fontWeight:700,color}}>{f$(grand)}</td></tr>
                      </tbody>
                    </table>
                  </div>}
                </div>}
                {comp.terms&&<div style={psec()}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:10,color:color,paddingLeft:11,borderLeft:`3px solid ${color}`}}>Next Steps</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                    {[["step1","1"],["step2","2"],["step3","3"],["step4","4"]].map(([k,n])=>(
                      <div key={k} style={{padding:12,background:"#eef3fb",borderRadius:8,display:"flex",gap:9,alignItems:"flex-start"}}>
                        <div style={{width:23,height:23,borderRadius:6,background:color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{n}</div>
                        <PE value={P[k]} onChange={v=>sp(k,v)} style={{fontSize:13,color:dTX,lineHeight:1.5}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:9,padding:11,background:"#eef3fb",borderRadius:8,display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-start"}}>
                    <span style={{fontWeight:700,color,flexShrink:0,fontSize:13}}>Agreed next steps:</span>
                    <PE value={P.agreedNextSteps} onChange={v=>sp("agreedNextSteps",v)} style={{fontSize:13,color:D?"#94a3b8":"#4a5568",flex:1,minWidth:100}} placeholder="From your conversation..."/>
                  </div>
                  <div style={{marginTop:10,padding:"10px 13px",background:"#eef3fb",borderRadius:8,display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    <span style={{color:D?"#94a3b8":"#4a5568"}}>Ready to talk? </span>
                    <a href="https://calendly.com/d/csvs-b9g-s2x/30-min-taxdome-follow-up-with-edgar?month=2026-04" target="_blank" rel="noopener noreferrer" style={{color,fontWeight:700,textDecoration:"none"}}>Schedule a 30-min follow-up with Edgar →</a>
                  </div>
                </div>}
                {comp.notes&&<div style={psec(true)}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:10,color:color,paddingLeft:11,borderLeft:`3px solid ${color}`}}>Additional Notes</div>
                  <PE multiline value={P.customNotes} onChange={v=>sp("customNotes",v)} rows={4} style={{fontSize:13,color:D?"#94a3b8":"#4a5568",lineHeight:1.7,border:"1px dashed #c8d8ef",borderRadius:7,padding:12,display:"block"}} placeholder="Add specific comments, custom terms, or context for this client..."/>
                </div>}
                <div style={{marginTop:22,paddingTop:18,borderTop:`2px solid ${color}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:20,height:20,background:color,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:9,color:"#fff",letterSpacing:"-.5px"}}>TD</div>
                    <span style={{fontSize:11,color,fontWeight:700}}>TaxDome</span>
                    <span style={{fontSize:11,color:dFT,marginLeft:3}}>— Prepared by <strong>{P.preparedBy}</strong></span>
                  </div>
                  <div style={{fontSize:11,color:dFT}}>Valid until <span style={{fontWeight:700,color}}>{P.validUntil}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
