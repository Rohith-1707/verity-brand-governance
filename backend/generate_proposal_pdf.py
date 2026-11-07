import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Page dimensions for A4: 595.27 x 841.89 points
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 40

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw exact page numbers
    and professional running headers and footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        page_num = self._pageNumber
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running header mapping for each page
        headers = {
            1: "HACKATHON FINAL ROUND · 01 / 10",
            2: "THE PROBLEM · 02 / 10",
            3: "WHO IT SERVES · 03 / 10",
            4: "THE PLATFORM · 04 / 10",
            5: "CORE INNOVATIONS · 05 / 10",
            6: "ADVANCED ENHANCEMENTS · 06 / 10",
            7: "SYSTEM ARCHITECTURE · 07 / 10",
            8: "LIVE DEMONSTRATION & TEST SUITE · 08 / 10",
            9: "RESPONSIBLE AI · 09 / 10",
            10: "POSITIONING & CONCLUSION · 10 / 10",
        }
        header_text = headers.get(page_num, f"VERITY GOVERNANCE PLATFORM · {page_num:02d} / {total_pages:02d}")

        # Draw Top Running Header (Accent Red/Cyan style from proposal)
        self.setFont("Helvetica-Bold", 8.5)
        self.setFillColor(colors.HexColor("#D9383A")) # Signature proposal accent red
        self.drawString(MARGIN, PAGE_HEIGHT - 32, header_text)

        # Draw Bottom Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(MARGIN, 25, "VERITY · Evidence before publication · Advanced Hackathon Submission")
        self.drawRightString(PAGE_WIDTH - MARGIN, 25, f"Page {page_num} of {total_pages}")
        
        # Subtle footer separator line
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(MARGIN, 36, PAGE_WIDTH - MARGIN, 36)

        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=48,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Custom typography matching the proposal aesthetic
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=44,
        leading=48,
        textColor=colors.HexColor('#0F172A')
    )

    page_heading = ParagraphStyle(
        'PageHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=25,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )

    subheading = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )

    tagline_style = ParagraphStyle(
        'Tagline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0891B2'), # Cyan accent
        spaceAfter=14
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#334155')
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#0F172A')
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155')
    )

    card_title = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # -------------------------------------------------------------
    # PAGE 1: TITLE & SUBMISSION
    # -------------------------------------------------------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("VERITY", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("EVIDENCE-DRIVEN INTELLIGENT BRAND GOVERNANCE PLATFORM", ParagraphStyle(
        'SubBanner', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#0F172A')
    )))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=3.5, color=colors.HexColor('#0F172A'), spaceBefore=0, spaceAfter=14))
    story.append(Paragraph("Every Claim Needs Evidence. Every Publication Needs Accountability.", tagline_style))
    story.append(Spacer(1, 10))

    # Two Main Cards on Page 1
    sub_content = [
        Paragraph("<b>SUBMISSION</b>", card_title),
        Spacer(1, 6),
        Paragraph("<b>Hackathon:</b> CodeNexus India Hackathon", body_style),
        Spacer(1, 4),
        Paragraph("<b>Institution:</b> Bangalore Institute of Technology", body_style),
        Spacer(1, 4),
        Paragraph("<b>Team:</b> The Optimus Primes", body_style),
        Spacer(1, 8),
        Paragraph("<b>Live Website:</b><br/><font color='#0891b2'>https://rohith-1707.github.io/verity-brand-governance/</font>", body_style),
        Spacer(1, 6),
        Paragraph("<b>Source Code:</b><br/><font color='#0891b2'>https://github.com/Rohith-1707/verity-brand-governance.git</font>", body_style),
        Spacer(1, 8),
        Paragraph("<b>Status:</b> Fully Functional, Deployed Web Application", body_style),
    ]

    team_content = [
        Paragraph("<b>FOUR-MEMBER TEAM</b>", card_title),
        Spacer(1, 6),
        Paragraph("<b>Member 1 — Rohith H.M:</b> Team Leader, AI/ML & NLP Developer", body_style),
        Spacer(1, 5),
        Paragraph("<b>Member 2 — Rohith N:</b> System Architect", body_style),
        Spacer(1, 5),
        Paragraph("<b>Member 3 — Samrudh S Koushik:</b> Backend & Database Developer", body_style),
        Spacer(1, 5),
        Paragraph("<b>Member 4 — Anurag R Rai:</b> Frontend & UI/UX Developer", body_style),
        Spacer(1, 8),
        Paragraph("<b>Implemented Roles:</b>", card_title),
        Paragraph("• Platform Administrator: <b>Rohith (Administrator)</b><br/>• Editorial Reviewer: <b>Elena Rostova</b><br/>• Content Creator: <b>Marcus Vance</b>", bullet_style),
    ]

    t1 = Table([[sub_content, team_content]], colWidths=[250, 250])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0F9FF')), # Light cyan-blue
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#E2E8F0')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#BAE6FD')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('LEFTPADDING', (0,0), (-1,-1), 16),
        ('RIGHTPADDING', (0,0), (-1,-1), 16),
    ]))
    story.append(t1)
    story.append(Spacer(1, 24))

    # Bottom Highlight Box on Page 1
    story.append(Table([[
        Paragraph(
            "<b>ADVANCED HACKATHON DELIVERABLE:</b> Built and verified as a production-grade full-stack web application featuring 18 dedicated modules (6 public and 12 authenticated workspaces), single-click credential-free role access, light/dark themes, and 100% passing automated test coverage (21/21 tests passing).",
            body_style
        )
    ]], colWidths=[515], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 2: THE PROBLEM
    # -------------------------------------------------------------
    story.append(Paragraph("BRAND GOVERNANCE BREAKS WHEN APPROVED INFORMATION IS FRAGMENTED", page_heading))
    story.append(Paragraph(
        "Organisations publish continuously across websites, advertisements, product brochures, social channels, press releases, and partner decks. Factual accuracy and brand consistency collapse when approved facts, claims, and guidelines are scattered across departments, documents, and email chains.",
        body_style
    ))
    story.append(Spacer(1, 14))

    rc_items = [
        Paragraph("<b>ROOT CAUSES</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Fragmented Truth:</b> Product specifications, warranties, and corporate policies reside in siloed documents with conflicting revisions.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Unverified Promotional Claims:</b> Marketers publish bold statistical and capability claims without traceable approved citations.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Outdated Collateral Surviving:</b> Superseded product terms (e.g. legacy warranty periods) remain active in published customer collateral.", bullet_style),
    ]

    rf_items = [
        Paragraph("<b>REVIEW FRICTION</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Ambiguous Guideline Interpretation:</b> Rules are interpreted subjectively across channels without contextual awareness.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Manual Review Bottlenecks:</b> Compliance teams drown in manual text checks without automated claim extraction or risk prioritization.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Zero Systemic Learning:</b> Repeatedly rejected terminology and common mistakes recur because review feedback is lost in email.", bullet_style),
    ]

    t2 = Table([[rc_items, rf_items]], colWidths=[250, 250])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#FFF1F2')), # Light red/rose
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#FECDD3')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F8FAFC')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(t2)
    story.append(Spacer(1, 16))

    story.append(Table([[
        Paragraph(
            "<b>THE CORE GOVERNANCE CHALLENGE:</b><br/>"
            "Trustworthy, consistent publication requires verified evidence, contextual guidelines, and accountable human review decisions in a single explainable workflow.",
            ParagraphStyle('ChallengeCallout', fontName='Helvetica', fontSize=10, leading=15, textColor=colors.HexColor('#0F172A'))
        )
    ]], colWidths=[515], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#E0F2FE')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#38BDF8')),
        ('PADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(Spacer(1, 14))

    story.append(Paragraph(
        "<b>Why Conventional Tools Fall Short:</b> Grammar checkers (like Grammarly) only evaluate readability and spelling without organizational grounding. Generic AI tools (like ChatGPT) hallucinate facts and rewrite copy without evidence provenance. Neither tool verifies factual support against authoritative documents, tracks policy change dependencies, or preserves auditable human sign-offs.",
        body_style
    ))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 3: WHO IT SERVES
    # -------------------------------------------------------------
    story.append(Paragraph("VERITY TARGETS THE PEOPLE WHO CARRY PUBLICATION RISK", page_heading))
    story.append(Paragraph(
        "VERITY provides a unified brand governance workspace specifically designed for cross-functional teams where factual errors, misleading promotional statements, or outdated collateral result in legal liability, brand erosion, or regulatory penalties.",
        body_style
    ))
    story.append(Spacer(1, 12))

    roles_data = [
        [Paragraph("<b>Role</b>", card_title), Paragraph("<b>Primary Need & Friction</b>", card_title), Paragraph("<b>VERITY Implemented Solution</b>", card_title)],
        [
            Paragraph("<b>Brand Managers</b>", body_bold),
            Paragraph("Centralized governance, brand consistency, and rule compliance across diverse collateral.", body_style),
            Paragraph("Knowledge Base truth management, live Brand Health Score, and Adaptive Governance recommendations.", body_style)
        ],
        [
            Paragraph("<b>Content Creators & Marketing</b>", body_bold),
            Paragraph("Verifying promotional claims before publication and avoiding repetitive review rejections.", body_style),
            Paragraph("Pre-submission verification engine, context-aware checking, and visual diff revision tracking.", body_style)
        ],
        [
            Paragraph("<b>Legal & Compliance Reviewers</b>", body_bold),
            Paragraph("Manual checking fatigue, lack of evidence traceability, and unprioritized review backlogs.", body_style),
            Paragraph("Smart Prioritised Review Queue, transparent claim classification, and 1-click audit decisions.", body_style)
        ],
        [
            Paragraph("<b>Enterprise Leadership & PR</b>", body_bold),
            Paragraph("Exposure from outdated warranty, pricing, or product claims circulating in external channels.", body_style),
            Paragraph("Cross-Content Change Impact Analysis identifying affected collateral immediately when facts change.", body_style)
        ],
    ]

    t3 = Table(roles_data, colWidths=[110, 195, 210])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t3)
    story.append(Spacer(1, 14))

    story.append(Table([[
        Paragraph(
            "<b>EVALUATOR DEMONSTRATION WORKSPACE:</b><br/>"
            "To enable rapid testing without administrative overhead, VERITY features a built-in instant role switcher in the application topbar. Evaluators can toggle between Administrator (Rohith), Reviewer (Elena Rostova), and Creator (Marcus Vance) with a single click.",
            body_style
        )
    ]], colWidths=[515], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0FDF4')), # Light emerald
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#86EFAC')),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 4: THE PLATFORM WORKFLOW
    # -------------------------------------------------------------
    story.append(Paragraph("ONE WORKFLOW CONNECTS EVIDENCE, GUIDELINES, CONTENT AND HUMAN DECISIONS", page_heading))
    story.append(Paragraph(
        "VERITY connects approved truth documents, brand guidelines, content submissions, and reviewer decisions into a closed-loop governance pipeline:",
        body_style
    ))
    story.append(Spacer(1, 10))

    pipeline_steps = [
        ("01", "INGEST & VERSION APPROVED TRUTH", "Upload PDF, DOCX, and text policies into the Knowledge Base. Store effective dates, review dates, and version designations."),
        ("02", "SUBMIT CONTENT & DEFINE CONTEXT", "Creator uploads campaign copy, brochure PDF, or social assets while declaring audience, channel, purpose, and tone."),
        ("03", "EXTRACT CLAIMS & VISUAL ASSETS", "Automated sentence extraction identifies factual, numeric, and promotional claims. OpenCV inspects visual blur and contrast."),
        ("04", "SEMANTIC EVIDENCE MATCHING", "Statistical n-gram TF-IDF vector matching retrieves top supporting passages from authoritative approved documents."),
        ("05", "TRANSPARENT RISK SCORING", "Transparent 0–100 risk scoring classifies content as Low, Medium, or High risk with explainable penalty breakdowns."),
        ("06", "HUMAN REVIEW & AUDIT LOGGING", "Reviewers approve, reject, or request revisions. All decisions, timestamps, and comments enter the immutable audit log."),
    ]

    p_rows = []
    for num, title_s, desc_s in pipeline_steps:
        p_rows.append([
            Paragraph(f"<b>{num}</b>", ParagraphStyle('PNum', fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor('#0891B2'))),
            Paragraph(f"<b>{title_s}</b><br/>{desc_s}", body_style)
        ])

    t4 = Table(p_rows, colWidths=[40, 475])
    t4.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t4)
    story.append(Spacer(1, 12))

    # Boundary Callouts
    b1 = [
        Paragraph("<b>WHAT VERITY CHECKS</b>", card_title),
        Spacer(1, 4),
        Paragraph("• Factual consistency against approved documents.<br/>• Outdated specifications and expired warranties.<br/>• Banned and required brand terminology.<br/>• Evidence freshness and superseded policies.<br/>• Image blur, contrast, and resolution quality.", bullet_style)
    ]
    b2 = [
        Paragraph("<b>WHAT VERITY DOES NOT DO</b>", card_title),
        Spacer(1, 4),
        Paragraph("• Never automatically approves high-risk content.<br/>• Never invents evidence or hallucinates citations.<br/>• Never uses proprietary documents for model training.<br/>• AI explanations are strictly separated from evidence.<br/>• People own final publishing accountability.", bullet_style)
    ]

    t4_bounds = Table([[b1, b2]], colWidths=[250, 250])
    t4_bounds.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F0F9FF')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#BAE6FD')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#FFF1F2')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#FECDD3')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t4_bounds)

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 5: THREE ORIGINAL CORE INNOVATIONS
    # -------------------------------------------------------------
    story.append(Paragraph("THREE CORE INNOVATIONS: TRACEABLE, DEPENDENT AND ADAPTIVE", page_heading))
    story.append(Paragraph(
        "VERITY establishes three architectural innovations that elevate brand governance from superficial grammar checking to verifiable organizational truth:",
        body_style
    ))
    story.append(Spacer(1, 12))

    inno_1 = [
        Paragraph("<b>01</b>", ParagraphStyle('INum', fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#0891B2'))),
        Paragraph("<b>EVIDENCE-LINKED CLAIM VERIFICATION</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Precise Classification:</b> Classifies statements into Verified, Unsupported, Contradictory, Potentially Outdated, or Needs Review.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Source Traceability:</b> Pinpoints exact document title, approved version, and relevant excerpt passage.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Approved Corrections:</b> Recommends factual corrections grounded strictly in approved corporate documents.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <i>Rule: An AI explanation is never treated as evidence. Claims require explicit backing in approved sources.</i>", ParagraphStyle('RuleI', fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'))),
    ]

    inno_2 = [
        Paragraph("<b>02</b>", ParagraphStyle('INum', fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#059669'))),
        Paragraph("<b>CROSS-CONTENT CHANGE-IMPACT ANALYSIS</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Dependency Tracking:</b> When an approved fact changes (e.g. warranty reduced from 3 years to 2 years), the system identifies all registered assets containing old figures.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Affected Asset Registry:</b> Flags brochures, social posts, posters, and technical sheets for review.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Structured Resolution:</b> Reviewers inspect the exact text snippet and resolve the dependency directly in the platform.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <i>This is proactive dependency management, not reactive search.</i>", ParagraphStyle('RuleI', fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'))),
    ]

    inno_3 = [
        Paragraph("<b>03</b>", ParagraphStyle('INum', fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#7C3AED'))),
        Paragraph("<b>ADAPTIVE GOVERNANCE INTELLIGENCE</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Decision Learning:</b> Analyzes reviewer feedback and approval verdicts over time to identify systemic communication bottlenecks.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Recurring Issue Detection:</b> Surfaces repeatedly rejected claims, frequently misunderstood terms, and unclear brand guidelines.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Guideline Recommendations:</b> Generates concrete clarification proposals for brand administrators.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <i>Official policies are never automatically altered; human administrators retain authority.</i>", ParagraphStyle('RuleI', fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'))),
    ]

    t5 = Table([[inno_1, inno_2, inno_3]], colWidths=[165, 165, 165])
    t5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F0F9FF')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0FDF4')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#FAF5FF')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#BAE6FD')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#BBF7D0')),
        ('BOX', (2,0), (2,0), 1, colors.HexColor('#E9D5FF')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t5)
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        "<b>Architectural Synergy:</b> Traceability connects every claim to authoritative evidence. Dependency analysis prevents outdated terms from lingering in the wild. Learning connects human review decisions back into clearer organizational governance.",
        body_style
    ))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 6: SIX ADVANCED ENHANCEMENTS (NEW WORKING FEATURES)
    # -------------------------------------------------------------
    story.append(Paragraph("SIX ADVANCED ENHANCEMENTS EXTEND GOVERNANCE CAPABILITY", page_heading))
    story.append(Paragraph(
        "In addition to the three core innovations, VERITY includes six advanced production capabilities fully implemented and demonstrable in the working web application:",
        body_style
    ))
    story.append(Spacer(1, 10))

    enhancements = [
        ("A. Evidence Freshness & Lifecycle Monitor",
         "Tracks document versions, approval dates, effective dates, and review/expiry dates. If a claim matches an expired or superseded document, VERITY warns reviewers with a staleness alert rather than assuming invalidity.",
         colors.HexColor('#F0F9FF'), colors.HexColor('#0891B2')),
        ("B. Transparent Explainable Risk Scoring",
         "Replaces arbitrary AI black-box ratings with a transparent 0–100 risk formula. Factor weights (contradictions: 30%, unsupported claims: 25%, guideline violations: 20%) are fully configurable by administrators in Settings.",
         colors.HexColor('#FFF1F2'), colors.HexColor('#E11D48')),
        ("C. Smart Content Diff & Revision Tracking",
         "When creators revise copy, opcode diff analysis compares versions side-by-side. Highlights added/removed text, verifies if prior issues were corrected, and alerts reviewers if new unsupported claims were introduced.",
         colors.HexColor('#F0FDF4'), colors.HexColor('#059669')),
        ("D. Organisation Brand Health Score",
         "Live executive dashboard calculating organizational governance health (0–100): Grounded Evidence Rate (35%), Unresolved High-Risk Issues (20%), Asset Freshness (15%), Review Velocity (20%), and Guideline Alignment (10%).",
         colors.HexColor('#FAF5FF'), colors.HexColor('#7C3AED')),
        ("E. Context-Aware Brand Checking",
         "Interprets brand guidelines based on declared context (Audience, Platform, Purpose, Category, Tone). Differentiates between formal customer notices and casual social ads while strictly enforcing mandatory factual truth.",
         colors.HexColor('#FFFBEB'), colors.HexColor('#D97706')),
        ("F. Prioritised Human Review Queue",
         "Smart triage queue sorting submissions by Risk Severity (High Risk first), Publication Deadline, Submission Timestamp, and Unresolved Issues. Includes full in-app notifications and reviewer decision audit trails.",
         colors.HexColor('#F1F5F9'), colors.HexColor('#0F172A')),
    ]

    grid_data = []
    for i in range(0, len(enhancements), 2):
        e1 = enhancements[i]
        e2 = enhancements[i+1]
        c1 = [Paragraph(f"<b>{e1[0]}</b>", card_title), Spacer(1, 3), Paragraph(e1[1], bullet_style)]
        c2 = [Paragraph(f"<b>{e2[0]}</b>", card_title), Spacer(1, 3), Paragraph(e2[1], bullet_style)]
        grid_data.append([c1, c2])

    t6 = Table(grid_data, colWidths=[250, 250])
    t6.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (0,1), (0,1), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,1), (1,1), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (0,2), (0,2), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,2), (1,2), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t6)

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 7: IMPLEMENTED TECHNICAL ARCHITECTURE
    # -------------------------------------------------------------
    story.append(Paragraph("IMPLEMENTED FULL-STACK & AI RETRIEVAL ARCHITECTURE", page_heading))
    story.append(Paragraph(
        "The architecture separates UI state, asynchronous API services, semantic vector retrieval, and governance records. The application is completely implemented, verified with tests, and deployed live:",
        body_style
    ))
    story.append(Spacer(1, 10))

    arch_boxes = [
        ("USER INTERFACE (FRONTEND)", "React 19 · TypeScript · Vite · Tailwind CSS · Lucide",
         "Responsive single-page application with 18 dedicated views. Features instant Light & Dark theme switching, HashRouter subfolder safety, and zero-password demo access."),
        ("APPLICATION SERVICES (BACKEND)", "Python 3.11+ · FastAPI · REST APIs · Uvicorn Async",
         "High-throughput RESTful architecture with CORS boundaries, rate limiting (SlowAPI), exception handlers, and unified static SPA asset delivery from a single port."),
        ("AI & SEMANTIC RETRIEVAL", "Scikit-Learn TF-IDF N-Grams · Cosine Similarity",
         "Fast statistical semantic vector retriever with character & word n-grams and cosine distance matching over approved passages. Backed by Keyword and ChromaDB fallback options."),
        ("DATA PERSISTENCE & ORM", "SQLite (verity.db) · PostgreSQL Migration Ready",
         "Dual-engine portable SQL architecture. SQLite provides instant zero-config demonstration with seeded Acme Global data, while PostgreSQL DDL handles enterprise scale."),
        ("DOCUMENT & VISION EXTRACTION", "PyMuPDF · Python-DOCX · OpenCV",
         "Extracts structured text and metadata from PDF, DOCX, and TXT. OpenCV provides automated visual quality checks (Laplacian variance blur, contrast, resolution)."),
        ("AUTHENTICATION & ACCESS", "Local JWT · Zero-Login Demo Mode · Supabase JWKS",
         "Hybrid auth supporting instant one-click login for Administrator (Rohith), Reviewer, and Creator, alongside enterprise Supabase ES256/RS256 JWT validation."),
    ]

    arch_table_data = []
    for i in range(0, len(arch_boxes), 2):
        b1_data = arch_boxes[i]
        b2_data = arch_boxes[i+1]
        c1 = [
            Paragraph(f"<b>{b1_data[0]}</b>", card_title),
            Paragraph(f"<font color='#0891b2'><b>{b1_data[1]}</b></font>", ParagraphStyle('TechS', fontName='Helvetica-Bold', fontSize=8, leading=11)),
            Spacer(1, 3),
            Paragraph(b1_data[2], bullet_style)
        ]
        c2 = [
            Paragraph(f"<b>{b2_data[0]}</b>", card_title),
            Paragraph(f"<font color='#0891b2'><b>{b2_data[1]}</b></font>", ParagraphStyle('TechS', fontName='Helvetica-Bold', fontSize=8, leading=11)),
            Spacer(1, 3),
            Paragraph(b2_data[2], bullet_style)
        ]
        arch_table_data.append([c1, c2])

    t7 = Table(arch_table_data, colWidths=[250, 250])
    t7.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 9),
    ]))
    story.append(t7)
    story.append(Spacer(1, 12))

    story.append(Table([[
        Paragraph(
            "<b>DEPLOYMENT TOPOLOGY:</b> Multi-stage Docker container builds the React frontend in Node 20 and packages it into Python 3.11-slim. Dynamic PORT binding enables 1-click deployment on Render, Railway, or GitHub Pages.",
            body_style
        )
    ]], colWidths=[515], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 8: LIVE DEMONSTRATION & TEST SUITE
    # -------------------------------------------------------------
    story.append(Paragraph("PROVEN LIVE APPLICATION, REAL DATA & PASSING TEST SUITE", page_heading))
    story.append(Paragraph(
        "VERITY is not a static concept or mockup. It is a live, fully verified application backed by automated test suites and demonstrable user flows:",
        body_style
    ))
    story.append(Spacer(1, 10))

    # Test Metrics Table
    test_rows = [
        [Paragraph("<b>Automated Test Suite (pytest)</b>", card_title), Paragraph("<b>Coverage Scope</b>", card_title), Paragraph("<b>Result</b>", card_title)],
        [Paragraph("<b>Engine & Verification Tests (13)</b>", body_bold), Paragraph("Claim extraction, evidence comparison, risk scoring, diff opcodes, impact mapping", bullet_style), Paragraph("<font color='#059669'><b>13 / 13 Passed</b></font>", body_bold)],
        [Paragraph("<b>Extraction & Security Tests (4)</b>", body_bold), Paragraph("PDF extraction, DOCX parsing, token verification, route protection", bullet_style), Paragraph("<font color='#059669'><b>4 / 4 Passed</b></font>", body_bold)],
        [Paragraph("<b>New Enhancements Tests (4)</b>", body_bold), Paragraph("Role switching, prioritized queue triage, brand health formula, visual OpenCV blur", bullet_style), Paragraph("<font color='#059669'><b>4 / 4 Passed</b></font>", body_bold)],
        [Paragraph("<b>TOTAL AUTOMATED TESTS</b>", card_title), Paragraph("<b>Full end-to-end regression validation</b>", body_bold), Paragraph("<font color='#059669'><b>21 / 21 Passed (100%)</b></font>", card_title)],
    ]

    t8_tests = Table(test_rows, colWidths=[165, 230, 120])
    t8_tests.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#F0FDF4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t8_tests)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Demonstrated Operational Scenario: Acme Global Warranty Update</b>", subheading))

    scenario_content = [
        Paragraph("<b>1. Policy Ingestion:</b> Administrator Rohith uploads <i>Standard Product Warranty Policy v2.0</i> (effective: 2-year warranty term, superseding 3-year term).", bullet_style),
        Paragraph("<b>2. Collateral Submission:</b> Creator Marcus Vance submits copy claiming: <i>'All Apex devices include a 3 year warranty and 85% productivity boost.'</i>", bullet_style),
        Paragraph("<b>3. Automated Verification:</b> System classifies warranty claim as <b>Contradictory</b> against approved source v2.0, and flags productivity claim as <b>Unsupported</b>.", bullet_style),
        Paragraph("<b>4. Explainable Risk Score:</b> Calculates <b>Risk Score = 30 / 100 (High Risk)</b> due to contradiction and missing evidence. Auto-approval is blocked.", bullet_style),
        Paragraph("<b>5. Prioritized Triage:</b> Places submission at the top of Reviewer Elena Rostova's queue. Elena requests revision with evidence-based note.", bullet_style),
        Paragraph("<b>6. Smart Revision Diff:</b> Marcus resubmits corrected copy (2-year warranty). Diff tool confirms contradiction resolution. Elena approves content.", bullet_style),
    ]

    t8_scen = Table([[scenario_content]], colWidths=[515])
    t8_scen.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t8_scen)

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 9: RESPONSIBLE AI
    # -------------------------------------------------------------
    story.append(Paragraph("RESPONSIBLE AI IS A PRODUCT REQUIREMENT, NOT AN AFTERTHOUGHT", page_heading))
    story.append(Paragraph(
        "In enterprise governance, autonomous black-box decisions introduce extreme legal and brand risk. VERITY is built strictly upon Responsible AI principles that enforce transparency and human oversight:",
        body_style
    ))
    story.append(Spacer(1, 10))

    ctrl_items = [
        Paragraph("<b>CORE GOVERNANCE CONTROLS</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Approved Truth Anchor:</b> Only authenticated organizational documents in the Knowledge Base constitute truth. AI cannot invent facts.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Separation of AI & Evidence:</b> An AI-generated explanation is strictly a guide; it is never presented as independent evidence.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Guaranteed Human-in-the-Loop:</b> High-risk submissions and conflicting claims cannot be automatically approved.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Protected Policy Authority:</b> Adaptive intelligence suggests guideline clarifications, but never modifies official rules autonomously.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Immutable Audit Trail:</b> Every decision, guideline modification, and document approval is logged with timestamp, user ID, and action.", bullet_style),
    ]

    sec_items = [
        Paragraph("<b>SECURITY & DATA INTEGRITY</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Confidentiality Guarantee:</b> Proprietary organizational documents are never used for external model fine-tuning or public LLM training.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Air-Gapped Ready:</b> The statistical TF-IDF semantic engine runs completely locally without external cloud API dependencies.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Role-Based Boundaries:</b> Granular role separation ensures creators cannot approve their own submissions or alter risk formulas.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Rate-Limiting & Input Defense:</b> SlowAPI throttles abuse; strict file validators inspect mime-types and file headers before extraction.", bullet_style),
    ]

    t9 = Table([[ctrl_items, sec_items]], colWidths=[250, 250])
    t9.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0FDF4')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#BBF7D0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t9)
    story.append(Spacer(1, 14))

    story.append(Table([[
        Paragraph(
            "<b>EVALUATION PHILOSOPHY:</b><br/>"
            "VERITY makes uncertainty visible before making recommendations. When evidence is ambiguous or effective dates are missing, the system explicitly flags uncertainty rather than guessing, ensuring human reviewers always make fully informed decisions.",
            ParagraphStyle('EvalPhil', fontName='Helvetica', fontSize=9, leading=14, textColor=colors.HexColor('#0F172A'))
        )
    ]], colWidths=[515], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93C5FD')),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 10: POSITIONING & CONCLUSION
    # -------------------------------------------------------------
    story.append(Paragraph("VERITY INTEGRATES CAPABILITIES THAT ARE OFTEN HANDLED SEPARATELY", page_heading))
    story.append(Paragraph(
        "Market tools address either linguistic style or generative drafting. VERITY provides the missing enterprise layer: evidence provenance, policy change dependencies, and human sign-off governance.",
        body_style
    ))
    story.append(Spacer(1, 10))

    comp_data = [
        [Paragraph("<b>Approach</b>", card_title), Paragraph("<b>Core Capability</b>", card_title), Paragraph("<b>Governance & Truth Boundary</b>", card_title)],
        [
            Paragraph("<b>Grammar Checkers</b><br/>(Grammarly, etc.)", body_bold),
            Paragraph("Spelling, tone, readability, and syntax correction.", body_style),
            Paragraph("Zero awareness of organizational truth, policy documents, or factual claims.", bullet_style)
        ],
        [
            Paragraph("<b>Generic AI Writers</b><br/>(ChatGPT, Claude, etc.)", body_bold),
            Paragraph("Creative copywriting, rewriting, and text generation.", body_style),
            Paragraph("High hallucination risk; cannot verify citations against internal source versions.", bullet_style)
        ],
        [
            Paragraph("<b>VERITY Platform</b><br/>(Our Solution)", card_title),
            Paragraph("<b>Evidence-linked claim verification, change impact analysis, freshness tracking, and diff audits.</b>", body_style),
            Paragraph("<b>Closed-loop governance connecting approved source truth with auditable human sign-offs.</b>", body_style)
        ],
    ]

    t10_comp = Table(comp_data, colWidths=[120, 185, 210])
    t10_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#F0F9FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (0,3), (-1,3), 1.5, colors.HexColor('#0284C7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t10_comp)
    story.append(Spacer(1, 12))

    ref_items = [
        Paragraph("<b>ACADEMIC REFERENCES</b>", card_title),
        Spacer(1, 4),
        Paragraph("1. Kirkby, Baumgarth & Henseler, <i>'Welcome, new brand colleague! A conceptual framework for human–AI co-creation,'</i> Journal of Brand Management, 2025.", bullet_style),
        Spacer(1, 3),
        Paragraph("2. Westphal et al., <i>'Decision control and explanations in human-AI collaboration,'</i> Computers in Human Behavior, vol. 144, 2023.", bullet_style),
        Spacer(1, 3),
        Paragraph("3. Haupt et al., <i>'Consumer responses to human-AI collaboration at organizational frontlines,'</i> Review of Managerial Science, 2024.", bullet_style),
    ]

    conc_items = [
        Paragraph("<b>PROJECT CONCLUSION</b>", card_title),
        Spacer(1, 4),
        Paragraph("VERITY successfully bridges the gap between approved organizational knowledge and multi-channel publication. By coupling statistical evidence retrieval with transparent risk scoring and human review accountability, VERITY delivers trustworthy brand governance at scale.", body_style),
        Spacer(1, 6),
        Paragraph("<b>Every Claim Needs Evidence. Every Publication Needs Accountability.</b>", ParagraphStyle('ConcTag', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=colors.HexColor('#0891B2')))
    ]

    t10_bottom = Table([[ref_items, conc_items]], colWidths=[250, 250])
    t10_bottom.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0FDF4')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#BBF7D0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t10_bottom)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")


if __name__ == '__main__':
    output_path = r'D:\verity\VERITY_Hackathon_Final_Documentation.pdf'
    build_pdf(output_path)
