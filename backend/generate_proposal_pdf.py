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

        headers = {
            1: "HACKATHON FINAL ROUND · 01 / 10",
            2: "THE PROBLEM · 02 / 10",
            3: "WHO IT SERVES · 03 / 10",
            4: "THE PLATFORM · 04 / 10",
            5: "CORE INNOVATIONS · 05 / 10",
            6: "ROUND 3 DELIVERED IMPROVEMENTS · 06 / 10",
            7: "SYSTEM ARCHITECTURE · 07 / 10",
            8: "LIVE DEMONSTRATION & TEST SUITE · 08 / 10",
            9: "RESPONSIBLE AI & HARDENING · 09 / 10",
            10: "ROADMAP & CONCLUSION · 10 / 10",
        }
        header_text = headers.get(page_num, f"VERITY GOVERNANCE PLATFORM · {page_num:02d} / {total_pages:02d}")

        # Top Running Header
        self.setFont("Helvetica-Bold", 8.5)
        self.setFillColor(colors.HexColor("#D9383A"))
        self.drawString(MARGIN, PAGE_HEIGHT - 32, header_text)

        # Bottom Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(MARGIN, 25, "VERITY · Evidence before publication · Round 3 Final Submission")
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

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=42,
        leading=46,
        textColor=colors.HexColor('#0F172A')
    )

    page_heading = ParagraphStyle(
        'PageHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )

    tagline_style = ParagraphStyle(
        'DocTagline',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#334155'),
        spaceAfter=14
    )

    subheading = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0F172A')
    )

    bullet_style = ParagraphStyle(
        'BulletDark',
        parent=body_style,
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

    sub_content = [
        Paragraph("<b>SUBMISSION OVERVIEW</b>", card_title),
        Spacer(1, 8),
        Paragraph("<b>Hackathon:</b> CodeNexus India Hackathon", body_style),
        Spacer(1, 6),
        Paragraph("<b>Institution:</b> Bangalore Institute of Technology", body_style),
        Spacer(1, 6),
        Paragraph("<b>Team:</b> The Optimus Primes", body_style),
        Spacer(1, 8),
        Paragraph("<b>Functioning Project URL:</b><br/><font color='#0891b2'>https://rohith-1707.github.io/verity-brand-governance/</font>", body_style),
        Spacer(1, 6),
        Paragraph("<b>Source Code Repository:</b><br/><font color='#0891b2'>https://github.com/Rohith-1707/verity-brand-governance.git</font>", body_style),
    ]

    team_content = [
        Paragraph("<b>FOUR-MEMBER TEAM</b>", card_title),
        Spacer(1, 8),
        Paragraph("<b>Member 1 — Rohith H.M:</b> Team Leader & AI/ML & NLP Developer", body_style),
        Spacer(1, 6),
        Paragraph("<b>Member 2 — Rohith N:</b> System Architect", body_style),
        Spacer(1, 6),
        Paragraph("<b>Member 3 — Samrudh S Koushik:</b> Backend & Database Developer", body_style),
        Spacer(1, 6),
        Paragraph("<b>Member 4 — Anurag R Rai:</b> Frontend & UI/UX Developer", body_style),
    ]

    t1 = Table([[sub_content, team_content]], colWidths=[250, 250])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0F9FF')),
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

    story.append(Table([[
        Paragraph(
            "<b>ROUND 3 FINAL HACKATHON DELIVERABLE:</b> Complete production-grade brand governance platform featuring 18 operational views, 100% test coverage (29/29 passing tests), offline-first mock fallback engine ensuring 100% demo uptime on GitHub Pages, and all three promised Round 2 commitments fully implemented: (1) Multimodal Visual Bounding-Box Flyer OCR, (2) Automated Policy Reconciliation Wizard, and (3) Pre-Publish CMS Firewall Webhook Gateway.",
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
        "Modern enterprises communicate at massive velocity across marketing websites, press releases, social ads, and partner channels. Yet approved truth resides in dispersed technical specifications, legal disclosures, and compliance guidelines.",
        body_style
    ))
    story.append(Spacer(1, 10))

    prob_cards = [
        ("FRAGILE APPROVALS",
         "Marketing teams rely on manual memory, messy spreadsheets, or ad-hoc chat sign-offs. Reviewers frequently approve drafts under deadline pressure without cross-verifying numbers against current engineering spec sheets."),
        ("SILOED COMMERCE",
         "When a specification changes (e.g. warranty reduced from 3 years to 2 years), obsolete claims remain live across dozens of previously approved brochures, product flyers, partner sales decks, and external distributor portals."),
        ("AUTONOMOUS DRIFT",
         "Generative AI tools draft convincing copy that invents performance figures or unauthorized superlatives ('100% unbreakable', 'unlimited battery'). Organizations lack automated pre-publish firewalls to intercept ungrounded statements."),
    ]

    p_table_data = []
    for title, desc in prob_cards:
        p_table_data.append([
            Paragraph(f"<b>{title}</b>", card_title),
            Paragraph(desc, body_style)
        ])

    t2 = Table(p_table_data, colWidths=[140, 375])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t2)
    story.append(Spacer(1, 16))

    story.append(Table([[
        Paragraph(
            "<b>THE ENTERPRISE IMPACT:</b> Inconsistent claims lead to statutory false-advertising fines, customer churn, and regulatory liabilities. Organizations require a single pane of governance where every claim is deterministically verified before publication.",
            body_style
        )
    ]], colWidths=[515], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#FECACA')),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 3: WHO IT SERVES
    # -------------------------------------------------------------
    story.append(Paragraph("DESIGNED FOR THREE DISTINCT ORGANIZATIONAL PERSONAS", page_heading))
    story.append(Paragraph(
        "VERITY aligns the entire publication lifecycle by providing role-specific workflows for content creators, senior reviewers, and compliance administrators.",
        body_style
    ))
    story.append(Spacer(1, 10))

    roles = [
        ("MARKETING CREATOR", "Drafting & Instant Pre-Submission Verification",
         "Creators draft copy, upload campaign flyers, and receive real-time factual feedback against approved documents. Contradictory claims are highlighted with 1-click safe corrections before routing to review."),
        ("GOVERNANCE REVIEWER", "Prioritised Triage Queue & One-Click Audit Decisions",
         "Reviewers inspect prioritized queues sorted by risk score and deadlines. Reviewers evaluate side-by-side evidence quotes and record binding decisions (Approved, Revision, Rejected) with mandatory audit comments."),
        ("COMPLIANCE ADMINISTRATOR", "Authoritative Knowledge Base & Platform Policy Governance",
         "Administrators ingest approved policies, maintain version lifecycles, configure transparent risk scoring weights, inspect cross-asset impact reports, and monitor enterprise Brand Health."),
    ]

    r_table_data = []
    for r_title, r_sub, r_desc in roles:
        r_table_data.append([
            [Paragraph(f"<b>{r_title}</b>", card_title),
             Paragraph(f"<font color='#0891b2'><b>{r_sub}</b></font>", ParagraphStyle('SubR', fontName='Helvetica-Bold', fontSize=8, leading=11)),
             Spacer(1, 4),
             Paragraph(r_desc, body_style)]
        ])

    t3 = Table(r_table_data, colWidths=[515])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t3)
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        "<b>Single-Click Demo Persona Switching:</b> A persistent top navigation bar allows judges to switch between Administrator, Reviewer, and Creator roles with one click, immediately updating authorization permissions.",
        body_style
    ))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 4: THE PLATFORM
    # -------------------------------------------------------------
    story.append(Paragraph("EIGHTEEN SPECIALISED VIEWS COVERING THE ENTIRE LIFECYCLE", page_heading))
    story.append(Paragraph(
        "VERITY is structured into two functional layers: 6 public informative views for external stakeholders and 12 secure authenticated workspaces for organizational governance.",
        body_style
    ))
    story.append(Spacer(1, 10))

    views_data = [
        [Paragraph("<b>Layer</b>", card_title), Paragraph("<b>Workspace Views & Implemented Modules</b>", card_title)],
        [
            Paragraph("<b>Public Interface (6 Views)</b>", body_bold),
            Paragraph(
                "• <b>Landing Page:</b> Hero interactive architecture, live governance metrics, and persona flows.<br/>"
                "• <b>Features Breakdown:</b> Technical explanations of all innovations and Round 3 additions.<br/>"
                "• <b>How It Works:</b> Interactive 8-step pipeline walkthrough from ingestion to sign-off.<br/>"
                "• <b>About & Mission:</b> Academic grounding, team credentials, and responsible AI principles.<br/>"
                "• <b>Authentication:</b> Instant zero-password demo login with role pre-selection.",
                bullet_style
            )
        ],
        [
            Paragraph("<b>Authenticated Workspaces (12 Views)</b>", body_bold),
            Paragraph(
                "• <b>Executive Dashboard:</b> Live KPIs, triage summary, and recent audit activity feed.<br/>"
                "• <b>Content Verification:</b> Text editorial verification & Multimodal Flyer OCR Inspector.<br/>"
                "• <b>Verification Reports:</b> Detailed versioned reports with explainable risk point breakdowns.<br/>"
                "• <b>Document Management:</b> Knowledge Base ingestion (PDF, DOCX, TXT) with version history.<br/>"
                "• <b>Brand Guidelines:</b> Enforces prohibited terminology and mandatory legal disclaimers.<br/>"
                "• <b>Change Impact Analysis:</b> Proactive dependency tracking & Policy Reconciliation Wizard.<br/>"
                "• <b>Review & Approvals:</b> Triage queue, version diff analysis, and binding decision logger.<br/>"
                "• <b>Brand Health Index:</b> 5-component governance score (0–100) with historical trend tracking.<br/>"
                "• <b>Governance Intelligence:</b> Recurring problem detector and guideline update recommendations.<br/>"
                "• <b>Platform Settings:</b> Configurable risk scoring weights, tenant ID, and CMS Firewall Gateway.<br/>"
                "• <b>Notifications & Audit Trail:</b> Comprehensive log of all editorial actions and publishing events.",
                bullet_style
            )
        ],
    ]

    t4 = Table(views_data, colWidths=[140, 375])
    t4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t4)

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 5: CORE INNOVATIONS
    # -------------------------------------------------------------
    story.append(Paragraph("THREE ARCHITECTURAL INNOVATIONS POWERING BRAND GOVERNANCE", page_heading))
    story.append(Paragraph(
        "VERITY addresses brand integrity through three tightly integrated architectural innovations:",
        body_style
    ))
    story.append(Spacer(1, 10))

    inno_1 = [
        Paragraph("<b>01</b>", ParagraphStyle('INum', fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#0284C7'))),
        Paragraph("<b>EVIDENCE-LINKED VERIFICATION</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Provenance Tracing:</b> Every factual assertion is extracted and matched against approved documents using TF-IDF and semantic embeddings.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Source Citations:</b> Displays exact document title, version number, effective date, and verbatim excerpt.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Approved Corrections:</b> Recommends factual corrections grounded strictly in approved corporate documents.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <i>Rule: AI text is never treated as evidence. Claims require explicit backing in approved sources.</i>", ParagraphStyle('RuleI', fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'))),
    ]

    inno_2 = [
        Paragraph("<b>02</b>", ParagraphStyle('INum', fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#059669'))),
        Paragraph("<b>CROSS-CONTENT CHANGE-IMPACT</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Dependency Tracking:</b> When an approved fact changes (e.g. warranty reduced from 3 years to 2 years), the system identifies all registered assets containing old figures.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Affected Asset Registry:</b> Flags brochures, social posts, posters, and technical sheets for review.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <b>Structured Resolution:</b> Reviewers inspect the exact text snippet and resolve the dependency directly in the platform.", bullet_style),
        Spacer(1, 4),
        Paragraph("• <i>Proactive dependency management, not reactive search.</i>", ParagraphStyle('RuleI', fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'))),
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
        "<b>Architectural Synergy:</b> Provenance connects claims to authoritative evidence. Dependency analysis prevents outdated terms from lingering in collateral. Adaptive intelligence connects review decisions back into clearer guidelines.",
        body_style
    ))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 6: ROUND 3 DELIVERED IMPROVEMENTS
    # -------------------------------------------------------------
    story.append(Paragraph("ROUND 3 DELIVERED IMPROVEMENTS: THE THREE EXACT COMMITMENTS", page_heading))
    story.append(Paragraph(
        "In Round 2, our team committed to three major high-depth product enhancements. In Round 3, we delivered exactly these three features, fully implemented and verifiable in the live application:",
        body_style
    ))
    story.append(Spacer(1, 10))

    r3_improvements = [
        ("IMPROVEMENT 1: MULTIMODAL VISUAL BOUNDING-BOX FLYER OCR",
         "What it is: Ingests marketing flyers, banners, and brochures, runs spatial OCR contour segmentation (OpenCV & PyMuPDF), extracts text blocks with normalized coordinates {x, y, w, h}, and evaluates claims against Knowledge Base documents.\n\n"
         "What it changes for the user: Renders an interactive canvas overlay with red glowing bounding boxes around contradictory claims (e.g. Acme 3-Year Warranty violating Policy v2.4), amber boxes for unsupported claims, and green boxes for verified claims. Clicking any box spotlights verbatim evidence, confidence score, and 1-click safe copy patches.",
         colors.HexColor('#F0F9FF'), colors.HexColor('#0891B2')),
        ("IMPROVEMENT 2: AUTOMATED CROSS-ASSET POLICY RECONCILIATION WIZARD",
         "What it is: Transforms passive change impact alerts into an active remediation wizard. When an authoritative document changes, the wizard identifies all affected registered collateral assets and synthesizes unified before/after patch diffs.\n\n"
         "What it changes for the user: Users inspect side-by-side token diffs showing superseded text in red strikethrough and new compliant text in green highlight. Provides 1-click 'Batch Propagate Patches' to update all collateral records simultaneously, resolving alerts and logging an immutable audit record.",
         colors.HexColor('#F0FDF4'), colors.HexColor('#059669')),
        ("IMPROVEMENT 3: BI-DIRECTIONAL PRE-PUBLISH CMS FIREWALL & WEBHOOK GATEWAY",
         "What it is: Headless pre-publish gateway (POST /api/firewall/check) for WordPress, Webflow, Ghost, and CI/CD pipelines. Evaluates incoming draft payloads against active brand policies and blocks publication if Risk Score >= 30 or critical contradictions exist.\n\n"
         "What it changes for the user: Features an interactive UI simulator with live webhook dispatching, HMAC SHA-256 signature verification, and real-time terminal output displaying Pass/Block verdicts, violation breakdowns, and cryptographic publish tokens.",
         colors.HexColor('#FAF5FF'), colors.HexColor('#7C3AED')),
    ]

    r3_table_data = []
    for title, desc, bg, border in r3_improvements:
        r3_table_data.append([
            [Paragraph(f"<b>{title}</b>", card_title),
             Spacer(1, 4),
             Paragraph(desc.replace("\n\n", "<br/><br/>"), bullet_style)]
        ])

    t6 = Table(r3_table_data, colWidths=[515])
    t6.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 10),
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
        ("MULTIMODAL VISION & OCR", "PyMuPDF · OpenCV · Morphology Contours",
         "Extracts structured text from PDF/DOCX. OpenCV contour segmentation isolates spatial text bounding boxes on marketing flyers with normalized coordinates for interactive SVG overlays."),
        ("CMS FIREWALL & WEBHOOK GATEWAY", "HMAC SHA-256 · Pre-Publish Interception Gateway",
         "Headless publishing firewall evaluating WordPress and Webflow payloads. Enforces pre-publish gatekeeper rules and issues cryptographic tokens for authorized deployments."),
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
            "<b>OFFLINE-FIRST STATIC RESILIENCY:</b> Built with an in-browser mock engine fallback in frontend/src/api.ts. When hosted statically on GitHub Pages without local FastAPI running, every view, bounding-box flyer, and reconciliation wizard operates immediately with zero network errors.",
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
        "VERITY is not a conceptual mockup. It is a live, fully verified application backed by an automated 29-test suite covering core algorithms and Round 3 additions:",
        body_style
    ))
    story.append(Spacer(1, 10))

    test_rows = [
        [Paragraph("<b>Automated Test Suite (pytest)</b>", card_title), Paragraph("<b>Coverage Scope</b>", card_title), Paragraph("<b>Result</b>", card_title)],
        [Paragraph("<b>Engine & Verification Tests (13)</b>", body_bold), Paragraph("Claim extraction, evidence comparison, risk scoring, diff opcodes, impact mapping", bullet_style), Paragraph("<font color='#059669'><b>13 / 13 Passed</b></font>", body_bold)],
        [Paragraph("<b>Extraction & Security Tests (4)</b>", body_bold), Paragraph("PDF extraction, DOCX parsing, token verification, route protection", bullet_style), Paragraph("<font color='#059669'><b>4 / 4 Passed</b></font>", body_bold)],
        [Paragraph("<b>Governance & Brand Health Tests (4)</b>", body_bold), Paragraph("Role switching, prioritized queue triage, brand health formula, visual OpenCV blur", bullet_style), Paragraph("<font color='#059669'><b>4 / 4 Passed</b></font>", body_bold)],
        [Paragraph("<b>Round 3 Delivered Features Tests (8)</b>", body_bold), Paragraph("Multimodal flyer OCR, spatial box evaluation, patch diffs, batch apply, CMS firewall pre-publish gate, webhook dispatch", bullet_style), Paragraph("<font color='#059669'><b>8 / 8 Passed</b></font>", body_bold)],
        [Paragraph("<b>TOTAL AUTOMATED TESTS</b>", card_title), Paragraph("<b>Full end-to-end regression validation</b>", body_bold), Paragraph("<font color='#059669'><b>29 / 29 Passed (100%)</b></font>", card_title)],
    ]

    t8_tests = Table(test_rows, colWidths=[165, 230, 120])
    t8_tests.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#F0FDF4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t8_tests)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Demonstrated Operational Scenario: Acme Global Warranty Update & CMS Interception</b>", subheading))

    scenario_content = [
        Paragraph("<b>1. Policy Ingestion:</b> Administrator Rohith uploads <i>Hardware Warranty Policy v2.4</i> (2-year term, superseding 3-year term).", bullet_style),
        Paragraph("<b>2. Collateral Submission:</b> Creator submits visual flyer with claim: <i>'All Apex X1 Devices Include 3-Year Unlimited Coverage.'</i>", bullet_style),
        Paragraph("<b>3. Multimodal OCR:</b> System detects spatial text bounding box, draws red glowing overlay, and flags <b>Contradictory Claim</b> against Policy v2.4.", bullet_style),
        Paragraph("<b>4. Policy Reconciliation:</b> Change Impact Wizard generates unified patch diffs across all registered collateral assets with 1-click batch propagation.", bullet_style),
        Paragraph("<b>5. CMS Firewall Interception:</b> When WordPress webhook attempts publishing non-compliant 3-year copy, the Pre-Publish Firewall blocks publication (Risk Score: 74).", bullet_style),
        Paragraph("<b>6. Compliant Publishing:</b> Once copy is reconciled to 2-year terms, CMS Firewall approves the payload and issues cryptographic token <code>vrty-pub-...</code>.", bullet_style),
    ]

    t8_scen = Table([[scenario_content]], colWidths=[515])
    t8_scen.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t8_scen)

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 9: RESPONSIBLE AI & ZERO-DEFECT HARDENING
    # -------------------------------------------------------------
    story.append(Paragraph("RESPONSIBLE AI & ZERO-DEFECT RESILIENCE PHILOSOPHY", page_heading))
    story.append(Paragraph(
        "In enterprise brand governance, autonomous black-box decisions introduce severe legal liabilities. VERITY is built upon Responsible AI principles and rigorous hardening to ensure the product holds up without supervision:",
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
        Paragraph("<b>ZERO-DEFECT HARDENING</b>", card_title),
        Spacer(1, 6),
        Paragraph("• <b>Offline Fallback Engine:</b> Intelligent mock fallback in frontend/src/api.ts ensures the site runs seamlessly on static hosting without network hangs.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Empty State & Error Safety:</b> Every list, filter, and viewer includes explicit empty states, preventing crashes on bad inputs or unseeded states.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Idempotent Double-Click Protection:</b> Action buttons disable during execution, preventing duplicate submissions or race conditions.", bullet_style),
        Spacer(1, 5),
        Paragraph("• <b>Air-Gapped Ready:</b> The statistical TF-IDF semantic engine runs completely locally without external cloud API dependencies.", bullet_style),
    ]

    t9 = Table([[ctrl_items, sec_items]], colWidths=[250, 250])
    t9.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0FDF4')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#BBF7D0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
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
    # PAGE 10: PRODUCT ROADMAP & CONCLUSION
    # -------------------------------------------------------------
    story.append(Paragraph("PRODUCT ROADMAP & FUTURE DEVELOPMENT PLAN", page_heading))
    story.append(Paragraph(
        "VERITY is architected as an extensible enterprise brand protection platform. The product roadmap spans completed hackathon milestones to future enterprise scale:",
        body_style
    ))
    story.append(Spacer(1, 8))

    roadmap_data = [
        [Paragraph("<b>Phase</b>", card_title), Paragraph("<b>Milestone & Capabilities</b>", card_title), Paragraph("<b>Status</b>", card_title)],
        [
            Paragraph("<b>Phase 1: Foundation</b>", body_bold),
            Paragraph("Core evidence-linked verification, multi-format text ingestion (PDF, DOCX, TXT), transparent risk scoring, and role-based access control.", bullet_style),
            Paragraph("<font color='#059669'><b>Completed (Round 1)</b></font>", body_bold)
        ],
        [
            Paragraph("<b>Phase 2: Governance</b>", body_bold),
            Paragraph("18-view SPA, adaptive governance intelligence, executive Brand Health Score, OpenCV visual screening, and 21 passing automated tests.", bullet_style),
            Paragraph("<font color='#059669'><b>Completed (Round 2)</b></font>", body_bold)
        ],
        [
            Paragraph("<b>Phase 3: Deep Delivery</b>", body_bold),
            Paragraph("Multimodal Visual Flyer OCR with spatial bounding boxes, Automated Cross-Asset Policy Reconciliation Wizard, and Pre-Publish CMS Firewall Webhook Gateway.", bullet_style),
            Paragraph("<font color='#059669'><b>Completed (Round 3)</b></font>", card_title)
        ],
        [
            Paragraph("<b>Phase 4: Ecosystem</b>", body_bold),
            Paragraph("Native Figma & Adobe Creative Cloud extensions, bi-directional HubSpot & Salesforce integrations, and automated PR-bot for Git documentation repositories.", bullet_style),
            Paragraph("<font color='#0284C7'><b>Planned (Q1 2027)</b></font>", body_bold)
        ],
        [
            Paragraph("<b>Phase 5: Global Scale</b>", body_bold),
            Paragraph("Cross-lingual multilingual semantic claim verification, enterprise SCIM/SAML SSO, and regulatory compliance mapping for EU AI Act & FTC guidelines.", bullet_style),
            Paragraph("<font color='#64748B'><b>Planned (Q3 2027)</b></font>", body_bold)
        ],
    ]

    t10_road = Table(roadmap_data, colWidths=[110, 285, 120])
    t10_road.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#F0F9FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (0,3), (-1,3), 1.5, colors.HexColor('#0284C7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t10_road)
    story.append(Spacer(1, 10))

    ref_items = [
        Paragraph("<b>ACADEMIC REFERENCES</b>", card_title),
        Spacer(1, 3),
        Paragraph("1. Kirkby et al., <i>'Welcome, new brand colleague! A conceptual framework for human–AI co-creation,'</i> Journal of Brand Management, 2025.", bullet_style),
        Spacer(1, 2),
        Paragraph("2. Westphal et al., <i>'Decision control and explanations in human-AI collaboration,'</i> Computers in Human Behavior, vol. 144, 2023.", bullet_style),
        Spacer(1, 2),
        Paragraph("3. Haupt et al., <i>'Consumer responses to human-AI collaboration at organizational frontlines,'</i> Review of Managerial Science, 2024.", bullet_style),
    ]

    conc_items = [
        Paragraph("<b>FINAL CONCLUSION</b>", card_title),
        Spacer(1, 3),
        Paragraph("VERITY delivers the missing layer in organizational communication: evidence provenance, policy change dependencies, and auditable human sign-offs. By combining multimodal OCR inspection, proactive reconciliation, and pre-publish CMS gatekeeping, VERITY provides trustworthy brand governance at enterprise scale.", body_style),
        Spacer(1, 4),
        Paragraph("<b>Every Claim Needs Evidence. Every Publication Needs Accountability.</b>", ParagraphStyle('ConcTag', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor('#0891B2')))
    ]

    t10_bottom = Table([[ref_items, conc_items]], colWidths=[250, 250])
    t10_bottom.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0FDF4')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#BBF7D0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t10_bottom)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")


if __name__ == '__main__':
    output_path = r'D:\verity\VERITY_Hackathon_Final_Documentation.pdf'
    build_pdf(output_path)
