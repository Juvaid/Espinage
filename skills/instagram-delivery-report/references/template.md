# Reuse the report design

Template version **1.0.0** implements the report design created in this workflow: A4 portrait, 44 pt margins, Instagram gradient rule, dark typography, actual covers/slides, paired metrics, horizontal graphs, interleaved dates and concise source notes.

## Ready-to-run sample

From this skill directory, using a Python environment with `reportlab` and `Pillow`:

```bash
python3 scripts/render_report.py examples/report-data.json /absolute/output/template-preview.pdf
```

The retained PDF is `assets/template-preview.pdf`; `assets/preview.png` is its contact sheet. All example data and visuals are explicitly fictional. No client images, account insights, credentials or local source paths are bundled.

## Render a report

1. Copy `examples/report-data.json` into the task working folder as a schema example. Replace all sample account details, dates, records and visual paths with verified source data. Set `demo` to false only after replacing the sample material. Keep source images in that folder; relative paths resolve against the dataset file.
2. Follow `data-and-layout.md` and validate:

   ```bash
   python3 scripts/check_dataset.py /absolute/task/report-data.json
   ```

3. Render directly:

   ```bash
   python3 scripts/render_report.py /absolute/task/report-data.json /absolute/output/report.pdf
   ```

4. Render and inspect the PDF using the PDF skill. The adjacent `report.manifest.json` records catalogue page, item ID, publication date and visuals for coverage checks. A manifest is evidence of what the renderer included, not proof of live inventory completeness.

Use the bundled runtime when available; otherwise `requirements.txt` lists the renderer's two dependencies. The script uses portable built-in Helvetica by default. For names or captions requiring another character set, supply an installed or properly licensed regular/bold TTF pair together:

```bash
python3 scripts/render_report.py /absolute/task/report-data.json /absolute/output/report.pdf \
  --font-regular /absolute/fonts/regular.ttf --font-bold /absolute/fonts/bold.ttf
```

## Consistency and edge cases

- `assets/theme.json` is the design source of truth. Keep its geometry, colors and hierarchy unchanged for ordinary client/month substitutions.
- The renderer calculates counts, dates and metric totals from the input. It never fetches Instagram or sends/uploads anything.
- The catalogue consumes input order; validation requires dates ascending across formats. Provide the original same-day sequence where known.
- Carousels continue after three slides per page. Dense metric tables and notes continue automatically. Ordinary stories are grouped in threes; a single or dense story gets a larger layout.
- Null stays unavailable; unique audience metrics and percentages are never aggregated. Mixed bases are separated by default. `allow_mixed_native_totals: true` reproduces a combined native-figures summary with explicit mixed-basis labels; it does not create an organic total.
- Review unusually long names, labels or notes visually. The input is deliberately data-driven, but rendering does not replace visual QA.
- Version intentional design changes in `assets/theme.json` and regenerate the sample PDF/contact sheet so agents share the same reference.

## Global install

The repository copy is under `skills/instagram-delivery-report`. Copy that complete folder into the relevant user's global skill directory, or symlink it from that directory. Keep the assets, examples, references and scripts together. A `SKILL.md` copied alone lacks the reusable design.
