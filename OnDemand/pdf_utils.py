from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4


def generate_consulting_pdf(session: dict, path: str):
    doc = SimpleDocTemplate(
        path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="SectionTitle",
        fontSize=14,
        leading=18,
        spaceBefore=20,
        spaceAfter=12,
        fontName="Helvetica-Bold"
    ))

    styles.add(ParagraphStyle(
        name="Body",
        fontSize=10.5,
        leading=15,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name="Separator",
        fontSize=10,
        leading=12,
        spaceBefore=18,
        spaceAfter=18,
        alignment=1
    ))

    story = []

    def sep():
        story.append(Paragraph("-" * 90, styles["Separator"]))

    # 1. Problem
    a1 = session.get("agent1", {})
    story.append(Paragraph("1. Problem Statement", styles["SectionTitle"]))
    story.append(Paragraph(a1.get("problem_statement", ""), styles["Body"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Key Metrics</b>", styles["Body"]))
    story.append(ListFlowable(
        [Paragraph(m, styles["Body"]) for m in a1.get("key_metrics", [])],
        bulletType="bullet",
        leftIndent=20
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Constraints</b>", styles["Body"]))
    story.append(ListFlowable(
        [Paragraph(c, styles["Body"]) for c in a1.get("constraints", [])],
        bulletType="bullet",
        leftIndent=20
    ))

    sep()

    # 2. Benchmark
    a2 = session.get("agent2", {})
    story.append(Paragraph("2. Peer Benchmarking", styles["SectionTitle"]))
    story.append(Paragraph(f"<b>Peer Group:</b> {a2.get('peer_group','')}", styles["Body"]))

    for k, v in a2.get("benchmark_ranges", {}).items():
        story.append(Paragraph(f"{k}: {v}", styles["Body"]))

    story.append(ListFlowable(
        [Paragraph(p, styles["Body"]) for p in a2.get("relative_positioning", [])],
        bulletType="bullet",
        leftIndent=20
    ))

    sep()

    # 3. Strategy
    a3 = session.get("agent3", {})
    story.append(Paragraph("3. Strategic Scenarios", styles["SectionTitle"]))

    for s in a3.get("scenarios", []):
        story.append(Paragraph(
            f"<b>{s.get('name')}</b><br/>Impact: {s.get('expected_impact')}",
            styles["Body"]
        ))

    story.append(Paragraph(
        f"<b>Recommended:</b> {a3.get('recommended_scenario','')}",
        styles["Body"]
    ))

    sep()

    # 4. Risks
    a5 = session.get("agent5", {})
    story.append(Paragraph("4. Risks & Early Signals", styles["SectionTitle"]))
    story.append(ListFlowable(
        [Paragraph(r, styles["Body"]) for r in a5.get("key_risks", [])],
        bulletType="bullet",
        leftIndent=20
    ))

    sep()

    # 5. KPIs
    a6 = session.get("agent6", {})
    story.append(Paragraph("5. KPIs & Governance", styles["SectionTitle"]))

    for k in a6.get("kpis", []):
        story.append(Paragraph(
            f"<b>{k['metric']}</b>: {k['baseline']} → {k['target']} "
            f"({k['measurement_frequency']})",
            styles["Body"]
        ))

    doc.build(story)
